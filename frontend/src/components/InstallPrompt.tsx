import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles } from 'lucide-react';

/**
 * Install-to-home-screen prompt (PWA).
 *
 * Chrome/Edge/Android fire `beforeinstallprompt` when the manifest + service
 * worker installability criteria are met. We stash that event and show our
 * own card instead of the native mini-infobar, so it matches the app's UI.
 *
 * iOS Safari never fires `beforeinstallprompt` — there's no programmatic
 * install API there, so we show a short "Add to Home Screen" hint instead.
 */

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function recentlyDismissed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  return Date.now() - Number(raw) < DISMISS_COOLDOWN_MS;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS has no beforeinstallprompt — show a manual hint after a short delay
    // instead of interrupting the first paint.
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIos()) {
      iosTimer = setTimeout(() => {
        setShowIosHint(true);
        setVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setVisible(false);
    } else {
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="card fixed bottom-20 left-4 right-4 z-[90] flex items-start gap-3 p-4 shadow-card-hover sm:bottom-4 sm:left-auto sm:right-4 sm:w-96"
          role="dialog"
          aria-label="Install app"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary">Install PostReady AI</p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {showIosHint
                ? 'Tap the Share icon, then "Add to Home Screen" for quick, full-screen access.'
                : 'Add it to your home screen for a faster, app-like experience — no browser tabs needed.'}
            </p>
            {!showIosHint && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={install}
                  className="btn-brand inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
                >
                  <Download className="h-3.5 w-3.5" /> Install
                </button>
                <button
                  onClick={dismiss}
                  className="btn-ghost rounded-lg px-3 py-1.5 text-xs font-medium"
                >
                  Not now
                </button>
              </div>
            )}
          </div>
          <button
            onClick={dismiss}
            className="btn-ghost shrink-0 rounded-md p-0.5"
            aria-label="Dismiss install prompt"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
