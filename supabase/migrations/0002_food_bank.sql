-- =====================================================================
-- KORE — Food bank + meal/water logs
-- Idempotente: pode rodar várias vezes sem quebrar.
-- =====================================================================

-- =====================================================================
-- food_bank — banco global de alimentos
-- Leitura pública (anon + authenticated); escrita só via service_role.
-- =====================================================================
create table if not exists public.food_bank (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null default 'general',
  kcal         numeric(7,2) not null check (kcal >= 0),
  protein_g    numeric(7,2) not null default 0 check (protein_g >= 0),
  carbs_g      numeric(7,2) not null default 0 check (carbs_g >= 0),
  fat_g        numeric(7,2) not null default 0 check (fat_g >= 0),
  serving_size text not null default '100g',
  emoji        text,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists food_bank_category_idx on public.food_bank(category);
create index if not exists food_bank_name_trgm_idx
  on public.food_bank using gin (name gin_trgm_ops);

create extension if not exists pg_trgm;

drop trigger if exists set_updated_at on public.food_bank;
create trigger set_updated_at
  before update on public.food_bank
  for each row execute function public.set_updated_at();

alter table public.food_bank enable row level security;

drop policy if exists "food_bank: read all" on public.food_bank;
create policy "food_bank: read all"
  on public.food_bank for select
  to anon, authenticated
  using (true);

-- =====================================================================
-- meal_logs — refeições registradas por usuário/dia
-- =====================================================================
create table if not exists public.meal_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  log_date     date not null default current_date,
  slot         text not null,                     -- breakfast | snack_am | lunch | preworkout | dinner
  emoji        text,
  name         text not null,
  target_time  text,
  consumed     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists meal_logs_user_date_idx
  on public.meal_logs(user_id, log_date);

drop trigger if exists set_updated_at on public.meal_logs;
create trigger set_updated_at
  before update on public.meal_logs
  for each row execute function public.set_updated_at();

alter table public.meal_logs enable row level security;

drop policy if exists "meal_logs: select own" on public.meal_logs;
drop policy if exists "meal_logs: insert own" on public.meal_logs;
drop policy if exists "meal_logs: update own" on public.meal_logs;
drop policy if exists "meal_logs: delete own" on public.meal_logs;

create policy "meal_logs: select own"
  on public.meal_logs for select
  using (auth.uid() = user_id);
create policy "meal_logs: insert own"
  on public.meal_logs for insert
  with check (auth.uid() = user_id);
create policy "meal_logs: update own"
  on public.meal_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "meal_logs: delete own"
  on public.meal_logs for delete
  using (auth.uid() = user_id);

-- =====================================================================
-- meal_log_items — itens dentro da refeição (snapshot dos foods)
-- =====================================================================
create table if not exists public.meal_log_items (
  id            uuid primary key default gen_random_uuid(),
  meal_log_id   uuid not null references public.meal_logs(id) on delete cascade,
  food_id       uuid references public.food_bank(id) on delete set null,
  name          text not null,
  kcal          numeric(7,2) not null check (kcal >= 0),
  protein_g     numeric(7,2) not null default 0,
  carbs_g       numeric(7,2) not null default 0,
  fat_g         numeric(7,2) not null default 0,
  qty           numeric(6,2) not null default 1,
  created_at    timestamptz not null default now()
);

create index if not exists meal_log_items_meal_log_idx
  on public.meal_log_items(meal_log_id);

alter table public.meal_log_items enable row level security;

drop policy if exists "meal_log_items: select own" on public.meal_log_items;
drop policy if exists "meal_log_items: insert own" on public.meal_log_items;
drop policy if exists "meal_log_items: delete own" on public.meal_log_items;

create policy "meal_log_items: select own"
  on public.meal_log_items for select
  using (
    exists (
      select 1 from public.meal_logs m
      where m.id = meal_log_items.meal_log_id and m.user_id = auth.uid()
    )
  );
create policy "meal_log_items: insert own"
  on public.meal_log_items for insert
  with check (
    exists (
      select 1 from public.meal_logs m
      where m.id = meal_log_items.meal_log_id and m.user_id = auth.uid()
    )
  );
create policy "meal_log_items: delete own"
  on public.meal_log_items for delete
  using (
    exists (
      select 1 from public.meal_logs m
      where m.id = meal_log_items.meal_log_id and m.user_id = auth.uid()
    )
  );

-- =====================================================================
-- water_logs — registro diário de hidratação
-- =====================================================================
create table if not exists public.water_logs (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  log_date   date not null default current_date,
  water_ml   int not null default 0 check (water_ml between 0 and 20000),
  updated_at timestamptz not null default now(),
  primary key (user_id, log_date)
);

drop trigger if exists set_updated_at on public.water_logs;
create trigger set_updated_at
  before update on public.water_logs
  for each row execute function public.set_updated_at();

alter table public.water_logs enable row level security;

drop policy if exists "water_logs: select own" on public.water_logs;
drop policy if exists "water_logs: insert own" on public.water_logs;
drop policy if exists "water_logs: update own" on public.water_logs;

create policy "water_logs: select own"
  on public.water_logs for select
  using (auth.uid() = user_id);
create policy "water_logs: insert own"
  on public.water_logs for insert
  with check (auth.uid() = user_id);
create policy "water_logs: update own"
  on public.water_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select on public.food_bank to anon, authenticated;

-- =====================================================================
-- Seed: banco global de alimentos (mock data para o Nutri prescrever)
-- Idempotente via name unique-ish check.
-- =====================================================================
insert into public.food_bank (name, category, kcal, protein_g, carbs_g, fat_g, serving_size, emoji)
select * from (values
  ('Pão Integral (2 fatias)',           'cereal',     150, 6,  28, 2,  '50g',  '🍞'),
  ('Ovo Mexido (2 un)',                 'protein',    180, 14, 1,  13, '120g', '🍳'),
  ('Café preto',                        'beverage',   5,   0,  1,  0,  '200ml','☕️'),
  ('Maçã Fuji',                         'fruit',      95,  0,  25, 0,  '150g', '🍎'),
  ('Mix de Castanhas (30g)',            'snack',      180, 5,  6,  16, '30g',  '🥜'),
  ('Peito de Frango Grelhado',          'protein',    240, 45, 0,  6,  '150g', '🍗'),
  ('Arroz Integral cozido',             'cereal',     130, 3,  28, 1,  '100g', '🍚'),
  ('Feijão Carioca',                    'legume',     95,  7,  17, 0,  '100g', '🥣'),
  ('Salada Mista + Azeite',             'vegetable',  120, 2,  8,  9,  '150g', '🥗'),
  ('Banana Prata',                      'fruit',      90,  1,  23, 0,  '100g', '🍌'),
  ('Whey Protein (30g)',                'supplement', 120, 24, 3,  1,  '30g',  '🥛'),
  ('Salmão Grelhado',                   'protein',    250, 26, 0,  16, '120g', '🐟'),
  ('Batata Doce',                       'tubercle',   130, 2,  30, 0,  '150g', '🍠'),
  ('Brócolis no Vapor',                 'vegetable',  55,  4,  11, 1,  '150g', '🥦'),
  ('Aveia em flocos',                   'cereal',     150, 5,  27, 3,  '40g',  '🌾'),
  ('Iogurte Natural Desnatado',         'dairy',      60,  10, 7,  0,  '170g', '🥛'),
  ('Tapioca pura',                      'cereal',     220, 0,  53, 0,  '60g',  '⚪'),
  ('Pasta de Amendoim',                 'fat',        190, 8,  6,  16, '30g',  '🥜'),
  ('Abacate',                           'fat',        160, 2,  9,  15, '100g', '🥑'),
  ('Quinoa cozida',                     'cereal',     120, 4,  21, 2,  '100g', '🌾'),
  ('Tilápia Grelhada',                  'protein',    130, 26, 0,  3,  '120g', '🐟'),
  ('Atum em água',                      'protein',    110, 25, 0,  1,  '100g', '🐟'),
  ('Carne Magra Patinho',               'protein',    180, 28, 0,  7,  '120g', '🥩'),
  ('Ovo Cozido (1 un)',                 'protein',    78,  6,  1,  5,  '60g',  '🥚'),
  ('Leite Desnatado',                   'dairy',      85,  8,  12, 0,  '200ml','🥛'),
  ('Queijo Cottage',                    'dairy',      80,  11, 3,  2,  '100g', '🧀'),
  ('Ricota fresca',                     'dairy',      170, 11, 3,  13, '100g', '🧀'),
  ('Sushi de Salmão (8 un)',            'protein',    320, 14, 50, 6,  '200g', '🍣'),
  ('Hambúrguer artesanal',              'fast_food',  450, 27, 33, 24, '200g', '🍔'),
  ('Pizza Margherita (2 fatias)',       'fast_food',  500, 20, 60, 18, '180g', '🍕'),
  ('Macarrão Integral',                 'cereal',     180, 7,  35, 1,  '100g', '🍝'),
  ('Pasta Vegana (lentilha)',           'legume',     230, 14, 38, 2,  '100g', '🍝'),
  ('Cuscuz nordestino',                 'cereal',     112, 3,  24, 1,  '100g', '🌽'),
  ('Granola Caseira',                   'cereal',     200, 5,  28, 8,  '40g',  '🥣'),
  ('Pão de Queijo',                     'cereal',     90,  2,  10, 5,  '30g',  '🧀'),
  ('Suco de Laranja Natural',           'beverage',   100, 1,  24, 0,  '250ml','🍊'),
  ('Chá Verde',                         'beverage',   2,   0,  0,  0,  '200ml','🍵'),
  ('Café com Leite Desnatado',          'beverage',   45,  4,  6,  1,  '200ml','☕️'),
  ('Suco Verde (couve+limão+maçã)',     'beverage',   70,  2,  14, 0,  '300ml','🥒'),
  ('Água de Coco',                      'beverage',   45,  0,  10, 0,  '200ml','🥥'),
  ('Whey Isolado Baunilha',             'supplement', 110, 25, 1,  0,  '28g',  '🥛'),
  ('Creatina Monohidratada',            'supplement', 0,   0,  0,  0,  '5g',   '💊'),
  ('BCAA',                              'supplement', 20,  4,  1,  0,  '7g',   '💊'),
  ('Pré-Treino',                        'supplement', 15,  0,  3,  0,  '12g',  '⚡️'),
  ('Hipercalórico Mass',                'supplement', 380, 25, 65, 4,  '100g', '🥤'),
  ('Albumina pura',                     'supplement', 80,  18, 1,  0,  '20g',  '🥚'),
  ('Vitamina D3 5000UI',                'supplement', 0,   0,  0,  0,  '1 cap','☀️'),
  ('Ômega 3 1000mg',                    'supplement', 9,   0,  0,  1,  '1 cap','🐟'),
  ('Multivitamínico',                   'supplement', 0,   0,  0,  0,  '1 cap','💎'),
  ('Magnésio Quelato',                  'supplement', 0,   0,  0,  0,  '1 cap','💊'),
  ('Cenoura',                           'vegetable',  35,  1,  8,  0,  '100g', '🥕'),
  ('Tomate',                            'vegetable',  20,  1,  4,  0,  '100g', '🍅'),
  ('Couve refogada',                    'vegetable',  60,  3,  10, 2,  '100g', '🥬'),
  ('Espinafre',                         'vegetable',  25,  3,  3,  0,  '100g', '🥬'),
  ('Beterraba',                         'vegetable',  43,  2,  10, 0,  '100g', '🥬'),
  ('Pepino',                            'vegetable',  15,  1,  3,  0,  '100g', '🥒'),
  ('Mamão Papaia',                      'fruit',      45,  1,  11, 0,  '100g', '🥭'),
  ('Morango (10 un)',                   'fruit',      35,  1,  8,  0,  '100g', '🍓'),
  ('Mirtilo',                           'fruit',      57,  1,  14, 0,  '100g', '🫐'),
  ('Abacaxi',                           'fruit',      50,  1,  13, 0,  '100g', '🍍'),
  ('Manga',                             'fruit',      60,  1,  15, 0,  '100g', '🥭'),
  ('Lentilha cozida',                   'legume',     115, 9,  20, 0,  '100g', '🥣'),
  ('Grão de bico cozido',               'legume',     165, 9,  27, 3,  '100g', '🥣'),
  ('Ervilha cozida',                    'legume',     85,  5,  15, 0,  '100g', '🌱'),
  ('Soja em grão',                      'legume',     175, 16, 9,  9,  '100g', '🌱'),
  ('Tofu firme',                        'legume',     145, 16, 4,  8,  '100g', '⬜'),
  ('Barra de Proteína Cookies',         'snack',      180, 15, 18, 6,  '60g',  '🍫'),
  ('Chocolate 70%',                     'snack',      170, 2,  13, 12, '30g',  '🍫'),
  ('Mel',                               'sweetener',  60,  0,  17, 0,  '20g',  '🍯'),
  ('Azeite Extra Virgem',               'fat',        120, 0,  0,  14, '15ml', '🫒'),
  ('Manteiga ghee',                     'fat',        110, 0,  0,  12, '13g',  '🧈'),
  ('Linhaça moída',                     'fat',        55,  2,  3,  4,  '10g',  '🌰'),
  ('Chia',                              'fat',        50,  2,  4,  3,  '10g',  '⚫'),
  ('Pão sírio integral',                'cereal',     120, 4,  22, 2,  '50g',  '🍞'),
  ('Wrap de frango',                    'mixed',      350, 30, 32, 11, '200g', '🌯'),
  ('Tapioca recheada com frango',       'mixed',      320, 26, 38, 6,  '180g', '⚪')
) as t(name, category, kcal, protein_g, carbs_g, fat_g, serving_size, emoji)
where not exists (
  select 1 from public.food_bank fb where fb.name = t.name
);
