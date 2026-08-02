# AI Post Assistant v16 (Final Build — "ff")

Production-hardened SaaS for content creators — an **AI Content Operating System** with 7+ feature modules.

Built on Node.js + Express + Supabase + Razorpay + OpenAI/Gemini, with a premium **Vite + React + TypeScript + Tailwind CSS 3** frontend (redesigned UI from `postreadyai-main`, ported over from the previous Next.js UI of v16).

**What's included:**
- `/` — v16 backend (Express API on port 3000) — production-ready, full feature set
- `/frontend` — Vite + React + TS UI (port 3001) — 17 app pages + 5 public pages (landing, login, signup, privacy, terms) + 404
- `/chrome-extension` — MV3 Chrome extension (TypeScript + Vite)
- `/docs` — Architecture, audit, deployment, schema, legal references
- `/prompt3-preview.html` — Interactive preview of all 7 feature modules

## What's new in this build ("ff")

The previous v16 shipped a Next.js 14 frontend. This build **replaces that frontend with the new Vite + React UI** you provided, and re-implements every missing feature on top of the new UI so it is production-ready:

| Feature | Status |
|---|---|
| New Vite + React + TS + Tailwind UI | ✅ Replaces Next.js frontend |
| Landing page (`/`) | ✅ Ported from v16 (hero, features, testimonials, FAQ, CTA, footer) |
| Login page (`/login`) | ✅ Email + Google OAuth, password show/hide |
| Signup page (`/signup`) | ✅ Email + Google OAuth, password strength meter, 10 free credits |
| Privacy Policy (`/privacy`) | ✅ Full policy ported from v16 |
| Terms of Service (`/terms`) | ✅ Full terms ported from v16 |
| 404 page (`*`) | ✅ Custom branded 404 |
| Auth gate | ✅ Unauthenticated users redirected to `/login` (with return-to path) |
| AuthProvider + useAuth | ✅ React Context, hits `/api/me` on mount |
| Toast system | ✅ Custom ToastProvider (success / error / info) |
| Logout | ✅ Wired to `POST /api/logout` |
| Real API integration | ✅ All key pages (Dashboard, Generate, History, ApiKeys, Profile, Pricing, Memory, Schedule, BrandBrain, Prompts, Analytics) call the Express backend via `src/lib/api.ts` |
| Mock data fallback | ✅ Falls back to mock data if backend is unreachable (e.g. UI-only review) |
| Vite dev proxy | ✅ `/api` → `http://localhost:3000` so cookies work without CORS in dev |
| TypeScript strict | ✅ Type-check passes |
| ESLint | ✅ Lint passes |

## Feature modules

1. **AI Brand Brain** — Teach AI your tone/audience/CTA once. Every generation matches your voice.
2. **AI Content Score** — Score every post on Hook/SEO/CTA/Readability/Virality/Emotion. AI suggests improvements.
3. **AI Memory** — Remembers your past hashtags, tones, niches. Avoids duplicates.
4. **Prompt Library** — Save/reuse prompts. 12 starter prompts included. Rate and share.
5. **Image Understanding** — Upload any image. AI returns caption, alt text, hashtags, CTA.
6. **AI Repurposer** — One input → 6 platform-optimized outputs.
7. **Multi-Platform Generation** — Generate for all platforms at once with tabbed output.
8. **Content Calendar** — AI generates a multi-day content plan.
9. **Campaign Builder** — AI generates a multi-post campaign around a theme.
10. **Document → Content** — Upload PDF/TXT, AI generates content from extracted text.
11. **Brand Health** — Dashboard showing consistency, tone, frequency, engagement.
12. **API Keys** — Generate/revoke keys for the Chrome extension.
13. **Schedules** — Plan and track upcoming posts.
14. **Analytics** — Usage breakdowns by platform, niche, provider.
15. **Razorpay** — Subscription checkout (Creator / Pro / Team plans).
16. **Google OAuth** — "Continue with Google" login.
17. **Chrome Extension** — Generate from any web page (right-click → generate).

## Quick start (backend)

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in real values
cp .env.example .env
#   → at minimum set AI_PROVIDER=openai + OPENAI_API_KEY

# 3. (Optional) Run Supabase migration
#    Create a Supabase project, run docs/SUPABASE_SCHEMA.sql in SQL editor,
#    then set SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in .env
npm run migrate

