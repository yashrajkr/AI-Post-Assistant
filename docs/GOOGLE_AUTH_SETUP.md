# Google OAuth Setup ("Continue with Google")

> ⚠️ **Superseded.** `controllers/google-auth-controller.js` has been
> deleted — Google login now goes through Supabase Auth directly. See
> `/GOOGLE_SETUP.md` (repo root) for the current setup. Kept here for
> historical reference only.

The backend now has a real Google OAuth 2.0 Authorization Code flow
(`controllers/google-auth-controller.js`), but it is **disabled by default**
until you provide credentials. Without them, the app works exactly as before
(email/password) — the Google buttons just redirect back to `/login` with a
friendly message.

## 1. Create a Google Cloud OAuth client

1. Go to <https://console.cloud.google.com/apis/credentials>.
2. Create a project (or select an existing one).
3. Click **Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Under **Authorized redirect URIs**, add:
   - Local dev: `http://localhost:3001/api/auth/google/callback`
   - Production: `https://your-backend.onrender.com/api/auth/google/callback`
     (your real Render service URL)

   **Note on dev vs. prod:** in dev, the redirect URI points at the Vite dev
   server (`:3001`), which proxies `/api/*` to this backend (see
   `frontend/vite.config.ts`) — same-origin, so the callback cookie just
   works. In production, the frontend calls this backend **directly** via
   `VITE_API_URL` (see `frontend/src/lib/api.ts` — there's no proxy in
   `frontend/vercel.json`), so the redirect URI points at the backend's own
   domain instead. That makes the session cookie genuinely cross-site
   (`*.vercel.app` ↔ `*.onrender.com`), which is why `COOKIE_OPTIONS` in
   `controllers/auth-controller.js` and `controllers/google-auth-controller.js`
   set `sameSite: 'none'` (with `secure: true`) when `NODE_ENV=production` —
   without that, the browser silently drops the cookie and login "succeeds"
   but `/api/me` still comes back logged out.
6. Save. Copy the **Client ID** and **Client secret**.

If you see this project has no OAuth consent screen configured yet, you'll be
asked to set one up first — for a small SaaS, "External" + your own email as
a test user is enough to start.

## 2. Set backend environment variables

In `.env` (local) or your Render environment variables (production):

```env
# Local dev
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3001

# Production (Render env vars)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/google/callback
FRONTEND_URL=https://ai-post-assistant.vercel.app
```

Restart the server. The startup log should stop warning about missing Google
OAuth vars.

## 3. How the flow works

1. Browser hits `GET /api/auth/google` on the backend.
2. Backend redirects to Google's consent screen, with a random `state` value
   stored in a short-lived, httpOnly cookie (CSRF protection).
3. Google redirects back to `GET /api/auth/google/callback?code=...&state=...`.
4. Backend verifies `state`, exchanges `code` for tokens, and verifies the
   `id_token` signature via `google-auth-library` (not just decoded — actually
   cryptographically verified against Google's public keys).
5. If a user with that email already exists, they're logged into that
   account (so someone who signed up with email/password can also use
   Google later). Otherwise a new account is created with `passwordHash: null`
   (Google-only — they can't log in with a password unless they use "forgot
   password" once that's implemented).
6. A normal session cookie is set and the browser is redirected to
   `${FRONTEND_URL}/dashboard`.

## 4. Common issues

| Symptom | Cause | Fix |
|---|---|---|
| `redirect_uri_mismatch` | The URI in Google Cloud Console doesn't exactly match `GOOGLE_REDIRECT_URI` | Match them character-for-character, including `http` vs `https` and trailing slashes |
| Redirected to `/login?error=google_oauth_not_configured` | Env vars missing/empty | Check `.env` / Render dashboard |
| Redirected to `/login?error=google_invalid_state` | Cookie blocked (e.g. testing across two different origins without HTTPS) or the link was opened twice | Retry from a fresh `/login` page |
| Works locally, fails in production | `GOOGLE_REDIRECT_URI` and `FRONTEND_URL` still point at `localhost` | Update both env vars on Render to your real domains, and add the prod redirect URI in Google Cloud Console |
| Redirects to `/dashboard` but the app still shows logged out | `sameSite` on the session cookie isn't `'none'` in production, so the browser drops it on the cross-site request from `*.vercel.app` to `*.onrender.com` | Confirm `NODE_ENV=production` is set on Render — `COOKIE_OPTIONS` derives `sameSite`/`secure` from `env.isProduction` |
| `redirect_uri_mismatch` even though the value "looks right" | `GOOGLE_REDIRECT_URI` on Render doesn't exactly match what's registered in Google Cloud Console (e.g. you changed the Render service name/URL after registering) | Re-check the exact Render URL and update both places to match |

## 5. Production checklist

- [ ] Redirect URI in Google Cloud Console matches `GOOGLE_REDIRECT_URI` on Render exactly (your real `*.onrender.com` URL + `/api/auth/google/callback`)
- [ ] `FRONTEND_URL=https://ai-post-assistant.vercel.app` (no trailing slash) on Render
- [ ] `ALLOWED_ORIGINS=https://ai-post-assistant.vercel.app` on Render
- [ ] `NODE_ENV=production` on Render, so `COOKIE_OPTIONS` uses `sameSite: 'none'` + `secure: true` — required for the cross-site cookie to survive the `*.vercel.app` → `*.onrender.com` round trip
- [ ] `VITE_API_URL` set on Vercel to the real Render backend URL (the frontend calls it directly — see `frontend/src/lib/api.ts`)
- [ ] OAuth consent screen is out of "Testing" mode if you want any Google
      user (not just added test users) to be able to sign in
- [ ] `SESSION_SECRET` is a real random value (not the dev default)
