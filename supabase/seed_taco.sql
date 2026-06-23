-- Inserção de Alimentos TACO (Amostra Inicial e Top 30)
-- IMPORTANTE: Para injetar o JSON completo da TACO (que tem milhares de linhas) 
-- você pode usar uma Edge Function ou um script Node local mapeando o JSON para o Supabase.
-- Por agora, este script contém os TOP alimentos mais buscados com Popularity 100 
-- e mais alguns de representação com Popularity 0.

INSERT INTO public.foods (name, base_amount, kcal, protein_g, carbs_g, fat_g, popularity) VALUES
-- ==========================================
-- TIER 1: MUSCULAÇÃO E ESPORTE (Popularity: 100)
-- ==========================================
('Arroz Branco Cozido', 100, 130, 2.5, 28.1, 0.2, 100),
('Arroz Integral Cozido', 100, 124, 2.6, 25.8, 1.0, 100),
('Feijão Carioca Cozido', 100, 76, 4.8, 13.6, 0.5, 100),
('Feijão Preto Cozido', 100, 77, 4.5, 14.0, 0.5, 100),
('Peito de Frango Grelhado', 100, 165, 31.0, 0.0, 3.6, 100),
('Peito de Frango Desfiado', 100, 163, 31.5, 0.0, 3.2, 100),
('Ovos Inteiros Cozidos', 100, 155, 13.0, 1.1, 11.0, 100),
('Ovo de Galinha Inteiro (1 Unidade - 50g)', 100, 155, 13.0, 1.1, 11.0, 100),
('Aveia em Flocos', 100, 380, 13.9, 66.6, 7.3, 100),
('Aveia em Farelo', 100, 350, 17.0, 60.0, 7.0, 100),
('Batata Doce Cozida', 100, 86, 1.6, 20.1, 0.1, 100),
('Batata Inglesa Cozida', 100, 52, 1.2, 11.9, 0.0, 100),
('Mandioca/Aipim Cozido', 100, 125, 0.6, 30.1, 0.1, 100),
('Whey Protein Concentrado', 100, 400, 70.0, 15.0, 6.0, 100),
('Whey Protein Isolado', 100, 370, 90.0, 3.0, 1.0, 100),
('Pasta de Amendoim Integral', 100, 588, 25.0, 20.0, 49.0, 100),
('Azeite de Oliva Extra Virgem', 100, 884, 0.0, 0.0, 100.0, 100),
('Carne Bovina (Patinho) Grelhado', 100, 219, 35.9, 0.0, 7.3, 100),
('Carne Bovina (Coxão Mole) Grelhado', 100, 219, 32.4, 0.0, 8.9, 100),
('Leite Integral', 100, 60, 3.0, 4.5, 3.0, 100),
('Leite Desnatado', 100, 33, 3.2, 4.5, 0.0, 100),
('Tapioca (Goma Manteiga)', 100, 336, 0.0, 82.0, 0.0, 100),
('Pão Francês', 100, 299, 8.0, 58.6, 3.1, 100),
('Pão de Forma Integral', 100, 253, 9.4, 49.9, 3.7, 100),
('Banana Prata', 100, 89, 1.3, 22.8, 0.1, 100),
('Banana Nanica', 100, 92, 1.4, 23.8, 0.1, 100),
('Maçã com Casca', 100, 52, 0.3, 13.8, 0.2, 100),
('Brócolis Cozido', 100, 25, 2.1, 4.4, 0.5, 100),
('Queijo Mussarela', 100, 330, 22.6, 3.0, 25.2, 100),
('Queijo Minas Frescal', 100, 264, 17.4, 3.2, 20.2, 100),
('Peixe (Tilápia) Grelhada', 100, 128, 26.2, 0.0, 2.6, 100),

-- ==========================================
-- TIER 2: OUTROS ALIMENTOS DA TACO (Popularity: 0)
-- ==========================================
('Abacate', 100, 160, 2.0, 8.5, 14.7, 0),
('Abacaxi', 100, 50, 0.5, 13.1, 0.1, 0),
('Alface Crespa', 100, 15, 1.3, 2.9, 0.2, 0),
('Cenoura Cozida', 100, 35, 0.8, 8.2, 0.2, 0),
('Laranja Pêra', 100, 37, 1.0, 8.9, 0.1, 0),
('Melancia', 100, 30, 0.6, 7.6, 0.2, 0),
('Mamão Papaia', 100, 43, 0.5, 10.8, 0.1, 0),
('Tomate Salada', 100, 18, 0.9, 3.9, 0.2, 0),
('Couve-flor Cozida', 100, 23, 1.9, 4.1, 0.3, 0),
('Macarrão de Sêmola Cozido', 100, 158, 5.8, 30.8, 1.3, 0),
('Amendoim Torrado', 100, 585, 25.8, 21.5, 49.2, 0),
('Nozes', 100, 654, 15.2, 13.7, 65.2, 0),
('Iogurte Natural Integral', 100, 61, 3.5, 4.7, 3.3, 0),
('Iogurte Natural Desnatado', 100, 41, 3.8, 5.0, 0.3, 0)
ON CONFLICT DO NOTHING;
