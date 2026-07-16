const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicates() {
  console.log('Fetching exercises...');
  let allExercises = [];
  let page = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .range(page * limit, (page + 1) * limit - 1);
      
    if (error) {
      console.error('Error fetching exercises:', error);
      return;
    }
    
    if (data.length === 0) break;
    
    allExercises = allExercises.concat(data);
    page++;
  }

  console.log(`Found ${allExercises.length} total exercises.`);
  
  // Group by name
  const byName = {};
  for (const ex of allExercises) {
    const name = ex.name.trim().toLowerCase();
    if (!byName[name]) byName[name] = [];
    byName[name].push(ex);
  }
  
  let toDelete = [];
  let toKeep = 0;
  
  for (const name in byName) {
    const arr = byName[name];
    toKeep++;
    if (arr.length > 1) {
      // sort by created_at, keep first
      arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      // Add all except the first one to the delete list
      for (let i = 1; i < arr.length; i++) {
        toDelete.push(arr[i].id);
      }
    }
  }
  
  console.log(`Unique exercises: ${toKeep}. Duplicates to delete: ${toDelete.length}`);
  
  if (toDelete.length > 0) {
    // Delete in chunks of 100
    for (let i = 0; i < toDelete.length; i += 100) {
      const chunk = toDelete.slice(i, i + 100);
      const { error } = await supabase
        .from('exercises')
        .delete()
        .in('id', chunk);
        
      if (error) {
        console.error('Error deleting chunk:', error);
      } else {
        console.log(`Deleted chunk ${i} to ${i + chunk.length}`);
      }
    }
    console.log('Finished deleting duplicates.');
  } else {
    console.log('No duplicates found.');
  }
}

removeDuplicates();
