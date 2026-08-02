/**
 * middleware/error-handler.js
 * Centralized error handler. Catches:
 *   - Zod validation errors → 400 with field-level list
 *   - Known HTTP errors (with .status) → that status
 *   - Everything else → 500 with generic message (raw error hidden in prod)
 */

const logger = require('../utils/logger');
const { env } = require('../config/env');

function errorHandler(err, req, res, next) {
  // Zod errors
  if (err?.name === 'ZodError' && Array.isArray(err?.errors)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Custom errors with status
  const status = err?.status || 500;
  const safeMessage =
    status < 500
      ? err.message || 'Request failed'
      : env.isProduction
      ? 'Something went wrong. Our team has been notified.'
      : err.message || 'Internal server error';

  if (status >= 500) {
    logger.error(`[error] ${err.message}`, {
      stack: err.stack?.split('\n').slice(0, 5).join(' | '),
      path: req.path,
      method: req.method,
    });
  }

  res.status(status).json({ success: false, message: safeMessage });
}

/**
 * 404 handler for unknown API routes.
 */
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
}

module.exports = { errorHandler, notFound };
