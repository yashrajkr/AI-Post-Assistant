/**
 * routes/index.js
 * Mounts every route module on the Express app.
 * Updated for Prompt 3: brand-brain, score, memory, prompts, image-analysis, repurpose.
 */

const express = require('express');
const { authLimiter, aiLimiter } = require('../middleware/rate-limits');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const {
  signupSchema,
  loginSchema,
  profileSchema,
  upgradeSchema,
  generateSchema,
  feedbackSchema,
  scheduleSchema,
  createOrderSchema,
  verifyPaymentSchema,
  brandBrainSchema,
  scoreSchema,
  createPromptSchema,
  updatePromptSchema,
  ratePromptSchema,
  repurposeSchema,
  calendarSchema,
  campaignSchema,
  createApiKeySchema,
} = require('../utils/validators');

const auth = require('./auth');
const supabaseAuth = require('../controllers/supabase-auth-controller');
const generate = require('./generate');
const schedule = require('./schedule');
const analytics = require('./analytics');
const plans = require('./plans');
const feedback = require('./feedback');
const razorpay = require('./razorpay');
const health = require('./health');

// New controllers for Prompt 3
const brandBrain = require('../controllers/brand-brain-controller');
const score = require('../controllers/score-controller');
const memory = require('../controllers/memory-controller');
const prompts = require('../controllers/prompts-controller');
const imageAnalysis = require('../controllers/image-analysis-controller');
const repurpose = require('../controllers/repurpose-controller');

// v2 controllers
const calendar = require('../controllers/calendar-controller');
const campaign = require('../controllers/campaign-controller');
const documentCtrl = require('../controllers/document-controller');
const brandHealth = require('../controllers/brand-health-controller');
const apiKeys = require('../controllers/api-keys-controller');

module.exports = function buildRoutes(app) {
  // Public
  app.get('/api/health', health.getHealth);
  app.get('/api/ai/health', health.getAiHealth);

  // Auth (rate-limited)
  app.post('/api/signup', authLimiter, validate(signupSchema), auth.signup);
  app.post('/api/login', authLimiter, validate(loginSchema), auth.login);
  app.post('/api/logout', auth.logout);
  app.get('/api/me', auth.me);

  // Google sign-in via Supabase Auth — disabled gracefully if Supabase isn't configured.
  app.get('/api/auth/google-config', supabaseAuth.googleConfig);
  app.post('/api/auth/supabase', authLimiter, supabaseAuth.exchange);

  // Templates (public)
  app.get('/api/templates', (req, res) => {
    const { getTemplates } = require('../services/storage-service');
    res.json({ success: true, templates: getTemplates() });
  });

  // Plans (public)
  app.get('/api/plans', plans.getPlans);

  // Authenticated
  app.post('/api/profile', requireAuth, validate(profileSchema), auth.updateProfile);
  app.post('/api/upgrade', requireAuth, validate(upgradeSchema), plans.upgrade);

  app.post('/api/generate', requireAuth, aiLimiter, validate(generateSchema), generate.generate);
  app.get('/api/history', requireAuth, generate.history);

  app.post('/api/feedback', requireAuth, validate(feedbackSchema), feedback.submitFeedback);

  app.post('/api/schedules', requireAuth, validate(scheduleSchema), schedule.createScheduleItem);
  app.get('/api/schedules', requireAuth, schedule.listSchedules);

  app.get('/api/analytics', requireAuth, analytics.getAnalytics);

  // Razorpay (authenticated for order + verify, public for webhook)
  app.post('/api/create-order', requireAuth, validate(createOrderSchema), razorpay.createOrderHandler);
  app.post('/api/verify-payment', requireAuth, validate(verifyPaymentSchema), razorpay.verifyPaymentHandler);

  // ---------- Prompt 3 modules ----------

  // Module 1: AI Brand Brain
  app.get('/api/brand-brain', requireAuth, brandBrain.get);
  app.put('/api/brand-brain', requireAuth, validate(brandBrainSchema), brandBrain.upsert);
  app.delete('/api/brand-brain', requireAuth, brandBrain.remove);

  // Module 2: AI Content Score (re-score existing content)
  app.post('/api/score', requireAuth, aiLimiter, validate(scoreSchema), score.score);

  // Module 3: AI Memory
  app.get('/api/memory', requireAuth, memory.list);
  app.delete('/api/memory/:id', requireAuth, memory.remove);
  app.delete('/api/memory', requireAuth, memory.clear);

  // Module 4: Prompt Library
  app.get('/api/prompts', requireAuth, prompts.list);
  app.get('/api/prompts/:id', requireAuth, prompts.getOne);
  app.post('/api/prompts', requireAuth, validate(createPromptSchema), prompts.create);
  app.put('/api/prompts/:id', requireAuth, validate(updatePromptSchema), prompts.update);
  app.delete('/api/prompts/:id', requireAuth, prompts.remove);
  app.post('/api/prompts/:id/use', requireAuth, prompts.use);
  app.post('/api/prompts/:id/rate', requireAuth, validate(ratePromptSchema), prompts.rate);

  // Module 5: Image Analysis (multipart/form-data — no Zod validation, controller handles it)
  app.post('/api/analyze-image', requireAuth, aiLimiter, imageAnalysis.analyze, imageAnalysis.handleAnalyze);

  // Module 6: AI Repurposer
  app.post('/api/repurpose', requireAuth, aiLimiter, validate(repurposeSchema), repurpose.repurpose);

  // Module 7: Multi-platform generation — handled inside existing /api/generate
  // (it accepts either `platform` singular or `platforms` array)

  // ---------- v2 features ----------

  // v2: AI Content Calendar
  app.post('/api/calendar', requireAuth, aiLimiter, validate(calendarSchema), calendar.create);
  app.get('/api/calendar', requireAuth, calendar.list);

  // v2: Campaign Builder
  app.post('/api/campaigns', requireAuth, aiLimiter, validate(campaignSchema), campaign.create);
  app.get('/api/campaigns', requireAuth, campaign.list);

  // v2: Document-to-content (multipart/form-data for uploads, JSON for pasted text)
  app.post('/api/analyze-document', requireAuth, aiLimiter, documentCtrl.upload, documentCtrl.analyze);

  // v2: Brand Health Dashboard
  app.get('/api/brand-health', requireAuth, brandHealth.get);
  app.post('/api/brand-health', requireAuth, brandHealth.get);

  // ---------- Chrome Extension: API Keys ----------
  app.get('/api/api-keys', requireAuth, apiKeys.list);
  app.post('/api/api-keys', requireAuth, validate(createApiKeySchema), apiKeys.create);
  app.delete('/api/api-keys/:id', requireAuth, apiKeys.revoke);
};
