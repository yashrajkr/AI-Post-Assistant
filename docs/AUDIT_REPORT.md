# PostReady AI v10 — Audit Report

Generated during the v9 → v10 production hardening refactor.

---

## Phase 1 — Project Analysis

### Original v9 project map

```
postready_v9/
├── server.js              (715 lines — monolith)
├── public/
│   ├── index.html         (landing)
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── generate.html
│   ├── pricing.html
│   ├── schedule.html
│   ├── analytics.html
│   ├── profile.html
│   ├── app.js             (shared frontend helpers, 142 lines)
│   └── style.css
├── lib/                   ← DEAD CODE (nothing required it)
│   ├── supabase.js
│   └── supabaseHelpers.js
├── data/
│   ├── users.json
│   ├── schedules.json
│   ├── feedback.json
│   ├── payments.json
│   └── templates.json
├── docs/
│   ├── SUPABASE_SCHEMA.sql  (incomplete — no RLS, no subscriptions table)
│   ├── PRODUCTION_CHECKLIST.md
│   └── DEPLOYMENT.md
├── tests/
│   └── smoke-test.js
├── package.json           (zero dependencies declared!)
├── .env / .env.example
├── .gitignore
├── README.md
└── LICENSE
```

### v9 API routes (all defined inline in server.js)

| Method | Path                  | Purpose                       |
|--------|-----------------------|-------------------------------|
| GET    | /api/health           | Basic health ping             |
| POST   | /api/signup           | Create account                |
| POST   | /api/login            | Login                         |
| POST   | /api/logout           | Clear session                 |
| GET    | /api/me               | Current user                  |
| GET    | /api/templates        | List post templates           |
| GET    | /api/plans            | List subscription plans       |
| POST   | /api/profile          | Update name + brand voice     |
| POST   | /api/upgrade          | Manual plan upgrade           |
| POST   | /api/generate         | Generate content (mock/OpenAI/Gemini) |
| GET    | /api/history          | User's generations            |
| POST   | /api/feedback         | Submit feedback               |
| POST   | /api/schedules        | Create schedule               |
| GET    | /api/schedules        | List user schedules           |
| GET    | /api/analytics        | Usage analytics               |
| POST   | /api/create-order     | Create Razorpay/demo order    |
| POST   | /api/verify-payment   | Verify payment signature      |

All API contracts were preserved 1:1 in v10. Frontend routes (`/`, `/login.html`, `/signup.html`, etc.) are unchanged.

### Subsystem status (v9 → v10)

| Subsystem | v9 state | v10 state |
|---|---|---|
| Frontend | Vanilla HTML/JS — works but no error/empty states | Vanilla HTML/JS — added `emptyState()` + `errorState()` helpers, friendly 401/402/403/429/500 messages |
| Backend | 715-line monolith `server.js` | Modular: `routes/`, `controllers/`, `services/`, `middleware/`, `utils/`, `config/`. `server.js` is now ~100 lines |
| Database | JSON files only (corrupts on concurrent writes). `lib/supabaseHelpers.js` existed but was dead code | Unified `storage-service.js` — auto-detects Supabase and uses it, falls back to JSON only in dev |
| AI | `mock` default. No retry, no timeout, no fallback chain | `OpenAI → Gemini → mock` chain with 30s timeout, 3 retries (1s/2s/4s backoff), graceful fallback |
| Auth | Cookie session (HMAC-signed). No rate limiting. No Zod validation. | Same cookie session + Helmet + rate limits (global 100/15min, auth 5/15min, AI 20/hr free) + Zod validation on every body |
| Payments | Razorpay stub. Demo-mode auto-succeeds. No webhook endpoint. | Full Razorpay: create-order, verify-payment (HMAC-SHA256), webhook endpoint with raw-body signature verification, demo-mode fallback when keys missing |
| Security | None (no helmet, no CORS config, no rate limit, no input validation) | Helmet + CORS + cookie-parser + 3 rate-limit policies + Zod validation + startup guards + graceful shutdown |
| Deployment | `npm install` + `node server.js`. No env validation. | Same + `npm run migrate` + `npm run smoke` + `npm test`. Production refuses to boot if `AI_PROVIDER=mock` or `SESSION_SECRET` is default. |

