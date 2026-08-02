# Deletion Log

Every file removed or archived during the v9 → v10 refactor. No file was deleted without verification that nothing required it.

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
