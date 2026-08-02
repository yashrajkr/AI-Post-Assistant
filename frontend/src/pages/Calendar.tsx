import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Sparkles, Loader2, Clock } from 'lucide-react';
import { PageHeader, Card, EmptyState, AIThinking, CopyButton, Badge } from '@/components/ui';
import { Select } from '@/components/controls';
import { platforms, niches } from '@/lib/mockData';

type Phase = 'idle' | 'loading' | 'result';

export default function Calendar() {
  const [title, setTitle] = useState('');
  const [niche, setNiche] = useState('Education');
  const [duration, setDuration] = useState('14');
  const [phase, setPhase] = useState<Phase>('idle');

  const generate = () => {
    if (!title.trim()) return;
    setPhase('loading');
    setTimeout(() => setPhase('result'), 4000);
  };

  const days = Array.from({ length: parseInt(duration) }, (_, i) => ({
    day: i + 1,
    platform: platforms[i % platforms.length].name,
    emoji: platforms[i % platforms.length].emoji,
    topic: `${title || 'Content'} — Part ${i + 1}`,
    hook: i % 2 === 0 ? 'Did you know that...' : 'Here is the thing about...',
    format: i % 3 === 0 ? 'Carousel' : i % 3 === 1 ? 'Reel' : 'Post',
    time: i % 2 === 0 ? '9:00 AM' : '6:00 PM',
  }));

  const allText = days.map((d) => `Day ${d.day} [${d.platform}] ${d.topic} — ${d.hook} (${d.format} @ ${d.time})`).join('\n');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader badge="v2 · AI Content Calendar" title="Content calendar generator" subtitle="Generate a multi-day content plan in seconds." />

      <Card className="p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" placeholder="e.g. JEE Prep Series" />
          </div>
          <Select label="Niche" value={niche} onChange={setNiche} options={niches} />
          <Select label="Duration" value={duration} onChange={setDuration} options={['7', '14', '30', '60', '90']} />
        </div>
        <button
          onClick={generate}
          disabled={!title.trim() || phase === 'loading'}
          className="btn-brand mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
        >
          {phase === 'loading' ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate {duration}-day calendar (2 credits)</>}
        </button>
      </Card>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="flex min-h-[200px] items-center justify-center">
              <EmptyState icon={CalendarDays} title="No calendar yet" description="Fill in the form above and generate a day-by-day content plan." />
            </Card>
          </motion.div>
        )}
        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card><AIThinking message="AI is planning your calendar..." /></Card>
          </motion.div>
        )}
        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-text-primary">{title} — {duration}-day plan</h3>
              <CopyButton text={allText} label="Copy all" />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {days.map((d, i) => (
                <motion.div
                  key={d.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="card p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-brand">Day {d.day}</span>
                    <Badge tone="neutral">{d.emoji} {d.platform}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-text-primary">{d.topic}</p>
                  <p className="mt-1 text-xs italic text-text-tertiary">"{d.hook}"</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                    <Badge tone="info">{d.format}</Badge>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {d.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
