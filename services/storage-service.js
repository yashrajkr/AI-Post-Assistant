/**
 * services/storage-service.js
 * Unified storage abstraction.
 * - If Supabase is configured → uses Supabase (production).
 * - Otherwise → falls back to local JSON files (development only).
 *
 * Every method returns the same shape regardless of backend, so controllers
 * don't need to care which storage is active.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getClients } = require('../config/supabase');
const { normalizeUser } = require('./user-normalizer');
const logger = require('../utils/logger');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SCHEDULES_FILE = path.join(DATA_DIR, 'schedules.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

const DEFAULT_TEMPLATES = [
  { value: 'general', label: 'General Post' },
  { value: 'admission', label: 'Coaching Admission Post' },
  { value: 'result', label: 'Student Result Announcement' },
  { value: 'sale', label: 'Local Business Sale Offer' },
  { value: 'project', label: 'Student Project Showcase' },
  { value: 'festival', label: 'Indian Festival Post' },
  { value: 'launch', label: 'Product/Service Launch' },
];

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const defaults = [
    [USERS_FILE, '[]'],
    [SCHEDULES_FILE, '[]'],
    [FEEDBACK_FILE, '[]'],
    [PAYMENTS_FILE, '[]'],
    [TEMPLATES_FILE, JSON.stringify(DEFAULT_TEMPLATES, null, 2)],
  ];
  for (const [file, content] of defaults) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, content);
  }
}

function readJson(file, fallback) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function usingSupabase() {
  return getClients().enabled && getClients().supabaseService;
}

/* ---------------------- USERS ---------------------- */

async function createUser({ id, name, email, passwordHash, plan, credits, brandVoice, createdAt }) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('users')
      .insert({
        id,
        name,
        email,
        password_hash: passwordHash,
        plan,
        credits,
        brand_voice: brandVoice,
        generations: [],
        created_at: createdAt,
      })
      .select('*')
      .single();
    if (error) throw error;
    return normalizeUser(data);
  }

  ensureDataFiles();
  const users = readJson(USERS_FILE, []);
  const user = { id, name, email, passwordHash, plan, credits, brandVoice, generations: [], createdAt };
  users.push(user);
  writeJson(USERS_FILE, users);
  return user;
}

async function getUserByEmail(email) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeUser(data) : null;
  }

  ensureDataFiles();
  const users = readJson(USERS_FILE, []);
  return users.find((u) => u.email === email) || null;
}

async function getUserById(userId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeUser(data) : null;
  }

  ensureDataFiles();
  const users = readJson(USERS_FILE, []);
  return users.find((u) => u.id === userId) || null;
}

async function saveProfile({ userId, name, brandVoice, plan, credits }) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const update = {
      name,
      brand_voice: brandVoice,
    };
    if (plan) update.plan = plan;
    if (typeof credits === 'number') update.credits = credits;
    const { data, error } = await supabaseService
      .from('users')
      .update(update)
      .eq('id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return normalizeUser(data);
  }

  ensureDataFiles();
  const users = readJson(USERS_FILE, []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  if (name) users[idx].name = name;
  if (brandVoice) users[idx].brandVoice = brandVoice;
  if (plan) users[idx].plan = plan;
  if (typeof credits === 'number') users[idx].credits = credits;
  writeJson(USERS_FILE, users);
  return users[idx];
}

async function saveCreditsAndPlan({ userId, plan, credits }) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('users')
      .update({ plan, credits })
      .eq('id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return normalizeUser(data);
  }

  ensureDataFiles();
  const users = readJson(USERS_FILE, []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  users[idx].plan = plan;
  users[idx].credits = credits;
  writeJson(USERS_FILE, users);
  return users[idx];
}

async function decrementCredits(userId) {
  if (usingSupabase()) {
    // Atomic decrement using RPC — requires a `decrement_credits(p_user_id uuid)` function
    // in Supabase. For safety we read-then-write within a transaction-like fetch+update.
    const { supabaseService } = getClients();
    const { data: user, error: e1 } = await supabaseService
      .from('users')
      .select('id, credits')
      .eq('id', userId)
      .single();
    if (e1) throw e1;
    if (!user || user.credits <= 0) throw new Error('No credits left');
    const newCredits = user.credits - 1;
    const { data, error: e2 } = await supabaseService
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)
      .select('*')
      .single();
    if (e2) throw e2;
    return normalizeUser(data);
  }

  ensureDataFiles();
  const users = readJson(USERS_FILE, []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  if (users[idx].credits <= 0) throw new Error('No credits left');
  users[idx].credits -= 1;
  writeJson(USERS_FILE, users);
  return users[idx];
}

