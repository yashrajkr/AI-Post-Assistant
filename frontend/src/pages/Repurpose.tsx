import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles, Loader2, Megaphone } from 'lucide-react';
import { PageHeader, Card, EmptyState, AIThinking, CopyButton } from '@/components/ui';
import { Select } from '@/components/controls';
import { platforms } from '@/lib/mockData';

type Phase = 'idle' | 'loading' | 'result';

export default function Repurpose() {
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState('Text');
  const [selected, setSelected] = useState<string[]>(platforms.map((p) => p.name));
  const [phase, setPhase] = useState<Phase>('idle');

  const toggle = (name: string) =>
    setSelected((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));

  const repurpose = () => {
    if (!content.trim()) return;
    setPhase('loading');
    setTimeout(() => setPhase('result'), 4000);
  };

  const results = selected.map((name) => {
    const p = platforms.find((pl) => pl.name === name)!;
    return {
      name,
      emoji: p.emoji,
      format: name === 'Twitter' ? 'Thread' : name === 'YouTube' ? 'Title + Desc' : 'Caption',
      caption: `Here is a ${name} version of your content!\n\n${content.slice(0, 80)}...\n\nTailored for ${name} audience.`,
      hashtags: ['#content', '#' + name.toLowerCase(), '#repurpose'],
      cta: 'Follow for more!',
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader badge="Module 6 · AI Repurposer" title="Repurpose to 6 platforms" subtitle="Turn one piece of content into platform-optimized posts." />

      <Card className="p-6">
        <label className="mb-2 block text-xs font-medium text-text-secondary">Source content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="Paste your blog post, video script, or idea here..."
          className="input-field w-full resize-none px-3 py-2.5 text-sm"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Select label="Source type" value={sourceType} onChange={setSourceType} options={['Text', 'YouTube', 'Blog', 'Idea']} />
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-xs font-medium text-text-secondary">Platforms ({selected.length} selected)</label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => {
              const active = selected.includes(p.name);
              return (
                <button
                  key={p.name}
                  onClick={() => toggle(p.name)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    active ? 'border-brand bg-brand/10 text-brand' : 'border-border text-text-secondary'
                  }`}
                >
                  <span>{p.emoji}</span> {p.name}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={repurpose}
          disabled={!content.trim() || phase === 'loading'}
          className="btn-brand mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
        >
          {phase === 'loading' ? <><Loader2 className="h-4 w-4 animate-spin" /> Repurposing...</> : <><Sparkles className="h-4 w-4" /> Repurpose to {selected.length} platforms (3 credits)</>}
        </button>
      </Card>

      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card><AIThinking message="AI is repurposing your content..." /></Card>
          </motion.div>
        )}
        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 md:grid-cols-2">
            {results.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.emoji}</span>
                    <span className="text-sm font-semibold text-text-primary">{r.name}</span>
                    <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[10px] text-text-tertiary">{r.format}</span>
                  </div>
                  <CopyButton text={r.caption} />
                </div>
                <p className="whitespace-pre-wrap text-sm text-text-secondary">{r.caption}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.hashtags.map((h) => (
                    <span key={h} className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs text-text-secondary">{h}</span>
                  ))}
                </div>
                <div className="mt-3 rounded-lg border border-brand/20 bg-brand/10 p-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-3.5 w-3.5 text-brand" />
                    <span className="text-xs font-medium text-brand">CTA</span>
                  </div>
                  <p className="mt-1 text-sm text-text-primary">{r.cta}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="flex min-h-[200px] items-center justify-center">
              <EmptyState icon={RefreshCw} title="Repurpose your content" description="Paste content above and select platforms to generate tailored posts." />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
