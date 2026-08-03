/**
 * config/env.js
 * Single source of truth for all environment variables.
 * Loads .env on startup (using dotenv if available, else manual parser),
 * validates required vars, and exposes a typed config object.
 */

const fs = require('fs');
const path = require('path');

// Try to use dotenv if installed; otherwise fall back to manual parsing.
try {
  require('dotenv').config();
} catch {
  loadEnvManual();
}

function loadEnvManual() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

const env = {
  // Server
  PORT: Number(process.env.PORT || 3000),
  APP_NAME: process.env.APP_NAME || 'PostReady AI',
  NODE_ENV: (process.env.NODE_ENV || 'development').toLowerCase(),
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
  // Comma-separated list of allowed CORS origins.
  // Include chrome-extension://* to allow Chrome extension to call the API.
  // In production: 'https://your-app.vercel.app,chrome-extension://*'
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '*',
  ALLOW_EXTENSION_ORIGIN: process.env.ALLOW_EXTENSION_ORIGIN !== 'false', // default true

  // AI provider
  AI_PROVIDER: (process.env.AI_PROVIDER || 'mock').toLowerCase(),
  AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS || 30000),
  AI_MAX_RETRIES: Number(process.env.AI_MAX_RETRIES || 3),

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',

  // Grok (optional, not primary)
  GROK_API_KEY: process.env.GROK_API_KEY || '',
  GROK_MODEL: process.env.GROK_MODEL || 'grok-4.1-fast',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

  // Sentry (optional)
  SENTRY_DSN: process.env.SENTRY_DSN || '',
};

env.isProduction = env.NODE_ENV === 'production';
env.isDevelopment = env.NODE_ENV === 'development';

env.hasSupabase = Boolean(
  env.SUPABASE_URL &&
  env.SUPABASE_ANON_KEY &&
  env.SUPABASE_SERVICE_ROLE_KEY
);

env.hasRazorpay = Boolean(
  env.RAZORPAY_KEY_ID.startsWith('rzp_') &&
  env.RAZORPAY_KEY_ID.length > 10 &&
  env.RAZORPAY_KEY_SECRET.length > 10
);

env.hasOpenAI = Boolean(env.OPENAI_API_KEY);
env.hasGemini = Boolean(env.GEMINI_API_KEY);
env.hasGrok = Boolean(env.GROK_API_KEY);

/**
 * Returns a list of startup warnings (non-fatal issues).
 * Fatal issues are checked separately by startupGuard().
 */
function startupWarnings() {
  const warnings = [];

  if (env.SESSION_SECRET === 'dev-only-secret-change-me' || env.SESSION_SECRET.includes('change-this')) {
    warnings.push('SESSION_SECRET is using a development value. Change it before deployment.');
  }

  if (env.AI_PROVIDER === 'openai' && !env.hasOpenAI) {
    warnings.push('AI_PROVIDER=openai but OPENAI_API_KEY is missing. Will fall back to mock.');
  }
  if (env.AI_PROVIDER === 'gemini' && !env.hasGemini) {
    warnings.push('AI_PROVIDER=gemini but GEMINI_API_KEY is missing. Will fall back to mock.');
  }
  if (env.AI_PROVIDER === 'grok' && !env.hasGrok) {
    warnings.push('AI_PROVIDER=grok but GROK_API_KEY is missing. Will fall back to mock.');
  }

  if (!env.hasSupabase) {
    warnings.push('Supabase keys missing. Falling back to local JSON file storage (NOT for production).');
  }

  if (!env.hasSupabase) {
    warnings.push('Supabase not configured — "Continue with Google" will be disabled (email/password still works).');
  }

  if (env.isProduction && !env.hasRazorpay) {
    warnings.push('RAZORPAY_KEY_ID/SECRET missing. Payments will be disabled.');
  }

  if (env.isProduction && !env.RAZORPAY_WEBHOOK_SECRET) {
    warnings.push('RAZORPAY_WEBHOOK_SECRET missing. Webhook signature verification will be skipped.');
  }

  return warnings;
}

/**
 * Fatal startup checks — refuses to boot in production if critical config is missing.
 * Returns true if the app may continue starting; false to abort.
 */
function startupGuard() {
  if (env.isProduction && env.AI_PROVIDER === 'mock') {
    console.error('\n[FATAL] AI_PROVIDER=mock in production. Refusing to start.');
    console.error('        Set AI_PROVIDER=openai (or gemini) and provide the matching API key.\n');
    return false;
  }

  if (env.isProduction && env.SESSION_SECRET === 'dev-only-secret-change-me') {
    console.error('\n[FATAL] SESSION_SECRET is the default dev value in production. Refusing to start.\n');
    return false;
  }

  return true;
}

module.exports = { env, startupWarnings, startupGuard };
