INSERT INTO profiles (id, full_name, role, status, metadata) VALUES
  ('nutri-001', 'Isabella Almeida', 'nutri', 'active', '{"lat": -23.5355, "lng": -46.6183, "rating": 4.9, "specialty": "Nutrição Esportiva", "avatarInitials": "IA"}'),
  ('nutri-002', 'Gabriel Martins', 'nutri', 'active', '{"lat": -23.5755, "lng": -46.6233, "rating": 4.8, "specialty": "Emagrecimento e Hipertrofia", "avatarInitials": "GM"}'),
  ('nutri-003', 'Mariana Costa', 'nutri', 'active', '{"lat": -23.5205, "lng": -46.6533, "rating": 5.0, "specialty": "Nutrição Comportamental", "avatarInitials": "MC"}'),
  ('nutri-004', 'Lucas Fernandes', 'nutri', 'active', '{"lat": -23.5905, "lng": -46.6683, "rating": 4.7, "specialty": "Nutrição Clínica", "avatarInitials": "LF"}'),
  ('nutri-005', 'Carolina Ribeiro', 'nutri', 'active', '{"lat": -23.5005, "lng": -46.5933, "rating": 4.9, "specialty": "Vegano e Esportivo", "avatarInitials": "CR"}'),
  ('nutri-006', 'Rafael Oliveira', 'nutri', 'active', '{"lat": -23.5605, "lng": -46.6433, "rating": 4.6, "specialty": "Performance e Longevidade", "avatarInitials": "RO"}')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata;
