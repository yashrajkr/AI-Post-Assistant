import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';
import { plans } from '@/lib/mockData';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { apiPost, ApiError } from '@/lib/api';
import { useNavigate, Link } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

export default function Pricing() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  const handleUpgrade = async (planName: string) => {
    // If not logged in, redirect to login with state to return to pricing
    if (!user) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    setBusyPlan(planName);
    try {
      // Backend route: POST /api/upgrade with { plan }
      await apiPost('/api/upgrade', { plan: planName.toLowerCase() });
      await refresh();
      toast({ title: 'Plan upgraded', description: `You are now on ${planName}.`, tone: 'success' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not upgrade plan.';
      toast({ title: 'Upgrade failed', description: msg, tone: 'error' });
    } finally {
      setBusyPlan(null);
    }
  };

  const currentPlan = (user?.plan || 'free').toLowerCase();

  return (
    <div className="min-h-screen bg-bg">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />
      <div className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 py-12">
        <PageHeader
          badge="Pricing"
          title="Simple pricing for every creator"
          subtitle="Start free and upgrade when you're ready. No hidden fees, cancel anytime."
        >
          <span className="text-gradient font-display text-lg font-bold">ready-to-post</span>
        </PageHeader>

        {/* Plan grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => {
            const isCurrent = plan.name.toLowerCase() === currentPlan;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative card p-6 transition-all ${
                  plan.featured ? 'border-brand shadow-glow lg:-translate-y-3' : 'hover:-translate-y-1'
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-4 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand/10 text-lg">{plan.icon}</div>
                <h3 className="mt-4 font-display text-lg font-bold text-text-primary">{plan.name}</h3>
                <div className="mt-2 flex items-end gap-1">
                  <span className="font-display text-3xl font-bold text-text-primary">${plan.price}</span>
                  <span className="mb-1 text-sm text-text-tertiary">/month</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{plan.credits}</p>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/10">
                        <Check className="h-3 w-3 text-brand" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={isCurrent || busyPlan === plan.name}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    plan.featured ? 'btn-brand' : 'btn-secondary'
                  }`}
                >
                  {isCurrent ? (
                    'Current plan'
                  ) : busyPlan === plan.name ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                    </>
                  ) : !user ? (
                    <>
                      Upgrade <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { q: 'Is payment secure?', a: 'Yes — all payments are processed through Razorpay with PCI-compliant encryption. We never see or store your card details.' },
            { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel with one click from your profile. You keep access until the end of your billing period.' },
            { q: 'Do credits roll over?', a: 'Unused credits do not roll over. Your credit balance resets on the 1st of each month with your subscription renewal.' },
          ].map((f) => (
            <Card key={f.q} className="p-5">
              <h4 className="text-sm font-semibold text-text-primary">{f.q}</h4>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{f.a}</p>
            </Card>
          ))}
        </div>

        {/* CTA for non-logged-in users */}
        {!user && (
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-brand hover:underline">
                Login
              </Link>{' '}
              to see your current plan.
            </p>
          </div>
        )}
      </div>
      <Footer variant="landing" />
    </div>
  );
}
