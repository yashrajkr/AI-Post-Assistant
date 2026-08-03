# Fix Google OAuth Login — DONE

The cross-origin cookie problem this file tracked (backend on Render,
frontend on Vercel — different domains, so the `session` cookie set by the
old custom auth couldn't be read across origins) is resolved, but not by
the Bearer-token-over-custom-session plan originally sketched below.

Instead, the whole custom auth system (password hashing, HMAC session
tokens, a hand-rolled Google OAuth redirect flow) was replaced with
**Supabase Auth**. See `AUTH_SETUP.md` for how it works now:

- The frontend talks to Supabase directly via `supabase-js`
  (`frontend/src/lib/auth.tsx`) for signup/login/Google OAuth/password
  reset/logout — no custom backend auth endpoints at all anymore.
- Every API request carries `Authorization: Bearer <supabase access token>`
  (`frontend/src/lib/api.ts`), verified against Supabase itself in
  `middleware/auth.js` — which is origin-independent by construction, so
  the Vercel/Render split was never actually the hard part once identity
  moved off custom cookies.
- `controllers/google-auth-controller.js` (the old server-driven OAuth
  redirect) was deleted; Google is configured in the Supabase Dashboard
  instead (see `docs/GOOGLE_SETUP.md`).

Original plan, kept for history:

- [x] ~~Backend `middleware/auth.js` — extend `attachUser` to accept a session token via `Authorization: Bearer`~~ — superseded: verifies Supabase tokens instead.
- [x] ~~Backend `controllers/google-auth-controller.js` — redirect with `?token=`~~ — superseded: file deleted, Supabase handles the OAuth redirect.
- [x] ~~Backend `controllers/auth-controller.js` — return `token` in login/signup JSON~~ — superseded: no backend login/signup endpoints anymore.
- [x] Frontend `lib/api.ts` — reads the Supabase access token and attaches `Authorization: Bearer`.
- [x] Frontend `lib/auth.tsx` — session persistence is handled by supabase-js (`persistSession`/`autoRefreshToken`), not manual localStorage.
- [x] Frontend `pages/AuthCallback.tsx` — exchanges the Supabase `?code=` for a session, navigates to `/dashboard`.
- [x] Frontend `App.tsx` — `/auth/callback`, `/forgot-password`, `/reset-password` routes added.
- [x] Frontend `pages/Login.tsx` & `pages/Signup.tsx` — surface `?error=` via toast.
- [x] Typecheck + build verified (`npm run frontend:typecheck`, `npm run frontend:build`).
