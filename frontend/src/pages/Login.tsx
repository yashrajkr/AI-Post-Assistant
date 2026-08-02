import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { ApiError } from '@/lib/api';
import PublicHeader from '@/components/PublicHeader';

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast({ title: 'Welcome back!', description: user.email, tone: 'success' });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Please try again.';
      toast({ title: 'Login failed', description: msg, tone: 'error' });
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
          <h1 className="font-display text-2xl font-bold text-text-primary">Welcome back</h1>
          <p className="mt-1 text-sm text-text-secondary">Login to continue creating</p>
        </div>

        <a
          href={`${import.meta.env.VITE_API_URL || ''}/api/auth/google`}
          className="btn-secondary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
        >
          <GoogleIcon />
          Continue with Google
        </a>

        <div className="my-5 flex items-center gap-3 text-xs text-text-tertiary">
          <span className="h-px flex-1 bg-border" />
          or continue with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-medium text-text-secondary">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field w-full py-2.5 pl-10 pr-3 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-medium text-text-secondary">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={1}
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
            disabled={submitting}
            className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          No account?{' '}
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
        10 free credits on signup · No credit card required
      </p>
    </AuthFrame>
  );
}

/** Shared two-column auth frame (gradient panel + form). */
export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <PublicHeader />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
