import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const [key, ...val] = line.split("=");
  if (key) acc[key.trim()] = val.join("=").trim().replace(/['"]/g, '');
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) console.error("Error:", error);
  console.log("Profiles:");
  data.forEach(p => console.log(`- ${p.full_name} (${p.id}) | metadata:`, p.metadata));
  
  const { data: authData } = await supabase.auth.admin.listUsers();
  console.log("\nUsers:");
  authData.users.forEach(u => console.log(`- ${u.email} (${u.id})`));
}

run();
