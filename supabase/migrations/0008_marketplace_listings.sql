-- Criar a tabela listings se não existir
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    total_sales INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Politica: Qualquer um pode ler listings publicadas
DROP POLICY IF EXISTS "Qualquer pessoa pode ler anúncios publicados" ON public.listings;
CREATE POLICY "Qualquer pessoa pode ler anúncios publicados"
    ON public.listings FOR SELECT
    USING (status = 'published');

-- Politica: Vendedores podem gerenciar seus próprios anúncios
DROP POLICY IF EXISTS "Vendedores podem gerenciar seus anúncios" ON public.listings;
CREATE POLICY "Vendedores podem gerenciar seus anúncios"
    ON public.listings FOR ALL
    USING (auth.uid() = seller_id);

-- Criar a conta loja@kore.test no Auth e Profiles (Seed)
DO $$
DECLARE
    seller_uid UUID;
BEGIN
    -- Verifica se o usuário auth existe
    SELECT id INTO seller_uid FROM auth.users WHERE email = 'loja@kore.test';
    
    IF seller_uid IS NULL THEN
        -- Cria ID
        seller_uid := gen_random_uuid();
        
        -- Insere no auth.users com a senha "Kore123!"
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            seller_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'loja@kore.test', crypt('Kore123!', gen_salt('bf')), now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Loja Suplementos Norte"}', now(), now()
        );
        
        -- Insere no profiles
        INSERT INTO public.profiles (id, full_name, role, status)
        VALUES (seller_uid, 'Loja Suplementos Norte', 'merchant', 'active')
        ON CONFLICT (id) DO UPDATE SET role = 'merchant';
    END IF;

    -- Deletar produtos anteriores da loja (se houver, para evitar duplicação no seed)
    DELETE FROM public.listings WHERE seller_id = seller_uid;

    -- Inserir os produtos conforme o Mock, atribuindo-os ao lojista com vendas = 0
    INSERT INTO public.listings (seller_id, product_name, category, price, total_sales, status) VALUES
    (seller_uid, 'Whey Protein Isolado 1kg', 'Suplementos', 149.90, 0, 'published'),
    (seller_uid, 'Plano de Treino - Hipertrofia 12sem', 'Treinos', 197.00, 0, 'published'),
    (seller_uid, 'Plano Alimentar Cutting 8sem', 'Planos Alimentares', 249.00, 0, 'published'),
    (seller_uid, 'Creatina Monohidratada 300g', 'Suplementos', 89.90, 0, 'published'),
    (seller_uid, 'Consultoria Online - 4 semanas', 'Consultoria', 349.00, 0, 'paused'),
    (seller_uid, 'Plano Alimentar Ganho de Massa', 'Planos Alimentares', 179.00, 0, 'published'),
    (seller_uid, 'Kit Faixas Elásticas Pro', 'Acessórios', 129.90, 0, 'banned'),
    (seller_uid, 'Treino Funcional - Iniciantes', 'Treinos', 97.00, 0, 'published');

END $$;
