/**
 * Hand-written database types — mantém o `tsc` rodando antes da
 * geração real via `pnpm supabase:types` (que sobrescreve este arquivo
 * a partir da instância Supabase de produção).
 *
 * Estrutura compatível com `supabase gen types typescript`:
 *   - Cada tabela tem Row / Insert / Update / Relationships
 *   - Cada view tem Row / Relationships
 *   - Inserts inlinados (sem recursão `Partial<Database[...]>`) para
 *     evitar bloqueios de inferência no postgrest-js 2.105+.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type UserRoleLiteral =
  | "admin"
  | "nutritionist"
  | "trainer"
  | "merchant"
  | "client";
type UserStatusLiteral = "active" | "paused" | "churned" | "pending";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          display_name: string | null;
          avatar_url: string | null;
          role: UserRoleLiteral;
          status: UserStatusLiteral;
          locale: string;
          timezone: string;
          birthdate: string | null;
          phone: string | null;
          cref: string | null;
          crn: string | null;
          cnpj: string | null;
          stripe_customer_id: string | null;
          stripe_connect_account_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRoleLiteral;
          status?: UserStatusLiteral;
          locale?: string;
          timezone?: string;
          birthdate?: string | null;
          phone?: string | null;
          cref?: string | null;
          crn?: string | null;
          cnpj?: string | null;
          stripe_customer_id?: string | null;
          stripe_connect_account_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRoleLiteral;
          status?: UserStatusLiteral;
          locale?: string;
          timezone?: string;
          birthdate?: string | null;
          phone?: string | null;
          cref?: string | null;
          crn?: string | null;
          cnpj?: string | null;
          stripe_customer_id?: string | null;
          stripe_connect_account_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
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
        Insert: {
          user_id: string;
          water_ml?: number;
          kcal?: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          steps?: number;
          active_kcal_burn?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          water_ml?: number;
          kcal?: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          steps?: number;
          active_kcal_burn?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      food_bank: {
        Row: {
          id: string;
          name: string;
          category: string;
          kcal: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          serving_size: string;
          emoji: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string;
          kcal: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          serving_size?: string;
          emoji?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          kcal?: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          serving_size?: string;
          emoji?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          slot: string;
          emoji: string | null;
          name: string;
          target_time: string | null;
          consumed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_date?: string;
          slot: string;
          emoji?: string | null;
          name: string;
          target_time?: string | null;
          consumed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          log_date?: string;
          slot?: string;
          emoji?: string | null;
          name?: string;
          target_time?: string | null;
          consumed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meal_log_items: {
        Row: {
          id: string;
          meal_log_id: string;
          food_id: string | null;
          name: string;
          kcal: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          qty: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_log_id: string;
          food_id?: string | null;
          name: string;
          kcal: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          qty?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          meal_log_id?: string;
          food_id?: string | null;
          name?: string;
          kcal?: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
          qty?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      water_logs: {
        Row: {
          user_id: string;
          log_date: string;
          water_ml: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          log_date?: string;
          water_ml?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          log_date?: string;
          water_ml?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      v_user_dashboard: {
        Row: {
          user_id: string | null;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          role: UserRoleLiteral | null;
          status: UserStatusLiteral | null;
          locale: string | null;
          timezone: string | null;
          target_water_ml: number | null;
          target_kcal: number | null;
          target_protein_g: number | null;
          target_carbs_g: number | null;
          target_fat_g: number | null;
          target_steps: number | null;
          target_active_kcal_burn: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      email_for_phone: {
        Args: { p_phone: string };
        Returns: string | null;
      };
    };
    Enums: {
      user_role: UserRoleLiteral;
      user_status: UserStatusLiteral;
    };
    CompositeTypes: Record<string, never>;
  };
};
