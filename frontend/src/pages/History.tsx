import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, History as HistoryIcon, Sparkles } from 'lucide-react';
import { PageHeader, Card, Badge, EmptyState, CopyButton, Skeleton } from '@/components/ui';
import { platforms, recentGenerations, type Generation } from '@/lib/mockData';
import { apiGet, ApiError } from '@/lib/api';

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

export default function History() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rows, setRows] = useState<Generation[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ success: boolean; history: HistoryRow[] }>('/api/history');
        if (cancelled) return;
        const mapped: Generation[] = (data.history || []).map((h, i) => {
          const platformName = (h.platform || '').trim() || 'Instagram';
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
        setRows(mapped.length ? mapped : recentGenerations);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setRows([]); // Not logged in → empty
        } else {
          setRows(recentGenerations); // Backend unreachable → demo data
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        badge="History"
        title="Your generations"
        subtitle="Browse and revisit every post you've created."
      />

      {rows === null ? (
        <Card className="p-5">
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="flex min-h-[300px] items-center justify-center">
          <EmptyState
            icon={HistoryIcon}
            title="No generations yet"
            description="Generate your first post to see it here."
            action={
              <a
                href="/generate"
                className="btn-brand inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" /> Generate post
              </a>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((g) => {
            const emoji = platforms.find((p) => p.name === g.platform)?.emoji ?? '📝';
            const isOpen = expanded === g.id;
            return (
              <Card key={g.id} className="overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : g.id)}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-hover/50"
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
                    <ChevronDown
                      className={`h-4 w-4 text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="space-y-3 p-4">
                        {g.titles?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                              Titles
                            </p>
                            <ul className="mt-1.5 space-y-1">
                              {g.titles.map((t, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-text-primary"
                                >
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                                  <span className="flex-1">{t}</span>
                                  <CopyButton text={t} label="" />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {g.captions?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                              Captions
                            </p>
                            <div className="mt-1.5 space-y-2">
                              {g.captions.map((c, i) => (
                                <div key={i} className="rounded-lg bg-surface-hover/50 p-3">
                                  <p className="whitespace-pre-wrap text-sm text-text-primary">{c}</p>
                                  <div className="mt-2 flex justify-end">
                                    <CopyButton text={c} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {g.hashtags?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                              Hashtags
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {g.hashtags.map((h) => (
                                <span
                                  key={h}
                                  className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs text-text-secondary"
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {g.cta && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                              CTA
                            </p>
                            <p className="mt-1.5 text-sm text-text-primary">{g.cta}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
