-- Migration 0004_personal_dashboard.sql

-- 1. Relacionamento Aluno <> Profissional
CREATE TABLE public.professional_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.user_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(professional_id, client_id)
);

ALTER TABLE public.professional_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profs veem clientes" ON public.professional_clients FOR SELECT USING (auth.uid() = professional_id);
CREATE POLICY "Clientes veem profs" ON public.professional_clients FOR SELECT USING (auth.uid() = client_id);

-- 2. Planos de Treino
CREATE TABLE public.workout_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainers gerenciam treinos" ON public.workout_plans FOR ALL USING (auth.uid() = trainer_id);
CREATE POLICY "Clientes veem treinos" ON public.workout_plans FOR SELECT USING (auth.uid() = client_id);

-- 3. Agenda (Appointments)
CREATE TABLE public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profs gerenciam agenda" ON public.appointments FOR ALL USING (auth.uid() = professional_id);
CREATE POLICY "Clientes veem agenda" ON public.appointments FOR SELECT USING (auth.uid() = client_id);

-- 4. Financeiro (Transactions)
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    type TEXT DEFAULT 'income',
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profs veem transacoes" ON public.transactions FOR SELECT USING (auth.uid() = professional_id);

-- 5. Mensagens (Chat)
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Veem mensagens" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Enviam mensagens" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
