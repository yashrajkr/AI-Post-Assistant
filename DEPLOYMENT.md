# Deployment Guide — AI Post Assistant ff

This guide walks you through deploying the **backend on Render** and the **frontend on Vercel**. Both can be deployed independently and connected via environment variables.

---

## Architecture

```
┌──────────────────────┐         ┌──────────────────────┐
│   Vercel (frontend)  │  /api/*  │  Render (backend)    │
│   Vite + React + TS  │ ───────► │  Express + Supabase  │
│   ai-post-...vercel.app         │  ai-post-...onrender.com
└──────────────────────┘         └──────────────────────┘
        ▲                                  ▲
        │                                  │
        └────────── User browser ──────────┘
                       cookies
```

- **Frontend** (Vercel): Static SPA built from `frontend/`. Vercel rewrites `/api/*` to the Render backend, so the browser sees same-origin requests (cookies work without CORS).
- **Backend** (Render): Node.js Express server. Serves `/api/*` routes and accepts requests from the Vercel frontend origin (configured via `ALLOWED_ORIGINS`).
- **Database** (Supabase, optional): PostgreSQL with Row Level Security. Falls back to local JSON files if Supabase env vars are not set (dev only — never use JSON mode in production).
- **Payments** (Razorpay): Subscriptions for Creator / Pro / Team plans.

---

## Step 1 — Deploy backend to Render

### Option A: Blueprint (recommended, one-click)

