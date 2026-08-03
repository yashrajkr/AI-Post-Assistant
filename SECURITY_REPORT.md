# Security Report — Auth Migration

Vulnerabilities found (or risks carried over) while migrating auth to
Supabase, and what was done about each. Ordered by what matters most for a
production launch.

## 1. Custom session/crypto surface removed (risk reduction)

**Before:** hand-rolled HMAC session tokens (`signSession`/`verifySession`
in `utils/helpers.js`) and pbkdf2 password hashing done in this repo's own
code — every line of that is attack surface *we* own and have to get
right (timing-safe comparisons, salt handling, secret rotation, etc).

**Fix:** deleted entirely. Supabase Auth (a security-focused vendor whose
entire product is getting this right) now owns passwords, tokens, and
sessions. `utils/helpers.js` no longer exports `signSession`/`verifySession`;
`passwordHash`/`verifyPassword` are kept only for the one-time legacy-data
migration script, not for anything live.

## 2. Service-role key exposure — checked, clean

Grepped the entire `frontend/` tree for `SERVICE_ROLE` and any Supabase
service-role-shaped value: zero matches. `frontend/src/vite-env.d.ts` only
types `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, so a typo'd
`VITE_SUPABASE_SERVICE_ROLE_KEY` would be a TypeScript error, not a silent
`import.meta.env` passthrough. `config/supabase.js` (backend) is the only
place the service-role key is read.

## 3. No secrets committed to the repo

Checked `.gitignore` (excludes `.env`, `.env.*`, keeps `.env.example`), and
grepped for JWT-shaped strings (`eyJhbGciOi...`), `sk-` prefixes, and
inline `SUPABASE_SERVICE_ROLE_KEY=<value>` assignments across
`*.js`/`*.json`/`*.env*` — none found outside the example files (which are
placeholders with empty values).

## 4. Backend token verification, not trust-on-faith

`middleware/auth.js` calls `supabase.auth.getUser(token)` — i.e. every
request's Bearer token is verified **against Supabase itself** on every
call, not just decoded/trusted locally. An expired, revoked, or forged
token is rejected (see `TEST_REPORT.md` for the manual test with a garbage
token → 401).

## 5. CORS — fixed for local dev, flagged for production

`server.js`'s `corsOrigin()` reflects the request's `Origin` header back
when `ALLOWED_ORIGINS=*` (the `.env.example` default) or when it matches
the configured allow-list, combined with `credentials: true`.

**Risk:** shipping to production with `ALLOWED_ORIGINS=*` still set means
any website can make credentialed-looking cross-origin requests to the
API (browsers will still enforce the actual credential rules, but the
server-side allow-list itself is the intended defense layer and shouldn't
be left wide open).

**Fix:** `AUTH_CHECKLIST.md` and `DEPLOYMENT_CHECKLIST.md` both call out,
as an explicit checkbox, setting `ALLOWED_ORIGINS` to the real Vercel URL
before going live. `chrome-extension://*` is allowed separately via
`ALLOW_EXTENSION_ORIGIN` so tightening `ALLOWED_ORIGINS` doesn't break the
extension.

## 6. `cors({ credentials: true })` is now vestigial, not dangerous

Cookies are no longer used for auth (Bearer tokens only), so `credentials:
true` has no practical effect anymore — flagged in `AUTH_AUDIT.md` as a
cleanup opportunity, not a vulnerability (it doesn't grant anything extra
without a cookie to send).

## 7. RLS enabled on `users`, not left implicit

`docs/migrations/002_supabase_auth_migration.sql` explicitly `enable row
level security` on `users` with `select`/`update` policies scoped to
`auth.uid() = id`. The backend bypasses RLS via the service-role key (by
design — it needs to read/write for the authenticated user regardless),
but if the anon key is ever used to query `users` directly from the
frontend in the future, RLS prevents reading/writing another user's row.

## 8. OAuth redirect allow-list, not an open redirect

Supabase's own Redirect URLs allow-list (configured per
`GOOGLE_SETUP.md`/`AUTH_CHECKLIST.md`) means `redirectTo` can't be pointed
at an arbitrary attacker-controlled URL — Supabase rejects anything not on
the list. This is Supabase's mechanism, not custom code, and it's called
out in the checklist because a missing entry is a functional bug, not
silently insecure — but worth stating that the security property itself
(no open redirect) holds regardless of the checklist being followed.

## 9. Logout actually revokes, doesn't just forget

`supabase.auth.signOut()` (used in `frontend/src/lib/auth.tsx`) revokes
the refresh token server-side by default, so a captured access token can't
be silently refreshed forever after the user logs out — this is stronger
than the old system's logout, which only cleared the cookie client-side
and had no server-side revocation.

## 10. Duplicate/legacy auth code — removed, not just deprecated

`controllers/google-auth-controller.js` (the old server-driven Google OAuth
redirect, including its own CSRF `state` cookie handling) is **deleted**,
not left dormant behind a feature flag. A dormant-but-reachable second
auth path is itself a common source of vulnerabilities (routes people
forget are still live); removing it outright avoids that class of bug
entirely rather than just disabling it.

## Not found / ruled out

- No hardcoded API keys, passwords, or tokens in source.
- No `eval`/`Function()` on user input in the auth path.
- No auth middleware bypass: every non-public route in `routes/index.js`
  has `requireAuth` (spot-checked the full route table).
- No password ever touches this backend's code — Supabase receives it
  directly from the browser over TLS.
