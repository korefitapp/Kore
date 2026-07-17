"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Transaction = {
  id: string;
  professional_id: string;
  client_id?: string | null;
  amount: number;
  type: string; // 'income' | 'expense'
  description?: string | null;
  status: string;
  created_at: string;
};

export type Payout = {
  id: string;
  professional_id: string;
  amount: number;
  status: string; // 'pending' | 'processed' | 'failed'
  bank_details?: any;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------
// Profissionais (Personal, Nutri, Merchant)
// ---------------------------------------------

export async function getProfessionalTransactions(): Promise<Transaction[]> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      client:profiles!client_id (
        full_name
      )
    `)
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar transações:", error);
    return [];
  }
  return data as Transaction[];
}

export async function requestPayout(amount: number) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { error } = await supabase.from("payouts").insert({
    professional_id: user.id,
    amount,
    status: "pending"
  });

  if (error) {
    console.error("Erro ao solicitar saque:", error);
    throw new Error("Falha ao solicitar saque.");
  }

  revalidatePath("/dashboard/shop/financial");
  revalidatePath("/dashboard/personal/financial");
  return { success: true };
}

export async function getProfessionalPayouts(): Promise<Payout[]> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("payouts")
    .select("*")
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar saques:", error);
    return [];
  }
  return data as Payout[];
}

// ---------------------------------------------
// Admin (Global)
// ---------------------------------------------

export async function getAdminTransactions(): Promise<Transaction[]> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Checar se é admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return [];

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      professional:profiles!professional_id (
        full_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(500); // Traz as 500 mais recentes para não pesar

  if (error) {
    console.error("Erro ao buscar transações admin:", error);
    return [];
  }
  return data as Transaction[];
}
