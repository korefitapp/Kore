import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "./database.types";
import {
  homePathForRole,
  isAllowedRoute,
  type UserRole,
} from "@/lib/auth/rbac";

/**
 * Mantém a sessão Supabase atualizada em cada request.
 * Chamado pelo middleware.ts do Next.js. Também aplica RBAC:
 *  - Bloqueia não-autenticado em `/app` e `/dashboard/**`.
 *  - Pós-login, redireciona o usuário pra rota canônica da sua role.
 *  - Bloqueia acesso cruzado entre roles (ex: client em /dashboard/admin).
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

  const isAuthPage = pathname === "/login" || pathname === "/sign-up";
  const isProtectedApp = pathname.startsWith("/app");
  const isDashboard = pathname.startsWith("/dashboard");

  // Não autenticado tentando acessar área restrita
  if (!user && (isProtectedApp || isDashboard)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Pós-login + RBAC cruzado
  if (user && (isAuthPage || isProtectedApp || isDashboard)) {
    type RoleRow = { role: Database["public"]["Enums"]["user_role"] };
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<RoleRow>();

    const role: UserRole = (profile?.role as UserRole | undefined) ?? "client";

    // Usuário logado batendo em /login ou /sign-up → home da role
    if (isAuthPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = homePathForRole(role);
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    // RBAC cruzado: redireciona pra home da role se rota não for permitida.
    if (!isAllowedRoute(role, pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = homePathForRole(role);
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}