/* ---------------------- GENERATIONS ---------------------- */

async function saveGeneration({ userId, generation }) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('generations')
      .insert({
        id: generation.id,
        user_id: userId,
        created_at: generation.createdAt,
        input: generation.input,
        result: generation.result,
      })
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      createdAt: data.created_at,
      input: data.input,
      result: data.result,
    };
  }

  ensureDataFiles();
  const users = readJson(USERS_FILE, []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  users[idx].generations = users[idx].generations || [];
  users[idx].generations.unshift(generation);
  users[idx].generations = users[idx].generations.slice(0, 100);
  writeJson(USERS_FILE, users);
  return generation;
}

async function getGenerations({ userId, limit = 100 }) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      input: r.input,
      result: r.result,
    }));
  }

  ensureDataFiles();
  const users = readJson(USERS_FILE, []);
  const u = users.find((x) => x.id === userId);
  return (u?.generations || []).slice(0, limit);
}

/* ---------------------- SCHEDULES ---------------------- */

async function createSchedule({ userId, item }) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('schedules')
      .insert({
        id: item.id,
        user_id: userId,
        platform: item.platform,
        content: item.content,
        date_time: item.dateTime,
        status: item.status,
        created_at: item.createdAt,
      })
      .select('*')
      .single();
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      platform: data.platform,
      content: data.content,
      dateTime: data.date_time,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  ensureDataFiles();
  const schedules = readJson(SCHEDULES_FILE, []);
  schedules.unshift(item);
  writeJson(SCHEDULES_FILE, schedules);
  return item;
}

async function getSchedules({ userId }) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      platform: r.platform,
      content: r.content,
      dateTime: r.date_time,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  ensureDataFiles();
  return readJson(SCHEDULES_FILE, []).filter((s) => s.userId === userId);
}

/* ---------------------- FEEDBACK ---------------------- */

async function saveFeedback({ userId, feedback }) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService.from('feedback').insert({
      id: feedback.id,
      user_id: userId,
      rating: feedback.rating,
      comment: feedback.comment,
      generation_id: feedback.generationId,
      created_at: feedback.createdAt,
    });
    if (error) throw error;
    return;
  }

  ensureDataFiles();
  const existing = readJson(FEEDBACK_FILE, []);
  existing.unshift({ ...feedback, userId });
  writeJson(FEEDBACK_FILE, existing.slice(0, 500));
}

/* ---------------------- PAYMENTS ---------------------- */

async function savePayment(payment) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const row = {
      id: payment.id,
      user_id: payment.userId,
      provider: 'razorpay',
      provider_order_id: payment.razorpay?.orderId || null,
      provider_payment_id: payment.gateway?.paymentId || null,
      plan: payment.plan,
      amount: payment.amount || 0,
      status: payment.status,
      created_at: payment.createdAt,
      verified_at: payment.verifiedAt || null,
    };
    const { error } = await supabaseService.from('payments').insert(row);
    if (error) {
      logger.error('Supabase payment insert failed', { error: error.message });
      // fall through to JSON backup so we don't lose the record
    }
  }

  ensureDataFiles();
  const payments = readJson(PAYMENTS_FILE, []);
  payments.unshift(payment);
  writeJson(PAYMENTS_FILE, payments.slice(0, 500));
}

async function findPaymentByOrderId(orderId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('payments')
      .select('*')
      .eq('provider_order_id', orderId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      plan: data.plan,
      amount: data.amount,
      status: data.status,
      createdAt: data.created_at,
      verifiedAt: data.verified_at,
      razorpay: { orderId: data.provider_order_id },
    };
  }

  ensureDataFiles();
  const payments = readJson(PAYMENTS_FILE, []);
  return payments.find((p) => p.razorpay && p.razorpay.orderId === orderId) || null;
}

async function updatePaymentStatus(paymentId, patch) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const update = {};
    if (patch.status) update.status = patch.status;
    if (patch.verifiedAt) update.verified_at = patch.verifiedAt;
    if (patch.gateway?.paymentId) update.provider_payment_id = patch.gateway.paymentId;
    const { error } = await supabaseService
      .from('payments')
      .update(update)
      .eq('id', paymentId)
      .maybeSingle();
    if (error) logger.error('Supabase payment update failed', { error: error.message });
  }

  ensureDataFiles();
  const payments = readJson(PAYMENTS_FILE, []);
  const idx = payments.findIndex((p) => p.id === paymentId);
  if (idx !== -1) {
    payments[idx] = { ...payments[idx], ...patch };
    writeJson(PAYMENTS_FILE, payments.slice(0, 500));
  }
}

/* ---------------------- TEMPLATES ---------------------- */

