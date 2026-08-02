/**
 * scripts/migrate-json-to-supabase.js
 * One-time migration: reads existing /data/*.json files and inserts them
 * into the Supabase tables defined in docs/SUPABASE_SCHEMA.sql.
 *
 * Run with:  npm run migrate
 *
 * Prerequisites:
 *   1. Supabase project created.
 *   2. docs/SUPABASE_SCHEMA.sql executed in Supabase SQL editor.
 *   3. SUPABASE_URL + SUPABASE_ANON_KEY + SUPABASE_SERVICE_ROLE_KEY set in .env.
 *
 * The script is IDEMPOTENT: it skips rows whose IDs already exist in Supabase.
 */

const fs = require('fs');
const path = require('path');
const { env } = require('../config/env');
const { getClients } = require('../config/supabase');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8') || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

async function migrateUsers(supabase) {
  const users = readJson(path.join(DATA_DIR, 'users.json'), []);
  logger.info(`[migrate] users: ${users.length} rows in JSON`);

  let inserted = 0;
  let skipped = 0;
  for (const u of users) {
    // Skip if already exists.
    const { data: existing } = await supabase.from('users').select('id').eq('id', u.id).maybeSingle();
    if (existing) {
      skipped++;
      continue;
    }
    const { error } = await supabase.from('users').insert({
      id: u.id,
      name: u.name,
      email: u.email,
      password_hash: u.passwordHash,
      plan: u.plan || 'free',
      credits: u.credits || 0,
      brand_voice: u.brandVoice || {},
      generations: [], // generations get their own table — see below.
      created_at: u.createdAt || new Date().toISOString(),
    });
    if (error) {
      logger.error(`  ✗ user ${u.email}: ${error.message}`);
      continue;
    }
    inserted++;

    // Migrate that user's generations.
    for (const g of u.generations || []) {
      const { error: ge } = await supabase.from('generations').insert({
        id: g.id,
        user_id: u.id,
        created_at: g.createdAt,
        input: g.input,
        result: g.result,
      });
      if (ge) logger.warn(`    ✗ generation ${g.id}: ${ge.message}`);
    }
  }
  logger.info(`[migrate] users: ${inserted} inserted, ${skipped} already present`);
}

async function migrateSchedules(supabase) {
  const schedules = readJson(path.join(DATA_DIR, 'schedules.json'), []);
  logger.info(`[migrate] schedules: ${schedules.length} rows in JSON`);
  let inserted = 0;
  for (const s of schedules) {
    const { data: existing } = await supabase.from('schedules').select('id').eq('id', s.id).maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from('schedules').insert({
      id: s.id,
      user_id: s.userId,
      platform: s.platform,
      content: s.content,
      date_time: s.dateTime,
      status: s.status || 'planned',
      created_at: s.createdAt,
    });
    if (error) logger.error(`  ✗ schedule ${s.id}: ${error.message}`);
    else inserted++;
  }
  logger.info(`[migrate] schedules: ${inserted} inserted`);
}

async function migrateFeedback(supabase) {
  const feedback = readJson(path.join(DATA_DIR, 'feedback.json'), []);
  logger.info(`[migrate] feedback: ${feedback.length} rows in JSON`);
  let inserted = 0;
  for (const f of feedback) {
    const { data: existing } = await supabase.from('feedback').select('id').eq('id', f.id).maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from('feedback').insert({
      id: f.id,
      user_id: f.userId,
      rating: f.rating,
      comment: f.comment,
      generation_id: f.generationId,
      created_at: f.createdAt,
    });
    if (error) logger.error(`  ✗ feedback ${f.id}: ${error.message}`);
    else inserted++;
  }
  logger.info(`[migrate] feedback: ${inserted} inserted`);
}

async function migratePayments(supabase) {
  const payments = readJson(path.join(DATA_DIR, 'payments.json'), []);
  logger.info(`[migrate] payments: ${payments.length} rows in JSON`);
  let inserted = 0;
  for (const p of payments) {
    const { data: existing } = await supabase.from('payments').select('id').eq('id', p.id).maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from('payments').insert({
      id: p.id,
      user_id: p.userId,
      provider: 'razorpay',
      provider_order_id: p.razorpay?.orderId || null,
      provider_payment_id: p.gateway?.paymentId || null,
      plan: p.plan,
      amount: p.amount || 0,
      status: p.status,
      created_at: p.createdAt,
      verified_at: p.verifiedAt || null,
    });
    if (error) logger.error(`  ✗ payment ${p.id}: ${error.message}`);
    else inserted++;
  }
  logger.info(`[migrate] payments: ${inserted} inserted`);
}

async function main() {
  logger.info('=== PostReady AI v10 — JSON → Supabase migration ===');
  if (!env.hasSupabase) {
    logger.error('Supabase keys not set. Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY in .env first.');
    process.exit(1);
  }
  const { supabaseService } = getClients();
  if (!supabaseService) {
    logger.error('Could not create Supabase service client.');
    process.exit(1);
  }

  await migrateUsers(supabaseService);
  await migrateSchedules(supabaseService);
  await migrateFeedback(supabaseService);
  await migratePayments(supabaseService);

  logger.info('=== Migration complete ===');
  logger.info('Verify row counts in Supabase dashboard, then keep /data/*.json as backup.');
}

main().catch((err) => {
  logger.error('Migration failed', { message: err.message, stack: err.stack });
  process.exit(1);
});
