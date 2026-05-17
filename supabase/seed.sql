-- Seed opcional para dev local.
-- Crie primeiro um usuário em http://localhost:54323 (Supabase Studio > Authentication)
-- e ajuste o UUID abaixo se quiser pré-popular dados.

-- exemplo:
-- update public.profiles
--   set full_name = 'Ana Souza', role = 'client'
--   where id = '00000000-0000-0000-0000-000000000000';

-- Promover alguém a admin (manual — admin nunca é setado via signup):
-- update public.profiles set role = 'admin'
--   where id = '00000000-0000-0000-0000-000000000000';