function getTemplates() {
  ensureDataFiles();
  return readJson(TEMPLATES_FILE, DEFAULT_TEMPLATES);
}

/* ---------------------- BRAND_BRAINS (Module 1) ---------------------- */

const BRAND_BRAINS_FILE = path.join(DATA_DIR, 'brand_brains.json');

async function getBrandBrain(userId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('brand_brains')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeBrandBrain(data) : null;
  }
  ensureDataFiles();
  const all = readJson(BRAND_BRAINS_FILE, []);
  return all.find((b) => b.userId === userId) || null;
}

async function upsertBrandBrain(userId, data) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const row = {
      user_id: userId,
      brand_name: data.brandName || '',
      tagline: data.tagline || '',
      niche: data.niche || '',
      audience: data.audience || '',
      tones: data.tones || [],
      cta_style: data.ctaStyle || 'direct',
      banned_words: data.bannedWords || [],
    };
    const { data: result, error } = await supabaseService
      .from('brand_brains')
      .upsert(row, { onConflict: 'user_id' })
      .select('*')
      .single();
    if (error) throw error;
    return normalizeBrandBrain(result);
  }
  ensureDataFiles();
  const all = readJson(BRAND_BRAINS_FILE, []);
  const idx = all.findIndex((b) => b.userId === userId);
  const record = {
    id: idx >= 0 ? all[idx].id : crypto.randomUUID(),
    userId,
    brandName: data.brandName || '',
    tagline: data.tagline || '',
    niche: data.niche || '',
    audience: data.audience || '',
    tones: data.tones || [],
    ctaStyle: data.ctaStyle || 'direct',
    bannedWords: data.bannedWords || [],
    createdAt: idx >= 0 ? all[idx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) all[idx] = record;
  else all.push(record);
  writeJson(BRAND_BRAINS_FILE, all);
  return record;
}

async function deleteBrandBrain(userId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService
      .from('brand_brains')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }
  ensureDataFiles();
  const all = readJson(BRAND_BRAINS_FILE, []);
  const filtered = all.filter((b) => b.userId !== userId);
  writeJson(BRAND_BRAINS_FILE, filtered);
  return true;
}

