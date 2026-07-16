-- SEED: Biblioteca Global de Treinos (Templates)
-- Autor: Master Personal Trainer / DB Engineer

INSERT INTO public.workouts (name, objective, level, description, professional_id) 
VALUES 
-- Básico / Adaptação
(
    'Adaptação Anatômica - Fullbody 3x',
    'Adaptação',
    'Iniciante',
    'Ideal para alunos sedentários no primeiro mês de academia. Treino de corpo inteiro (Fullbody) 3 vezes na semana focado em aprendizado motor, fortalecimento do core e condicionamento cardiorrespiratório básico. Trabalha os grandes grupos musculares com volume baixo e foco total na técnica de execução.',
    NULL
),
(
    'Iniciação à Força - AB (Upper/Lower)',
    'Força',
    'Iniciante',
    'Periodização ondulatória básica focada no aprendizado dos movimentos multiarticulares principais (Agachamento, Supino, Terra, Remada). Dividido em Treino A (Membros Superiores) e Treino B (Membros Inferiores), ideal para praticar 4 vezes na semana. Volume moderado para evitar overtraining precoce.',
    NULL
),

-- Intermediário / Emagrecimento
(
    'Metabolic Burn - Musculação + HIIT',
    'Emagrecimento',
    'Intermediário',
    'Desenvolvido para maximizar a depleção de glicogênio e manter o metabolismo acelerado pós-treino (EPOC). Estruturado em circuitos metabólicos (Bi-sets e Tri-sets) seguidos de 15 minutos de HIIT intenso na esteira ou bike. Excelente para preservação de massa magra em déficit calórico.',
    NULL
),
(
    'Extreme Fat Loss - PHA Training',
    'Emagrecimento',
    'Intermediário',
    'Utiliza a metodologia PHA (Peripheral Heart Action), alternando exercícios de membros superiores e inferiores sem descanso para manter a frequência cardíaca elevada e o fluxo sanguíneo circulando constantemente. Reduz a fadiga localizada enquanto maximiza o gasto calórico global.',
    NULL
),

-- Intermediário / Hipertrofia
(
    'Hipertrofia Clássica - ABC 2x',
    'Hipertrofia',
    'Intermediário',
    'O feijão com arroz que funciona. Divisão clássica: A (Peito, Ombro, Tríceps), B (Costas, Bíceps, Trapézio), C (Pernas Completas e Panturrilhas). Focado na progressão de carga (Progressive Overload) em exercícios base, complementado com trabalho isolado. Ideal para treinar 6 dias na semana.',
    NULL
),
(
    'Construção Sólida - Upper/Lower',
    'Hipertrofia',
    'Intermediário',
    'Frequência de 2 vezes por grupo muscular na semana (AB AB). Excelente balanço entre volume e intensidade, permitindo recuperação neural ideal. Recomendado para alunos que buscam hipertrofia mas têm apenas 4 dias disponíveis para treinar na semana.',
    NULL
),

-- Avançado / Avançadíssimo
(
    'Força e Potência - PPL (Push, Pull, Legs)',
    'Força',
    'Avançado',
    'Abordagem agressiva focada no aumento de densidade muscular. Utiliza periodização em blocos com RPE (Rating of Perceived Exertion) alto (8-9). Inclui cluster sets nos exercícios principais e trabalho acessório pesado. Para alunos com biomecânica impecável.',
    NULL
),
(
    'Hipertrofia Máxima - ABCDE',
    'Hipertrofia',
    'Avançado',
    'Foco extremo no estresse metabólico e dano muscular. Treino de grupo muscular único por dia (Brosplit), permitindo um volume gigantesco (20+ séries/músculo). Requer nutrição superavitária e sono impecável. Uso ostensivo de Rest-Pause e Drop-sets na última série de cada exercício.',
    NULL
),
(
    'SST (Sarcoplasma Stimulating Training)',
    'Hipertrofia',
    'Avançado',
    'Metodologia avançada focada em falha concêntrica, isométrica e excêntrica na mesma série. Gera um pump absurdo e rompimento massivo de fáscia. Não recomendado para naturais em déficit calórico. O treino é curto, brutal e voltado exclusivamente para romper platôs de crescimento.',
    NULL
),
(
    'Shock Absoluto - Fullbody 5x (Alta Frequência)',
    'Hipertrofia',
    'Avançado',
    'Quebra de paradigma. Treino do corpo inteiro 5 dias seguidos, utilizando o princípio do micro-dano (alta frequência, baixo volume diário). Estimula a síntese proteica continuamente durante a semana. Exige grande controle de ego na carga para não fritar o Sistema Nervoso Central.',
    NULL
);
