/**
 * middleware/auth.js
 * Auth middleware — supports BOTH Supabase Auth (browser/frontend) AND
 * Bearer API keys (Chrome extension + programmatic access).
 *
 * Auth precedence, based on the `Authorization: Bearer <token>` header:
 *   1. `apa_...`  -> API key (Chrome extension / programmatic access)
 *   2. anything else -> Supabase Auth access token (issued by supabase-js
 *      on the frontend after login/signup/OAuth). Verified against Supabase
 *      itself, so it works identically on localhost, Vercel, and Render —
 *      there is no server-side session state to keep in sync.
 *
 * On first sighting of a Supabase user, we lazily create their row in our
 * own `users` table (plan/credits/brandVoice/etc. live there — Supabase Auth
 * only owns identity, not app data).
 *
 * - requireAuth: 401 if not authenticated
 * - requirePlan('pro'): 403 if user's plan is too low
 * - requireCredits(n): 402 if user doesn't have enough credits
 */

const { getSupabaseUserFromToken } = require('../config/supabase');
const {
  getUserById,
  getOrCreateProfile,
  findApiKeyByHash,
  touchApiKey,
  sha256,
} = require('../services/storage-service');

async function attachUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.slice(7).trim();

      if (bearerToken.startsWith('apa_')) {
        // API key (extension / programmatic)
        const keyHash = sha256(bearerToken);
        const apiKey = await findApiKeyByHash(keyHash);
        if (apiKey) {
          const user = await getUserById(apiKey.userId);
          if (user) {
            req.user = user;
            req.userId = user.id;
            req.apiKey = apiKey;
            req.authMethod = 'api-key';
            // Update last_used timestamp (fire-and-forget, don't block)
            touchApiKey(apiKey.id).catch(() => {});
          }
        }
      } else if (bearerToken) {
        // Supabase Auth access token
        const supabaseUser = await getSupabaseUserFromToken(bearerToken);
        if (supabaseUser) {
          const user = await getOrCreateProfile(supabaseUser);
          req.user = user;
          req.userId = user.id;
          req.authMethod = 'supabase';
        }
      }
    }
  } catch (err) {
    // Don't crash the request — just leave req.user undefined.
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please login or provide a valid API key.',
    });
  }
  next();
}

function requirePlan(minPlan) {
  const order = { free: 0, creator: 1, business: 2, agency: 3 };
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userLevel = order[req.user.plan] ?? 0;
    const requiredLevel = order[minPlan] ?? 99;
    if (userLevel < requiredLevel) {
      return res.status(403).json({ success: false, message: `Requires ${minPlan} plan or higher.` });
    }
    next();
  };
}

function requireCredits(n = 1) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (Number(req.user.credits || 0) < n) {
      return res.status(402).json({ success: false, message: 'No credits left. Upgrade your plan.' });
    }
    next();
  };
}

module.exports = { attachUser, requireAuth, requirePlan, requireCredits };
