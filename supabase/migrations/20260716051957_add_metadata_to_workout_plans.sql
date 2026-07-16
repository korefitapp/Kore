ALTER TABLE public.workout_plans
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