### Problems identified (categorized)

**CRITICAL**
1. `lib/` directory was completely dead code (nothing required it). Created a false impression of Supabase integration.
2. `package.json` had ZERO dependencies declared — even though `lib/supabase.js` does `require('@supabase/supabase-js')`. The original v9 was running purely on Node built-ins + `fetch` (Node 18+).
3. No Razorpay webhook endpoint → subscription status would silently drift if user's browser crashed mid-checkout.
4. No rate limiting → AI generation endpoint could be DDoS'd.
5. No input validation → malformed bodies could crash handlers.

**HIGH**
6. AI had no retry / no timeout / no automatic fallback — a single OpenAI hiccup = 500 error to user.
7. `AI_PROVIDER=mock` could ship to production undetected.
8. No graceful shutdown → in-flight requests dropped on deploy.
9. No centralized error handler → inconsistent error shapes across endpoints.
10. JSON file storage with no file locking → data corruption under concurrent writes.

**MEDIUM**
11. No health endpoint exposed AI/DB/Razorpay status.
12. No migration script → existing JSON data couldn't move to Supabase.
13. Frontend `api()` helper swallowed errors with raw messages.
14. No `.env.example` documentation for `RAZORPAY_WEBHOOK_SECRET`, `ALLOWED_ORIGINS`, `SENTRY_DSN`.
15. `docs/SUPABASE_SCHEMA.sql` was missing the `subscriptions` table and had no RLS policies.

**LOW**
16. README was minimal — no setup instructions for new contributors.
17. No deployment checklist.
18. Smoke test was basic — didn't cover Razorpay demo flow or rate limiting.

---

## Phase 2 — File Organization

### New structure created

```
config/          (3 files)  — env.js, plans.js, supabase.js
controllers/     (8 files)  — auth, generate, schedule, analytics, plan, feedback, razorpay, health
routes/          (9 files)  — index.js + 8 thin re-export modules
services/        (4 files)  — ai-service, razorpay-service, storage-service, user-normalizer
middleware/      (5 files)  — auth, validate, error-handler, rate-limits, asyncHandler
utils/           (3 files)  — helpers, validators, logger
scripts/         (1 file)   — migrate-json-to-supabase.js
scripts/_archive/ (1 dir)   — original lib/ preserved as backup
```

### Files moved

| Old path | New path | Notes |
|---|---|---|
| `lib/supabase.js` | `config/supabase.js` | Rewritten as lazy client factory |
| `lib/supabaseHelpers.js` | `services/storage-service.js` | Merged with v9's inline JSON helpers into a unified storage abstraction |
| `lib/` (entire folder) | `scripts/_archive/lib-original-v9/` | Preserved as backup; not loaded by v10 |
| (new) `server.js` logic split | `routes/` + `controllers/` + `services/` + `middleware/` | 715-line monolith → ~100-line bootstrap |

### API contract preserved

Every v9 endpoint still responds at the same path with the same request/response shape. Frontend HTML files were NOT modified (except `app.js` which got the new `emptyState()` / `errorState()` helpers and better error messages — purely additive, no breaking changes).

---

## Phase 3 — Deletions

See `docs/DELETION_LOG.md` for the full table. Summary:
- 0 files deleted outright.
- 2 files moved to `scripts/_archive/` (the original `lib/` directory) — preserved as backup, not loaded.
- 0 confirmed-duplicate HTML/CSS/JS files found in `/public`.

---

## Phase 4 — Code Fixes

