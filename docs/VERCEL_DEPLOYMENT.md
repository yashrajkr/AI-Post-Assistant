# Vercel Deployment (Frontend)

The `frontend/` folder is a standalone Next.js 14 app. It talks to the
Express backend entirely over HTTP (`NEXT_PUBLIC_API_URL`) — it does not
need the backend to be in the same repo or deployed together.

## 1. Push to GitHub

Push this whole project (or just `frontend/` as its own repo — either works,
see "Monorepo vs separate repo" below).

## 2. Import into Vercel

1. <https://vercel.com/new> → Import your GitHub repo.
2. **Root Directory**: set this to `frontend` (important — Vercel needs to
   build from inside the Next.js app, not the repo root).
3. Framework preset: Next.js (auto-detected).
4. Build command: `next build` (default — leave as-is).
5. Output directory: leave as default (Next.js handles this).

## 3. Environment variables

In Vercel → Project → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

Set this for all three environments (Production, Preview, Development) —
use your real Render URL for Production, and either the same Render URL or
a staging backend for Preview.

## 4. Deploy

Click Deploy. Vercel builds and gives you a `https://your-app.vercel.app`
URL.

## 5. Point the backend at this URL

Back on Render, set the backend's `ALLOWED_ORIGINS` to your Vercel URL (see
`RENDER_DEPLOYMENT.md`) — otherwise CORS will block requests. Also add this
Vercel URL's `/auth/callback` path to Supabase's redirect allow-list (see
`GOOGLE_AUTH_SETUP.md`) or Google sign-in will redirect to the wrong place.

## 6. Custom domain (optional)

Vercel → Project → Settings → Domains → add your domain, follow the DNS
instructions. Then update `ALLOWED_ORIGINS` on the backend and the Supabase
redirect allow-list to the new domain too.

## Monorepo vs separate repo

Both work fine:

- **Monorepo (current layout)**: set Vercel's Root Directory to `frontend`
  and Render's Root Directory to the repo root (or wherever `server.js`
  lives). Each platform only looks at its own subfolder.
- **Separate repos**: copy `frontend/` into its own repo if you'd rather
  keep frontend and backend deploy history independent. No code changes
  needed either way — the frontend only ever talks to the backend via
  `VITE_API_URL`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails fetching Google Fonts | Vercel's build servers have full internet access, so this should not happen there — if it does, check Vercel's status page, it's not something in this codebase |
| API calls fail / CORS errors | Confirm `VITE_API_URL` has no trailing slash and matches the backend's actual URL; confirm backend `ALLOWED_ORIGINS` includes this Vercel URL |
| Google sign-in redirects to `localhost` or fails after Google's consent screen | This Vercel URL's `/auth/callback` isn't in Supabase's redirect allow-list — add it (see `GOOGLE_AUTH_SETUP.md`) |
| 401 on every page after deploy | Cookie `secure` flag requires HTTPS — make sure both frontend and backend are on HTTPS in production (Vercel and Render both provide this by default) |
