import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Sparkles, Loader2, Clock } from 'lucide-react';
import { PageHeader, Card, EmptyState, AIThinking, CopyButton, Badge } from '@/components/ui';
import { platforms } from '@/lib/mockData';

type Phase = 'idle' | 'loading' | 'result';

export default function Campaigns() {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [count, setCount] = useState('7');
  const [phase, setPhase] = useState<Phase>('idle');

  const generate = () => {
    if (!title.trim()) return;
    setPhase('loading');
    setTimeout(() => setPhase('result'), 4000);
  };

  const types = ['Awareness', 'Engagement', 'Conversion'];
  const posts = Array.from({ length: parseInt(count) }, (_, i) => ({
    index: i + 1,
    platform: platforms[i % platforms.length].name,
    emoji: platforms[i % platforms.length].emoji,
    type: types[i % 3],
    time: i % 2 === 0 ? '9:00 AM' : '6:00 PM',
    headline: `${title} — Post ${i + 1}`,
    caption: `This is post ${i + 1} in your "${title}" campaign. Tailored for ${platforms[i % platforms.length].name} with a ${types[i % 3].toLowerCase()} focus.`,
    hashtags: ['#campaign', '#' + title.toLowerCase().replace(/\s/g, '')],
    cta: i % 3 === 0 ? 'Link in bio' : i % 3 === 1 ? 'Comment below' : 'Share this post',
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader badge="v2 · Campaign Builder" title="Campaign builder" subtitle="Generate a cohesive multi-post campaign across platforms." />

      <Card className="p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" placeholder="Campaign title" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Theme</label>
            <input value={theme} onChange={(e) => setTheme(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" placeholder="e.g. Summer Launch" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Post count</label>
            <input type="number" min={3} max={30} value={count} onChange={(e) => setCount(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={!title.trim() || phase === 'loading'}
          className="btn-brand mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
        >
          {phase === 'loading' ? <><Loader2 className="h-4 w-4 animate-spin" /> Building...</> : <><Sparkles className="h-4 w-4" /> Generate {count}-post campaign (3 credits)</>}
        </button>
      </Card>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="flex min-h-[200px] items-center justify-center">
              <EmptyState icon={Megaphone} title="No campaign yet" description="Fill in the form above to generate a multi-post campaign." />
            </Card>
          </motion.div>
        )}
        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card><AIThinking message="AI is building your campaign..." /></Card>
          </motion.div>
        )}
        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Summary */}
            <Card className="border-brand/30 bg-brand/5 p-5">
              <h3 className="font-display text-lg font-bold text-text-primary">{title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{count} posts · Theme: {theme || 'General'} · Across {platforms.length} platforms</p>
            </Card>

            {/* Posts */}
            <div className="space-y-3">
              {posts.map((p, i) => (
                <motion.div
                  key={p.index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-text-tertiary">#{p.index}</span>
                      <Badge tone="neutral">{p.emoji} {p.platform}</Badge>
                      <Badge tone={p.type === 'Awareness' ? 'info' : p.type === 'Engagement' ? 'brand' : 'success'}>{p.type}</Badge>
                      <span className="flex items-center gap-1 text-xs text-text-tertiary"><Clock className="h-3 w-3" /> {p.time}</span>
                    </div>
                    <CopyButton text={p.caption} />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{p.headline}</p>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-text-secondary">{p.caption}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.hashtags.map((h) => (
                      <span key={h} className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs text-text-secondary">{h}</span>
                    ))}
                  </div>
                  <div className="mt-2 rounded-lg border border-brand/20 bg-brand/10 p-2.5">
                    <p className="text-xs text-brand">📣 {p.cta}</p>
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
