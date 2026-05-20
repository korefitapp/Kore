import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MarketplaceClient } from "./_components/MarketplaceClient";

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

/* Mock data — substituir por query real quando a tabela `listings` existir */
const MOCK_LISTINGS: ListingRow[] = [
  {
    id: "lst-001",
    product_name: "Whey Protein Isolado 1kg",
    seller_name: "Loja Suplementos Norte",
    seller_type: "merchant",
    category: "Suplementos",
    price: 149.9,
    total_sales: 342,
    status: "published",
    created_at: "2026-03-10T14:30:00Z",
  },
  {
    id: "lst-002",
    product_name: "Plano de Treino - Hipertrofia 12sem",
    seller_name: "Rafael Monteiro",
    seller_type: "trainer",
    category: "Treinos",
    price: 197.0,
    total_sales: 128,
    status: "published",
    created_at: "2026-04-02T09:15:00Z",
  },
  {
    id: "lst-003",
    product_name: "Plano Alimentar Cutting 8sem",
    seller_name: "Marina Cardoso",
    seller_type: "nutritionist",
    category: "Planos Alimentares",
    price: 249.0,
    total_sales: 87,
    status: "published",
    created_at: "2026-04-18T16:45:00Z",
  },
  {
    id: "lst-004",
    product_name: "Creatina Monohidratada 300g",
    seller_name: "Boutique Atleta+",
    seller_type: "merchant",
    category: "Suplementos",
    price: 89.9,
    total_sales: 510,
    status: "published",
    created_at: "2026-02-25T11:20:00Z",
  },
  {
    id: "lst-005",
    product_name: "Consultoria Online - 4 semanas",
    seller_name: "André Bittencourt",
    seller_type: "trainer",
    category: "Consultoria",
    price: 349.0,
    total_sales: 43,
    status: "draft",
    created_at: "2026-05-01T08:00:00Z",
  },
  {
    id: "lst-006",
    product_name: "Plano Alimentar Ganho de Massa",
    seller_name: "Júlia Sant'Anna",
    seller_type: "nutritionist",
    category: "Planos Alimentares",
    price: 179.0,
    total_sales: 64,
    status: "published",
    created_at: "2026-04-22T13:10:00Z",
  },
  {
    id: "lst-007",
    product_name: "Kit Faixas Elásticas Pro",
    seller_name: "Mercado VivaFit",
    seller_type: "merchant",
    category: "Acessórios",
    price: 129.9,
    total_sales: 203,
    status: "banned",
    created_at: "2026-01-15T10:30:00Z",
  },
  {
    id: "lst-008",
    product_name: "Treino Funcional - Iniciantes",
    seller_name: "Rafael Monteiro",
    seller_type: "trainer",
    category: "Treinos",
    price: 97.0,
    total_sales: 215,
    status: "published",
    created_at: "2026-03-28T17:55:00Z",
  },
];

export default async function MarketplacePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin/marketplace");

  /*
   * TODO: Quando a tabela `listings` existir no Supabase, descomentar:
   *
   * const admin = createSupabaseAdminClient();
   * const { data: listings } = await admin
   *   .from("listings")
   *   .select("id, product_name, seller_name, seller_type, category, price, total_sales, status, created_at")
   *   .order("created_at", { ascending: false })
   *   .limit(200);
   */

  const listings: ListingRow[] = MOCK_LISTINGS;

  return <MarketplaceClient listings={listings} />;
}