import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Se não houver utilizador, redireciona para login ou mostra erro
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Buscar a conta atual gravada na carteira
    const { data: wallet } = await supabase
      .from("wallets")
      .select("stripe_account_id")
      .eq("professional_id", user.id)
      .single();

    if (!wallet?.stripe_account_id) {
      return NextResponse.redirect(new URL("/dashboard/nutri/settings/payments?error=NoStripeAccount", req.url));
    }

    // Verificar na Stripe se a conta foi completamente configurada
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-04-10" as any,
    });

    const account = await stripe.accounts.retrieve(wallet.stripe_account_id);

    if (account.details_submitted) {
      // Tudo certo
      return NextResponse.redirect(new URL("/dashboard/nutri/settings/payments?stripe=success", req.url));
    } else {
      // Onboarding incompleto
      return NextResponse.redirect(new URL("/dashboard/nutri/settings/payments?stripe=incomplete", req.url));
    }
  } catch (error) {
    console.error("Erro no callback Stripe:", error);
    return NextResponse.redirect(new URL("/dashboard/nutri/settings/payments?error=StripeCallbackFailed", req.url));
  }
}
