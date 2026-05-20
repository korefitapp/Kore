"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Package,
  Paperclip,
  Search,
  Send,
  Smile,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  orderRef: string;
}

/* ── Mock Data ──────────────────────────────────────────────── */

const SHOP_ID = "shop-main";

const MOCK_CONVERSATIONS: {
  contact: Omit<ChatContact, "lastMessage" | "lastMessageTime" | "unreadCount">;
  messages: Message[];
}[] = [
  {
    contact: {
      id: "cust-001",
      name: "Helena Prado",
      avatar: "🥗",
      orderRef: "#KORE-2048",
    },
    messages: [
      { id: "m1", senderId: "cust-001", content: "Oi! Meu pedido #KORE-2048 já foi enviado? Estou esperando o rastreio.", createdAt: "2026-05-19T09:00:00Z", readAt: "2026-05-19T09:05:00Z" },
      { id: "m2", senderId: SHOP_ID, content: "Bom dia, Helena! Sim, seu pedido foi despachado ontem à noite. O código de rastreio é BR9876543210. Prazo estimado: 3-5 dias úteis.", createdAt: "2026-05-19T09:10:00Z", readAt: "2026-05-19T09:12:00Z" },
      { id: "m3", senderId: "cust-001", content: "Obrigada! Vocês terão mais cores da camiseta Dry-Fit? Queria a azul no M.", createdAt: "2026-05-19T10:30:00Z", readAt: null },
      { id: "m4", senderId: "cust-001", content: "Ah, e o whey que veio no pedido tá perfeito, muito obrigada pelo brinde! 💚", createdAt: "2026-05-19T10:32:00Z", readAt: null },
    ],
  },
  {
    contact: {
      id: "cust-002",
      name: "Renan Castro",
      avatar: "🍳",
      orderRef: "#KORE-2045",
    },
    messages: [
      { id: "m5", senderId: "cust-002", content: "Boa tarde, troquei o whey por isolado mas não recebi a diferença. Como funciona?", createdAt: "2026-05-19T14:00:00Z", readAt: "2026-05-19T14:10:00Z" },
      { id: "m6", senderId: SHOP_ID, content: "Oi Renan! A diferença de R$ 45,00 será estornada no cartão em até 7 dias úteis. Já dei entrada no estorno agora.", createdAt: "2026-05-19T14:15:00Z", readAt: "2026-05-19T14:20:00Z" },
      { id: "m7", senderId: "cust-002", content: "Show, valeu! Pode me mandar a nota fiscal atualizada por e-mail?", createdAt: "2026-05-19T14:25:00Z", readAt: null },
    ],
  },
  {
    contact: {
      id: "cust-003",
      name: "Diego Martins",
      avatar: "🧑‍🏫",
      orderRef: "#KORE-2039",
    },
    messages: [
      { id: "m8", senderId: "cust-003", content: "Fala! A creatina veio com o lote diferente da foto. É normal?", createdAt: "2026-05-18T16:00:00Z", readAt: "2026-05-18T16:30:00Z" },
      { id: "m9", senderId: SHOP_ID, content: "Diego, sim! O fabricante atualizou a embalagem recentemente. O produto é exatamente o mesmo — Monohidratada 300g, purity 99.9%. Pode ficar tranquilo! 💪", createdAt: "2026-05-18T16:35:00Z", readAt: "2026-05-18T16:40:00Z" },
      { id: "m10", senderId: "cust-003", content: "Perfeito, obrigado pela rapidez!", createdAt: "2026-05-18T16:42:00Z", readAt: "2026-05-18T16:45:00Z" },
    ],
  },
  {
    contact: {
      id: "cust-004",
      name: "Ana Souza",
      avatar: "🍇",
      orderRef: "#KORE-2052",
    },
    messages: [
      { id: "m11", senderId: "cust-004", content: "Oi, quero cancelar meu pedido #KORE-2052. Ainda dá tempo?", createdAt: "2026-05-19T20:00:00Z", readAt: null },
    ],
  },
  {
    contact: {
      id: "cust-005",
      name: "Júlia Sant'Anna",
      avatar: "👩🏼‍⚕️",
      orderRef: "#KORE-2030",
    },
    messages: [
      { id: "m12", senderId: "cust-005", content: "Quero pedir 20 unidades do shaker para presentear meus alunos. Tem desconto para atacado?", createdAt: "2026-05-17T11:00:00Z", readAt: "2026-05-17T11:30:00Z" },
      { id: "m13", senderId: SHOP_ID, content: "Júlia, sim! Acima de 15 unidades oferecemos 15% de desconto. Vou preparar um orçamento personalizado pra você.", createdAt: "2026-05-17T11:35:00Z", readAt: "2026-05-17T11:40:00Z" },
      { id: "m14", senderId: "cust-005", content: "Maravilha! Pode incluir também 10 faixas elásticas? Quero o kit completo.", createdAt: "2026-05-17T11:45:00Z", readAt: "2026-05-17T12:00:00Z" },
      { id: "m15", senderId: SHOP_ID, content: "Claro! Monto o orçamento completo até amanhã e te envio por aqui e por e-mail. 📦", createdAt: "2026-05-17T12:05:00Z", readAt: "2026-05-17T12:10:00Z" },
    ],
  },
  {
    contact: {
      id: "cust-006",
      name: "Marcos Figueiredo",
      avatar: "🥩",
      orderRef: "#KORE-2041",
    },
    messages: [
      { id: "m16", senderId: "cust-006", content: "E aí, a pré-treino berry blast vai voltar? Tá esgotado no site!", createdAt: "2026-05-18T08:00:00Z", readAt: "2026-05-18T08:20:00Z" },
      { id: "m17", senderId: SHOP_ID, content: "Marcos, estamos com previsão de reposição para quarta-feira! Assim que entrar no estoque te aviso aqui. 🔔", createdAt: "2026-05-18T08:25:00Z", readAt: "2026-05-18T08:30:00Z" },
      { id: "m18", senderId: "cust-006", content: "Beleza, pode reservar 2 potes pra mim? Já quero garantir!", createdAt: "2026-05-18T08:32:00Z", readAt: null },
    ],
  },
];

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

