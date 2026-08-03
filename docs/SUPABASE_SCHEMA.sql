-- ============================================================
-- PostReady AI v10 — Production schema for Supabase (Postgres)
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query).
-- Idempotent: safe to re-run.
-- ============================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------- USERS ----------
-- `id` is the Supabase Auth user id (auth.users.id) — identity itself
-- (email, password, Google OAuth) lives in Supabase Auth, not here.
-- This table only holds app-level data: plan, credits, brand voice, etc.
-- See migrations/002_supabase_auth_migration.sql for the auto-create
-- trigger and RLS policies (run automatically the first time via the
-- backend too, so the trigger is belt-and-suspenders).
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text default 'Creator',
  password_hash text,  -- unused (Supabase Auth owns passwords); kept for legacy data migrated from v10 and earlier
  avatar_url text,
  provider text default 'email',
  plan text default 'free',
  credits integer default 10,
  brand_voice jsonb default '{}'::jsonb,
  generations jsonb default '[]'::jsonb,  -- legacy: kept for backward compat. New rows go to `generations` table.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- GENERATIONS ----------
create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  input jsonb not null,
  result jsonb not null,
  provider text,
  created_at timestamptz default now()
);
create index if not exists idx_generations_user_id on generations(user_id, created_at desc);

-- ---------- SCHEDULES ----------
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  platform text not null,
  content text not null,
  date_time timestamptz not null,
  status text default 'planned',
  created_at timestamptz default now()
);
create index if not exists idx_schedules_user_id on schedules(user_id, created_at desc);

-- ---------- FEEDBACK ----------
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  generation_id uuid,
  rating text not null,
  comment text,
  created_at timestamptz default now()
);

-- ---------- PAYMENTS ----------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider text default 'razorpay',
  provider_order_id text,
  provider_payment_id text,
  plan text not null,
  amount integer not null,  -- in paise
  status text default 'created',
  created_at timestamptz default now(),
  verified_at timestamptz
);
create index if not exists idx_payments_user_id on payments(user_id, created_at desc);
create index if not exists idx_payments_order_id on payments(provider_order_id);

-- ---------- SUBSCRIPTIONS (for recurring billing) ----------
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  razorpay_subscription_id text unique,
  plan text not null,
  status text default 'created',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- Users can only see/modify their own rows. The service role
-- bypasses RLS, so server-side code can still read/write everything.
-- ============================================================

alter table users enable row level security;
alter table generations enable row level security;
alter table schedules enable row level security;
alter table feedback enable row level security;
alter table payments enable row level security;
alter table subscriptions enable row level security;

-- Users: a user can read/update only their own row.
drop policy if exists "users_select_own" on users;
create policy "users_select_own" on users for select using (auth.uid() = id);

drop policy if exists "users_update_own" on users;
create policy "users_update_own" on users for update using (auth.uid() = id);

-- Generations: a user can read/insert their own.
drop policy if exists "generations_select_own" on generations;
create policy "generations_select_own" on generations for select using (auth.uid() = user_id);

drop policy if exists "generations_insert_own" on generations;
create policy "generations_insert_own" on generations for insert with check (auth.uid() = user_id);

-- Schedules
drop policy if exists "schedules_select_own" on schedules;
create policy "schedules_select_own" on schedules for select using (auth.uid() = user_id);

drop policy if exists "schedules_insert_own" on schedules;
create policy "schedules_insert_own" on schedules for insert with check (auth.uid() = user_id);

drop policy if exists "schedules_update_own" on schedules;
create policy "schedules_update_own" on schedules for update using (auth.uid() = user_id);

drop policy if exists "schedules_delete_own" on schedules;
create policy "schedules_delete_own" on schedules for delete using (auth.uid() = user_id);

-- Feedback
drop policy if exists "feedback_select_own" on feedback;
create policy "feedback_select_own" on feedback for select using (auth.uid() = user_id);

drop policy if exists "feedback_insert_own" on feedback;
create policy "feedback_insert_own" on feedback for insert with check (auth.uid() = user_id);

-- Payments
drop policy if exists "payments_select_own" on payments;
create policy "payments_select_own" on payments for select using (auth.uid() = user_id);

drop policy if exists "payments_insert_own" on payments;
create policy "payments_insert_own" on payments for insert with check (auth.uid() = user_id);

-- Subscriptions
drop policy if exists "subscriptions_select_own" on subscriptions;
create policy "subscriptions_select_own" on subscriptions for select using (auth.uid() = user_id);

