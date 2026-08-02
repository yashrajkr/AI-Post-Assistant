/**
 * controllers/razorpay-controller.js
 * Order creation, payment verification, webhook handling.
 *
 * CRITICAL: The webhook route uses express.raw() (NOT express.json) so the
 * raw body Buffer is available for HMAC signature verification.
 */

const crypto = require('crypto');
const { env } = require('../config/env');
const { getPlan } = require('../config/plans');
const { asyncHandler } = require('../middleware/asyncHandler');
const { publicUser } = require('../utils/helpers');
const {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  parseWebhookEvent,
} = require('../services/razorpay-service');
const {
  savePayment,
  findPaymentByOrderId,
  updatePaymentStatus,
  saveCreditsAndPlan,
} = require('../services/storage-service');
const logger = require('../utils/logger');

/**
 * POST /api/razorpay/create-order
 * Body: { plan }
 * Returns: { orderId, amountPaise, currency, keyId, isDemo }
 */
async function createOrderHandler(req, res) {
  const plan = String(req.body.plan).toLowerCase();
  const planObj = getPlan(plan);
  if (!planObj) {
    return res.status(400).json({ success: false, message: 'Invalid plan.' });
  }

  const order = await createOrder(planObj.name, req.user.id);

  // Persist the payment record so verification can find it later.
  const paymentRecord = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    plan: planObj.name,
    amount: planObj.pricePaise,
    createdAt: new Date().toISOString(),
    status: 'created',
    razorpay: { orderId: order.orderId },
  };
  await savePayment(paymentRecord);

  return res.status(200).json({
    success: true,
    order: {
      id: order.orderId,
      plan: planObj.name,
      amount: planObj.priceInr,
      amountPaise: order.amountPaise,
      currency: order.currency,
      keyId: order.keyId,
      isDemo: order.isDemo,
    },
  });
}

/**
 * POST /api/razorpay/verify-payment
 * Body: { orderId, paymentId, signature }
 */
async function verifyPaymentHandler(req, res) {
  const { orderId, paymentId, signature } = req.body;

  const payment = await findPaymentByOrderId(orderId);
  if (!payment) {
    return res.status(400).json({ success: false, message: 'Payment record not found (unknown order).' });
  }

  const result = verifyPaymentSignature({ orderId, paymentId, signature });

  if (!result.verified) {
    await updatePaymentStatus(payment.id, {
      status: 'failed',
      verifiedAt: new Date().toISOString(),
      gateway: { paymentId, signature },
    });
    logger.warn(`[razorpay] payment verification failed: ${result.reason || 'unknown'} order=${orderId}`);
    return res.status(400).json({ success: false, message: 'Payment verification failed.' });
  }

  // Upgrade user plan + credits.
  const planObj = getPlan(payment.plan);
  if (!planObj) {
    return res.status(500).json({ success: false, message: 'Invalid plan on payment record.' });
  }
  const updatedUser = await saveCreditsAndPlan({
    userId: payment.userId,
    plan: planObj.name,
    credits: planObj.credits,
  });

  await updatePaymentStatus(payment.id, {
    status: 'paid',
    verifiedAt: new Date().toISOString(),
    gateway: { paymentId, signature },
  });

  logger.info(`[razorpay] payment verified: order=${orderId} plan=${planObj.name} user=${payment.userId}${result.isDemo ? ' (demo)' : ''}`);

  // Only return the public user object if the verifier is the same user.
  const isOwner = payment.userId === req.user?.id;
  return res.status(200).json({
    success: true,
    isDemo: result.isDemo,
    user: isOwner ? publicUser(updatedUser) : undefined,
  });
}

/**
 * POST /api/razorpay/webhook
 * Headers: x-razorpay-signature
 * Body: raw Buffer (Express must NOT parse JSON for this route)
 *
 * Always returns 200 to prevent Razorpay from retrying.
 */
async function webhookHandler(req, res) {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body; // Buffer because of express.raw()

  const verification = verifyWebhookSignature(rawBody, signature);
  if (!verification.verified) {
    logger.warn(`[razorpay] webhook rejected: ${verification.reason}`);
    // Still return 200 so Razorpay doesn't keep retrying invalid signatures.
    return res.status(200).json({ received: true, verified: false });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch (err) {
    logger.error(`[razorpay] webhook payload not JSON: ${err.message}`);
    return res.status(200).json({ received: true, verified: true, parsed: false });
  }

  const event = parseWebhookEvent(payload);
  logger.info(`[razorpay] webhook event: ${event.type}`, { event });

  if (event.type === 'payment_captured' || event.type === 'payment_failed') {
    const payment = await findPaymentByOrderId(event.orderId);
    if (payment) {
      await updatePaymentStatus(payment.id, {
        status: event.status,
        verifiedAt: new Date().toISOString(),
        gateway: { paymentId: event.paymentId },
      });
      if (event.type === 'payment_captured') {
        const planObj = getPlan(payment.plan);
        if (planObj) {
          await saveCreditsAndPlan({
            userId: payment.userId,
            plan: planObj.name,
            credits: planObj.credits,
          });
        }
      }
    } else {
      logger.warn(`[razorpay] webhook: no payment record for order ${event.orderId}`);
    }
  } else if (event.type === 'subscription_activated' || event.type === 'subscription_cancelled') {
    // Future: lookup subscription by razorpay_subscription_id and update plan.
    logger.info(`[razorpay] subscription event ${event.type} (not yet implemented)`);
  }

  return res.status(200).json({ received: true, verified: true, eventType: event.type });
}

module.exports = {
  createOrderHandler: asyncHandler(createOrderHandler),
  verifyPaymentHandler: asyncHandler(verifyPaymentHandler),
  webhookHandler: asyncHandler(webhookHandler),
};
