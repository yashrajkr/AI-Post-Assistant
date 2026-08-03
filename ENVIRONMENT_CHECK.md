# Environment Check

Every environment variable the code actually reads (grepped from
`config/env.js` and `frontend/src/**`), whether the repo's `.env.example`
files declare it correctly, and whether a value is required for the app to
work. This is a **static check** — it verifies the variable is *wired up*
correctly in code, not that you've filled in a real value yet. Run
`node server.js` and watch the startup warnings for the latter.

## Backend (`.env`, Render dashboard)

| Variable | In `.env.example`? | Required in prod? | Notes |
|---|---|---|---|
| `PORT` | ✓ (implicit — Render injects it) | No | `config/env.js` defaults to 3000. Render sets this automatically — never hardcode it. |
| `APP_NAME` | ✗ | No | Cosmetic only, defaults to "PostReady AI". |
| `NODE_ENV` | ✓ | Yes | Must be `production` in prod — gates `startupGuard()`. |
| `ALLOWED_ORIGINS` | ✓ | Yes | Defaults to `*`. **Must** be your real Vercel URL in production (⚠ see Security Report — CORS). |
| `ALLOW_EXTENSION_ORIGIN` | ✗ | No | Defaults `true`; allows `chrome-extension://*`. |
| `AI_PROVIDER` | ✓ | Yes | `openai`/`gemini`/`grok`. `mock` is **blocked** in production by `startupGuard()`. |
| `AI_TIMEOUT_MS` / `AI_MAX_RETRIES` | ✓ | No | Sensible defaults. |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | ✓ | If `AI_PROVIDER=openai` | |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | ✓ | If `AI_PROVIDER=gemini` | |
| `GROK_API_KEY` / `GROK_MODEL` | ✓ | If `AI_PROVIDER=grok` | Used in `services/ai-service.js`. |
| `SUPABASE_URL` | ✓ | **Yes, always** | Required for both auth and storage now — no fallback. |
| `SUPABASE_ANON_KEY` | ✓ | **Yes, always** | Read but not currently used for anything privileged server-side (kept for parity/future use). |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | **Yes, always** | Used to verify auth tokens (`getSupabaseUserFromToken`) and for all DB reads/writes. **Never** put this in a frontend env var. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | ✓ | For payments | Demo mode (no real charges) if unset. |
| `RAZORPAY_WEBHOOK_SECRET` | ✓ | For payments | Webhook signature check is skipped (with a warning) if unset — don't ship like that. |
| `SENTRY_DSN` | ✓ | No | Optional error tracking. |
| `FRONTEND_URL` | ✓ | No (was required for the old Google OAuth redirect flow; that flow is gone) | Still declared for any future email-link/redirect use. |

Removed (present in old `.env.example`/`render.yaml`, no longer read by any
code — confirmed by grep):
- ~~`SESSION_SECRET`~~ — was the HMAC secret for the custom session token; deleted along with that system.
- ~~`GOOGLE_CLIENT_ID`~~ / ~~`GOOGLE_CLIENT_SECRET`~~ / ~~`GOOGLE_REDIRECT_URI`~~ — Google OAuth is configured in the Supabase Dashboard now, not as backend env vars.

## Frontend (`frontend/.env.local`, Vercel dashboard)

| Variable | In `.env.example`? | Required in prod? | Notes |
|---|---|---|---|
| `VITE_API_URL` | ✓ | Recommended | Backend base URL. Empty string relies on Vite's dev proxy — fine locally, **must** be set in production or the app calls its own origin for `/api/*`. |
| `VITE_SUPABASE_URL` | ✓ | **Yes** | Read in `frontend/src/lib/supabaseClient.ts`. App logs a console error and auth silently fails if missing (`supabaseConfigured` flag). |
| `VITE_SUPABASE_ANON_KEY` | ✓ | **Yes** | Same file. Safe to expose — it's the public key. |

Confirmed by grep: **no** `SUPABASE_SERVICE_ROLE_KEY` (or any service-role
value) appears anywhere under `frontend/`.

## Chrome extension

No Supabase env vars at all — it authenticates with a long-lived API key
entered by the user in the extension's options page (`chrome-extension/src/lib/storage.ts`),
unrelated to this environment-variable set.

## Legend
- ✓ = declared in the relevant `.env.example` with a comment
- ✗ = not declared (either intentionally cosmetic/optional, or newly removed)