1. Push this repo to GitHub.
2. Go to https://dashboard.render.com → **New** → **Blueprint**.
3. Select your repo. Render reads `render.yaml` at the root and creates the service automatically.
4. Set the following **secret** env vars in the Render dashboard (they're marked `sync: false` in `render.yaml`):

   | Var | Required? | Where to get it |
   |---|---|---|
   | `OPENAI_API_KEY` | Yes (if `AI_PROVIDER=openai`) | https://platform.openai.com/api-keys |
   | `GEMINI_API_KEY` | Optional (fallback) | https://aistudio.google.com/app/apikey |
   | `SUPABASE_URL` | Optional (else JSON file) | https://app.supabase.com → your project → Settings → API |
   | `SUPABASE_ANON_KEY` | Optional | same as above |
   | `SUPABASE_SERVICE_ROLE_KEY` | Optional | same as above |
   | `RAZORPAY_KEY_ID` | Optional (else demo mode) | https://dashboard.razorpay.com/app/keys |
   | `RAZORPAY_KEY_SECRET` | Optional | same as above |
   | `RAZORPAY_WEBHOOK_SECRET` | Optional | Razorpay → Settings → Webhooks |
   | `GOOGLE_CLIENT_ID` | Optional ("Continue with Google") | https://console.cloud.google.com/apis/credentials |
   | `GOOGLE_CLIENT_SECRET` | Optional | same as above |

5. Update the following **non-secret** vars in `render.yaml` (or in the Render dashboard after deploy) to your real URLs:

   ```yaml
   ALLOWED_ORIGINS: https://your-frontend.vercel.app   # set after Step 2
   GOOGLE_REDIRECT_URI: https://your-backend.onrender.com/api/auth/google/callback
   FRONTEND_URL: https://your-frontend.vercel.app
   ```

6. Render auto-deploys on every push to your main branch.

### Option B: Manual (web service)

1. Go to https://dashboard.render.com → **New** → **Web Service**.
2. Connect your GitHub repo.
3. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Add the env vars listed above.
5. Click **Create Web Service**.

### Verifying the backend deploy

```bash
curl https://your-backend.onrender.com/api/health
# → {"success":true,"app":"PostReady AI","version":"16.0.0-ff",...}
```

---

## Step 2 — Deploy frontend to Vercel

### Option A: Vercel dashboard (recommended)

1. Push this repo to GitHub (same repo as backend, that's fine).
2. Go to https://vercel.com → **Add New** → **Project**.
3. Import your GitHub repo.
4. **Important**: set **Root Directory** to `frontend/`. (Vercel will detect `frontend/vercel.json` and use it.)
5. **Build & Output Settings** (auto-detected from `vercel.json` — verify only):
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. **Environment Variables** (click "Environment Variables" and add):

   | Var | Value | Required? |
   |---|---|---|
   | `VITE_API_URL` | *(leave empty — Vercel rewrites `/api/*` to Render for you)* | No |

   If you'd rather call the backend directly (no rewrite), set `VITE_API_URL` to `https://your-backend.onrender.com`. The Vercel rewrite is the cleaner approach.

7. Click **Deploy**. Vercel builds and deploys in ~1 minute.

### Option B: Vercel CLI

```bash
cd frontend
npm install
npx vercel        # follow prompts; choose "Link to existing project" or "Create new"
npx vercel --prod # deploy to production
```

### Update the backend with the frontend URL

Once Vercel gives you a URL like `https://ai-post-assistant.vercel.app`:

1. Go to your **Render backend** → **Environment** tab.
2. Update:
   - `ALLOWED_ORIGINS` = `https://ai-post-assistant.vercel.app`
   - `FRONTEND_URL` = `https://ai-post-assistant.vercel.app`
3. Save — Render auto-redeploys.

### Verifying the frontend deploy

Open your Vercel URL. You should see:
- Landing page at `/`
- Login at `/login`, Signup at `/signup`
- After signup: redirected to `/dashboard`
- All API calls succeed (check the browser DevTools Network tab — they go to your Vercel origin and are rewritten to Render)

---

## Step 3 — (Optional) Set up Supabase

If you want persistent data (instead of JSON files on Render's ephemeral disk):

1. Create a project at https://app.supabase.com.
2. Go to **SQL Editor** and paste the contents of `docs/SUPABASE_SCHEMA.sql`. Run it.
3. In Supabase → **Settings** → **API**: copy Project URL, anon key, service_role key.
4. Add them as env vars on Render: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
5. Run the migration script once (locally or as a one-off Render job):

   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run migrate
   ```

---

## Step 4 — (Optional) Configure Google OAuth

For "Continue with Google" login:

1. https://console.cloud.google.com → create OAuth 2.0 Client ID (Web application).
2. **Authorized redirect URIs**: add `https://your-backend.onrender.com/api/auth/google/callback`
3. **Authorized JavaScript origins**: add `https://your-frontend.vercel.app`
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` on Render.

If not configured, the Google button gracefully redirects to `/login?error=google_oauth_not_configured` and shows a friendly toast.

---

## Step 5 — (Optional) Configure Razorpay

For real subscription payments:

1. Create an account at https://razorpay.com.
2. Get `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from **Settings** → **API Keys**.
3. Set up a webhook at **Settings** → **Webhooks**:
   - URL: `https://your-backend.onrender.com/api/razorpay/webhook`
   - Events: `payment.captured`, `subscription.activated`, `subscription.cancelled`
   - Copy the **Webhook Secret**.
4. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` on Render.
5. In `config/plans.js`, replace the placeholder `razorpay_plan_id` values with real Razorpay plan IDs you create in the Razorpay dashboard.

If not configured, payments run in **demo mode** (orders succeed without real charges — useful for testing the upgrade flow).

---

## Step 6 — (Optional) Build the Chrome extension

The Chrome extension lives in `chrome-extension/`. To build and load it:

```bash
cd chrome-extension
npm install
npm run build
```

Then in Chrome: `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select `chrome-extension/dist/`. Configure the extension with your backend URL and an API key (generate one from the in-app **API Keys** page).

---

## Production checklist

- [ ] Backend deployed on Render, `/api/health` returns 200
- [ ] Frontend deployed on Vercel, landing page loads
- [ ] `ALLOWED_ORIGINS` on Render includes your Vercel URL
- [ ] `FRONTEND_URL` on Render includes your Vercel URL
- [ ] `SESSION_SECRET` is set to a strong random value (Render auto-generates if you used the Blueprint)
- [ ] `OPENAI_API_KEY` is set
- [ ] Signup → Login → Dashboard flow works end-to-end
- [ ] (Optional) Supabase configured for persistent data
- [ ] (Optional) Google OAuth configured
- [ ] (Optional) Razorpay configured for real payments
- [ ] (Optional) Chrome extension built and tested

---

## Troubleshooting

### CORS errors in the browser console

Make sure `ALLOWED_ORIGINS` on Render includes your exact Vercel URL (no trailing slash). Example:
```
ALLOWED_ORIGINS=https://ai-post-assistant.vercel.app
```

If you have multiple frontends (e.g. a preview URL), comma-separate them:
```
ALLOWED_ORIGINS=https://ai-post-assistant.vercel.app,https://ai-post-assistant-git-main.vercel.app
```

### "Please login to continue" after signup

The session cookie is set by the backend. If you're calling the backend directly (not via Vercel rewrites), make sure:
- `VITE_API_URL` is set to your Render URL
- `ALLOWED_ORIGINS` on Render includes your Vercel URL
- Your browser isn't blocking third-party cookies (it shouldn't — the cookie is SameSite=Lax)

### 404 on page refresh (e.g. `/dashboard`)

This means SPA fallback isn't configured. The included `frontend/vercel.json` has the rewrite rule:
```json
{ "source": "/((?!api/).*)", "destination": "/index.html" }
```
If you're using a different host (Netlify, S3+CloudFront), add the equivalent rule.

### API calls return HTML instead of JSON

This means your `/api/*` requests are hitting the SPA fallback instead of the backend. Verify the `vercel.json` rewrite to your Render URL is correct, and that `VITE_API_URL` is either empty (use rewrites) or set to the Render URL (direct calls).

### Render free tier sleeps

Render's free web services sleep after 15 minutes of inactivity (~50 second cold start on next request). For production, upgrade to the **Starter** plan ($7/mo) which never sleeps.

---

## Environment variable reference

### Backend (Render)

| Var | Default | Required | Description |
|---|---|---|---|
| `NODE_ENV` | `production` | Yes | Set by Render |
| `PORT` | `3000` | Yes | Set by Render |
| `SESSION_SECRET` | — | Yes | Random 32+ char string |
| `AI_PROVIDER` | `openai` | Yes | `openai`, `gemini`, `grok`, or `mock` |
| `OPENAI_API_KEY` | — | If `openai` | OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | No | OpenAI model |
| `GEMINI_API_KEY` | — | If `gemini` | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | No | Gemini model |
| `ALLOWED_ORIGINS` | `*` | Yes | Comma-separated CORS origins |
| `ALLOW_EXTENSION_ORIGIN` | `true` | No | Allow `chrome-extension://*` origins |
| `SUPABASE_URL` | — | No | If using Supabase |
| `SUPABASE_ANON_KEY` | — | No | If using Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | — | No | If using Supabase |
| `RAZORPAY_KEY_ID` | — | No | If accepting payments |
| `RAZORPAY_KEY_SECRET` | — | No | If accepting payments |
| `RAZORPAY_WEBHOOK_SECRET` | — | No | If accepting payments |
| `GOOGLE_CLIENT_ID` | — | No | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | — | No | For Google OAuth |
| `GOOGLE_REDIRECT_URI` | — | No | For Google OAuth |
| `FRONTEND_URL` | — | No | Used for redirects/emails |

### Frontend (Vercel)

| Var | Default | Required | Description |
|---|---|---|---|
| `VITE_API_URL` | `''` | No | Empty = use Vercel rewrites. Or set to your Render URL for direct calls. |

---

## Support

- Backend code: `server.js`, `routes/`, `controllers/`, `services/`
- Frontend code: `frontend/src/`
- Chrome extension: `chrome-extension/`
- Schema: `docs/SUPABASE_SCHEMA.sql`
- Audit reports: `docs/AUDIT_REPORT.md`, `docs/FINAL_REPORT.md`, `FINAL_REPORT.md`