| File | Bug | Fix |
|---|---|---|
| `server.js` (v9) | 715-line monolith mixing routing + business logic + storage + AI + auth | Split into `routes/` + `controllers/` + `services/` + `middleware/`. New `server.js` is ~100 lines. |
| `server.js` (v9) | Manual `.env` parser | Use `dotenv` package (with manual fallback) |
| `server.js` (v9) | No timeout on AI calls | Added 30s timeout via `Promise.race` in `ai-service.js` |
| `server.js` (v9) | No retry on AI failures | Added 3-attempt exponential backoff (1s, 2s, 4s) |
| `server.js` (v9) | No automatic AI fallback | Provider chain: primary → other configured → mock |
| `server.js` (v9) | No webhook endpoint | Added `POST /api/razorpay/webhook` with raw body + HMAC verification |
| `server.js` (v9) | No rate limiting | Added 3 policies: global, auth, AI (per-plan) |
| `server.js` (v9) | No input validation | Added Zod schemas + `validate()` middleware for every body |
| `server.js` (v9) | No centralized error handler | Added `errorHandler` + `notFound` middleware |
| `server.js` (v9) | No graceful shutdown | Added SIGTERM/SIGINT handlers with 10s drain timeout |
| `server.js` (v9) | No startup guards | Refuses to boot in prod if `AI_PROVIDER=mock` or `SESSION_SECRET` is default |
| `server.js` (v9) | No `/api/ai/health` endpoint | Added — pings each configured provider |
| `lib/supabaseHelpers.js` (v9) | Dead code — nothing required it | Archived; logic merged into `services/storage-service.js` |
| `docs/SUPABASE_SCHEMA.sql` (v9) | Missing `subscriptions` table, no RLS, no triggers | Rewrote with all 6 tables, RLS policies, `updated_at` trigger |
| `package.json` (v9) | Zero dependencies declared | Added express, helmet, cors, cookie-parser, express-rate-limit, zod, dotenv, @supabase/supabase-js, razorpay |
| `public/app.js` (v9) | Raw error messages shown to user | Added friendly messages for 401/402/403/429/500 |
| `public/app.js` (v9) | No empty/error state helpers | Added `emptyState()` + `errorState()` |
| `tests/smoke-test.js` (v9) | Basic — didn't cover Razorpay demo, rate limit, Zod | Expanded to 28 assertions covering every flow |

---

## Phase 5 — Real User Testing

All flows verified by the smoke test (`npm run smoke` — 28/28 passing):

1. ✅ Open website — homepage loads
2. ✅ Signup — validation works, duplicate email rejected (409), account created, session cookie set
3. ✅ Login — correct credentials work, wrong password rejected (401), Zod validation rejects bad input (400)
4. ✅ Dashboard — user data loads via `/api/me`
5. ✅ AI Generation — returns titles, captions, hashtags, keywords, description, CTA, thumbnail, postingTip, improvementSuggestion, whyThisWorks. Credits decremented.
6. ✅ History — saved generations visible
7. ✅ Scheduling — create + list works
8. ✅ Analytics — totalGenerations, totalSchedules, last30Days stats
9. ✅ Pricing — plans display, Razorpay create-order works, verify-payment (demo mode) upgrades user plan + credits
10. ✅ Rate limiting — 8 rapid failed logins trigger 429
11. ✅ Logout — clears session cookie

---

## Phase 6 — AI Hardening

- Provider chain order: `OpenAI` → `Gemini` → `Grok` (if configured) → `mock` (always last)
- Timeout: 30 seconds per provider (`AI_TIMEOUT_MS`)
- Retry: 3 attempts with exponential backoff (1s, 2s, 4s) — `AI_MAX_RETRIES`
- `/api/ai/health` endpoint pings each configured provider
- User-friendly error messages — never exposes raw API errors
- Production startup guard: refuses to boot if `AI_PROVIDER=mock` in production

---

## Phase 7 — Database Migration (Supabase)

