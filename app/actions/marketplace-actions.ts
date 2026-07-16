"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteMarketplaceListing(listingId: string) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autorizado");

    const adminClient = (await import("@/lib/supabase/admin")).createSupabaseAdminClient();

    // Exclusão real
    const { error } = await adminClient
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (error) throw error;

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/admin/marketplace");
    return { success: true };
  } catch (error: any) {
    console.error("deleteMarketplaceListing error:", error);
    return { success: false, message: error.message || "Erro ao excluir anúncio" };
  }
}

export async function updateMarketplaceListingStatus(listingId: string, status: string) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autorizado");

    const adminClient = (await import("@/lib/supabase/admin")).createSupabaseAdminClient();

    const { error } = await adminClient
      .from("listings")
      .update({ status })
      .eq("id", listingId);

    if (error) throw error;

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/admin/marketplace");
    return { success: true };
  } catch (error: any) {
    console.error("updateMarketplaceListingStatus error:", error);
    return { success: false, message: error.message || "Erro ao atualizar anúncio" };
  }
}
