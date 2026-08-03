import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { apiGet, type User } from '@/lib/api';

/**
 * Auth context — backed entirely by Supabase Auth.
 *
 * - `supabase.auth.getSession()` restores any persisted session on load
 *   (refresh, new tab, browser restart all just work — supabase-js persists
 *   to localStorage and auto-refreshes the access token).
 * - `onAuthStateChange` keeps us in sync with login/logout/token refresh/
 *   the OAuth and password-recovery callback pages.
 * - Once we have a Supabase session, we call our own `GET /api/me` (which
 *   auto-creates the app-level profile row on first sight) to get
 *   plan/credits/brandVoice — Supabase Auth only knows identity, not that.
 */

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Invalid email or password.';
  if (m.includes('email not confirmed')) return 'Please verify your email before logging in.';
  if (m.includes('user already registered')) return 'An account with this email already exists.';
  if (m.includes('password should be at least')) return 'Password is too short.';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';
  if (m.includes('network') || m.includes('fetch')) return 'Network error. Check your connection and try again.';
  return message || 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  // Avoids a duplicate /api/me call when getSession() and the initial
  // onAuthStateChange event both fire for the same session on mount.
  const lastSyncedUserId = useRef<string | null>(null);

  const syncProfile = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      lastSyncedUserId.current = null;
      setState({ user: null, loading: false, error: null });
      return;
    }
    if (lastSyncedUserId.current === session.user.id) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    try {
      const data = await apiGet<{ success: boolean; user: User }>('/api/me');
      lastSyncedUserId.current = session.user.id;
      setState({ user: data.user, loading: false, error: null });
    } catch {
      // Supabase session is valid but our backend profile fetch failed
      // (network blip, backend down). Fall back to Supabase identity so
      // the user isn't bounced to /login unnecessarily.
      setState({
        user: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          plan: 'free',
          credits: 0,
        },
        loading: false,
        error: null,
      });
    }
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await syncProfile(data.session);
  }, [syncProfile]);

  useEffect(() => {
    refresh();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      syncProfile(session);
    });

    return () => subscription.subscription.unsubscribe();
  }, [refresh, syncProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendlyAuthError(error.message));
    await syncProfile(data.session);
    const me = await apiGet<{ success: boolean; user: User }>('/api/me');
    lastSyncedUserId.current = data.user?.id || null;
    setState({ user: me.user, loading: false, error: null });
    return me.user;
  }, [syncProfile]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw new Error(friendlyAuthError(error.message));

    // If email confirmations are enabled in Supabase, `session` is null
    // here — the user must click the verification link before they have
    // an authenticated session.
    if (!data.session) {
      setState({ user: null, loading: false, error: null });
      return null;
    }

    await syncProfile(data.session);
    const me = await apiGet<{ success: boolean; user: User }>('/api/me');
    lastSyncedUserId.current = data.user?.id || null;
    setState({ user: me.user, loading: false, error: null });
    return me.user;
  }, [syncProfile]);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'online', prompt: 'select_account' },
      },
    });
    if (error) throw new Error(friendlyAuthError(error.message));
    // Browser is redirected to Google by supabase-js; nothing else to do here.
  }, []);

  const logout = useCallback(async () => {
    try {
      // Signs out on this device and revokes the refresh token server-side
      // (Supabase), so a stolen access token can't be refreshed after logout.
      await supabase.auth.signOut();
    } finally {
      lastSyncedUserId.current = null;
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(friendlyAuthError(error.message));
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(friendlyAuthError(error.message));
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw new Error(friendlyAuthError(error.message));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      signup,
      loginWithGoogle,
      logout,
      forgotPassword,
      resetPassword,
      resendVerification,
      refresh,
    }),
    [state, login, signup, loginWithGoogle, logout, forgotPassword, resetPassword, resendVerification, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
