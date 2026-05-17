/**
 * Stub inicial. Será sobrescrito por:
 *   pnpm supabase:types
 *
 * Que executa:
 *   supabase gen types typescript --local --schema public > lib/supabase/database.types.ts
 *
 * Mantemos um stub válido para que `tsc` rode sem erro antes da geração.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          display_name: string | null;
          avatar_url: string | null;
          role: "client" | "nutri" | "personal" | "shop" | "admin";
          status: "active" | "paused" | "churned";
          locale: string;
          timezone: string;
          birthdate: string | null;
          phone: string | null;
          stripe_customer_id: string | null;
          stripe_connect_account_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Row"]>;
        Relationships: [];
      };
      user_daily_targets: {
        Row: {
          user_id: string;
          water_ml: number;
          kcal: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          steps: number;
          active_kcal_burn: number;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["user_daily_targets"]["Row"]
        > & { user_id: string };
        Update: Partial<
          Database["public"]["Tables"]["user_daily_targets"]["Row"]
        >;
        Relationships: [];
      };
    };
    Views: {
      v_user_dashboard: {
        Row: {
          user_id: string;
          full_name: string;
          display_name: string | null;
          avatar_url: string | null;
          role: "client" | "nutri" | "personal" | "shop" | "admin";
          status: "active" | "paused" | "churned";
          locale: string;
          timezone: string;
          target_water_ml: number | null;
          target_kcal: number | null;
          target_protein_g: number | null;
          target_carbs_g: number | null;
          target_fat_g: number | null;
          target_steps: number | null;
          target_active_kcal_burn: number | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: "client" | "nutri" | "personal" | "shop" | "admin";
      user_status: "active" | "paused" | "churned";
    };
    CompositeTypes: Record<string, never>;
  };
}
