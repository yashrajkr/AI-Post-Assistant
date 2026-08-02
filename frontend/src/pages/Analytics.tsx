import { useEffect, useState } from 'react';
import { Zap, FileText, CalendarClock, Sparkles, BarChart3 } from 'lucide-react';
import { PageHeader, StatCard, Card, Badge, EmptyState, Skeleton } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { apiGet, ApiError } from '@/lib/api';
import { recentGenerations, platforms, type Generation } from '@/lib/mockData';

interface AnalyticsRow {
  id: string;
  platform?: string;
  niche?: string;
  content?: string;
  titles?: string[];
  captions?: string[];
  provider?: string;
  score?: number;
  createdAt?: string;
  timeAgo?: string;
}

interface AnalyticsResponse {
  success: boolean;
  analytics?: {
    totalGenerations?: number;
    last30Days?: number;
    scheduled?: number;
    avgScore?: number;
    platformBreakdown?: Record<string, number>;
    nicheBreakdown?: Record<string, number>;
    topProvider?: string;
  };
  generations?: AnalyticsRow[];
  history?: AnalyticsRow[];
}

export default function Analytics() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Generation[] | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse['analytics'] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<AnalyticsResponse>('/api/analytics');
        if (cancelled) return;
        setAnalytics(data.analytics || null);
        const sourceRows = data.history || data.generations || [];
        const mapped: Generation[] = sourceRows.map((h, i) => {
          const platformName = (h.platform || '').trim() || 'Instagram';
          const platform = (platforms.find((p) => p.name === platformName)?.name ??
            'Instagram') as Generation['platform'];
          return {
            id: h.id || `g${i}`,
            platform,
            niche: h.niche || '—',
            content: h.content || h.titles?.[0] || h.captions?.[0] || '',
            timeAgo: h.timeAgo || '',
            provider: h.provider || 'AI',
            score: h.score,
            titles: h.titles || [],
            captions: h.captions || [],
            hashtags: [],
            cta: '',
            scores: [],
          };
        });
        setRows(mapped.length ? mapped : recentGenerations);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setRows([]);
        } else {
          setRows(recentGenerations);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const platformCount: Record<string, number> =
    analytics?.platformBreakdown ||
    (() => {
      const m: Record<string, number> = {};
      (rows || recentGenerations).forEach((g) => {
        m[g.platform] = (m[g.platform] ?? 0) + 1;
      });
      return m;
    })();
  const nicheCount: Record<string, number> =
    analytics?.nicheBreakdown ||
    (() => {
      const m: Record<string, number> = {};
      (rows || recentGenerations).forEach((g) => {
        if (g.niche) m[g.niche] = (m[g.niche] ?? 0) + 1;
      });
      return m;
    })();

  const topPlatform =
    Object.entries(platformCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  const topNiche = Object.entries(nicheCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const totalGenerations = analytics?.totalGenerations ?? (rows?.length ?? recentGenerations.length);
  const last30 = analytics?.last30Days ?? totalGenerations;
  const scheduled = analytics?.scheduled ?? 3;
  const avgScore = analytics?.avgScore ?? 83;

  const isEmpty = (rows?.length ?? 0) === 0 && !analytics;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader badge="Analytics" title="Your usage data" subtitle="Understand how you're using PostReady AI." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Credits" value={user?.credits ?? 0} icon={Zap} color="warning" delay={0} />
        <StatCard label="Generations" value={totalGenerations} icon={FileText} color="secondary" delay={0.05} />
        <StatCard label="Schedules" value={scheduled} icon={CalendarClock} color="info" delay={0.1} />
        <StatCard label="Plan" value={user?.plan || 'Free'} icon={Sparkles} color="brand" delay={0.15} />
      </div>

      {rows === null ? (
        <Card className="p-5">
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      ) : isEmpty ? (
        <Card className="flex min-h-[300px] items-center justify-center">
          <EmptyState icon={BarChart3} title="No data yet" description="Start generating content to see your analytics here." />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="font-display text-sm font-semibold text-text-primary">Last 30 days</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-surface-hover/50 p-3">
                <span className="text-sm text-text-secondary">Generations</span>
                <span className="font-display text-lg font-bold text-text-primary">{last30}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-hover/50 p-3">
                <span className="text-sm text-text-secondary">Scheduled posts</span>
                <span className="font-display text-lg font-bold text-text-primary">{scheduled}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-hover/50 p-3">
                <span className="text-sm text-text-secondary">Avg content score</span>
                <span className="font-display text-lg font-bold text-success">{avgScore}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-sm font-semibold text-text-primary">Top patterns</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-surface-hover/50 p-3">
                <span className="text-sm text-text-secondary">Most used platform</span>
                <Badge tone="brand">{topPlatform}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-hover/50 p-3">
                <span className="text-sm text-text-secondary">Most used niche</span>
                <Badge tone="info">{topNiche}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-hover/50 p-3">
                <span className="text-sm text-text-secondary">Top AI provider</span>
                <Badge tone="neutral">{analytics?.topProvider || user?.aiMode || 'GPT-4o'}</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
