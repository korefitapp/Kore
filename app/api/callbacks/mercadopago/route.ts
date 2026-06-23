import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // ID do usuário que passamos no getMercadoPagoAuthUrl

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard/nutri/settings/payments?error=MissingCodeOrState", req.url));
    }

    // Trocar code por access token (Chamada para API do MP)
    const clientId = process.env.MP_CLIENT_ID;
    const clientSecret = process.env.MP_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/callbacks/mercadopago`;

    const tokenResponse = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: new URLSearchParams({
        client_id: clientId || "",
        client_secret: clientSecret || "",
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Erro ao obter token do MP:", tokenData);
      return NextResponse.redirect(new URL("/dashboard/nutri/settings/payments?error=MPTokenFailed", req.url));
    }

    // Salvar no Supabase (usamos Admin para salvar direto usando o State que é o User ID)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: updateError } = await supabaseAdmin
      .from("wallets")
      .update({
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token,
        mp_user_id: String(tokenData.user_id),
      })
      .eq("professional_id", state);

    if (updateError) {
      console.error("Erro ao salvar tokens do MP no Supabase:", updateError);
      return NextResponse.redirect(new URL("/dashboard/nutri/settings/payments?error=MPSaveFailed", req.url));
    }

    return NextResponse.redirect(new URL("/dashboard/nutri/settings/payments?mp=success", req.url));
  } catch (error) {
    console.error("Erro no callback Mercado Pago:", error);
    return NextResponse.redirect(new URL("/dashboard/nutri/settings/payments?error=MPCallbackException", req.url));
  }
}
