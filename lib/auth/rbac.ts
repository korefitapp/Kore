/**
 * RBAC — fonte única de verdade pra mapeamento role -> rota canônica
 * e regras de acesso cruzado entre dashboards.
 *
 * Reusado pelo middleware (Edge), por Server Actions (após signup) e
 * pelos layouts de cada dashboard (defesa em profundidade).
 */

export type UserRole =
  | "admin"
  | "nutritionist"
  | "trainer"
  | "merchant"
  | "client"
  | "patient";

/**
 * Rota canônica pós-login para cada papel.
 */
export function homePathForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "nutritionist":
      return "/dashboard/nutri";
    case "trainer":
      return "/dashboard/personal";
    case "merchant":
      return "/dashboard/shop";
    case "client":
    case "patient":
    default:
      return "/app";
  }
}

/**
 * Verifica se a `role` pode acessar o `pathname` solicitado.
 *
 * - Admin acessa tudo.
 * - Cada papel B2B acessa apenas seu próprio subdiretório de /dashboard.
 * - Cliente acessa apenas /app/**.
 * - Páginas neutras (/, /login, /sign-up, /auth/*, /api/*) NÃO entram aqui;
 *   o middleware filtra antes.
 */
export function isAllowedRoute(role: UserRole, pathname: string): boolean {
  if (role === "admin") return true;

  if (pathname.startsWith("/app")) {
    return role === "client" || role === "patient";
  }

  if (pathname.startsWith("/dashboard/admin")) {
    return false;
  }
  if (pathname.startsWith("/dashboard/nutri")) {
    return role === "nutritionist";
  }
  if (pathname.startsWith("/dashboard/personal")) {
    return role === "trainer";
  }
  if (pathname.startsWith("/dashboard/shop")) {
    return role === "merchant";
  }

  // /dashboard (raiz) ou qualquer outro segmento: só admin.
  if (pathname.startsWith("/dashboard")) {
    return false;
  }

  return true;
}
