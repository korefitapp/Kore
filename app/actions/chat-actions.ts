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
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export async function getChatContacts(): Promise<ChatContact[]> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. Get all messages where user is sender or receiver
  const { data: allMessages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (messagesError) {
    console.error("Error fetching messages for contacts:", messagesError);
    return [];
  }

  // 2. Identify unique contacts and their last message
  const contactMap = new Map<string, { lastMessage: string, lastMessageTime: string, unreadCount: number }>();
  
  (allMessages || []).forEach(msg => {
    const contactId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!contactMap.has(contactId)) {
      contactMap.set(contactId, {
        lastMessage: msg.content,
        lastMessageTime: msg.created_at,
        unreadCount: 0
      });
    }
    
    // Count unread if I am the receiver and it's not read
    if (msg.receiver_id === user.id && !msg.read_at) {
      const current = contactMap.get(contactId)!;
      current.unreadCount += 1;
      contactMap.set(contactId, current);
    }
  });

  // 3. Fetch clients (if professional) to include them even if no messages yet
  const { data: clients } = await supabase
    .from("professional_clients")
    .select("client_id")
    .eq("professional_id", user.id)
    .eq("status", "active");

  (clients || []).forEach(c => {
    if (!contactMap.has(c.client_id)) {
      contactMap.set(c.client_id, {
        lastMessage: "",
        lastMessageTime: new Date(0).toISOString(),
        unreadCount: 0
      });
    }
  });

  // Fetch shop clients (from transactions)
  const { data: txs } = await supabase
    .from("transactions")
    .select("client_id")
    .eq("professional_id", user.id);

  (txs || []).forEach(t => {
    if (t.client_id && !contactMap.has(t.client_id)) {
      contactMap.set(t.client_id, {
        lastMessage: "",
        lastMessageTime: new Date(0).toISOString(),
        unreadCount: 0
      });
    }
  });

  const contactIds = Array.from(contactMap.keys());
  if (contactIds.length === 0) return [];

  // 4. Fetch profiles for these contacts
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, phone")
    .in("id", contactIds);

  const contacts: ChatContact[] = (profiles || []).map(p => {
    const meta = contactMap.get(p.id)!;
    return {
      id: p.id,
      full_name: p.full_name || "Usuário",
      avatar_url: p.avatar_url,
      phone: p.phone,
      lastMessage: meta.lastMessage,
      lastMessageTime: meta.lastMessageTime,
      unreadCount: meta.unreadCount,
      isOnline: false // Online status could be derived from presence, hardcoded for now
    };
  });

  // Sort by lastMessageTime descending
  return contacts.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
}

export async function getChatMessages(contactId: string): Promise<ChatMessage[]> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }

  return data as ChatMessage[];
}

export async function sendMessage(receiverId: string, content: string): Promise<ChatMessage | null> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }

  return data as ChatMessage;
}

export async function markMessagesAsRead(senderId: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", senderId)
    .eq("receiver_id", user.id)
    .is("read_at", null);

  if (error) {
    console.error("Error marking messages as read:", error);
  }
}
