"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ChatContact {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  contact_id: string;
  message_id: string;
  sender_id: string | null;
  text: string;
  is_from_me: boolean;
  status: string;
  created_at: string;
}

export async function getChatContacts(): Promise<ChatContact[]> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: contacts, error } = await supabase
    .from("chat_contacts")
    .select("*")
    .eq("professional_id", user.id)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Error fetching chat contacts:", error);
    return [];
  }

  return (contacts || []).map(c => ({
    id: c.id,
    full_name: c.name || c.phone,
    avatar_url: c.avatar_url,
    phone: c.phone,
    lastMessage: c.last_message_preview || "",
    lastMessageTime: c.last_message_at || c.created_at,
    unreadCount: c.unread_count || 0,
    isOnline: false
  }));
}

export async function getChatMessages(contactId: string): Promise<ChatMessage[]> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }

  return data as ChatMessage[];
}

export async function markMessagesAsRead(contactId: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Mark in chat_messages
  await supabase
    .from("chat_messages")
    .update({ status: "read" })
    .eq("contact_id", contactId)
    .eq("is_from_me", false)
    .neq("status", "read");

  // 2. Reset unread_count in chat_contacts
  await supabase
    .from("chat_contacts")
    .update({ unread_count: 0 })
    .eq("id", contactId);
}

// Deprecated: Internal message sending is replaced by sendWhatsAppMessage
export async function sendMessage(receiverId: string, content: string) {
  throw new Error("Deprecated: Use sendWhatsAppMessage from whatsapp-actions.ts");
}
