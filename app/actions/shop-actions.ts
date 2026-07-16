"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSidebarCounts(): Promise<{ orders: number; inventory: number; messages: number }> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { orders: 0, inventory: 0, messages: 0 };

    let ordersCount = 0;
    try {
      const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("shop_id", user.id).eq("status", "pending");
      if (count) ordersCount = count;
    } catch { }

    let inventoryCount = 0;
    try {
      const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("shop_id", user.id);
      if (count) inventoryCount = count;
    } catch { }
    
    let messagesCount = 0;
    try {
      const { count } = await supabase.from("messages").select("id", { count: "exact", head: true }).eq("receiver_id", user.id).is("read_at", null);
      if (count) messagesCount = count;
    } catch { }

    return {
      orders: ordersCount,
      inventory: inventoryCount,
      messages: messagesCount
    };
  } catch (error) {
    return { orders: 0, inventory: 0, messages: 0 };
  }
}
