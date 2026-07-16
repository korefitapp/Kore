-- Migração para criar a tabela de workouts (Biblioteca de Treinos)

CREATE TABLE public.workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    objective TEXT,
    level TEXT,
    description TEXT,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- 1. Qualquer pessoa (ou pelo menos clientes logados/personais) pode ler treinos globais
CREATE POLICY "Treinos globais são públicos para leitura" 
    ON public.workouts 
    FOR SELECT 
    USING (professional_id IS NULL);

-- 2. Personais podem ler, inserir, atualizar e deletar os próprios treinos
CREATE POLICY "Personais gerenciam próprios treinos" 
    ON public.workouts 
    FOR ALL 
    USING (auth.uid() = professional_id)
    WITH CHECK (auth.uid() = professional_id);

-- Opcional: Clientes podem ler os treinos do seu personal (embora geralmente o client receba um workout_plan)
-- Deixaremos isso para o futuro se necessário.
