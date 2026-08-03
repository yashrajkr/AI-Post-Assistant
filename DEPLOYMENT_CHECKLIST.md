# Deployment Checklist

Auth-specific dashboard configuration (Google Cloud / Supabase / Vercel /
Render) lives in `AUTH_CHECKLIST.md` — this file is the broader
go-live list covering the rest of the stack (Razorpay, general deploy
hygiene). Do both before calling this production-ready.

## Google Cloud
See `AUTH_CHECKLIST.md` → Google Cloud Console section.

## Supabase
See `AUTH_CHECKLIST.md` → Supabase Dashboard section.

## Vercel (frontend)
See `AUTH_CHECKLIST.md` → Vercel section, plus:
- [ ] Custom domain attached (if any) and HTTPS enforced
- [ ] Build succeeds with `npm run build` locally before pushing
      (`cd frontend && npm run typecheck && npm run build`)

## Render (backend)
See `AUTH_CHECKLIST.md` → Render section, plus:
- [ ] Plan upgraded from `free` if you need the service to not sleep
      (`render.yaml` defaults to `free`)
- [ ] `npm run check && npm run smoke` passes locally before deploying

## Razorpay
- [ ] Live mode API keys (not test keys) in `RAZORPAY_KEY_ID` /
      `RAZORPAY_KEY_SECRET`
- [ ] Webhook configured in Razorpay dashboard → URL =
      `https://<render-url>/api/razorpay/webhook`, events
      `payment.captured`, `payment.failed`,
      `subscription.activated`, `subscription.cancelled`
- [ ] `RAZORPAY_WEBHOOK_SECRET` set to the value Razorpay shows after
      creating the webhook (the app skips signature verification and
      logs a warning without it — do not ship like that)

## AI provider
- [ ] `AI_PROVIDER` set to a real provider in production — `mock` is
      blocked by `startupGuard()`
- [ ] The matching API key env var is set and has quota/billing enabled

## General
- [ ] `.env` is not committed (already gitignored — double-check with
      `git status` before your first push)
- [ ] `npm audit` reviewed for the backend and frontend dependency trees
- [ ] `docs/SUPABASE_SCHEMA.sql` (or the migration) has been run against
      the **production** Supabase project, not just a local/dev one
