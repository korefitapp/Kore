-- 1. Criar a tabela meal_plans (caso ainda não exista)
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id uuid REFERENCES auth.users(id),
  patient_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  daily_kcal_goal numeric,
  carbs_g numeric,
  protein_g numeric,
  fat_g numeric,
  objective text,
  meals_count integer DEFAULT 0,
  is_template boolean DEFAULT false,
  is_global_template boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- 3. Criar Políticas de RLS (Policies)
-- Permitir que o nutricionista leia seus próprios cardápios E leia todos os templates globais
CREATE POLICY "Permitir leitura de templates globais e próprios" 
ON public.meal_plans 
FOR SELECT 
USING (
  nutritionist_id = auth.uid() OR is_global_template = true
);

-- Permitir que o nutricionista crie seus próprios cardápios
CREATE POLICY "Permitir criacao pelo nutricionista" 
ON public.meal_plans 
FOR INSERT 
WITH CHECK (
  nutritionist_id = auth.uid()
);

-- Permitir que o nutricionista atualize seus próprios cardápios
CREATE POLICY "Permitir atualizacao pelo nutricionista" 
ON public.meal_plans 
FOR UPDATE 
USING (
  nutritionist_id = auth.uid()
);

-- Permitir que o nutricionista delete seus próprios cardápios
CREATE POLICY "Permitir delecao pelo nutricionista" 
ON public.meal_plans 
FOR DELETE 
USING (
  nutritionist_id = auth.uid()
);

-- 4. Inserir os 8 Modelos Globais Padrão do KORE
INSERT INTO public.meal_plans 
(nutritionist_id, title, description, daily_kcal_goal, carbs_g, protein_g, fat_g, objective, meals_count, is_template, is_global_template)
VALUES 
(NULL, 'Dieta Hipertrofia Avançada — 3000 kcal', 'Plano para ganho de massa muscular com superávit calórico moderado e distribuição otimizada de proteínas.', 3000, 375, 225, 83, 'Hipertrofia', 6, true, true),
(NULL, 'Emagrecimento Sustentável — 1800 kcal', 'Déficit calórico moderado com foco em saciedade e alimentos de alta densidade nutricional.', 1800, 180, 150, 50, 'Emagrecimento', 5, true, true),
(NULL, 'Definição Muscular — 2200 kcal', 'Fase de cutting com preservação de massa magra. Alto teor proteico e carboidratos periodizados.', 2200, 200, 210, 60, 'Definição', 6, true, true),
(NULL, 'Restrição: Sem Lactose + Low FODMAP', 'Cardápio adaptado para pacientes com intolerância à lactose e sensibilidade a FODMAPs.', 2000, 230, 140, 62, 'Restrições', 5, true, true),
(NULL, 'Hipertrofia Iniciante — 2600 kcal', 'Plano introdutório para praticantes iniciantes com progressão gradual de calorias.', 2600, 310, 190, 72, 'Hipertrofia', 5, true, true),
(NULL, 'Emagrecimento Express — 1500 kcal', 'Protocolo de 4 semanas para início de perda de peso com alta aderência e simplicidade nas refeições.', 1500, 140, 130, 45, 'Emagrecimento', 4, true, true),
(NULL, 'Restrição: Diabetes Tipo 2', 'Cardápio com baixo índice glicêmico e controle de carboidratos para pacientes diabéticos.', 1900, 160, 155, 65, 'Restrições', 6, true, true),
(NULL, 'Definição Feminina — 1700 kcal', 'Plano focado em definição muscular para público feminino com ajuste hormonal considerado.', 1700, 155, 135, 52, 'Definição', 5, true, true);

-- Atualiza a API para reconhecer as mudanças
NOTIFY pgrst, 'reload schema';
