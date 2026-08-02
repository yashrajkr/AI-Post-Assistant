import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X } from 'lucide-react';

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      {label && <label className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input-field flex w-full items-center justify-between px-3 py-2.5 text-sm"
      >
        <span className={value ? 'text-text-primary' : 'text-text-tertiary'}>{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface-2 shadow-card"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  {opt}
                  {value === opt && <Check className="h-4 w-4 text-brand" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="card relative z-10 w-full max-w-md p-6 shadow-card-hover"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-text-primary">{title}</h3>
              <button onClick={onClose} className="btn-ghost rounded-lg p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-brand-gradient' : 'bg-surface-hover'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md ${checked ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}
