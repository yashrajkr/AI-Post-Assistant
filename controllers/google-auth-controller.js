/**
 * controllers/google-auth-controller.js
 * "Continue with Google" — Authorization Code flow.
 *
 * GET  /api/auth/google           -> redirects the browser to Google's consent screen
 * GET  /api/auth/google/callback  -> exchanges the code, verifies the ID token,
 *                                     creates/links a user, sets the session cookie,
 *                                     redirects back to the frontend.
 *
 * If GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI are not set,
 * both routes redirect back to the frontend login page with a clear error —
 * they never throw or crash the process.
 */

const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { env } = require('../config/env');
const { asyncHandler } = require('../middleware/asyncHandler');
const { signSession } = require('../utils/helpers');
const { PLAN_CREDITS } = require('../config/plans');
const { createUser, getUserByEmail } = require('../services/storage-service');
const logger = require('../utils/logger');

// Frontend (*.vercel.app) and backend (*.onrender.com) are different sites,
// so both the session cookie and the short-lived g_oauth_state CSRF cookie
// need SameSite=None (+ Secure) in production for the browser to send/accept
// them across that boundary. 'lax' is kept for local dev (http://localhost).
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: env.isProduction ? 'none' : 'lax',
  secure: env.isProduction,
  path: '/',
};

function getClient() {
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
}

function loginUrl(req, res) {
  if (!env.hasGoogleOAuth) {
    logger.warn('[google-auth] /api/auth/google hit but Google OAuth is not configured.');
    return res.redirect(`${env.FRONTEND_URL}/login?error=google_oauth_not_configured`);
  }

  const client = getClient();
  const state = crypto.randomBytes(16).toString('hex');

  // CSRF protection: store the state in a short-lived cookie, verify it on callback.
  res.cookie('g_oauth_state', state, { ...COOKIE_OPTIONS, maxAge: 5 * 60 * 1000 });

  const url = client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
    state,
  });

  return res.redirect(url);
}

async function callback(req, res) {
  if (!env.hasGoogleOAuth) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=google_oauth_not_configured`);
  }

  const { code, state, error: googleError } = req.query;

  if (googleError) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=google_denied`);
  }

  const expectedState = req.cookies?.g_oauth_state;
  res.clearCookie('g_oauth_state', { path: '/', sameSite: COOKIE_OPTIONS.sameSite, secure: COOKIE_OPTIONS.secure });
  if (!code || !state || !expectedState || state !== expectedState) {
    logger.warn('[google-auth] callback rejected: missing/mismatched state.');
    return res.redirect(`${env.FRONTEND_URL}/login?error=google_invalid_state`);
  }

  let payload;
  try {
    const client = getClient();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    logger.error(`[google-auth] token exchange/verification failed: ${err.message}`);
    return res.redirect(`${env.FRONTEND_URL}/login?error=google_auth_failed`);
  }

  if (!payload?.email) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=google_no_email`);
  }
  if (payload.email_verified === false) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=google_email_unverified`);
  }

  const email = String(payload.email).toLowerCase();

  let user = await getUserByEmail(email);
  if (!user) {
    user = await createUser({
      id: crypto.randomUUID(),
      name: payload.name || email.split('@')[0],
      email,
      passwordHash: null, // Google-only account — password login stays disabled for it.
      plan: 'free',
      credits: PLAN_CREDITS.free,
      brandVoice: { brandName: '', tagline: '', tone: 'simple and practical' },
      createdAt: new Date().toISOString(),
    });
    logger.info(`[google-auth] created new account via Google: ${email}`);
  } else {
    logger.info(`[google-auth] existing account logged in via Google: ${email}`);
  }

  const token = signSession(user.id, env.SESSION_SECRET);
  res.cookie('session', token, COOKIE_OPTIONS);
  return res.redirect(`${env.FRONTEND_URL}/dashboard`);
}

module.exports = {
  loginUrl: asyncHandler(loginUrl),
  callback: asyncHandler(callback),
};
