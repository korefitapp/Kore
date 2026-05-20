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

  return <ProductsPageClient />;
}