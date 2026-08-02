# Google OAuth Setup ("Continue with Google")

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
   - Local dev: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-backend-domain.com/api/auth/google/callback`
6. Save. Copy the **Client ID** and **Client secret**.

If you see this project has no OAuth consent screen configured yet, you'll be
asked to set one up first — for a small SaaS, "External" + your own email as
a test user is enough to start.

## 2. Set backend environment variables

In `.env` (local) or your Render environment variables (production):

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback   # or your prod URL
FRONTEND_URL=http://localhost:3001                                   # or your Vercel URL
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

## 5. Production checklist

- [ ] Redirect URI in Google Cloud Console matches `GOOGLE_REDIRECT_URI` exactly
- [ ] `FRONTEND_URL` points at your real Vercel domain (no trailing slash)
- [ ] OAuth consent screen is out of "Testing" mode if you want any Google
      user (not just added test users) to be able to sign in
- [ ] `SESSION_SECRET` is a real random value (not the dev default)
