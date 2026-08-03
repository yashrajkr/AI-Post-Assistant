/**
 * controllers/auth-controller.js
 * Identity (signup/login/logout/Google/password reset/email verification)
 * is owned entirely by Supabase Auth and driven from the frontend via
 * supabase-js — this backend never sees a password.
 *
 * This controller only handles the app-level profile that hangs off a
 * Supabase user: `GET /api/me` (auto-creates the profile row on first call,
 * via requireAuth -> attachUser -> getOrCreateProfile) and profile updates.
 */

const { asyncHandler } = require('../middleware/asyncHandler');
const { publicUser } = require('../utils/helpers');
const { saveProfile } = require('../services/storage-service');

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

module.exports = { me, updateProfile: asyncHandler(updateProfile) };
