import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiGet, apiPost, type User } from '@/lib/api';

/**
 * Auth context.
 *
 * - On mount, calls GET /api/me to see if the user has a valid session.
 * - Exposes login / signup / logout mutations that hit the Express backend.
 * - The `loading` flag lets AuthGate show a spinner before the first /me
 *   resolves (otherwise protected pages would briefly redirect to /login
 *   on every hard refresh).
 */

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      const data = await apiGet<{ success: boolean; user: User | null }>('/api/me');
      setState({ user: data.user ?? null, loading: false, error: null });
    } catch {
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiPost<{ success: boolean; user: User }>('/api/login', {
        email,
        password,
      });
      setState({ user: data.user, loading: false, error: null });
      return data.user;
    },
    []
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await apiPost<{ success: boolean; user: User }>('/api/signup', {
        name,
        email,
        password,
      });
      setState({ user: data.user, loading: false, error: null });
      return data.user;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiPost('/api/logout');
    } catch {
      /* ignore — we clear client state regardless */
    }
    setState({ user: null, loading: false, error: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, signup, logout, refresh }),
    [state, login, signup, logout, refresh]
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
