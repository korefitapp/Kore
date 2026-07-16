import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Receber o corpo da requisição (payload do Webhook)
    const payload = await req.json();

    // Em produção: 
    // - Verificar assinatura do cabeçalho (ex: x-signature do Mercado Pago ou Stripe-Signature)
    // para garantir que veio do Gateway.

    console.log("Recebido webhook de pagamento:", payload);

    // Estrutura simplificada de payload do Mercado Pago / Stripe
    // Assumimos que o gateway envia:
    // { external_reference: 'ID_DA_TRANSAÇÃO', status: 'approved' }
    const externalReference = payload.external_reference || payload.data?.external_reference;
    const paymentStatus = payload.status || payload.data?.status || payload.type;

    if (!externalReference) {
      return NextResponse.json({ error: "Missing external_reference" }, { status: 400 });
    }

    // Traduzir status para o nosso banco de dados
    let statusToUpdate = "pending";
    if (paymentStatus === "approved" || paymentStatus === "succeeded" || paymentStatus === "payment_intent.succeeded") {
      statusToUpdate = "approved";
    } else if (paymentStatus === "rejected" || paymentStatus === "payment_intent.payment_failed") {
      statusToUpdate = "rejected";
    }

    // 2. Comunicar com Supabase via Service Role Key
    // Usamos Service Role para ignorar RLS e executar o RPC como admin
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Primeiro, encontramos o ID interno da transação baseado na external_reference
    // Mas, pelo design, external_reference começa com 'MP-' e o resto é o UUID.
    // Vamos buscar a transação que tem external_reference = ID recebido
    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("external_reference", externalReference)
      .single();

    let transactionId = transaction?.id;

    if (fetchError || !transaction) {
      console.error("Transação não encontrada para external_reference:", externalReference);
      // Se não encontrar por external_reference (porque foi gerado localmente), tentar se external_reference for o próprio UUID:
      const { data: directTxn } = await supabaseAdmin.from("transactions").select("id").eq("id", externalReference).single();
      if (!directTxn) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }
      transactionId = directTxn.id;
    }

    // 3. Executar o RPC process_payment_webhook para conciliação atômica
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc("process_payment_webhook", {
      p_transaction_id: transactionId,
      p_status: statusToUpdate,
    });

    if (rpcError) {
      console.error("Erro no RPC process_payment_webhook:", rpcError);
      return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 });
    }

    console.log("Transação processada com sucesso:", rpcResult);

    return NextResponse.json({ success: true, result: rpcResult });
  } catch (error: any) {
    console.error("Erro ao processar Webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
