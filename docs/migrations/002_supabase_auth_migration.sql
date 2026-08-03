-- ============================================================
-- AI Post Assistant — Migration: switch to Supabase Auth
-- Run this in Supabase SQL Editor (Dashboard -> SQL -> New query).
-- Idempotent: safe to re-run.
--
-- What changes:
--   - `public.users.id` becomes a foreign key into `auth.users.id`
--     (Supabase Auth owns identity; this table only owns app data:
--     plan, credits, brandVoice, generations, etc).
--   - `password_hash` is no longer required (Supabase Auth stores
--     passwords itself, encrypted, and we never see them).
--   - New `avatar_url` / `provider` columns for Google/email profile info.
--   - A trigger auto-creates a `public.users` row whenever someone signs
--     up via Supabase Auth (password OR Google) — belt-and-suspenders
--     alongside the app's own lazy-create-on-first-request logic.
--   - Row Level Security so a logged-in user can only read/update their
--     own row if you ever query `users` with the anon/public key instead
--     of the backend's service-role key.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- USERS: relax/extend existing columns ----------
alter table if exists users
  alter column password_hash drop not null;

alter table if exists users
  add column if not exists avatar_url text,
  add column if not exists provider text default 'email';

-- Drop the old default (Supabase Auth assigns the id, not Postgres) and
-- link it to auth.users so profile rows are deleted when the auth user is.
alter table if exists users
  alter column id drop default;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'users_id_fkey_auth_users'
  ) then
    alter table users
      add constraint users_id_fkey_auth_users
      foreign key (id) references auth.users(id) on delete cascade;
  end if;
end $$;

-- ---------- Auto-create profile row on signup (password or OAuth) ----------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url, provider, plan, credits, brand_voice, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    'free',
    10,
    '{"brandName":"","tagline":"","tone":"simple and practical"}'::jsonb,
    new.created_at
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------- Row Level Security ----------
alter table users enable row level security;

drop policy if exists "Users can view own profile" on users;
create policy "Users can view own profile"
  on users for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on users;
create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

-- Inserts happen via the trigger (security definer) or the backend's
-- service-role key, both of which bypass RLS — no insert policy needed
-- for the anon/authenticated roles.
