import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "./database.types";

/**
 * Mantém a sessão Supabase atualizada em cada request.
 * Chamado pelo middleware.ts do Next.js. Também aplica RBAC
 * via prefixos de rota.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  // IMPORTANTE: refresca o cookie de sessão se necessário.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/auth");
  const isProtectedApp = pathname.startsWith("/app");
  const isDashboard =
    pathname.startsWith("/nutri") ||
    pathname.startsWith("/personal") ||
    pathname.startsWith("/shop-admin");

  // Não autenticado tentando acessar área restrita
  if (!user && (isProtectedApp || isDashboard)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Autenticado em página de login → manda pra home autenticada
  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/app";
    return NextResponse.redirect(redirectUrl);
  }

  // RBAC nos dashboards B2B
  if (user && isDashboard) {
    type RoleRow = { role: Database["public"]["Enums"]["user_role"] };
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<RoleRow>();

    const role: Database["public"]["Enums"]["user_role"] =
      profile?.role ?? "client";
    const allowed =
      (pathname.startsWith("/nutri") && role === "nutri") ||
      (pathname.startsWith("/personal") && role === "personal") ||
      (pathname.startsWith("/shop-admin") && role === "shop") ||
      role === "admin";

    if (!allowed) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/app";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
