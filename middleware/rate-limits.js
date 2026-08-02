/**
 * middleware/rate-limits.js
 * Three rate-limit policies:
 *   - globalLimiter: 100 req / 15 min / IP (general API)
 *   - authLimiter:   5 req / 15 min / IP (login + signup — anti brute-force)
 *   - aiLimiter:     20 req / hour / user (free) — increases for paid plans
 *
 * Express-rate-limit v7 requires limiters to be created at app init time.
 * So we create per-plan limiters upfront and pick the right one at request time.
 */

const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

// Pre-create limiters per plan (created at app init, not per-request)
const PLAN_LIMITS = {
  free: 20,
  creator: 100,
  business: 500,
  agency: 2500,
};

const planLimiters = {};
for (const [plan, max] of Object.entries(PLAN_LIMITS)) {
  planLimiters[plan] = rateLimit({
    windowMs: 60 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: { success: false, message: `AI generation limit reached for the ${plan} plan (${max}/hour).` },
  });
}

const defaultAiLimiter = planLimiters.free;

function aiLimiter(req, res, next) {
  const plan = req.user?.plan || 'free';
  const limiter = planLimiters[plan] || defaultAiLimiter;
  return limiter(req, res, next);
}

module.exports = { globalLimiter, authLimiter, aiLimiter };
