import { useState, useEffect } from 'react';
import { Key, Save, Check, ExternalLink, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { getApiKey, setApiKey, getBackendUrl, setBackendUrl, clearAll } from '../lib/storage';
import { getMe, ApiError, type User } from '../lib/api';

export default function Options() {
  const [apiKey, setApiKeyState] = useState('');
  const [backendUrl, setBackendUrlState] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const key = await getApiKey();
    const url = await getBackendUrl();
    setApiKeyState(key || '');
    setBackendUrlState(url);
    if (key) {
      // Auto-test on load
      testKey(key, url);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setApiKey(apiKey.trim());
      await setBackendUrl(backendUrl.trim().replace(/\/$/, '')); // remove trailing slash
      setTestResult('success');
      setTestMessage('Settings saved.');
      setTimeout(() => setTestResult(null), 2000);
      // Re-test
      testKey(apiKey.trim(), backendUrl.trim());
    } finally {
      setSaving(false);
    }
  }

  async function testKey(key: string, url: string) {
    if (!key) return;
    setTesting(true);
    setTestResult(null);
    try {
      // Temporarily set the key for testing
      await setApiKey(key);
      await setBackendUrl(url.replace(/\/$/, ''));
      const u = await getMe();
      if (u) {
        setUser(u);
        setTestResult('success');
        setTestMessage(`Connected as ${u.name} (${u.plan} plan, ${u.credits} credits)`);
      } else {
        setTestResult('error');
        setTestMessage('Could not fetch user. Check your API key.');
      }
    } catch (err) {
      setTestResult('error');
      if (err instanceof ApiError) {
        setTestMessage(err.message);
      } else {
        setTestMessage('Connection failed. Check backend URL.');
      }
    } finally {
      setTesting(false);
    }
  }

  async function handleClear() {
    if (!confirm('Clear all settings? You will need to re-enter your API key.')) return;
    await clearAll();
    setApiKeyState('');
    setUser(null);
    setTestResult(null);
    setTestMessage('');
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      {/* Header */}
      <header className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
          <Key className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">AI Post Assistant</h1>
          <p className="text-xs text-text-muted">Chrome Extension Settings</p>
        </div>
      </header>

      {/* How to get API key */}
      <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className="h-4 w-4 text-accent" />
          How to get your API key
        </h2>
        <ol className="list-decimal space-y-1 pl-4 text-xs text-text-muted">
          <li>
            Open the AI Post Assistant web app:{' '}
            <a
              href="https://ai-post-assistant.vercel.app/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:underline"
            >
              ai-post-assistant.vercel.app/api-keys
              <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>Login with your account</li>
          <li>Click "New key" → copy the <code className="rounded bg-surface-2 px-1">apa_...</code> key</li>
          <li>Paste it below</li>
        </ol>
      </div>

      {/* Form */}
      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            placeholder="apa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-xs text-text-muted">Starts with <code>apa_</code>. 36 characters total.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Backend URL</label>
          <input
            type="url"
            value={backendUrl}
            onChange={(e) => setBackendUrlState(e.target.value)}
            placeholder="https://ai-post-assistant-backend.onrender.com"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-xs text-text-muted">
            Default: Render backend URL. Change only if self-hosting.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !apiKey.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save & Test
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-error"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>

        {/* Test result */}
        {testing ? (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Testing connection...
          </div>
        ) : testResult === 'success' ? (
          <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">Connected successfully!</p>
              {testMessage ? <p className="mt-0.5 text-xs">{testMessage}</p> : null}
            </div>
          </div>
        ) : testResult === 'error' ? (
          <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 p-3 text-sm text-error">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">Connection failed</p>
              {testMessage ? <p className="mt-0.5 text-xs">{testMessage}</p> : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* User info */}
      {user ? (
        <div className="mt-6 rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold">Account</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-text-muted">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="font-medium truncate">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Plan</p>
              <p className="font-medium capitalize">{user.plan}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Credits</p>
              <p className="font-medium">{user.credits}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-text-muted">
        Need help? Visit{' '}
        <a
          href="https://ai-post-assistant.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          ai-post-assistant.vercel.app
        </a>
      </p>
    </div>
  );
}
