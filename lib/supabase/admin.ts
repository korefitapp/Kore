import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cliente Supabase com Service Role — BYPASS RLS.
 *
 * Use ESTRITAMENTE em Server Actions e Route Handlers para operações
 * privilegiadas: aprovar profissionais, resolver e-mail por telefone,
 * scripts administrativos. NUNCA expor no client (server-only).
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no ambiente.",
    );
  }
  return createClient<Database>(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
