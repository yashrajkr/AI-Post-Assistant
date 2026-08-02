# V2 Roadmap — Features Requiring Separate Projects

This document covers the v2 features that **cannot be built inside the current AI Post Assistant codebase**. Each one requires its own separate project, infrastructure, or technology stack.

If you try to build these inside the main app, you will break it. Don't.

---

## ❌ Features NOT Built (and why)

### 1. Video Understanding
**Why not in main app:** Video processing requires GPU instances, ffmpeg, and significant storage. Mixing this with the Express backend would slow everything down and cost $$.

**What you need:**
- Separate Node.js/Python microservice running on a GPU instance (RunPod, Lambda Labs, or AWS EC2 g4dn)
- ffmpeg for video frame extraction
- Whisper API (or local Whisper) for audio transcription
- OpenAI GPT-4 Vision for frame analysis
- S3/Supabase Storage for video uploads (videos are too big for DB)
- Queue system (BullMQ + Redis) — video processing takes 30s-5min per video

**Estimated effort:** 2 weeks (1 engineer)
**Estimated monthly cost:** $50-200 depending on usage

**Architecture:**
```
User uploads video → Main app sends job to queue →
Video worker picks up job → extracts frames + audio →
calls Vision AI → returns structured result →
Main app saves result + notifies user
```

---

### 2. Team Workspace
**Why not in main app:** Requires real-time collaboration (WebSockets), role-based access control (RBAC), and a complete rewrite of every data query to support team-scoped data.

**What you need:**
- WebSocket server (Socket.io or Supabase Realtime)
- New `teams`, `team_members`, `team_invites` tables
- Migration of every existing table to add `team_id` column
- Role system: Owner, Admin, Editor, Viewer
- Permission checks on every API endpoint
- Real-time presence (who's online, who's editing)
- Comments system with @mentions
- Activity log (who did what, when)

**Estimated effort:** 3 weeks (1 engineer)
**Recommended approach:** Build as a separate "Teams" microservice that wraps the existing solo app

---

### 3. Prompt Marketplace
**Why not in main app:** Requires seller accounts, payment splitting, dispute resolution, and tax compliance. This is basically building a mini-App Store.

**What you need:**
- Seller onboarding flow (KYC, bank details, tax info)
- Payment splitting via Razorpay Route or Stripe Connect
- Commission system (e.g., 30% platform fee)
- Refund + dispute resolution workflow
- Seller dashboard (sales, earnings, payouts)
- Search + discovery (browse prompts by category, rating, price)
- Review system with verified-purchase badges
- Tax documentation (1099-K for US, GST for India)

**Estimated effort:** 2 weeks (1 engineer + 1 lawyer/accountant)
**Legal complexity:** HIGH — seller payments are regulated

---

### 4. Real-time Collaboration
**Why not in main app:** Requires WebSocket infrastructure that doesn't fit cleanly into the current Express setup.

**What you need:**
- WebSocket server (Socket.io, Pusher, or Supabase Realtime)
- CRDT or OT library for conflict-free editing (Yjs, ShareDB)
- Presence indicators (who's viewing, who's typing)
- Operational transform for text fields
- Real-time cursor positions
- Conflict resolution logic

**Estimated effort:** 2 weeks (1 engineer)
**Recommended:** Use Supabase Realtime — it's already in your stack

---

### 5. Mobile App (React Native)
**Why not in main app:** This is an entirely separate codebase, separate deployment, separate app store review process.

**What you need:**
- React Native + Expo project (separate repo)
- Reuse the v10 backend API (no changes needed)
- Push notifications (Firebase Cloud Messaging for Android, APNs for iOS)
- App Store Developer Account ($99/year for Apple, $25 one-time for Google Play)
- App Store review process (1-7 days per submission)
- Offline-first data sync
- Native navigation patterns (bottom tabs, stack navigation)

**Estimated effort:** 2 months (1 mobile engineer)
**Cost:** $124 for app store accounts + ongoing maintenance

