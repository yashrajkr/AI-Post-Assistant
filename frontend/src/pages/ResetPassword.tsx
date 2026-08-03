import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { AuthFrame } from './Login';

/**
 * Reached via the "reset password" email link. Supabase appends recovery
 * tokens to the URL; supabase-js (detectSessionInUrl) turns those into a
 * real (short-lived) session automatically before this component mounts,
 * which is what lets `resetPassword` (supabase.auth.updateUser) succeed.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        setInvalid(true);
      }
    });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return;
    setSubmitting(true);
    try {
      await resetPassword(password);
      toast({ title: 'Password updated', description: 'You can now log in with your new password.', tone: 'success' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast({
        title: 'Could not reset password',
        description: err instanceof Error ? err.message : 'Please try again.',
        tone: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFrame>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card p-8"
      >
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-text-primary">Choose a new password</h1>
        </div>

        {invalid ? (
          <p className="text-center text-sm text-text-secondary">
            This reset link is invalid or has expired. Request a new one from the login page.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-medium text-text-secondary">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={128}
                  className="input-field w-full py-2.5 pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !ready}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save new password'}
            </button>
          </form>
        )}
      </motion.div>
    </AuthFrame>
  );
}
