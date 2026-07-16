import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Cliente Supabase para uso em Server Components, Server Actions
 * e Route Handlers. Lê/escreve cookies de sessão automaticamente
 * para que a sessão seja sincronizada entre server e client.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // chamado dentro de um Server Component sem mutação de cookies.
            // O middleware já mantém a sessão atualizada — ignorar é seguro.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // idem.
          }
        },
      },
    },
  );
}
