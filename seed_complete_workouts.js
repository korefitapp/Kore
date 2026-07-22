const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://lzpxgstpbvncthtqtakj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6cHhnc3RwYnZuY3RodHF0YWtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3NTAxNiwiZXhwIjoyMDk0NTUxMDE2fQ.0TL031t-t32kCyT3vHLM7EFnD8jFitN0IDyLvLyvVe8";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching global workouts...');
  const { data: workouts, error: wError } = await supabase
    .from('workouts')
    .select('*')
    .is('professional_id', null);

  if (wError) {
    console.error('Error fetching workouts:', wError);
    return;
  }

  console.log('Fetching exercises...');
  const { data: exercises, error: eError } = await supabase
    .from('exercises')
    .select('id, name')
    .is('professional_id', null);

  if (eError) {
    console.error('Error fetching exercises:', eError);
    return;
  }

  // Clear existing days for global workouts to start fresh
  const workoutIds = workouts.map(w => w.id);
  await supabase.from('workout_days').delete().in('workout_id', workoutIds);
  console.log('Cleared old workout days.');

  // Helper to find an exercise id by partial name
  const findEx = (query) => {
    // Try exact match first
    let ex = exercises.find(e => e.name.toLowerCase() === query.toLowerCase());
    if (!ex) {
      // Try partial match
      ex = exercises.find(e => e.name.toLowerCase().includes(query.toLowerCase()));
    }
    return ex ? ex.id : (exercises.length > 0 ? exercises[0].id : null); // Fallback to first if not found
  };

  for (const workout of workouts) {
    console.log(`\nPopulating: ${workout.name}`);
    
    let daysPlan = [];
    
    // Determine metrics
    let sets = 3, reps = '10-12', rest = '60s';
    if (workout.objective === 'Força') { sets = 5; reps = '4-6'; rest = '120s'; }
    else if (workout.objective === 'Hipertrofia') { sets = 4; reps = '8-12'; rest = '90s'; }
    else if (workout.objective === 'Emagrecimento') { sets = 3; reps = '15-20'; rest = '45s'; }
    else if (workout.objective === 'Adaptação') { sets = 3; reps = '12-15'; rest = '60s'; }
    
    if (workout.name.includes('Fullbody 3x')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Agachamento Livre', 'Supino Reto com Barra', 'Remada Curvada', 'Desenvolvimento', 'Rosca Direta', 'Tríceps Testa', 'Abdominal Supra', 'Panturrilha em Pé'] },
        { name: 'Quarta-feira', ex: ['Leg Press', 'Supino Inclinado com Halteres', 'Puxada Frontal', 'Elevação Lateral', 'Rosca Martelo', 'Tríceps Polia', 'Abdominal Infra', 'Panturrilha Sentado'] },
        { name: 'Sexta-feira', ex: ['Levantamento Terra', 'Crucifixo Reto', 'Remada Baixa', 'Desenvolvimento com Halteres', 'Rosca Alternada', 'Tríceps Corda', 'Prancha Isométrica', 'Cadeira Abdutora'] },
      ];
    } else if (workout.name.includes('AB (Upper/Lower)')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Supino Reto com Barra', 'Remada Curvada', 'Supino Inclinado com Halteres', 'Puxada Frontal', 'Desenvolvimento', 'Rosca Direta', 'Tríceps Testa', 'Abdominal Supra'] },
        { name: 'Terça-feira', ex: ['Agachamento Livre', 'Leg Press 45', 'Cadeira Extensora', 'Mesa Flexora', 'Stiff', 'Cadeira Abdutora', 'Panturrilha em Pé', 'Panturrilha Sentado'] },
        { name: 'Quinta-feira', ex: ['Supino Reto com Halteres', 'Remada Baixa', 'Crucifixo Inclinado', 'Puxada Alta', 'Elevação Lateral', 'Rosca Martelo', 'Tríceps Polia', 'Abdominal Infra'] },
        { name: 'Sexta-feira', ex: ['Levantamento Terra', 'Hack Machine', 'Afundo', 'Cadeira Flexora', 'Elevação Pélvica', 'Cadeira Adutora', 'Panturrilha no Leg', 'Prancha Isométrica'] },
      ];
    } else if (workout.name.includes('Metabolic Burn')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Agachamento Livre', 'Supino Reto com Halteres', 'Leg Press', 'Remada Curvada', 'Burpee', 'Jumping Jack', 'Mountain Climber', 'Abdominal Remador'] },
        { name: 'Quarta-feira', ex: ['Levantamento Terra', 'Puxada Frontal', 'Stiff', 'Desenvolvimento com Halteres', 'Kettlebell Swing', 'Box Jump', 'Polichinelo', 'Prancha Isométrica'] },
        { name: 'Sexta-feira', ex: ['Afundo', 'Crucifixo Reto', 'Mesa Flexora', 'Elevação Lateral', 'Burpee', 'Corda Naval', 'Abdominal Supra', 'Bicicleta Ergométrica'] },
      ];
    } else if (workout.name.includes('PHA Training')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Agachamento Livre', 'Supino Reto com Barra', 'Leg Press', 'Remada Curvada', 'Cadeira Extensora', 'Desenvolvimento', 'Panturrilha em Pé', 'Rosca Direta'] },
        { name: 'Quarta-feira', ex: ['Stiff', 'Puxada Frontal', 'Mesa Flexora', 'Supino Inclinado com Halteres', 'Elevação Pélvica', 'Elevação Lateral', 'Cadeira Abdutora', 'Tríceps Testa'] },
        { name: 'Sexta-feira', ex: ['Levantamento Terra', 'Remada Baixa', 'Hack Machine', 'Crucifixo Reto', 'Afundo', 'Desenvolvimento com Halteres', 'Panturrilha Sentado', 'Rosca Martelo'] },
      ];
    } else if (workout.name.includes('ABC 2x')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Supino Reto com Barra', 'Supino Inclinado com Halteres', 'Crucifixo Reto', 'Crossover', 'Desenvolvimento', 'Elevação Lateral', 'Tríceps Polia', 'Tríceps Testa'] },
        { name: 'Terça-feira', ex: ['Remada Curvada', 'Puxada Frontal', 'Remada Baixa', 'Crucifixo Inverso', 'Encolhimento', 'Rosca Direta', 'Rosca Martelo', 'Rosca Inversa'] },
        { name: 'Quarta-feira', ex: ['Agachamento Livre', 'Leg Press 45', 'Cadeira Extensora', 'Mesa Flexora', 'Stiff', 'Panturrilha em Pé', 'Panturrilha Sentado', 'Abdominal Supra'] },
        { name: 'Quinta-feira', ex: ['Supino Reto com Halteres', 'Supino Inclinado com Barra', 'Voador', 'Desenvolvimento com Halteres', 'Elevação Frontal', 'Elevação Lateral', 'Tríceps Corda', 'Tríceps Banco'] },
        { name: 'Sexta-feira', ex: ['Levantamento Terra', 'Puxada Alta', 'Remada Unilateral', 'Pulldown', 'Encolhimento', 'Rosca Scott', 'Rosca Concentrada', 'Abdominal Infra'] },
        { name: 'Sábado', ex: ['Agachamento Hack', 'Afundo', 'Cadeira Flexora', 'Elevação Pélvica', 'Cadeira Abdutora', 'Panturrilha no Leg', 'Prancha Isométrica', 'Abdominal Obliquo'] },
      ];
    } else if (workout.name.includes('Upper/Lower')) {
       daysPlan = [
        { name: 'Segunda-feira', ex: ['Supino Reto com Barra', 'Remada Curvada', 'Supino Inclinado com Halteres', 'Puxada Frontal', 'Desenvolvimento', 'Rosca Direta', 'Tríceps Testa', 'Abdominal Supra'] },
        { name: 'Terça-feira', ex: ['Agachamento Livre', 'Leg Press 45', 'Cadeira Extensora', 'Mesa Flexora', 'Stiff', 'Cadeira Abdutora', 'Panturrilha em Pé', 'Panturrilha Sentado'] },
        { name: 'Quinta-feira', ex: ['Supino Reto com Halteres', 'Remada Baixa', 'Crucifixo Inclinado', 'Puxada Alta', 'Elevação Lateral', 'Rosca Martelo', 'Tríceps Polia', 'Abdominal Infra'] },
        { name: 'Sexta-feira', ex: ['Levantamento Terra', 'Hack Machine', 'Afundo', 'Cadeira Flexora', 'Elevação Pélvica', 'Cadeira Adutora', 'Panturrilha no Leg', 'Prancha Isométrica'] },
      ];
    } else if (workout.name.includes('PPL')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Supino Reto com Barra', 'Supino Inclinado com Halteres', 'Crucifixo Reto', 'Desenvolvimento', 'Elevação Lateral', 'Tríceps Testa', 'Tríceps Polia'] },
        { name: 'Terça-feira', ex: ['Levantamento Terra', 'Remada Curvada', 'Puxada Frontal', 'Crucifixo Inverso', 'Rosca Direta', 'Rosca Martelo', 'Encolhimento'] },
        { name: 'Quarta-feira', ex: ['Agachamento Livre', 'Leg Press 45', 'Cadeira Extensora', 'Mesa Flexora', 'Stiff', 'Panturrilha em Pé', 'Panturrilha Sentado'] },
        { name: 'Quinta-feira', ex: ['Supino Reto com Halteres', 'Supino Inclinado com Barra', 'Crossover', 'Desenvolvimento com Halteres', 'Elevação Frontal', 'Tríceps Corda', 'Tríceps Frances'] },
        { name: 'Sexta-feira', ex: ['Puxada Alta', 'Remada Baixa', 'Remada Unilateral', 'Voador Inverso', 'Rosca Scott', 'Rosca Concentrada', 'Abdominal Supra'] },
        { name: 'Sábado', ex: ['Hack Machine', 'Afundo', 'Cadeira Flexora', 'Elevação Pélvica', 'Cadeira Abdutora', 'Panturrilha no Leg', 'Abdominal Infra'] },
      ];
    } else if (workout.name.includes('ABCDE')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Supino Reto com Barra', 'Supino Inclinado com Halteres', 'Crucifixo Reto', 'Crossover', 'Voador', 'Supino Declinado', 'Flexão de Braços'] },
        { name: 'Terça-feira', ex: ['Levantamento Terra', 'Remada Curvada', 'Puxada Frontal', 'Remada Baixa', 'Remada Unilateral', 'Pulldown', 'Crucifixo Inverso'] },
        { name: 'Quarta-feira', ex: ['Agachamento Livre', 'Leg Press 45', 'Cadeira Extensora', 'Hack Machine', 'Mesa Flexora', 'Stiff', 'Cadeira Flexora', 'Elevação Pélvica'] },
        { name: 'Quinta-feira', ex: ['Desenvolvimento', 'Desenvolvimento com Halteres', 'Elevação Lateral', 'Elevação Frontal', 'Crucifixo Inverso', 'Encolhimento com Barra', 'Encolhimento com Halteres'] },
        { name: 'Sexta-feira', ex: ['Rosca Direta', 'Rosca Martelo', 'Rosca Scott', 'Rosca Concentrada', 'Tríceps Testa', 'Tríceps Polia', 'Tríceps Corda', 'Tríceps Frances'] },
      ];
    } else if (workout.name.includes('SST')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Supino Reto com Barra', 'Supino Inclinado com Halteres', 'Crossover', 'Desenvolvimento', 'Elevação Lateral', 'Tríceps Testa', 'Tríceps Polia'] },
        { name: 'Quarta-feira', ex: ['Agachamento Livre', 'Leg Press 45', 'Cadeira Extensora', 'Mesa Flexora', 'Stiff', 'Panturrilha em Pé', 'Panturrilha Sentado'] },
        { name: 'Sexta-feira', ex: ['Remada Curvada', 'Puxada Frontal', 'Remada Baixa', 'Crucifixo Inverso', 'Rosca Direta', 'Rosca Martelo', 'Encolhimento'] },
      ];
    } else if (workout.name.includes('Shock Absoluto')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Agachamento Livre', 'Supino Reto com Barra', 'Remada Curvada', 'Desenvolvimento', 'Rosca Direta', 'Tríceps Testa', 'Panturrilha em Pé'] },
        { name: 'Terça-feira', ex: ['Leg Press', 'Supino Inclinado com Halteres', 'Puxada Frontal', 'Elevação Lateral', 'Rosca Martelo', 'Tríceps Polia', 'Panturrilha Sentado'] },
        { name: 'Quarta-feira', ex: ['Levantamento Terra', 'Crucifixo Reto', 'Remada Baixa', 'Desenvolvimento com Halteres', 'Rosca Alternada', 'Tríceps Corda', 'Cadeira Abdutora'] },
        { name: 'Quinta-feira', ex: ['Hack Machine', 'Supino Reto com Halteres', 'Puxada Alta', 'Elevação Frontal', 'Rosca Scott', 'Tríceps Banco', 'Elevação Pélvica'] },
        { name: 'Sexta-feira', ex: ['Stiff', 'Voador', 'Remada Unilateral', 'Crucifixo Inverso', 'Rosca Concentrada', 'Tríceps Frances', 'Abdominal Supra'] },
      ];
    }

    for (let i = 0; i < daysPlan.length; i++) {
      const day = daysPlan[i];
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
          rest_time: rest,
          technique: workout.objective === 'Hipertrofia' && index === day.ex.length - 1 ? 'Drop-set' : null
        };
      });
      
      if (dayExercises.length > 0) {
        const { error: exError } = await supabase.from('workout_day_exercises').insert(dayExercises);
        if (exError) console.error('Error adding exercises:', exError);
      }
    }
    console.log(`Successfully populated ${workout.name} with massive volume!`);
  }
  
  console.log('DONE!');
}

main();
