/**
 * services/razorpay-service.js
 * Razorpay integration with order creation, signature verification, and webhook handling.
 *
 * If RAZORPAY_KEY_ID/SECRET are not set OR are invalid, falls back to a "demo mode"
 * that simulates successful payments so the app still works for local dev.
 *
 * In production, ALWAYS use real keys + webhook signature verification.
 */

const crypto = require('crypto');
const { env } = require('../config/env');
const { getPlan } = require('../config/plans');
const logger = require('../utils/logger');

let RazorpayLib = null;
try {
  // Optional dependency — only load if installed.
  RazorpayLib = require('razorpay');
} catch {
  logger.warn('[razorpay] "razorpay" package not installed. Running in demo mode. Run: npm install razorpay');
}

function createRazorpayClient() {
  if (!env.hasRazorpay || !RazorpayLib) return null;
  return new RazorpayLib({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Create a Razorpay order. Falls back to a mock order if Razorpay isn't configured.
 * Returns { orderId, amountPaise, currency, keyId, isDemo }.
 */
async function createOrder(plan, userId) {
  const planObj = getPlan(plan);
  if (!planObj) throw new Error('Invalid plan');

  const client = createRazorpayClient();

  // Free plan doesn't need an order
  if (planObj.pricePaise === 0) {
    return { orderId: null, amountPaise: 0, currency: 'INR', keyId: env.RAZORPAY_KEY_ID, isDemo: false };
  }

  if (!client) {
    // Demo mode — return a fake order id. Verification will auto-succeed.
    const mockOrderId = `mock_order_${crypto.randomUUID().slice(0, 12)}`;
    logger.info(`[razorpay] demo mode: created mock order ${mockOrderId} for plan=${plan} user=${userId}`);
    return {
      orderId: mockOrderId,
      amountPaise: planObj.pricePaise,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      isDemo: true,
    };
  }

  // Real Razorpay order
  const order = await client.orders.create({
    amount: planObj.pricePaise,
    currency: 'INR',
    receipt: `rcpt_${userId}_${Date.now()}`,
    notes: { userId, plan },
  });

  return {
    orderId: order.id,
    amountPaise: order.amount,
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,
    isDemo: false,
  };
}

/**
 * Verify the payment signature returned by Razorpay Checkout.
 * HMAC-SHA256(order_id + "|" + payment_id, key_secret) === signature.
 *
 * In demo mode (no keys), auto-succeeds so local dev flow works.
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  // Demo mode auto-succeeds.
  if (!env.hasRazorpay) {
    return { verified: true, isDemo: true };
  }

  if (!signature) {
    return { verified: false, isDemo: false, reason: 'Missing signature' };
  }

  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(payload).digest('hex');

  try {
    const a = Buffer.from(String(signature));
    const b = Buffer.from(String(expected));
    const verified = a.length === b.length && crypto.timingSafeEqual(a, b);
    return { verified, isDemo: false };
  } catch (err) {
    return { verified: false, isDemo: false, reason: err.message };
  }
}

/**
 * Verify a Razorpay webhook payload.
 * HMAC-SHA256(rawRequestBody, RAZORPAY_WEBHOOK_SECRET) === x-razorpay-signature header.
 *
 * CRITICAL: rawBody must be the unparsed Buffer, NOT req.body.
 */
function verifyWebhookSignature(rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    logger.warn('[razorpay] webhook received but RAZORPAY_WEBHOOK_SECRET not set — skipping verification');
    return { verified: false, reason: 'Webhook secret not configured' };
  }
  if (!signature) {
    return { verified: false, reason: 'Missing X-Razorpay-Signature header' };
  }
  try {
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    const a = Buffer.from(String(signature));
    const b = Buffer.from(String(expected));
    const verified = a.length === b.length && crypto.timingSafeEqual(a, b);
    return { verified, reason: verified ? null : 'Signature mismatch' };
  } catch (err) {
    return { verified: false, reason: err.message };
  }
}

/**
 * Parse the webhook event and return a normalized action object the controller can apply.
 */
function parseWebhookEvent(payload) {
  const event = payload?.event;
  const paymentEntity = payload?.payload?.payment?.entity;
  const subscriptionEntity = payload?.payload?.subscription?.entity;

  if (event === 'payment.captured' && paymentEntity) {
    return {
      type: 'payment_captured',
      paymentId: paymentEntity.id,
      orderId: paymentEntity.order_id,
      amount: paymentEntity.amount,
      status: 'paid',
    };
  }
  if (event === 'payment.failed' && paymentEntity) {
    return {
      type: 'payment_failed',
      paymentId: paymentEntity.id,
      orderId: paymentEntity.order_id,
      amount: paymentEntity.amount,
      status: 'failed',
    };
  }
  if (event === 'subscription.activated' && subscriptionEntity) {
    return {
      type: 'subscription_activated',
      subscriptionId: subscriptionEntity.id,
      planId: subscriptionEntity.plan_id,
      status: 'active',
    };
  }
  if (event === 'subscription.cancelled' && subscriptionEntity) {
    return {
      type: 'subscription_cancelled',
      subscriptionId: subscriptionEntity.id,
      planId: subscriptionEntity.plan_id,
      status: 'cancelled',
    };
  }
  return { type: 'unknown', event };
}

module.exports = {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  parseWebhookEvent,
};
