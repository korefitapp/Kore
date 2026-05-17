-- =====================================================================
-- KORE — Initial schema
-- Idempotente: pode rodar várias vezes sem quebrar.
-- =====================================================================

-- Extensões -----------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =====================================================================
-- Enums
-- Order: admin > nutritionist > trainer > merchant > client.
-- Mantemos 'client' como default (B2C).
-- =====================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum (
      'admin', 'nutritionist', 'trainer', 'merchant', 'client'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type public.user_status as enum ('active', 'paused', 'churned');
  end if;
end$$;

-- =====================================================================
-- profiles  (1:1 com auth.users)
-- =====================================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null default '',
  display_name  text,
  avatar_url    text,
  role          public.user_role not null default 'client',
  status        public.user_status not null default 'active',
  locale        text not null default 'pt-BR',
  timezone      text not null default 'America/Sao_Paulo',
  birthdate     date,
  phone         text,
  stripe_customer_id        text,
  stripe_connect_account_id text,           -- nutritionist/trainer/merchant
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_role_idx   on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);

-- =====================================================================
-- user_daily_targets  (metas dinâmicas; ajustadas pelo gasto do treino)
-- =====================================================================
create table if not exists public.user_daily_targets (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  water_ml          int not null default 3000   check (water_ml between 0 and 10000),
  kcal              int not null default 2400   check (kcal between 800 and 8000),
  protein_g         int not null default 180    check (protein_g >= 0),
  carbs_g           int not null default 280    check (carbs_g >= 0),
  fat_g             int not null default 70     check (fat_g >= 0),
  steps             int not null default 8000   check (steps >= 0),
  active_kcal_burn  int not null default 400    check (active_kcal_burn >= 0),
  updated_at        timestamptz not null default now()
);

-- =====================================================================
-- updated_at trigger
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.user_daily_targets;
create trigger set_updated_at
  before update on public.user_daily_targets
  for each row execute function public.set_updated_at();

-- =====================================================================
-- handle_new_user: cria profile + targets quando alguém faz signup.
-- Funciona para email + OAuth (Google/Apple).
-- Lê `role` de raw_user_meta_data se vier no signup; fallback 'client'.
-- SECURITY DEFINER para atravessar RLS.
-- 'admin' nunca é setado por aqui — promoção é manual (set_user_role).
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name  text;
  v_avatar_url text;
  v_role_raw   text;
  v_role       public.user_role;
begin
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  v_avatar_url := new.raw_user_meta_data->>'avatar_url';

  v_role_raw := new.raw_user_meta_data->>'role';
  if v_role_raw in ('nutritionist', 'trainer', 'merchant', 'client') then
    v_role := v_role_raw::public.user_role;
  else
    v_role := 'client'::public.user_role;
  end if;

  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, v_full_name, v_avatar_url, v_role)
  on conflict (id) do nothing;

  insert into public.user_daily_targets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- RLS — Row Level Security
-- =====================================================================
alter table public.profiles           enable row level security;
alter table public.user_daily_targets enable row level security;

-- Profiles ------------------------------------------------------------
drop policy if exists "profile: select own"  on public.profiles;
drop policy if exists "profile: update own"  on public.profiles;
drop policy if exists "profile: insert own"  on public.profiles;

create policy "profile: select own"
  on public.profiles for select
  using (auth.uid() = id);

-- Usuário NÃO pode alterar a coluna `role` por si só — a migration
-- futura vai adicionar uma função `set_user_role(uid, role)`
-- SECURITY DEFINER chamada pelo admin ou pelo webhook do Stripe Connect.
create policy "profile: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profile: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Targets -------------------------------------------------------------
drop policy if exists "targets: select own" on public.user_daily_targets;
drop policy if exists "targets: update own" on public.user_daily_targets;
drop policy if exists "targets: insert own" on public.user_daily_targets;

create policy "targets: select own"
  on public.user_daily_targets for select
  using (auth.uid() = user_id);

create policy "targets: update own"
  on public.user_daily_targets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "targets: insert own"
  on public.user_daily_targets for insert
  with check (auth.uid() = user_id);

-- =====================================================================
-- view v_user_dashboard — payload da Home autenticada
-- =====================================================================
create or replace view public.v_user_dashboard
with (security_invoker = true)
as
select
  p.id            as user_id,
  p.full_name,
  p.display_name,
  p.avatar_url,
  p.role,
  p.status,
  p.locale,
  p.timezone,
  t.water_ml      as target_water_ml,
  t.kcal          as target_kcal,
  t.protein_g     as target_protein_g,
  t.carbs_g       as target_carbs_g,
  t.fat_g         as target_fat_g,
  t.steps         as target_steps,
  t.active_kcal_burn as target_active_kcal_burn,
  p.created_at,
  p.updated_at
from public.profiles p
left join public.user_daily_targets t on t.user_id = p.id;

comment on view public.v_user_dashboard is
  'Payload base de /user/dashboard. RLS herdada de profiles/user_daily_targets.';

-- =====================================================================
-- Grants — autenticado pode ler a view (RLS filtra)
-- =====================================================================
grant usage on schema public to authenticated, anon;
grant select on public.v_user_dashboard to authenticated;
