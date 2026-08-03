import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Hash,
  Megaphone,
  PenTool,
  Calendar,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Brain,
  RefreshCw,
  Image as ImageIcon,
  Library,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react';
import Footer from '@/components/Footer';
import PublicHeader from '@/components/PublicHeader';

// ============================================================================
// Data
// ============================================================================

const FEATURES = [
  {
    icon: PenTool,
    title: 'Caption Generator',
    desc: 'Get 3 caption variations tailored to your tone, niche, and platform — in seconds.',
  },
  {
    icon: Hash,
    title: 'Smart Hashtags',
    desc: 'Hashtags that actually match your content and reach the right audience.',
  },
  {
    icon: Megaphone,
    title: 'CTA Builder',
    desc: 'Calls-to-action that convert — from "DM ADMISSION" to "Tap to order".',
  },
  {
    icon: Calendar,
    title: 'Content Planner',
    desc: 'Schedule your posts visually. Plan a week, a month, or a launch in advance.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'See which platforms, niches, and tones you use most. Find your winning pattern.',
  },
  {
    icon: Brain,
    title: 'Brand Brain',
    desc: 'Teach the AI your tone once. Every generation matches your style forever.',
  },
  {
    icon: ImageIcon,
    title: 'Image Analysis',
    desc: 'Upload any image. AI returns caption, alt text, hashtags, and CTA.',
  },
  {
    icon: RefreshCw,
    title: 'AI Repurposer',
    desc: 'One input → 6 platform-optimized outputs in a single click.',
  },
];

const MODULES = [
  {
    icon: Brain,
    title: 'AI Brand Brain',
    desc: 'Teach AI your tone, audience, and CTA once. Every generation matches your voice forever — no more generic-sounding posts.',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: BarChart3,
    title: 'AI Content Score',
    desc: 'Score every post on Hook, SEO, CTA, Readability, Virality, and Emotion. AI suggests concrete improvements.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Sparkles,
    title: 'AI Memory',
    desc: 'Remembers your past hashtags, tones, niches. Avoids duplicates and gets smarter with every generation.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Library,
    title: 'Prompt Library',
    desc: 'Save and reuse your best AI prompts. 12 starter prompts included. Rate and share with the community.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: ImageIcon,
    title: 'Image Understanding',
    desc: 'Upload any image. AI returns caption, alt text, hashtags, and CTA — perfect for reposts and inspiration.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: RefreshCw,
    title: 'AI Repurposer',
    desc: 'One input → 6 platform-optimized outputs. Turn a blog post into Instagram, Twitter, LinkedIn, and more.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Globe,
    title: 'Multi-Platform Generation',
    desc: 'Generate for Instagram, YouTube, LinkedIn, Facebook, X, and WhatsApp — all at once with tabbed output.',
    color: 'from-teal-500 to-green-500',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Describe your idea',
    desc: 'Type a one-line idea like "Launching my new fitness coaching program". Pick a platform and niche.',
    icon: PenTool,
  },
  {
    num: '02',
    title: 'AI generates the package',
    desc: 'Get titles, captions, hashtags, CTA, and a content score — all in under 10 seconds.',
    icon: Sparkles,
  },
  {
    num: '03',
    title: 'Copy, schedule, and post',
    desc: 'Copy any output with one click. Schedule it to your calendar. Track what works in analytics.',
    icon: CheckCircle2,
  },
];

const STATS = [
  { value: '7', label: 'AI Modules', icon: Sparkles },
  { value: '6', label: 'Platforms Supported', icon: Globe },
  { value: '10s', label: 'Avg Generation Time', icon: Zap },
  { value: '120K+', label: 'Iterations Refined', icon: TrendingUp },
];

const TESTIMONIALS = [
  {
    name: 'Maya Rodriguez',
    role: 'Lifestyle Creator, 240K followers',
    quote: 'I used to spend 30 mins writing one Instagram caption. Now it takes 30 seconds. My engagement is up 40%.',
    avatar: 'MR',
  },
  {
    name: 'Alex Chen',
    role: 'Tech YouTuber, 1.2M subscribers',
    quote: 'The Brand Voice feature is gold. Every video description sounds exactly like me — no more generic AI text.',
    avatar: 'AC',
  },
  {
    name: 'Priya Kapoor',
    role: 'Fashion Influencer, 580K followers',
    quote: 'Repurposing one Reel into 6 platform posts with one click is a game-changer. I finally have my evenings back.',
    avatar: 'PK',
  },
];

const FAQ = [
  {
    q: 'How many free credits do I get?',
    a: '10 free credits on signup — no credit card required. Each AI generation uses 1 credit.',
  },
  {
    q: 'Which AI providers are supported?',
    a: 'OpenAI GPT-4o-mini (primary) and Gemini 1.5 Flash (fallback). If both are down, the app shows a sample response so you are never blocked.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. Subscriptions cancel instantly. You keep access until the end of your billing period.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Passwords are hashed with PBKDF2 (120,000 rounds). Sessions use signed HttpOnly cookies. We never share your data.',
  },
  {
    q: 'Does it work for Hinglish content?',
    a: 'Yes! The AI is tuned for Indian audiences and supports Hinglish, English, Hindi, and 4 other languages.',
  },
  {
    q: 'Is there a Chrome extension?',
    a: 'Yes — generate posts from any web page. Right-click selected text or an image and choose "Generate with AI Post Assistant".',
  },
];

