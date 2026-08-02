/**
 * controllers/plan-controller.js
 * Plans listing + upgrade (admin/manual upgrade — real upgrades go via Razorpay).
 */

const { listPlans, getPlan, PLAN_CREDITS } = require('../config/plans');
const { saveCreditsAndPlan } = require('../services/storage-service');
const { publicUser } = require('../utils/helpers');

async function getPlans(req, res) {
  return res.status(200).json({ success: true, plans: listPlans() });
}

async function upgrade(req, res) {
  const plan = String(req.body.plan).toLowerCase();
  const planObj = getPlan(plan);
  if (!planObj) {
    return res.status(400).json({ success: false, message: 'Invalid plan.' });
  }
  const updated = await saveCreditsAndPlan({
    userId: req.user.id,
    plan: planObj.name,
    credits: planObj.credits,
  });
  return res.status(200).json({ success: true, user: publicUser(updated) });
}

module.exports = { getPlans, upgrade };
