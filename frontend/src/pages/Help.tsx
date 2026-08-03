import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LifeBuoy, Mail, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

const categories = [
  { icon: Sparkles, title: 'Getting started', desc: 'Accounts, credits, and your first generation.' },
  { icon: MessageSquare, title: 'Generating content', desc: 'Captions, hashtags, titles, and multi-platform mode.' },
  { icon: Mail, title: 'Billing & plans', desc: 'Upgrades, payments via Razorpay, and refunds.' },
  { icon: LifeBuoy, title: 'Troubleshooting', desc: 'Common issues and how to fix them.' },
];

const topics = [
  { q: 'How many free credits do I get?', a: 'You get 10 free credits on signup — no credit card required. Each AI generation uses 1 credit.' },
  { q: 'What happens when I run out of credits?', a: 'You can upgrade to a paid plan from the Pricing page to get more monthly credits. Payment is processed securely via Razorpay.' },
  { q: 'Why did my generation fail?', a: 'This usually happens when the AI provider is temporarily unavailable or you are out of credits. The app shows a sample fallback so you are never blocked. Try again in a few seconds.' },
  { q: 'How do I change my password?', a: 'Password reset is available from the login page. For security, we store only a PBKDF2 hash — we cannot see or recover your plain-text password.' },
  { q: 'Can I cancel my subscription anytime?', a: 'Yes. Cancel from Profile → Subscription, or contact support. You keep access until the end of your billing period.' },
  { q: 'Is my content private?', a: 'Yes. Your generations and brand data are stored in Supabase with row-level security. Only you can access them.' },
  { q: 'How does the Chrome extension work?', a: 'Install the extension, generate an API key from the API Keys page, and paste it in the extension options. Then right-click any text or image to generate posts.' },
  { q: 'Which AI providers power the app?', a: 'OpenAI GPT-4o-mini is the primary provider, with Google Gemini 1.5 Flash as fallback. If both are unavailable, the app returns a sample output.' },
];

export default function Help() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <LifeBuoy className="h-3 w-3" /> Help Center
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            How can we <span className="text-gradient">help?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            Search our knowledge base or reach out — we reply within 24 hours.
          </p>
        </motion.div>

        {/* Categories */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="card p-6 text-center transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-text-primary">{c.title}</h3>
                <p className="mt-1.5 text-sm text-text-secondary">{c.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ accordion */}
        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold text-text-primary">Popular topics</h2>
          <div className="mt-6 space-y-3">
            {topics.map((t, i) => {
              const isOpen = open === t.q;
              return (
                <motion.div
                  key={t.q}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="card overflow-hidden"
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : t.q)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-surface-hover/40"
                  >
                    <span className="font-medium text-text-primary">{t.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-text-secondary">{t.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card relative mx-auto mt-14 max-w-3xl overflow-hidden p-8 text-center"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-secondary/10" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold text-text-primary">Still need help?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              Contact our support team — we typically reply within 24 hours.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="btn-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
                Contact support <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="mailto:support@aipostassistant.com" className="btn-secondary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
                <Mail className="h-4 w-4" /> Email us
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

