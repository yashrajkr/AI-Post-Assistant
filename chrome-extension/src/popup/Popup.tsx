import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Settings, Zap, AlertCircle, Loader2, ChevronDown, ChevronUp, Image as ImageIcon, Type, X } from 'lucide-react';
import { generate, analyzeImage, getMe, ApiError, type GenerateResult, type User } from '../lib/api';
import { getApiKey, getDefaultPlatform } from '../lib/storage';

const PLATFORMS = ['Instagram', 'YouTube', 'LinkedIn', 'Facebook', 'X', 'WhatsApp'];
const NICHES = ['Education', 'Coaching', 'Tech', 'Shop', 'Fitness', 'Food', 'Beauty', 'Personal Brand'];
const TONES = ['Professional', 'Friendly', 'Educational', 'Luxury', 'Minimal', 'Bold', 'Funny'];

type Mode = 'text' | 'image';
type ImageResult = {
  caption: string;
  hook: string;
  hashtags: string[];
  altText: string;
  cta: string;
  keywords: string[];
};

export default function Popup() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>('text');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [platform, setPlatform] = useState('Instagram');
  const [niche, setNiche] = useState('Education');
  const [tone, setTone] = useState('Professional');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);
    const key = await getApiKey();
    setHasApiKey(!!key);
    if (!key) {
      setLoading(false);
      return;
    }
    try {
      const u = await getMe();
      setUser(u);
      const dp = await getDefaultPlatform();
      setPlatform(dp);

      // Check for prefill data from context menu
      const data = await chrome.storage.session.get(['prefillText', 'prefillImage']);
      if (data.prefillText) {
        setContent(data.prefillText);
        setMode('text');
        await chrome.storage.session.remove('prefillText');
      }
      if (data.prefillImage) {
        setImagePreview(data.prefillImage);
        setMode('image');
        await chrome.storage.session.remove('prefillImage');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!content.trim()) {
      setError('Enter some content first.');
      return;
    }
    setError(null);
    setResult(null);
    setGenerating(true);
    try {
      const res = await generate({
        content,
        platform,
        niche,
        language: 'English',
        goal: 'Reach',
        tone,
        template: 'general',
      });
      setResult(res.generation.result);
      setUsedFallback(res.usedFallback || false);
      setUser(res.user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Generation failed. Try again.');
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleAnalyzeImage() {
    if (!imagePreview) {
      setError('No image to analyze.');
      return;
    }
    setError(null);
    setImageResult(null);
    setGenerating(true);
    try {
      const res = await analyzeImage(imagePreview, {
        platform,
        niche,
        tone: tone.toLowerCase(),
      });
      setImageResult(res.analysis.result);
      setUser(res.user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Image analysis failed. Try again.');
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
        setMode('text');
      }
    } catch {
      setError('Cannot access clipboard. Paste manually.');
    }
  }

  async function copyToClipboard(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      setError('Failed to copy. Try manually.');
    }
  }

  function openOptions() {
    chrome.runtime.openOptionsPage();
  }

  function resetAll() {
    setResult(null);
    setImageResult(null);
    setContent('');
    setImagePreview(null);
    setError(null);
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // No API key state
  if (!hasApiKey) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-display text-lg font-bold">Welcome to AI Post Assistant</h1>
        <p className="mt-2 text-sm text-text-muted">
          To get started, you need to add your API key.
        </p>
        <button
          onClick={openOptions}
          className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Settings className="h-4 w-4" /> Open Settings
        </button>
      </div>
    );
  }

  const hasResult = result || imageResult;

  return (
    <div className="min-h-[500px]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
            P
          </div>
          <span className="font-display text-sm font-bold">PostReady AI</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium">
              <Zap className="h-3 w-3 text-warning" />
              {user.credits}
            </span>
          ) : null}
          <button onClick={openOptions} className="rounded-md p-1 text-text-muted hover:bg-surface-2 hover:text-text" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="p-4">
        {error ? (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 p-3 text-xs text-error">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {!hasResult ? (
          <>
            {/* Mode switcher */}
            <div className="mb-3 flex gap-1 rounded-lg bg-surface-2 p-1">
              <button
                onClick={() => setMode('text')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                  mode === 'text' ? 'bg-primary text-white' : 'text-text-muted hover:text-text'
                }`}
              >
                <Type className="h-3.5 w-3.5" /> Text
              </button>
              <button
                onClick={() => setMode('image')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                  mode === 'image' ? 'bg-primary text-white' : 'text-text-muted hover:text-text'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" /> Image
              </button>
            </div>

            {mode === 'text' ? (
              <>
                <label className="mb-1 block text-xs font-medium text-text-muted">Content idea</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste any text here, or right-click selected text on any webpage..."
                  className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handlePasteFromClipboard}
                  className="mt-1 text-[10px] text-primary hover:underline"
                >
                  Paste from clipboard
                </button>
              </>
            ) : (
              <>
                <label className="mb-1 block text-xs font-medium text-text-muted">Image</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="To analyze" className="w-full rounded-lg border border-border" style={{ maxHeight: '180px', objectFit: 'contain', background: '#09090B' }} />
                    <button
                      onClick={() => setImagePreview(null)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                    <ImageIcon className="mx-auto mb-2 h-8 w-8 text-text-muted" />
                    <p className="text-xs text-text-muted">Right-click any image on a webpage → "Analyze image with AI"</p>
                  </div>
                )}
              </>
            )}

            {/* Common selectors */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-text-muted">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs"
                >
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-text-muted">Niche</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs"
                >
                  {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Advanced */}
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              className="mt-3 flex w-full items-center justify-between text-[10px] font-medium text-text-muted"
            >
              <span>Advanced options</span>
              {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showAdvanced ? (
              <div className="mt-2">
                <label className="mb-1 block text-[10px] font-medium text-text-muted">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs"
                >
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ) : null}

            <button
              onClick={mode === 'text' ? handleGenerate : handleAnalyzeImage}
              disabled={generating || (mode === 'text' ? !content.trim() : !imagePreview)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === 'text' ? 'Generating...' : 'Analyzing...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {mode === 'text' ? 'Generate ✨' : 'Analyze Image 🔍'}
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[10px] text-text-muted">
              Costs {mode === 'text' ? '1' : '1'} credit
            </p>
          </>
        ) : (
          <>
            {/* Results */}
            {usedFallback ? (
              <div className="mb-3 rounded-lg border border-warning/30 bg-warning/5 p-2 text-[10px] text-warning">
                ⚠️ AI provider was unavailable — showing sample output.
              </div>
            ) : null}

            {/* Text generation result */}
            {result ? (
              <>
                {result.score ? (
                  <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-2">
                    <span className="text-[10px] font-medium text-text-muted">Content Score</span>
                    <span className="font-display text-lg font-bold text-primary">{result.score.total}/100</span>
                  </div>
                ) : null}

                {result.titles.length > 0 ? (
                  <ResultSection title="Titles" items={result.titles} onCopy={copyToClipboard} copiedField={copiedField} fieldKey="titles" />
                ) : null}

                {result.captions.length > 0 ? (
                  <ResultSection title="Captions" items={result.captions} onCopy={copyToClipboard} copiedField={copiedField} fieldKey="captions" />
                ) : null}

                {result.hashtags.length > 0 ? (
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-text-muted">HASHTAGS</span>
                      <button
                        onClick={() => copyToClipboard(result.hashtags.join(' '), 'hashtags')}
                        className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                      >
                        {copiedField === 'hashtags' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        Copy all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.hashtags.map((h, i) => (
                        <span key={i} className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px]">{h}</span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {result.cta ? (
                  <div className="mb-3 rounded-lg bg-primary/10 p-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-primary">CTA</span>
                      <button onClick={() => copyToClipboard(result.cta, 'cta')} className="text-[10px] text-primary hover:underline">
                        {copiedField === 'cta' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <p className="text-xs">{result.cta}</p>
                  </div>
                ) : null}
              </>
            ) : null}

            {/* Image analysis result */}
            {imageResult ? (
              <>
                {imageResult.caption ? (
                  <CopyCard title="Caption" icon="📝" text={imageResult.caption} onCopy={copyToClipboard} copiedField={copiedField} fieldKey="caption" />
                ) : null}
                {imageResult.hook ? (
                  <CopyCard title="Hook" icon="🪝" text={imageResult.hook} onCopy={copyToClipboard} copiedField={copiedField} fieldKey="hook" />
                ) : null}
                {imageResult.hashtags && imageResult.hashtags.length > 0 ? (
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-text-muted">🏷️ HASHTAGS</span>
                      <button
                        onClick={() => copyToClipboard(imageResult.hashtags.join(' '), 'hashtags')}
                        className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                      >
                        {copiedField === 'hashtags' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        Copy all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {imageResult.hashtags.map((h, i) => (
                        <span key={i} className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px]">{h}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {imageResult.altText ? (
                  <CopyCard title="Alt Text" icon="♿" text={imageResult.altText} onCopy={copyToClipboard} copiedField={copiedField} fieldKey="altText" />
                ) : null}
                {imageResult.cta ? (
                  <CopyCard title="CTA" icon="📣" text={imageResult.cta} onCopy={copyToClipboard} copiedField={copiedField} fieldKey="cta" highlighted />
                ) : null}
                {imageResult.keywords && imageResult.keywords.length > 0 ? (
                  <div className="mb-3">
                    <span className="text-[10px] font-semibold text-text-muted">🔍 KEYWORDS</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {imageResult.keywords.map((k, i) => (
                        <span key={i} className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px]">{k}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            <button
              onClick={resetAll}
              className="mt-4 w-full rounded-lg border border-border bg-surface-2 py-2 text-xs font-medium hover:bg-border"
            >
              ← Start over
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ResultSection({
  title,
  items,
  onCopy,
  copiedField,
  fieldKey,
}: {
  title: string;
  items: string[];
  onCopy: (text: string, field: string) => void;
  copiedField: string | null;
  fieldKey: string;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1 text-[10px] font-semibold text-text-muted">{title.toUpperCase()}</div>
      <div className="space-y-1">
        {items.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-2 rounded-md bg-surface-2 p-2">
            <span className="flex-1 text-xs">{item}</span>
            <button
              onClick={() => onCopy(item, `${fieldKey}-${i}`)}
              className="flex-shrink-0 text-text-muted hover:text-text"
              aria-label={`Copy ${title} ${i + 1}`}
            >
              {copiedField === `${fieldKey}-${i}` ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CopyCard({
  title,
  icon,
  text,
  onCopy,
  copiedField,
  fieldKey,
  highlighted,
}: {
  title: string;
  icon: string;
  text: string;
  onCopy: (text: string, field: string) => void;
  copiedField: string | null;
  fieldKey: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`mb-3 rounded-lg p-2 ${highlighted ? 'bg-primary/10' : 'bg-surface-2'}`}>
      <div className="mb-1 flex items-center justify-between">
        <span className={`text-[10px] font-semibold ${highlighted ? 'text-primary' : 'text-text-muted'}`}>
          {icon} {title.toUpperCase()}
        </span>
        <button onClick={() => onCopy(text, fieldKey)} className="text-text-muted hover:text-text">
          {copiedField === fieldKey ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <p className="text-xs">{text}</p>
    </div>
  );
}
