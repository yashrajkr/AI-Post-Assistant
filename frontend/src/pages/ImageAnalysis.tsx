import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImageIcon, Sparkles } from 'lucide-react';
import { PageHeader, Card, EmptyState, AIThinking, CopyButton } from '@/components/ui';
import { Select } from '@/components/controls';
import { platforms, niches, tones } from '@/lib/mockData';

type Phase = 'idle' | 'loading' | 'result';

export default function ImageAnalysis() {
  const [image, setImage] = useState<string | null>(null);
  const [platform, setPlatform] = useState('Instagram');
  const [niche, setNiche] = useState('Education');
  const [tone, setTone] = useState('Educational');
  const [phase, setPhase] = useState<Phase>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const analyze = () => {
    setPhase('loading');
    setTimeout(() => setPhase('result'), 4000);
  };

  const results = [
    { emoji: '📝', label: 'Caption', text: 'When the code finally compiles on the first try 😂 #developerlife', copyable: true },
    { emoji: '🪝', label: 'Hook', text: 'POV: you wrote clean code for once', copyable: true },
    { emoji: '🏷️', label: 'Hashtags', pills: ['#developer', '#coding', '#programming', '#techhumor', '#cleancode'], copyAll: '#developer #coding #programming #techhumor #cleancode' },
    { emoji: '♿', label: 'Alt Text', text: 'A developer smiling at a laptop screen with green terminal output', copyable: true },
    { emoji: '📣', label: 'CTA', text: 'Follow for more dev content!', copyable: true, highlight: true },
    { emoji: '🔍', label: 'Keywords', pills: ['developer', 'coding', 'laptop', 'terminal', 'smile'] },
  ];

  return (
    <div className="space-y-6">
      <PageHeader badge="Module 5 · Image Understanding" title="Analyze image with AI" subtitle="Upload an image and get captions, hooks, hashtags, and more." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT — Upload */}
        <Card className="p-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            className="relative cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-brand hover:bg-brand/5"
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            {image ? (
              <div className="relative inline-block">
                <img src={image} alt="preview" className="max-h-48 rounded-lg" />
                <button
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-text-tertiary" />
                <p className="mt-3 text-sm font-medium text-text-secondary">Drop image or click to upload</p>
                <p className="mt-1 text-xs text-text-tertiary">PNG, JPG, WEBP · Max 5MB</p>
              </>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Select label="Platform" value={platform} onChange={setPlatform} options={platforms.map((p) => p.name)} />
            <Select label="Niche" value={niche} onChange={setNiche} options={niches} />
            <Select label="Tone" value={tone} onChange={setTone} options={tones} />
          </div>

          <button onClick={analyze} disabled={!image || phase === 'loading'} className="btn-brand mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-50">
            <Sparkles className="h-4 w-4" />
            Analyze image
          </button>
        </Card>

        {/* RIGHT — Results */}
        <div>
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="flex min-h-[400px] items-center justify-center">
                  <EmptyState icon={ImageIcon} title="Upload an image to start" description="Drop an image on the left and hit Analyze to get AI-generated content." />
                </Card>
              </motion.div>
            )}
            {phase === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="min-h-[400px]"><AIThinking message="AI is analyzing your image..." /></Card>
              </motion.div>
            )}
            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {results.map((r, i) => (
                  <motion.div
                    key={r.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`card p-4 ${r.highlight ? 'border-brand/20 bg-brand/10' : ''}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.emoji}</span>
                        <span className="text-sm font-semibold text-text-primary">{r.label}</span>
                      </div>
                      {r.copyable && <CopyButton text={r.text ?? ''} />}
                      {r.copyAll && <CopyButton text={r.copyAll} label="Copy all" />}
                    </div>
                    {r.text && <p className="text-sm text-text-secondary">{r.text}</p>}
                    {r.pills && (
                      <div className="flex flex-wrap gap-1.5">
                        {r.pills.map((p) => (
                          <span key={p} className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs text-text-secondary">{p}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
