import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  Briefcase,
  Send,
  Loader2,
  CheckCircle2,
  Github,
  Linkedin,
  Twitter,
  Youtube,
  HeartHandshake,
  Clock,
} from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { useToast } from '@/lib/toast';

const channels = [
  { icon: Mail, title: 'Email us', desc: 'support@aipostassistant.com', href: 'mailto:support@aipostassistant.com' },
  { icon: MessageSquare, title: 'Support', desc: 'Help center & tickets', href: '/help' },
  { icon: Briefcase, title: 'Business enquiries', desc: 'partners@aipostassistant.com', href: 'mailto:partners@aipostassistant.com' },
  { icon: Clock, title: 'Response time', desc: 'Within 24 hours (48h weekends)', href: undefined },
];

const socials = [
  { icon: Github, label: 'GitHub', href: 'https://github.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: Twitter, label: 'Twitter / X', href: 'https://twitter.com' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
];

export default function Contact() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', topic: 'General', message: '' });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSubmitting(true);
    // Simulate a submit (frontend only). Hook up to an API/backend form service in production.
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSent(true);
    toast({ title: 'Message sent!', description: 'We will get back to you within 24 hours.', tone: 'success' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <HeartHandshake className="h-3 w-3" /> Contact
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            We'd love to <span className="text-gradient">hear from you</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            Questions, feedback, partnerships, or just saying hi — we read every message.
          </p>
        </motion.div>

        {/* Channel cards */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c, i) => {
            const Icon = c.icon;
            const inner = (
              <div className="card h-full p-6 text-center transition-all hover:-translate-y-1 hover:shadow-card-hover">
                <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-text-primary">{c.title}</h3>
                <p className="mt-1.5 text-sm text-text-secondary">{c.desc}</p>
              </div>
            );
            return c.href ? (
              <motion.a
                key={c.title}
                href={c.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={c.href.startsWith('http') ? '' : ''}
              >
                {inner}
              </motion.a>
            ) : (
              <motion.div key={c.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                {inner}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          {/* Feedback form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card p-8 lg:col-span-3"
          >
            <h2 className="font-display text-2xl font-bold text-text-primary">Send us a message</h2>
            <p className="mt-2 text-sm text-text-secondary">We typically reply within 24 hours.</p>

            {sent ? (
              <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-success/30 bg-success/5 px-6 py-14 text-center">
                <CheckCircle2 className="h-12 w-12 text-success" />
                <h3 className="mt-4 font-display text-xl font-bold text-text-primary">Message sent!</h3>
                <p className="mt-2 max-w-sm text-sm text-text-secondary">
                  Thank you, {form.name.split(' ')[0]}. We've received your message and will get back to you shortly.
                </p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', topic: 'General', message: '' }); }} className="btn-secondary mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium text-text-secondary">Name</label>
                    <input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="input-field w-full px-3 py-2.5 text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium text-text-secondary">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="input-field w-full px-3 py-2.5 text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-topic" className="mb-1.5 block text-xs font-medium text-text-secondary">Topic</label>
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="input-field w-full px-3 py-2.5 text-sm"
                  >
                    {['General', 'Support', 'Feedback', 'Business enquiry', 'Partnership', 'Press'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-text-secondary">Message</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="input-field w-full resize-none px-3 py-2.5 text-sm"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          {/* Side info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5 lg:col-span-2"
          >
            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold text-text-primary">Follow us</h3>
              <p className="mt-1 text-sm text-text-secondary">Stay updated on new features and tips.</p>
              <div className="mt-4 flex gap-2.5">
                {socials.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-2 text-text-secondary transition-all hover:border-brand hover:text-brand"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold text-text-primary">Business enquiries</h3>
              <p className="mt-1 text-sm text-text-secondary">
                For partnerships, bulk licensing, or media:
              </p>
              <a href="mailto:partners@aipostassistant.com" className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
                partners@aipostassistant.com
              </a>
              <p className="mt-3 text-sm text-text-secondary">
                For support, check the{' '}
                <a href="/help" className="font-medium text-brand hover:underline">Help Center</a> first —
                you may find an instant answer.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold text-text-primary">Office</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Patna, Bihar, India
              </p>
              <p className="mt-2 text-sm text-text-tertiary">
                Fully remote team — we work across time zones to serve creators everywhere.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer variant="landing" />
    </div>
  );
}

