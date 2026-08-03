/**
 * server.js
 * Bootstrap. Wires Express + middleware + routes + error handler.
 *
 * This is a pure JSON API — the frontend (frontend/) is a separate Vite
 * app deployed to Vercel, not served from here (an earlier vanilla-HTML
 * frontend under public/ used to be served as a static SPA fallback; it
 * was removed since it duplicated frontend/ and called auth endpoints
 * that no longer exist post-Supabase-Auth-migration — see AUTH_AUDIT.md).
 *
 * KEEP THIS FILE UNDER ~100 LINES. All business logic lives in /controllers,
 * /services, /routes, /middleware.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { env, startupWarnings, startupGuard } = require('./config/env');
const { attachUser } = require('./middleware/auth');
const { globalLimiter } = require('./middleware/rate-limits');
const { errorHandler, notFound } = require('./middleware/error-handler');
const buildRoutes = require('./routes');
const { ensureDataFiles } = require('./services/storage-service');
const logger = require('./utils/logger');

// --- Fatal startup checks ---
if (!startupGuard()) {
  process.exit(1);
}

ensureDataFiles();

const app = express();
const PORT = env.PORT;

// Render (and most PaaS hosts) sit the app behind a reverse proxy, so Express
// must be told to trust the X-Forwarded-* headers it sets. Without this,
// express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every
// request and can't identify clients by real IP.
app.set('trust proxy', 1);

// --- CORS origin resolver ---
// Allows: (a) configured ALLOWED_ORIGINS, (b) chrome-extension://* (any extension id)
function corsOrigin(origin, callback) {
  // Allow same-origin (no Origin header) and chrome-extension origins
  if (!origin) return callback(null, true);
  if (env.ALLOWED_ORIGINS === '*') return callback(null, true);
  if (env.ALLOW_EXTENSION_ORIGIN && origin.startsWith('chrome-extension://')) {
    return callback(null, true);
  }
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
  if (allowed.includes(origin)) return callback(null, true);
  return callback(new Error(`CORS blocked: ${origin}`));
}

// --- Security middleware (order matters) ---
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: env.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// --- Webhook route MUST be registered BEFORE express.json so it gets the raw Buffer ---
const razorpayController = require('./controllers/razorpay-controller');
app.post(
  '/api/razorpay/webhook',
  express.raw({ type: 'application/json', limit: '1mb' }),
  razorpayController.webhookHandler
);

// --- Body parsers (after webhook so the webhook still gets raw body) ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Global rate limiter (after body parsers, before routes) ---
app.use('/api', globalLimiter);

// --- Attach user (if a Bearer token — Supabase session or API key — is present) ---
app.use(attachUser);

// --- API routes ---
buildRoutes(app);

// --- Root: simple API info response (this service is API-only; ---
// --- the actual product frontend is deployed separately on Vercel) ---
app.get('/', (req, res) => {
  res.json({
    name: env.APP_NAME,
    status: 'ok',
    message: 'This is the AI Post Assistant API. The web app is served separately.',
    frontend: env.FRONTEND_URL || undefined,
    health: '/api/health',
  });
});

// --- 404 + error handler (last) — pure API, so this applies to every route ---
app.use(notFound);
app.use(errorHandler);

// --- Boot ---
const server = app.listen(PORT, () => {
  logger.info(`${env.APP_NAME} v10 running at http://localhost:${PORT}`);
  logger.info(`AI provider: ${env.AI_PROVIDER}`);
  logger.info(`Database: ${env.hasSupabase ? 'supabase' : 'json-file (dev only)'}`);
  logger.info(`Razorpay: ${env.hasRazorpay ? 'configured' : 'demo mode'}`);
  const warnings = startupWarnings();
  if (warnings.length) {
    logger.warn('Startup warnings:');
    warnings.forEach((w) => logger.warn(`  - ${w}`));
  }
});

// --- Graceful shutdown ---
function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
  // Force-exit after 10s if connections don't drain.
  setTimeout(() => {
    logger.warn('Forcing exit after 10s timeout.');
    process.exit(1);
  }, 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// --- Unhandled error logging (don't crash process) ---
process.on('unhandledRejection', (reason) => {
  logger.error('[unhandledRejection]', { reason: reason?.message || String(reason) });
});
process.on('uncaughtException', (err) => {
  logger.error('[uncaughtException]', { message: err.message, stack: err.stack?.split('\n').slice(0, 5).join(' | ') });
});

module.exports = app;
