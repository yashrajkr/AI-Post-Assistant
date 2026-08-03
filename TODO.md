# Fix Google OAuth Login

## Goal
Fix "Continue with Google" login which is broken in production due to a cross-origin cookie problem (backend on Render, frontend on Vercel — different domains).

## Steps
- [ ] 1. Backend `middleware/auth.js` — extend `attachUser` to accept a session token via `Authorization: Bearer` (not just `apa_` API keys).
- [ ] 2. Backend `controllers/google-auth-controller.js` — redirect to `FRONTEND_URL/auth/callback?token=<session>` after OAuth success.
- [ ] 3. Backend `controllers/auth-controller.js` — return `token` in login/signup JSON responses.
- [ ] 4. Frontend `lib/api.ts` — read token from localStorage and attach `Authorization: Bearer` header.
- [ ] 5. Frontend `lib/auth.tsx` — persist returned token in localStorage; clear on logout.
- [ ] 6. Frontend `pages/AuthCallback.tsx` — new page reads `?token=`, stores it, navigates to `/dashboard`.
- [ ] 7. Frontend `App.tsx` — add `/auth/callback` route.
- [ ] 8. Frontend `pages/Login.tsx` & `pages/Signup.tsx` — surface `?error=` query param via toast.
- [ ] 9. Run typecheck + verify build.
