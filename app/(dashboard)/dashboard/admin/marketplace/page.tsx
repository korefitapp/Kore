import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MarketplaceClient } from "./_components/MarketplaceClient";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Catálogo do Marketplace · Super Admin",
};

export const dynamic = "force-dynamic";

export type ListingRow = {
  id: string;
  product_name: string;
  seller_name: string;
  seller_type: string;
  category: string;
  price: number;
  total_sales: number;
  status: string;
  created_at: string;
};

export default async function MarketplacePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin/marketplace");

  const admin = createSupabaseAdminClient();
  const { data: dbListings } = await admin
    .from("listings")
    .select(`
      id, product_name, category, price, total_sales, status, created_at,
      profiles!inner ( full_name, role )
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  const listings: ListingRow[] = (dbListings || []).map((l: any) => ({
    id: l.id,
    product_name: l.product_name,
    category: l.category,
    price: l.price,
    total_sales: l.total_sales,
    status: l.status,
    created_at: l.created_at,
    seller_name: l.profiles?.full_name || "Vendedor",
    seller_type: l.profiles?.role || "merchant",
  }));

  return <MarketplaceClient listings={listings} />;
}