export function MessagesPageClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [localConversations, setLocalConversations] = useState(MOCK_CONVERSATIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build contact list with metadata
  const contacts: ChatContact[] = useMemo(() => {
    return localConversations.map((conv) => {
      const msgs = conv.messages;
      const last = msgs[msgs.length - 1];
      const unread = msgs.filter(
        (m) => m.senderId !== SHOP_ID && m.readAt === null,
      ).length;
      return {
        ...conv.contact,
        lastMessage: last?.content ?? "Nenhuma mensagem",
        lastMessageTime: last?.createdAt ?? "",
        unreadCount: unread,
      };
    });
  }, [localConversations]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.orderRef.toLowerCase().includes(q),
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

  // Selected conversation messages
  const selectedConv = useMemo(
    () => localConversations.find((c) => c.contact.id === selectedId) ?? null,
    [localConversations, selectedId],
  );

  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedId) ?? null,
    [contacts, selectedId],
  );

  // Group messages by date
  const messagesByDate = useMemo(() => {
    if (!selectedConv) return [];
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    selectedConv.messages.forEach((msg) => {
      const d = new Date(msg.createdAt);
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: msg.createdAt, messages: [msg] });
      } else {
        const last = groups[groups.length - 1];
        if (last) last.messages.push(msg);
      }
    });
    return groups;
  }, [selectedConv]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages.length]);

  // Focus input on select
  useEffect(() => {
    if (selectedId && window.innerWidth >= 1024) {
      inputRef.current?.focus();
    }
  }, [selectedId]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || !selectedId) return;
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      senderId: SHOP_ID,
      content: inputValue.trim(),
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    setLocalConversations((prev) =>
      prev.map((conv) =>
        conv.contact.id === selectedId
          ? { ...conv, messages: [...conv.messages, newMsg] }
          : conv,
      ),
    );
    setInputValue("");
  }, [inputValue, selectedId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
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
                selectedId ? "hidden lg:flex" : "flex"
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
                      onClick={() => setSelectedId(contact.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition border-b border-kore-border/50 hover:bg-kore-bg/80 ${
                        selectedId === contact.id
                          ? "bg-kore-emerald-soft border-l-[3px] border-l-kore-emerald"
                          : "border-l-[3px] border-l-transparent"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-kore-emerald/10 grid place-items-center flex-shrink-0 text-xl">
                        {contact.avatar}
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
                !selectedId ? "hidden lg:flex" : "flex"
              }`}
            >
              {selectedContact && selectedConv ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-kore-border bg-kore-card/40">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="lg:hidden w-9 h-9 grid place-items-center rounded-xl hover:bg-kore-bg transition text-kore-muted hover:text-kore-ink"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-kore-emerald/10 grid place-items-center flex-shrink-0 text-lg">
                      {selectedContact.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-kore-ink truncate">
                        {selectedContact.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Package size={12} className="text-kore-emerald-deep" />
                        <span className="text-[11px] font-bold text-kore-emerald-deep">
                          Pedido {selectedContact.orderRef}
                        </span>
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
                          const isMine = msg.senderId === SHOP_ID;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMine ? "justify-end" : "justify-start"} ${idx > 0 ? "mt-1" : ""}`}
                            >
                              {!isMine && (
                                <div className="w-7 h-7 rounded-full bg-kore-muted/20 grid place-items-center flex-shrink-0 mr-2 text-xs">
                                  {selectedContact.avatar}
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
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {isMine && msg.readAt && <ReadCheck />}
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
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
                      />
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
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