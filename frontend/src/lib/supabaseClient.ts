import { createClient } from '@supabase/supabase-js';

/**
 * Frontend Supabase client — uses the PUBLIC anon key only.
 * NEVER import the service-role key here; it must stay server-side.
 *
 * `persistSession`/`autoRefreshToken` give us session persistence across
 * refresh, new tabs, and browser restarts for free. `detectSessionInUrl`
 * lets the OAuth/password-recovery callback pages hand off the tokens
 * Supabase appends to the URL into a real session automatically.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  console.error(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. ' +
      'Auth will not work until they are set (see frontend/.env.example).'
  );
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
