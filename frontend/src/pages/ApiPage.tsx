import { motion } from 'framer-motion';
import { Code2, Terminal, KeyRound, ArrowRight, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui';

const codeSample = `// POST /api/generate
// Generate a complete post package
fetch('https://api.aipostassistant.com/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer apa_live_xxxxxxxx',
  },
  body: JSON.stringify({
    content: 'Launching my new fitness coaching program',
    platform: 'Instagram',
    niche: 'Fitness',
    tone: 'Motivational',
  }),
});

// Response
{
  "success": true,
  "generation": {
    "titles": ["Transform Your Body in 90 Days 💪"],
    "captions": ["...", "...", "..."],
    "hashtags": ["#FitnessJourney", "#CoachLife"],
    "cta": "DM 'FIT' to start your journey today.",
    "score": 87
  }
}`;

const endpoints = [
  { method: 'POST', path: '/api/generate', desc: 'Generate a post package (single or multi-platform).', auth: 'Required' },
  { method: 'GET', path: '/api/history', desc: 'List your past generations.', auth: 'Required' },
  { method: 'GET', path: '/api/analytics', desc: 'Get usage analytics.', auth: 'Required' },
  { method: 'POST', path: '/api/repurpose', desc: 'Repurpose content across platforms.', auth: 'Required' },
  { method: 'POST', path: '/api/analyze-image', desc: 'Analyze an image and generate content.', auth: 'Required' },
  { method: 'GET', path: '/api/plans', desc: 'List available subscription plans.', auth: 'Public' },
  { method: 'GET', path: '/api/health', desc: 'Service health check.', auth: 'Public' },
];

export default function ApiPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <Code2 className="h-3 w-3" /> API
          </span>
          <div className="mt-4 flex items-center justify-center gap-3">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              API — <span className="text-gradient">Coming Soon</span>
            </h1>
            <Badge tone="warning">In development</Badge>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            Build your own tools on top of AI Post Assistant. Generate, repurpose, and schedule
            content programmatically with a simple REST API.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              Get early access <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="btn-secondary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
              <Clock className="h-4 w-4" /> Notify me
            </button>
          </div>
        </motion.div>

        {/* Preview code */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="card mt-14 overflow-hidden"
        >
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <span className="h-3 w-3 rounded-full bg-error/70" />
            <span className="h-3 w-3 rounded-full bg-warning/70" />
            <span className="h-3 w-3 rounded-full bg-success/70" />
            <span className="ml-3 flex items-center gap-1.5 text-xs text-text-tertiary">
              <Terminal className="h-3.5 w-3.5" /> api-reference.js
            </span>
          </div>
          <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-text-secondary">
            <code>{codeSample}</code>
          </pre>
        </motion.div>

        {/* Endpoints preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-12"
        >
          <h2 className="font-display text-2xl font-bold text-text-primary">Planned endpoints</h2>
          <div className="mt-5 space-y-3">
            {endpoints.map((e) => (
              <div key={e.path} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4">
                <span className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-bold ${
                  e.method === 'GET' ? 'bg-info/10 text-info' : 'bg-brand/10 text-brand'
                }`}>
                  {e.method}
                </span>
                <code className="font-mono text-sm text-text-primary">{e.path}</code>
                <span className="flex-1 text-sm text-text-secondary">{e.desc}</span>
                <Badge tone={e.auth === 'Public' ? 'success' : 'neutral'}>{e.auth}</Badge>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: KeyRound, title: 'API key auth', desc: 'Generate scoped API keys from your dashboard with SHA-256 hashed storage.' },
            { icon: Shield, title: 'Secure by default', desc: 'HTTPS, rate limiting, and HMAC-signed sessions on every endpoint.' },
            { icon: Code2, title: 'Developer friendly', desc: 'Clean JSON responses, sensible errors, and comprehensive docs on launch.' },
          ].map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card p-6"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-text-primary">{t.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{t.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

