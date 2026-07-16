-- Migração 0011_workout_logs.sql

CREATE TABLE public.workout_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_name TEXT,
    completed_at TIMESTAMPTZ DEFAULT now(),
    duration_min INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY Clientes podem inserir seus próprios logs 
    ON public.workout_logs 
    FOR INSERT 
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY Clientes podem ver seus próprios logs 
    ON public.workout_logs 
    FOR SELECT 
    USING (auth.uid() = client_id);

CREATE POLICY Profissionais podem ver logs dos seus clientes 
    ON public.workout_logs 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.professional_clients pc 
            WHERE pc.client_id = workout_logs.client_id 
            AND pc.professional_id = auth.uid()
        )
    );
