import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsClient } from "./_components/SettingsClient";

export const metadata = {
  title: "Configurações · Super Admin",
};

export const dynamic = "force-dynamic";

export type PlatformSettings = {
  fees: {
    nutritionist_pct: number;
    personal_pct: number;
    store_pct: number;
  };
  integrations: {
    stripe_secret_key: string;
    stripe_webhook_secret: string;
    sendgrid_api_key: string;
  };
  support_email: string;
};

/* Mock settings — substituir por query real quando a tabela `platform_settings` existir */

const MOCK_SETTINGS: PlatformSettings = {
  fees: {
    nutritionist_pct: 15,
    personal_pct: 15,
    store_pct: 10,
  },
  integrations: {
    stripe_secret_key: "sk_live_••••••••••••••••••••••••",
    stripe_webhook_secret: "whsec_••••••••••••••••••••••••",
    sendgrid_api_key: "SG.••••••••••••••••••••••••",
  },
  support_email: "suporte@kore.fit",
};

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/admin/settings");

  /*
   * TODO: Quando a tabela `platform_settings` existir no Supabase, descomentar:
   *
   * const admin = createSupabaseAdminClient();
   * const { data: settings } = await admin
   *   .from("platform_settings")
   *   .select("*")
   *   .limit(1)
   *   .single();
   */

  return <SettingsClient initialSettings={MOCK_SETTINGS} />;
}