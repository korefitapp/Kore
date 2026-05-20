import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MessagesPageClient } from "./_components/MessagesPageClient";

export const metadata = {
  title: "Mensagens · Lojista",
};

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/shop/messages");

  return <MessagesPageClient />;
}