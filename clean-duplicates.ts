import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanDuplicates() {
  console.log("Fetching all exercises...");
  let allExercises = [];
  let from = 0;
  let size = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name')
      .range(from, from + size - 1);
      
    if (error) {
      console.error("Error fetching:", error);
      break;
    }
    
    if (data.length === 0) break;
    
    allExercises.push(...data);
    from += size;
  }
  
  console.log(`Fetched ${allExercises.length} total exercises.`);
  
  const seen = new Set<string>();
  const toDelete: string[] = [];

  for (const ex of allExercises) {
    if (seen.has(ex.name)) {
      toDelete.push(ex.id);
    } else {
      seen.add(ex.name);
    }
  }

  console.log(`Found ${toDelete.length} duplicates. Deleting...`);

  if (toDelete.length > 0) {
    const chunkSize = 100;
    for (let i = 0; i < toDelete.length; i += chunkSize) {
      const chunk = toDelete.slice(i, i + chunkSize);
      const { data, error: delError } = await supabase
        .from('exercises')
        .delete()
        .in('id', chunk)
        .select('id');

      if (delError) {
        console.error("Error deleting chunk:", delError);
      } else {
        console.log(`Deleted chunk ${i / chunkSize + 1} of ${Math.ceil(toDelete.length / chunkSize)}. Deleted count: ${data?.length}`);
      }
    }
    console.log("Cleanup complete!");
  } else {
    console.log("No duplicates found.");
  }
}

cleanDuplicates();
