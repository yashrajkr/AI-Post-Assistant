import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, setSessionToken, type User } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import PublicHeader from '@/components/PublicHeader';

/**
 * Lands here after Supabase finishes the Google OAuth dance
 * (`supabase.auth.signInWithOAuth` in lib/supabaseClient.ts) and redirects
 * back with the session encoded in the URL. Supabase's client picks that up
 * automatically (`detectSessionInUrl: true`), so we just read the resulting
 * session, hand its access_token to our backend to mint an app session, and
 * store that app token for cross-domain requests (Vercel frontend -> Render
 * backend can't share an HttpOnly cookie).
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function run() {
      if (!supabase) {
        setError('Google sign-in is not configured.');
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (sessionError || !accessToken) {
        setError('Missing or expired Google session. Please try signing in again.');
        return;
      }

      try {
        const result = await apiPost<{ success: boolean; token: string; user: User }>(
          '/api/auth/supabase',
          { access_token: accessToken }
        );
        setSessionToken(result.token);
        await refresh();
        navigate('/dashboard', { replace: true });
      } catch {
        setError('Could not complete sign-in. Please try again.');
        toast({ title: 'Login failed', description: 'Please try again.', tone: 'error' });
      } finally {
        // We only needed the token, not a lingering Supabase session.
        await supabase.auth.signOut().catch(() => {});
      }
    }

    run().catch(() => {
      setError('Could not complete sign-in. Please try again.');
    });
  }, [navigate, refresh, toast]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <PublicHeader />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {error ? (
          <>
            <h1 className="font-display text-2xl font-bold text-text-primary">Sign-in failed</h1>
            <p className="mt-2 max-w-md text-text-secondary">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="btn-brand mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
            >
              Back to login
            </button>
          </>
        ) : (
          <>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
            <p className="mt-4 text-text-secondary">Finishing sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
}
