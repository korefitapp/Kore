-- Migração para Desmockar Tudo (Appointments, Products e Localização/Mapa)

-- ==========================================
-- 1. Criação da Tabela: appointments
-- ==========================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text NOT NULL DEFAULT 'scheduled',
    modality text NOT NULL,
    focus text,
    professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS e criar policies básicas (permitindo acesso total aos profissionais e leitura aos clientes)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profissionais gerenciam seus appointments" 
ON public.appointments 
FOR ALL 
USING (auth.uid() = professional_id);

CREATE POLICY "Clientes podem ver seus appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() = client_id);

-- ==========================================
-- 2. Criação da Tabela: products
-- ==========================================
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    price numeric NOT NULL,
    original_price numeric,
    stock integer NOT NULL DEFAULT 0,
    category text,
    tags text[],
    image_url text,
    store_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lojistas gerenciam seus produtos" 
ON public.products 
FOR ALL 
USING (auth.uid() = store_id);

CREATE POLICY "Todos os usuários autenticados podem ver produtos" 
ON public.products 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- ==========================================
-- 3. Inserção de Dados (Mock) e Atualização (Geolocalização)
-- ==========================================
DO $$
DECLARE
    v_nutri_id uuid;
    v_personal_id uuid;
    v_shop_id uuid;
    v_client_id uuid;
BEGIN
    -- Pegar IDs de exemplos para popular os dados
    SELECT id INTO v_nutri_id FROM public.profiles WHERE role = 'nutritionist' LIMIT 1;
    SELECT id INTO v_personal_id FROM public.profiles WHERE role = 'trainer' LIMIT 1;
    SELECT id INTO v_shop_id FROM public.profiles WHERE role = 'merchant' LIMIT 1;
    SELECT id INTO v_client_id FROM public.profiles WHERE role = 'client' LIMIT 1;

    -- Inserir appointments se tiver nutricionista
    IF v_nutri_id IS NOT NULL THEN
        -- Consulta para Hoje
        INSERT INTO public.appointments (title, start_time, end_time, status, modality, focus, professional_id, client_id)
        VALUES 
            ('Consulta de Acompanhamento (Exemplo)', now() + interval '2 hours', now() + interval '3 hours', 'scheduled', 'online', 'Avaliação mensal', v_nutri_id, v_client_id),
            ('Reavaliação Completa (Exemplo)', now() + interval '5 hours', now() + interval '6 hours', 'scheduled', 'in-person', 'Bioimpedância', v_nutri_id, v_client_id);
    END IF;

    -- Inserir produtos se tiver lojista
    IF v_shop_id IS NOT NULL THEN
        INSERT INTO public.products (title, description, price, original_price, stock, category, tags, store_id)
        VALUES 
            ('Whey Protein Isolado 900g', 'Proteína de alta qualidade e absorção rápida.', 159.90, 189.90, 50, 'Suplementos', ARRAY['whey', 'proteina'], v_shop_id),
            ('Creatina Monohidratada 300g', 'Aumento de força e volume muscular.', 89.90, 110.00, 25, 'Suplementos', ARRAY['creatina', 'força'], v_shop_id),
            ('Pré-Treino Explosivo 200g', 'Energia extrema para seus treinos mais intensos.', 119.90, 149.90, 10, 'Suplementos', ARRAY['pretreino', 'energia'], v_shop_id),
            ('Camiseta Dry-Fit Treino', 'Tecido respirável e confortável para treinos intensos.', 59.90, NULL, 100, 'Vestuário', ARRAY['roupa', 'treino'], v_shop_id),
            ('Corda de Pular Ajustável', 'Ideal para aquecimento e cardio intenso.', 39.90, NULL, 40, 'Acessórios', ARRAY['cardio', 'acessorio'], v_shop_id);
    END IF;

    -- Atualizar todos os trainers e nutris com uma coordenada de localização (lat/lng realistas em SP por exemplo)
    -- Isso garantirá que a tela de descoberta renderize pinos no mapa
    UPDATE public.profiles 
    SET metadata = jsonb_set(
        jsonb_set(
            COALESCE(metadata, '{}'::jsonb), 
            '{lat}', 
            to_jsonb(-23.550520 + (random() * 0.1 - 0.05)) -- Variação aleatória em torno de SP
        ),
        '{lng}',
        to_jsonb(-46.633308 + (random() * 0.1 - 0.05))
    )
    WHERE role IN ('trainer', 'nutritionist') AND status = 'active';

END $$;
