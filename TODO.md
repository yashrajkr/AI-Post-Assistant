# AI Post Assistant — SaaS Polish & Navigation Overhaul

## Phase 1 — Cleanup
- [ ] Delete stray `c` temp file at repo root
- [ ] Move `prompt3-preview.html` into `docs/`
- [ ] Consolidate duplicate root `DEPLOYMENT.md` / `FINAL_REPORT.md` (keep in docs/)

## Phase 2 — Header redesign (PublicHeader.tsx)
- [ ] Logged-out menu: Home, Features, Pricing, About, Contact, Login, Get Started
- [ ] Logged-in menu: Dashboard, Generate, History, Analytics, Pricing + avatar dropdown (Profile, Settings, Logout)
- [ ] Active page highlighting
- [ ] Smooth scrolling
- [ ] Responsive mobile navigation
- [ ] Keyboard accessibility
- [ ] Hover animations + dropdown animations

## Phase 3 — Footer redesign (Footer.tsx)
- [ ] Product column (Features, Pricing, Roadmap, API (Coming Soon), Prompt Library)
- [ ] Use Cases column (Creators, Students, Coaching Institutes, Small Businesses, Agencies, Influencers)
- [ ] Resources column (Blog (Coming Soon), Help Center, Documentation, FAQ)
- [ ] Company column (About, Contact, Privacy Policy, Terms of Service, Changelog)
- [ ] Social column (GitHub, LinkedIn, Twitter, YouTube)
- [ ] Bottom bar: Copyright, Version, Made with ❤️, responsive

## Phase 4 — Create pages
- [ ] Features page
- [ ] About page
- [ ] Contact page
- [ ] Roadmap page
- [ ] Changelog page
- [ ] Docs page
- [ ] Help Center page
- [ ] FAQ page
- [ ] API page (Coming Soon)
- [ ] Blog page (Coming Soon)
- [ ] Use Cases pages (/use-cases/:slug)
- [ ] Settings page

## Phase 5 — Routing (App.tsx)
- [ ] Move /pricing to public routes
- [ ] Register all new public routes
- [ ] Add /settings protected route

## Phase 6 — Pricing fix (Pricing.tsx)
- [ ] Public access (no login required)
- [ ] Upgrade → logged-in opens payment (create-order + verify-payment)
- [ ] Upgrade → logged-out redirects to /login with from=/pricing, returns after login

## Phase 7 — Legal pages polish
- [ ] Verify Privacy (Data Collection, Cookies, Auth, Google, Supabase, Razorpay, AI, Storage, Contact, Last Updated)
- [ ] Verify Terms (Acceptable Use, Payments, Subscriptions, Refunds, AI Usage, Copyright, Termination, Liability, Contact)

## Phase 8 — App shell & Profile
- [ ] Add Settings to AppShell nav
- [ ] Fix Profile "Manage" link to use Link component

## Phase 9 — Production check
- [ ] frontend build passes
- [ ] frontend typecheck passes
- [ ] frontend lint passes
- [ ] backend tests pass
- [ ] server boots

## Phase 10 — FINAL_REPORT.md
- [ ] Comprehensive final report

