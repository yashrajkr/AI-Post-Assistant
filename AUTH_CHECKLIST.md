# Auth Checklist

Everything the code needs from third-party dashboards to actually work in
production. None of this can be done from the codebase — it's config in
Google Cloud, Supabase, Vercel, and Render's own consoles.

## Google Cloud Console

- [ ] OAuth consent screen configured (app name, support email, scopes
      `email`/`profile`/`openid`)
- [ ] OAuth Client ID created, type **Web application**
- [ ] Authorized JavaScript origins include:
  - [ ] `http://localhost:3001`
  - [ ] `https://<your-production-frontend>.vercel.app`
- [ ] Authorized redirect URIs include **only**:
  - [ ] `https://<your-project-ref>.supabase.co/auth/v1/callback`
  - ⚠️ Do **not** add your app's own `/auth/callback` here — that's wrong
    for this flow (see `GOOGLE_SETUP.md`).
- [ ] Client ID + Client Secret copied into Supabase (not into this repo's
      env vars — the backend no longer uses them)

## Supabase Dashboard

- [ ] Project created, region noted
- [ ] `docs/SUPABASE_SCHEMA.sql` (new project) or
      `docs/migrations/002_supabase_auth_migration.sql` (existing project)
      run in SQL Editor
- [ ] Authentication -> Providers -> **Email** enabled, "Confirm email" ON
- [ ] Authentication -> Providers -> **Google** enabled with Client ID/Secret
      from Google Cloud Console (skip if not offering Google login)
- [ ] Authentication -> URL Configuration -> **Site URL** = production
      frontend URL
- [ ] Authentication -> URL Configuration -> **Redirect URLs** includes,
      for every environment you use:
  - [ ] `http://localhost:3001/auth/callback`
  - [ ] `http://localhost:3001/reset-password`
  - [ ] `https://<your-frontend>.vercel.app/auth/callback`
  - [ ] `https://<your-frontend>.vercel.app/reset-password`
- [ ] Table Editor -> `users` table exists with `id` referencing
      `auth.users(id)`, and the `on_auth_user_created` trigger exists
      (Database -> Triggers)
- [ ] Project Settings -> API: `anon` key and `service_role` key copied
      (service_role goes **only** to Render, never to Vercel)

## Vercel (frontend)

- [ ] Project imported, framework detected as Vite
- [ ] Environment variables set (Production **and** Preview if you use
      preview deployments):
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_API_URL` = real Render backend URL
- [ ] `frontend/vercel.json` rewrite destination updated from the
      placeholder to the real Render backend URL
- [ ] No `localhost` left in any env var actually used by the deployed site

## Render (backend)

- [ ] Service deployed (via `render.yaml` Blueprint or manual web service)
- [ ] Health check path `/api/health` returns 200
- [ ] Environment variables set:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `AI_PROVIDER` set to a real provider (`openai`/`gemini`/`grok`) —
        **not** `mock` (the app refuses to boot in production with `mock`)
  - [ ] Matching `*_API_KEY` for whichever `AI_PROVIDER` you chose
  - [ ] `ALLOWED_ORIGINS` = real Vercel frontend URL (not `*` in production)
  - [ ] `FRONTEND_URL` = real Vercel frontend URL
  - [ ] `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`
        if accepting payments
- [ ] `NODE_ENV=production` set

## Post-deploy smoke test (do this for real, in a browser)

- [ ] Sign up with a real email → verification email arrives → clicking it
      logs you in and lands on `/dashboard`
- [ ] Log out → redirected/land on a public page, `/dashboard` now
      redirects to `/login`
- [ ] Log back in with email/password
- [ ] "Continue with Google" → consent screen → lands on `/dashboard`
- [ ] Refresh the page while logged in → still logged in (no flash to
      `/login`)
- [ ] Close and reopen the browser → still logged in
- [ ] "Forgot password" → email arrives → reset link lets you set a new
      password → log in with it
- [ ] Chrome extension: generate an API key from `/api-keys`, confirm the
      extension can call the backend with it (unrelated to Supabase Auth —
      verifies the two auth paths don't interfere with each other)
