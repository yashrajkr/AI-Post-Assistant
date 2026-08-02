# Chrome Web Store Submission Guide

Complete guide to submit your Chrome extension to the Chrome Web Store.

---

## 📋 Prerequisites

- [ ] Chrome Web Store Developer account ($5 one-time fee) → https://chrome.google.com/webstore/devconsole
- [ ] Extension built (`npm run build` in `chrome-extension/` folder)
- [ ] Backend deployed to HTTPS (Chrome blocks HTTP)
- [ ] Privacy policy live at `https://your-app.vercel.app/privacy`
- [ ] 5 screenshots (1280×800 px or 640×400 px)
- [ ] Extension icons (16, 32, 48, 128 px PNG) — already in `chrome-extension/public/icons/`

---

## 📦 Step 1: Build + Package

```bash
cd chrome-extension
npm install
npm run build

# Package as ZIP
cd dist
zip -r ../ai-post-assistant-extension-v1.0.0.zip .
cd ..
```

The ZIP file is what you upload to the Chrome Web Store.

---

## 📝 Step 2: Store Listing Content

### Name (max 75 chars)
```
AI Post Assistant — AI Caption & Hashtag Generator
```

### Summary (max 132 chars)
```
Generate AI captions, hashtags, and CTAs from any text or image on the web. Built for Indian creators, coaches, and businesses.
```

### Description (max 16,000 chars)
```
AI Post Assistant is your AI-powered content creation companion for the web.

🚀 WHAT IT DOES
Generate ready-to-post social media content from any text or image — right from your browser. No need to open a separate app.

✨ FEATURES

1. RIGHT-CLICK TO GENERATE
Select any text on any webpage → right-click → "Generate posts from this text" → get AI-generated captions, hashtags, titles, and CTAs instantly.

2. IMAGE ANALYSIS
Right-click any image → "Analyze image with AI" → get caption, alt text, hashtags, hook, and CTA based on what's in the image.

3. QUICK POPUP
Click the extension icon (or press Ctrl+Shift+A) → paste text → choose platform and niche → Generate. Results include:
- 5 catchy titles
- 3 full captions
- 5 relevant hashtags
- Keywords for SEO
- Call-to-action suggestions
- Thumbnail text ideas
- Posting time tips
- Content score (Hook, SEO, CTA, Readability, Virality, Emotion)

4. MULTI-PLATFORM
Generate for Instagram, YouTube, LinkedIn, Facebook, X (Twitter), and WhatsApp — all from one popup.

5. BRAND BRAIN
Set your brand voice once (tone, audience, CTA style, banned words) → every generation matches your unique voice.

🎯 WHO IT'S FOR
- Content creators and influencers
- Coaching institutes and educators
- Small business owners
- Social media managers
- Marketing professionals
- Anyone who creates social media content for Indian audiences

🇮🇳 BUILT FOR INDIA
- Supports English, Hindi, and Hinglish
- Optimized for Indian festivals, exams (JEE, NEET), and cultural context
- Best posting times for Indian audience (7-9 PM IST)
- Razorpay payments (INR)

🔒 PRIVACY & SECURITY
- API key authentication (no password storage)
- Your data is never sold
- Images are processed by AI and not permanently stored unless you save them
- Full privacy policy: https://ai-post-assistant.vercel.app/privacy

💡 HOW TO GET STARTED
1. Create a free account at https://ai-post-assistant.vercel.app (10 free credits)
2. Go to API Keys page → generate a key
3. Open this extension's settings (right-click icon → Options)
4. Paste your API key → Save
5. Right-click any text or image → Generate!

💰 PRICING
- Free: 10 credits (no credit card required)
- Creator: ₹149/month (100 credits)
- Business: ₹499/month (500 credits)
- Agency: ₹1,999/month (2,500 credits)

Cancel anytime. No hidden fees.

📞 SUPPORT
- Email: support@aipostassistant.com
- Documentation: https://ai-post-assistant.vercel.app
- Privacy Policy: https://ai-post-assistant.vercel.app/privacy
- Terms: https://ai-post-assistant.vercel.app/terms

Made with ❤️ in India.
```

### Category
```
Productivity
```

### Language
```
English
```

### Graphic assets

