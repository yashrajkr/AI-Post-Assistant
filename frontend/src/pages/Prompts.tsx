import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Trash2, Globe, Lock, Loader2, Sparkles } from 'lucide-react';
import { PageHeader, Card, Badge, EmptyState, Skeleton } from '@/components/ui';
import { Modal, Select } from '@/components/controls';
import { promptList, type Prompt } from '@/lib/mockData';
import { apiGet, apiPost, apiDelete, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';

const tabs = ['All', 'My Prompts', 'Trending', 'Education', 'Business', 'Fitness', 'Food', 'General'];

interface PromptRow {
  id: string;
  title: string;
  description?: string;
  body: string;
  category?: string;
  visibility?: 'Public' | 'Private';
  uses?: number;
  rating?: number;
  owner?: boolean;
  isOwner?: boolean;
}

export default function Prompts() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', body: '', category: 'General', visibility: 'Private' });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ success: boolean; prompts: PromptRow[] }>('/api/prompts');
        if (cancelled) return;
        const mapped: Prompt[] = (data.prompts || []).map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description || '',
          body: p.body,
          category: p.category || 'General',
          visibility: p.visibility || 'Private',
          uses: p.uses || 0,
          rating: p.rating || 0,
          owner: p.owner ?? p.isOwner ?? false,
        }));
        setPrompts(mapped.length ? mapped : promptList);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setPrompts([]);
        } else {
          setPrompts(promptList);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = (prompts || []).filter((p) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'My Prompts') return p.owner;
    if (activeTab === 'Trending') return p.uses > 500;
    return p.category === activeTab;
  });

  const createPrompt = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setCreating(true);
    try {
      const data = await apiPost<{ success: boolean; prompt?: PromptRow }>('/api/prompts', {
        title: form.title.trim(),
        description: form.description.trim(),
        body: form.body.trim(),
        category: form.category,
        visibility: form.visibility,
      });
      const newP: Prompt = {
        id: data.prompt?.id || `p${Date.now()}`,
        title: data.prompt?.title || form.title,
        description: data.prompt?.description || form.description,
        body: data.prompt?.body || form.body,
        category: data.prompt?.category || form.category,
        visibility: (data.prompt?.visibility as 'Public' | 'Private') || (form.visibility as 'Public' | 'Private'),
        uses: 0,
        rating: 0,
        owner: true,
      };
      setPrompts((prev) => [newP, ...(prev || [])]);
      setForm({ title: '', description: '', body: '', category: 'General', visibility: 'Private' });
      setShowCreate(false);
      toast({ title: 'Prompt created', tone: 'success' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not create prompt.';
      toast({ title: 'Create failed', description: msg, tone: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const applyPrompt = async (p: Prompt) => {
    try {
      await apiPost(`/api/prompts/${p.id}/use`);
      // Bump local use count
      setPrompts((prev) =>
        (prev || []).map((x) => (x.id === p.id ? { ...x, uses: x.uses + 1 } : x))
      );
      // Navigate to Generate with the prompt body prefilled
      navigate('/generate', { state: { promptBody: p.body } });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not use prompt.';
      toast({ title: 'Use failed', description: msg, tone: 'error' });
    }
  };

  const deletePrompt = async (id: string) => {
    setDeletingId(id);
    try {
      await apiDelete(`/api/prompts/${id}`);
      setPrompts((prev) => (prev || []).filter((p) => p.id !== id));
      toast({ title: 'Prompt deleted', tone: 'info' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not delete.';
      toast({ title: 'Delete failed', description: msg, tone: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader badge="Module 4 · Prompt Library" title="Prompt library" subtitle="Save and reuse your best AI prompts.">
        <button onClick={() => setShowCreate(true)} className="btn-brand inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
          <Plus className="h-4 w-4" />
          New prompt
        </button>
      </PageHeader>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === t ? 'border-brand bg-brand/10 text-brand' : 'border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Prompt grid */}
      {prompts === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex min-h-[300px] items-center justify-center">
          <EmptyState
            icon={Sparkles}
            title="No prompts here"
            description="Create your first prompt to reuse across generations."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="btn-brand inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> New prompt
              </button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -2 }}
              className="card p-4 transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-text-primary">{p.title}</h4>
                <Badge tone={p.visibility === 'Public' ? 'info' : 'neutral'}>
                  {p.visibility === 'Public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {p.visibility}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{p.description}</p>
              <pre className="mt-3 line-clamp-3 rounded-md bg-surface-hover p-2 font-mono text-[10px] text-text-tertiary">{p.body}</pre>
              <div className="mt-3 flex items-center justify-between text-[10px] text-text-tertiary">
                <span>Used {p.uses}x</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {p.rating || '—'}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => applyPrompt(p)}
                  className="btn-brand flex-1 rounded-lg py-2 text-xs font-semibold"
                >
                  Use
                </button>
                {p.owner && (
                  <button
                    onClick={() => deletePrompt(p.id)}
                    disabled={deletingId === p.id}
                    className="btn-ghost rounded-lg p-2 text-text-tertiary hover:text-error disabled:opacity-50"
                    aria-label="Delete prompt"
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create prompt">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field w-full px-3 py-2.5 text-sm" placeholder="Prompt title" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field w-full px-3 py-2.5 text-sm" placeholder="Short description" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Body <span className="text-text-tertiary">(use {'{topic}'} as placeholder)</span></label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} className="input-field w-full resize-none px-3 py-2.5 font-mono text-xs" placeholder="Write a viral hook for {topic}..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={tabs.slice(3)} />
            <Select label="Visibility" value={form.visibility} onChange={(v) => setForm({ ...form, visibility: v })} options={['Private', 'Public']} />
          </div>
          <button
            onClick={createPrompt}
            disabled={creating || !form.title.trim() || !form.body.trim()}
            className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              'Create prompt'
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
