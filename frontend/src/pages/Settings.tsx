import { useState } from 'react';
import { Bell, Globe, Shield, Palette, KeyRound, Mail, Loader2, Check } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';
import { Toggle } from '@/components/controls';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

const emailPrefs = [
  { id: 'product', label: 'Product updates', desc: 'New features, tips, and improvements.' },
  { id: 'digest', label: 'Weekly digest', desc: 'A summary of your content performance each week.' },
  { id: 'promo', label: 'Promotional emails', desc: 'Occasional offers and plan upgrades.' },
];

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({ push: true, email: true });
  const [emailPrefsState, setEmailPrefsState] = useState<Record<string, boolean>>({
    product: true,
    digest: true,
    promo: false,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast({ title: 'Settings saved', tone: 'success' });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        badge="Settings"
        title="Account settings"
        subtitle="Manage notifications, preferences, and security."
      />

      {/* Notifications */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand" />
          <h3 className="font-display text-base font-semibold text-text-primary">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-hover/50 p-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Push notifications</p>
              <p className="text-xs text-text-tertiary">Get notified when generations are ready.</p>
            </div>
            <Toggle checked={notifications.push} onChange={(v) => setNotifications({ ...notifications, push: v })} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-hover/50 p-4">
            <div>
              <p className="text-sm font-medium text-text-primary">Email notifications</p>
              <p className="text-xs text-text-tertiary">Receive account and security emails.</p>
            </div>
            <Toggle checked={notifications.email} onChange={(v) => setNotifications({ ...notifications, email: v })} />
          </div>
        </div>
      </Card>

      {/* Email preferences */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-brand" />
          <h3 className="font-display text-base font-semibold text-text-primary">Email preferences</h3>
        </div>
        <div className="space-y-3">
          {emailPrefs.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-text-primary">{p.label}</p>
                <p className="text-xs text-text-tertiary">{p.desc}</p>
              </div>
              <Toggle
                checked={emailPrefsState[p.id]}
                onChange={(v) => setEmailPrefsState({ ...emailPrefsState, [p.id]: v })}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-brand" />
          <h3 className="font-display text-base font-semibold text-text-primary">Preferences</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Globe className="h-3.5 w-3.5" /> Language
            </label>
            <select className="input-field w-full px-3 py-2.5 text-sm">
              {['English', 'Hindi', 'Hinglish', 'Spanish'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <KeyRound className="h-3.5 w-3.5" /> Default AI mode
            </label>
            <select className="input-field w-full px-3 py-2.5 text-sm">
              {['GPT-4o (fast)', 'GPT-4o-mini (balanced)', 'Gemini 1.5 Flash (fallback)'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand" />
          <h3 className="font-display text-base font-semibold text-text-primary">Security</h3>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg bg-success/5 p-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Session security</p>
            <p className="text-xs text-text-tertiary">
              Signed in as {user?.email || 'you'} · HttpOnly secure cookie sessions
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <Check className="h-3 w-3" /> Secure
          </span>
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="btn-brand inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            'Save settings'
          )}
        </button>
      </div>
    </div>
  );
}

