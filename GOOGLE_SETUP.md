# Google OAuth Setup ("Continue with Google")

Google sign-in is configured **entirely in the Supabase Dashboard**. This
app's code never talks to Google directly — the frontend calls
`supabase.auth.signInWithOAuth({ provider: 'google' })` and Supabase does
the rest. There is no `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` anywhere in
this codebase (an earlier version had a hand-rolled Express OAuth flow;
it's been removed — see `TODO.md`).

## 1. Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials (create a
   project first if you don't have one).
2. **Create Credentials -> OAuth client ID**.
   - If prompted, configure the **OAuth consent screen** first: User type
     "External", add your app name/support email, and add the scopes
     `email`, `profile`, `openid` (usually pre-selected).
3. Application type: **Web application**.
4. **Authorized JavaScript origins** — add every origin the app is served from:
   ```
   http://localhost:3001
   https://your-frontend.vercel.app
   ```
5. **Authorized redirect URIs** — add **only** your Supabase project's
   callback URL (not your app's URL — this is the important part people
   get wrong):
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Find `<your-project-ref>` in Supabase Dashboard -> Project Settings ->
   General -> Reference ID, or just copy it from Supabase's own Google
   provider setup screen (step 2 below shows it to you directly).
6. Save. Copy the generated **Client ID** and **Client Secret**.

## 2. Supabase Dashboard

1. Authentication -> Providers -> **Google** -> toggle **Enabled**.
2. Paste the **Client ID** and **Client Secret** from step 1.
3. Supabase shows you the exact **Callback URL (for OAuth)** on this same
   screen — double check it matches what you put in Google Cloud Console.
4. Save.

## 3. Supabase Auth URL configuration

Authentication -> URL Configuration:
- **Site URL**: your production frontend URL, e.g. `https://your-frontend.vercel.app`
- **Redirect URLs** (allow list — add all environments you use):
  ```
  http://localhost:3001/auth/callback
  http://localhost:3001/reset-password
  https://your-frontend.vercel.app/auth/callback
  https://your-frontend.vercel.app/reset-password
  ```
  Supabase rejects a redirect to any URL not on this list, so a missing
  entry here is the #1 cause of "Google login works locally but not in
  production."

## 4. What happens at runtime

```
User clicks "Continue with Google"
  -> frontend: supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${origin}/auth/callback` } })
  -> browser redirects to Google's consent screen
  -> Google redirects to https://<project-ref>.supabase.co/auth/v1/callback
  -> Supabase creates/links the auth user, redirects to <redirectTo>?code=...
  -> frontend/src/pages/AuthCallback.tsx: supabase.auth.exchangeCodeForSession(code)
  -> session established, redirect to /dashboard
  -> public.users row auto-created (DB trigger + backend getOrCreateProfile fallback)
```

## Common mistakes this setup avoids

- ❌ Putting your app's own URL in Google's "Authorized redirect URIs"
  (should be Supabase's `/auth/v1/callback`, not `/auth/callback`).
- ❌ Forgetting to add the production frontend URL to Supabase's Redirect
  URLs allow list (works on localhost, breaks in prod).
- ❌ Running a second, competing OAuth flow in Express — there isn't one in
  this codebase; if you see `controllers/google-auth-controller.js`
  referenced anywhere, that file has been deleted and any doc mentioning it
  is stale.
