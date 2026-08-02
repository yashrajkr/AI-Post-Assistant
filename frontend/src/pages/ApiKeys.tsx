import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, KeyRound, Trash2, CheckCircle2, AlertTriangle, Chrome, Copy, Check, Loader2 } from 'lucide-react';
import { PageHeader, Card, EmptyState, Skeleton } from '@/components/ui';
import { Modal } from '@/components/controls';
import { apiKeysList, type ApiKey } from '@/lib/mockData';
import { apiGet, apiPost, apiDelete, ApiError } from '@/lib/api';
import { useToast } from '@/lib/toast';

interface ApiKeyRow {
  id: string;
  name: string;
  prefix?: string;
  created?: string;
  createdAt?: string;
  lastUsed?: string;
  lastUsedAt?: string;
}

export default function ApiKeys() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ success: boolean; keys: ApiKeyRow[] }>('/api/api-keys');
        if (cancelled) return;
        const mapped: ApiKey[] = (data.keys || []).map((k) => ({
          id: k.id,
          name: k.name,
          prefix: k.prefix || 'pk_live_••••',
          created: k.created || (k.createdAt ? new Date(k.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'),
          lastUsed: k.lastUsed || (k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'),
        }));
        setKeys(mapped);
      } catch {
        if (cancelled) return;
        setKeys(apiKeysList); // Backend unreachable → demo data
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const createKey = async () => {
    if (!keyName.trim()) return;
    setCreating(true);
    try {
      const data = await apiPost<{ success: boolean; key?: { id: string; raw: string; name: string; prefix: string }; apiKey?: ApiKeyRow }>('/api/api-keys', { name: keyName.trim() });
      const raw = data.key?.raw || (data.apiKey as { raw?: string } | undefined)?.raw || '';
      const row = data.key || data.apiKey;
      if (!raw) {
        throw new ApiError('Server did not return a raw key. Please contact support.', 500);
      }
      const newEntry: ApiKey = {
        id: row?.id || `k${Date.now()}`,
        name: row?.name || keyName.trim(),
        prefix: row?.prefix || raw.slice(0, 12),
        created: 'Just now',
        lastUsed: 'Never',
      };
      setKeys((prev) => [newEntry, ...(prev || [])]);
      setNewKey(raw);
      setKeyName('');
      setShowCreate(false);
      toast({ title: 'API key created', tone: 'success' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not create key.';
      toast({ title: 'Failed to create key', description: msg, tone: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    setRevokingId(id);
    try {
      await apiDelete(`/api/api-keys/${id}`);
      setKeys((prev) => (prev || []).filter((k) => k.id !== id));
      toast({ title: 'Key revoked', tone: 'info' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not revoke key.';
      toast({ title: 'Revoke failed', description: msg, tone: 'error' });
    } finally {
      setRevokingId(null);
    }
  };

  const copyKey = async () => {
    if (!newKey) return;
    try { await navigator.clipboard.writeText(newKey); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader badge="Chrome Extension · API Keys" title="API keys" subtitle="Generate keys to connect the Chrome extension and other integrations.">
        <button onClick={() => setShowCreate(true)} className="btn-brand inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
          <Plus className="h-4 w-4" />
          New key
        </button>
      </PageHeader>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-info/30 bg-info/5 p-4">
        <Chrome className="mt-0.5 h-5 w-5 shrink-0 text-info" />
        <div>
          <p className="text-sm font-semibold text-text-primary">How to use API keys</p>
          <ol className="mt-2 space-y-1 text-xs text-text-secondary">
            <li>1. Generate a new key below</li>
            <li>2. Copy the key to your clipboard</li>
            <li>3. Paste it in the Chrome extension settings</li>
            <li>4. Done — start generating from any page</li>
          </ol>
        </div>
      </div>

      {/* Newly created key */}
      {newKey && (
        <Card className="border-success/40 bg-success/5 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h3 className="text-sm font-semibold text-text-primary">Key created — copy it now</h3>
          </div>
          <p className="mt-2 text-xs text-warning">⚠️ This is the only time you&apos;ll see the raw key.</p>
          <div className="mt-3 flex gap-2">
            <input readOnly value={newKey} className="input-field flex-1 px-3 py-2.5 font-mono text-xs" />
            <button onClick={copyKey} className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="btn-ghost mt-3 rounded-lg px-3 py-1.5 text-xs font-medium">
            I&apos;ve copied it — dismiss
          </button>
        </Card>
      )}

      {/* Keys list */}
      {keys === null ? (
        <Card className="p-5">
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : keys.length === 0 ? (
        <Card className="flex min-h-[200px] items-center justify-center">
          <EmptyState
            icon={KeyRound}
            title="No API keys yet"
            description="Create your first key to start using the Chrome extension."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="btn-brand inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> New key
              </button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10">
                  <KeyRound className="h-5 w-5 text-brand" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">{k.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-surface-hover px-2 py-0.5 font-mono text-xs text-text-tertiary">{k.prefix}...</span>
                    <span className="text-xs text-text-tertiary">Created {k.created} · Last used {k.lastUsed}</span>
                  </div>
                </div>
                <button
                  onClick={() => revoke(k.id)}
                  disabled={revokingId === k.id}
                  className="btn-ghost rounded-lg p-2 text-text-tertiary hover:text-error disabled:opacity-50"
                  aria-label="Revoke key"
                >
                  {revokingId === k.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Security warning */}
      <Card className="border-warning/30 bg-warning/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Security notes</p>
            <ul className="mt-2 space-y-1 text-xs text-text-secondary">
              <li>• Keys are stored hashed — we cannot recover lost keys</li>
              <li>• Maximum 5 active keys per account</li>
              <li>• Revocation is instant and irreversible</li>
              <li>• Never share your API key publicly or commit it to git</li>
            </ul>
          </div>
        </div>
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New API key">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Key name</label>
            <input
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !creating) createKey();
              }}
              className="input-field w-full px-3 py-2.5 text-sm"
              placeholder="e.g. Chrome Extension"
              autoFocus
            />
          </div>
          <button
            onClick={createKey}
            disabled={creating || !keyName.trim()}
            className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              'Create key'
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
