"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createInAppPayment({
  professionalId,
  amount,
  gateway = "mercadopago",
}: {
  professionalId: string;
  amount: number;
  gateway?: string;
}) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autorizado");
  }

  // 1. Criar registro da transação pendente no Supabase
  const { data: transaction, error: txnError } = await supabase
    .from("transactions")
    .insert({
      professional_id: professionalId,
      patient_id: user.id,
      amount: amount,
      status: "pending",
      gateway: gateway,
      payment_method: "pix"
    })
    .select()
    .single();

  if (txnError || !transaction) {
    console.error("Erro ao criar transação:", txnError);
    throw new Error("Falha ao inicializar o pagamento.");
  }

  // 2. Comunicar com o SDK do Mercado Pago (Simulação de Geração de PIX Dinâmico)
  // Em produção, isso faria o POST para https://api.mercadopago.com/v1/payments
  // passando transaction.id no external_reference
  
  // Simulando delay da API do gateway
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const mockPixString = `00020101021226870014br.gov.bcb.pix2565pix.mercadopago.com/qr/v2/${transaction.id}5204000053039865802BR5909KORE LTDA6009SAO PAULO62070503***6304ABCD`;
  
  // Imagem de QR Code simulada em base64 (quadrado placeholder)
  const mockQrBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2YjcyODAiPlFSIENPREUgUElYPC90ZXh0Pjwvc3ZnPg==";

  // Atualizar external_reference simulado
  await supabase
    .from("transactions")
    .update({ external_reference: `MP-${transaction.id}` })
    .eq("id", transaction.id);

  return {
    transactionId: transaction.id,
    qrCodeBase64: mockQrBase64,
    qrCodeString: mockPixString,
    expiresInMinutes: 15,
  };
}

// ==========================================
// INTEGRAÇÃO DE GATEWAYS (OAUTH)
// ==========================================
import Stripe from "stripe";

export async function createStripeConnectLink() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret || stripeSecret.includes("COLOQUE") || stripeSecret.includes("sk_test_...")) {
    throw new Error("Credenciais do Stripe ausentes no servidor.");
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2024-04-10" as any,
  });

  // Check if wallet already has an account
  const { data: wallet } = await supabase
    .from("wallets")
    .select("stripe_account_id")
    .eq("professional_id", user.id)
    .single();

  let accountId = wallet?.stripe_account_id;

  if (!accountId) {
    // Create new express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "BR", // ou US, dependendo do KORE
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
    });
    accountId = account.id;

    // Save temporarily or immediately
    await supabase.from("wallets").update({ stripe_account_id: accountId }).eq("professional_id", user.id);
  }

  // Create account link for onboarding
  const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${host}/dashboard/nutri/settings/payments`,
    return_url: `${host}/api/callbacks/stripe`,
    type: "account_onboarding",
  });

  return accountLink.url;
}

export async function disconnectStripe() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  await supabase.from("wallets").update({ stripe_account_id: null }).eq("professional_id", user.id);
  return true;
}

export async function getMercadoPagoAuthUrl() {
  const clientId = process.env.MP_CLIENT_ID;
  if (!clientId || clientId.includes("COLOQUE") || clientId.includes("1234567890")) {
    throw new Error("Credenciais do Mercado Pago ausentes no servidor.");
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${host}/api/callbacks/mercadopago`;
  
  // O state é crucial: passamos o ID do user para saber de quem é a conta quando voltar do MP
  const url = `https://auth.mercadopago.com/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${user.id}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  return url;
}

export async function disconnectMercadoPago() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  await supabase.from("wallets").update({ 
    mp_access_token: null,
    mp_refresh_token: null,
    mp_user_id: null
  }).eq("professional_id", user.id);
  
  return true;
}

// ==========================================
// DASHBOARD FINANCEIRO (DATA FETCHING)
// ==========================================
export async function getFinancialDashboardStats() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // A. KPIs do Mês Atual (gross e net)
  const monthKpisPromise = supabase
    .from("transactions")
    .select("gross_amount, net_amount")
    .eq("professional_id", user.id)
    .in("status", ["concluido", "approved", "completed"])
    .gte("created_at", firstDayOfMonth);

  // B. Receita Pendente
  const pendingPromise = supabase
    .from("transactions")
    .select("net_amount")
    .eq("professional_id", user.id)
    .in("status", ["pendente", "pending"]);

  // C. Gráfico (Últimos 6 meses)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 5);
  sixMonthsAgo.setDate(1); // Primeiro dia de 6 meses atrás

  const chartPromise = supabase
    .from("transactions")
    .select("gross_amount, created_at")
    .eq("professional_id", user.id)
    .in("status", ["concluido", "approved", "completed"])
    .gte("created_at", sixMonthsAgo.toISOString());

  // D. Histórico
  const historyPromise = supabase
    .from("transactions")
    .select("id, created_at, patient_name, description, gross_amount, net_amount, status")
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const [monthKpisRes, pendingRes, chartRes, historyRes] = await Promise.all([
    monthKpisPromise, pendingPromise, chartPromise, historyPromise
  ]);

  // Aggregate A
  let grossRevenue = 0;
  let netRevenue = 0;
  if (monthKpisRes.data) {
    monthKpisRes.data.forEach(t => {
      grossRevenue += Number(t.gross_amount) || 0;
      netRevenue += Number(t.net_amount) || 0;
    });
  }

  // Aggregate B
  let pendingAmount = 0;
  let pendingCount = 0;
  if (pendingRes.data) {
    pendingRes.data.forEach(t => {
      pendingAmount += Number(t.net_amount) || 0;
      pendingCount++;
    });
  }

  // Aggregate C
  const monthsStr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    chartData.push({ month: monthsStr[d.getMonth()], value: 0, year: d.getFullYear(), monthNum: d.getMonth() });
  }

  if (chartRes.data) {
    chartRes.data.forEach(t => {
      const d = new Date(t.created_at);
      const target = chartData.find(c => c.monthNum === d.getMonth() && c.year === d.getFullYear());
      if (target) {
        target.value += Number(t.gross_amount) || 0;
      }
    });
  }
  
  const finalChartData = chartData.map(c => ({ month: c.month, value: c.value }));

  return {
    metrics: { grossRevenue, netRevenue, pendingAmount, pendingCount },
    chartData: finalChartData,
    history: historyRes.data || []
  };
}
