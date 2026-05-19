import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Callback OAuth (PKCE) e magic links.
 * O Supabase redireciona pra cá com ?code=... — trocamos por sessão
 * e mandamos o usuário pra `next` ou /app.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("Não foi possível concluir o login.")}`,
          url.origin,
        ),
      );
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
