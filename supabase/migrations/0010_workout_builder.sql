-- Migração para estruturar o Workout Builder Completo

-- 1. workout_days (Divisão de treinos. Ex: Treino A, Treino B)
CREATE TABLE public.workout_days (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. workout_day_exercises (Exercícios dentro de cada dia)
CREATE TABLE public.workout_day_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_day_id UUID NOT NULL REFERENCES public.workout_days(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL DEFAULT 0,
    sets INTEGER,
    reps TEXT,
    rest_time TEXT,
    technique TEXT,
    observation TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_day_exercises ENABLE ROW LEVEL SECURITY;

-- Políticas para workout_days
CREATE POLICY "Leitura global ou pelo dono" 
    ON public.workout_days 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.workouts w 
            WHERE w.id = workout_days.workout_id 
            AND (w.professional_id IS NULL OR w.professional_id = auth.uid())
        )
    );

CREATE POLICY "Modificação pelo dono do treino" 
    ON public.workout_days 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.workouts w 
            WHERE w.id = workout_days.workout_id 
            AND w.professional_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workouts w 
            WHERE w.id = workout_days.workout_id 
            AND w.professional_id = auth.uid()
        )
    );

-- Políticas para workout_day_exercises
CREATE POLICY "Leitura global ou pelo dono dos exercícios" 
    ON public.workout_day_exercises 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_days wd
            JOIN public.workouts w ON w.id = wd.workout_id
            WHERE wd.id = workout_day_exercises.workout_day_id
            AND (w.professional_id IS NULL OR w.professional_id = auth.uid())
        )
    );

CREATE POLICY "Modificação pelo dono dos exercícios" 
    ON public.workout_day_exercises 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.workout_days wd
            JOIN public.workouts w ON w.id = wd.workout_id
            WHERE wd.id = workout_day_exercises.workout_day_id
            AND w.professional_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_days wd
            JOIN public.workouts w ON w.id = wd.workout_id
            WHERE wd.id = workout_day_exercises.workout_day_id
            AND w.professional_id = auth.uid()
        )
    );
