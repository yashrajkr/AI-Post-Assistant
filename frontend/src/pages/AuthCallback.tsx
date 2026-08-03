import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { AuthFrame } from './Login';
import { Skeleton } from '@/components/ui';

/**
 * Lands here after:
 *   - Google OAuth  (supabase.auth.signInWithOAuth -> Google -> Supabase -> here)
 *   - Email verification link (signup confirmation)
 *
 * IMPORTANT: don't call `exchangeCodeForSession` here. supabase-js (with
 * `flowType: 'pkce'`, `detectSessionInUrl: true`) already auto-exchanges the
 * `?code=...` in the URL for a session as part of its own lazy
 * initialization — which every page triggers on mount via `AuthProvider`'s
 * `getSession()` call, since it wraps the whole app including this page.
 * Calling `exchangeCodeForSession` again here races that automatic exchange
 * for the same single-use PKCE code: whichever call loses arrives second,
 * finds the code already consumed, and errors out — even though the other
 * call already succeeded. So we just wait for a session to appear instead
 * of consuming the code ourselves.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function complete() {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get('error_description') || params.get('error');

      if (oauthError) {
        setError(oauthError);
        setTimeout(() => navigate('/login?error=oauth_denied', { replace: true }), 1500);
        return;
      }

      // Poll briefly for the session supabase-js's own auto-detection is
      // establishing in the background — avoids a fixed sleep while still
      // not hanging forever if something upstream (Google/Supabase) failed.
      for (let attempt = 0; attempt < 20; attempt++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate('/dashboard', { replace: true });
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }

      setError('Could not complete sign-in.');
      setTimeout(() => navigate('/login?error=no_session', { replace: true }), 1500);
    }

    complete();
  }, [navigate]);

  return (
    <AuthFrame>
      <div className="card flex flex-col items-center gap-4 p-8 text-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <p className="text-sm text-text-secondary">
          {error ? `${error} — redirecting to login…` : 'Finishing sign-in…'}
        </p>
      </div>
    </AuthFrame>
  );
}
