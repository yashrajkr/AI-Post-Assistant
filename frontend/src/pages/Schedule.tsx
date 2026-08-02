import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CalendarClock, Loader2 } from 'lucide-react';
import { PageHeader, Card, Badge, EmptyState, Skeleton } from '@/components/ui';
import { Modal, Select } from '@/components/controls';
import { scheduleList as initial, platforms, type Schedule as Sched } from '@/lib/mockData';
import { apiGet, apiPost, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';

interface ScheduleRow {
  id: string;
  platform?: string;
  content?: string;
  text?: string;
  date?: string;
  scheduledAt?: string;
  createdAt?: string;
  created?: string;
  status?: 'planned' | 'posted' | 'cancelled';
}

function formatDate(s?: string): string {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return s;
  }
}

export default function Schedule() {
  const { toast } = useToast();
  const [items, setItems] = useState<Sched[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ content: '', platform: 'Instagram', datetime: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ success: boolean; schedules: ScheduleRow[] }>('/api/schedules');
        if (cancelled) return;
        const mapped: Sched[] = (data.schedules || []).map((s) => {
          const platformName = (s.platform || '').trim() || 'Instagram';
          const platform = (platforms.find((p) => p.name === platformName)?.name ??
            'Instagram') as Sched['platform'];
          return {
            id: s.id,
            platform,
            content: s.content || s.text || '',
            date: formatDate(s.date || s.scheduledAt),
            created: formatDate(s.createdAt) || s.created || '',
            status: s.status || 'planned',
          };
        });
        setItems(mapped.length ? mapped : initial);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setItems([]);
        } else {
          setItems(initial);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const create = async () => {
    if (!form.content.trim() || !form.datetime) return;
    setCreating(true);
    try {
      await apiPost('/api/schedules', {
        content: form.content.trim(),
        platform: form.platform,
        scheduledAt: new Date(form.datetime).toISOString(),
      });
      const newSched: Sched = {
        id: 's' + Date.now(),
        platform: form.platform as Sched['platform'],
        content: form.content.trim(),
        date: formatDate(new Date(form.datetime).toISOString()),
        created: 'Just now',
        status: 'planned',
      };
      setItems((prev) => [newSched, ...(prev || [])]);
      setForm({ content: '', platform: 'Instagram', datetime: '' });
      setShowCreate(false);
      toast({ title: 'Scheduled!', tone: 'success' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not schedule.';
      toast({ title: 'Schedule failed', description: msg, tone: 'error' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader badge="Planner" title="Schedule planner" subtitle="Plan and track your upcoming posts.">
        <button onClick={() => setShowCreate(true)} className="btn-brand inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
          <Plus className="h-4 w-4" />
          Schedule post
        </button>
      </PageHeader>

      {items === null ? (
        <Card className="p-5">
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      ) : items.length === 0 ? (
        <Card className="flex min-h-[300px] items-center justify-center">
          <EmptyState icon={CalendarClock} title="No scheduled posts yet" description="Create a schedule to plan your content ahead of time." />
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((s, i) => {
            const emoji = platforms.find((p) => p.name === s.platform)?.emoji ?? '📝';
            const statusTone = s.status === 'posted' ? 'success' : s.status === 'cancelled' ? 'error' : 'brand';
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-hover text-lg">{emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{s.content}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{s.platform}</Badge>
                      <span className="flex items-center gap-1 text-xs text-text-tertiary">📅 {s.date}</span>
                      {s.created && <span className="text-xs text-text-tertiary">· created {s.created}</span>}
                    </div>
                  </div>
                  <Badge tone={statusTone as 'success' | 'error' | 'brand'}>{s.status}</Badge>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Schedule post">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Content</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} className="input-field w-full resize-none px-3 py-2.5 text-sm" placeholder="Post content..." />
          </div>
          <Select label="Platform" value={form.platform} onChange={(v) => setForm({ ...form, platform: v })} options={platforms.map((p) => p.name)} />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Date &amp; time</label>
            <input type="datetime-local" value={form.datetime} onChange={(e) => setForm({ ...form, datetime: e.target.value })} className="input-field w-full px-3 py-2.5 text-sm" />
          </div>
          <button
            onClick={create}
            disabled={creating || !form.content.trim() || !form.datetime}
            className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              'Save schedule'
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
