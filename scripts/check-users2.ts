import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Let's try to fetch auth users directly via postgres using the postgres meta endpoints? No.
  // We can just use the admin API but maybe pagination works?
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 50
  });
  if (error) {
    console.error(error);
  } else {
    for (const u of data.users) {
      console.log(`ID: ${u.id} - Email: ${u.email}`);
    }
  }
}
run();
