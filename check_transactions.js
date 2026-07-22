const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envConfig = fs.readFileSync('.env.local', 'utf-8');
envConfig.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('transactions').select('type').limit(1);
  if (error) {
    console.error('Error fetching transactions type:', error);
  } else {
    console.log('Transactions type fetched successfully:', data);
  }
}
run();
