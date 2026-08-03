# Google Sign-In Setup ("Continue with Google")

"Continue with Google" is handled by **Supabase Auth**, not a custom OAuth
flow in this codebase. Supabase runs the entire Google consent screen +
token exchange; this app just validates the resulting Supabase session and
maps it to a local user.

If Supabase isn't configured, the Google button hides itself automatically
— email/password still works.

## 1. Enable the Google provider in Supabase

1. Go to your project's [Supabase dashboard](https://supabase.com/dashboard) → **Authentication → Providers → Google**.
2. Toggle it on.
3. You'll need a Google OAuth client (Client ID + Secret) from
   <https://console.cloud.google.com/apis/credentials>:
   - Application type: **Web application**.
   - Authorized redirect URI: use the callback URL Supabase shows on that
     provider page — it looks like
     `https://<your-project-ref>.supabase.co/auth/v1/callback`.
4. Paste the Google Client ID + Secret into the Supabase provider settings
   and save.

## 2. Add your app's redirect URL to Supabase

Under **Authentication → URL Configuration**, add every origin the app is
served from to **Redirect URLs**, e.g.:

- `http://localhost:5173/auth/callback` (local dev)
- `https://your-app.vercel.app/auth/callback` (production)

Supabase only redirects back to URLs on this allow-list.

## 3. Environment variables

**Backend** (`.env` / Render) — reuses the same Supabase keys the app
already uses for storage:

```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Frontend** (`frontend/.env.local` / Vercel) — the anon key is safe to
expose in the browser, that's what it's for:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. How the flow works

1. Browser clicks "Continue with Google" → `supabase.auth.signInWithOAuth({ provider: 'google' })`
   (`frontend/src/lib/supabaseClient.ts`). Supabase redirects to Google, then
   back to `${origin}/auth/callback` with a Supabase session encoded in the URL.
2. `frontend/src/pages/AuthCallback.tsx` reads that session, grabs its
   `access_token`, and `POST`s it to `/api/auth/supabase`.
3. `controllers/supabase-auth-controller.js` validates the token against
   Supabase, finds or creates the local user by email, and issues this app's
   own session (same HMAC-signed token used by email/password login).
4. The frontend stores that app token (`localStorage`, since Vercel and
   Render are different domains — the HttpOnly cookie can't cross origins)
   and sends it as `Authorization: Bearer <token>` on every request after
   that (`frontend/src/lib/api.ts`).

## 5. Common issues

| Symptom | Cause | Fix |
|---|---|---|
| Google button doesn't appear | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` missing at build time | Set them in Vercel project settings and redeploy |
| Redirected to Google, then straight back to `/login` with an error toast | `/auth/callback` URL isn't in Supabase's redirect allow-list | Add it under Authentication → URL Configuration |
| "Google sign-in is not configured on this server" (401/503 from `/api/auth/supabase`) | Backend `SUPABASE_*` env vars missing | Check `.env` / Render dashboard |
| Works locally, fails in production | Redirect URL allow-list only has `localhost` | Add your real Vercel domain's `/auth/callback` URL in Supabase |

## 6. Production checklist

- [ ] Google provider enabled in Supabase with real Client ID/Secret
- [ ] Production `/auth/callback` URL added to Supabase's redirect allow-list
- [ ] `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` set on Vercel
- [ ] `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` set on Render
- [ ] `SESSION_SECRET` is a real random value (not the dev default)
