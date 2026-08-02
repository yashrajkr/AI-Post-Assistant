import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Minimal toast system. Use `useToast().toast(...)` from anywhere inside
 * the ToastProvider tree.
 *
 * Why not a library? The original v16 frontend used shadcn/ui's toaster
 * (built on Radix). The new Vite UI keeps things light, so we ship a tiny
 * implementation that reuses the existing CSS variable system.
 */

type Tone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: Tone;
}

interface ToastContextValue {
  toast: (t: { title: string; description?: string; tone?: Tone }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let _id = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    ({ title, description, tone = 'info' }) => {
      const id = ++_id;
      setToasts((prev) => [...prev, { id, title, description, tone }]);
      // Auto-dismiss after 4s
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? AlertCircle : Info;
            const accent =
              t.tone === 'success'
                ? 'text-success'
                : t.tone === 'error'
                  ? 'text-error'
                  : 'text-info';
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="card pointer-events-auto flex items-start gap-3 p-4 shadow-card-hover"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${accent}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-text-secondary">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="btn-ghost rounded-md p-0.5"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}
