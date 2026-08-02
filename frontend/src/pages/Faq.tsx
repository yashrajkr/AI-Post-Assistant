import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

const categories = [
  { id: 'general', label: 'General', icon: '✨' },
  { id: 'billing', label: 'Billing & Plans', icon: '💳' },
  { id: 'security', label: 'Security & Privacy', icon: '🔒' },
  { id: 'technical', label: 'Technical', icon: '⚙️' },
];

const faqs: Record<string, { q: string; a: string }[]> = {
  general: [
    { q: 'What is AI Post Assistant?', a: 'AI Post Assistant is a content creation platform that turns a one-line idea into a complete ready-to-post content package — captions, hashtags, titles, CTAs, and more — in seconds.' },
    { q: 'Who is it for?', a: 'Creators, coaches, students, small businesses, agencies, and influencers who want to publish consistent, high-quality content faster.' },
    { q: 'Do I need to know AI to use it?', a: 'No. If you can type a one-line idea, you can generate a complete post package.' },
    { q: 'Which platforms are supported?', a: 'Instagram, YouTube, LinkedIn, X (Twitter), Facebook, and WhatsApp.' },
  ],
  billing: [
    { q: 'How many free credits do I get?', a: '10 free credits on signup — no credit card required. Each generation uses 1 credit.' },
    { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your Profile page or contact support. You keep access until the end of your billing period.' },
    { q: 'Do credits roll over?', a: 'No — unused credits reset on your monthly renewal date.' },
    { q: 'What payment methods are accepted?', a: 'Payments are processed by Razorpay and accept UPI, cards, and net banking in India.' },
    { q: 'How do refunds work?', a: 'Refunds are issued at our discretion within 7 days of payment for unused credits. Contact support for assistance.' },
  ],
  security: [
    { q: 'Is my data secure?', a: 'Yes. Passwords are hashed with PBKDF2 (120,000 rounds). Sessions use signed HttpOnly cookies. We never share your data.' },
    { q: 'Who processes payments?', a: 'All payments are handled by Razorpay, which is PCI-DSS compliant. We never see or store your card details.' },
    { q: 'Where is my data stored?', a: 'Your data is stored in Supabase (PostgreSQL) with row-level security, meaning only you can access your own content.' },
    { q: 'Do you sell my data?', a: 'Never. We only use your data to provide the service.' },
  ],
  technical: [
    { q: 'Which AI providers do you use?', a: 'OpenAI GPT-4o-mini is primary, with Google Gemini 1.5 Flash as fallback. If both are down, we show sample output so you are never blocked.' },
    { q: 'Does it support Hinglish?', a: 'Yes. The AI is tuned for Indian audiences and supports English, Hindi, Hinglish, and other languages.' },
    { q: 'Is there a Chrome extension?', a: 'Yes. Generate posts from any web page — right-click selected text or an image and choose "Generate with AI Post Assistant".' },
    { q: 'How do I reset my password?', a: 'Use the password reset link on the login page. We cannot recover passwords — we only store secure hashes.' },
  ],
};

export default function Faq() {
  const [category, setCategory] = useState('general');
  const [open, setOpen] = useState<string | null>(null);
  const items = faqs[category];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <section className="relative z-10 mx-auto max-w-3xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <HelpCircle className="h-3 w-3" /> FAQ
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Frequently asked <span className="text-gradient">questions</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            Everything you need to know about AI Post Assistant.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCategory(c.id); setOpen(null); }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                category === c.id
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="mr-1.5">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="mt-10 space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {items.map((t) => {
                const isOpen = open === t.q;
                return (
                  <div key={t.q} className="card overflow-hidden">
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
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card relative mt-12 overflow-hidden p-8 text-center"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-secondary/10" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold text-text-primary">Still have questions?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              Our team is happy to help. Reach out and we'll reply within 24 hours.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="btn-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
                Contact us <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="mailto:support@aipostassistant.com" className="btn-secondary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
                <Mail className="h-4 w-4" /> Email support
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

