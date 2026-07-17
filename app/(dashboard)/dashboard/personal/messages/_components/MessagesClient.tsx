"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, MoreVertical, Phone, Paperclip, Search, Send, Smile, Video, QrCode, Smartphone, RefreshCw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { connectWhatsAppInstance, sendWhatsAppMessage } from "@/app/actions/whatsapp-actions";
import { getChatMessages, markMessagesAsRead, sendMessage as sendInternalMessage, type ChatContact, type ChatMessage } from "@/app/actions/chat-actions";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */
// Reusing ChatContact and ChatMessage from chat-actions.ts

/* ── Helpers ────────────────────────────────────────────────── */
function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatContactTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return formatMessageTime(iso);
  }

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

  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

/* ── Component ──────────────────────────────────────────────── */
export function MessagesClient({
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

  const supabase = createSupabaseBrowserClient();
  const [instanceStatus, setInstanceStatus] = useState<string>(initialInstanceStatus);
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
  }, [currentUserId, supabase]);

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


  // Filter contacts
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter((c) =>
      (c.full_name ?? "").toLowerCase().includes(q),
    );
  }, [contacts, searchQuery]);

  // Sort contacts: unread first, then by last message time
  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      if (a.lastMessageTime && b.lastMessageTime) {
        return (
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime()
        );
      }
      return 0;
    });
  }, [filteredContacts]);

  // Get messages for selected conversation
  const conversationMessages = localMessages;

  // Group messages by date
  const messagesByDate = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";

    conversationMessages.forEach((msg) => {
      const d = new Date(msg.created_at);
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: msg.created_at, messages: [msg] });
      } else {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup) {
          lastGroup.messages.push(msg);
        }
      }
    });

    return groups;
  }, [conversationMessages]);

  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length]);

  // Focus input when selecting a contact
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
      // Se a instância estiver conectada, enviamos via whatsapp
      if (instanceStatus === "open") {
         // O whatsapp-actions envia a mensagem e TAMBÉM grava no banco public.messages.
         // Mas como já temos o sendMessage() que apenas salva, e o web-hook salva também?
         // O ideal é chamar sendWhatsAppMessage SE estiver conectado. O sendWhatsAppMessage JÁ salva no banco.
         // Vamos apenas chamar sendWhatsAppMessage para simplificar, já que ele insere na tabela 'messages'.
         await sendWhatsAppMessage(selectedContactId, contact.phone || "", textToSend);
      } else {
         // Não tem whatsapp conectado, apenas envia internamente
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

  const handleSelectContact = useCallback((id: string) => {
    setSelectedContactId(id);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedContactId(null);
  }, []);

  return (
    <div className="h-screen flex bg-kore-bg text-kore-ink overflow-hidden">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* ── Header ───────────────────────────────────────── */}
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
                  {contacts.reduce((acc, c) => acc + c.unreadCount, 0) > 0
                    ? `${contacts.reduce((acc, c) => acc + c.unreadCount, 0)} mensagens não lidas`
                    : "Todas as conversas em dia"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Chat Container ───────────────────────────────── */}
          <div className="flex-1 mx-3 sm:mx-6 mb-6 rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden flex">
            {/* ── Left Column: Contact List ─────────────────── */}
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
                    placeholder="Buscar conversa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
                  />
                </div>
              </div>

              {/* Contact List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-kore-border hover:scrollbar-thumb-kore-emerald/50">
                {sortedContacts.length > 0 ? (
                  sortedContacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => handleSelectContact(contact.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition border-b border-kore-border/50 hover:bg-kore-bg/80 ${
                        selectedContactId === contact.id
                          ? "bg-kore-emerald-soft border-l-[3px] border-l-kore-emerald"
                          : "border-l-[3px] border-l-transparent"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-kore-emerald/10 grid place-items-center overflow-hidden">
                          {contact.avatar_url ? (
                            <img
                              src={contact.avatar_url}
                              alt={contact.full_name ?? ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-kore-emerald-deep">
                              {getInitials(contact.full_name)}
                            </span>
                          )}
                        </div>
                        {contact.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-kore-card" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm font-bold truncate ${
                              contact.unreadCount > 0
                                ? "text-kore-ink"
                                : "text-kore-ink/80"
                            }`}
                          >
                            {contact.full_name ?? "Aluno"}
                          </p>
                          {contact.lastMessageTime && (
                            <span
                              className={`text-[10px] font-semibold flex-shrink-0 tabular-nums ${
                                contact.unreadCount > 0
                                  ? "text-kore-emerald-deep"
                                  : "text-kore-muted"
                              }`}
                            >
                              {formatContactTime(contact.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p
                            className={`text-xs truncate ${
                              contact.unreadCount > 0
                                ? "text-kore-subink font-semibold"
                                : "text-kore-muted"
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
                    <p className="text-sm font-bold text-kore-ink">
                      Nenhum contato encontrado
                    </p>
                    <p className="text-xs text-kore-muted mt-1">
                      Tente buscar por outro nome
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Column: Chat Window ─────────────────── */}
            <div
              className={`flex-1 flex flex-col min-w-0 ${
                !selectedContactId ? "hidden lg:flex" : "flex"
              }`}
            >
              {(instanceStatus === "disconnected" || instanceStatus === "connecting") ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-kore-bg/40">
                  <div className="max-w-sm w-full bg-kore-card border border-kore-border rounded-3xl p-8 flex flex-col items-center text-center shadow-kore-soft">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center mb-6">
                      <Smartphone size={32} className="text-emerald-600" />
                    </div>

                    <h2 className="text-xl font-extrabold tracking-tight mb-2">
                      Conecte o seu WhatsApp
                    </h2>
                    <p className="text-xs text-kore-muted mb-6 leading-relaxed">
                      Para conversar com os seus alunos diretamente pelo KORE, vincule o seu número.
                    </p>

                    {qrCode ? (
                      <div className="bg-white p-3 rounded-2xl mb-6 shadow-sm border border-black/5">
                        <img src={qrCode} alt="WhatsApp QR Code" className="w-40 h-40 mx-auto" />
                        <p className="text-[10px] text-kore-muted font-medium mt-2 text-center">
                          Leia o código com o seu WhatsApp
                        </p>
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-kore-bg border-2 border-dashed border-kore-border rounded-2xl mb-6 grid place-items-center">
                        <QrCode size={40} className="text-kore-muted/50" />
                      </div>
                    )}

                    <button
                      onClick={handleConnectWhatsApp}
                      disabled={isConnecting}
                      className="w-full btn-emerald py-3 flex items-center justify-center gap-2 text-sm"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          A gerar...
                        </>
                      ) : (
                        <>
                          {qrCode ? "Gerar Novo Código" : "Gerar QR Code"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : selectedContact ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-kore-border bg-kore-card/40">
                    {/* Back button (mobile) */}
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="lg:hidden w-9 h-9 grid place-items-center rounded-xl hover:bg-kore-bg transition text-kore-muted hover:text-kore-ink"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    {/* Contact info */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-kore-emerald/10 grid place-items-center overflow-hidden">
                        {selectedContact.avatar_url ? (
                          <img
                            src={selectedContact.avatar_url}
                            alt={selectedContact.full_name ?? ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-kore-emerald-deep">
                            {getInitials(selectedContact.full_name)}
                          </span>
                        )}
                      </div>
                      {selectedContact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-kore-card" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-kore-ink truncate">
                        {selectedContact.full_name ?? "Aluno"}
                      </p>
                      <p className="text-[11px] text-kore-muted">
                        {selectedContact.isOnline
                          ? "Online agora"
                          : "Offline"}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Ligação"
                        className="w-9 h-9 grid place-items-center rounded-xl hover:bg-kore-bg transition text-kore-muted hover:text-kore-ink"
                      >
                        <Phone size={17} />
                      </button>
                      <button
                        type="button"
                        aria-label="Videochamada"
                        className="w-9 h-9 grid place-items-center rounded-xl hover:bg-kore-bg transition text-kore-muted hover:text-kore-ink"
                      >
                        <Video size={17} />
                      </button>
                      <button
                        type="button"
                        aria-label="Mais opções"
                        className="w-9 h-9 grid place-items-center rounded-xl hover:bg-kore-bg transition text-kore-muted hover:text-kore-ink"
                      >
                        <MoreVertical size={17} />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-kore-border hover:scrollbar-thumb-kore-emerald/50">
                    {messagesByDate.map((group) => (
                      <div key={group.date}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-4">
                          <span className="px-3 py-1 rounded-full bg-kore-bg border border-kore-border text-[10px] font-bold text-kore-muted uppercase tracking-wider">
                            {formatDateSeparator(group.date)}
                          </span>
                        </div>

                        {/* Messages */}
                        {group.messages.map((msg, idx) => {
                          const isMine = msg.sender_id === currentUserId;
                          const prevMsg = idx > 0 ? group.messages[idx - 1] : undefined;
                          const showAvatar =
                            !isMine &&
                            (idx === 0 || prevMsg?.sender_id !== msg.sender_id);

                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMine ? "justify-end" : "justify-start"} ${idx > 0 ? "mt-1" : ""}`}
                            >
                              {/* Student avatar */}
                              {!isMine && (
                                <div
                                  className={`w-7 h-7 rounded-full bg-kore-muted/20 grid place-items-center flex-shrink-0 mr-2 overflow-hidden ${
                                    showAvatar ? "visible" : "invisible"
                                  }`}
                                >
                                  {selectedContact.avatar_url ? (
                                    <img
                                      src={selectedContact.avatar_url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[9px] font-bold text-kore-muted">
                                      {getInitials(
                                        selectedContact.full_name,
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div
                                className={`max-w-[75%] sm:max-w-[65%] ${isMine ? "ml-auto" : ""}`}
                              >
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
                                    {formatMessageTime(msg.created_at)}
                                  </span>
                                  {isMine && msg.read_at && (
                                    <ReadCheck />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
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
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        aria-label="Enviar mensagem"
                        className={`w-10 h-10 grid place-items-center rounded-xl transition flex-shrink-0 ${
                          newMessage.trim() && !isSending
                            ? "bg-kore-emerald text-white hover:brightness-110 shadow-kore-emerald"
                            : "bg-kore-bg border border-kore-border text-kore-muted cursor-not-allowed"
                        }`}
                      >
                        {isSending ? (
                          <RefreshCw size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 rounded-3xl bg-kore-emerald-soft grid place-items-center mb-5">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-kore-emerald-deep"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="9" y1="10" x2="15" y2="10" />
                      <line x1="12" y1="7" x2="12" y2="13" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-extrabold text-kore-ink">
                    Selecione uma conversa
                  </h2>
                  <p className="text-sm text-kore-muted mt-2 max-w-xs">
                    Escolha um aluno na lista ao lado para iniciar ou continuar
                    uma conversa
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
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-emerald-600"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ReadCheck() {
  return (
    <svg
      width="16"
      height="10"
      viewBox="0 0 16 10"
      fill="none"
      className="text-kore-emerald"
    >
      <path
        d="M1 5.5L4 8.5L9 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 5.5L9 8.5L14 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}