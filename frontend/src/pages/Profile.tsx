import { useState } from 'react';
import { Mail, Save, Loader2 } from 'lucide-react';
import { PageHeader, Card, Badge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { apiPost, ApiError } from '@/lib/api';

function initialsOf(name?: string, email?: string): string {
  const source = (name || email || '?').trim();
  if (!source) return '?';
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Profile() {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [brandName, setBrandName] = useState(user?.brandName || '');
  const [tagline, setTagline] = useState(user?.tagline || '');
  const [tone, setTone] = useState(user?.tone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPost('/api/profile', { name, brandName, tagline, tone });
      await refresh();
      toast({ title: 'Profile updated', tone: 'success' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not save changes.';
      toast({ title: 'Update failed', description: msg, tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const planLabel = user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free';
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader badge="Personalization" title="Brand voice" subtitle="Manage your profile and brand voice settings." />

      {/* Profile summary */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-gradient text-xl font-bold text-white">
            {initialsOf(user?.name, user?.email)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl font-bold text-text-primary">{displayName}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
              <Mail className="h-3.5 w-3.5" />
              {user?.email || '—'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge tone="brand">{planLabel}</Badge>
            <span className="text-xs text-text-tertiary">{user?.credits ?? 0} credits</span>
          </div>
        </div>
      </Card>

      {/* Brand voice form */}
      <Card className="p-6">
        <h3 className="mb-4 font-display text-sm font-semibold text-text-primary">Brand voice</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Brand name</label>
            <input value={brandName} onChange={(e) => setBrandName(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Tagline</label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Tone <span className="text-text-tertiary">(e.g. Educational, Friendly, Bold)</span>
            </label>
            <input value={tone} onChange={(e) => setTone(e.target.value)} className="input-field w-full px-3 py-2.5 text-sm" />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-brand inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save changes
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Subscription */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-text-primary">{planLabel}</h3>
            <p className="mt-1 text-sm text-text-secondary">{user?.credits ?? 0} credits remaining this month</p>
          </div>
          <a href="/pricing" className="btn-secondary rounded-xl px-5 py-2.5 text-sm font-semibold">
            Manage
          </a>
        </div>
      </Card>
    </div>
  );
}
