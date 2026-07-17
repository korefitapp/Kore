"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MoreVertical, Package, Paperclip, Search, Send, Smile, QrCode, Smartphone, RefreshCw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { connectWhatsAppInstance, sendWhatsAppMessage } from "@/app/actions/whatsapp-actions";
import { getChatMessages, markMessagesAsRead, sendMessage as sendInternalMessage, type ChatContact, type ChatMessage } from "@/app/actions/chat-actions";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */

/* ── Types ──────────────────────────────────────────────────── */
// Reusing ChatContact and ChatMessage from chat-actions.ts

/* ── Helpers ────────────────────────────────────────────────── */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatContactTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) return formatTime(iso);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return "Ontem";

  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateSeparator(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(d, now)) return "Hoje";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Ontem";
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

/* ── Component ──────────────────────────────────────────────── */

export function MessagesPageClient({
  currentUserId,
  initialInstanceStatus,
  initialQrCode,
  initialContacts,
}: {
  currentUserId: string;
  initialInstanceStatus: string;
  initialQrCode: string | null;
  initialContacts: ChatContact[];
}) {
  const supabase = createSupabaseBrowserClient();
  const [contacts, setContacts] = useState<ChatContact[]>(initialContacts);

  const [instanceStatus, setInstanceStatus] = useState(initialInstanceStatus);
  const [qrCode, setQrCode] = useState<string | null>(initialQrCode);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carrega as mensagens ao selecionar um contato
  useEffect(() => {
    if (selectedContactId) {
      getChatMessages(selectedContactId).then(msgs => {
        setLocalMessages(msgs);
        markMessagesAsRead(selectedContactId).then(() => {
          setContacts(prev => prev.map(c => 
            c.id === selectedContactId ? { ...c, unreadCount: 0 } : c
          ));
        });
      });
    } else {
      setLocalMessages([]);
    }
  }, [selectedContactId]);

  // Realtime Supabase Setup
  useEffect(() => {
    const messagesChannel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          
          if (newMsg.sender_id === currentUserId || newMsg.receiver_id === currentUserId) {
            const otherId = newMsg.sender_id === currentUserId ? newMsg.receiver_id : newMsg.sender_id;
            
            // Atualiza mensagens abertas se for desta conversa
            setLocalMessages((prev) => {
              if (selectedContactId === otherId && !prev.some(m => m.id === newMsg.id)) {
                return [...prev, newMsg];
              }
              return prev;
            });

            // Se for do contato atual, marca como lida
            if (selectedContactId === otherId && newMsg.receiver_id === currentUserId) {
              markMessagesAsRead(otherId);
            }

            // Atualiza contato
            setContacts(prev => prev.map(c => {
              if (c.id === otherId) {
                return {
                  ...c,
                  lastMessage: newMsg.content,
                  lastMessageTime: newMsg.created_at,
                  unreadCount: (newMsg.receiver_id === currentUserId && selectedContactId !== otherId && !newMsg.read_at) 
                    ? c.unreadCount + 1 : c.unreadCount
                };
              }
              return c;
            }));
          }
        }
      )
      .subscribe();

    const instanceChannel = supabase
      .channel("realtime:whatsapp_instances")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "whatsapp_instances", filter: `professional_id=eq.${currentUserId}` },
        (payload) => {
          const newData = payload.new;
          if (newData.status) setInstanceStatus(newData.status);
          if (newData.qr_code_base64) setQrCode(newData.qr_code_base64);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(instanceChannel);
    };
  }, [currentUserId, supabase, selectedContactId]);

  const handleConnectWhatsApp = async () => {
    setIsConnecting(true);
    try {
      const res = await connectWhatsAppInstance();
      if (res.qrCode) {
        setQrCode(res.qrCode);
      }
      setInstanceStatus("connecting");
    } catch (err: any) {
      const { toast } = require("@/store/useToastStore");
      toast.error("Erro ao conectar: " + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        (c.full_name || "").toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  // Sort: unread first, then by time
  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });
  }, [filteredContacts]);

  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  );

  // Group messages by date
  const messagesByDate = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";
    localMessages.forEach((msg) => {
      const d = new Date(msg.created_at);
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: msg.created_at, messages: [msg] });
      } else {
        const last = groups[groups.length - 1];
        if (last) last.messages.push(msg);
      }
    });
    return groups;
  }, [localMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages.length]);

  // Focus input on select
  useEffect(() => {
    if (selectedContactId && window.innerWidth >= 1024) {
      inputRef.current?.focus();
    }
  }, [selectedContactId]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedContactId || isSending) return;

    const contact = contacts.find(c => c.id === selectedContactId);
    if (!contact) return;

    const textToSend = newMessage.trim();
    const tempMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: selectedContactId,
      content: textToSend,
      created_at: new Date().toISOString(),
      read_at: null,
    };

    setLocalMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");
    setIsSending(true);

    try {
      if (instanceStatus === "open") {
         await sendWhatsAppMessage(selectedContactId, contact.phone || "", textToSend);
      } else {
         await sendInternalMessage(selectedContactId, textToSend);
      }
    } catch (error: any) {
      const { toast } = require("@/store/useToastStore");
      toast.error("Falha ao enviar mensagem: " + error.message);
      setLocalMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    } finally {
      setIsSending(false);
    }
  }, [newMessage, selectedContactId, currentUserId, contacts, isSending, instanceStatus]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-3 sm:px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                <MessageSquareIcon />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Central de Mensagens
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  {contacts.reduce((a, c) => a + c.unreadCount, 0) > 0
                    ? `${contacts.reduce((a, c) => a + c.unreadCount, 0)} mensagens não lidas`
                    : "Todos os atendimentos em dia"}
                </p>
              </div>
            </div>
          </div>

          {/* Chat container */}
          <div className="flex-1 mx-3 sm:mx-6 mb-6 rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden flex">
            {/* ── Left: Contact List ─────────────────────── */}
            <div
              className={`w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 border-r border-kore-border flex flex-col ${
                selectedContactId ? "hidden lg:flex" : "flex"
              }`}
            >
              {/* Search */}
              <div className="p-3 border-b border-kore-border">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
                  />
                  <input
                    type="text"
                    placeholder="Buscar por cliente ou pedido…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
                  />
                </div>
              </div>

              {/* Contact list */}
              <div className="flex-1 overflow-y-auto">
                {sortedContacts.length > 0 ? (
                  sortedContacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition border-b border-kore-border/50 hover:bg-kore-bg/80 ${
                        selectedContactId === contact.id
                          ? "bg-kore-emerald-soft border-l-[3px] border-l-kore-emerald"
                          : "border-l-[3px] border-l-transparent"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-kore-emerald/10 grid place-items-center flex-shrink-0 text-xl font-bold text-kore-emerald">
                        {getInitials(contact.name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm font-bold truncate ${
                              contact.unreadCount > 0 ? "text-kore-ink" : "text-kore-ink/80"
                            }`}
                          >
                            {contact.name}
                          </p>
                          {contact.lastMessageTime && (
                            <span
                              className={`text-[10px] font-semibold flex-shrink-0 tabular-nums ${
                                contact.unreadCount > 0 ? "text-kore-emerald-deep" : "text-kore-muted"
                              }`}
                            >
                              {formatContactTime(contact.lastMessageTime)}
                            </span>
                          )}
                        </div>

                        {/* Order ref */}
                        <p className="text-[10px] font-bold text-kore-emerald-deep mt-0.5">
                          Pedido {contact.orderRef}
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p
                            className={`text-xs truncate ${
                              contact.unreadCount > 0 ? "text-kore-subink font-semibold" : "text-kore-muted"
                            }`}
                          >
                            {contact.lastMessage}
                          </p>
                          {contact.unreadCount > 0 && (
                            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-kore-emerald text-white text-[10px] font-bold grid place-items-center">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-kore-bg grid place-items-center mb-3">
                      <Search size={20} className="text-kore-muted" />
                    </div>
                    <p className="text-sm font-bold text-kore-ink">Nenhum chat encontrado</p>
                    <p className="text-xs text-kore-muted mt-1">Tente buscar por outro nome ou pedido</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Chat Window ────────────────────── */}
            <div
              className={`flex-1 flex flex-col min-w-0 ${
                !selectedContactId ? "hidden lg:flex" : "flex"
              }`}
            >
              {selectedContact ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-kore-border bg-kore-card/40">
                    <button
                      type="button"
                      onClick={() => setSelectedContactId(null)}
                      className="lg:hidden w-9 h-9 grid place-items-center rounded-xl hover:bg-kore-bg transition text-kore-muted hover:text-kore-ink"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-kore-emerald/10 grid place-items-center flex-shrink-0 text-sm font-bold text-kore-emerald">
                      {getInitials(selectedContact.full_name)}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground leading-none mb-1">
                        {selectedContact.full_name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Cliente
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Mais opções"
                      className="w-9 h-9 grid place-items-center rounded-xl hover:bg-kore-bg transition text-kore-muted hover:text-kore-ink"
                    >
                      <MoreVertical size={17} />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    {messagesByDate.map((group) => (
                      <div key={group.date}>
                        <div className="flex items-center justify-center my-4">
                          <span className="px-3 py-1 rounded-full bg-kore-bg border border-kore-border text-[10px] font-bold text-kore-muted uppercase tracking-wider">
                            {formatDateSeparator(group.date)}
                          </span>
                        </div>

                        {group.messages.map((msg, idx) => {
                          const isMine = msg.sender_id === currentUserId;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMine ? "justify-end" : "justify-start"} ${idx > 0 ? "mt-1" : ""}`}
                            >
                              {!isMine && (
                                <div className="w-7 h-7 rounded-full bg-kore-muted/20 grid place-items-center flex-shrink-0 mr-2 text-xs">
                                  {getInitials(selectedContact.full_name)}
                                </div>
                              )}
                              <div className={`max-w-[75%] sm:max-w-[65%] ${isMine ? "ml-auto" : ""}`}>
                                <div
                                  className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                                    isMine
                                      ? "bg-emerald-600 text-white rounded-2xl rounded-br-md"
                                      : "bg-kore-bg border border-kore-border/60 text-kore-ink rounded-2xl rounded-bl-md"
                                  }`}
                                >
                                  {msg.content}
                                </div>
                                <div
                                  className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}
                                >
                                  <span className="text-[10px] text-kore-muted tabular-nums">
                                    {formatTime(msg.created_at)}
                                  </span>
                                  {isMine && msg.read_at && <ReadCheck />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-kore-border px-4 py-3 bg-kore-card/40">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Anexar arquivo"
                        className="w-9 h-9 grid place-items-center rounded-xl hover:bg-kore-bg transition text-kore-muted hover:text-kore-ink flex-shrink-0"
                      >
                        <Paperclip size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label="Emoji"
                        className="w-9 h-9 grid place-items-center rounded-xl hover:bg-kore-bg transition text-kore-muted hover:text-kore-ink flex-shrink-0"
                      >
                        <Smile size={18} />
                      </button>
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Digite sua mensagem…"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        aria-label="Enviar"
                        className={`w-10 h-10 grid place-items-center rounded-xl transition flex-shrink-0 ${
                          inputValue.trim()
                            ? "bg-kore-emerald text-white hover:brightness-110 shadow-kore-emerald"
                            : "bg-kore-bg border border-kore-border text-kore-muted cursor-not-allowed"
                        }`}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 rounded-3xl bg-kore-emerald-soft grid place-items-center mb-5">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-kore-emerald-deep">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="9" y1="10" x2="15" y2="10" />
                      <line x1="12" y1="7" x2="12" y2="13" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-extrabold text-kore-ink">Selecione uma conversa</h2>
                  <p className="text-sm text-kore-muted mt-2 max-w-xs">
                    Escolha um chat de suporte na lista ao lado para responder seu cliente
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function MessageSquareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ReadCheck() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="text-kore-emerald">
      <path d="M1 5.5L4 8.5L9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5.5L9 8.5L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}