function normalizeBrandBrain(row) {
  return {
    id: row.id,
    userId: row.user_id,
    brandName: row.brand_name || '',
    tagline: row.tagline || '',
    niche: row.niche || '',
    audience: row.audience || '',
    tones: row.tones || [],
    ctaStyle: row.cta_style || 'direct',
    bannedWords: row.banned_words || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ---------------------- AI_MEMORIES (Module 3) ---------------------- */

const AI_MEMORIES_FILE = path.join(DATA_DIR, 'ai_memories.json');

async function getMemories(userId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('ai_memories')
      .select('*')
      .eq('user_id', userId)
      .order('last_used', { ascending: false });
    if (error) throw error;
    return (data || []).map(normalizeMemory);
  }
  ensureDataFiles();
  return readJson(AI_MEMORIES_FILE, []).filter((m) => m.userId === userId);
}

async function recordMemory(userId, key, value) {
  if (!key || !value) return;
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    // Try to find existing
    const { data: existing } = await supabaseService
      .from('ai_memories')
      .select('id, frequency')
      .eq('user_id', userId)
      .eq('key', key)
      .eq('value', value)
      .maybeSingle();
    if (existing) {
      await supabaseService
        .from('ai_memories')
        .update({ frequency: (existing.frequency || 1) + 1, last_used: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabaseService.from('ai_memories').insert({
        id: crypto.randomUUID(),
        user_id: userId,
        key,
        value,
        frequency: 1,
        last_used: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }
    return;
  }
  ensureDataFiles();
  const all = readJson(AI_MEMORIES_FILE, []);
  const idx = all.findIndex((m) => m.userId === userId && m.key === key && m.value === value);
  if (idx >= 0) {
    all[idx].frequency = (all[idx].frequency || 1) + 1;
    all[idx].lastUsed = new Date().toISOString();
  } else {
    all.push({
      id: crypto.randomUUID(),
      userId,
      key,
      value,
      frequency: 1,
      lastUsed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }
  writeJson(AI_MEMORIES_FILE, all);
}

async function deleteMemory(userId, memoryId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService
      .from('ai_memories')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }
  ensureDataFiles();
  const all = readJson(AI_MEMORIES_FILE, []);
  writeJson(AI_MEMORIES_FILE, all.filter((m) => !(m.id === memoryId && m.userId === userId)));
  return true;
}

async function clearMemories(userId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService
      .from('ai_memories')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }
  ensureDataFiles();
  const all = readJson(AI_MEMORIES_FILE, []);
  writeJson(AI_MEMORIES_FILE, all.filter((m) => m.userId !== userId));
  return true;
}

function normalizeMemory(row) {
  return {
    id: row.id,
    userId: row.user_id,
    key: row.key,
    value: row.value,
    frequency: row.frequency || 1,
    lastUsed: row.last_used,
    createdAt: row.created_at,
  };
}

/* ---------------------- PROMPTS (Module 4) ---------------------- */

const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');

const SEED_PROMPTS = [
  {
    id: 'seed-prompt-1',
    userId: null,
    title: 'Viral Hook Generator',
    description: 'Generate 10 curiosity-driven hooks for any topic.',
    body: 'Generate 10 viral hooks for {topic}. Use patterns: "Nobody tells you...", "I wasted 3 years...", "Stop doing this...", "The biggest mistake..."',
    category: 'education',
    isPublic: true,
    usesCount: 142,
    totalRating: 490,
    ratingCount: 102,
    avgRating: 4.9,
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'seed-prompt-2',
    userId: null,
    title: 'Educational Carousel',
    description: 'Turn any topic into a 5-slide educational carousel.',
    body: 'Create a 5-slide educational carousel about {topic}. Slide 1: Hook, Slides 2-4: Tips with examples, Slide 5: CTA.',
    category: 'education',
    isPublic: true,
    usesCount: 98,
    totalRating: 470,
    ratingCount: 98,
    avgRating: 4.8,
    createdAt: new Date('2026-01-02').toISOString(),
  },
  {
    id: 'seed-prompt-3',
    userId: null,
    title: 'Festival Post Pack',
    description: 'Generate festival-themed posts for Indian audiences.',
    body: 'Create a {festival} post for {brand}. Include greeting, offer, and cultural reference. Tone: warm and respectful.',
    category: 'business',
    isPublic: true,
    usesCount: 76,
    totalRating: 422,
    ratingCount: 90,
    avgRating: 4.7,
    createdAt: new Date('2026-01-03').toISOString(),
  },
  {
    id: 'seed-prompt-4',
    userId: null,
    title: 'Result Announcement',
    description: 'Announce student results with social proof.',
    body: 'Create a result announcement post for {student_name} who scored {score} in {exam}. Tone: proud, inspiring.',
    category: 'education',
    isPublic: true,
    usesCount: 64,
    totalRating: 314,
    ratingCount: 64,
    avgRating: 4.9,
    createdAt: new Date('2026-01-04').toISOString(),
  },
  {
    id: 'seed-prompt-5',
    userId: null,
    title: 'LinkedIn Authority Post',
    description: 'Build authority on LinkedIn with thought-leadership posts.',
    body: 'Write a LinkedIn authority post about {topic}. Structure: personal story → insight → lesson → CTA. Tone: professional.',
    category: 'business',
    isPublic: true,
    usesCount: 51,
    totalRating: 285,
    ratingCount: 62,
    avgRating: 4.6,
    createdAt: new Date('2026-01-05').toISOString(),
  },
  {
    id: 'seed-prompt-6',
    userId: null,
    title: 'Reel Script (30s)',
    description: 'Generate a 30-second Reel script with hook + body + CTA.',
    body: 'Create a 30-second Instagram Reel script about {topic}. Include: hook (3s), body (20s), CTA (7s). Add visual cues.',
    category: 'education',
    isPublic: true,
    usesCount: 47,
    totalRating: 269,
    ratingCount: 56,
    avgRating: 4.8,
    createdAt: new Date('2026-01-06').toISOString(),
  },
  {
    id: 'seed-prompt-7',
    userId: null,
    title: 'Product Launch Post',
    description: 'Launch a product with a hype-building post.',
    body: 'Create a product launch post for {product}. Highlight 3 benefits, price, and launch offer. Tone: exciting, urgent.',
    category: 'business',
    isPublic: true,
    usesCount: 38,
    totalRating: 213,
    ratingCount: 48,
    avgRating: 4.4,
    createdAt: new Date('2026-01-07').toISOString(),
  },
  {
    id: 'seed-prompt-8',
    userId: null,
    title: 'Festival Special Offer',
    description: 'Create a festival offer post for retail businesses.',
    body: 'Create a {festival} offer post for {business}. Include discount, validity, and CTA. Tone: festive, urgent.',
    category: 'business',
    isPublic: true,
    usesCount: 31,
    totalRating: 173,
    ratingCount: 38,
    avgRating: 4.5,
    createdAt: new Date('2026-01-08').toISOString(),
  },
  {
    id: 'seed-prompt-9',
    userId: null,
    title: 'Fitness Tip of the Day',
    description: 'Daily fitness tip for gym/fitness influencers.',
    body: 'Create a fitness tip post about {topic}. Include: the tip, why it matters, how to start today. Tone: motivating.',
    category: 'fitness',
    isPublic: true,
    usesCount: 27,
    totalRating: 156,
    ratingCount: 33,
    avgRating: 4.7,
    createdAt: new Date('2026-01-09').toISOString(),
  },
  {
    id: 'seed-prompt-10',
    userId: null,
    title: 'Recipe Reel Caption',
    description: 'Caption for food/recipe reels.',
    body: 'Create a caption for a recipe reel about {dish}. Include ingredients teaser, steps hint, and CTA to save.',
    category: 'food',
    isPublic: true,
    usesCount: 24,
    totalRating: 138,
    ratingCount: 30,
    avgRating: 4.6,
    createdAt: new Date('2026-01-10').toISOString(),
  },
  {
    id: 'seed-prompt-11',
    userId: null,
    title: 'Testimonial Highlight',
    description: 'Showcase a customer testimonial with context.',
    body: 'Create a testimonial post using this review: "{review}". Add context, result, and CTA.',
    category: 'business',
    isPublic: true,
    usesCount: 19,
    totalRating: 102,
    ratingCount: 22,
    avgRating: 4.6,
    createdAt: new Date('2026-01-11').toISOString(),
  },
  {
    id: 'seed-prompt-12',
    userId: null,
    title: 'Behind the Scenes',
    description: 'Show your workspace or process to build trust.',
    body: 'Create a behind-the-scenes post about {process}. Show effort, authenticity, and personality. Tone: genuine.',
    category: 'general',
    isPublic: true,
    usesCount: 17,
    totalRating: 96,
    ratingCount: 20,
    avgRating: 4.8,
    createdAt: new Date('2026-01-12').toISOString(),
  },
];

function ensurePromptsSeeded() {
  ensureDataFiles();
  const all = readJson(PROMPTS_FILE, []);
  if (all.length === 0) {
    writeJson(PROMPTS_FILE, SEED_PROMPTS);
  }
}

async function listPrompts(userId, { category, includePublic = true } = {}) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    let q = supabaseService.from('prompts').select('*');
    if (includePublic) {
      q = q.or(`is_public.eq.true,user_id.eq.${userId}`);
    } else {
      q = q.eq('user_id', userId);
    }
    if (category && category !== 'all') q = q.eq('category', category);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(normalizePrompt);
  }
  ensurePromptsSeeded();
  const all = readJson(PROMPTS_FILE, []);
  return all.filter((p) => {
    if (p.userId !== userId && !p.isPublic) return false;
    if (category && category !== 'all' && p.category !== category) return false;
    return true;
  });
}

async function getPrompt(promptId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizePrompt(data) : null;
  }
  ensurePromptsSeeded();
  return readJson(PROMPTS_FILE, []).find((p) => p.id === promptId) || null;
}

async function createPrompt(userId, body) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('prompts')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        title: body.title,
        description: body.description || '',
        body: body.body,
        category: body.category || 'general',
        is_public: !!body.isPublic,
        uses_count: 0,
        total_rating: 0,
        rating_count: 0,
        avg_rating: 0,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;
    return normalizePrompt(data);
  }
  ensurePromptsSeeded();
  const all = readJson(PROMPTS_FILE, []);
  const prompt = {
    id: crypto.randomUUID(),
    userId,
    title: body.title,
    description: body.description || '',
    body: body.body,
    category: body.category || 'general',
    isPublic: !!body.isPublic,
    usesCount: 0,
    totalRating: 0,
    ratingCount: 0,
    avgRating: 0,
    createdAt: new Date().toISOString(),
  };
  all.push(prompt);
  writeJson(PROMPTS_FILE, all);
  return prompt;
}