const PLATFORMS = [
  { name: 'Instagram', emoji: '📸' },
  { name: 'YouTube', emoji: '▶️' },
  { name: 'LinkedIn', emoji: '💼' },
  { name: 'Twitter / X', emoji: '🐦' },
  { name: 'Facebook', emoji: '👍' },
  { name: 'WhatsApp', emoji: '💬' },
];

// ============================================================================
// Helper: visible-on-mount animation (NOT whileInView, which fails in
// screenshots and when the user doesn't scroll)
// ============================================================================
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ============================================================================
// Component
// ============================================================================

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-info/10 blur-3xl" />

      {/* Public header */}
      <PublicHeader />

      {/* ============================================================ */}
      {/* Hero */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-20 md:pt-24 md:pb-32">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles className="h-3 w-3" /> AI workspace for creators
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Turn one idea into a{' '}
              <span className="text-gradient">ready-to-post</span> content package.
            </h1>
            <p className="mt-6 max-w-md text-lg text-text-secondary">
              Generate captions, titles, hashtags, keywords, descriptions, CTAs, thumbnail ideas and posting tips for Instagram, YouTube, LinkedIn, Facebook, X and WhatsApp — in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
<Link
                to="/signup"
                className="btn-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
              >
                Start free — 10 credits <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/pricing"
                className="btn-secondary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
              >
                View pricing
              </Link>
              <Link
                to="/features"
                className="btn-ghost inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
              >
                Explore features
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Cancel anytime
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Production-ready
              </span>
            </div>
          </motion.div>

          {/* Hero preview card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="card overflow-hidden p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Input
                </span>
                <span className="text-sm font-medium text-text-primary">Launching my new fitness coaching program</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Output
                  </span>
                  <div className="mt-2 space-y-2">
                    <div className="rounded-lg bg-surface-2 p-3">
                      <p className="text-xs text-text-tertiary">Title</p>
                      <p className="font-medium text-text-primary">Transform Your Body in 90 Days 💪</p>
                    </div>
                    <div className="rounded-lg bg-surface-2 p-3">
                      <p className="text-xs text-text-tertiary">CTA</p>
                      <p className="font-medium text-text-primary">DM "FIT" to start your journey today.</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['#FitnessJourney', '#CoachLife', '#HealthyLiving', '#FitFam'].map((tag) => (
                        <span key={tag} className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs text-text-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-text-tertiary">
                  Includes captions, hashtags, keywords, thumbnail text and posting tips.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Platform strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 opacity-70">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="text-lg">{p.emoji}</span>
              <span className="font-medium">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* Stats */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card p-6 text-center"
              >
                <Icon className="mx-auto h-6 w-6 text-brand" />
                <p className="mt-3 font-display text-3xl font-bold text-gradient">{s.value}</p>
                <p className="mt-1 text-xs text-text-secondary">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* Features (8 cards) */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">Features</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Everything you need to <span className="text-gradient">create faster</span>
          </h2>
          <p className="mt-3 text-text-secondary">From idea to ready-to-post in under 30 seconds.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="card group h-full p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-text-primary">{feature.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* How it works (3 steps) */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">How it works</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            From idea to post in <span className="text-gradient">3 simple steps</span>
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative card p-6"
              >
                <div className="absolute -top-3 -right-3 grid h-10 w-10 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white shadow-glow">
                  {step.num}
                </div>
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7 Modules showcase */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">AI Content OS</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            7 modules that turn this into an{' '}
            <span className="text-gradient">AI Content Operating System</span>
          </h2>
          <p className="mt-3 text-text-secondary">
            Not just a caption generator — a complete workspace for content creators.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card group relative overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${mod.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">{mod.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{mod.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* Testimonials */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">Loved by creators</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Trusted by creators &amp; businesses
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card h-full p-6"
            >
              <div className="mb-3 flex gap-0.5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-text-primary">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                  {t.avatar}
                </span>
                <div>
                  <p className="font-semibold text-text-primary">{t.name}</p>
                  <p className="text-sm text-text-secondary">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* FAQ */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 py-20">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">FAQ</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Questions?</h2>
        </div>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="card p-5"
            >
              <h3 className="font-semibold text-text-primary">{item.q}</h3>
              <p className="mt-2 text-sm text-text-secondary">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* Security / Trust */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Shield, title: 'Bank-grade security', desc: 'PBKDF2 password hashing, HMAC-signed sessions, HttpOnly cookies, HTTPS everywhere.' },
            { icon: Zap, title: 'Fast & reliable', desc: 'GPT-4o-mini primary, Gemini fallback, sample-output safety net. Never get blocked.' },
            { icon: Users, title: 'Built for teams', desc: 'From solo creators to teams. Shared Brand Brain, API access, and audit logs on Team plan.' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card p-6"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-success/10 text-success">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* Final CTA */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-20">
        <div className="card relative overflow-hidden p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-secondary/10" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Start creating <span className="text-gradient">today</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-text-secondary">
              Join creators using AI Post Assistant to grow faster.
            </p>
            <Link
              to="/signup"
              className="btn-brand mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
            >
              Get 10 free credits <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Footer */}
      {/* ============================================================ */}
      <Footer variant="landing" />
    </div>
  );
}
