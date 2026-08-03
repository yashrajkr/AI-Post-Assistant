import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Gift } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { ApiError } from '@/lib/api';
import { isSupabaseConfigured, signInWithGoogle } from '@/lib/supabaseClient';
import { AuthFrame } from './Login';
import { Badge } from '@/components/ui';

function passwordStrength(pwd: string): { score: 0 | 1 | 2 | 3; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['Too short', 'Weak', 'Medium', 'Strong'];
  const colors = ['bg-error', 'bg-warning', 'bg-warning', 'bg-success'];
  return { score: score as 0 | 1 | 2 | 3, label: labels[score], color: colors[score] };
}

export default function Signup() {
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const onGoogleClick = async () => {
    try {
      await signInWithGoogle();
    } catch {
      toast({ title: 'Google sign-in failed', description: 'Please try again.', tone: 'error' });
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) return;
    setSubmitting(true);
    try {
      const user = await signup(name.trim(), email.trim(), password);
      toast({
        title: 'Account created!',
        description: user.credits ? `${user.credits} free credits added.` : 'Welcome aboard.',
        tone: 'success',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Please try again.';
      toast({ title: 'Signup failed', description: msg, tone: 'error' });
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
          <Badge tone="success" >
            <Gift className="mr-1 h-3 w-3" /> 10 free credits
          </Badge>
          <h1 className="mt-3 font-display text-2xl font-bold text-text-primary">Create your account</h1>
          <p className="mt-1 text-sm text-text-secondary">Start generating in 30 seconds</p>
        </div>

        {isSupabaseConfigured && (
          <button
            type="button"
            onClick={onGoogleClick}
            className="btn-secondary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
          >
            <GoogleIcon />
            Sign up with Google
          </button>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-text-tertiary">
          <span className="h-px flex-1 bg-border" />
          or use your email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs font-medium text-text-secondary">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
              <input
                id="name"
                placeholder="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                className="input-field w-full py-2.5 pl-10 pr-3 text-sm"
              />
            </div>
          </div>

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
            {password && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className={`h-full transition-all ${strength.color}`}
                    style={{ width: `${(strength.score / 3) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-text-tertiary">{strength.label}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-brand flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </AuthFrame>
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