async function updatePrompt(userId, promptId, patch) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const update = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.body !== undefined) update.body = patch.body;
    if (patch.category !== undefined) update.category = patch.category;
    if (patch.isPublic !== undefined) update.is_public = patch.isPublic;
    const { data, error } = await supabaseService
      .from('prompts')
      .update(update)
      .eq('id', promptId)
      .eq('user_id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return normalizePrompt(data);
  }
  ensurePromptsSeeded();
  const all = readJson(PROMPTS_FILE, []);
  const idx = all.findIndex((p) => p.id === promptId && p.userId === userId);
  if (idx === -1) throw new Error('Prompt not found');
  all[idx] = { ...all[idx], ...patch };
  writeJson(PROMPTS_FILE, all);
  return all[idx];
}

async function deletePrompt(userId, promptId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService
      .from('prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }
  ensurePromptsSeeded();
  const all = readJson(PROMPTS_FILE, []);
  writeJson(PROMPTS_FILE, all.filter((p) => !(p.id === promptId && p.userId === userId)));
  return true;
}

async function incrementPromptUses(promptId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error: e1 } = await supabaseService
      .from('prompts')
      .select('uses_count')
      .eq('id', promptId)
      .maybeSingle();
    if (e1) throw e1;
    if (!data) throw new Error('Prompt not found');
    await supabaseService
      .from('prompts')
      .update({ uses_count: (data.uses_count || 0) + 1 })
      .eq('id', promptId);
    return true;
  }
  ensurePromptsSeeded();
  const all = readJson(PROMPTS_FILE, []);
  const idx = all.findIndex((p) => p.id === promptId);
  if (idx >= 0) {
    all[idx].usesCount = (all[idx].usesCount || 0) + 1;
    writeJson(PROMPTS_FILE, all);
  }
  return true;
}

