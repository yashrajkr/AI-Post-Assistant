# Deployment — Vercel (frontend) + Render (backend) + Supabase (auth/db)

For the exact per-dashboard checkboxes, see `AUTH_CHECKLIST.md`. This file
covers the deploy steps end to end.

## Order of operations

Deploy in this order — each step needs a URL produced by the previous one.

1. **Supabase** — create project, run schema, note the project URL + keys
   (`SUPABASE_SETUP.md`).
2. **Render (backend)** — deploy with placeholder `ALLOWED_ORIGINS`/
   `FRONTEND_URL`, get the Render URL.
3. **Vercel (frontend)** — deploy with `VITE_API_URL` pointing at the Render
   URL from step 2, get the Vercel URL.
4. **Go back to Render** — update `ALLOWED_ORIGINS` and `FRONTEND_URL` to
   the real Vercel URL from step 3, redeploy.
5. **Supabase Auth URL config** — add the real Vercel URL's
   `/auth/callback` and `/reset-password` to the Redirect URLs allow list
   (`GOOGLE_SETUP.md` step 3).
6. **Google Cloud Console** (if using Google login) — add the real Vercel
   URL to Authorized JavaScript origins.

## Render (backend)

- One-click: `render.yaml` (Blueprint deploy) is already configured with
  the right build/start commands and health check path (`/api/health`).
- Required env vars (Render dashboard, since `sync: false` in `render.yaml`
  means "set me manually"):
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY` and/or `GEMINI_API_KEY` and/or `GROK_API_KEY`
    (matching whichever `AI_PROVIDER` you set)
  - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (if
    accepting payments)
- Set after the frontend is deployed: `ALLOWED_ORIGINS` and `FRONTEND_URL`
  to your real Vercel URL.
- `PORT` is provided by Render automatically — `server.js` reads
  `process.env.PORT` (via `config/env.js`), don't hardcode it.
- The app **refuses to boot in production** (`startupGuard()` in
  `config/env.js`) if Supabase keys or a real `AI_PROVIDER` are missing —
  this is intentional, it's better than silently running broken.

## Vercel (frontend)

- Framework preset: Vite (already set in `frontend/vercel.json`).
- Required env vars (Vercel Project Settings -> Environment Variables):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL` — your Render backend URL (or leave the `vercel.json`
    rewrite in place and point it at the same place; update the
    hardcoded rewrite destination in `frontend/vercel.json` to your real
    Render URL before deploying)
- No `localhost` references should reach production — check
  `VITE_API_URL` and the `frontend/vercel.json` rewrite destination both
  point at the real Render URL, not `localhost:3000`.

## Supabase

- Auth URL Configuration must list your **production** Vercel URL's
  `/auth/callback` and `/reset-password` — see `GOOGLE_SETUP.md` /
  `SUPABASE_SETUP.md`. This is the single most common "works locally,
  broken in prod" bug for Supabase Auth.
- Site URL should be the production frontend URL.

## Sanity checks after deploying

```bash
curl https://your-backend.onrender.com/api/health
# {"success":true,...,"database":"supabase",...}

curl https://your-backend.onrender.com/api/me
# {"success":false,"message":"Unauthorized..."}  <- expected without a token
```

Then, in a real browser against the production URLs: sign up with email,
confirm the verification email arrives and its link logs you in, log out,
log back in, refresh the page (should stay logged in), and try "Continue
with Google" end to end.
