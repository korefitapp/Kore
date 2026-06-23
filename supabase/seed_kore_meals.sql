-- Script de Seed: 8 Modelos KORE com Refeições e Itens Reais.
-- Copie este conteúdo e rode no SQL Editor do Supabase.

-- 1. Criar a tabela meals
CREATE TABLE IF NOT EXISTS public.meals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id uuid REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  time text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar a tabela meal_items
CREATE TABLE IF NOT EXISTS public.meal_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id uuid REFERENCES public.meals(id) ON DELETE CASCADE,
  food_id uuid, -- Opcional, caso tenha vínculo com o food_bank
  food_name text NOT NULL,
  quantity_g numeric NOT NULL,
  kcal numeric NOT NULL,
  protein_g numeric NOT NULL,
  carbs_g numeric NOT NULL,
  fat_g numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- (Opcional) Habilitar RLS nas novas tabelas, se quiser segurança refinada, 
-- mas como elas derivam do meal_plan (que já tem RLS), podemos deixar sem RLS explícito 
-- ou criar políticas baseadas no meal_plan. Por enquanto, as actions usam service_role ou ignoram RLS nelas.

DO $$ 
DECLARE 
    v_plan_id uuid;
    v_meal_id uuid;
BEGIN
    -- ====================================================================================
    -- 1. Hipertrofia Avançada — 3000 kcal | 6 refeições | C: 375g | P: 225g | G: 83g
    -- ====================================================================================
    SELECT id INTO v_plan_id FROM public.meal_plans WHERE title = 'Dieta Hipertrofia Avançada — 3000 kcal' AND is_global_template = true LIMIT 1;
    IF v_plan_id IS NOT NULL THEN
        DELETE FROM public.meals WHERE meal_plan_id = v_plan_id;
        
        -- Refeição 1 (07:00) | C: 65 | P: 35 | G: 20
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Café da Manhã', '07:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Ovos Inteiros (3 unid.)', 150, 235, 18, 1, 15),
        (v_meal_id, 'Aveia em Flocos', 80, 305, 11, 54, 5),
        (v_meal_id, 'Banana Prata (1 unid.)', 100, 40, 1, 10, 0),
        (v_meal_id, 'Whey Protein Concentrado', 15, 60, 5, 0, 0); -- Ajuda no sabor da aveia

        -- Refeição 2 (10:00) | C: 60 | P: 30 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche da Manhã', '10:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Pão de Forma Integral', 100, 250, 10, 45, 3),
        (v_meal_id, 'Peito de Frango Desfiado', 70, 115, 20, 0, 2),
        (v_meal_id, 'Pasta de Amendoim', 20, 120, 0, 15, 10);

        -- Refeição 3 (13:00) | C: 80 | P: 50 | G: 13
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Almoço', '13:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Arroz Branco Cozido', 250, 325, 6, 70, 0),
        (v_meal_id, 'Feijão Carioca', 100, 75, 5, 10, 0),
        (v_meal_id, 'Patinho Grelhado', 120, 215, 39, 0, 8),
        (v_meal_id, 'Azeite de Oliva', 5, 45, 0, 0, 5);

        -- Refeição 4 (16:00) Pré-Treino | C: 70 | P: 35 | G: 5
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche da Tarde (Pré-Treino)', '16:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Batata Doce Cozida', 250, 215, 4, 50, 0),
        (v_meal_id, 'Peito de Frango Grelhado', 100, 165, 31, 0, 3),
        (v_meal_id, 'Suco de Uva Integral', 150, 80, 0, 20, 2);

        -- Refeição 5 (19:00) Pós-Treino | C: 70 | P: 40 | G: 5
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Jantar (Pós-Treino)', '19:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Macarrão Integral Cozido', 200, 250, 8, 50, 2),
        (v_meal_id, 'Patinho Moído', 100, 180, 32, 0, 3),
        (v_meal_id, 'Molho de Tomate Natural', 100, 40, 0, 20, 0);

        -- Refeição 6 (22:00) Ceia | C: 30 | P: 35 | G: 25
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Ceia', '22:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Iogurte Natural Desnatado', 150, 60, 6, 10, 0),
        (v_meal_id, 'Whey Protein Isolado', 30, 115, 27, 2, 0),
        (v_meal_id, 'Abacate', 100, 160, 2, 8, 15),
        (v_meal_id, 'Nozes', 15, 100, 0, 10, 10);
    END IF;

    -- ====================================================================================
    -- 2. Emagrecimento Sustentável — 1800 kcal | 5 refeições | C: 180g | P: 150g | G: 50g
    -- ====================================================================================
    SELECT id INTO v_plan_id FROM public.meal_plans WHERE title = 'Emagrecimento Sustentável — 1800 kcal' AND is_global_template = true LIMIT 1;
    IF v_plan_id IS NOT NULL THEN
        DELETE FROM public.meals WHERE meal_plan_id = v_plan_id;
        
        -- Refeição 1 (08:00) | C: 40 | P: 30 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Café da Manhã', '08:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Ovos Mexidos (2 unid.)', 100, 155, 13, 1, 11),
        (v_meal_id, 'Pão Francês Integral', 50, 140, 5, 25, 2),
        (v_meal_id, 'Mamão Papaya', 150, 60, 1, 14, 0),
        (v_meal_id, 'Queijo Cottage', 80, 75, 11, 0, 2);

        -- Refeição 2 (11:00) | C: 20 | P: 20 | G: 5
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche Rápido', '11:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Iogurte Grego Zero', 100, 55, 10, 4, 0),
        (v_meal_id, 'Maçã', 100, 52, 0, 16, 0),
        (v_meal_id, 'Whey Protein', 15, 60, 10, 0, 5);

        -- Refeição 3 (13:30) | C: 50 | P: 40 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Almoço', '13:30') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Arroz Integral', 120, 140, 3, 30, 1),
        (v_meal_id, 'Feijão Preto', 80, 60, 4, 11, 0),
        (v_meal_id, 'Peito de Frango Grelhado', 100, 165, 31, 0, 3),
        (v_meal_id, 'Azeite Extra Virgem', 6, 54, 0, 0, 6),
        (v_meal_id, 'Mix de Folhas Verdes', 100, 20, 2, 9, 0);

        -- Refeição 4 (17:00) | C: 40 | P: 25 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche da Tarde', '17:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Aveia em Flocos', 40, 150, 6, 26, 3),
        (v_meal_id, 'Whey Protein Concentrado', 25, 100, 19, 2, 2),
        (v_meal_id, 'Morango', 100, 30, 0, 7, 0),
        (v_meal_id, 'Chia', 15, 75, 0, 5, 5);

        -- Refeição 5 (20:30) | C: 30 | P: 35 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Jantar', '20:30') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Batata Inglesa Cozida', 150, 130, 3, 30, 0),
        (v_meal_id, 'Filé de Tilápia', 130, 145, 32, 0, 2),
        (v_meal_id, 'Azeite de Oliva', 8, 72, 0, 0, 8);
    END IF;

    -- ====================================================================================
    -- 3. Definição Muscular — 2200 kcal | 6 refeições | C: 200g | P: 210g | G: 60g
    -- ====================================================================================
    SELECT id INTO v_plan_id FROM public.meal_plans WHERE title = 'Definição Muscular — 2200 kcal' AND is_global_template = true LIMIT 1;
    IF v_plan_id IS NOT NULL THEN
        DELETE FROM public.meals WHERE meal_plan_id = v_plan_id;
        
        -- Refeição 1 (07:00) | C: 30 | P: 35 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Café da Manhã', '07:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Ovos (1 inteiro, 3 claras)', 150, 135, 17, 1, 6),
        (v_meal_id, 'Tapioca', 50, 120, 0, 29, 0),
        (v_meal_id, 'Whey Protein Isolado', 20, 75, 18, 0, 0),
        (v_meal_id, 'Queijo Minas Frescal Light', 30, 45, 0, 0, 4);

        -- Refeição 2 (10:00) | C: 25 | P: 35 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche', '10:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Whey Protein', 40, 160, 32, 4, 3),
        (v_meal_id, 'Banana', 100, 90, 1, 21, 0),
        (v_meal_id, 'Pasta de Amendoim', 15, 90, 2, 0, 7);

        -- Refeição 3 (13:00) | C: 50 | P: 45 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Almoço', '13:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Arroz Integral', 150, 180, 4, 38, 2),
        (v_meal_id, 'Feijão', 80, 60, 4, 12, 0),
        (v_meal_id, 'Peito de Frango', 120, 198, 37, 0, 4),
        (v_meal_id, 'Azeite', 4, 36, 0, 0, 4);

        -- Refeição 4 (16:00) | C: 40 | P: 35 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche da Tarde', '16:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Pão de Forma Integral', 50, 120, 5, 20, 2),
        (v_meal_id, 'Frango Desfiado', 100, 160, 30, 0, 3),
        (v_meal_id, 'Maçã', 100, 55, 0, 20, 0),
        (v_meal_id, 'Azeite', 5, 45, 0, 0, 5);

        -- Refeição 5 (19:00) | C: 40 | P: 40 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Jantar', '19:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Batata Doce', 150, 130, 2, 30, 0),
        (v_meal_id, 'Patinho', 120, 215, 38, 0, 8),
        (v_meal_id, 'Brócolis', 200, 50, 0, 10, 0),
        (v_meal_id, 'Azeite', 2, 18, 0, 0, 2);

        -- Refeição 6 (22:00) | C: 15 | P: 20 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Ceia', '22:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Whey Protein', 25, 100, 20, 2, 2),
        (v_meal_id, 'Morango', 100, 30, 0, 13, 0),
        (v_meal_id, 'Amêndoas', 15, 85, 0, 0, 8);
    END IF;

    -- ====================================================================================
    -- 4. Sem Lactose + Low FODMAP — 2000 kcal | 5 refeições | C: 230g | P: 140g | G: 62g
    -- ====================================================================================
    SELECT id INTO v_plan_id FROM public.meal_plans WHERE title = 'Sem Lactose + Low FODMAP — 2000 kcal' AND is_global_template = true LIMIT 1;
    IF v_plan_id IS NOT NULL THEN
        DELETE FROM public.meals WHERE meal_plan_id = v_plan_id;
        
        -- Refeição 1 (08:00) | C: 50 | P: 25 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Café da Manhã', '08:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Ovos Mexidos (3 unid.)', 150, 235, 18, 1, 15),
        (v_meal_id, 'Tapioca', 80, 190, 0, 46, 0),
        (v_meal_id, 'Peito de Peru', 30, 35, 7, 3, 0);

        -- Refeição 2 (11:00) | C: 30 | P: 20 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche', '11:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Proteína de Ervilha (Vegan)', 25, 100, 20, 2, 1),
        (v_meal_id, 'Banana (Pouco Madura)', 100, 90, 0, 23, 0),
        (v_meal_id, 'Leite de Amêndoas Zero', 200, 40, 0, 5, 9);

        -- Refeição 3 (13:30) | C: 60 | P: 35 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Almoço', '13:30') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Arroz Branco', 150, 195, 4, 43, 0),
        (v_meal_id, 'Frango Grelhado', 100, 165, 31, 0, 3),
        (v_meal_id, 'Cenoura e Abobrinha Cozida', 150, 50, 0, 17, 0),
        (v_meal_id, 'Azeite', 12, 108, 0, 0, 12);

        -- Refeição 4 (17:00) | C: 45 | P: 25 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche da Tarde', '17:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Aveia em Flocos (Sem Glúten)', 60, 220, 8, 40, 4),
        (v_meal_id, 'Proteína de Carne', 20, 80, 17, 0, 1),
        (v_meal_id, 'Mirtilos', 50, 30, 0, 5, 0),
        (v_meal_id, 'Semente de Abóbora', 10, 55, 0, 0, 5);

        -- Refeição 5 (20:30) | C: 45 | P: 35 | G: 12
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Jantar', '20:30') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Batata Inglesa', 200, 160, 3, 35, 0),
        (v_meal_id, 'Tilápia', 130, 145, 32, 0, 2),
        (v_meal_id, 'Espinafre Refogado', 100, 30, 0, 10, 0),
        (v_meal_id, 'Azeite', 10, 90, 0, 0, 10);
    END IF;

    -- ====================================================================================
    -- 5. Hipertrofia Iniciante — 2600 kcal | 5 refeições | C: 310g | P: 190g | G: 72g
    -- ====================================================================================
    SELECT id INTO v_plan_id FROM public.meal_plans WHERE title = 'Hipertrofia Iniciante — 2600 kcal' AND is_global_template = true LIMIT 1;
    IF v_plan_id IS NOT NULL THEN
        DELETE FROM public.meals WHERE meal_plan_id = v_plan_id;
        
        -- Refeição 1 (08:00) | C: 70 | P: 35 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Café da Manhã', '08:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Ovos (2 inteiros)', 100, 155, 12, 1, 11),
        (v_meal_id, 'Pão de Forma Integral (3 fatias)', 75, 180, 8, 30, 3),
        (v_meal_id, 'Whey Protein', 20, 80, 15, 0, 1),
        (v_meal_id, 'Maçã', 200, 110, 0, 39, 0);

        -- Refeição 2 (12:30) | C: 80 | P: 45 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Almoço', '12:30') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Arroz Branco', 200, 260, 5, 56, 0),
        (v_meal_id, 'Feijão', 120, 90, 6, 18, 0),
        (v_meal_id, 'Frango Grelhado', 110, 180, 34, 0, 3),
        (v_meal_id, 'Azeite', 12, 108, 0, 6, 12);

        -- Refeição 3 (16:00) | C: 60 | P: 35 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche da Tarde', '16:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Aveia em Flocos', 60, 230, 9, 40, 4),
        (v_meal_id, 'Whey Protein', 30, 120, 24, 3, 2),
        (v_meal_id, 'Banana', 80, 70, 0, 17, 0),
        (v_meal_id, 'Pasta de Amendoim', 20, 120, 2, 0, 9);

        -- Refeição 4 (20:00) | C: 70 | P: 45 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Jantar', '20:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Macarrão Integral', 200, 250, 8, 50, 2),
        (v_meal_id, 'Patinho', 120, 215, 37, 20, 8),
        (v_meal_id, 'Azeite', 5, 45, 0, 0, 5);

        -- Refeição 5 (22:30) | C: 30 | P: 30 | G: 12
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Ceia', '22:30') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Iogurte Natural', 200, 80, 8, 10, 0),
        (v_meal_id, 'Whey Protein', 25, 100, 22, 0, 2),
        (v_meal_id, 'Uva', 100, 70, 0, 20, 0),
        (v_meal_id, 'Castanha de Caju', 20, 110, 0, 0, 10);
    END IF;

    -- ====================================================================================
    -- 6. Emagrecimento Express — 1500 kcal | 4 refeições | C: 140g | P: 130g | G: 45g
    -- ====================================================================================
    SELECT id INTO v_plan_id FROM public.meal_plans WHERE title = 'Emagrecimento Express — 1500 kcal' AND is_global_template = true LIMIT 1;
    IF v_plan_id IS NOT NULL THEN
        DELETE FROM public.meals WHERE meal_plan_id = v_plan_id;
        
        -- Refeição 1 (08:00) | C: 35 | P: 30 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Café da Manhã', '08:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Ovos (2 inteiros)', 100, 155, 13, 1, 11),
        (v_meal_id, 'Mamão', 150, 60, 0, 15, 0),
        (v_meal_id, 'Whey Protein', 20, 80, 17, 19, 4);

        -- Refeição 2 (13:00) | C: 45 | P: 35 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Almoço', '13:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Arroz Integral', 100, 110, 3, 23, 1),
        (v_meal_id, 'Feijão', 50, 40, 2, 8, 0),
        (v_meal_id, 'Frango Grelhado', 100, 165, 30, 14, 3),
        (v_meal_id, 'Azeite', 6, 54, 0, 0, 6);

        -- Refeição 3 (17:00) | C: 30 | P: 30 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche', '17:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Iogurte Grego Light', 150, 80, 12, 6, 0),
        (v_meal_id, 'Whey Protein', 20, 80, 18, 24, 2),
        (v_meal_id, 'Nozes', 12, 80, 0, 0, 8);

        -- Refeição 4 (20:00) | C: 30 | P: 35 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Jantar', '20:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Batata Doce', 100, 90, 1, 20, 0),
        (v_meal_id, 'Tilápia', 130, 145, 34, 10, 2),
        (v_meal_id, 'Azeite', 8, 72, 0, 0, 8);
    END IF;

    -- ====================================================================================
    -- 7. Restrição: Diabetes Tipo 2 — 1900 kcal | 6 refeições | C: 160g | P: 155g | G: 65g
    -- ====================================================================================
    SELECT id INTO v_plan_id FROM public.meal_plans WHERE title = 'Restrição: Diabetes Tipo 2 — 1900 kcal' AND is_global_template = true LIMIT 1;
    IF v_plan_id IS NOT NULL THEN
        DELETE FROM public.meals WHERE meal_plan_id = v_plan_id;
        
        -- Refeição 1 (07:00) | C: 25 | P: 25 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Café da Manhã', '07:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Ovos (2 inteiros)', 100, 155, 13, 1, 11),
        (v_meal_id, 'Pão 100% Integral', 50, 120, 5, 24, 2),
        (v_meal_id, 'Queijo Branco Light', 30, 45, 7, 0, 2);

        -- Refeição 2 (10:00) | C: 20 | P: 25 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche da Manhã', '10:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Whey Protein Isolado', 25, 100, 22, 0, 1),
        (v_meal_id, 'Maçã Verde', 120, 60, 0, 15, 0),
        (v_meal_id, 'Amêndoas', 15, 85, 3, 5, 9);

        -- Refeição 3 (13:00) | C: 40 | P: 35 | G: 15
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Almoço', '13:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Feijão Preto', 120, 90, 6, 18, 0),
        (v_meal_id, 'Quinoa', 50, 60, 2, 12, 1),
        (v_meal_id, 'Peito de Frango', 100, 165, 27, 10, 3),
        (v_meal_id, 'Azeite', 11, 100, 0, 0, 11);

        -- Refeição 4 (16:00) | C: 25 | P: 20 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche da Tarde', '16:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Iogurte Natural Zero', 150, 60, 8, 8, 0),
        (v_meal_id, 'Chia', 15, 75, 3, 5, 5),
        (v_meal_id, 'Morango', 150, 45, 1, 12, 0),
        (v_meal_id, 'Pasta de Amendoim', 10, 60, 8, 0, 5);

        -- Refeição 5 (19:00) | C: 35 | P: 35 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Jantar', '19:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Batata Doce', 100, 90, 1, 20, 0),
        (v_meal_id, 'Salmão Grelhado', 100, 200, 22, 0, 8),
        (v_meal_id, 'Brócolis', 200, 50, 4, 15, 0),
        (v_meal_id, 'Azeite', 2, 18, 0, 0, 2);

        -- Refeição 6 (22:00) | C: 15 | P: 15 | G: 5
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Ceia', '22:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Ovo (1 inteiro)', 50, 75, 6, 0, 5),
        (v_meal_id, 'Clara de Ovo (3 unid)', 90, 45, 9, 15, 0);
    END IF;

    -- ====================================================================================
    -- 8. Definição Feminina — 1700 kcal | 5 refeições | C: 155g | P: 135g | G: 52g
    -- ====================================================================================
    SELECT id INTO v_plan_id FROM public.meal_plans WHERE title = 'Definição Feminina — 1700 kcal' AND is_global_template = true LIMIT 1;
    IF v_plan_id IS NOT NULL THEN
        DELETE FROM public.meals WHERE meal_plan_id = v_plan_id;
        
        -- Refeição 1 (08:00) | C: 35 | P: 25 | G: 12
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Café da Manhã', '08:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Ovos Mexidos (2 unid.)', 100, 155, 12, 1, 11),
        (v_meal_id, 'Tapioca', 60, 140, 0, 34, 0),
        (v_meal_id, 'Whey Protein', 15, 60, 13, 0, 1);

        -- Refeição 2 (11:00) | C: 20 | P: 20 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche', '11:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Iogurte Grego Light', 100, 60, 10, 4, 0),
        (v_meal_id, 'Whey Protein', 12, 50, 10, 16, 0),
        (v_meal_id, 'Castanha do Pará', 15, 100, 0, 0, 10);

        -- Refeição 3 (13:30) | C: 45 | P: 35 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Almoço', '13:30') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Arroz Integral', 100, 110, 3, 23, 1),
        (v_meal_id, 'Feijão', 80, 60, 4, 12, 0),
        (v_meal_id, 'Frango Grelhado', 100, 165, 28, 10, 3),
        (v_meal_id, 'Azeite', 6, 54, 0, 0, 6);

        -- Refeição 4 (17:00) | C: 35 | P: 25 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Lanche da Tarde', '17:00') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Aveia', 40, 150, 6, 25, 3),
        (v_meal_id, 'Whey Protein', 25, 100, 19, 10, 2),
        (v_meal_id, 'Pasta de Amendoim', 10, 60, 0, 0, 5);

        -- Refeição 5 (20:30) | C: 20 | P: 30 | G: 10
        INSERT INTO public.meals (meal_plan_id, name, time) VALUES (v_plan_id, 'Jantar', '20:30') RETURNING id INTO v_meal_id;
        INSERT INTO public.meal_items (meal_id, food_name, quantity_g, kcal, protein_g, carbs_g, fat_g) VALUES 
        (v_meal_id, 'Legumes Assados', 150, 60, 2, 20, 0),
        (v_meal_id, 'Patinho', 100, 180, 28, 0, 5),
        (v_meal_id, 'Azeite', 5, 45, 0, 0, 5);
    END IF;

END $$;