async function ratePrompt(promptId, rating) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error: e1 } = await supabaseService
      .from('prompts')
      .select('total_rating, rating_count')
      .eq('id', promptId)
      .maybeSingle();
    if (e1) throw e1;
    if (!data) throw new Error('Prompt not found');
    const newTotal = (data.total_rating || 0) + rating;
    const newCount = (data.rating_count || 0) + 1;
    const newAvg = Math.round((newTotal / newCount) * 100) / 100;
    const { error: e2 } = await supabaseService
      .from('prompts')
      .update({ total_rating: newTotal, rating_count: newCount, avg_rating: newAvg })
      .eq('id', promptId);
    if (e2) throw e2;
    return { avgRating: newAvg, ratingCount: newCount };
  }
  ensurePromptsSeeded();
  const all = readJson(PROMPTS_FILE, []);
  const idx = all.findIndex((p) => p.id === promptId);
  if (idx === -1) throw new Error('Prompt not found');
  all[idx].totalRating = (all[idx].totalRating || 0) + rating;
  all[idx].ratingCount = (all[idx].ratingCount || 0) + 1;
  all[idx].avgRating = Math.round((all[idx].totalRating / all[idx].ratingCount) * 100) / 100;
  writeJson(PROMPTS_FILE, all);
  return { avgRating: all[idx].avgRating, ratingCount: all[idx].ratingCount };
}

function normalizePrompt(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    body: row.body,
    category: row.category || 'general',
    isPublic: !!row.is_public,
    usesCount: row.uses_count || 0,
    totalRating: row.total_rating || 0,
    ratingCount: row.rating_count || 0,
    avgRating: Number(row.avg_rating) || 0,
    createdAt: row.created_at,
  };
}

/* ---------------------- IMAGE_ANALYSES (Module 5) ---------------------- */

const IMAGE_ANALYSES_FILE = path.join(DATA_DIR, 'image_analyses.json');

async function saveImageAnalysis(userId, imageUrl, result, provider) {
  const record = {
    id: crypto.randomUUID(),
    userId,
    imageUrl,
    result,
    provider,
    createdAt: new Date().toISOString(),
  };
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService.from('image_analyses').insert({
      id: record.id,
      user_id: userId,
      image_url: imageUrl,
      result,
      provider,
      created_at: record.createdAt,
    });
    if (error) logger.error('image_analyses insert failed', { error: error.message });
  }
  ensureDataFiles();
  const all = readJson(IMAGE_ANALYSES_FILE, []);
  all.unshift(record);
  writeJson(IMAGE_ANALYSES_FILE, all.slice(0, 200));
  return record;
}

async function getImageAnalyses(userId, limit = 50) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('image_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      imageUrl: r.image_url,
      result: r.result,
      provider: r.provider,
      createdAt: r.created_at,
    }));
  }
  ensureDataFiles();
  return readJson(IMAGE_ANALYSES_FILE, []).filter((a) => a.userId === userId).slice(0, limit);
}

module.exports = {
  ensureDataFiles,
  usingSupabase,
  createUser,
  getUserByEmail,
  getUserById,
  saveProfile,
  saveCreditsAndPlan,
  decrementCredits,
  saveGeneration,
  getGenerations,
  createSchedule,
  getSchedules,
  saveFeedback,
  savePayment,
  findPaymentByOrderId,
  updatePaymentStatus,
  getTemplates,
  // Module 1
  getBrandBrain,
  upsertBrandBrain,
  deleteBrandBrain,
  // Module 3
  getMemories,
  recordMemory,
  deleteMemory,
  clearMemories,
  // Module 4
  listPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  incrementPromptUses,
  ratePrompt,
  ensurePromptsSeeded,
  // Module 5
  saveImageAnalysis,
  getImageAnalyses,
  // v2 features
  saveCalendar,
  getCalendars,
  saveCampaign,
  getCampaigns,
  saveDocumentAnalysis,
  getDocumentAnalyses,
  saveBrandHealth,
  getLatestBrandHealth,
  // Chrome extension: API keys
  createApiKeyRecord,
  listApiKeyRecords,
  findApiKeyByHash,
  revokeApiKey,
  touchApiKey,
};

