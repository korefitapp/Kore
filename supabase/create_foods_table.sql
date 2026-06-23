-- 1. Criar a Tabela 'foods'
CREATE TABLE IF NOT EXISTS public.foods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  base_amount numeric DEFAULT 100 NOT NULL, -- Geralmente 100g
  kcal numeric NOT NULL,
  protein_g numeric NOT NULL,
  carbs_g numeric NOT NULL,
  fat_g numeric NOT NULL,
  locale text DEFAULT 'pt-BR' NOT NULL, -- Preparado para i18n
  popularity integer DEFAULT 0 NOT NULL, -- Ranquear busca (ex: 100 = uso muito comum)
  created_by uuid REFERENCES auth.users(id), -- NULL = Sistema (TACO)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Segurança RLS
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
-- Qualquer usuário pode ler os alimentos do sistema (created_by IS NULL) e os seus próprios
CREATE POLICY "Permitir leitura de alimentos do sistema e próprios" 
ON public.foods FOR SELECT 
USING (created_by IS NULL OR created_by = auth.uid());

-- O usuário só pode inserir alimentos como sendo dele mesmo
CREATE POLICY "Permitir criação de alimentos próprios" 
ON public.foods FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- O usuário só pode alterar/deletar seus próprios alimentos
CREATE POLICY "Permitir modificação de alimentos próprios" 
ON public.foods FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Permitir deleção de alimentos próprios" 
ON public.foods FOR DELETE 
USING (created_by = auth.uid());