| Asset | Size | What to show |
|---|---|---|
| Screenshot 1 | 1280×800 | Popup with generated results (titles, captions, hashtags) |
| Screenshot 2 | 1280×800 | Right-click context menu on selected text |
| Screenshot 3 | 1280×800 | Options page (API key setup) |
| Screenshot 4 | 1280×800 | Image analysis result |
| Screenshot 5 | 1280×800 | Content score card |
| Promo tile (small) | 440×280 | Extension icon + tagline |
| Promo tile (large) | 920×680 | Hero image with feature highlights |
| Icon | 128×128 | Already in extension |

### How to take screenshots
1. Load extension in Chrome
2. Open popup → generate a post → take screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)
3. Crop to 1280×800 using any image editor
4. Save as PNG

---

## 🔐 Step 3: Permission Justification (REQUIRED)

Chrome will ask you to justify each permission. Use these exact explanations:

| Permission | Justification |
|---|---|
| `contextMenus` | "Allows users to right-click selected text or images to generate AI content. Adds 'Generate posts from this text' and 'Analyze image with AI' to the right-click menu." |
| `storage` | "Stores the user's API key and preferences (default platform, tone) in chrome.storage.sync so settings persist across devices." |
| `activeTab` | "Reads the currently selected text on the active tab when the user explicitly triggers the context menu action. Does NOT access page content without user action." |
| `notifications` | "Shows a notification when the context menu action can't open the popup programmatically (Chrome limitation). The notification tells the user to click the extension icon." |

### Host permissions
Leave this BLANK. The extension does NOT need access to any specific website's content. It only reads what the user explicitly selects via right-click.

---

## 📄 Step 4: Privacy Policy

Your privacy policy is already created at `/privacy` on your frontend.

**Privacy Policy URL:** `https://your-app.vercel.app/privacy`

In the Chrome Web Store, set:
- **Privacy Policy URL:** your production URL
- **Data Usage Certification:** Check all boxes confirming you don't sell data, don't use it for unrelated purposes, etc.

---

## 🚀 Step 5: Submit

1. Go to https://chrome.google.com/webstore/devconsole
2. Click **Add new item**
3. Upload the ZIP file
4. Fill in all fields from Step 2
5. Upload screenshots + promo tiles
6. Add permission justifications (Step 3)
7. Add privacy policy URL (Step 4)
8. Click **Submit for review**

### Review timeline
- **First submission:** 1-7 business days
- **Updates:** 1-3 business days
- **Common rejection reasons:** Missing privacy policy, unclear permission justification, broken functionality

---

## ⚠️ Common Rejection Reasons & Fixes

| Reason | Fix |
|---|---|
| Missing privacy policy | Add `/privacy` page (already done) → submit URL |
| Unclear permission justification | Use the exact text from Step 3 above |
| Extension doesn't work | Test on fresh Chrome profile before submitting |
| Description too vague | Use the detailed description from Step 2 |
| Single-purpose violation | Make sure extension does ONE thing (AI content generation) — don't add unrelated features |
| Misleading screenshots | Screenshots must match actual functionality |
| Broken links | Verify all URLs in description work |

---

## 📊 After Approval

### Track analytics
- Chrome Web Store dev console shows installs, uninstalls, ratings
- Check weekly for user feedback

### Plan updates
- Bug fixes: bump patch version (1.0.0 → 1.0.1)
- New features: bump minor version (1.0.0 → 1.1.0)
- Breaking changes: bump major version (1.0.0 → 2.0.0)

### Respond to reviews
- Reply to every review (positive and negative) within 48 hours
- For bug reports: acknowledge + ask them to email support
- For feature requests: "Thanks! Added to our roadmap."

### Promote your extension
- Add "Chrome Extension" badge to your landing page
- Include in onboarding email
- Mention in blog posts / social media
- Add to Chrome Web Store collection: "Extensions by [your brand]"

---

## 🔄 Update Process

1. Make changes to extension code
2. Bump version in `chrome-extension/package.json`
3. `npm run build`
4. ZIP the `dist/` folder
5. Upload to Chrome Web Store dev console
6. Users auto-update within 24 hours of approval

---

## 📞 Support Contacts

- Chrome Web Store help: https://support.google.com/chrome_webstore
- Stack Overflow tag: [chrome-extension]
- Your support email: support@aipostassistant.com
