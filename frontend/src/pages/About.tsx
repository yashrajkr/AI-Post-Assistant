import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Rocket, Heart, ArrowRight, Map, Lightbulb, Users, Sparkles } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const timeline = [
  { year: '2024', title: 'The idea', desc: 'AI Post Assistant started as a simple caption generator for creators who were tired of spending hours writing posts.' },
  { year: '2025', title: 'The content OS', desc: 'We grew into a full content operating system — captions, hashtags, scheduling, analytics, and brand voice in one place.' },
  { year: '2026', title: 'Production SaaS', desc: 'Bank-grade security, Supabase storage, Razorpay payments, and a Chrome extension — a platform ready for real users.' },
  { year: 'Now', title: 'Scaling globally', desc: 'Serving creators, coaches, agencies, and businesses across India and beyond.' },
];

const roadmap = [
  { icon: Sparkles, title: 'Video understanding', desc: 'Analyze videos and shorts to generate captions and clips.' },
  { icon: Users, title: 'Team workspace', desc: 'Shared brand brain, roles, and collaborative calendars for teams.' },
  { icon: Map, title: 'Prompt marketplace', desc: 'Monetize and share your best prompts with the community.' },
  { icon: Lightbulb, title: 'Competitor analysis', desc: 'Track competitor content patterns and stand out in your niche.' },
];

const values = [
  { icon: Heart, title: 'Creators first', desc: 'Every feature is built to save creators time and grow their audience.' },
  { icon: Rocket, title: 'Ship fast', desc: 'We iterate weekly based on real user feedback — no feature bloat.' },
  { icon: Users, title: 'India-first, global-ready', desc: 'Built for Indian creators, with Hinglish support and global platforms.' },
];

const faqs = [
  { q: 'Who is AI Post Assistant for?', a: 'Creators, coaches, students, small businesses, agencies, and influencers who want to publish consistent, high-quality content faster.' },
  { q: 'Do I need technical skills?', a: 'No. If you can type a one-line idea, you can generate a complete post package in seconds.' },
  { q: 'What makes it different from ChatGPT?', a: 'AI Post Assistant is purpose-built for social content — it produces platform-ready packages (captions, hashtags, CTAs, titles) with scoring, scheduling, and brand voice built in.' },
  { q: 'Is my content private?', a: 'Yes. Your content is stored securely in Supabase with row-level security. Only you can access your generations.' },
];

export default function About() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <Sparkles className="h-3 w-3" /> About us
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            We help creators turn ideas into <span className="text-gradient">ready-to-post content</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            AI Post Assistant is on a mission to make professional content creation effortless
            for every creator, coach, and business — in seconds, not hours.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-5 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card p-8">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-bold text-text-primary">Our Mission</h2>
            <p className="mt-3 text-text-secondary leading-relaxed">
              To give every creator the unfair advantage of a full content team. Whether you're a
              student sharing study tips, a coach launching a batch, or an agency managing multiple
              clients — we make world-class content a one-click reality.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="card p-8">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-secondary/10 text-secondary">
              <Rocket className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-bold text-text-primary">Our Vision</h2>
            <p className="mt-3 text-text-secondary leading-relaxed">
              A world where no good idea is lost to writer's block. We envision AI Post Assistant as
              the default content brain for millions of creators — learning their voice, remembering
              their audience, and producing content that truly sounds like them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">Why us</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Why <span className="text-gradient">AI Post Assistant</span>
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card p-6"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">{v.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{v.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-20">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">Timeline</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Our journey</h2>
        </div>
        <div className="space-y-6">
          {timeline.map((t, i) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card relative flex gap-5 p-6"
            >
              <div className="flex flex-col items-center">
                <span className="rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-white">{t.year}</span>
                <span className="mt-2 h-full w-px bg-border" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-text-primary">{t.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">Future roadmap</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">What's next</h2>
          <p className="mt-3 text-text-secondary">A sneak peek at what we're building.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roadmap.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-secondary/10 text-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-text-primary">{r.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{r.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Founder story placeholder */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-20">
        <div className="card p-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-2xl font-bold text-white shadow-glow">Y</span>
            <div>
              <h2 className="font-display text-2xl font-bold text-text-primary">Founder's story</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                <em>
                  "I spent years watching creators, coaches, and small businesses struggle to post
                  consistently. Talented people with amazing ideas — but no time to write captions,
                  research hashtags, or plan a content calendar. So I built the tool I wished existed:
                  one idea in, a complete ready-to-post package out. AI Post Assistant is that tool,
                  and it's only the beginning."
                </em>
              </p>
              <p className="mt-3 text-sm text-text-tertiary">— The Founder, AI Post Assistant</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-20">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">FAQ</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Common questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="card p-5"
            >
              <h3 className="font-semibold text-text-primary">{f.q}</h3>
              <p className="mt-2 text-sm text-text-secondary">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-24">
        <div className="card relative overflow-hidden p-10 text-center md:p-14">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-secondary/10" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Ready to <span className="text-gradient">create faster?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-text-secondary">
              Join thousands of creators using AI Post Assistant to publish better content, faster.
            </p>
            <Link to="/signup" className="btn-brand mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

