# AI Post Assistant — Chrome Extension

Manifest V3 Chrome extension that lets you generate AI captions, hashtags, and CTAs from any text or image on the web.

## ✨ Features

1. **Right-click selected text** → "Generate posts from this text"
2. **Right-click any image** → "Analyze image with AI"
3. **Popup** (click extension icon or Ctrl+Shift+A) → quick generate form
4. **API key auth** — secure, no password storage

## 🚀 Quick Start (Development)

### Step 1: Install dependencies
```bash
cd chrome-extension
npm install
```

### Step 2: Build the extension
```bash
npm run build
```
This creates a `dist/` folder with the compiled extension.

### Step 3: Load in Chrome
1. Open `chrome://extensions/` in Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. The extension icon appears in your toolbar

### Step 4: Configure API key
1. Click the extension icon → gear icon (Settings)
2. Or right-click the extension icon → **Options**
3. Enter your API key (get it from the web app → API Keys page)
4. Enter backend URL (default: `https://ai-post-assistant-backend.onrender.com`)
5. Click **Save & Test**

### Step 5: Use it!
- **Select text** on any webpage → right-click → "✨ Generate posts from..."
- **Right-click an image** → "🔍 Analyze image with AI"
- **Click extension icon** (or Ctrl+Shift+A) → paste text → Generate

## 🛠️ Development Mode

For hot-reload during development:
```bash
npm run dev
```
Then load the `dist/` folder in Chrome as above. Changes to source files auto-rebuild.

**Note:** Chrome doesn't auto-reload extensions. After each change:
1. Go to `chrome://extensions/`
2. Click the **refresh** icon on the AI Post Assistant card
3. Or press Ctrl+R on the extensions page

## 📁 Project Structure

```
chrome-extension/
├── public/
│   └── icons/
│       ├── icon-16.png       ← Toolbar icon (16x16)
│       ├── icon-32.png       ← Toolbar icon (32x32)
│       ├── icon-48.png       ← Extensions page (48x48)
│       └── icon-128.png      ← Store listing (128x128)
├── src/
│   ├── manifest.ts           ← Manifest V3 config (typed)
│   ├── styles.css            ← Tailwind + global styles
│   ├── popup/                ← Click extension icon → popup
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── Popup.tsx         ← Generate form + result display
│   ├── options/              ← Settings page (API key input)
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── Options.tsx       ← API key + backend URL config
│   ├── background/
│   │   └── index.ts          ← Service worker (context menus)
│   └── lib/
│       ├── api.ts            ← Fetch wrapper with Bearer auth
│       └── storage.ts        ← chrome.storage.sync wrapper
├── package.json
├── vite.config.ts            ← @crxjs/vite-plugin config
├── tsconfig.json
├── tailwind.config.ts        ← Matches main app's design system
└── postcss.config.js
```

## 🔐 How Auth Works

```
1. User logs into web app (https://ai-post-assistant.vercel.app)
2. Goes to /api-keys → generates key (apa_xxx...)
3. Opens extension Options → pastes key
4. Extension stores key in chrome.storage.sync (syncs across devices)
5. Every API call sends: Authorization: Bearer apa_xxx
6. Backend validates key → returns data
```

**Security:**
- API key stored in `chrome.storage.sync` (encrypted by Chrome)
- Never logged to console in production
- Backend stores only SHA-256 hash of key (not raw key)
- User can revoke key instantly from web dashboard

## 📦 Build for Production (Chrome Web Store)

### Step 1: Build
```bash
npm run build
```

### Step 2: Package as ZIP
```bash
cd dist
zip -r ../ai-post-assistant-extension-v1.0.0.zip .
cd ..
```

### Step 3: Submit to Chrome Web Store
1. Go to https://chrome.google.com/webstore/devconsole
2. Pay $5 one-time developer fee (if not already done)
3. Click **Add new item**
4. Upload the ZIP file
5. Fill in:
   - **Name:** AI Post Assistant
   - **Summary:** Generate AI captions, hashtags, and CTAs from any text or image.
   - **Description:** Detailed description (see below)
   - **Category:** Productivity
   - **Screenshots:** 5 screenshots (1280×800)
   - **Privacy policy URL:** https://ai-post-assistant.vercel.app/privacy
6. Submit for review (1-7 days)

### Step 4: Privacy policy
You need a privacy policy page on your web app. Create `frontend/app/privacy/page.tsx` with:
- What data you collect (API key, selected text, images)
- Where data is stored (backend, chrome.storage)
- Who you share it with (OpenAI for AI generation only)
- How users can delete data (revoke API key + delete account)

## 🎯 Permissions Explained (for Chrome Web Store review)

| Permission | Why we need it |
|---|---|
| `contextMenus` | Add right-click menu items for "Generate from text" and "Analyze image" |
| `storage` | Save API key + preferences in chrome.storage.sync |
| `activeTab` | Access currently active tab to read selected text |
| `notifications` | Show notification when context menu can't open popup programmatically |

**We do NOT request:**
- ❌ `<all_urls>` — too broad, users will reject
- ❌ `tabs` — not needed
- ❌ `cookies` — not needed (we use API keys, not cookies)
- ❌ `history` — not needed
- ❌ `bookmarks` — not needed

## 🧪 Testing Checklist

Before submitting to Chrome Web Store:

- [ ] Install on fresh Chrome profile (no other extensions)
- [ ] Test on Mac AND Windows
- [ ] Options page: API key saves + persists after restart
- [ ] Options page: invalid key shows clear error
- [ ] Popup: generates post with valid key
- [ ] Popup: shows credits count
- [ ] Popup: copy buttons work
- [ ] Context menu: "Generate from text" works on selected text
- [ ] Context menu: "Analyze image" works on right-clicked image
- [ ] Keyboard shortcut: Ctrl+Shift+A opens popup
- [ ] Error handling: backend down → friendly message
- [ ] Error handling: no credits → friendly message
- [ ] No console.log in production build
- [ ] No hardcoded localhost URLs

## 🐛 Troubleshooting

### "Cannot find module" errors
Run `npm install` first.

### Popup is blank
Check `chrome://extensions/` → click "Errors" on the extension card. Usually a TypeScript error.

### Context menu doesn't appear
- Make sure you reloaded the extension after changes
- Context menus only show on http/https pages, not chrome:// pages

### API key not saving
- Check `chrome://extensions/` → extension → "Storage" permission is granted
- Try clearing storage: Options page → "Clear" button

### "Invalid API key" error
- Make sure key starts with `apa_`
- Make sure backend URL is correct (no trailing slash)
- Generate a new key in the web dashboard

### CORS errors in console
- Backend must have `ALLOW_EXTENSION_ORIGIN=true`
- Backend `ALLOWED_ORIGINS` must include `chrome-extension://*`

## 📤 Publishing Updates

1. Bump version in `package.json` (e.g., `1.0.0` → `1.0.1`)
2. `npm run build`
3. ZIP the `dist/` folder
4. Upload to Chrome Web Store dev console
5. Users auto-update within 24 hours

## 📚 Resources

- [Chrome Extensions Manifest V3 docs](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [@crxjs/vite-plugin docs](https://crxjs.dev/vite-plugin)
- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)

## 📄 License

MIT
