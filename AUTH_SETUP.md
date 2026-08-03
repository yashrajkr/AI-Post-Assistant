# Auth Setup — AI Post Assistant

This app's entire authentication system is **Supabase Auth**. There is no
custom password hashing, no custom session JWT, and no server-side OAuth
dance in this codebase anymore — Supabase owns identity, and this app
owns app data (plan, credits, brand voice, generations) linked 1:1 to the
Supabase user by id.

## How it fits together

```
Browser (React)                 Express backend              Supabase
────────────────                ───────────────              ────────
supabase-js client  ──────────────────────────────────────▶  Auth (users,
  - signUp / signInWithPassword                               passwords,
  - signInWithOAuth('google')                                 sessions,
  - resetPasswordForEmail                                     JWTs)
  - onAuthStateChange (persists session
    across refresh / new tab / restart)
       │
       │ Authorization: Bearer <supabase access token>
       ▼
GET /api/me, POST /api/generate, etc.
  - middleware/auth.js verifies the token against Supabase
    (supabase.auth.getUser(token))
  - on first sight, auto-creates a row in `public.users`
    (plan: free, credits: 10, brandVoice defaults)
  - every other route reads/writes that row for app data
```

Because auth is a Bearer token (not a cookie), it works identically on
localhost, across the Vercel↔Render origin split, and from the Chrome
extension's own auth path (API keys — unrelated, see below).

## Environment variables

**Backend** (`.env`, or Render's dashboard):
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
The backend uses the **service-role key** to verify tokens and read/write
the `users` table with full privileges. It must never be sent to the browser.

**Frontend** (`frontend/.env.local`, or Vercel project env vars):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
The frontend uses the **anon/public key** only — it's safe to expose (it's
the same key Supabase's own docs put directly in client-side code), because
Row Level Security policies (see `docs/migrations/002_supabase_auth_migration.sql`)
restrict what it can actually read/write.

Both sets of variables are **required** — the app does not fall back to a
non-Supabase auth system anymore. `startupGuard()` in `config/env.js`
refuses to boot in production without them.

## What each auth flow actually does

| Flow | Where it runs | What happens |
|---|---|---|
| Email/password signup | `frontend/src/lib/auth.tsx` → `supabase.auth.signUp()` | Supabase creates the auth user, sends a verification email if confirmations are enabled (recommended), and (once confirmed) a `public.users` row is created on the next `/api/me` call or via the DB trigger. |
| Email/password login | `supabase.auth.signInWithPassword()` | Returns a session (access + refresh token), persisted to `localStorage` by supabase-js. |
| Google OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` | Redirects to Google, then to Supabase's callback, then to `${FRONTEND}/auth/callback` with a `?code=`. `frontend/src/pages/AuthCallback.tsx` exchanges it for a session and redirects to `/dashboard`. |
| Forgot password | `supabase.auth.resetPasswordForEmail()` | Supabase emails a link to `/reset-password`. `frontend/src/pages/ResetPassword.tsx` calls `supabase.auth.updateUser({ password })` once the recovery session lands. |
| Resend verification | `supabase.auth.resend({ type: 'signup' })` | Re-sends the confirmation email. |
| Logout | `supabase.auth.signOut()` | Revokes the refresh token server-side and clears local storage. |
| Session persistence | supabase-js (`persistSession`, `autoRefreshToken`) | Survives refresh, new tabs, and browser restarts automatically. |
| Route protection | `frontend/src/components/AuthGate.tsx` | Redirects to `/login` if there's no user once the initial `/api/me` resolves; shows a skeleton loader while it's in flight so a hard refresh doesn't flash the login page. |
| Chrome extension | `chrome-extension/src/lib/api.ts` | Unrelated — uses long-lived API keys (`apa_...`) generated from the web dashboard (`/api-keys`), not Supabase sessions. |

## Local development

1. Create a free Supabase project (see `docs/SUPABASE_SETUP.md`).
2. Run `docs/SUPABASE_SCHEMA.sql` (new project) or
   `docs/migrations/002_supabase_auth_migration.sql` (existing project) in
   the SQL editor.
3. Fill in `.env` (backend) and `frontend/.env.local` (frontend) per above.
4. Enable Google as a provider in Supabase if you want "Continue with
   Google" (see `docs/GOOGLE_SETUP.md`) — email/password works without it.
5. `npm run dev` (backend) and `npm run frontend:dev` (frontend).

## Deployment

See `docs/DEPLOYMENT.md` for the full Vercel/Render/Supabase checklist, and
`AUTH_CHECKLIST.md` for the exact configuration steps that must be done in
each dashboard (nothing here can be automated from code — they're
third-party consoles).