# 4. Start the server
npm start
#   → open http://localhost:3000
```

## Project structure

```
AI Post Assistant/
├── server.js                  # Bootstrap (~100 lines, no business logic)
├── config/
│   ├── env.js                 # Single source of truth for env vars + startup guards
│   ├── plans.js               # Subscription plans + Razorpay plan IDs
│   └── supabase.js            # Lazy Supabase client factory
├── controllers/               # Route handlers (business logic)
│   ├── auth-controller.js
│   ├── generate-controller.js
│   ├── schedule-controller.js
│   ├── analytics-controller.js
│   ├── plan-controller.js
│   ├── feedback-controller.js
│   ├── razorpay-controller.js
│   └── health-controller.js
├── routes/                    # Express route mounting
│   ├── index.js               # Mounts all routes
│   └── *.js                   # Re-exports controllers for clean separation
├── services/                  # External integrations
│   ├── ai-service.js          # OpenAI → Gemini → mock chain + retry + timeout
│   ├── razorpay-service.js    # Order + verify + webhook signature
│   ├── storage-service.js     # Supabase or JSON file fallback
│   └── user-normalizer.js
├── middleware/
│   ├── auth.js                # requireAuth, requirePlan, requireCredits, attachUser
│   ├── validate.js            # Zod schema validator
│   ├── error-handler.js       # Centralized error + 404 handler
│   ├── rate-limits.js         # Global + auth + AI rate limiters
│   └── asyncHandler.js
├── utils/
│   ├── helpers.js             # passwordHash, signSession, publicUser, etc.
│   ├── validators.js          # Zod schemas for every request body
│   └── logger.js
├── scripts/
│   ├── migrate-json-to-supabase.js   # One-time migration
│   └── _archive/                     # Old v9 lib/ preserved as backup
├── public/                    # Vanilla HTML/CSS/JS frontend
│   ├── index.html, login.html, signup.html
│   ├── dashboard.html, generate.html, pricing.html
│   ├── schedule.html, analytics.html, profile.html
│   ├── app.js                 # Shared frontend helpers (loading/error/empty states)
│   └── style.css
├── tests/
│   └── smoke-test.js          # End-to-end API test
├── docs/
│   ├── SUPABASE_SCHEMA.sql    # Run in Supabase SQL editor
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── AUDIT_REPORT.md        # Phase-by-phase audit log
│   ├── FINAL_REPORT.md        # Final summary + readiness score
│   └── DELETION_LOG.md        # Files removed/archived and why
├── data/                      # Local JSON storage (dev only — gitignored)
├── .env.example
├── .gitignore
└── package.json
```

## API reference

| Method | Path                        | Auth | Description                                  |
|--------|-----------------------------|------|----------------------------------------------|
| GET    | /api/health                 | No   | App + AI provider + DB health                |
| GET    | /api/ai/health              | No   | Per-provider AI ping                         |
| GET    | /api/plans                  | No   | List subscription plans                      |
| GET    | /api/templates              | No   | List post templates                          |
| POST   | /api/signup                 | No   | Create account (rate-limited 5/15min)        |
| POST   | /api/login                  | No   | Login (rate-limited 5/15min)                 |
| POST   | /api/logout                 | No   | Clear session                                |
| GET    | /api/me                     | Yes  | Current user                                 |
| POST   | /api/profile                | Yes  | Update name + brand voice                    |
| POST   | /api/upgrade                | Yes  | Manual plan upgrade (admin/test)             |
| POST   | /api/generate               | Yes  | Generate content (rate-limited per plan)     |
| GET    | /api/history                | Yes  | Last 100 generations                         |
| POST   | /api/feedback               | Yes  | Submit feedback                              |
| POST   | /api/schedules              | Yes  | Create scheduled post                        |
| GET    | /api/schedules              | Yes  | List user's schedules                        |
| GET    | /api/analytics              | Yes  | Usage analytics                              |
| POST   | /api/create-order           | Yes  | Create Razorpay order (demo mode if no keys) |
| POST   | /api/verify-payment         | Yes  | Verify payment signature, upgrade plan       |
| POST   | /api/razorpay/webhook       | Raw  | Razorpay webhook (signature verified)        |

## Environment variables

See `.env.example` for the full list with comments. Critical ones:

| Variable                  | Required in prod | Purpose                                |
|---------------------------|------------------|----------------------------------------|
| `SESSION_SECRET`          | Yes              | HMAC secret for session cookies        |
| `AI_PROVIDER`             | Yes              | `openai`, `gemini`, `grok`, or `mock`  |
| `OPENAI_API_KEY`          | If `openai`      | OpenAI API key                         |
| `GEMINI_API_KEY`          | If `gemini`      | Gemini API key                         |
| `SUPABASE_URL`            | Recommended      | Supabase project URL                   |
| `SUPABASE_ANON_KEY`       | Recommended      | Supabase anon key                      |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended    | Supabase service role key (server only)|
| `RAZORPAY_KEY_ID`         | For payments     | Razorpay key ID                        |
| `RAZORPAY_KEY_SECRET`     | For payments     | Razorpay key secret                    |
| `RAZORPAY_WEBHOOK_SECRET` | For webhooks     | Razorpay webhook secret                |

## Deployment (Render)

1. Push to GitHub.
2. Render → New → Web Service → connect repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add every env var from `.env.example` with production values.
6. Set `NODE_ENV=production`.
7. **Never** set `AI_PROVIDER=mock` in production — the app refuses to boot.
8. Add a custom domain + enable SSL.
9. Add the webhook URL `https://yourdomain.com/api/razorpay/webhook` in Razorpay dashboard.

See `docs/DEPLOYMENT_CHECKLIST.md` for the full pre-launch checklist.

## Testing

```bash
npm run check    # Syntax check
npm run smoke    # End-to-end API test (boots a server on port 3099)
npm test         # Both
```

## License

MIT © Yashraj
