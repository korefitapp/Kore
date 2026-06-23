const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/';
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
  const data = await res.json();
  const tables = Object.keys(data.definitions || {}).filter(k => !k.includes(' '));
  console.log('Tables found in Supabase:', tables);
}

check();
