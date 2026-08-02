# Razorpay Setup

Without Razorpay keys, payments run in **demo mode**: `/api/create-order`
returns a fake order and `/api/verify-payment` accepts it without a real
signature — good for testing the full upgrade flow locally without any
account. Adding real keys switches to live signature-verified payments
automatically.

## 1. Get test keys

1. <https://dashboard.razorpay.com> → sign up / log in.
2. Top-right toggle → **Test Mode**.
3. Settings → API Keys → **Generate Test Key**.
4. Copy the Key ID (`rzp_test_...`) and Key Secret.

## 2. Set environment variables

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

`env.hasRazorpay` only turns `true` once `RAZORPAY_KEY_ID` starts with `rzp_`
and both values are non-trivial length — so a half-filled `.env` safely
stays in demo mode instead of crashing.

## 3. Webhook (recommended, required before going live)

Payments can succeed on the client but the browser tab close before
`/api/verify-payment` runs. The webhook is the reliable source of truth.

1. Dashboard → Settings → Webhooks → **Add New Webhook**.
2. URL: `https://your-backend-domain.com/api/razorpay/webhook`
3. Active events: `payment.captured`, `payment.failed`,
   `subscription.activated`, `subscription.cancelled`.
4. Copy the **Webhook Secret** shown after creation into:
   ```env
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
   ```

The webhook route (`server.js`) is registered with `express.raw()` **before**
`express.json()` specifically so the raw request body is available for HMAC
signature verification — don't reorder this in `server.js`, or webhook
verification will silently break.

## 4. Test the flow locally

```bash
npm run smoke
```

The smoke test already exercises `/api/create-order` and
`/api/verify-payment` in demo mode. To test with real test-mode keys:

1. Set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in `.env`.
2. Start the server, log in via the frontend, go to Pricing, pick a plan.
3. Use a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/)
   (e.g. `4111 1111 1111 1111`, any future expiry, any CVV).
4. Confirm the user's plan/credits update after checkout.

## 5. Going live

1. Toggle Razorpay dashboard out of Test Mode.
2. Generate **live** API keys (Settings → API Keys).
3. Update Render environment variables with the live `rzp_live_...` key and
   secret, and a live webhook secret.
4. Re-create the webhook pointing at your production URL (test and live
   webhooks are separate).
5. `NODE_ENV=production` — the app will now refuse to boot if
   `RAZORPAY_KEY_ID`/`SECRET` are missing (see `config/env.js` →
   `startupWarnings`), so payments can't silently fall back to demo mode in
   production.

## 6. Subscription plan IDs (optional, for recurring billing)

If you want Razorpay Subscriptions (auto-renewing plans) instead of one-time
orders, create plans in Dashboard → Subscriptions → Plans, then set:

```env
RAZORPAY_PLAN_CREATOR_MONTHLY=
RAZORPAY_PLAN_CREATOR_ANNUAL=
RAZORPAY_PLAN_BUSINESS_MONTHLY=
RAZORPAY_PLAN_BUSINESS_ANNUAL=
RAZORPAY_PLAN_AGENCY_MONTHLY=
RAZORPAY_PLAN_AGENCY_ANNUAL=
```

Note: the current `services/razorpay-service.js` implements one-time orders
(`createOrder`). Wiring these plan IDs into an actual subscription-creation
endpoint is not implemented yet — treat the env vars as reserved for that
follow-up work, not as something already wired end-to-end.