/* ---------------------- v2: CALENDARS ---------------------- */

const CALENDARS_FILE = path.join(DATA_DIR, 'calendars.json');

async function saveCalendar(userId, calendar) {
  const record = {
    id: crypto.randomUUID(),
    userId,
    ...calendar,
    createdAt: new Date().toISOString(),
  };
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService.from('calendars').insert({
      id: record.id,
      user_id: userId,
      title: calendar.title,
      niche: calendar.niche,
      duration_days: calendar.durationDays,
      result: calendar.result,
      provider: calendar.provider,
      created_at: record.createdAt,
    });
    if (error) logger.error('calendars insert failed', { error: error.message });
  }
  ensureDataFiles();
  const all = readJson(CALENDARS_FILE, []);
  all.unshift(record);
  writeJson(CALENDARS_FILE, all.slice(0, 100));
  return record;
}

async function getCalendars(userId, limit = 20) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('calendars')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      niche: r.niche,
      durationDays: r.duration_days,
      result: r.result,
      provider: r.provider,
      createdAt: r.created_at,
    }));
  }
  ensureDataFiles();
  return readJson(CALENDARS_FILE, []).filter((c) => c.userId === userId).slice(0, limit);
}

/* ---------------------- v2: CAMPAIGNS ---------------------- */

const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');

async function saveCampaign(userId, campaign) {
  const record = {
    id: crypto.randomUUID(),
    userId,
    ...campaign,
    createdAt: new Date().toISOString(),
  };
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService.from('campaigns').insert({
      id: record.id,
      user_id: userId,
      title: campaign.title,
      theme: campaign.theme,
      platforms: campaign.platforms || [],
      post_count: campaign.postCount,
      result: campaign.result,
      provider: campaign.provider,
      created_at: record.createdAt,
    });
    if (error) logger.error('campaigns insert failed', { error: error.message });
  }
  ensureDataFiles();
  const all = readJson(CAMPAIGNS_FILE, []);
  all.unshift(record);
  writeJson(CAMPAIGNS_FILE, all.slice(0, 100));
  return record;
}

async function getCampaigns(userId, limit = 20) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      theme: r.theme,
      platforms: r.platforms || [],
      postCount: r.post_count,
      result: r.result,
      provider: r.provider,
      createdAt: r.created_at,
    }));
  }
  ensureDataFiles();
  return readJson(CAMPAIGNS_FILE, []).filter((c) => c.userId === userId).slice(0, limit);
}

/* ---------------------- v2: DOCUMENT_ANALYSES ---------------------- */

const DOCUMENT_ANALYSES_FILE = path.join(DATA_DIR, 'document_analyses.json');

async function saveDocumentAnalysis(userId, analysis) {
  const record = {
    id: crypto.randomUUID(),
    userId,
    ...analysis,
    createdAt: new Date().toISOString(),
  };
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService.from('document_analyses').insert({
      id: record.id,
      user_id: userId,
      filename: analysis.filename,
      file_type: analysis.fileType,
      extracted_text: analysis.extractedText ? analysis.extractedText.slice(0, 5000) : null,
      result: analysis.result,
      provider: analysis.provider,
      created_at: record.createdAt,
    });
    if (error) logger.error('document_analyses insert failed', { error: error.message });
  }
  ensureDataFiles();
  const all = readJson(DOCUMENT_ANALYSES_FILE, []);
  all.unshift(record);
  writeJson(DOCUMENT_ANALYSES_FILE, all.slice(0, 50));
  return record;
}

async function getDocumentAnalyses(userId, limit = 20) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('document_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      filename: r.filename,
      fileType: r.file_type,
      extractedText: r.extracted_text,
      result: r.result,
      provider: r.provider,
      createdAt: r.created_at,
    }));
  }
  ensureDataFiles();
  return readJson(DOCUMENT_ANALYSES_FILE, []).filter((a) => a.userId === userId).slice(0, limit);
}

/* ---------------------- v2: BRAND_HEALTH ---------------------- */

const BRAND_HEALTH_FILE = path.join(DATA_DIR, 'brand_health.json');

