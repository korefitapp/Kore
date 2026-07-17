import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const trainers = [
    {
      email: "ricardo@kore.test",
      name: "Ricardo Almeida",
      lat: -23.5505,
      lng: -46.6333,
      specialty: "Hipertrofia & Força",
      rating: 4.9,
      avatarInitials: "RA",
    },
    {
      email: "juliana@kore.test",
      name: "Juliana Silva",
      lat: -23.5605,
      lng: -46.6433,
      specialty: "Emagrecimento & HIIT",
      rating: 4.8,
      avatarInitials: "JS",
    },
    {
      email: "marcos@kore.test",
      name: "Marcos Torres",
      lat: -23.5405,
      lng: -46.6233,
      specialty: "Reabilitação & Core",
      rating: 5.0,
      avatarInitials: "MT",
    },
  ];

  for (const t of trainers) {
    // Auth user
    const { data: user, error: userErr } = await supabase.auth.admin.createUser({
      email: t.email,
      password: "Kore123!",
      email_confirm: true,
      user_metadata: { name: t.name },
    });

    if (userErr && userErr.message.includes("already exist")) {
      console.log(`User ${t.email} already exists, skipping auth creation.`);
      const { data: existingUser } = await supabase.from('profiles').select('id').eq('full_name', t.name).single();
      
      if(existingUser) {
        await supabase.from("profiles").update({
            metadata: {
                lat: t.lat,
                lng: t.lng,
                specialty: t.specialty,
                rating: t.rating,
                avatarInitials: t.avatarInitials,
            }
        }).eq('id', existingUser.id);
        console.log(`Updated metadata for ${t.name}`);
      }
      continue;
    }

    if (userErr) {
      console.error("Error creating auth user:", userErr);
      continue;
    }

    // Since trigger `handle_new_user` might have created the profile, we just UPDATE it
    if (user && user.user) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          full_name: t.name,
          role: "trainer",
          metadata: {
            lat: t.lat,
            lng: t.lng,
            specialty: t.specialty,
            rating: t.rating,
            avatarInitials: t.avatarInitials,
          },
        })
        .eq("id", user.user.id);

      if (profileErr) {
        console.error("Error updating profile:", profileErr);
      } else {
        console.log(`Successfully seeded ${t.name}`);
      }
    }
  }
}

seed().catch(console.error);
