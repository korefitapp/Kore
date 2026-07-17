-- Adicionando coluna de carga (weight) para exercícios
ALTER TABLE public.workout_day_exercises
ADD COLUMN IF NOT EXISTS weight TEXT;