-- ============================================================
-- v11 tables (Prompt 3 modules)
-- ============================================================

-- ---------- BRAND_BRAINS (Module 1) ----------
create table if not exists brand_brains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  brand_name text default '',
  tagline text default '',
  niche text default '',
  audience text default '',
  tones text[] default '{}',
  cta_style text default 'direct',
  banned_words text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- AI_MEMORIES (Module 3) ----------
create table if not exists ai_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  key text not null,
  value text not null,
  frequency integer default 1,
  last_used timestamptz default now(),
  created_at timestamptz default now()
);
create index if not exists idx_ai_memories_user_id on ai_memories(user_id, key);

-- ---------- PROMPTS (Module 4) ----------
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  title text not null,
  description text default '',
  body text not null,
  category text default 'general',
  is_public boolean default false,
  uses_count integer default 0,
  total_rating integer default 0,
  rating_count integer default 0,
  avg_rating numeric(3,2) default 0,
  created_at timestamptz default now()
);
create index if not exists idx_prompts_public on prompts(is_public, category);

-- ---------- IMAGE_ANALYSES (Module 5) ----------
create table if not exists image_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  image_url text not null,
  result jsonb not null,
  provider text,
  created_at timestamptz default now()
);
create index if not exists idx_image_analyses_user_id on image_analyses(user_id, created_at desc);

-- Add score column to existing generations table (Module 2)
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_name = 'generations' and column_name = 'score') then
    alter table generations add column score jsonb;
  end if;
end$$;

-- ---------- RLS for new tables ----------
alter table brand_brains enable row level security;
alter table ai_memories enable row level security;
alter table prompts enable row level security;
alter table image_analyses enable row level security;

-- brand_brains
drop policy if exists "brand_brains_select_own" on brand_brains;
create policy "brand_brains_select_own" on brand_brains for select using (auth.uid() = user_id);
drop policy if exists "brand_brains_insert_own" on brand_brains;
create policy "brand_brains_insert_own" on brand_brains for insert with check (auth.uid() = user_id);
drop policy if exists "brand_brains_update_own" on brand_brains;
create policy "brand_brains_update_own" on brand_brains for update using (auth.uid() = user_id);
drop policy if exists "brand_brains_delete_own" on brand_brains;
create policy "brand_brains_delete_own" on brand_brains for delete using (auth.uid() = user_id);

-- ai_memories
drop policy if exists "ai_memories_select_own" on ai_memories;
create policy "ai_memories_select_own" on ai_memories for select using (auth.uid() = user_id);
drop policy if exists "ai_memories_insert_own" on ai_memories;
create policy "ai_memories_insert_own" on ai_memories for insert with check (auth.uid() = user_id);
drop policy if exists "ai_memories_update_own" on ai_memories;
create policy "ai_memories_update_own" on ai_memories for update using (auth.uid() = user_id);
drop policy if exists "ai_memories_delete_own" on ai_memories;
create policy "ai_memories_delete_own" on ai_memories for delete using (auth.uid() = user_id);

-- prompts (public prompts readable by everyone; private only by owner)
drop policy if exists "prompts_select" on prompts;
create policy "prompts_select" on prompts for select using (is_public = true or auth.uid() = user_id);
drop policy if exists "prompts_insert_own" on prompts;
create policy "prompts_insert_own" on prompts for insert with check (auth.uid() = user_id);
drop policy if exists "prompts_update_own" on prompts;
create policy "prompts_update_own" on prompts for update using (auth.uid() = user_id);
drop policy if exists "prompts_delete_own" on prompts;
create policy "prompts_delete_own" on prompts for delete using (auth.uid() = user_id);

-- image_analyses
drop policy if exists "image_analyses_select_own" on image_analyses;
create policy "image_analyses_select_own" on image_analyses for select using (auth.uid() = user_id);
drop policy if exists "image_analyses_insert_own" on image_analyses;
create policy "image_analyses_insert_own" on image_analyses for insert with check (auth.uid() = user_id);
drop policy if exists "image_analyses_delete_own" on image_analyses;
create policy "image_analyses_delete_own" on image_analyses for delete using (auth.uid() = user_id);

-- ---------- updated_at triggers for new tables ----------
drop trigger if exists trg_brand_brains_updated_at on brand_brains;
create trigger trg_brand_brains_updated_at before update on brand_brains for each row execute function set_updated_at();

-- ============================================================
-- v2 tables (Prompt 3 follow-up features)
-- ============================================================

