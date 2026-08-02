import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, CreditCard, History as HistoryIcon, TrendingUp, Zap, FileText } from 'lucide-react';
import { PageHeader, StatCard, Card, Badge, Skeleton } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { apiGet, ApiError, type GenerateResponse } from '@/lib/api';
import { recentGenerations, platforms, type Generation } from '@/lib/mockData';

interface HistoryRow {
  id: string;
  platform?: string;
  niche?: string;
  content?: string;
  title?: string;
  titles?: string[];
  captions?: string[];
  hashtags?: string[];
  cta?: string;
  provider?: string;
  score?: number;
  createdAt?: string;
  timeAgo?: string;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<Generation[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ success: boolean; history: HistoryRow[] }>('/api/history');
        if (cancelled) return;
        const mapped: Generation[] = (data.history || []).map((h, i) => {
          const platformName =
            (h.platform || '').trim() ||
            (Array.isArray(h.titles) && h.titles[0] ? 'Instagram' : 'Instagram');
          const platform = (platforms.find((p) => p.name === platformName)?.name ??
            'Instagram') as Generation['platform'];
          return {
            id: h.id || `g${i}`,
            platform,
            niche: h.niche || '—',
            content: h.content || h.titles?.[0] || h.captions?.[0] || '',
            timeAgo: h.timeAgo || timeAgo(h.createdAt),
            provider: h.provider || 'AI',
            score: h.score,
            titles: h.titles || [],
            captions: h.captions || [],
            hashtags: h.hashtags || [],
            cta: h.cta || '',
            scores: [],
          };
        });
        setRows(mapped.length ? mapped : recentGenerations.slice(0, 3));
      } catch (err) {
        if (cancelled) return;
        // Backend not reachable / not logged in → show mock for demo purposes
        if (err instanceof ApiError && err.status === 401) {
          setRows(recentGenerations.slice(0, 3));
        } else {
          setRows(recentGenerations.slice(0, 3));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const creditsTotal = user?.creditsTotal || 100;
  const credits = user?.credits ?? 0;
  const creditsUsed = Math.max(0, creditsTotal - credits);
  const creditsPct = creditsTotal ? (creditsUsed / creditsTotal) * 100 : 0;
  const generations = user?.generations ?? rows?.length ?? 0;
  const aiMode = user?.aiMode || 'GPT-4o';
  const firstName = user?.firstName || (user?.name ? user.name.split(' ')[0] : 'there');

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Workspace"
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Track credits, recent outputs, and your launch readiness."
      >
        <button
          onClick={() => navigate('/generate')}
          className="btn-brand inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          <Sparkles className="h-4 w-4" />
          Generate post
        </button>
      </PageHeader>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Plan" value={user?.plan || 'Free'} icon={Sparkles} color="brand" delay={0} />
        <StatCard label="Credits" value={credits} icon={Zap} color="warning" delay={0.05} />
        <StatCard label="Generations" value={generations} icon={FileText} color="secondary" delay={0.1} />
        <StatCard label="AI Mode" value={aiMode} icon={TrendingUp} color="info" delay={0.15} />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/generate')}
          className="btn-brand inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          <Sparkles className="h-4 w-4" />
          Generate Post
        </button>
        <button
          onClick={() => navigate('/history')}
          className="btn-secondary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          <HistoryIcon className="h-4 w-4" />
          View History
        </button>
        <button
          onClick={() => navigate('/pricing')}
          className="btn-secondary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          <CreditCard className="h-4 w-4" />
          Upgrade Plan
        </button>
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent generations */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="font-display text-lg font-semibold text-text-primary">Recent generations</h3>
            <button
              onClick={() => navigate('/history')}
              className="btn-ghost rounded-lg px-3 py-1.5 text-xs font-medium"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-border">
            {rows === null ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-text-secondary">No generations yet.</p>
                <button
                  onClick={() => navigate('/generate')}
                  className="btn-brand mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generate your first post
                </button>
              </div>
            ) : (
              rows.slice(0, 5).map((g, i) => {
                const emoji = platforms.find((p) => p.name === g.platform)?.emoji ?? '📝';
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-hover/50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-hover text-lg">
                      {emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {g.content || g.titles?.[0] || g.captions?.[0]}
                      </p>
                      <p className="mt-0.5 text-xs text-text-tertiary">
                        {g.platform} · {g.niche} · {g.timeAgo}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {g.provider && <Badge tone="neutral">{g.provider}</Badge>}
                      {g.score != null && (
                        <Badge tone={g.score >= 80 ? 'success' : g.score >= 60 ? 'warning' : 'error'}>
                          {g.score}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </Card>

        {/* Usage card */}
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand" />
            <h3 className="font-display text-lg font-semibold text-text-primary">Usage</h3>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Credits used</span>
              <span className="font-medium text-text-primary">
                {creditsUsed} / {creditsTotal}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-hover">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${creditsPct}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="h-full rounded-full bg-brand-gradient"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-lg bg-surface-hover p-3">
            <span className="text-sm text-text-secondary">Current plan</span>
            <Badge tone="brand">{user?.plan || 'Free'}</Badge>
          </div>

          <div className="mt-4 rounded-lg bg-brand/5 p-3">
            <p className="text-xs text-text-secondary">
              💡 Tip: Upgrade to Pro plan for 500 credits/month and unlock document-to-content.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Re-export to satisfy potential downstream type usage
export type { GenerateResponse };
