-- Criar função para calcular a distância em km (Fórmula de Haversine)
CREATE OR REPLACE FUNCTION get_nearby_trainers(user_lat float, user_lng float, max_dist_km float DEFAULT 50)
RETURNS TABLE (
  id uuid,
  full_name text,
  metadata jsonb,
  distance_km float
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.metadata,
    -- Haversine formula calculation in kilometers
    (6371 * acos(
      cos(radians(user_lat)) * cos(radians((p.metadata->>'lat')::float)) *
      cos(radians((p.metadata->>'lng')::float) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians((p.metadata->>'lat')::float))
    )) AS distance_km
  FROM public.profiles p
  WHERE p.role = 'trainer'
    AND p.metadata->>'lat' IS NOT NULL
    AND p.metadata->>'lng' IS NOT NULL
  HAVING (6371 * acos(
      cos(radians(user_lat)) * cos(radians((p.metadata->>'lat')::float)) *
      cos(radians((p.metadata->>'lng')::float) - radians(user_lng)) +
      sin(radians(user_lat)) * sin(radians((p.metadata->>'lat')::float))
    )) <= max_dist_km
  ORDER BY distance_km ASC;
END;
$$;

-- Inserir alguns treinadores mockados no auth.users e profiles
DO $$
DECLARE
    trainer1_id UUID := gen_random_uuid();
    trainer2_id UUID := gen_random_uuid();
    trainer3_id UUID := gen_random_uuid();
BEGIN
    -- Ricardo Almeida
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (trainer1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ricardo@kore.test', crypt('Kore123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Ricardo Almeida"}', now(), now());
    
    INSERT INTO public.profiles (id, full_name, role, status, metadata)
    VALUES (trainer1_id, 'Ricardo Almeida', 'trainer', 'active', '{"lat": -23.5505, "lng": -46.6333, "specialty": "Hipertrofia & Força", "rating": 4.9, "avatarInitials": "RA"}');

    -- Juliana Silva
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (trainer2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'juliana@kore.test', crypt('Kore123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Juliana Silva"}', now(), now());
    
    INSERT INTO public.profiles (id, full_name, role, status, metadata)
    VALUES (trainer2_id, 'Juliana Silva', 'trainer', 'active', '{"lat": -23.5605, "lng": -46.6433, "specialty": "Emagrecimento & HIIT", "rating": 4.8, "avatarInitials": "JS"}');

    -- Marcos Torres
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (trainer3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marcos@kore.test', crypt('Kore123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Marcos Torres"}', now(), now());
    
    INSERT INTO public.profiles (id, full_name, role, status, metadata)
    VALUES (trainer3_id, 'Marcos Torres', 'trainer', 'active', '{"lat": -23.5405, "lng": -46.6233, "specialty": "Reabilitação & Core", "rating": 5.0, "avatarInitials": "MT"}');
END $$;
