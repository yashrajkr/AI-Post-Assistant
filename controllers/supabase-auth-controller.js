/**
 * controllers/supabase-auth-controller.js
 * "Continue with Google" via Supabase Auth.
 *
 * The frontend runs `supabase.auth.signInWithOAuth({ provider: 'google' })`
 * directly — Supabase handles the entire OAuth dance (Google consent screen,
 * code exchange, token issuance) and redirects back to the SPA with a
 * Supabase session in the URL.
 *
 * The frontend then POSTs the resulting Supabase `access_token` here. We
 * validate it against Supabase, create/link the local app user by email,
 * and issue our own app session (same as email/password login) so the rest
 * of the app doesn't need to know Google/Supabase was involved.
 *
 * GET  /api/auth/google-config  -> tells the frontend whether Supabase is
 *                                   configured, so the button can hide/explain
 *                                   itself instead of failing silently.
 * POST /api/auth/supabase       -> body: { access_token } -> app session
 */

const crypto = require('crypto');
const { env } = require('../config/env');
const { asyncHandler } = require('../middleware/asyncHandler');
const { getClients } = require('../config/supabase');
const { signSession, publicUser } = require('../utils/helpers');
const { PLAN_CREDITS } = require('../config/plans');
const { createUser, getUserByEmail } = require('../services/storage-service');
const logger = require('../utils/logger');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
  path: '/',
};

function googleConfig(req, res) {
  const { enabled } = getClients();
  return res.json({ success: true, enabled });
}

async function exchange(req, res) {
  const accessToken = req.body?.access_token;
  if (!accessToken || typeof accessToken !== 'string') {
    return res.status(400).json({ success: false, message: 'Missing access_token.' });
  }

  const { enabled, supabaseAnon } = getClients();
  if (!enabled || !supabaseAnon) {
    return res.status(503).json({
      success: false,
      message: 'Google sign-in is not configured on this server.',
    });
  }

  const { data, error } = await supabaseAnon.auth.getUser(accessToken);
  if (error || !data?.user?.email) {
    logger.warn(`[supabase-auth] token validation failed: ${error?.message || 'no user'}`);
    return res.status(401).json({
      success: false,
      message: 'Your Google session is invalid or expired. Please sign in again.',
    });
  }

  const supaUser = data.user;
  const email = String(supaUser.email).toLowerCase();

  let user = await getUserByEmail(email);
  if (!user) {
    const name =
      supaUser.user_metadata?.full_name ||
      supaUser.user_metadata?.name ||
      email.split('@')[0];
    user = await createUser({
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: null, // Google-only account — password login stays disabled for it.
      plan: 'free',
      credits: PLAN_CREDITS.free,
      brandVoice: { brandName: '', tagline: '', tone: 'simple and practical' },
      createdAt: new Date().toISOString(),
    });
    logger.info(`[supabase-auth] created new account via Google: ${email}`);
  } else {
    logger.info(`[supabase-auth] existing account logged in via Google: ${email}`);
  }

  const token = signSession(user.id, env.SESSION_SECRET);

  // Set the cookie too (helps if frontend/backend are same-origin in dev).
  res.cookie('session', token, COOKIE_OPTIONS);

  // In production the frontend (Vercel) and backend (Render) are different
  // domains, so the HttpOnly cookie can't be read/sent by the frontend —
  // it stores this token in localStorage and sends it as
  // `Authorization: Bearer <token>` instead (see middleware/auth.js).
  return res.status(200).json({ success: true, token, user: publicUser(user) });
}

module.exports = {
  googleConfig: asyncHandler(googleConfig),
  exchange: asyncHandler(exchange),
};
