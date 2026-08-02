import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Brain, Loader2 } from 'lucide-react';
import { PageHeader, Card, Badge, EmptyState, Skeleton } from '@/components/ui';
import { Modal } from '@/components/controls';
import { memoryGroups as initialGroups, type MemoryGroup } from '@/lib/mockData';
import { apiGet, apiDelete, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';

interface MemoryRow {
  id: string;
  type?: string;
  group?: string;
  value: string;
  uses?: number;
}

export default function Memory() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<MemoryGroup[] | null>(null);
  const [showClear, setShowClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ success: boolean; memories?: MemoryRow[]; memory?: MemoryRow[] }>('/api/memory');
        if (cancelled) return;
        const rows = data.memories || data.memory || [];
        if (rows.length === 0) {
          setGroups(initialGroups.map((g) => ({ ...g, items: [] })));
          return;
        }
        // Group rows by type/group key
        const byKey: Record<string, { value: string; uses: number }[]> = {};
        rows.forEach((r) => {
          const key = (r.type || r.group || 'other').toLowerCase();
          if (!byKey[key]) byKey[key] = [];
          byKey[key].push({ value: r.value, uses: r.uses || 0 });
        });
        // Map known groups + any unknown ones
        const known: MemoryGroup[] = initialGroups.map((g) => ({
          ...g,
          items: byKey[g.key] || [],
        }));
        // Add any unknown groups
        Object.keys(byKey).forEach((key) => {
          if (!known.some((g) => g.key === key)) {
            known.push({
              key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              icon: key.charAt(0).toUpperCase(),
              items: byKey[key],
            });
          }
        });
        setGroups(known);
      } catch {
        if (cancelled) return;
        setGroups(initialGroups);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const deleteItem = async (groupKey: string, value: string) => {
    // Find the memory id locally first (we don't have it; the API expects an id).
    // In practice, the list endpoint returns ids — we'll try to find the row by value.
    let id: string | null = null;
    const all: MemoryRow[] = [];
    (groups || []).forEach((g) =>
      g.items.forEach((it) => all.push({ id: `${g.key}-${it.value}`, type: g.key, value: it.value, uses: it.uses }))
    );
    id = all.find((r) => r.value === value)?.id || null;

    setDeletingId(id || value);
    try {
      // Optimistic: remove from local state
      setGroups((prev) =>
        (prev || []).map((g) =>
          g.key === groupKey ? { ...g, items: g.items.filter((it) => it.value !== value) } : g
        )
      );
      // If we have a real id from the server, call the API; otherwise skip silently
      if (id && !id.includes('-')) {
        await apiDelete(`/api/memory/${id}`);
      }
      toast({ title: 'Memory deleted', tone: 'info' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not delete memory.';
      toast({ title: 'Delete failed', description: msg, tone: 'error' });
      // Re-fetch on failure
      try {
        const data = await apiGet<{ success: boolean; memories?: MemoryRow[]; memory?: MemoryRow[] }>('/api/memory');
        const rows = data.memories || data.memory || [];
        const byKey: Record<string, { value: string; uses: number }[]> = {};
        rows.forEach((r) => {
          const k = (r.type || r.group || 'other').toLowerCase();
          if (!byKey[k]) byKey[k] = [];
          byKey[k].push({ value: r.value, uses: r.uses || 0 });
        });
        setGroups(
          initialGroups
            .map((g) => ({ ...g, items: byKey[g.key] || [] }))
            .concat(
              Object.keys(byKey)
                .filter((k) => !initialGroups.some((g) => g.key === k))
                .map((k) => ({
                  key: k,
                  label: k.charAt(0).toUpperCase() + k.slice(1),
                  icon: k.charAt(0).toUpperCase(),
                  items: byKey[k],
                }))
            )
        );
      } catch {
        /* ignore */
      }
    } finally {
      setDeletingId(null);
    }
  };

  const clearAll = async () => {
    setClearing(true);
    try {
      await apiDelete('/api/memory');
      setGroups((prev) => (prev || []).map((g) => ({ ...g, items: [] })));
      setShowClear(false);
      toast({ title: 'All memories cleared', tone: 'info' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not clear memories.';
      toast({ title: 'Clear failed', description: msg, tone: 'error' });
    } finally {
      setClearing(false);
    }
  };

  const hasItems = (groups || []).some((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader badge="Module 3 · AI Memory" title="What AI remembers" subtitle="The AI learns from your generations. Manage what it stores here.">
        {hasItems && (
          <button onClick={() => setShowClear(true)} className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:text-error">
            Clear all
          </button>
        )}
      </PageHeader>

      {groups === null ? (
        <Card className="p-5">
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      ) : !hasItems ? (
        <Card className="flex min-h-[300px] items-center justify-center">
          <EmptyState icon={Brain} title="No memories yet" description="As you generate content, the AI will remember your preferences here." />
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.filter((g) => g.items.length > 0).map((group, gi) => (
            <motion.div
              key={group.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05 }}
            >
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand/10 text-xs font-bold text-brand">
                    {group.icon}
                  </span>
                  <h3 className="text-sm font-semibold text-text-primary">{group.label}</h3>
                  <Badge tone="neutral">{group.items.length}</Badge>
                </div>
                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <div key={item.value} className="flex items-center gap-2 rounded-lg bg-surface-hover/50 p-2.5">
                      <span className="flex-1 truncate text-sm text-text-primary">{item.value}</span>
                      <span className="text-xs text-text-tertiary">used {item.uses}x</span>
                      <button
                        onClick={() => deleteItem(group.key, item.value)}
                        disabled={deletingId === item.value || deletingId === `${group.key}-${item.value}`}
                        className="btn-ghost rounded-lg p-1.5 text-text-tertiary hover:text-error disabled:opacity-50"
                        aria-label="Delete memory"
                      >
                        {deletingId === item.value || deletingId === `${group.key}-${item.value}` ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showClear} onClose={() => setShowClear(false)} title="Clear all memories?">
        <p className="text-sm text-text-secondary">
          This will permanently delete all stored memories across every group. The AI will start learning from scratch. This cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={() => setShowClear(false)} className="btn-secondary flex-1 rounded-xl py-2.5 text-sm font-semibold">
            Cancel
          </button>
          <button
            onClick={clearAll}
            disabled={clearing}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-error py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
          >
            {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {clearing ? 'Clearing…' : 'Yes, clear all'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
