const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching exercises...');
  const { data: exercises, error: eError } = await supabase
    .from('exercises')
    .select('id, name')
    .is('professional_id', null);

  if (eError) {
    console.error('Error fetching exercises:', eError);
    return;
  }

  const findEx = (query) => {
    let ex = exercises.find(e => e.name.toLowerCase() === query.toLowerCase());
    if (!ex) ex = exercises.find(e => e.name.toLowerCase().includes(query.toLowerCase()));
    return ex ? ex.id : (exercises.length > 0 ? exercises[0].id : null);
  };

  const nicheWorkouts = [
    {
      name: 'Estética Feminina - Foco Glúteos e Coxas',
      objective: 'Hipertrofia',
      level: 'Intermediário',
      description: 'Divisão extremamente requisitada pelo público feminino. Foca no desenvolvimento máximo dos membros inferiores (3x na semana), alternando a ênfase entre Quadríceps num dia, e Glúteos/Isquiotibiais no outro. Os membros superiores são treinados com volume moderado para manter o tônus.',
      professional_id: null,
      daysPlan: [
        { name: 'Segunda (Quadríceps)', ex: ['Agachamento Livre', 'Leg Press 45', 'Cadeira Extensora', 'Afundo', 'Panturrilha em Pé'] },
        { name: 'Terça (Superiores)', ex: ['Puxada Frontal', 'Remada Baixa', 'Supino Inclinado com Halteres', 'Desenvolvimento', 'Abdominal Supra'] },
        { name: 'Quarta (Glúteos e Posterior)', ex: ['Elevação Pélvica', 'Stiff', 'Cadeira Abdutora', 'Mesa Flexora', 'Cadeira Flexora'] },
        { name: 'Sexta (Pernas Completo)', ex: ['Agachamento Hack', 'Leg Press 45', 'Cadeira Extensora', 'Cadeira Abdutora', 'Panturrilha Sentado'] },
        { name: 'Sábado (Superiores Leve)', ex: ['Elevação Lateral', 'Tríceps Polia', 'Rosca Direta', 'Prancha Isométrica'] },
      ]
    },
    {
      name: 'Atleta Híbrido / Cross-Training',
      objective: 'Resistência',
      level: 'Avançado',
      description: 'Programa para atletas híbridos que buscam força, potência e condicionamento cardiovascular. Mescla movimentos de base da musculação pesada com exercícios calistênicos e metabólicos explosivos.',
      professional_id: null,
      daysPlan: [
        { name: 'Força e Potência', ex: ['Levantamento Terra', 'Desenvolvimento com Halteres', 'Barra Fixa', 'Agachamento Livre', 'Box Jump'] },
        { name: 'Condicionamento Metabólico', ex: ['Burpee', 'Kettlebell Swing', 'Corda Naval', 'Mountain Climber', 'Flexão de Braços'] },
        { name: 'Força e Core', ex: ['Agachamento Frontal', 'Remada Curvada', 'Supino Reto com Barra', 'Prancha Isométrica', 'Abdominal Remador'] },
      ]
    },
    {
      name: 'Longevidade - Saúde Articular (3ª Idade)',
      objective: 'Adaptação',
      level: 'Iniciante',
      description: 'Focado em idosos ou iniciantes em reabilitação. O objetivo principal é combater a sarcopenia, melhorar o controle motor, equilíbrio e estabilidade articular sem gerar impacto excessivo nas articulações.',
      professional_id: null,
      daysPlan: [
        { name: 'Inferiores (Controle)', ex: ['Cadeira Extensora', 'Mesa Flexora', 'Panturrilha Sentado', 'Abdominal Infra', 'Cadeira Adutora'] },
        { name: 'Superiores (Postura)', ex: ['Puxada Frontal', 'Remada Baixa', 'Desenvolvimento com Halteres', 'Rosca Alternada', 'Tríceps Banco'] },
        { name: 'Estabilização (Core)', ex: ['Prancha Isométrica', 'Elevação Lateral', 'Elevação Frontal', 'Abdominal Supra'] },
      ]
    },
    {
      name: 'Powerlifting Base (Força Máxima)',
      objective: 'Força',
      level: 'Avançado',
      description: 'Periodização baseada nos princípios do Powerlifting (Terra, Agachamento e Supino). Utiliza baixas repetições, alta carga (RPE 8-10) e descansos longos. Feito para construir força bruta estrutural.',
      professional_id: null,
      daysPlan: [
        { name: 'Dia 1: Foco Supino', ex: ['Supino Reto com Barra', 'Supino Inclinado com Halteres', 'Tríceps Testa', 'Desenvolvimento', 'Crucifixo Inverso'] },
        { name: 'Dia 2: Foco Terra', ex: ['Levantamento Terra', 'Remada Curvada', 'Puxada Alta', 'Rosca Direta', 'Abdominal Supra'] },
        { name: 'Dia 3: Foco Agachamento', ex: ['Agachamento Livre', 'Leg Press 45', 'Cadeira Extensora', 'Panturrilha em Pé', 'Prancha Isométrica'] },
      ]
    },
    {
      name: 'Preparação Física para Corredores',
      objective: 'Resistência',
      level: 'Intermediário',
      description: 'Treino resistido específico para melhorar o pace na corrida e prevenir lesões no quadril e joelhos. Foca fortemente em glúteo médio, isquiotibiais (freio) e core para transferência de força.',
      professional_id: null,
      daysPlan: [
        { name: 'Prevenção e Estabilidade', ex: ['Afundo', 'Stiff', 'Elevação Pélvica', 'Cadeira Abdutora', 'Panturrilha em Pé'] },
        { name: 'Core e Transmissão de Força', ex: ['Prancha Isométrica', 'Abdominal Obliquo', 'Abdominal Remador', 'Abdominal Supra'] },
        { name: 'Potência e Arranque', ex: ['Agachamento Livre', 'Kettlebell Swing', 'Cadeira Adutora', 'Panturrilha Sentado'] },
      ]
    }
  ];

  for (const wData of nicheWorkouts) {
    console.log(`\nInserting Workout: ${wData.name}`);
    
    // Configurar repetições reais baseado no objetivo
    let sets = 3, reps = '10-12', rest = '60s';
    if (wData.objective === 'Força') { sets = 5; reps = '3-5'; rest = '180s'; }
    else if (wData.objective === 'Hipertrofia') { sets = 4; reps = '8-12'; rest = '90s'; }
    else if (wData.objective === 'Resistência') { sets = 3; reps = '15-20'; rest = '45s'; }
    else if (wData.objective === 'Adaptação') { sets = 3; reps = '12-15'; rest = '60s'; }

    // 1. Insert Workout
    const { data: workout, error: wErr } = await supabase
      .from('workouts')
      .insert({
        name: wData.name,
        objective: wData.objective,
        level: wData.level,
        description: wData.description,
        professional_id: null
      })
      .select('id')
      .single();

    if (wErr) {
      console.error('Error inserting workout:', wErr);
      continue;
    }

    // 2. Insert Days and Exercises
    for (let i = 0; i < wData.daysPlan.length; i++) {
      const day = wData.daysPlan[i];
      const { data: dayData, error: dayError } = await supabase
        .from('workout_days')
        .insert({ workout_id: workout.id, name: day.name, order: i })
        .select('id')
        .single();
        
      if (dayError) {
        console.error('Error creating day:', dayError);
        continue;
      }
      
      const dayExercises = day.ex.map((query, index) => {
        const exId = findEx(query);
        return {
          workout_day_id: dayData.id,
          exercise_id: exId,
          order: index,
          sets: sets,
          reps: reps,
          rest_time: rest
        };
      });
      
      if (dayExercises.length > 0) {
        const { error: exError } = await supabase.from('workout_day_exercises').insert(dayExercises);
        if (exError) console.error('Error adding exercises:', exError);
      }
    }
    console.log(`Successfully populated ${wData.name}!`);
  }
  
  console.log('DONE!');
}

main();
