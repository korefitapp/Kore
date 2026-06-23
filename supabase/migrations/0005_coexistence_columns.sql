-- =====================================================================
-- KORE — Add Coexistence Columns for Professionals
-- Allows a user to have both a coach and a nutritionist simultaneously.
-- =====================================================================

alter table public.profiles
add column if not exists nutritionist_id uuid references auth.users(id) on delete set null,
add column if not exists coach_id uuid references auth.users(id) on delete set null;

create index if not exists profiles_nutritionist_id_idx on public.profiles(nutritionist_id);
create index if not exists profiles_coach_id_idx on public.profiles(coach_id);