**Recommended approach:**
1. Use Expo for fastest development
2. Reuse all backend API endpoints (they're already mobile-friendly)
3. Use React Native Paper or NativeBase for UI components
4. Don't try to share code with the Next.js app — the patterns are too different

---

### 6. WhatsApp Bot
**Why not in main app:** WhatsApp Business API has strict requirements and needs its own webhook handler.

**What you need:**
- WhatsApp Business API account (apply at business.whatsapp.com)
- Verified business phone number
- Separate webhook server (can be a route in your existing Express app, but needs to handle WhatsApp's specific verification)
- Twilio or directly WhatsApp Cloud API
- Template message approval process (1-3 days per template)
- Opt-in management (users must consent to receive messages)

**Estimated effort:** 2 weeks (1 engineer)
**Cost:** WhatsApp charges per conversation ($0.005-0.08 depending on country)

**Architecture:**
```
User sends WhatsApp message → WhatsApp Cloud API →
Your webhook receives POST → processes with existing AI service →
Returns text response → WhatsApp sends back to user
```

---

### 7. Telegram Bot
**Why not in main app:** Similar to WhatsApp — needs its own bot token + webhook handler.

**What you need:**
- Telegram Bot Token (from @BotFather — free)
- Webhook handler (can be a route in Express)
- Bot commands (/generate, /calendar, /help)
- Inline keyboard for platform selection
- Photo handling for image analysis

**Estimated effort:** 1 week (1 engineer)
**Cost:** Free

**Easier than WhatsApp** — Telegram's API is more developer-friendly

---

### 8. Chrome Extension
**Why not in main app:** This is a separate browser extension with its own build process, manifest, and store submission.

**What you need:**
- Manifest V3 Chrome extension (separate repo)
- Content script that detects when user is on Instagram/LinkedIn/X
- Popup UI for quick generation
- Background service worker
- Chrome Web Store developer account ($5 one-time)
- Permission requests (activeTab, storage, host permissions)

**Estimated effort:** 2 weeks (1 engineer)
**Cost:** $5 one-time for Chrome Web Store

**Use cases:**
- Right-click any text → "Generate posts from this"
- Sidebar panel showing AI suggestions while writing
- Auto-fill captions when posting on social platforms

---

## ✅ Features I DID Build (v2 starter pack)

Instead of pretending I can build all 12 features in one session, I built the 4 that are actually feasible inside the existing codebase:

| Feature | Route | Status |
|---|---|---|
| AI Content Calendar | `/calendar` | ✅ Built |
| Campaign Builder | `/campaigns` | ✅ Built |
| Brand Health Dashboard | `/brand-health` | ✅ Built |
| Document-to-content (PDF/TXT) | `/document` | ✅ Built |

Each of these reuses the existing AI provider chain, storage layer, and design system — no new infrastructure needed.

---

## 🎯 Recommended Next Steps (in priority order)

### Phase 1 — Launch the current app (Week 1-2)
1. Configure real API keys (OpenAI, Supabase, Razorpay)
2. Deploy backend to Render, frontend to Vercel
3. Get 10 real users
4. Fix bugs they report

### Phase 2 — Build the cheap v2 add-ons (Month 2)
5. **Telegram bot** (1 week, free) — easiest bot to build, great for India audience
6. **Chrome extension** (2 weeks, $5) — power users will love it

### Phase 3 — Build the expensive v2 add-ons (Month 3-4)
7. **Video understanding** (2 weeks, $50-200/mo) — only if users ask for it
8. **WhatsApp bot** (2 weeks, per-message cost) — only after Telegram proves the bot concept works
9. **Mobile app** (2 months, $124) — only if you have 1000+ daily active users

### Phase 4 — Build the hard features (Month 5+)
10. **Team Workspace** (3 weeks) — only if businesses ask for it
11. **Prompt Marketplace** (2 weeks + legal) — only if you have 100+ prompt creators
12. **Real-time collaboration** (2 weeks) — only if teams actually use it together

---

## 🚫 What NOT to Do

1. **Don't build all 12 features at once.** You'll ship nothing.
2. **Don't build mobile app before web app has 100+ users.** Mobile is expensive to maintain.
3. **Don't build marketplace before you have 50+ prompt creators.** Marketplaces die without supply.
4. **Don't build video understanding before users ask for it 10+ times.** GPU costs add up fast.
5. **Don't build team workspace before businesses ask for it.** Solo creators are your market first.

---

## 📊 Total Cost Summary

If you built EVERYTHING (not recommended):

| Feature | One-time cost | Monthly cost |
|---|---|---|
| Current app (v11) | $0 | $0-50 (Render + Vercel free tiers) |
| Video understanding | $0 | $50-200 (GPU instances) |
| Telegram bot | $0 | $0 |
| WhatsApp bot | $0 | $20-100 (per-message fees) |
| Chrome extension | $5 | $0 |
| Mobile app | $124 | $0 (until 100K users) |
| **Total if all built** | **$129** | **$70-350/month** |

**My honest recommendation:** Build the current app → launch → get users → THEN decide which v2 features they actually want. Don't build features nobody asked for.
