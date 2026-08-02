/**
 * controllers/health-controller.js
 * Health + AI provider health check.
 */

const { env } = require('../config/env');
const { usingSupabase } = require('../services/storage-service');
const { healthCheck: aiHealthCheck } = require('../services/ai-service');

async function getHealth(req, res) {
  return res.status(200).json({
    success: true,
    app: env.APP_NAME,
    version: '10.0.0',
    env: env.NODE_ENV,
    aiProvider: env.AI_PROVIDER,
    database: usingSupabase() ? 'supabase' : 'json-file',
    razorpay: env.hasRazorpay ? 'configured' : 'demo',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

async function getAiHealth(req, res) {
  const providers = await aiHealthCheck();
  return res.status(200).json({
    success: true,
    primary: env.AI_PROVIDER,
    providers,
  });
}

module.exports = { getHealth, getAiHealth };
