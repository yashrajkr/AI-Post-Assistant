/**
 * config/plans.js
 * Subscription plans + Razorpay plan IDs.
 * Keep amounts in paise (1 INR = 100 paise) for Razorpay compatibility.
 */

const PLAN_CREDITS = { free: 10, creator: 100, business: 500, agency: 2500 };

// Price in INR (display). Razorpay wants paise — multiply by 100 when calling the API.
const PLAN_PRICES_INR = { free: 0, creator: 149, business: 499, agency: 1999 };

// Optional: Razorpay subscription plan IDs (fill these in after creating plans
// in the Razorpay dashboard → Subscriptions → Plans). Used only for recurring billing.
const RAZORPAY_PLAN_IDS = {
  creator_monthly: process.env.RAZORPAY_PLAN_CREATOR_MONTHLY || '',
  creator_annual: process.env.RAZORPAY_PLAN_CREATOR_ANNUAL || '',
  business_monthly: process.env.RAZORPAY_PLAN_BUSINESS_MONTHLY || '',
  business_annual: process.env.RAZORPAY_PLAN_BUSINESS_ANNUAL || '',
  agency_monthly: process.env.RAZORPAY_PLAN_AGENCY_MONTHLY || '',
  agency_annual: process.env.RAZORPAY_PLAN_AGENCY_ANNUAL || '',
};

function isValidPlan(plan) {
  return Object.prototype.hasOwnProperty.call(PLAN_CREDITS, String(plan).toLowerCase());
}

function getPlan(plan) {
  const p = String(plan).toLowerCase();
  if (!isValidPlan(p)) return null;
  return {
    name: p,
    credits: PLAN_CREDITS[p],
    priceInr: PLAN_PRICES_INR[p],
    pricePaise: PLAN_PRICES_INR[p] * 100,
  };
}

function listPlans() {
  return Object.keys(PLAN_CREDITS).map((name) => ({
    name,
    credits: PLAN_CREDITS[name],
    price: PLAN_PRICES_INR[name],
  }));
}

module.exports = {
  PLAN_CREDITS,
  PLAN_PRICES_INR,
  RAZORPAY_PLAN_IDS,
  isValidPlan,
  getPlan,
  listPlans,
};
