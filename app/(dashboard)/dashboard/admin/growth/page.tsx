import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GrowthClient } from "./_components/GrowthClient";

export const metadata = {
  title: "Growth · Super Admin",
};

export const dynamic = "force-dynamic";

export type CouponRow = {
  id: string;
  code: string;
  type: "fixed" | "percent";
  value: number;
  max_uses: number;
  used_count: number;
  valid_until: string;
  status: "active" | "expired" | "disabled";
};

export type AcquisitionMetrics = {
  cac: number;
  ltv: number;
  conversion_rate: number;
  total_users: number;
  new_users_30d: number;
  churn_rate: number;
};

/* Mock data — substituir por query real quando a tabela `coupons` existir */

const MOCK_METRICS: AcquisitionMetrics = {
  cac: 42.5,
  ltv: 890.0,
  conversion_rate: 12.4,
  total_users: 3_742,
  new_users_30d: 287,
  churn_rate: 3.2,
};

const MOCK_COUPONS: CouponRow[] = [
  {
    id: "CPN-001",
    code: "KORE20",
    type: "percent",
    value: 20,
    max_uses: 500,
    used_count: 347,
    valid_until: "2026-06-30",
    status: "active",
  },
  {
    id: "CPN-002",
    code: "BEMVINDO50",
    type: "fixed",
    value: 50,
    max_uses: 1000,
    used_count: 812,
    valid_until: "2026-07-31",
    status: "active",
  },
  {
    id: "CPN-003",
    code: "PERSONAL10",
    type: "percent",
    value: 10,
    max_uses: 200,
    used_count: 200,
    valid_until: "2026-05-01",
    status: "expired",
  },
  {
    id: "CPN-004",
    code: "NUTRI15",
    type: "percent",
    value: 15,
    max_uses: 300,
    used_count: 189,
    valid_until: "2026-08-15",
    status: "active",
  },
  {
    id: "CPN-005",
    code: "LOJA30OFF",
    type: "fixed",
    value: 30,
    max_uses: 150,
    used_count: 42,
    valid_until: "2026-09-30",
    status: "active",
  },
  {
    id: "CPN-006",
    code: "FLASH25",
    type: "percent",
    value: 25,
    max_uses: 100,
    used_count: 100,
    valid_until: "2026-04-15",
    status: "disabled",
  },
];

export default async function GrowthPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin/growth");

  /*
   * TODO: Quando a tabela `coupons` existir no Supabase, descomentar:
   *
   * const admin = createSupabaseAdminClient();
   * const { data: coupons } = await admin
   *   .from("coupons")
   *   .select("id, code, type, value, max_uses, used_count, valid_until, status")
   *   .order("created_at", { ascending: false });
   */

  const coupons: CouponRow[] = MOCK_COUPONS;
  const metrics: AcquisitionMetrics = MOCK_METRICS;

  return <GrowthClient coupons={coupons} metrics={metrics} />;
}