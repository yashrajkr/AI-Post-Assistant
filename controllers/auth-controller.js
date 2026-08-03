/**
 * controllers/auth-controller.js
 * Signup, login, logout, current-user.
 */

const crypto = require('crypto');
const { env } = require('../config/env');
const { asyncHandler } = require('../middleware/asyncHandler');
const { passwordHash, verifyPassword, signSession, publicUser } = require('../utils/helpers');
const { PLAN_CREDITS } = require('../config/plans');
const {
  createUser,
  getUserByEmail,
  saveProfile,
} = require('../services/storage-service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
  path: '/',
};

function signup(req, res) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const user = {
    id,
    name: req.body.name,
    email: req.body.email.toLowerCase(),
    passwordHash: passwordHash(req.body.password),
    plan: 'free',
    credits: PLAN_CREDITS.free,
    brandVoice: { brandName: '', tagline: '', tone: 'simple and practical' },
    generations: [],
    createdAt,
  };

  return asyncHandler(async () => {
    const existing = await getUserByEmail(user.email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }
await createUser(user);
    const token = signSession(user.id, env.SESSION_SECRET);
    res.cookie('session', token, COOKIE_OPTIONS);
    return res.status(201).json({ success: true, token, user: publicUser(user) });
  })(req, res);
}

function login(req, res) {
  return asyncHandler(async () => {
    const user = await getUserByEmail(req.body.email.toLowerCase());
    if (!user || !verifyPassword(req.body.password, user.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = signSession(user.id, env.SESSION_SECRET);
    res.cookie('session', token, COOKIE_OPTIONS);
    return res.status(200).json({ success: true, token, user: publicUser(user) });
  })(req, res);
}

function logout(req, res) {
  res.clearCookie('session', { path: '/' });
  return res.status(200).json({ success: true });
}

function me(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  return res.status(200).json({ success: true, user: publicUser(req.user) });
}

async function updateProfile(req, res) {
  const brandVoice = {
    brandName: String(req.body.brandName || '').trim(),
    tagline: String(req.body.tagline || '').trim(),
    tone: String(req.body.tone || 'simple and practical').trim(),
  };
  const updated = await saveProfile({
    userId: req.user.id,
    name: req.body.name || req.user.name,
    brandVoice,
  });
  return res.status(200).json({ success: true, user: publicUser(updated) });
}

module.exports = { signup, login, logout, me, updateProfile };
