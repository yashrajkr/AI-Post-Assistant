# Chrome Extension Integration Guide

This document explains how the Chrome extension connects to your AI Post Assistant backend.

## ✅ What's Already Built (Phase 2 complete)

### Backend (v11.1)

| Component | Status | File |
|---|---|---|
| `api_keys` table + RLS | ✅ | `docs/SUPABASE_SCHEMA.sql` |
| API key generation (`apa_<32hex>`) | ✅ | `services/storage-service.js` |
| SHA-256 hashing (never store raw key) | ✅ | `services/storage-service.js` |
| Bearer token auth in middleware | ✅ | `middleware/auth.js` |
| CORS allows `chrome-extension://*` origin | ✅ | `server.js` |
| Endpoints: GET/POST/DELETE `/api/api-keys` | ✅ | `routes/index.js` |
| Max 5 keys per user (abuse prevention) | ✅ | `controllers/api-keys-controller.js` |
| `last_used` timestamp auto-updated | ✅ | `services/storage-service.js` |

### Frontend (Next.js)

| Component | Status | File |
|---|---|---|
| API Keys settings page | ✅ | `frontend/app/(app)/api-keys/page.tsx` |
| Sidebar entry | ✅ | `frontend/components/layout/sidebar.tsx` |
| Command palette entry (Ctrl+K) | ✅ | `frontend/components/shared/command-palette.tsx` |
| Route protection (middleware) | ✅ | `frontend/middleware.ts` |

## 🧪 How to Test the API Key Flow (Right Now)

### Step 1 — Run the backend
```bash
cd "AI Post Assistant"
npm install
npm start
# → http://localhost:3000
```

### Step 2 — Sign up and log in via the web app
Auth is Supabase Auth now (see `AUTH_SETUP.md`), not a backend
`/api/signup` route — sign up at `http://localhost:3001/signup` in the
browser, then copy your session's access token from devtools
(Application -> Local Storage -> `sb-<project-ref>-auth-token` -> `access_token`)
for the curl call below.

### Step 3 — Generate an API key
```bash
curl -X POST http://localhost:3000/api/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <paste supabase access_token here>" \
  -d '{"name":"Chrome Extension"}'
```
Response (raw key shown ONCE):
```json
{
  "success": true,
  "apiKey": {
    "id": "...",
    "keyPrefix": "apa_abc12345",
    "name": "Chrome Extension",
    "createdAt": "..."
  },
  "rawKey": "apa_d14b37637d5fefedc1fe09e3afe66590",
  "message": "Copy this key now. You will not be able to see it again."
}
```

### Step 4 — Use the key as Bearer token
```bash
# Get current user
curl http://localhost:3000/api/me \
  -H "Authorization: Bearer apa_d14b37637d5fefedc1fe09e3afe66590"

# Generate a post
curl -X POST http://localhost:3000/api/generate \
  -H "Authorization: Bearer apa_d14b37637d5fefedc1fe09e3afe66590" \
  -H "Content-Type: application/json" \
  -d '{"content":"JEE 2027 batch","platform":"Instagram","niche":"Education","language":"English","goal":"Admissions","tone":"Professional"}'
```

### Step 5 — Revoke the key
```bash
curl -X DELETE http://localhost:3000/api/api-keys/<KEY_ID> \
  -H "Cookie: $(grep session cookies.txt | awk '{print "session="$7}')"

# Key now returns 401:
curl http://localhost:3000/api/me \
  -H "Authorization: Bearer apa_d14b37637d5fefedc1fe09e3afe66590"
# → 401 Unauthorized
```

## 🔐 Security Model

```
┌─────────────────────────────────────────────────────────────┐
│  User creates API key in web dashboard                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  POST /api/api-keys  (session cookie auth)          │    │
│  │  → generates: apa_<32 random hex chars>             │    │
│  │  → stores: SHA-256(raw_key) in api_keys table       │    │
│  │  → returns: raw key ONCE to user                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  User pastes raw key into Chrome extension settings          │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Extension stores key in chrome.storage.sync        │    │
│  │  (syncs across user's devices)                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  Extension calls API with: Authorization: Bearer apa_...    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Backend middleware:                                │    │
│  │  1. Try session cookie → if valid, use it           │    │
│  │  2. Else try Bearer token:                          │    │
│  │     - SHA-256(raw_key) → lookup in api_keys         │    │
│  │     - If found: attach user, update last_used       │    │
│  │     - If not found: 401                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Why this is secure
1. **Raw key never stored** — only SHA-256 hash. Even if DB leaks, attackers can't recover keys.
2. **`apa_` prefix** — easy to identify, easy to grep for accidentally committed keys.
3. **Max 5 keys per user** — prevents abuse.
4. **Instant revocation** — delete key → all extension calls immediately return 401.
5. **CORS locked down** — only your frontend + `chrome-extension://*` origins allowed.
6. **Rate limiting** — extension requests go through same rate limiter as web requests.

## 🚀 What's Next (Phase 4+5 — Extension Project)

Now that backend API key auth works, you can build the actual Chrome extension. See the mentor plan I gave you for the full folder structure + Manifest V3.

### Quick start for the extension
1. Create a new folder: `ai-post-assistant-extension/` (separate from main app)
2. Use Vite + React + TypeScript + @crxjs/vite-plugin
3. Manifest V3 with permissions: `contextMenus`, `storage`, `activeTab`
4. Options page: input for API key → save to `chrome.storage.sync`
5. Background service worker: register context menu items
6. Popup: small 360×500px window with generate form

### Extension API call pattern (JavaScript)
```js
// In your extension's popup/content script
async function callBackend(path, options = {}) {
  const { apiKey } = await chrome.storage.sync.get('apiKey');
  if (!apiKey) {
    throw new Error('No API key set. Open extension options to add one.');
  }
  const res = await fetch(`https://your-backend-url.com${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    throw new Error('Invalid API key. Generate a new one in the web dashboard.');
  }
  return res.json();
}

// Usage:
const data = await callBackend('/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    content: 'New JEE batch starting',
    platform: 'Instagram',
    niche: 'Education',
    language: 'English',
    goal: 'Admissions',
    tone: 'Professional',
  }),
});
```

## 📋 Deployment Checklist (Before Building Extension)

- [ ] Backend deployed to Render (HTTPS required — Chrome blocks HTTP)
- [ ] `ALLOWED_ORIGINS` env var set to your Vercel URL + `chrome-extension://*`
- [ ] `ALLOW_EXTENSION_ORIGIN` not set to `false` (default is true)
- [ ] Frontend deployed to Vercel
- [ ] Test API key flow on production URL (not localhost)
- [ ] Create privacy policy page (required for Chrome Web Store)

## 🎯 Summary

**Phase 2 is complete.** Your backend now supports API key authentication that the Chrome extension will use. The web dashboard has a dedicated `/api-keys` page where users can generate, view, and revoke keys.

**Next step:** Build the Chrome extension project (Phase 4+5 from the mentor plan). The extension will be a SEPARATE project — do not put it inside the main `AI Post Assistant` folder.
