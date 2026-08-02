import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
}: {
  icon?: typeof Sparkles;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-1.5 max-w-xs text-sm text-text-secondary">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  message,
  hint,
  retry,
}: {
  title: string;
  message?: string;
  hint?: string;
  retry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-error/30 bg-error/5 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
        <div>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          {message && <p className="mt-1 text-sm text-text-secondary">{message}</p>}
          {hint && <p className="mt-1 text-xs text-text-tertiary">{hint}</p>}
          {retry && (
            <button onClick={retry} className="btn-secondary mt-4 rounded-lg px-4 py-2 text-xs font-semibold">
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-hover ${className}`} />;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'brand',
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: typeof Sparkles;
  color?: 'brand' | 'warning' | 'secondary' | 'info' | 'success';
  delay?: number;
}) {
  const colorMap = {
    brand: 'bg-brand/10 text-brand',
    warning: 'bg-warning/10 text-warning',
    secondary: 'bg-secondary/10 text-secondary',
    info: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="card p-5 transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs uppercase tracking-wider text-text-tertiary">{label}</span>
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-text-primary">{value}</p>
    </motion.div>
  );
}

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {label ?? (copied ? 'Copied' : 'Copy')}
    </button>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
}) {
  const tones = {
    neutral: 'bg-surface-hover text-text-secondary',
    brand: 'bg-brand/10 text-brand',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function PageHeader({
  badge,
  title,
  subtitle,
  children,
}: {
  badge: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">{badge}</span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-text-primary">{title}</h1>
        {subtitle && <p className="mt-1.5 text-text-secondary">{subtitle}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-3">{children}</div>}
    </motion.div>
  );
}

export function AIThinking({ message = 'AI is creating your post...' }: { message?: string }) {
  const stages = [
    { icon: '🧠', label: 'Understanding your intent...' },
    { icon: '✍️', label: 'Crafting captions...' },
    { icon: '#️⃣', label: 'Generating hashtags...' },
    { icon: '📣', label: 'Writing CTA...' },
    { icon: '✨', label: 'Polishing...' },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a < stages.length - 1 ? a + 1 : a)), 900);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-brand"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <p className="mt-5 font-display text-lg font-semibold text-text-primary">{message}</p>
      <p className="mt-1 text-sm text-text-tertiary">This usually takes 5-10 seconds</p>
      <div className="mt-6 w-full max-w-sm space-y-2.5">
        {stages.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
              i < active
                ? 'border-success/30 bg-success/5'
                : i === active
                  ? 'border-brand/40 bg-brand/10'
                  : 'border-border bg-surface-2 opacity-50'
            }`}
          >
            <span className="text-base">{s.icon}</span>
            <span className="flex-1 text-xs font-medium text-text-secondary">{s.label}</span>
            {i < active ? (
              <Check className="h-4 w-4 text-success" />
            ) : i === active ? (
              <Loader2 className="h-4 w-4 animate-spin text-brand" />
            ) : (
              <span className="h-4 w-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? 'border-brand bg-brand/10 text-brand'
          : 'border-border text-text-secondary hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}
