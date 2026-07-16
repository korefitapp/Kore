const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching global workouts...');
  const { data: workouts, error: wError } = await supabase
    .from('workouts')
    .select('id, objective')
    .is('professional_id', null);

  if (wError) {
    console.error('Error fetching workouts:', wError);
    return;
  }

  for (const workout of workouts) {
    console.log(`\nUpdating workout: ${workout.id} - Objective: ${workout.objective}`);
    
    // Determine metrics
    let sets = 3;
    let reps = '10-12';
    let rest = '60s';

    if (workout.objective === 'Força') {
      sets = 5;
      reps = '4-6';
      rest = '120s';
    } else if (workout.objective === 'Hipertrofia') {
      sets = 4;
      reps = '8-12';
      rest = '60-90s';
    } else if (workout.objective === 'Emagrecimento') {
      sets = 3;
      reps = '15-20';
      rest = '45s';
    } else if (workout.objective === 'Adaptação') {
      sets = 3;
      reps = '12-15';
      rest = '60s';
    }

    // Get days for this workout
    const { data: days } = await supabase.from('workout_days').select('id').eq('workout_id', workout.id);
    if (!days || days.length === 0) continue;

    const dayIds = days.map(d => d.id);

    // Update all exercises in these days
    const { error: updateError } = await supabase
      .from('workout_day_exercises')
      .update({ sets: sets, reps: reps, rest_time: rest })
      .in('workout_day_id', dayIds);

    if (updateError) {
      console.error('Error updating exercises:', updateError);
    } else {
      console.log(`Updated to ${sets}x${reps}, ${rest} rest.`);
    }
  }
  
  console.log('DONE!');
}

main();
