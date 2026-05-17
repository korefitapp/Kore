/**
 * Tipos de domínio puros (sem dependências do Next, Supabase, React).
 * Reusados pelo app web e, futuramente, pelo Expo.
 */

export type UserRole = "client" | "nutri" | "personal" | "shop" | "admin";
export type UserStatus = "active" | "paused" | "churned";

export interface DailyTargets {
  waterMl: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  steps: number;
  activeKcalBurn: number;
}

export interface UserDashboard {
  userId: string;
  fullName: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  locale: string;
  timezone: string;
  targets: DailyTargets;
}
