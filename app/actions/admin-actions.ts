"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSidebarCounts(): Promise<{ users: number; professionals: number; disputes: number }> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { users: 0, professionals: 0, disputes: 0 };

    const adminClient = (await import("@/lib/supabase/admin")).createSupabaseAdminClient();

    const [ { count: usersCount }, { count: profsCount } ] = await Promise.all([
      adminClient.from("profiles").select("id", { count: "exact", head: true }).in("role", ["client"]),
      adminClient.from("profiles").select("id", { count: "exact", head: true }).in("role", ["trainer", "nutritionist", "merchant"])
    ]);

    // Disputas
    let disputesCount = 0;
    try {
      const { count } = await adminClient.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open");
      if (count) disputesCount = count;
    } catch {
      // ignore
    }

    return {
      users: usersCount || 0,
      professionals: profsCount || 0,
      disputes: disputesCount
    };
  } catch (error) {
    return { users: 0, professionals: 0, disputes: 0 };
  }
}

export async function updateAdminUser(userId: string, data: { full_name: string; email: string; role: string; status: string }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autorizado");

    const adminClient = (await import("@/lib/supabase/admin")).createSupabaseAdminClient();

    // Atualiza Auth se email mudou (só admin client pode fazer isso facilmente)
    await adminClient.auth.admin.updateUserById(userId, { email: data.email });

    // Atualiza Profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        full_name: data.full_name,
        role: data.role,
        status: data.status,
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("updateAdminUser error:", error);
    return { success: false, message: error.message || "Erro ao atualizar usuário" };
  }
}

export async function deleteAdminUser(userId: string) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autorizado");

    const adminClient = (await import("@/lib/supabase/admin")).createSupabaseAdminClient();

    // Soft delete: apenas muda o status para churned no Profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ status: "churned" })
      .eq("id", userId);

    if (profileError) throw profileError;

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("deleteAdminUser error:", error);
    return { success: false, message: error.message || "Erro ao excluir usuário" };
  }
}

