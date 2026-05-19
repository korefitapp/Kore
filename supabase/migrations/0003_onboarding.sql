-- =====================================================================
-- KORE — Onboarding B2B/B2C + fila de aprovação de profissionais
--
-- Mudanças:
--   1. Adiciona 'pending' ao enum user_status (status default p/ profissionais).
--   2. Adiciona colunas cref / crn / cnpj em profiles (documentos profissionais).
--   3. Atualiza handle_new_user para:
--        - Ler phone, cref, crn, cnpj de raw_user_meta_data.
--        - Setar status='pending' para roles profissionais
--          (nutritionist/trainer/merchant). Cliente nasce 'active'.
--   4. Garante que o usuário NÃO pode alterar `role` nem `status` direto
--      via RLS (split em UPDATE policies: campos próprios x privilegiados).
--
-- Idempotente: pode rodar várias vezes sem quebrar.
-- =====================================================================

-- 1) Enum status: adiciona 'pending' (não destrutivo) -----------------
do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.user_status'::regtype
      and enumlabel = 'pending'
  ) then
    alter type public.user_status add value 'pending';
  end if;
end$$;

-- 2) Novas colunas em profiles ---------------------------------------
alter table public.profiles
  add column if not exists cref text,
  add column if not exists crn  text,
  add column if not exists cnpj text;

create index if not exists profiles_cref_idx on public.profiles(cref)
  where cref is not null;
create index if not exists profiles_crn_idx  on public.profiles(crn)
  where crn  is not null;
create index if not exists profiles_cnpj_idx on public.profiles(cnpj)
  where cnpj is not null;
create unique index if not exists profiles_phone_unique_idx
  on public.profiles(phone)
  where phone is not null;

-- 3) handle_new_user atualizado --------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name  text;
  v_avatar_url text;
  v_phone      text;
  v_cref       text;
  v_crn        text;
  v_cnpj       text;
  v_role_raw   text;
  v_role       public.user_role;
  v_status     public.user_status;
begin
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  v_avatar_url := new.raw_user_meta_data->>'avatar_url';
  v_phone      := nullif(new.raw_user_meta_data->>'phone', '');
  v_cref       := nullif(new.raw_user_meta_data->>'cref', '');
  v_crn        := nullif(new.raw_user_meta_data->>'crn', '');
  v_cnpj       := nullif(new.raw_user_meta_data->>'cnpj', '');

  v_role_raw := new.raw_user_meta_data->>'role';
  if v_role_raw in ('nutritionist', 'trainer', 'merchant', 'client') then
    v_role := v_role_raw::public.user_role;
  else
    v_role := 'client'::public.user_role;
  end if;

  -- Profissionais nascem 'pending' (Admin precisa aprovar). Cliente 'active'.
  if v_role in ('nutritionist', 'trainer', 'merchant') then
    v_status := 'pending'::public.user_status;
  else
    v_status := 'active'::public.user_status;
  end if;

  insert into public.profiles (
    id, full_name, avatar_url, role, status, phone, cref, crn, cnpj
  )
  values (
    new.id, v_full_name, v_avatar_url, v_role, v_status,
    v_phone, v_cref, v_crn, v_cnpj
  )
  on conflict (id) do nothing;

  insert into public.user_daily_targets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end$$;

-- 4) RLS: usuário NÃO pode alterar role/status próprios --------------
-- O policy antigo "profile: update own" permitia tudo. Substituímos por
-- versão que checa (no WITH CHECK) que role e status permaneceram iguais.
drop policy if exists "profile: update own" on public.profiles;
create policy "profile: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
  );

-- =====================================================================
-- Função SECURITY DEFINER pra busca de e-mail por telefone (login por celular).
-- Service Role chama via RPC; RLS bypass garantido pelo SECURITY DEFINER.
-- =====================================================================
create or replace function public.email_for_phone(p_phone text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if p_phone is null or length(p_phone) = 0 then
    return null;
  end if;

  select u.email
    into v_email
    from public.profiles p
    join auth.users u on u.id = p.id
   where p.phone = p_phone
   limit 1;

  return v_email;
end$$;

revoke all on function public.email_for_phone(text) from public;
grant execute on function public.email_for_phone(text) to service_role;
