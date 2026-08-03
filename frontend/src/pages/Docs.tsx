import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Rocket,
  KeyRound,
  CreditCard,
  Wand2,
  Calendar,
  RefreshCw,
  BarChart3,
  Search,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

const guides = [
  {
    icon: Rocket,
    title: 'Getting started',
    desc: 'Create your account, claim your free credits, and generate your first post package in under 2 minutes.',
    steps: ['Sign up for free', 'Choose your niche & platform', 'Type a one-line idea', 'Hit Generate and copy your package'],
  },
  {
    icon: Wand2,
    title: 'Generating content',
    desc: 'Master captions, hashtags, titles, CTAs, and the multi-platform generator.',
    steps: ['Pick a platform or enable multi-platform mode', 'Select your niche and template', 'Use advanced options for tone, language & audience', 'Copy, save, or schedule your output'],
  },
  {
    icon: KeyRound,
    title: 'Brand Brain & Memory',
    desc: 'Teach the AI your voice once and make every generation sound like you.',
    steps: ['Set your brand name, tagline, and niche', 'Choose tones and CTA style', 'Add banned words', 'Preview your voice before saving'],
  },
  {
    icon: CreditCard,
    title: 'Plans, credits & billing',
    desc: 'Understand credits, plans, upgrades, and how payments work with Razorpay.',
    steps: ['Free plan includes 10 credits on signup', 'Each generation uses 1 credit', 'Upgrade from the Pricing page', 'Pay securely via Razorpay'],
  },
  {
    icon: Calendar,
    title: 'Calendar & scheduling',
    desc: 'Plan a week, a month, or a launch with the AI Content Calendar.',
    steps: ['Enter a series title', 'Pick a duration (7–90 days)', 'Generate a day-by-day plan', 'Copy or schedule your posts'],
  },
  {
    icon: RefreshCw,
    title: 'Repurposing content',
    desc: 'Turn one input into six platform-optimized outputs.',
    steps: ['Paste your source content', 'Choose target platforms', 'Generate platform-specific versions', 'Copy each output'],
  },
  {
    icon: BarChart3,
    title: 'Analytics & scoring',
    desc: 'Track your usage and improve with AI content scores.',
    steps: ['Review your usage stats on the dashboard', 'Check the Analytics page for patterns', 'Use content scores to improve hooks and CTAs'],
  },
  {
    icon: BookOpen,
    title: 'Prompt Library',
    desc: 'Save, reuse, and share your best AI prompts.',
    steps: ['Browse starter prompts', 'Create your own prompt', 'Mark it public or private', 'Apply any prompt with one click'],
  },
];

const faqs = [
  { q: 'How do I get more credits?', a: 'Each paid plan adds monthly credits. Upgrade from the Pricing page — payment is handled securely by Razorpay.' },
  { q: 'Can I use AI Post Assistant on my phone?', a: 'Yes. The app is fully responsive, and it is installable as a PWA from your browser.' },
  { q: 'How do I cancel my subscription?', a: 'Go to Profile → Subscription → Manage, or contact support. You keep access until the end of your billing period.' },
  { q: 'Is there a Chrome extension?', a: 'Yes — generate posts from any web page. See the Chrome Extension guide in the docs folder.' },
];

export default function Docs() {
  const [query, setQuery] = useState('');
  const filtered = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(query.toLowerCase()) ||
      g.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <BookOpen className="h-3 w-3" /> Documentation
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Learn the <span className="text-gradient">platform</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            Step-by-step guides to get the most out of AI Post Assistant.
          </p>

          {/* Search */}
          <div className="relative mx-auto mt-8 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documentation..."
              className="input-field w-full py-3 pl-10 pr-4 text-sm"
            />
          </div>
        </motion.div>

        {/* Guides */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">{g.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{g.desc}</p>
                <ol className="mt-4 flex-1 space-y-2">
                  {g.steps.map((s, si) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-hover text-[10px] font-bold text-brand">
                        {si + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold text-text-primary">Quick answers</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="card p-5">
                <h3 className="font-semibold text-text-primary">{f.q}</h3>
                <p className="mt-2 text-sm text-text-secondary">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/help" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline">
              Visit the Help Center <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

