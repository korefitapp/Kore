import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductsPageClient } from "./_components/ProductsPageClient";

export const metadata = {
  title: "Produtos · Lojista",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/shop/products");

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", user.id)
    .order("created_at", { ascending: false });

  // Mapear para o formato do client
  const mappedProducts = (products || []).map((p: any) => ({
    id: p.id,
    name: p.title,
    emoji: "📦", // Default
    sku: p.id.split("-")[0].toUpperCase(),
    price: Number(p.price),
    category: p.category || "Outros",
    status: (p.stock > 0 ? "ativo" : "inativo") as "ativo" | "inativo",
  }));

  return <ProductsPageClient products={mappedProducts} />;
}