async function saveBrandHealth(userId, health) {
  const record = {
    id: crypto.randomUUID(),
    userId,
    ...health,
    createdAt: new Date().toISOString(),
  };
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService.from('brand_health_snapshots').insert({
      id: record.id,
      user_id: userId,
      consistency_score: health.consistencyScore,
      tone_score: health.toneScore,
      frequency_score: health.frequencyScore,
      engagement_prediction: health.engagementPrediction,
      total_score: health.totalScore,
      insights: health.insights,
      created_at: record.createdAt,
    });
    if (error) logger.error('brand_health insert failed', { error: error.message });
  }
  ensureDataFiles();
  const all = readJson(BRAND_HEALTH_FILE, []);
  all.unshift(record);
  writeJson(BRAND_HEALTH_FILE, all.slice(0, 30));
  return record;
}

async function getLatestBrandHealth(userId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('brand_health_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      consistencyScore: data.consistency_score,
      toneScore: data.tone_score,
      frequencyScore: data.frequency_score,
      engagementPrediction: data.engagement_prediction,
      totalScore: data.total_score,
      insights: data.insights,
      createdAt: data.created_at,
    };
  }
  ensureDataFiles();
  const all = readJson(BRAND_HEALTH_FILE, []);
  return all.find((h) => h.userId === userId) || null;
}

/* ---------------------- Chrome Extension: API_KEYS ---------------------- */
/**
 * API keys are stored as SHA-256 hashes (never the raw key).
 * Raw key format: apa_<32 hex chars>
 * On creation, the raw key is returned ONCE to the user.
 * On auth, the incoming Bearer token is hashed and compared to key_hash.
 */

const API_KEYS_FILE = path.join(DATA_DIR, 'api_keys.json');

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function generateRawApiKey() {
  // apa_ prefix + 32 random hex chars = 36 char total
  return 'apa_' + crypto.randomBytes(16).toString('hex');
}

async function createApiKeyRecord(userId, name = 'default') {
  const rawKey = generateRawApiKey();
  const keyHash = sha256(rawKey);
  const keyPrefix = rawKey.slice(0, 12); // "apa_abc12345" — for display in dashboard
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const record = {
    id,
    userId,
    keyHash,
    keyPrefix,
    name,
    lastUsed: null,
    createdAt,
  };

  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService.from('api_keys').insert({
      id,
      user_id: userId,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name,
      created_at: createdAt,
    });
    if (error) throw error;
  }
  ensureDataFiles();
  const all = readJson(API_KEYS_FILE, []);
  all.push(record);
  writeJson(API_KEYS_FILE, all);

  // Return record + raw key (only time the raw key is exposed)
  return { ...record, rawKey };
}

async function listApiKeyRecords(userId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('api_keys')
      .select('id, user_id, key_prefix, name, last_used, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      keyPrefix: r.key_prefix,
      name: r.name,
      lastUsed: r.last_used,
      createdAt: r.created_at,
    }));
  }
  ensureDataFiles();
  return readJson(API_KEYS_FILE, [])
    .filter((k) => k.userId === userId)
    .map(({ keyHash, ...rest }) => rest); // never expose hash
}

async function findApiKeyByHash(keyHash) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { data, error } = await supabaseService
      .from('api_keys')
      .select('id, user_id, name, last_used, created_at')
      .eq('key_hash', keyHash)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      lastUsed: data.last_used,
      createdAt: data.created_at,
    };
  }
  ensureDataFiles();
  const all = readJson(API_KEYS_FILE, []);
  const found = all.find((k) => k.keyHash === keyHash);
  if (!found) return null;
  const { keyHash: _hash, ...rest } = found;
  return rest;
}

async function revokeApiKey(userId, keyId) {
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    const { error } = await supabaseService
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }
  ensureDataFiles();
  const all = readJson(API_KEYS_FILE, []);
  writeJson(API_KEYS_FILE, all.filter((k) => !(k.id === keyId && k.userId === userId)));
  return true;
}

async function touchApiKey(keyId) {
  // Update last_used timestamp (fire-and-forget — don't block auth)
  const now = new Date().toISOString();
  if (usingSupabase()) {
    const { supabaseService } = getClients();
    await supabaseService.from('api_keys').update({ last_used: now }).eq('id', keyId);
    return;
  }
  ensureDataFiles();
  const all = readJson(API_KEYS_FILE, []);
  const idx = all.findIndex((k) => k.id === keyId);
  if (idx >= 0) {
    all[idx].lastUsed = now;
    writeJson(API_KEYS_FILE, all);
  }
}

module.exports.sha256 = sha256;
