/**
 * services/user-normalizer.js
 * Converts a Supabase row (snake_case) into the local user object shape
 * (camelCase) that the rest of the app expects. Keeps controllers clean.
 */

function normalizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash ?? row.passwordHash,
    plan: row.plan,
    credits: Number(row.credits ?? 0),
    brandVoice: row.brand_voice ?? row.brandVoice ?? {},
    generations: row.generations ?? [],
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

module.exports = { normalizeUser };
