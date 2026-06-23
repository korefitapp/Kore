import { createClient } from "@supabase/supabase-js";
import stringSimilarity from "string-similarity"; // Let's try to use string-similarity if possible, but actually we can just write a basic fuzzy match ourselves.

// Basic fuzzy finder
function findBestMatch(target: string, choices: { id: string; name: string }[]) {
  let bestMatch = null;
  let bestScore = 0;

  const targetLower = target.toLowerCase().trim();

  // 1. Exact match (case insensitive)
  const exact = choices.find((c) => c.name.toLowerCase().trim() === targetLower);
  if (exact) return exact;

  // 2. Includes match
  for (const choice of choices) {
    const choiceLower = choice.name.toLowerCase().trim();
    if (choiceLower.includes(targetLower) || targetLower.includes(choiceLower)) {
      return choice;
    }
  }

  // 3. Token match (split by spaces and count matching words)
  const targetTokens = targetLower.split(" ");
  for (const choice of choices) {
    const choiceLower = choice.name.toLowerCase().trim();
    let score = 0;
    for (const token of targetTokens) {
      if (token.length > 2 && choiceLower.includes(token)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = choice;
    }
  }

  if (bestScore > 0) return bestMatch;
  return null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSync() {
  console.log("🚀 Iniciando sincronização de meal_items com foods...");

  // 1. Puxar todos os foods
  const { data: foods, error: foodsError } = await supabase.from("foods").select("id, name");
  if (foodsError) throw foodsError;

  console.log(`✅ ${foods.length} alimentos encontrados na base oficial.`);

  // 2. Puxar todos os meal_items sem food_id
  const { data: items, error: itemsError } = await supabase.from("meal_items").select("id, food_name").is("food_id", null);
  if (itemsError) throw itemsError;

  console.log(`🔍 Encontrados ${items.length} meal_items sem vínculo de food_id.`);

  if (items.length === 0) {
    console.log("🎉 Nada para atualizar.");
    return;
  }

  let successCount = 0;
  let failCount = 0;

  // 3. Processar cada item
  for (const item of items) {
    const match = findBestMatch(item.food_name, foods);
    
    if (match) {
      const { error: updateError } = await supabase
        .from("meal_items")
        .update({ food_id: match.id })
        .eq("id", item.id);
        
      if (updateError) {
        console.error(`❌ Erro ao atualizar item ${item.food_name}:`, updateError);
      } else {
        successCount++;
        // console.log(`🔗 Vínculo: "${item.food_name}" -> "${match.name}"`);
      }
    } else {
      failCount++;
      console.warn(`⚠️ Sem correspondência para: "${item.food_name}"`);
    }
  }

  console.log(`\n📊 RESULTADO DA SINCRONIZAÇÃO:`);
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Falhas: ${failCount}`);
}

runSync().catch(console.error);
