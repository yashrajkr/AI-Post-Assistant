import { motion } from 'framer-motion';
import { ArrowLeft, GitCommitHorizontal, Rocket, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui';

const releases = [
  {
    version: 'v16.0',
    date: 'Aug 2026',
    tone: 'brand' as const,
    title: 'Premium SaaS polish',
    notes: [
      'Redesigned public header with role-based navigation',
      'Public Features, About, Contact, Roadmap, and Changelog pages',
      'Pricing is now publicly accessible with login-redirect upgrade flow',
      'Rebuilt footer with product, use-cases, resources, company, and social columns',
      'Smooth scrolling, dropdown animations, and keyboard accessibility',
    ],
  },
  {
    version: 'v15.0',
    date: 'Jul 2026',
    tone: 'success' as const,
    title: 'Google OAuth + PWA',
    notes: [
      'Added "Continue with Google" authentication',
      'PWA support — installable app with offline shell',
      'Chrome extension integration with API-key auth',
      'Hardened security: updated Next and Multer dependencies',
    ],
  },
  {
    version: 'v14.0',
    date: 'Jun 2026',
    tone: 'success' as const,
    title: 'v2 feature modules',
    notes: [
      'Content Calendar generator',
      'Campaign Builder',
      'Brand Health dashboard',
      'Document-to-content conversion',
      'API keys management',
    ],
  },
  {
    version: 'v13.0',
    date: 'May 2026',
    tone: 'success' as const,
    title: 'Prompt 3 modules',
    notes: [
      'AI Brand Brain — teach the AI your voice',
      'AI Content Score with 6 dimensions',
      'AI Memory with deduplication',
      'Prompt Library with community prompts',
      'Image Analysis (vision AI)',
      'AI Repurposer — one input, six outputs',
      'Multi-platform generation',
    ],
  },
  {
    version: 'v12.0',
    date: 'Apr 2026',
    tone: 'success' as const,
    title: 'Core platform',
    notes: [
      'Express + Supabase + Razorpay backend',
      'AI provider chain (OpenAI → Gemini → mock)',
      'Credit system and subscription plans',
      'Premium UI with animations',
    ],
  },
];

export default function Changelog() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <section className="relative z-10 mx-auto max-w-3xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <GitCommitHorizontal className="h-3 w-3" /> Changelog
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Release <span className="text-gradient">history</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            Every improvement, fix, and feature — in one place.
          </p>
        </motion.div>

        <div className="relative mt-14 space-y-8">
          {/* Timeline line */}
          <div className="pointer-events-none absolute left-4 top-2 bottom-2 w-px bg-border" />
          {releases.map((r, i) => (
            <motion.div
              key={r.version}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative flex gap-5 pl-0"
            >
              <span className="relative z-10 mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-gradient text-white shadow-glow">
                <Rocket className="h-4 w-4" />
              </span>
              <div className="card flex-1 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-xl font-bold text-text-primary">{r.version}</h2>
                  <Badge tone={r.tone}>{r.date}</Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-text-secondary">{r.title}</p>
                <ul className="mt-4 space-y-2">
                  {r.notes.map((n) => (
                    <li key={n} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

