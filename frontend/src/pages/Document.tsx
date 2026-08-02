import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { PageHeader, Card, EmptyState, AIThinking, CopyButton, Badge } from '@/components/ui';
import { Select } from '@/components/controls';
import { platforms, niches, tones } from '@/lib/mockData';

type Phase = 'idle' | 'loading' | 'result';

export default function Document() {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [niche, setNiche] = useState('Education');
  const [tone, setTone] = useState('Educational');
  const [phase, setPhase] = useState<Phase>('idle');

  const analyze = () => {
    if (content.trim().length < 50) return;
    setPhase('loading');
    setTimeout(() => setPhase('result'), 4500);
  };

  return (
    <div className="space-y-6">
      <PageHeader badge="v2 · Document to Content" title="PDF / Text → Social posts" subtitle="Paste any document and turn it into ready-to-post social content." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT — Input */}
        <Card className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-text-secondary">Document content (paste here)</label>
            <span className="text-xs text-text-tertiary">{content.length} characters (min 50)</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Paste your article, blog post, or document text here..."
            className="input-field w-full resize-none px-3 py-2.5 font-mono text-xs"
          />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Select label="Platform" value={platform} onChange={setPlatform} options={platforms.map((p) => p.name)} />
            <Select label="Niche" value={niche} onChange={setNiche} options={niches} />
            <Select label="Tone" value={tone} onChange={setTone} options={tones} />
          </div>
          <button
            onClick={analyze}
            disabled={content.trim().length < 50 || phase === 'loading'}
            className="btn-brand mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
          >
            {phase === 'loading' ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4" /> Analyze document (2 credits)</>}
          </button>
        </Card>

        {/* RIGHT — Results */}
        <div>
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="flex min-h-[400px] items-center justify-center">
                  <EmptyState icon={FileText} title="Paste your document on the left" description="We'll extract a summary, titles, captions, hashtags, and carousel slides." />
                </Card>
              </motion.div>
            )}
            {phase === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="min-h-[400px]"><AIThinking message="AI is reading your document..." /></Card>
              </motion.div>
            )}
            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {/* Summary */}
                <Card className="border-brand/30 bg-brand/5 p-4">
                  <h4 className="text-sm font-semibold text-text-primary">Summary</h4>
                  <p className="mt-2 text-sm text-text-secondary">
                    The document covers the fundamentals of machine learning, including supervised and unsupervised learning, key algorithms, and practical applications for beginners.
                  </p>
                </Card>

                {/* Titles */}
                <Card className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-text-primary">Titles (3)</h4>
                    <CopyButton text="titles" label="Copy all" />
                  </div>
                  <div className="space-y-1.5">
                    {['Machine Learning 101: A Beginner Guide', 'ML Fundamentals Explained Simply', 'Start Your ML Journey Today'].map((t, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md bg-surface-hover/50 p-2 text-sm text-text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                        <span className="flex-1">{t}</span>
                        <CopyButton text={t} label="" />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Captions */}
                <Card className="p-4">
                  <h4 className="mb-2 text-sm font-semibold text-text-primary">Captions (2)</h4>
                  <div className="space-y-2">
                    {['New to ML? Start here 🧠\n\nThis guide breaks down supervised vs unsupervised learning in plain English.', 'Machine learning does not have to be scary. Here is a simple intro for absolute beginners.'].map((c, i) => (
                      <div key={i} className="rounded-lg bg-surface-hover/50 p-3">
                        <p className="whitespace-pre-wrap text-sm text-text-primary">{c}</p>
                        <div className="mt-2 flex justify-end"><CopyButton text={c} /></div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Hashtags */}
                <Card className="p-4">
                  <h4 className="mb-2 text-sm font-semibold text-text-primary">Hashtags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['#MachineLearning', '#AI', '#DataScience', '#Beginners', '#Tech'].map((h) => (
                      <span key={h} className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs text-text-secondary">{h}</span>
                    ))}
                  </div>
                </Card>

                {/* Carousel slides */}
                <Card className="p-4">
                  <h4 className="mb-2 text-sm font-semibold text-text-primary">Carousel slides (5)</h4>
                  <div className="space-y-2">
                    {['Slide 1: What is Machine Learning?', 'Slide 2: Supervised Learning', 'Slide 3: Unsupervised Learning', 'Slide 4: Key Algorithms', 'Slide 5: Start Here'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-surface-hover/50 p-2.5 text-sm text-text-primary">
                        <Badge tone="brand">{i + 1}</Badge>
                        {s}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Thread tweets */}
                <Card className="p-4">
                  <h4 className="mb-2 text-sm font-semibold text-text-primary">Thread tweets (4)</h4>
                  <div className="space-y-2">
                    {['1/ ML is teaching computers to learn from data.', '2/ Supervised = labeled data. Unsupervised = find patterns.', '3/ Start with scikit-learn and small datasets.', '4/ The best way to learn? Build a project.'].map((t, i) => (
                      <div key={i} className="rounded-lg bg-surface-hover/50 p-2.5 text-sm text-text-primary">{t}</div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
