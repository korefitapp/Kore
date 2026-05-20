import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DisputesClient } from "./_components/DisputesClient";

export const metadata = {
  title: "Central de Disputas · Super Admin",
};

export const dynamic = "force-dynamic";

export type DisputeRow = {
  id: string;
  buyer_name: string;
  seller_name: string;
  reason: string;
  amount: number;
  status: string;
  created_at: string;
};

/* Mock data — substituir por query real quando a tabela `disputes` existir */
const MOCK_DISPUTES: DisputeRow[] = [
  {
    id: "DSP-001",
    buyer_name: "Lucas Ferreira",
    seller_name: "Rafael Monteiro",
    reason: "Não comparecimento",
    amount: 197.0,
    status: "open",
    created_at: "2026-05-18T10:30:00Z",
  },
  {
    id: "DSP-002",
    buyer_name: "Ana Beatriz Costa",
    seller_name: "Loja Suplementos Norte",
    reason: "Produto com defeito",
    amount: 149.9,
    status: "under_review",
    created_at: "2026-05-16T14:15:00Z",
  },
  {
    id: "DSP-003",
    buyer_name: "Pedro Henrique Alves",
    seller_name: "Marina Cardoso",
    reason: "Estorno",
    amount: 249.0,
    status: "resolved",
    created_at: "2026-05-10T09:45:00Z",
  },
  {
    id: "DSP-004",
    buyer_name: "Juliana Martins",
    seller_name: "Boutique Atleta+",
    reason: "Produto com defeito",
    amount: 89.9,
    status: "open",
    created_at: "2026-05-17T16:20:00Z",
  },
  {
    id: "DSP-005",
    buyer_name: "Marcos Vinícius Souza",
    seller_name: "André Bittencourt",
    reason: "Não comparecimento",
    amount: 349.0,
    status: "under_review",
    created_at: "2026-05-14T11:00:00Z",
  },
  {
    id: "DSP-006",
    buyer_name: "Camila Rodrigues",
    seller_name: "Júlia Sant'Anna",
    reason: "Estorno",
    amount: 179.0,
    status: "resolved",
    created_at: "2026-05-08T08:30:00Z",
  },
  {
    id: "DSP-007",
    buyer_name: "Gabriel Oliveira",
    seller_name: "Mercado VivaFit",
    reason: "Produto com defeito",
    amount: 129.9,
    status: "open",
    created_at: "2026-05-19T07:10:00Z",
  },
  {
    id: "DSP-008",
    buyer_name: "Fernanda Lima",
    seller_name: "Rafael Monteiro",
    reason: "Não comparecimento",
    amount: 97.0,
    status: "resolved",
    created_at: "2026-05-05T13:50:00Z",
  },
];

export default async function DisputesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin/disputes");

  /*
   * TODO: Quando a tabela `disputes` existir no Supabase, descomentar:
   *
   * const admin = createSupabaseAdminClient();
   * const { data: disputes } = await admin
   *   .from("disputes")
   *   .select("id, buyer_name, seller_name, reason, amount, status, created_at")
   *   .order("created_at", { ascending: false })
   *   .limit(200);
   */

  const disputes: DisputeRow[] = MOCK_DISPUTES;

  return <DisputesClient disputes={disputes} />;
}