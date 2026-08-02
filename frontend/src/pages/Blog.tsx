import { motion } from 'framer-motion';
import { Newspaper, Mail, ArrowRight, Clock, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui';

const plannedPosts = [
  { title: '10 AI captions that get more saves (with examples)', cat: 'Content tips' },
  { title: 'How to find your brand voice in 15 minutes', cat: 'Branding' },
  { title: 'The creator scheduling system that never burns out', cat: 'Productivity' },
  { title: 'Hashtag strategy for Indian creators in 2026', cat: 'Growth' },
  { title: 'Repurposing 101: one idea, six platforms', cat: 'Content tips' },
  { title: 'AI content score: what the numbers actually mean', cat: 'Features' },
];

export default function Blog() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <Newspaper className="h-3 w-3" /> Blog
          </span>
          <div className="mt-4 flex items-center justify-center gap-3">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Insights & <span className="text-gradient">tips</span>
            </h1>
            <Badge tone="warning">Coming soon</Badge>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            We're writing practical guides on AI content, brand voice, and creator productivity.
            Sign up to get notified when we publish.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="input-field flex-1 px-4 py-3 text-sm"
            />
            <button type="submit" className="btn-brand inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">
              <Mail className="h-4 w-4" /> Notify me
            </button>
          </form>
        </motion.div>

        {/* Planned posts */}
        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold text-text-primary">What's coming</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plannedPosts.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="mb-3 flex items-center justify-between">
                  <Badge tone="info">{p.cat}</Badge>
                  <Clock className="h-4 w-4 text-text-tertiary" />
                </div>
                <h3 className="flex-1 font-display text-base font-semibold leading-snug text-text-primary">{p.title}</h3>
                <div className="mt-4 flex items-center gap-2 text-xs text-text-tertiary">
                  <PenLine className="h-3.5 w-3.5" /> In progress
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card relative mx-auto mt-12 max-w-3xl overflow-hidden p-8 text-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-secondary/10" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold text-text-primary">Want content tips now?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              Start generating with AI Post Assistant and learn by doing.
            </p>
            <Link to="/features" className="btn-brand mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              Explore features <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

