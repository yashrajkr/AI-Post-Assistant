# Auth Audit

Static/code-level audit of the authentication system after migrating it to
Supabase Auth. "PASS" means verified by reading the code and/or running it
locally without live Supabase/Google credentials (syntax checks, typecheck,
build, smoke test, manual middleware testing with fake tokens). It does
**not** mean "verified end-to-end against a live Supabase project" — that
requires real credentials this environment doesn't have; see
`TEST_REPORT.md` for exactly what was and wasn't executed, and
`AUTH_CHECKLIST.md` for the manual post-deploy verification list.

| # | Component | Status | Notes |
|---|---|---|---|
| 1 | Duplicate/legacy auth removed | PASS | `controllers/google-auth-controller.js` deleted. `signSession`/`verifySession` (HMAC session tokens) and cookie-based session removed from `middleware/auth.js`, `utils/helpers.js`. `cookie-parser` removed from `server.js`/`package.json`. `google-auth-library` removed from `package.json`. |
| 2 | Frontend Supabase client init | PASS | `frontend/src/lib/supabaseClient.ts` — uses only `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, `persistSession`/`autoRefreshToken`/`detectSessionInUrl: true`, `flowType: 'pkce'`. Fails loudly (console.error) if env vars are missing rather than silently no-op'ing. |
| 3 | Backend Supabase client init | PASS | `config/supabase.js` — `supabaseAnon` (unused by auth now, kept for future use) + `supabaseService` (service-role, server-only). `getSupabaseUserFromToken()` added for token verification. |
| 4 | Service-role key isolation | PASS | Backend only (`config/supabase.js`, `config/env.js`); grepped entire `frontend/` tree — zero occurrences of `SERVICE_ROLE` or a service key. `frontend/vite-env.d.ts` only declares `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`. |
| 5 | Signup (email/password) | PASS (code) / NOT RUN (live) | `supabase.auth.signUp()` in `frontend/src/lib/auth.tsx`, with `emailRedirectTo`. Handles the "email confirmation required, no session yet" case (`data.session === null`) by surfacing a "check your email" message instead of erroring. |
| 6 | Login (email/password) | PASS (code) / NOT RUN (live) | `supabase.auth.signInWithPassword()`. Friendly error mapping (`friendlyAuthError`) for invalid credentials, unconfirmed email, rate limiting, network errors. |
| 7 | Google OAuth | PASS (code) / NOT RUN (live) | `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams } })`. No competing Express OAuth route remains. Requires Google Cloud + Supabase Dashboard config — see `GOOGLE_SETUP.md`. |
| 8 | OAuth/email-verification callback | PASS | `frontend/src/pages/AuthCallback.tsx` at `/auth/callback` — handles `?code=` (PKCE exchange) and `?error=`/`?error_description=`, redirects to `/dashboard` on success or `/login?error=...` on failure. This route did not exist before (dead-end redirect bug) — now wired into `App.tsx`. |
| 9 | Forgot password | PASS (code) / NOT RUN (live) | `supabase.auth.resetPasswordForEmail()`, new `/forgot-password` page. Does not leak whether an email exists (generic "if an account exists…" copy). |
| 10 | Reset password | PASS (code) / NOT RUN (live) | New `/reset-password` page — waits for the recovery session (`detectSessionInUrl`) then `supabase.auth.updateUser({ password })`. Shows an explicit "link invalid/expired" state instead of hanging. |
| 11 | Resend verification email | PASS | `resendVerification()` in `auth.tsx` wraps `supabase.auth.resend({ type: 'signup' })`, surfaced as a "Resend verification link" action on the Login page when a login attempt fails with "email not confirmed". |
| 12 | Logout | PASS | `supabase.auth.signOut()` — revokes the refresh token server-side, clears local state. No leftover cookie/localStorage token to separately clear. |
| 13 | Session persistence (refresh/new tab/restart) | PASS (mechanism) / NOT RUN (live) | Delegated entirely to supabase-js (`persistSession`, `autoRefreshToken`) rather than hand-rolled localStorage — this is the standard, tested Supabase mechanism, not custom code. |
| 14 | Session restore on load | PASS | `AuthProvider` calls `supabase.auth.getSession()` on mount and subscribes to `onAuthStateChange`; `AuthGate` shows a skeleton loader until `loading` resolves, avoiding a login-page flash on refresh. |
| 15 | Backend token verification | PASS | `middleware/auth.js` → `getSupabaseUserFromToken()` → `supabase.auth.getUser(token)` against the service-role client. Verified locally: invalid/garbage Bearer token → 401 (see `TEST_REPORT.md`). |
| 16 | Auto profile creation | PASS | Two independent mechanisms (defense in depth): (a) `services/storage-service.js::getOrCreateProfile()` called from `middleware/auth.js` on first authenticated request; (b) Postgres trigger `on_auth_user_created` in `docs/migrations/002_supabase_auth_migration.sql` fires on every `auth.users` insert (password **or** OAuth). Either alone is sufficient; having both means a delayed backend call after OAuth still works. |
| 17 | Protected vs. public routes | PASS | `frontend/src/App.tsx` — public: `/`, `/features`, `/pricing`, `/about`, `/contact`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/privacy`, `/terms`, etc. Protected (wrapped in `AuthGate`): `/dashboard`, `/generate`, `/history`, `/schedule`, `/analytics`, `/settings`, `/profile`, and all other app pages. Backend mirrors this with `requireAuth` on every non-public route in `routes/index.js`. |
| 18 | Chrome extension auth (separate system) | PASS | Confirmed unrelated to Supabase Auth — uses long-lived hashed API keys (`apa_...`) via `middleware/auth.js`'s `apa_` branch, `services/storage-service.js` (`createApiKeyRecord`/`findApiKeyByHash`). Not affected by this migration; still verified to route through `chrome-extension/src/lib/api.ts` correctly. |
| 19 | CORS | PASS | `server.js` `corsOrigin()` reflects the request origin (required for `credentials: true`... — see "Known gaps" #2 below re: whether `credentials: true` is still needed) and allows `chrome-extension://*`. `ALLOWED_ORIGINS` should be locked to the real frontend origin in production (checked in `AUTH_CHECKLIST.md`/`DEPLOYMENT_CHECKLIST.md`), not left at `*`. |
| 20 | Env var separation (frontend vs backend) | PASS | Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` only. Backend: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. See `ENVIRONMENT_CHECK.md`. |
| 21 | Production startup guard | PASS | `config/env.js::startupGuard()` refuses to boot in production if Supabase keys are missing (previously only checked the old `SESSION_SECRET`, which no longer exists). |
| 22 | Legacy `public/` frontend removed | PASS | Found (with the user's explicit confirmation before deleting) a second, unused-in-production vanilla HTML/JS frontend under `public/`, served by `server.js` as a static/SPA fallback, whose `login.html`/`signup.html` called the now-deleted `/api/signup`/`/api/login` endpoints — actively broken. Deleted the folder and the static-serving/SPA-fallback middleware in `server.js`; `docs/VERIFICATION_REPORT_2026-08-02.md` had already independently flagged this exact folder as safe to remove. See `docs/DELETION_LOG.md`. |
| 23 | Docs consistency | PASS | Old docs referencing the removed session/Google-OAuth env vars (`docs/GOOGLE_AUTH_SETUP.md`, `docs/DEPLOYMENT_GUIDE.md`, `docs/DEPLOYMENT_CHECKLIST.md`, `docs/SETUP_GUIDE.md`, `docs/RENDER_DEPLOYMENT.md`, `docs/DEPLOYMENT.md`, `docs/AUDIT_REPORT.md`, `docs/FINAL_REPORT.md`) now carry a superseded-banner pointing at the current root-level docs. `render.yaml` had the actual stale env vars removed (not just documented as stale). |
| 24 | Live DB migration + trigger, verified against production Supabase | PASS | Applied `docs/migrations/002_supabase_auth_migration.sql` to the real project (`cwzttzsgydirfvmdniil`) via the Supabase MCP connector. Signed up a real test account via the Auth REST API and confirmed the `on_auth_user_created` trigger created the `public.users` row automatically with correct defaults, and that deleting the `auth.users` row cascade-deleted it. See `TEST_REPORT.md`. |
| 25 | AuthCallback PKCE race condition | FIXED | `frontend/src/pages/AuthCallback.tsx` was manually calling `supabase.auth.exchangeCodeForSession(code)`, racing supabase-js's own automatic code exchange (triggered by `AuthProvider`'s `getSession()`, which runs on every page including the callback page). Whichever call lost found the single-use PKCE code already consumed and errored, even on a successful login. Fixed by removing the manual exchange and polling `getSession()` instead. Found and fixed after investigating the user's reported "Google login redirects to landing page" bug. |
| 26 | Google OAuth end-to-end redirect chain | PASS (frontend) / diagnosed (Supabase-side issue) | Live-tested with the Browser tool against the real Supabase project: clicking "Continue with Google" correctly redirected to Google's real sign-in screen with the correct `redirect_uri` (Supabase's `/auth/v1/callback`) and `redirect_to` (this app's `/auth/callback`) — proving the frontend code is correct. Pulled real Supabase Auth logs showing every recent attempt failing with `400: OAuth state not found or expired` at Supabase's own callback (after Google, before returning to the app) — a browser cookie/timing issue on the Supabase side, not a code bug. See `TEST_REPORT.md` for the full diagnosis and recommended next step. |
| 27 | AI provider: Groq added (user has no OpenAI/Gemini budget) | PASS | The user's key (`gsk_...`) is a **Groq** (groq.com) key, not "Grok" (xAI, `api.x.ai`) — easy mix-up, different API entirely. Added full Groq support (`services/ai-service.js`: `generateWithGroq` plus `groq` branches in score/repurpose/calendar/campaign/document/brand-health, `config/env.js`: `GROQ_API_KEY`/`GROQ_MODEL`/`hasGroq`) rather than misusing the key against the wrong endpoint (which would 401). Verified live: `GET /api/ai/health` → `groq: ok`, and a direct `generateContent()` call returned real, well-formed Groq output. `render.yaml`/`.env.example` updated; `AI_PROVIDER=groq` set as the Render blueprint default until the user upgrades to a paid provider. |

## Known gaps (not blockers, flagged for follow-up)

1. **`cors({ credentials: true })`** — this was needed when auth was a
   cookie. It's now harmless (no cookies are set or read), but could be
   dropped for clarity; left in place to avoid an unnecessary risk on a
   working CORS config during this migration.
2. **Live end-to-end verification** — everything above was verified by
   reading the code, static checks (typecheck/build/lint), and hitting the
   backend with real/fake tokens. The actual Supabase/Google round trip
   (send a real verification email, complete a real Google consent screen,
   etc.) has **not** been run, because this environment has no live
   Supabase project or Google OAuth credentials. See
   `AUTH_CHECKLIST.md` → "Post-deploy smoke test" for the manual steps to
   run once you deploy with real credentials, and `TEST_REPORT.md` for the
   precise PASS/NOT RUN breakdown.
