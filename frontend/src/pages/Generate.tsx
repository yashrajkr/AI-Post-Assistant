import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Brain,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Hash,
  Megaphone,
  Check,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { PageHeader, Card, Badge, CopyButton, AIThinking, EmptyState } from '@/components/ui';
import { Select, Toggle } from '@/components/controls';
import { platforms, niches, templates, tones, languages, goals, audiences, locations } from '@/lib/mockData';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { apiPost, ApiError, type GenerateResponse } from '@/lib/api';

type Phase = 'idle' | 'loading' | 'result';

interface ResultState {
  titles: string[];
  captions: string[];
  hashtags: string[];
  cta: string;
  scores?: { label: string; value: number }[];
  score?: number;
  fallback?: boolean;
  message?: string;
  platforms?: string[];
}

export default function Generate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [multi, setMulti] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram']);
  const [niche, setNiche] = useState('Education');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('Trending');
  const [advanced, setAdvanced] = useState(false);
  const [tone, setTone] = useState('Educational');
  const [language, setLanguage] = useState('English');
  const [goal, setGoal] = useState('Engagement');
  const [audience, setAudience] = useState('Students');
  const [location, setLocation] = useState('India');
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeTab, setActiveTab] = useState(0);
  const [result, setResult] = useState<ResultState | null>(null);

  const togglePlatform = (name: string) => {
    if (multi) {
      setSelectedPlatforms((prev) =>
        prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
      );
    } else {
      setSelectedPlatforms([name]);
    }
  };

  const generate = async () => {
    if (!content.trim()) return;
    setPhase('loading');
    setResult(null);
    try {
      // Multi-platform: send `platforms` array. Single: send `platform` string.
      // Backend accepts either (see /api/generate in routes/index.js).
      const body: Record<string, unknown> = {
        content: content.trim(),
        niche,
        template,
        tone,
        language,
        goal,
        audience,
        location,
      };
      if (multi && selectedPlatforms.length > 1) {
        body.platforms = selectedPlatforms;
      } else {
        body.platform = selectedPlatforms[0] || 'Instagram';
      }
      const data = await apiPost<GenerateResponse>('/api/generate', body);

      // Normalize the response (single generation OR multi-generation array).
      const gens = data.generations || (data.generation ? [data.generation] : []);
      if (gens.length === 0) {
        throw new ApiError('No content returned. Please try again.', 500, data);
      }
      // For multi-platform, keep the per-platform list. Otherwise show the single result.
      const first = gens[0];
      setResult({
        titles: first?.titles || [],
        captions: first?.captions || [],
        hashtags: first?.hashtags || [],
        cta: first?.cta || '',
        scores: first?.scores,
        score: first?.score,
        fallback: data.fallback,
        message: data.message,
        platforms: gens.map((g) => g?.platform || selectedPlatforms[0]),
      });
      setPhase('result');
      setActiveTab(0);
      if (data.fallback) {
        toast({
          title: 'AI provider was unavailable',
          description: data.message || 'Showing sample output.',
          tone: 'info',
        });
      } else {
        toast({ title: 'Generated!', tone: 'success' });
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Generation failed. Please try again.';
      toast({ title: 'Generation failed', description: msg, tone: 'error' });
      setPhase('idle');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="AI Generator"
        title="Create a post package"
        subtitle="Pick a platform, describe your post, and let AI craft captions, hashtags, and CTAs."
      >
        <div className="flex items-center gap-2 rounded-full bg-surface-hover px-3 py-1.5 text-xs font-medium text-text-secondary">
          <Brain className="h-3.5 w-3.5 text-brand" />
          Credits left: {user?.credits ?? 0}
        </div>
        {content.trim() && (
          <button className="btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold">
            <Save className="h-4 w-4" />
            Save to library
          </button>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT — Form */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Multi-platform toggle */}
            <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-2 p-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Multi-platform mode</p>
                <p className="text-xs text-text-tertiary">Generate for multiple platforms at once</p>
              </div>
              <Toggle checked={multi} onChange={(v) => {
                setMulti(v);
                if (!v) setSelectedPlatforms(['Instagram']);
              }} />
            </div>

            {/* Platform picker */}
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Platform</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {platforms.map((p) => {
                  const active = selectedPlatforms.includes(p.name);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      aria-pressed={active}
                      onClick={() => togglePlatform(p.name)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
                        active
                          ? 'border-brand bg-brand/10 shadow-glow'
                          : 'border-border bg-surface-hover hover:border-text-tertiary'
                      }`}
                    >
                      <span className="text-lg">{p.emoji}</span>
                      <span className={`text-[10px] ${active ? 'text-brand' : 'text-text-secondary'}`}>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Niche chips */}
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">What's your niche?</label>
              <div className="flex flex-wrap gap-2">
                {niches.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNiche(n)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      niche === n ? 'border-brand bg-brand/10 text-brand' : 'border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Content textarea */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-text-secondary">Describe your post</label>
                <span className="text-xs text-text-tertiary">{content.length} / 500</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Example: New JEE 2027 batch starting in Patna..."
                className="input-field w-full resize-none px-3 py-2.5 text-sm"
              />
            </div>

            {/* Template grid */}
            <div>
              <label className="mb-2 block text-xs font-medium text-text-secondary">Pick a template</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {templates.map((t) => {
                  const active = template === t.label;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setTemplate(t.label)}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-all ${
                        active ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-surface-hover text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span>{t.emoji}</span>
                      <span className="font-medium">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced options */}
            <div>
              <button
                type="button"
                onClick={() => setAdvanced((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Advanced options
                {advanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <AnimatePresence initial={false}>
                {advanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-3 pt-2 sm:grid-cols-2">
                      <Select label="Tone" value={tone} onChange={setTone} options={tones} />
                      <Select label="Language" value={language} onChange={setLanguage} options={languages} />
                      <Select label="Goal" value={goal} onChange={setGoal} options={goals} />
                      <Select label="Audience" value={audience} onChange={setAudience} options={audiences} />
                      <Select label="Location" value={location} onChange={setLocation} options={locations} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={!content.trim() || phase === 'loading'}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate post package
                </>
              )}
            </button>
          </div>
        </Card>

        {/* RIGHT — Result panel */}
        <div>
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="flex min-h-[400px] items-center justify-center">
                  <EmptyState
                    icon={Sparkles}
                    title="Your AI-generated content will appear here"
                    description="Fill in the form on the left and hit Generate to create titles, captions, hashtags, and CTAs."
                  />
                </Card>
              </motion.div>
            )}

            {phase === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="min-h-[400px]">
                  <AIThinking />
                </Card>
              </motion.div>
            )}

            {phase === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Fallback banner — only when the backend reported fallback */}
                {result.fallback && (
                  <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {result.message || 'AI provider was unavailable — showing sample output.'}
                  </div>
                )}

                {/* Multi-platform tabs */}
                {multi && selectedPlatforms.length > 1 && (result.platforms?.length ?? 0) > 1 && (
                  <div className="flex gap-1 overflow-x-auto border-b border-border">
                    {(result.platforms ?? selectedPlatforms).map((p, i) => (
                      <button
                        key={p}
                        onClick={() => setActiveTab(i)}
                        className={`whitespace-nowrap border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                          activeTab === i ? 'border-brand text-brand' : 'border-transparent text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {/* Titles */}
                {result.titles.length > 0 && (
                  <ResultCard
                    icon={FileText}
                    title={`Titles (${result.titles.length})`}
                    action={<CopyButton text={result.titles.join('\n')} label="Copy all" />}
                  >
                    <div className="space-y-1.5">
                      {result.titles.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-md bg-surface-hover/50 p-2 text-sm text-text-primary">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                          <span className="flex-1">{t}</span>
                          <CopyButton text={t} label="" />
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Captions */}
                {result.captions.length > 0 && (
                  <ResultCard icon={FileText} title={`Captions (${result.captions.length})`}>
                    <div className="space-y-2">
                      {result.captions.map((c, i) => (
                        <div key={i} className="rounded-lg bg-surface-hover/50 p-3">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                            {c}
                          </p>
                          <div className="mt-2 flex justify-end">
                            <CopyButton text={c} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Hashtags */}
                {result.hashtags.length > 0 && (
                  <ResultCard
                    icon={Hash}
                    title="Hashtags"
                    action={<CopyButton text={result.hashtags.join(' ')} label="Copy all" />}
                  >
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((h) => (
                        <span key={h} className="rounded-full bg-surface-hover px-3 py-1 text-xs text-text-secondary">
                          {h}
                        </span>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* CTA */}
                {result.cta && (
                  <div className="rounded-xl border border-brand/20 bg-brand/10 p-4">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-brand" />
                      <span className="text-sm font-semibold text-text-primary">Call to action</span>
                    </div>
                    <p className="mt-2 text-sm text-text-primary">{result.cta}</p>
                    <div className="mt-2 flex justify-end">
                      <CopyButton text={result.cta} />
                    </div>
                  </div>
                )}

                {/* Score card — only when scores are present */}
                {result.scores && result.scores.length > 0 && (
                  <ScoreCard scores={result.scores} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof FileText;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function ScoreCard({ scores }: { scores: { label: string; value: number }[] }) {
  const total = scores.length
    ? Math.round(scores.reduce((a, s) => a + s.value, 0) / scores.length)
    : 0;
  const [showSuggestions, setShowSuggestions] = useState(false);

  const percentileLabel = total >= 85 ? 'Top 10%' : total >= 70 ? 'Top 25%' : 'Average';

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">Content score</h4>
        <Badge tone={total >= 70 ? 'success' : 'warning'}>{percentileLabel}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="text-3xl font-bold text-gradient">{total}</div>
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-x-4 gap-y-2">
            {scores.map((s) => (
              <ScoreBar key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowSuggestions((v) => !v)}
        className="mt-4 flex w-full items-center justify-between rounded-lg px-1 py-2 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        AI suggestions
        {showSuggestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <AnimatePresence initial={false}>
        {showSuggestions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="space-y-2 pt-1 text-xs text-text-secondary">
              <li className="flex gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-success" /> Add a question to the hook to boost curiosity.</li>
              <li className="flex gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-success" /> Include 3-5 more niche hashtags for reach.</li>
              <li className="flex gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-success" /> Shorten caption by 15% for better readability.</li>
            </ul>
            <button className="btn-brand mt-3 w-full rounded-lg py-2 text-xs font-semibold">
              Apply all suggestions
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-success' : value >= 60 ? 'bg-warning' : 'bg-error';
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-text-tertiary">
        <span>{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-hover">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}
