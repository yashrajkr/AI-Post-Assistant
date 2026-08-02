# 🚀 AI Post Assistant v16 (ff) — Complete Setup Guide

**The single source of truth for going from zero to production.**

This guide walks you through every key you need, every service you need to set up, and every environment variable you need to fill in. Follow it in order.

---

## 📋 Table of Contents

1. [What you have](#what-you-have)
2. [Quick start (local dev in 5 minutes)](#quick-start-local-dev)
3. [Required keys checklist](#required-keys-checklist)
4. [Step 1 — OpenAI API key (required)](#step-1--openai-api-key)
5. [Step 2 — Supabase setup (required for production)](#step-2--supabase-setup)
6. [Step 3 — Razorpay setup (required for payments)](#step-3--razorpay-setup)
7. [Step 4 — Google OAuth (optional)](#step-4--google-oauth-optional)
8. [Step 5 — Deploy backend to Render](#step-5--deploy-backend-to-render)
9. [Step 6 — Deploy frontend to Vercel](#step-6--deploy-frontend-to-vercel)
10. [Step 7 — Build & load Chrome extension](#step-7--chrome-extension)
11. [Full environment variable reference](#full-environment-variable-reference)
12. [Troubleshooting](#troubleshooting)

---

## What you have

```
ai-post-assistant-ff/
├── Backend (Express + Supabase + Razorpay + OpenAI/Gemini)
│   ├── 28 API endpoints, 15 database tables
│   ├── Google OAuth + email/password auth
│   ├── API key auth (for Chrome extension)
│   ├── Rate limiting, Helmet, CORS, session cookies
│   └── 28/28 smoke tests passing
├── Frontend (Vite + React 18 + TypeScript + Tailwind 3)
│   ├── 23 pages (Landing, Login, Signup, Dashboard, Generate, Brand Brain, etc.)
│   ├── Real API integration with mock-data fallback
│   ├── Auth gate (redirects to /login if unauthenticated)
│   ├── Dark theme, Framer Motion animations
│   └── 0 TypeScript errors, 0 lint errors
├── Chrome Extension (MV3, TypeScript + Vite)
│   ├── Right-click → generate from any web page
│   ├── Popup + options page
│   └── API key auth
├── SQL Schema (docs/SUPABASE_SCHEMA.sql)
│   └── 15 tables with Row Level Security policies
├── render.yaml (one-click backend deploy)
└── frontend/vercel.json (one-click frontend deploy)
```

---

## Quick start (local dev)

```bash
# 1. Unzip
unzip ai-post-assistant-ff.zip
cd ai-post-assistant-ff

# 2. Backend setup
cp .env.example .env
# Edit .env — at minimum set AI_PROVIDER=mock (to test without any API keys)
npm install
npm start
# → Backend runs on http://localhost:3000

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
# → Frontend runs on http://localhost:3001 (proxies /api → :3000)

# 4. Open http://localhost:3001 — sign up, generate content!
```

> **Note:** With `AI_PROVIDER=mock`, the backend returns sample AI output (no real OpenAI calls). This is fine for testing the UI. For real AI, set `AI_PROVIDER=openai` and add your `OPENAI_API_KEY`.

---

## Required keys checklist

| Service | Required? | When you need it | Cost |
|---|---|---|---|
| **OpenAI API key** | Yes (or use `mock`) | For AI content generation | Pay per use (~$0.01/generation with gpt-4o-mini) |
| **Supabase project** | Yes (for production) | For persistent database | Free tier (500MB DB, 50K MAU) |
| **Razorpay account** | Yes (for paid plans) | For Creator/Pro/Team subscriptions | Free to set up, 2% per transaction |
| **Google OAuth credentials** | Optional | For "Continue with Google" login | Free |
| **Gemini API key** | Optional (fallback) | When OpenAI is down | Free tier (60 req/min) |

> **You can run the entire app with just OpenAI (or even `mock` mode).** Supabase, Razorpay, Google OAuth, and Gemini are all optional — the app gracefully degrades when they're not configured.

---

## Step 1 — OpenAI API key

**Required for: AI content generation (captions, hashtags, CTAs, image analysis, etc.)**

1. Go to https://platform.openai.com/api-keys
2. Sign in / create an account
3. Click **Create new secret key**
4. Name it "AI Post Assistant" and copy the key (starts with `sk-...`)
5. Add billing: https://platform.openai.com/settings/organization/billing — add a credit card ($5 is plenty for testing)

**Add to your `.env`:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Test it works:**
```bash
# After npm start, in another terminal:
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123"}'

# Use the session cookie from above to generate:
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<your-cookie>" \
  -d '{"content":"Launching my fitness coaching program","platform":"Instagram","niche":"Fitness","template":"Trending","tone":"Friendly","language":"English","goal":"Engagement","audience":"Beginners","location":"Global"}'
```

You should get back titles, captions, hashtags, and a CTA.

---

## Step 2 — Supabase setup

**Required for: persistent database (production). Without it, the app uses local JSON files (dev only — data is lost on restart).**

### 2.1 Create a Supabase project

1. Go to https://app.supabase.com
2. Sign in with GitHub
3. Click **New project**
4. Name it "ai-post-assistant"
5. Set a strong database password (save it somewhere safe)
6. Choose a region close to your users (e.g. `ap-south-1` for India, `us-east-1` for US)
7. Click **Create new project** — wait ~2 minutes for provisioning

### 2.2 Run the SQL schema

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `docs/SUPABASE_SCHEMA.sql` from this project
4. Copy the entire contents and paste into the SQL editor
5. Click **Run** — you should see "Success. No rows returned"
6. Verify: click **Table Editor** (left sidebar) — you should see 15 tables:
   `users`, `generations`, `schedules`, `feedback`, `payments`, `subscriptions`, `brand_brains`, `ai_memories`, `prompts`, `image_analyses`, `calendars`, `campaigns`, `document_analyses`, `brand_health_snapshots`, `api_keys`

### 2.3 Get your API keys

1. In Supabase dashboard, click **Settings** (gear icon, bottom left)
2. Click **API**
3. Copy these three values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long JWT
   - **service_role** key — a longer JWT (keep this secret!)

**Add to your `.env`:**
```bash
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJI...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...your-service-role-key...
```

### 2.4 (Optional) Migrate existing JSON data to Supabase

If you've been running with JSON files and want to move that data to Supabase:

```bash
# Set the Supabase env vars first, then:
npm run migrate
```

This reads `data/users.json`, `data/generations.json`, etc. and inserts them into Supabase.

### 2.5 Verify Supabase works

Restart your backend. The startup log should say:
```
[INFO] Database: supabase
```

Sign up a new user → check the Supabase **Table Editor** → `users` table → you should see the new row.

---

## Step 3 — Razorpay setup

**Required for: accepting payments for Creator / Pro / Team plans. Without it, the app runs in "demo mode" (orders succeed without real charges — useful for testing).**

### 3.1 Create a Razorpay account

1. Go to https://razorpay.com
2. Click **Sign Up**
3. Complete KYC (for production): https://dashboard.razorpay.com/app/identities
   - PAN card, bank account, business details
   - Takes 1-2 business days for approval
4. For testing, you can use **Test Mode** immediately (no KYC needed)

### 3.2 Get your API keys

1. Go to https://dashboard.razorpay.com/app/keys
2. Switch to **Test Mode** (top right toggle) for development
3. Copy **Key ID** (starts with `rzp_test_...`) and **Key Secret**

**Add to your `.env`:**
```bash
RAZORPAY_KEY_ID=rzp_test_your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
```

### 3.3 Create subscription plans

1. Go to https://dashboard.razorpay.com/app/subscriptions
2. Click **Create Plan** for each of these:

| Plan | Amount | Interval |
|---|---|---|
| Creator | ₹1,500 / month | Monthly |
| Pro | ₹4,000 / month | Monthly |
| Team | ₹12,000 / month | Monthly |

(Adjust amounts to your pricing — these match `config/plans.js` defaults. Free plan needs no Razorpay plan.)

3. For each plan, copy the **Plan ID** (looks like `plan_abcdef123456`)

### 3.4 Update plan IDs in the code

Open `config/plans.js` and replace the placeholder `razorpay_plan_id` values with your real plan IDs:

```js
{
  id: 'creator',
  name: 'Creator',
  price: 1500,
  razorpay_plan_id: 'plan_REAL_ID_HERE',  // ← replace
  // ...
},
```

### 3.5 Set up the webhook (for production)

The webhook is how Razorpay tells your backend "this payment succeeded". Without it, users won't get their credits after paying.

1. Go to https://dashboard.razorpay.com/app/webhooks
2. Click **Add Webhook**
3. Set URL: `https://your-backend.onrender.com/api/razorpay/webhook` (replace with your Render URL after deploying)
4. Select these events:
   - `payment.captured`
   - `subscription.activated`
   - `subscription.cancelled`
   - `subscription.charged`
5. Copy the **Webhook Secret** (looks like `whsec_abcdef...`)

**Add to your `.env`:**
```bash
RAZORPAY_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### 3.6 Test the payment flow

1. Start the backend with Razorpay keys set
2. Sign up → go to **Pricing** → click **Upgrade to Creator**
3. In Test Mode, use this test card:
   - Number: `4111 1111 1111 1111`
   - Expiry: any future date
   - CVV: any 3 digits
4. After payment, you should see your plan change to "creator" and credits set to 100

---

## Step 4 — Google OAuth (optional)

**Required for: "Continue with Google" button on login/signup. Without it, users sign up with email/password only.**

### 4.1 Create Google OAuth credentials

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable **Google+ API** and **Google Identity Services**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth client ID**
6. Application type: **Web application**
7. Authorized JavaScript origins:
   - `http://localhost:3001` (dev)
   - `https://your-frontend.vercel.app` (prod)
8. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (dev)
   - `https://your-backend.onrender.com/api/auth/google/callback` (prod)
9. Copy the **Client ID** and **Client Secret**

**Add to your `.env`:**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

> If `GOOGLE_CLIENT_ID` is not set, the Google button gracefully redirects to `/login?error=google_oauth_not_configured` and shows a friendly toast — the app still works with email/password.

---

## Step 5 — Deploy backend to Render

### Option A: Blueprint (recommended)

1. Push your code to GitHub
2. Go to https://dashboard.render.com → **New** → **Blueprint**
3. Select your GitHub repo
4. Render reads `render.yaml` and creates the service automatically
5. In the Render dashboard, set the **secret** env vars (they're marked `sync: false` in `render.yaml`):
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)
6. Update the non-secret vars to your real URLs:
   - `ALLOWED_ORIGINS` = your Vercel URL (set after Step 6)
   - `GOOGLE_REDIRECT_URI` = `https://your-backend.onrender.com/api/auth/google/callback`
   - `FRONTEND_URL` = your Vercel URL

### Option B: Manual web service

1. https://dashboard.render.com → **New** → **Web Service**
2. Connect GitHub repo
3. Settings:
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`
4. Add all env vars from `.env.example`
5. **Create Web Service**

### Verify

```bash
curl https://your-backend.onrender.com/api/health
# → {"success":true,"app":"PostReady AI",...}
```

---

## Step 6 — Deploy frontend to Vercel

1. Go to https://vercel.com → **Add New** → **Project**
2. Import your GitHub repo
3. **Important**: set **Root Directory** to `frontend/`
4. Vercel auto-detects `frontend/vercel.json` — settings:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Environment variables:
   - `VITE_API_URL` — **leave empty** (Vercel rewrites `/api/*` to your Render backend)
6. Click **Deploy**

### Update the backend with the frontend URL

Once Vercel gives you a URL like `https://ai-post-assistant.vercel.app`:

1. Go to **Render backend** → **Environment**
2. Update:
   - `ALLOWED_ORIGINS` = `https://ai-post-assistant.vercel.app`
   - `FRONTEND_URL` = `https://ai-post-assistant.vercel.app`
3. Save — Render auto-redeploys

### Verify

Open your Vercel URL → sign up → you should land on the Dashboard. API calls should succeed (check browser DevTools → Network — they go to your Vercel origin and are rewritten to Render).

---

## Step 7 — Chrome extension

The Chrome extension lets users right-click on any web page and generate posts from selected text or images.

### 7.1 Build

```bash
cd chrome-extension
npm install
npm run build
# Output: chrome-extension/dist/
```

### 7.2 Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `chrome-extension/dist/` folder
5. The extension icon should appear in your toolbar

### 7.3 Configure

1. Click the extension icon → **Settings** (gear)
2. Set **Backend URL** to your Render URL: `https://your-backend.onrender.com`
3. Generate an API key:
   - Log into your app → **API Keys** page → **New key**
   - Copy the key (starts with `apa_...`)
4. Paste the API key in the extension settings
5. Test: go to any web page → select text → right-click → **Generate posts from this text**

---

## Full environment variable reference

### Backend (`/.env` or Render env vars)

| Var | Required? | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` | Set by Render |
| `PORT` | Yes | `3000` | Set by Render |
| `SESSION_SECRET` | Yes | — | Random 32+ char string. Render auto-generates if using Blueprint. |
| `AI_PROVIDER` | Yes | `openai` | `openai`, `gemini`, `grok`, or `mock` |
| `OPENAI_API_KEY` | If `openai` | — | https://platform.openai.com/api-keys |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model |
| `GEMINI_API_KEY` | If `gemini` | — | https://aistudio.google.com/app/apikey |
| `GEMINI_MODEL` | No | `gemini-1.5-flash` | Gemini model |
| `AI_TIMEOUT_MS` | No | `30000` | AI request timeout |
| `AI_MAX_RETRIES` | No | `3` | AI request retry count |
| `ALLOWED_ORIGINS` | Yes | `*` | Comma-separated CORS origins (your Vercel URL) |
| `ALLOW_EXTENSION_ORIGIN` | No | `true` | Allow `chrome-extension://*` origins |
| `SUPABASE_URL` | For prod | — | https://app.supabase.com → Settings → API |
| `SUPABASE_ANON_KEY` | For prod | — | same |
| `SUPABASE_SERVICE_ROLE_KEY` | For prod | — | same (keep secret!) |
| `RAZORPAY_KEY_ID` | For payments | — | https://dashboard.razorpay.com/app/keys |
| `RAZORPAY_KEY_SECRET` | For payments | — | same |
| `RAZORPAY_WEBHOOK_SECRET` | For payments | — | https://dashboard.razorpay.com/app/webhooks |
| `GOOGLE_CLIENT_ID` | Optional | — | https://console.cloud.google.com/apis/credentials |
| `GOOGLE_CLIENT_SECRET` | Optional | — | same |
| `GOOGLE_REDIRECT_URI` | Optional | — | `https://your-backend.onrender.com/api/auth/google/callback` |
| `FRONTEND_URL` | No | — | Used for redirects/emails |

### Frontend (`/frontend/.env.local` or Vercel env vars)

| Var | Required? | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `''` | Empty = use Vercel rewrites. Or set to your Render URL for direct calls. |

---

## Troubleshooting

### "Cannot GET /api-keys" or other SPA routes 404

This means the Vite proxy pattern was too broad. The current `vite.config.ts` uses `/api/` (with trailing slash) so it doesn't match `/api-keys`. Make sure you're using the latest `vite.config.ts`.

### CORS errors in browser console

Make sure `ALLOWED_ORIGINS` on Render includes your exact Vercel URL (no trailing slash):
```
ALLOWED_ORIGINS=https://ai-post-assistant.vercel.app
```

### "Please login to continue" after signup

The session cookie isn't being set. Check:
1. `VITE_API_URL` is empty (use Vercel rewrites) OR set to your Render URL
2. `ALLOWED_ORIGINS` on Render includes your Vercel URL
3. Browser isn't blocking third-party cookies (it shouldn't — cookie is SameSite=Lax)

### 404 on page refresh (e.g. `/dashboard`)

SPA fallback isn't configured. The included `frontend/vercel.json` has the rewrite:
```json
{ "source": "/((?!api/).*)", "destination": "/index.html" }
```

### Payments succeed but credits don't update

The Razorpay webhook isn't being received. Check:
1. `RAZORPAY_WEBHOOK_SECRET` is set correctly
2. Webhook URL in Razorpay dashboard = `https://your-backend.onrender.com/api/razorpay/webhook`
3. Check Render logs for webhook hits

### Google OAuth redirects back to /login?error=...

Check the error code in the URL:
- `google_oauth_not_configured` → `GOOGLE_CLIENT_ID` / `SECRET` / `REDIRECT_URI` not set
- `google_denied` → user cancelled
- `google_invalid_state` → state cookie expired, retry
- `google_auth_failed` → check backend logs

### Sidebar nav doesn't scroll

The sidebar uses `flex-1 overflow-y-auto` on the nav element. The logo (h-16) and user footer are fixed. If you have many nav items, the middle section scrolls. A slim styled scrollbar should be visible on the right edge of the nav.

### Footer not showing on app pages

The app footer is hidden on mobile (the bottom tab bar replaces it). On desktop (md+), it appears at the bottom of the main content area. If your page has very little content, the footer sticks to the bottom of the viewport (not the page) because the layout uses `min-h-screen flex flex-col`.

---

## Production checklist

Before going live, verify:

- [ ] `OPENAI_API_KEY` set on Render
- [ ] `SESSION_SECRET` is a strong random string (NOT the default)
- [ ] `ALLOWED_ORIGINS` includes your Vercel URL
- [ ] Supabase project created, SQL schema run, env vars set
- [ ] Razorpay: KYC complete, plan IDs in `config/plans.js`, webhook secret set
- [ ] (Optional) Google OAuth credentials configured
- [ ] Frontend deployed to Vercel, `VITE_API_URL` empty
- [ ] Signup → Login → Generate flow works end-to-end
- [ ] Payment flow works (Test Mode first, then production)
- [ ] Chrome extension built and tested
- [ ] `npm run smoke` passes 28/28 tests locally

---

## Need more help?

- Architecture: `README.md`
- Deployment details: `DEPLOYMENT.md`
- SQL schema: `docs/SUPABASE_SCHEMA.sql`
- Per-service guides: `docs/SUPABASE_SETUP.md`, `docs/RAZORPAY_SETUP.md`, `docs/GOOGLE_AUTH_SETUP.md`
- Audit reports: `docs/FINAL_AUDIT_REPORT.md`, `FINAL_REPORT.md`
