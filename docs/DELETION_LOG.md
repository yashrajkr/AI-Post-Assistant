# Deletion Log

Every file removed or archived during the v9 → v10 refactor. No file was deleted without verification that nothing required it.

## Supabase Auth migration (post-v16)

| File / Folder | Action | Reason | Verified unused by |
|---|---|---|---|
| `public/` (entire folder — 9 HTML pages, `app.js`, `style.css`) | **Deleted** (confirmed with the user first — see chat) | Superseded by `frontend/` (the real, deployed Vite React app). `docs/VERIFICATION_REPORT_2026-08-02.md` had already flagged this exact folder as safe to delete once the Vercel frontend was confirmed live. Its `login.html`/`signup.html` called `/api/signup`/`/api/login`, which no longer exist after the Supabase Auth migration — it was actively broken, not just redundant. | Grepped for any build step or code path referencing `public/`/`PUBLIC_DIR` outside `server.js` itself — none found. `server.js`'s `express.static`/SPA-fallback middleware (its only consumer) removed in the same change. |
| `controllers/google-auth-controller.js` | **Deleted** | Replaced by Supabase Auth's own OAuth handling (`supabase.auth.signInWithOAuth()` from the frontend) — see `AUTH_AUDIT.md`, `GOOGLE_SETUP.md`. | Grepped for `google-auth-controller`/`googleAuth\.` — zero remaining references. |
| `signSession`/`verifySession` (`utils/helpers.js`) | **Deleted** | Custom HMAC session tokens replaced by Supabase-issued JWTs, verified via `supabase.auth.getUser()`. | Grepped for both names — zero remaining references. |
| `cookie-parser` (server.js, package.json) | **Deleted** | Auth is Bearer-token-only now; nothing sets or reads cookies. | Grepped for `req.cookies`/`res.cookie` — zero remaining references. |
| `google-auth-library` (package.json) | **Deleted** | Only used by the deleted `google-auth-controller.js`. | — |

## v9 → v10 refactor

| File / Folder | Size | Action | Reason | Verified unused by |
|---|---|---|---|---|
| `lib/supabase.js` | 54 lines | **Archived** → `scripts/_archive/lib-original-v9/supabase.js` | Dead code. `grep -rn "require.*lib/supabase"` returned zero hits outside `lib/` itself. The v9 `server.js` had its own inline Supabase logic (which was also unused — JSON storage was the active path). | `rg "require.*lib/supabase"` — only matches inside `lib/supabaseHelpers.js` |
| `lib/supabaseHelpers.js` | 354 lines | **Archived** → `scripts/_archive/lib-original-v9/supabaseHelpers.js` | Dead code. Nothing in `/public`, `/server.js`, or `/tests` required this file. | `rg "require.*lib/supabaseHelpers"` — zero matches anywhere |
| `lib/` (folder) | — | **Archived** → `scripts/_archive/lib-original-v9/` | Entire folder was dead code. Preserved as backup in case future contributors want to reference the original Supabase helper patterns. | (see above) |

### Files NOT deleted (kept intact)

| File | Reason kept |
|---|---|
| `public/*.html` (9 files) | All pages are referenced by `appShell()` in `app.js` and by user navigation. Confirmed used. |
| `public/app.js` | Loaded by every HTML page via `<script src="/app.js">`. Confirmed used. |
| `public/style.css` | Loaded by every HTML page via `<link rel="stylesheet" href="/style.css">`. Confirmed used. |
| `data/*.json` (5 files) | Used as dev-mode storage backend when Supabase isn't configured. |
| `tests/smoke-test.js` | Updated, not deleted. |
| `docs/PRODUCTION_CHECKLIST.md`, `docs/DEPLOYMENT.md` | Kept for historical reference. New `DEPLOYMENT_CHECKLIST.md` supersedes them. |
| `LICENSE`, `README.md`, `package-lock.json` | Kept. `README.md` was rewritten. |
