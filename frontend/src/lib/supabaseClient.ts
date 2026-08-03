import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client used ONLY for "Continue with Google" — it drives the
 * OAuth redirect and hands us back a Supabase session, which we then
 * exchange for our own app session via POST /api/auth/supabase (see
 * lib/auth.tsx). We never talk to Postgres from the browser with this.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: false,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error('Google sign-in is not configured.');
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
}
