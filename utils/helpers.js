/**
 * utils/helpers.js
 * Generic helpers used across controllers/services.
 */

const crypto = require('crypto');

/**
 * Strip sensitive fields before sending a user object to the frontend.
 */
function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || user.avatar_url || null,
    provider: user.provider || 'email',
    plan: user.plan || 'free',
    credits: Number(user.credits || 0),
    brandVoice: user.brandVoice || {},
    createdAt: user.createdAt || user.created_at || new Date().toISOString(),
  };
}

/**
 * pbkdf2 password hashing (120k rounds, sha512, 64 bytes).
 * Returns `${salt}:${hash}`.
 */
function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, saved) {
  if (!saved || typeof saved !== 'string' || !saved.includes(':')) return false;
  const [salt, hash] = saved.split(':');
  const candidate = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  try {
    const a = Buffer.from(candidate);
    const b = Buffer.from(hash);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function mostCommon(list) {
  const counts = {};
  for (const item of list.filter(Boolean)) counts[item] = (counts[item] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None yet';
}

function cleanTag(value) {
  return String(value || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 28) || 'PostReadyAI';
}

function templatePrefix(template) {
  return {
    admission: 'Admission Open',
    result: 'Result Update',
    sale: 'Special Offer',
    project: 'Project Showcase',
    festival: 'Festival Special',
    launch: 'New Launch',
  }[template] || 'Post Ready';
}

module.exports = {
  publicUser,
  passwordHash,
  verifyPassword,
  mostCommon,
  cleanTag,
  templatePrefix,
};
