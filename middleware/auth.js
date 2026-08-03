/**
 * middleware/auth.js
 * Auth middleware — supports BOTH session cookie AND Bearer API key.
 *
 * Auth precedence:
 *   1. Session cookie (browser users — existing behavior)
 *   2. Authorization: Bearer apa_xxx (Chrome extension + programmatic access)
 *
 * - requireAuth: 401 if not authenticated
 * - requirePlan('pro'): 403 if user's plan is too low
 * - requireCredits(n): 402 if user doesn't have enough credits
 */

const { verifySession } = require('../utils/helpers');
const { env } = require('../config/env');
const {
  getUserById,
  findApiKeyByHash,
  touchApiKey,
  sha256,
} = require('../services/storage-service');

async function attachUser(req, res, next) {
  try {
    // 1. Try session cookie first (browser)
    const token = req.cookies?.session;
    if (token) {
      const userId = verifySession(token, env.SESSION_SECRET);
      if (userId) {
        const user = await getUserById(userId);
        if (user) {
          req.user = user;
          req.userId = user.id;
          req.authMethod = 'session';
        }
      }
    }

    // 2. If no session, try Bearer token (session token OR API key)
    if (!req.user) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.slice(7).trim();

        // 2a. Bearer session token (from Google OAuth redirect / localStorage).
        //     This lets the frontend authenticate cross-origin when the cookie
        //     can't be sent (Vercel frontend -> Render backend).
        if (bearerToken && !bearerToken.startsWith('apa_')) {
          const userId = verifySession(bearerToken, env.SESSION_SECRET);
          if (userId) {
            const user = await getUserById(userId);
            if (user) {
              req.user = user;
              req.userId = user.id;
              req.authMethod = 'session';
            }
          }
        } else if (bearerToken.startsWith('apa_')) {
          // 2b. Bearer API key (extension / programmatic)
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
