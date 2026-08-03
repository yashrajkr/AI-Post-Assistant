# Supabase Setup

## 1. Create a project

https://supabase.com -> New project. Pick a region close to your users
(this app defaults to `singapore` in `render.yaml` — pick the matching
Supabase region for lowest latency).

## 2. Run the schema

Dashboard -> SQL Editor -> New query:

- **New project**: run `docs/SUPABASE_SCHEMA.sql` in full.
- **Existing project upgrading from the old password-based auth**: run
  `docs/migrations/002_supabase_auth_migration.sql` instead (it alters the
  existing `users` table in place, adds the auto-profile trigger, and
  enables RLS — safe/idempotent to re-run).

This creates `users`, `generations`, `schedules`, `feedback`, `payments`,
`api_keys`, and the rest of the app tables, plus (via the migration file) a
trigger that auto-creates a `public.users` row whenever someone signs up
through Supabase Auth.

## 3. Enable email auth

Authentication -> Providers -> **Email** should already be enabled by
default. Recommended settings (Authentication -> Providers -> Email):
- **Confirm email**: ON (users must click a verification link before they
  can log in) — this is what makes `docs`'s "Email Verification"
  requirement actually happen.
- Customize the confirmation/reset-password email templates under
  Authentication -> Email Templates if you want your own branding; the
  default templates work fine to start.

## 4. Enable Google auth (optional but requested)

See `GOOGLE_SETUP.md` for the full walkthrough — it's a two-way handshake
between Google Cloud Console and the Supabase Dashboard.

## 5. URL configuration

Authentication -> URL Configuration:
- **Site URL**: your production frontend origin.
- **Redirect URLs**: add `<origin>/auth/callback` and `<origin>/reset-password`
  for every environment (localhost, Vercel preview URLs if you use them,
  production).

## 6. Get your keys

Project Settings -> API:

| Key | Goes in | Notes |
|---|---|---|
| Project URL | `SUPABASE_URL` (backend) and `VITE_SUPABASE_URL` (frontend) | Same value both places |
| `anon` `public` key | `SUPABASE_ANON_KEY` (backend) and `VITE_SUPABASE_ANON_KEY` (frontend) | Safe to expose to the browser |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` (backend **only**) | **Never** put this in frontend env vars, a Vercel build, or a Chrome extension — it bypasses Row Level Security entirely |

## 7. Row Level Security

`docs/migrations/002_supabase_auth_migration.sql` enables RLS on `users`
with policies so a user can only select/update their own row. The backend
uses the service-role key (which bypasses RLS) for everything, so this
matters only if you ever query Supabase directly from the frontend with
the anon key — worth keeping enabled regardless as defense in depth.

## 8. Verifying it worked

```bash
# Backend should log this on boot once SUPABASE_* is set:
#   Database: supabase
# (not "json-file (dev only)")
npm run dev
```

Then sign up through the frontend and confirm a row appears in
Table Editor -> `users` with your email, `plan = free`, `credits = 10`.
