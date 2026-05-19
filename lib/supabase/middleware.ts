import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "./database.types";
import {
  homePathForRole,
  isAllowedRoute,
  type UserRole,
} from "@/lib/auth/rbac";

const PENDING_PATH = "/aguardando-aprovacao";

/**
 * Mantém a sessão Supabase atualizada em cada request.
 * Chamado pelo middleware.ts do Next.js. Também aplica RBAC:
 *  - Bloqueia não-autenticado em `/app` e `/dashboard/**`.
 *  - Pós-login, redireciona o usuário pra rota canônica da sua role.
 *  - Bloqueia acesso cruzado entre roles (ex: client em /dashboard/admin).
 *  - Profissional com status 'pending' fica preso em /aguardando-aprovacao.
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
  const isPendingPage = pathname === PENDING_PATH;

  // Não autenticado tentando acessar área restrita (inclui /aguardando-aprovacao)
  if (!user && (isProtectedApp || isDashboard || isPendingPage)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Pós-login + RBAC cruzado + status pending
  if (user && (isAuthPage || isProtectedApp || isDashboard || isPendingPage)) {
    type RoleStatusRow = {
      role: Database["public"]["Enums"]["user_role"];
      status: Database["public"]["Enums"]["user_status"];
    };
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle<RoleStatusRow>();

    const role: UserRole = (profile?.role as UserRole | undefined) ?? "client";
    const status = profile?.status ?? "active";
    const isProfessional =
      role === "nutritionist" || role === "trainer" || role === "merchant";

    // Profissional pendente: prende em /aguardando-aprovacao (exceto admin e cliente).
    if (status === "pending" && isProfessional) {
      if (!isPendingPage) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = PENDING_PATH;
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
      }
      // Já está em /aguardando-aprovacao → renderiza normal.
      return response;
    }

    // Usuário aprovado batendo em /aguardando-aprovacao → home da role.
    if (isPendingPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = homePathForRole(role);
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

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