-- ---------- CAMPAIGNS (v2: Campaign Builder) ----------
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  theme text not null,
  platforms text[] default '{}',
  post_count integer default 10,
  result jsonb,
  provider text,
  created_at timestamptz default now()
);
create index if not exists idx_campaigns_user_id on campaigns(user_id, created_at desc);

-- ---------- CALENDARS (v2: AI Content Calendar) ----------
create table if not exists calendars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  niche text,
  duration_days integer default 30,
  result jsonb,
  provider text,
  created_at timestamptz default now()
);
create index if not exists idx_calendars_user_id on calendars(user_id, created_at desc);

-- ---------- DOCUMENT_ANALYSES (v2: Document-to-content) ----------
create table if not exists document_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  filename text not null,
  file_type text not null,
  extracted_text text,
  result jsonb not null,
  provider text,
  created_at timestamptz default now()
);
create index if not exists idx_document_analyses_user_id on document_analyses(user_id, created_at desc);

-- ---------- BRAND_HEALTH (v2: Brand Health Dashboard) ----------
create table if not exists brand_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  consistency_score integer default 0,
  tone_score integer default 0,
  frequency_score integer default 0,
  engagement_prediction integer default 0,
  total_score integer default 0,
  insights jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_brand_health_user_id on brand_health_snapshots(user_id, created_at desc);

-- ---------- API_KEYS (Chrome extension auth) ----------
-- Stores SHA-256 hashes of API keys (never the raw key).
-- Raw key format: apa_<32 random chars> — shown to user ONCE on creation.
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  key_hash text not null unique,         -- SHA-256 hex of raw key
  key_prefix text not null,              -- first 8 chars for display (e.g. "apa_abc1")
  name text default 'default',           -- user-given label
  last_used timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_api_keys_user_id on api_keys(user_id, created_at desc);
create index if not exists idx_api_keys_hash on api_keys(key_hash);

-- RLS for v2 tables
alter table campaigns enable row level security;
alter table calendars enable row level security;
alter table document_analyses enable row level security;
alter table brand_health_snapshots enable row level security;
alter table api_keys enable row level security;

drop policy if exists "campaigns_select_own" on campaigns;
create policy "campaigns_select_own" on campaigns for select using (auth.uid() = user_id);
drop policy if exists "campaigns_insert_own" on campaigns;
create policy "campaigns_insert_own" on campaigns for insert with check (auth.uid() = user_id);
drop policy if exists "campaigns_delete_own" on campaigns;
create policy "campaigns_delete_own" on campaigns for delete using (auth.uid() = user_id);

drop policy if exists "calendars_select_own" on calendars;
create policy "calendars_select_own" on calendars for select using (auth.uid() = user_id);
drop policy if exists "calendars_insert_own" on calendars;
create policy "calendars_insert_own" on calendars for insert with check (auth.uid() = user_id);
drop policy if exists "calendars_delete_own" on calendars;
create policy "calendars_delete_own" on calendars for delete using (auth.uid() = user_id);

drop policy if exists "document_analyses_select_own" on document_analyses;
create policy "document_analyses_select_own" on document_analyses for select using (auth.uid() = user_id);
drop policy if exists "document_analyses_insert_own" on document_analyses;
create policy "document_analyses_insert_own" on document_analyses for insert with check (auth.uid() = user_id);
drop policy if exists "document_analyses_delete_own" on document_analyses;
create policy "document_analyses_delete_own" on document_analyses for delete using (auth.uid() = user_id);

drop policy if exists "brand_health_select_own" on brand_health_snapshots;
create policy "brand_health_select_own" on brand_health_snapshots for select using (auth.uid() = user_id);
drop policy if exists "brand_health_insert_own" on brand_health_snapshots;
create policy "brand_health_insert_own" on brand_health_snapshots for insert with check (auth.uid() = user_id);

-- api_keys (NOTE: lookups by key_hash happen via service role, bypassing RLS)
drop policy if exists "api_keys_select_own" on api_keys;
create policy "api_keys_select_own" on api_keys for select using (auth.uid() = user_id);
drop policy if exists "api_keys_insert_own" on api_keys;
create policy "api_keys_insert_own" on api_keys for insert with check (auth.uid() = user_id);
drop policy if exists "api_keys_delete_own" on api_keys;
create policy "api_keys_delete_own" on api_keys for delete using (auth.uid() = user_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at before update on users for each row execute function set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on subscriptions;
create trigger trg_subscriptions_updated_at before update on subscriptions for each row execute function set_updated_at();
