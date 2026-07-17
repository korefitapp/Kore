import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, "$1");
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const LAT_BASE = -23.5505; // São Paulo
const LNG_BASE = -46.6333;

const mockNutris = [
  {
    email: "isabella@kore.test",
    name: "Isabella Almeida",
    lat: LAT_BASE + 0.015,
    lng: LNG_BASE + 0.015,
    specialty: "Nutrição Esportiva",
    rating: 4.9,
    avatarInitials: "IA"
  },
  {
    email: "gabriel@kore.test",
    name: "Gabriel Martins",
    lat: LAT_BASE - 0.025,
    lng: LNG_BASE + 0.010,
    specialty: "Emagrecimento e Hipertrofia",
    rating: 4.8,
    avatarInitials: "GM"
  },
  {
    email: "mariana@kore.test",
    name: "Mariana Costa",
    lat: LAT_BASE + 0.030,
    lng: LNG_BASE - 0.020,
    specialty: "Nutrição Comportamental",
    rating: 5.0,
    avatarInitials: "MC"
  },
  {
    email: "lucas@kore.test",
    name: "Lucas Fernandes",
    lat: LAT_BASE - 0.040,
    lng: LNG_BASE - 0.035,
    specialty: "Nutrição Clínica",
    rating: 4.7,
    avatarInitials: "LF"
  },
  {
    email: "carolina@kore.test",
    name: "Carolina Ribeiro",
    lat: LAT_BASE + 0.050,
    lng: LNG_BASE + 0.040,
    specialty: "Vegano e Esportivo",
    rating: 4.9,
    avatarInitials: "CR"
  },
  {
    email: "rafael@kore.test",
    name: "Rafael Oliveira",
    lat: LAT_BASE - 0.010,
    lng: LNG_BASE - 0.010,
    specialty: "Performance e Longevidade",
    rating: 4.6,
    avatarInitials: "RO"
  }
];

async function seedNutris() {
  console.log("Seeding nutricionistas...");

  for (const n of mockNutris) {
    const { data: user, error: userErr } = await supabase.auth.admin.createUser({
      email: n.email,
      password: "password123",
      email_confirm: true,
    });

    if (userErr) {
      console.log(`Usuario ${n.email} ja existe ou erro: ${userErr.message}`);
      continue;
    }

    const userId = user.user.id;
    
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        role: "nutritionist",
        status: "active",
        full_name: n.name,
        metadata: {
          lat: n.lat,
          lng: n.lng,
          specialty: n.specialty,
          rating: n.rating,
          avatarInitials: n.avatarInitials,
        }
      })
      .eq("id", userId);
      
    if (profileErr) {
      console.error(`Erro ao atualizar perfil de ${n.email}:`, profileErr);
    } else {
      console.log(`Nutricionista ${n.name} criado com sucesso!`);
    }
  }

  console.log("Concluído!");
}

seedNutris();
