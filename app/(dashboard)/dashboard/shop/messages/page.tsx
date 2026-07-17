import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MessagesPageClient } from "./_components/MessagesPageClient";
import { getChatContacts } from "@/app/actions/chat-actions";

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

  const contacts = await getChatContacts();

  // Buscar status da instância do WhatsApp
  const { data: whatsappInstance } = await supabase
    .from("whatsapp_instances")
    .select("status, qr_code_base64")
    .eq("professional_id", user.id)
    .single();

  return (
    <MessagesPageClient 
      currentUserId={user.id}
      initialInstanceStatus={whatsappInstance?.status || "disconnected"}
      initialQrCode={whatsappInstance?.qr_code_base64 || null}
      initialContacts={contacts}
    />
  );
}