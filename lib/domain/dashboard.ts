import type { Database } from "@/lib/supabase/database.types";
import type { DailyTargets, UserDashboard } from "./types";

type DashboardRow = Database["public"]["Views"]["v_user_dashboard"]["Row"];

/**
 * Converte a linha bruta da view `v_user_dashboard` em um modelo de
 * domínio bem tipado. Centralizar essa conversão evita espalhar
 * snake_case pelo código de UI.
 *
 * Colunas da view podem vir nullable (caso a join não case com
 * `user_daily_targets`), então aplicamos fallbacks aqui.
 */
export function toUserDashboard(row: DashboardRow): UserDashboard {
  const targets: DailyTargets = {
    waterMl: row.target_water_ml ?? 3000,
    kcal: row.target_kcal ?? 2400,
    proteinG: row.target_protein_g ?? 180,
    carbsG: row.target_carbs_g ?? 280,
    fatG: row.target_fat_g ?? 70,
    steps: row.target_steps ?? 8000,
    activeKcalBurn: row.target_active_kcal_burn ?? 400,
  };

  return {
    userId: row.user_id ?? "",
    fullName: row.full_name ?? "",
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: row.role ?? "client",
    status: row.status ?? "active",
    locale: row.locale ?? "pt-BR",
    timezone: row.timezone ?? "America/Sao_Paulo",
    targets,
  };
}
