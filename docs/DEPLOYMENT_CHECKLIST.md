# Pre-Launch Deployment Checklist

> ⚠️ **Superseded by `/DEPLOYMENT_CHECKLIST.md` (repo root) and
> `/AUTH_CHECKLIST.md`**, which reflect the current Supabase Auth setup.
> Kept here for historical reference.

Run through this list before going live. Every box must be checked.

## 1. Environment (Render Dashboard → Environment)

- [ ] `NODE_ENV=production`
- [ ] `PORT` left unset (Render injects it)
- [ ] `SESSION_SECRET` set to a 32+ char random string (NOT the default dev value)
- [ ] `ALLOWED_ORIGINS` set to your production domain(s), comma-separated
- [ ] `AI_PROVIDER=openai` (or `gemini`) — NEVER `mock` in production
- [ ] `OPENAI_API_KEY` set (and valid — test with `curl /api/ai/health`)
- [ ] `GEMINI_API_KEY` set as fallback (recommended)
- [ ] `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `RAZORPAY_KEY_ID` set (starts with `rzp_live_...` after KYC)
- [ ] `RAZORPAY_KEY_SECRET` set
- [ ] `RAZORPAY_WEBHOOK_SECRET` set
- [ ] `SENTRY_DSN` set (optional but strongly recommended)

## 2. Database (Supabase)

- [ ] Project created (free tier is fine to start)
- [ ] `docs/SUPABASE_SCHEMA.sql` executed in SQL editor (no errors)
- [ ] Tables visible: `users`, `generations`, `schedules`, `feedback`, `payments`, `subscriptions`
- [ ] RLS enabled on every table
- [ ] Service role key rotated if exposed accidentally
- [ ] Run `npm run migrate` once to move any local JSON data into Supabase
- [ ] Verify row counts in Supabase dashboard match local JSON files

## 3. Razorpay

- [ ] KYC complete (PAN, bank account, business proof)
- [ ] Switched from Test Mode → Live Mode
- [ ] Live API keys generated and added to env
- [ ] Webhook URL added: `https://yourdomain.com/api/razorpay/webhook`
- [ ] Webhook events subscribed: `payment.captured`, `payment.failed`, `subscription.activated`, `subscription.cancelled`
- [ ] Webhook secret copied to `RAZORPAY_WEBHOOK_SECRET`
- [ ] Test payment with live card (small amount) → verify user upgraded
- [ ] Verify webhook received by checking logs

## 4. Security

- [ ] `.env` file NOT in git (`git status` should not show it)
- [ ] `.env.example` contains NO real keys (only placeholders)
- [ ] HTTPS enforced (Render provides SSL automatically)
- [ ] CSP header set (Helmet defaults are good)
- [ ] Rate limits active: test by sending 100 rapid requests → expect 429
- [ ] Passwords hashed with PBKDF2 (120k rounds, sha512)
- [ ] Session cookies are `HttpOnly`, `SameSite=Lax`, `Secure` in production
- [ ] Service role key NEVER sent to frontend (only anon key, if any)

## 5. AI Provider

- [ ] `AI_PROVIDER` set to a real provider (not `mock`)
- [ ] `/api/ai/health` returns `ok` for primary provider
- [ ] Fallback provider configured (so a single outage doesn't break the app)
- [ ] Test with a real generation request → output looks correct
- [ ] Test by setting invalid API key → app falls back gracefully to mock (and logs warning)

## 6. Performance & Monitoring

- [ ] Health check endpoint `/api/health` returns 200
- [ ] Uptime monitor configured (UptimeRobot, Better Stack, etc.) hitting `/api/health` every 5 min
- [ ] Sentry connected — test by visiting `/api/force-error` (if you add such a route) or watch for first real error
- [ ] Logs are shipping (Render → Logs tab)
- [ ] Server boots in under 10s (check Render deploy logs)

## 7. Domain & SSL

- [ ] Custom domain added in Render
- [ ] DNS records (CNAME or A) configured at your registrar
- [ ] SSL certificate active (Render auto-provisions via Let's Encrypt)
- [ ] `ALLOWED_ORIGINS` env var updated to the custom domain
- [ ] HTTP requests redirect to HTTPS (Render does this by default)

## 8. Final smoke test (production URL)

Run these against `https://yourdomain.com`:

```bash
curl https://yourdomain.com/api/health
# expect: { success: true, env: "production", aiProvider: "openai", database: "supabase", ... }

curl https://yourdomain.com/api/ai/health
# expect: { success: true, primary: "openai", providers: { openai: "ok", ... } }
```

Then in browser:
- [ ] Homepage loads (no console errors)
- [ ] Signup works → user appears in Supabase `users` table
- [ ] Login works
- [ ] Generate content works with real AI
- [ ] History saves
- [ ] Schedule creates
- [ ] Analytics displays
- [ ] Pricing → checkout → user plan upgrades
- [ ] Logout works

## 9. Post-launch

- [ ] Add Google Analytics / Plausible / PostHog
- [ ] Add a privacy policy + terms of service page
- [ ] Set up daily DB backups in Supabase (free tier: 7-day PITR)
- [ ] Watch Sentry for the first 48 hours — fix any errors immediately
- [ ] Watch Razorpay dashboard for failed payments
- [ ] Watch OpenAI usage — set billing limit to avoid surprise charges
