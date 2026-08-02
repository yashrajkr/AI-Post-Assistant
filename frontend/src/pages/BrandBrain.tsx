import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Eye, X, Check, Loader2, Trash2 } from 'lucide-react';
import { PageHeader, Card, Badge } from '@/components/ui';
import { Select } from '@/components/controls';
import { tones, ctaStyles } from '@/lib/mockData';
import { apiGet, apiPut, apiDelete, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

interface BrandBrainData {
  brandName?: string;
  tagline?: string;
  niche?: string;
  audience?: string;
  tones?: string[];
  ctaStyle?: string;
  bannedWords?: string[];
}

export default function BrandBrain() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [brandName, setBrandName] = useState(user?.brandName || '');
  const [tagline, setTagline] = useState(user?.tagline || '');
  const [niche, setNiche] = useState(user?.niche || '');
  const [audience, setAudience] = useState(user?.audience || '');
  const [selectedTones, setSelectedTones] = useState<string[]>(['Educational']);
  const [ctaStyle, setCtaStyle] = useState<string>('Direct');
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [bannedInput, setBannedInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load existing Brand Brain from the server
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ success: boolean; brandBrain?: BrandBrainData }>('/api/brand-brain');
        if (cancelled) return;
        const bb = data.brandBrain;
        if (bb) {
          setBrandName(bb.brandName || '');
          setTagline(bb.tagline || '');
          setNiche(bb.niche || '');
          setAudience(bb.audience || '');
          setSelectedTones(bb.tones || ['Educational']);
          setCtaStyle(bb.ctaStyle || 'Direct');
          setBannedWords(bb.bannedWords || []);
        }
      } catch {
        // Not loaded yet — keep defaults
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTone = (t: string) => {
    setSelectedTones((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const addBanned = () => {
    const w = bannedInput.trim().toLowerCase();
    if (w && !bannedWords.includes(w)) setBannedWords([...bannedWords, w]);
    setBannedInput('');
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiPut('/api/brand-brain', {
        brandName,
        tagline,
        niche,
        audience,
        tones: selectedTones,
        ctaStyle,
        bannedWords,
      });
      toast({ title: 'Brand Brain saved', tone: 'success' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not save.';
      toast({ title: 'Save failed', description: msg, tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const clearBrain = async () => {
    setClearing(true);
    try {
      await apiDelete('/api/brand-brain');
      setBrandName('');
      setTagline('');
      setNiche('');
      setAudience('');
      setSelectedTones(['Educational']);
      setCtaStyle('Direct');
      setBannedWords([]);
      toast({ title: 'Brand Brain cleared', tone: 'info' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not clear.';
      toast({ title: 'Clear failed', description: msg, tone: 'error' });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        badge="Module 1 · Brand Brain"
        title="Teach the AI your voice"
        subtitle="Define your brand identity so every generation matches your tone and style."
      >
        <button
          onClick={clearBrain}
          disabled={!loaded || clearing}
          className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:text-error disabled:opacity-50"
        >
          {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Clear
        </button>
      </PageHeader>

      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Brand name</label>
            <input value={brandName} onChange={(e) => setBrandName(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" placeholder="Your brand" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" placeholder="Your tagline" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Niche</label>
            <input value={niche} onChange={(e) => setNiche(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" placeholder="Your niche" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Target audience</label>
            <input value={audience} onChange={(e) => setAudience(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" placeholder="Your audience" />
          </div>
        </div>

        {/* Tone multi-select */}
        <div className="mt-5">
          <label className="mb-2 block text-xs font-medium text-text-secondary">Tone (multi-select)</label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTone(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedTones.includes(t) ? 'border-brand bg-brand/10 text-brand' : 'border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* CTA style */}
        <div className="mt-5">
          <Select label="CTA style" value={ctaStyle} onChange={setCtaStyle} options={[...ctaStyles]} />
        </div>

        {/* Banned words */}
        <div className="mt-5">
          <label className="mb-2 block text-xs font-medium text-text-secondary">Banned words</label>
          <div className="flex gap-2">
            <input
              value={bannedInput}
              onChange={(e) => setBannedInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addBanned()}
              className="input-field flex-1 px-3 py-2.5 text-sm"
              placeholder="Add a word to ban..."
            />
            <button onClick={addBanned} className="btn-secondary rounded-lg px-4 py-2.5 text-sm font-semibold">
              Add
            </button>
          </div>
          {bannedWords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {bannedWords.map((w) => (
                <span key={w} className="inline-flex items-center gap-1.5 rounded-full border border-error/30 bg-error/10 px-3 py-1 text-xs font-medium text-error">
                  {w}
                  <button onClick={() => setBannedWords(bannedWords.filter((x) => x !== w))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="btn-brand inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Brand Brain
              </>
            )}
          </button>
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="btn-secondary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            <Eye className="h-4 w-4" />
            Show preview
          </button>
        </div>
      </Card>

      {/* Voice preview */}
      <AnimatePresence initial={false}>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-l-4 border-l-brand p-5">
              <div className="rounded-lg bg-surface-hover p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">Sample caption</p>
                <p className="mt-2 text-sm leading-relaxed text-text-primary">
                  {`🚀 ${tagline || 'Your tagline'} — ${brandName || 'Your brand'} is here to help ${audience.toLowerCase() || 'your audience'} succeed in ${niche.toLowerCase() || 'your niche'}. Our proven methods make learning simple, effective, and ${selectedTones.join(', ').toLowerCase()}. Ready to start? ${ctaStyle === 'None' ? '' : 'Enroll today — link in bio.'}`}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTones.map((t) => (
                    <Badge key={t} tone="success"><Check className="h-3 w-3" /> {t}</Badge>
                  ))}
                  <Badge tone="success"><Check className="h-3 w-3" /> Audience matched</Badge>
                  <Badge tone="success"><Check className="h-3 w-3" /> CTA: {ctaStyle}</Badge>
                  <Badge tone="success"><Check className="h-3 w-3" /> No banned words</Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