- `docs/SUPABASE_SCHEMA.sql` rewritten with 6 tables: `users`, `generations`, `schedules`, `feedback`, `payments`, `subscriptions`
- RLS enabled on every table with `auth.uid() = user_id` policies
- `updated_at` trigger added for `users` and `subscriptions`
- `services/storage-service.js` auto-detects Supabase via `getClients().enabled` and falls back to JSON files in dev
- `scripts/migrate-json-to-supabase.js` is idempotent (skips rows whose IDs already exist)
- Migration not run during this refactor (no Supabase project configured) — but verified that fallback to JSON files works correctly (smoke test passed with `database: json-file`)

---

## Phase 8 — Razorpay Integration

- `services/razorpay-service.js`:
  - `createOrder(plan, userId)` — calls Razorpay `orders.create` API, falls back to mock order in demo mode
  - `verifyPaymentSignature({orderId, paymentId, signature})` — HMAC-SHA256 verification, auto-succeeds in demo mode
  - `verifyWebhookSignature(rawBody, signature)` — HMAC-SHA256 of raw body
  - `parseWebhookEvent(payload)` — normalizes Razorpay event payloads
- `controllers/razorpay-controller.js`:
  - `POST /api/create-order` — creates order, persists payment record
  - `POST /api/verify-payment` — verifies signature, upgrades user plan + credits
  - `POST /api/razorpay/webhook` — raw body, signature-verified, handles `payment.captured`, `payment.failed`, `subscription.activated`, `subscription.cancelled`
- Webhook route registered BEFORE `express.json()` so it gets the raw Buffer
- Demo mode (no Razorpay keys) auto-succeeds verification so local dev flow works
- Tested: smoke test creates order, verifies payment, confirms user upgraded to `creator` plan with 100 credits

---

## Phase 9 — Security

- `helmet()` — sets HSTS, CSP, X-Frame-Options, X-Content-Type-Options, etc.
- `cors()` — configurable via `ALLOWED_ORIGINS` env var
- `cookie-parser` — properly parses session cookies
- Rate limits:
  - Global: 100 req / 15 min / IP
  - Auth (login/signup): 5 req / 15 min / IP
  - AI generation: 20/hr free, 100/hr creator, 500/hr business, 2500/hr agency
- Zod validation on every request body — `validate(schema)` middleware
- Passwords hashed with PBKDF2 (120k rounds, sha512, 64 bytes)
- Session cookies: `HttpOnly`, `SameSite=Lax`, `Secure` in production
- Service role key NEVER exposed to frontend
- `.env` in `.gitignore` (verified)
- `.env.example` has no real keys (verified)
- Tested: 8 rapid failed logins → 429 (rate limit works)

---

## Phase 10 — Deployment Readiness

- `package.json` scripts: `start`, `dev`, `check`, `migrate`, `smoke`, `test`
- `/api/health` endpoint returns: app name, version, env, AI provider, database backend, Razorpay status, uptime, timestamp
- Graceful shutdown: SIGTERM/SIGINT handlers drain connections, force-exit after 10s
- Production startup guards: refuse to boot if `AI_PROVIDER=mock` or `SESSION_SECRET` is default in production
- `.gitignore` updated: ignores `_archive/`, `scripts/_archive/`, `*.log`, `data/*.json`
- `README.md` rewritten with full setup + structure + API reference + deployment
- `docs/DEPLOYMENT_CHECKLIST.md` — 9-section pre-launch checklist (env, database, Razorpay, security, AI, monitoring, domain, smoke test, post-launch)

---

## Phase 11 — Final Test

```
$ npm run check    # ✅ syntax check passes
$ npm run smoke    # ✅ 28/28 assertions passing
$ NODE_ENV=production AI_PROVIDER=mock node server.js
[FATAL] AI_PROVIDER=mock in production. Refusing to start.
$ NODE_ENV=production AI_PROVIDER=openai SESSION_SECRET=dev-only-secret-change-me node server.js
[FATAL] SESSION_SECRET is the default dev value in production. Refusing to start.
```

All checks pass. App is ready for Supabase + Razorpay + OpenAI configuration and deployment.
