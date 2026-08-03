# Fix Google OAuth Login

## Goal
Fix "Continue with Google" login which is broken in production due to a cross-origin cookie problem (backend on Render, frontend on Vercel — different domains).

Superseded plan: Google sign-in now goes through Supabase Auth
(`supabase.auth.signInWithOAuth`) instead of a custom Express OAuth
controller — see `docs/GOOGLE_AUTH_SETUP.md`.

## Steps
- [x] 1. Backend `middleware/auth.js` — extend `attachUser` to accept a session token via `Authorization: Bearer` (not just `apa_` API keys). *(already supported this)*
- [x] 2. Backend `controllers/supabase-auth-controller.js` — validate the Supabase `access_token` and issue an app session (replaces the old `google-auth-controller.js` redirect flow).
- [x] 3. Backend `controllers/auth-controller.js` — return `token` in login/signup JSON responses.
- [x] 4. Frontend `lib/api.ts` — read token from localStorage and attach `Authorization: Bearer` header.
- [x] 5. Frontend `lib/auth.tsx` — persist returned token in localStorage; clear on logout.
- [x] 6. Frontend `pages/AuthCallback.tsx` — reads the Supabase session, exchanges it via `POST /api/auth/supabase`, stores the app token, navigates to `/dashboard`.
- [x] 7. Frontend `App.tsx` — add `/auth/callback` route.
- [ ] 8. Frontend `pages/Login.tsx` & `pages/Signup.tsx` — surface Google sign-in errors via toast (currently only handled inside `AuthCallback.tsx`).
- [x] 9. Run typecheck + verify build.

## Still needed (manual, outside this repo)
- [ ] Enable the Google provider in the Supabase dashboard (Authentication → Providers → Google) with a real Google OAuth Client ID/Secret.
- [ ] Add `/auth/callback` for each deployed origin to Supabase's redirect URL allow-list.
- [ ] Set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` on Vercel and `SUPABASE_*` on Render.
