import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Rocket, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui';

const versions = [
  {
    version: 'Version 1',
    tag: 'Completed',
    tone: 'success' as const,
    title: 'The foundation',
    desc: 'The core content generation engine — captions, hashtags, titles, CTAs, and multi-platform generation.',
    items: [
      'AI caption generator',
      'Hashtag generator',
      'Title generator',
      'Multi-platform generation (6 platforms)',
      'Email/password auth + sessions',
      'Google OAuth login',
      'Credit system',
      'Razorpay payments',
      'Supabase storage',
      'Chrome extension',
    ],
  },
  {
    version: 'Version 2',
    tag: 'Completed',
    tone: 'success' as const,
    title: 'The content OS',
    desc: 'Advanced modules that turn single posts into a complete content operating system.',
    items: [
      'AI Brand Brain (voice & tone)',
      'AI Content Score',
      'AI Memory',
      'Prompt Library',
      'Image Analysis (vision AI)',
      'AI Repurposer',
      'Content Calendar generator',
      'Campaign Builder',
      'Brand Health dashboard',
      'API keys for the extension',
    ],
  },
  {
    version: 'Version 3',
    tag: 'In progress',
    tone: 'warning' as const,
    title: 'Growth & team features',
    desc: 'Team workflows, deeper scheduling, and smarter analytics.',
    items: [
      'Visual content scheduler (calendar view)',
      'Team workspace with shared Brand Brain',
      'Advanced analytics & export',
      'Improved AI scoring with per-platform models',
      'Bulk generation API',
      'Custom prompt marketplace',
      'Competitor analysis',
      'Video understanding (clips & shorts)',
      'Native Android app (APK)',
      'PWA offline mode',
    ],
  },
  {
    version: 'Future',
    tag: 'Planned',
    tone: 'neutral' as const,
    title: 'The platform',
    desc: 'AI Post Assistant as a full platform for content teams.',
    items: [
      'Prompt marketplace with monetization',
      'Agency multi-client dashboard',
      'SSO / SAML enterprise auth',
      'AI assistant chat (ask anything)',
      'Integrations (Zapier, Make, Notion, Slack)',
      'Real-time collaboration',
      'Localization for more languages',
      'White-label options for agencies',
    ],
  },
];

export default function Roadmap() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <Rocket className="h-3 w-3" /> Roadmap
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Where we're <span className="text-gradient">headed</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            A transparent look at what we've shipped, what we're building, and what's next.
          </p>
        </motion.div>

        {/* Legend */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Completed</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-warning" /> In progress</span>
          <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-info" /> Planned</span>
        </div>

        {/* Versions */}
        <div className="mt-12 space-y-8">
          {versions.map((v, i) => (
            <motion.div
              key={v.version}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl font-bold text-text-primary">{v.version}</h2>
                    <Badge tone={v.tone}>{v.tag}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-text-primary">{v.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{v.desc}</p>
                </div>
              </div>
              <div className="grid gap-2 p-6 sm:grid-cols-2">
                {v.items.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    {v.tone === 'success' ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    )}
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card relative mt-12 overflow-hidden p-8 text-center"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-secondary/10" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold text-text-primary">Want to shape the roadmap?</h2>
            <p className="mx-auto mt-2 max-w-md text-text-secondary">
              Tell us what you want next. We ship based on real user feedback.
            </p>
            <Link to="/contact" className="btn-brand mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              Share feedback <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

