import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Variáveis de ambiente ausentes.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedFinancials() {
  console.log("Iniciando seed de dados financeiros...");

  // Obter profissionais
  const { data: professionals, error: profError } = await supabase
    .from("profiles")
    .select("id, role")
    .in("role", ["nutritionist", "trainer", "merchant", "admin"]);

  if (profError || !professionals) {
    console.error("Erro ao buscar profissionais:", profError);
    return;
  }

  console.log(`Encontrados ${professionals.length} perfis para seed.`);

  // Gerar transações falsas
  const transactionsToInsert = [];
  const payoutsToInsert = [];

  for (const prof of professionals) {
    // Apenas gera transações para quem precisa de faturamento no dashboard
    if (["nutritionist", "trainer", "merchant", "admin"].includes(prof.role)) {
      
      // Gera transações pros últimos 3 meses
      for (let i = 0; i < 30; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 90);
        const date = new Date();
        date.setDate(date.getDate() - randomDaysAgo);
        
        const amount = Math.floor(Math.random() * 400) + 50; // entre 50 e 450
        const isTax = Math.random() > 0.8; // 20% de chance de ser taxa
        
        transactionsToInsert.push({
          professional_id: prof.id,
          amount: isTax ? -(amount * 0.1) : amount,
          type: isTax ? 'expense' : 'income',
          description: isTax ? 'Taxa da Plataforma' : 'Venda de Plano/Produto',
          status: 'completed',
          created_at: date.toISOString(),
        });
      }

      // Gera saques (payouts) para Lojistas
      if (prof.role === 'merchant') {
        payoutsToInsert.push({
          professional_id: prof.id,
          amount: Math.floor(Math.random() * 1000) + 200,
          status: 'processed',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        });
        payoutsToInsert.push({
          professional_id: prof.id,
          amount: Math.floor(Math.random() * 500) + 100,
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  console.log(`Inserindo ${transactionsToInsert.length} transações...`);
  const { error: tError } = await supabase.from("transactions").insert(transactionsToInsert);
  if (tError) {
    console.error("Erro ao inserir transações:", tError);
  } else {
    console.log("Transações inseridas com sucesso.");
  }

  console.log(`Inserindo ${payoutsToInsert.length} saques...`);
  const { error: pError } = await supabase.from("payouts").insert(payoutsToInsert);
  if (pError) {
    console.error("Erro ao inserir saques:", pError);
  } else {
    console.log("Saques inseridos com sucesso.");
  }
}

seedFinancials();
