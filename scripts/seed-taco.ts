import { createClient } from "@supabase/supabase-js";

// Importante: No Node 20+, vamos passar o arquivo de ambiente diretamente via flag no terminal
// Isso evita precisarmos instalar o pacote "dotenv"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Palavras-chave para Popularity 100
const topKeywords = [
  "frango", "arroz", "ovo", "aveia", "whey", "batata doce", "azeite", 
  "brócolis", "banana", "patinho", "leite", "carne"
];

function calculatePopularity(foodName: string): number {
  const nameLower = foodName.toLowerCase();
  for (const keyword of topKeywords) {
    if (nameLower.includes(keyword)) {
      return 100;
    }
  }
  return 0;
}

async function runSeed() {
  console.log("🚀 Iniciando extração e migração da TACO completa...");

  // Limpar a base de dados primeiro (todas as linhas)
  console.log("🧹 Apagando banco de alimentos atual...");
  const { error: delError } = await supabase.from("foods").delete().neq("popularity", -1);
  if (delError) {
    console.error("❌ Erro ao apagar alimentos:", delError);
  } else {
    console.log("✅ Tabela limpa com sucesso.");
  }

  let tacoData = [];

  try {
    const url = "https://raw.githubusercontent.com/marcelosanto/tabela_taco/master/tabela_alimentos.json";
    console.log(`🌐 Baixando JSON diretamente de: ${url}`);
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Falha no fetch: ${res.status} ${res.statusText}`);
    
    const json = await res.json();
    
    // O JSON real deste repositório é um Array direto no nível raiz
    if (!Array.isArray(json)) {
      throw new Error("Formato do JSON inválido. Esperava um array na raiz.");
    }
    
    tacoData = json;
    console.log(`✅ ${tacoData.length} alimentos descarregados com sucesso.`);

  } catch (err: any) {
    console.error("❌ Erro ao baixar o JSON:", err.message);
    process.exit(1);
  }

  // Mapeamento das chaves
  const mappedFoods = tacoData.map((item: any) => {
    const name = item.description || item.nome || "Alimento Desconhecido";
    
    // Converter para número
    const parseNumber = (val: any) => {
      if (val === undefined || val === null || val === "NA" || val === "Tr") return 0;
      if (typeof val === "string") return Number(val.replace(",", ".")) || 0;
      return Number(val) || 0;
    };

    return {
      name: name,
      base_amount: 100,
      kcal: parseNumber(item.energy_kcal || item.calorias),
      protein_g: parseNumber(item.protein_g || item.proteinas),
      carbs_g: parseNumber(item.carbohydrate_g || item.carboidratos),
      fat_g: parseNumber(item.lipid_g || item.gorduras),
      locale: "pt-BR",
      popularity: calculatePopularity(name)
    };
  });

  const validFoods = mappedFoods.filter((f: any) => f.name !== "Alimento Desconhecido");

  console.log(`✅ Iniciando Bulk Insert de ${validFoods.length} alimentos...`);

  const batchSize = 100;
  for (let i = 0; i < validFoods.length; i += batchSize) {
    const batch = validFoods.slice(i, i + batchSize);
    
    // Inserção em blocos de 100
    const { error } = await supabase
      .from("foods")
      .upsert(batch, { onConflict: "id", ignoreDuplicates: true }); // Evitar duplicação se o script rodar 2x

    if (error) {
      console.error(`❌ Erro ao inserir lote ${i} - ${i + batchSize}:`, error);
    } else {
      console.log(`✅ Lote ${i} - ${i + batchSize} inserido com sucesso.`);
    }
  }

  console.log("🎉 Migração completa da TACO finalizada com sucesso!");
}

runSeed().catch(console.error);
