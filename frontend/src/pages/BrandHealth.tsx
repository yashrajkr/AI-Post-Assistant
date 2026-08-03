import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { PageHeader, Card, Badge } from '@/components/ui';
import { brandHealth } from '@/lib/mockData';

export default function BrandHealth() {
  const { total, scores, stats, insights } = brandHealth;
  const scoreColor = (v: number) => (v >= 80 ? 'bg-success' : v >= 60 ? 'bg-warning' : 'bg-error');
  const totalTone = total >= 80 ? 'success' : total >= 60 ? 'warning' : 'error';
  const totalLabel = total >= 80 ? 'Excellent' : total >= 60 ? 'Growing' : 'Needs work';

  return (
    <div className="space-y-6">
      <PageHeader badge="v2 · Brand Health Dashboard" title="Brand health" subtitle="How consistent and effective is your brand voice across content.">
        <button className="btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </PageHeader>

      {/* Total score */}
      <Card className="overflow-hidden p-0">
        <div className="relative p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-secondary/10" />
          <div className="relative text-center">
            <p className="text-xs uppercase tracking-wider text-text-tertiary">Total Brand Health</p>
            <p className="mt-2 font-display text-5xl font-bold text-gradient">{total}</p>
            <div className="mt-3 flex justify-center">
              <Badge tone={totalTone as 'success' | 'warning' | 'error'}>{totalLabel}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {scores.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-bold text-text-primary">{s.value}</span>
              <div className={`grid h-7 w-7 place-items-center rounded-lg ${scoreColor(s.value)} bg-opacity-20`}>
                <span className="text-xs">{s.icon[0]}</span>
              </div>
            </div>
            <p className="mt-1 text-xs uppercase tracking-wider text-text-tertiary">{s.label}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-hover">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                className={`h-full rounded-full ${scoreColor(s.value)}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats summary */}
      <Card className="p-5">
        <h3 className="mb-4 font-display text-sm font-semibold text-text-primary">Stats summary</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-2xl font-bold text-text-primary">{s.value}</p>
              <p className="text-xs text-text-tertiary">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* AI insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard icon={CheckCircle2} title="Strengths" tone="success" items={insights.strengths} />
        <InsightCard icon={AlertCircle} title="Weaknesses" tone="warning" items={insights.weaknesses} />
        <InsightCard icon={Lightbulb} title="Recommendations" tone="brand" items={insights.recommendations} />
      </div>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  tone,
  items,
}: {
  icon: typeof CheckCircle2;
  title: string;
  tone: 'success' | 'warning' | 'brand';
  items: string[];
}) {
  const borderTone = { success: 'border-success/30', warning: 'border-warning/30', brand: 'border-brand/30' }[tone];
  const iconColor = { success: 'text-success', warning: 'text-warning', brand: 'text-brand' }[tone];
  const marker = { success: 'bg-success', warning: 'bg-warning', brand: 'bg-brand' }[tone];
  return (
    <Card className={`p-5 ${borderTone}`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs text-text-secondary">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${marker}`} />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
