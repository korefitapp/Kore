import { createClient } from "@supabase/supabase-js";

// Lembrete: Use 'npx --yes tsx --env-file=.env.local scripts/seed-supplements.ts'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const supplements = [
  { name: "Whey Protein Concentrado (80%)", kcal: 400, protein_g: 80, carbs_g: 9, fat_g: 6 },
  { name: "Whey Protein Isolado (90%)", kcal: 370, protein_g: 90, carbs_g: 2, fat_g: 0 },
  { name: "Blend de Proteínas (Whey, Albumina, Soja)", kcal: 380, protein_g: 60, carbs_g: 20, fat_g: 5 },
  { name: "Creatina Monohidratada", kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  { name: "Fórmula Pré-Treino", kcal: 15, protein_g: 0, carbs_g: 3.5, fat_g: 0 },
  { name: "Maltodextrina", kcal: 390, protein_g: 0, carbs_g: 98, fat_g: 0 },
  { name: "Waxy Maize", kcal: 350, protein_g: 0, carbs_g: 88, fat_g: 0 },
  { name: "Hipercalórico (Mass Gainer)", kcal: 380, protein_g: 15, carbs_g: 80, fat_g: 1 },
  { name: "Albumina (Clara de Ovo em Pó)", kcal: 350, protein_g: 78, carbs_g: 5, fat_g: 0 },
  { name: "Barra de Proteína (Padrão)", kcal: 350, protein_g: 30, carbs_g: 35, fat_g: 10 },
  { name: "Pasta de Amendoim Integral", kcal: 590, protein_g: 25, carbs_g: 20, fat_g: 50 },
];

async function runSeed() {
  console.log("🚀 Iniciando injeção de Suplementos Desportivos...");

  const mappedSupplements = supplements.map(sup => ({
    name: sup.name,
    base_amount: 100,
    kcal: sup.kcal,
    protein_g: sup.protein_g,
    carbs_g: sup.carbs_g,
    fat_g: sup.fat_g,
    locale: "pt-BR",
    popularity: 100 // Itens de uso diário!
  }));

  const { error } = await supabase
    .from("foods")
    .upsert(mappedSupplements, { onConflict: "id", ignoreDuplicates: true });

  if (error) {
    console.error("❌ Erro ao inserir suplementos:", error);
  } else {
    console.log(`✅ ${mappedSupplements.length} suplementos injetados com sucesso!`);
  }
}

runSeed().catch(console.error);
