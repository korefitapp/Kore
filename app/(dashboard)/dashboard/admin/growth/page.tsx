import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

export default async function GrowthPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin/growth");

  const admin = createSupabaseAdminClient();
  
  // Real Coupons Fetch
  const { data: couponsData } = await admin
    .from("coupons")
    .select("id, code, type, value, max_uses, used_count, valid_until, status")
    .order("created_at", { ascending: false });

  // Real User Count Fetch
  const { count: usersCount } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const coupons: CouponRow[] = couponsData || [];
  
  const metrics: AcquisitionMetrics = {
    cac: 0,
    ltv: 0,
    conversion_rate: 0,
    total_users: usersCount ?? 0,
    new_users_30d: 0,
    churn_rate: 0,
  };

  return <GrowthClient coupons={coupons} metrics={metrics} />;
}