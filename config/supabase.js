/**
 * config/supabase.js
 * Lazy Supabase client factory. Returns enabled:false when keys are missing
 * so callers can fall back to local JSON storage.
 *
 * NOTE: Service-role key is server-side ONLY. Never expose it to the frontend.
 */

let cached = null;

function buildClients() {
  const { env } = require('./env');
  if (!env.hasSupabase) {
    return { enabled: false, supabaseAnon: null, supabaseService: null };
  }

  let createClient;
  try {
    ({ createClient } = require('@supabase/supabase-js'));
  } catch (err) {
    console.warn('[supabase] @supabase/supabase-js not installed. Run: npm install @supabase/supabase-js');
    return { enabled: false, supabaseAnon: null, supabaseService: null };
  }

  const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'postready-v10' } },
  });

  const supabaseService = env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
        global: { headers: { 'X-Client-Info': 'postready-v10' } },
      })
    : null;

  return { enabled: true, supabaseAnon, supabaseService };
}

function getClients() {
  if (!cached) cached = buildClients();
  return cached;
}

function hasSupabaseKeys() {
  return getClients().enabled;
}

module.exports = { getClients, hasSupabaseKeys };
