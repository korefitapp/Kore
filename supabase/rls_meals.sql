-- Habilitar RLS nas tabelas filhas
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas caso existam para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura de meals" ON public.meals;
DROP POLICY IF EXISTS "Permitir leitura de meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Permitir modificação de meals pelo dono" ON public.meals;
DROP POLICY IF EXISTS "Permitir modificação de meal_items pelo dono" ON public.meal_items;

-- 1. Políticas de SELECT (Leitura)
-- Permite ler refeições se pertencerem ao utilizador logado, ao paciente logado OU se for um template global
CREATE POLICY "Permitir leitura de meals" 
ON public.meals FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans mp 
    WHERE mp.id = meals.meal_plan_id 
    AND (mp.nutritionist_id = auth.uid() OR mp.patient_id = auth.uid() OR mp.is_global_template = true)
  )
);

CREATE POLICY "Permitir leitura de meal_items" 
ON public.meal_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.meals m
    JOIN public.meal_plans mp ON m.meal_plan_id = mp.id
    WHERE m.id = meal_items.meal_id 
    AND (mp.nutritionist_id = auth.uid() OR mp.patient_id = auth.uid() OR mp.is_global_template = true)
  )
);

-- 2. Políticas de ALL (Insert, Update, Delete)
-- Apenas o dono do cardápio pode editar/criar/deletar refeições e itens
CREATE POLICY "Permitir modificação de meals pelo dono" 
ON public.meals FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans mp 
    WHERE mp.id = meals.meal_plan_id 
    AND mp.nutritionist_id = auth.uid()
  )
);

CREATE POLICY "Permitir modificação de meal_items pelo dono" 
ON public.meal_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.meals m
    JOIN public.meal_plans mp ON m.meal_plan_id = mp.id
    WHERE m.id = meal_items.meal_id 
    AND mp.nutritionist_id = auth.uid()
  )
);
