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

export interface ShopProduct {
  id: string;
  name: string;
  price: number;
  thumb: string; // we'll use a placeholder or image based on category
  tag: string;   // corresponds to category
  sellerId: string;
}

// Mapeamento de imagens placeholder baseado em palavras chave no nome ou categoria
function getProductThumb(category: string, name: string): string {
  const q = `${category} ${name}`.toLowerCase();
  
  if (q.includes("whey") || q.includes("proteina") || q.includes("creatina")) {
    return "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80"; // suplemento
  }
  if (q.includes("treino") || q.includes("consultoria")) {
    return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80"; // gym
  }
  if (q.includes("alimentar") || q.includes("dieta")) {
    return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80"; // comida/dieta
  }
  if (q.includes("faixa") || q.includes("acessorio")) {
    return "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400&q=80"; // workout gear
  }

  // fallback genérico de suplemento
  return "https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=400&q=80";
}

export async function getMarketplaceProducts(): Promise<(ShopProduct & { sellerName: string })[]> {
  const supabase = createSupabaseServerClient();

  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      id, 
      product_name, 
      category, 
      price, 
      seller_id,
      profiles!seller_id (
        full_name
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !listings) {
    console.error("Erro ao buscar produtos da loja:", error);
    return [];
  }

  return listings.map((item: any) => ({
    id: item.id,
    name: item.product_name,
    price: Number(item.price),
    tag: item.category,
    thumb: getProductThumb(item.category, item.product_name),
    sellerId: item.seller_id,
    sellerName: item.profiles?.full_name || "Loja Parceira",
  }));
}
