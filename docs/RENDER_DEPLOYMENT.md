# Render Deployment (Backend)

> ⚠️ Env var list below may reference the removed `SESSION_SECRET`/
> `GOOGLE_CLIENT_ID` vars — see `render.yaml` and `/AUTH_CHECKLIST.md` for
> the current, accurate list.

The root of this repo (`server.js` and friends) is a standalone Express API.
It's meant to run on Render (or any Node host / Docker platform) completely
independently of the Next.js frontend.

## Option A — One-click Blueprint (`render.yaml`)

1. Push this project to GitHub.
2. <https://dashboard.render.com> → **New → Blueprint**.
3. Point it at your repo. Render reads `render.yaml` at the repo root and
   proposes the `ai-post-assistant-backend` web service automatically.
4. Before clicking Apply, note the placeholder values in `render.yaml` you
   should update either in the file or after deploy in the dashboard:
   - `ALLOWED_ORIGINS` → your real Vercel frontend URL (exact match, no
     trailing slash). The Chrome extension does **not** need to be listed
     here — it's allowed separately via `ALLOW_EXTENSION_ORIGIN=true`
     (already set in `render.yaml`), which lets any `chrome-extension://`
     origin through regardless of extension ID.
   - `GOOGLE_REDIRECT_URI` / `FRONTEND_URL` → your real URLs, once known
   - Any `sync: false` key (`OPENAI_API_KEY`, `SUPABASE_*`,
     `RAZORPAY_*`, `GOOGLE_CLIENT_*`) → fill in manually in the Render
     dashboard after the service is created (these are intentionally not
     stored in the repo).
5. Apply. Render builds with `npm install` and starts with `npm start`.

## Option B — Manual Web Service

1. Dashboard → **New → Web Service** → connect your repo.
2. **Root Directory**: leave blank (the backend lives at the repo root),
   or set it explicitly if your repo layout differs.
3. **Runtime**: Node
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Health Check Path**: `/api/health`
7. Add the same environment variables as in `render.yaml` (see `.env.example`
   for the full list with comments).

## Option C — Docker

Render also supports deploying straight from the included `Dockerfile`:

1. New → Web Service → connect repo → Render auto-detects the `Dockerfile`.
2. Same environment variables as above.
3. The Dockerfile runs as a non-root `node` user and exposes a container
   `HEALTHCHECK` against `/api/health`.

## Required environment variables (minimum to boot)

```env
NODE_ENV=production
SESSION_SECRET=          # Render can auto-generate this (see render.yaml)
AI_PROVIDER=mock          # or openai / gemini / grok, with the matching key set
ALLOWED_ORIGINS=https://your-frontend.vercel.app,chrome-extension://*
```

Everything else (Supabase, Razorpay, Google OAuth) is optional — the app
boots and runs fully in demo/mock mode without them, and `config/env.js`
prints clear startup warnings for whatever is missing.

## Production startup guard

With `NODE_ENV=production`, `config/env.js` will **refuse to boot** (not
just warn) if:
- `SESSION_SECRET` is still a placeholder value, or
- `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are missing while Razorpay is
  expected to be live.

This is intentional — it's better to fail loudly at deploy time than to
silently run production traffic through demo-mode payments or a guessable
session secret.

## After deploying

1. Copy the Render URL (e.g. `https://ai-post-assistant-backend.onrender.com`).
2. Set it as `NEXT_PUBLIC_API_URL` on Vercel (see `VERCEL_DEPLOYMENT.md`).
3. Update `GOOGLE_REDIRECT_URI` (this backend URL + `/api/auth/google/callback`)
   in both this service's env vars and your Google Cloud OAuth client's
   Authorized Redirect URIs.
4. Update `FRONTEND_URL` to your real Vercel URL.
5. Hit `https://your-backend.onrender.com/api/health` — should return
   `{"success":true,...}`.
6. Run `npm run smoke` locally against the deployed URL if you want to
   sanity-check the deployed API (point `BASE_URL` in the smoke test's env
   at your Render URL, or run it locally against `localhost` as usual — the
   included smoke test defaults to `localhost`).

## Free-tier note

Render's free plan spins the service down after inactivity — the first
request after idling will be slow (cold start, ~30–60s). This is fine for
testing but not for a production launch; upgrade to the `starter` plan
(commented in `render.yaml`) before real users depend on it.

## Troubleshooting

| Symptom | Fix |
|---|---|
| CORS errors from the frontend | `ALLOWED_ORIGINS` doesn't include the exact Vercel URL (must match scheme + host, no trailing slash) |
| Chrome extension gets CORS/network errors | Confirm `ALLOW_EXTENSION_ORIGIN=true` is set (it's in `render.yaml` by default) — this, not `ALLOWED_ORIGINS`, is what admits `chrome-extension://` origins |
| Server won't boot in production | Check the Render logs for the `startupGuard` fatal error — it names exactly which env var is missing |
| Payments always "demo mode" | `RAZORPAY_KEY_ID` must start with `rzp_` and both key/secret must be set |
