const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

  if (!workouts || workouts.length === 0) {
    console.log('No global workouts found. Did you run the SQL script?');
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

  // Helper to find an exercise id by partial name
  const findEx = (query) => {
    const ex = exercises.find(e => e.name.toLowerCase().includes(query.toLowerCase()));
    return ex ? ex.id : (exercises.length > 0 ? exercises[0].id : null); // Fallback to first
  };

  for (const workout of workouts) {
    console.log(`\nPopulating: ${workout.name}`);
    
    // Check if days already exist to avoid duplicates
    const { data: existingDays } = await supabase.from('workout_days').select('id').eq('workout_id', workout.id);
    if (existingDays && existingDays.length > 0) {
      console.log('Days already exist. Skipping.');
      continue;
    }

    let daysPlan = [];
    
    if (workout.name.includes('Fullbody 3x')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Supino', 'Agachamento', 'Remada', 'Rosca', 'Tríceps'] },
        { name: 'Quarta-feira', ex: ['Desenvolvimento', 'Leg Press', 'Puxada', 'Rosca', 'Panturrilha'] },
        { name: 'Sexta-feira', ex: ['Crucifixo', 'Cadeira Extensora', 'Remada', 'Tríceps', 'Abdominal'] },
      ];
    } else if (workout.name.includes('AB (Upper/Lower)')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Supino', 'Remada', 'Desenvolvimento', 'Rosca', 'Tríceps'] },
        { name: 'Terça-feira', ex: ['Agachamento', 'Leg Press', 'Cadeira Extensora', 'Mesa Flexora', 'Panturrilha'] },
        { name: 'Quinta-feira', ex: ['Supino', 'Puxada', 'Elevacao', 'Rosca', 'Tríceps'] },
        { name: 'Sexta-feira', ex: ['Agachamento', 'Leg Press', 'Cadeira Extensora', 'Panturrilha', 'Abdominal'] },
      ];
    } else if (workout.name.includes('ABC 2x')) {
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Supino', 'Crucifixo', 'Desenvolvimento', 'Tríceps Polia', 'Tríceps Testa'] },
        { name: 'Terça-feira', ex: ['Puxada', 'Remada', 'Crucifixo Inverso', 'Rosca Direta', 'Rosca Martelo'] },
        { name: 'Quarta-feira', ex: ['Agachamento', 'Leg Press', 'Cadeira Extensora', 'Mesa Flexora', 'Panturrilha'] },
        { name: 'Quinta-feira', ex: ['Supino', 'Crucifixo', 'Desenvolvimento', 'Tríceps', 'Elevacao'] },
        { name: 'Sexta-feira', ex: ['Puxada', 'Remada', 'Rosca', 'Lombar', 'Abdominal'] },
        { name: 'Sábado', ex: ['Agachamento', 'Leg Press', 'Panturrilha', 'Cadeira Extensora', 'Abdominal'] },
      ];
    } else {
      // Default generic plan
      daysPlan = [
        { name: 'Segunda-feira', ex: ['Supino', 'Agachamento'] },
        { name: 'Quarta-feira', ex: ['Remada', 'Leg Press'] },
        { name: 'Sexta-feira', ex: ['Desenvolvimento', 'Tríceps', 'Rosca'] },
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
          sets: 3,
          reps: '10-12',
          rest_time: '60s'
        };
      }).filter(e => e.exercise_id !== null);
      
      if (dayExercises.length > 0) {
        const { error: exError } = await supabase.from('workout_day_exercises').insert(dayExercises);
        if (exError) console.error('Error adding exercises:', exError);
      }
    }
    console.log('Successfully populated ' + workout.name);
  }
  
  console.log('DONE!');
}

main();
