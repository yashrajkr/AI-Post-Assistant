# AI Post Assistant — Frontend (Vite + React + TypeScript)

Modern, dark-themed UI for the AI Post Assistant SaaS. Built with Vite, React 18,
TypeScript, Tailwind CSS 3, Framer Motion, and lucide-react.

## Stack

- **Build tool:** Vite 5 (dev server on port 3001, proxies `/api` → backend on :3000)
- **Framework:** React 18 + TypeScript 5
- **Styling:** Tailwind CSS 3 + CSS variables (dark theme tokens)
- **Animations:** Framer Motion
- **Icons:** lucide-react
- **Routing:** react-router-dom v7
- **State:** React Context (AuthProvider, ToastProvider)

## Pages

Public routes:

- `/` — Landing page (hero, features, testimonials, FAQ, CTA)
- `/login` — Email + Google OAuth login
- `/signup` — Signup with 10 free credits
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service

Protected routes (require login, redirect to `/login` if unauthenticated):

- `/dashboard` — Workspace overview (credits, recent generations, usage)
- `/generate` — AI post generator (multi-platform, advanced options, content score)
- `/brand-brain` — Brand voice / tone / banned words
- `/prompts` — Prompt library (create, use, delete)
- `/image-analysis` — Upload image → caption + hashtags + CTA
- `/document` — Document → content
- `/repurpose` — One input → 6 platform-optimized outputs
- `/calendar` — AI Content Calendar
- `/campaigns` — Campaign Builder
- `/brand-health` — Brand Health Dashboard
- `/memory` — AI Memory (what the AI has learned)
- `/api-keys` — Chrome extension API key management
- `/history` — Generation history
- `/schedule` — Schedule planner
- `/analytics` — Usage analytics
- `/profile` — Profile + brand voice settings
- `/pricing` — Subscription plans

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template (optional in dev — Vite proxies /api for you)
cp .env.example .env.local

# 3. Start dev server (assumes backend is running on http://localhost:3000)
npm run dev
#   → open http://localhost:3001

# 4. Build for production
npm run build
# Output is in dist/

# 5. Preview production build
npm run preview

# 6. Type-check
npm run typecheck

# 7. Lint
npm run lint
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `''` (empty) | Backend URL. In dev, leave empty — Vite proxies `/api` to `http://localhost:3000`. In prod, set to the public backend URL (e.g. `https://api.aipostassistant.com`). |
| `VITE_SUPABASE_URL` | — (required) | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | — (required) | Supabase anon/public key. Safe to expose to the browser — never put the service-role key here. |

See `AUTH_SETUP.md` (repo root) for the full picture.

## Auth flow

Auth is Supabase Auth, driven directly from this frontend via `supabase-js`
(`src/lib/supabaseClient.ts`, `src/lib/auth.tsx`) — there is no backend
signup/login/OAuth-redirect route.

1. On mount, `AuthProvider` calls `supabase.auth.getSession()` to restore any
   persisted session (survives refresh/new tab/browser restart), then fetches
   `GET /api/me` (with `Authorization: Bearer <access_token>`) to load the
   app-level profile (plan/credits/brandVoice). `onAuthStateChange` keeps this
   in sync afterwards.
2. `AuthGate` wraps the protected route group. If `user` is `null` (and not
   still loading), it redirects to `/login` (preserving the original destination).
3. Login/Signup call `supabase.auth.signInWithPassword()` / `signUp()` directly.
4. Google OAuth calls `supabase.auth.signInWithOAuth({ provider: 'google' })`,
   which redirects to Google, then Supabase, then back to `/auth/callback`
   (`src/pages/AuthCallback.tsx`) which exchanges the code for a session.
5. Forgot/reset password: `supabase.auth.resetPasswordForEmail()` and
   `/reset-password` (`src/pages/ResetPassword.tsx`) calling `updateUser()`.
6. Logout calls `supabase.auth.signOut()` (revokes the refresh token, clears
   local state).

## Backend contract

This frontend talks to the Express backend (see `../server.js` and `../routes/`)
for app data only (generate, history, plans, etc) — never for identity.
All API calls go through `src/lib/api.ts` which:

- Prepends `VITE_API_URL` (or relies on Vite's dev proxy)
- Attaches `Authorization: Bearer <supabase access token>` (fetched fresh
  from `supabase.auth.getSession()` on every call, so a refreshed token is
  always used)
- Throws `ApiError` with friendly per-status messages
- Exposes `apiGet`, `apiPost`, `apiPut`, `apiDelete` helpers

## Production deployment

1. `npm run build` produces a static bundle in `dist/`.
2. Serve `dist/` from any static host (Vercel, Netlify, Render static site, S3+CloudFront).
3. Set `VITE_API_URL` to the public backend URL at build time.
4. Make sure the backend's `ALLOWED_ORIGINS` includes your frontend's domain
   (see `../.env.example`).

## Notes

- The new UI uses a fully dark theme via CSS variables (`src/index.css`).
- Mock data in `src/lib/mockData.ts` is used as a fallback when the backend is
  unreachable (e.g. during local UI iteration without a running backend).
- Toast notifications are provided by `src/lib/toast.tsx` (no external dep).
