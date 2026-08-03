import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Hash,
  PenTool,
  Brain,
  Calendar,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  RefreshCw,
  Type,
  MemoryStick,
  LayoutTemplate,
  Zap,
  Shield,
  Globe,
  Star,
  Quote,
} from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const heroFeatures = [
  {
    icon: PenTool,
    title: 'AI Caption Generator',
    desc: 'Scroll-stopping captions for every platform — tuned to your tone, niche, and audience. Get 3 variations in seconds.',
    bullets: ['3 caption variations per request', 'Tone, niche & audience aware', 'Hinglish, Hindi & 7+ languages'],
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Hash,
    title: 'Hashtag Generator',
    desc: 'Smart, niche-matched hashtags that actually reach the right audience. No more guessing.',
    bullets: ['Niche-matched suggestions', 'Mix of reach + niche tags', '1-click copy in bulk'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Type,
    title: 'Title Generator',
    desc: 'High-CTR titles for YouTube, blogs, and posts. Curiosity-driven, SEO-aware, and platform-optimized.',
    bullets: ['10+ title variations', 'SEO keyword hints', 'Length-per-platform optimized'],
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Brain,
    title: 'Brand Voice',
    desc: 'Teach the AI your voice once — every generation matches your style forever. No more generic AI text.',
    bullets: ['Save tone, niche & audience', 'Banned-word control', 'Live voice preview'],
    color: 'from-emerald-500 to-teal-500',
  },
];

const featureModules = [
  {
    icon: Calendar,
    title: 'Content Calendar',
    desc: 'Generate day-by-day content plans for 7, 14, 30, 60, or 90 days. Never run out of ideas again.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: RefreshCw,
    title: 'Scheduling',
    desc: 'Plan your posts visually and schedule across platforms. Track what goes out and when.',
    color: 'from-cyan-500 to-sky-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'See which platforms, niches, and tones you use most. Find your winning pattern with content scoring.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: MemoryStick,
    title: 'AI Memory',
    desc: 'Remembers your past hashtags, tones, and niches. Avoids duplicates and gets smarter with every generation.',
    color: 'from-fuchsia-500 to-pink-500',
  },
  {
    icon: LayoutTemplate,
    title: 'Templates',
    desc: '12 starter prompts and 6 post templates — Trending, Educational, Listicle, Question, Story, Data.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: ImageIcon,
    title: 'Image Analysis',
    desc: 'Upload any image and get caption, alt text, hashtags, and CTA — perfect for reposts and inspiration.',
    color: 'from-purple-500 to-violet-500',
  },
];

const stats = [
  { value: '7+', label: 'AI Modules' },
  { value: '6', label: 'Platforms' },
  { value: '10s', label: 'Avg generation' },
  { value: '120K+', label: 'Iterations refined' },
];

const testimonials = [
  {
    name: 'Maya Rodriguez',
    role: 'Lifestyle Creator',
    quote: 'I used to spend 30 mins writing one caption. Now it takes 30 seconds. My engagement is up 40%.',
    avatar: 'MR',
  },
  {
    name: 'Alex Chen',
    role: 'Tech YouTuber',
    quote: 'The Brand Voice feature is gold. Every description sounds exactly like me.',
    avatar: 'AC',
  },
  {
    name: 'Priya Kapoor',
    role: 'Fashion Influencer',
    quote: 'Repurposing one Reel into 6 platform posts in one click gave me my evenings back.',
    avatar: 'PK',
  },
];

const trust = [
  { icon: Shield, title: 'Bank-grade security', desc: 'PBKDF2 hashing, HMAC sessions, HttpOnly cookies, HTTPS.' },
  { icon: Zap, title: 'Fast & reliable', desc: 'GPT-4o-mini primary, Gemini fallback, never get blocked.' },
  { icon: Globe, title: '6 platforms', desc: 'Instagram, YouTube, LinkedIn, X, Facebook, WhatsApp.' },
];

export default function Features() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <Sparkles className="h-3 w-3" /> Features
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Everything you need to <span className="text-gradient">create faster</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            From idea to ready-to-post in under 30 seconds. AI Post Assistant is the complete
            content operating system for creators, coaches, and small businesses.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="btn-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing" className="btn-secondary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              View pricing
            </Link>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="card p-6 text-center">
              <p className="font-display text-3xl font-bold text-gradient">{s.value}</p>
              <p className="mt-1 text-xs text-text-secondary">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Hero feature cards */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-5 md:grid-cols-2">
          {heroFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card group relative overflow-hidden p-7 transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className={`mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-glow`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Feature modules */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">Modules</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            A complete <span className="text-gradient">content OS</span>
          </h2>
          <p className="mt-3 text-text-secondary">Every module works together so you never start from scratch.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureModules.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card group p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${m.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">{m.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{m.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">Loved by creators</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Trusted by creators &amp; businesses</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card h-full p-6"
            >
              <Quote className="h-5 w-5 text-brand" />
              <p className="mt-3 text-text-primary">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">{t.avatar}</span>
                <div>
                  <p className="font-semibold text-text-primary">{t.name}</p>
                  <p className="text-sm text-text-secondary">{t.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          {trust.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card p-6"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-success/10 text-success">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">{t.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{t.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card relative overflow-hidden p-10 text-center md:p-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-secondary/10" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Start free. <span className="text-gradient">Scale when ready.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-text-secondary">
              10 free credits on signup — no credit card required. Upgrade only when you need more.
            </p>
            <Link to="/pricing" className="btn-brand mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              See pricing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

