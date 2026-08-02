import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles, Users, GraduationCap, School, Store, Briefcase, Instagram } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

const useCases = {
  creators: {
    icon: Instagram,
    title: 'For Creators',
    tagline: 'Post daily without burning out',
    color: 'from-pink-500 to-rose-500',
    desc: 'AI Post Assistant is built for creators who need to stay consistent across platforms without spending hours writing captions.',
    points: [
      'Generate captions, hashtags, titles & CTAs in seconds',
      'Repurpose one idea into 6 platform posts',
      'Train Brand Brain to sound exactly like you',
      'Plan a month of content with the AI Calendar',
      'Score every post and improve over time',
    ],
    cta: 'Start creating free',
  },
  students: {
    icon: GraduationCap,
    title: 'For Students',
    tagline: 'Share what you learn, effortlessly',
    color: 'from-blue-500 to-cyan-500',
    desc: 'Whether you are documenting your JEE/NEET journey or sharing study tips, AI Post Assistant turns your notes into engaging posts.',
    points: [
      'Turn study notes into educational posts',
      'Announce results with beautiful, shareable captions',
      'Build a personal brand while studying',
      'Generate Hinglish content for Indian audiences',
      'Schedule posts around your study schedule',
    ],
    cta: 'Get started free',
  },
  'coaching-institutes': {
    icon: School,
    title: 'For Coaching Institutes',
    tagline: 'Admission marketing on autopilot',
    color: 'from-emerald-500 to-teal-500',
    desc: 'Coaching centers can announce batches, share student results, and stay top-of-mind with parents and aspirants.',
    points: [
      'Batch announcement posts in minutes',
      'Result celebrations with social proof',
      'Consistent daily posting without hiring a marketer',
      'Multi-platform reach: Instagram, Facebook, WhatsApp',
      'Brand Brain keeps every post on-message',
    ],
    cta: 'Market your institute',
  },
  'small-businesses': {
    icon: Store,
    title: 'For Small Businesses',
    tagline: 'Sell more with better content',
    color: 'from-amber-500 to-orange-500',
    desc: 'Local businesses, D2C brands, and service providers can publish professional content that drives traffic and sales.',
    points: [
      'Product launch captions that convert',
      'CTAs built for DM and WhatsApp enquiries',
      'Weekly content plans in one click',
      'Consistent brand voice across all channels',
      'Analytics to see what works',
    ],
    cta: 'Grow your business',
  },
  agencies: {
    icon: Briefcase,
    title: 'For Agencies',
    tagline: 'Scale client content production',
    color: 'from-violet-500 to-purple-500',
    desc: 'Manage multiple client accounts with consistent quality. Generate, approve, and deliver content faster than ever.',
    points: [
      'Per-client Brand Brain profiles',
      'Bulk generation for campaigns',
      'On-brand captions every time',
      'Repurpose client content across platforms',
      'API access for custom pipelines (coming soon)',
    ],
    cta: 'Scale your agency',
  },
  influencers: {
    icon: Users,
    title: 'For Influencers',
    tagline: 'Monetize with a stronger presence',
    color: 'from-fuchsia-500 to-pink-500',
    desc: 'Keep your feed fresh, engage your audience, and present a professional image to brands with consistent, high-quality content.',
    points: [
      'Never run out of caption ideas',
      'Match your unique voice with Brand Brain',
      'Plan brand-deal content professionally',
      'Analytics reveal your winning formats',
      'Schedule posts around busy collab schedules',
    ],
    cta: 'Elevate your brand',
  },
};

export default function UseCases() {
  const { slug } = useParams<{ slug: string }>();
  const uc = slug ? useCases[slug as keyof typeof useCases] : null;

  // If slug is unknown, fall back to the overview grid.
  if (!uc) {
    return <UseCasesGrid />;
  }

  const Icon = uc.icon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <div className={`mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${uc.color} text-white shadow-glow`}>
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {uc.title}
          </h1>
          <p className="mt-3 font-display text-xl text-gradient">{uc.tagline}</p>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">{uc.desc}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card mx-auto mt-12 max-w-2xl p-8"
        >
          <h2 className="font-display text-xl font-bold text-text-primary">How it helps you</h2>
          <ul className="mt-5 space-y-3.5">
            {uc.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-text-secondary">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="btn-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              {uc.cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing" className="btn-secondary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              View pricing
            </Link>
          </div>
        </motion.div>

        <div className="mt-10 text-center">
          <Link to="/use-cases" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline">
            <ArrowRight className="h-4 w-4 rotate-180" /> All use cases
          </Link>
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

function UseCasesGrid() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <Sparkles className="h-3 w-3" /> Use cases
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Built for <span className="text-gradient">every creator</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            From students to agencies — see how AI Post Assistant fits your workflow.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(useCases).map(([slug, uc], i) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="card group flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${uc.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary">{uc.title}</h3>
                <p className="mt-1.5 text-sm text-text-secondary">{uc.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">{uc.desc}</p>
                <Link
                  to={`/use-cases/${slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:gap-3"
                >
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

