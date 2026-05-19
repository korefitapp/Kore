import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /**
   * Roda em todas as rotas exceto:
   *  - _next/static, _next/image (assets)
   *  - favicon, sitemap, robots
   *  - arquivos estáticos com extensão (.png, .svg, .ico, ...)
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
