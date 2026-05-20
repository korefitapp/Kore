"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Smile,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface ContactWithMeta extends Profile {
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

/* ── Mock Data ──────────────────────────────────────────────── */
const MOCK_PROFILES: Profile[] = [
  { id: "patient-1", full_name: "Ana Carolina Silva", avatar_url: null },
  { id: "patient-2", full_name: "Bruno Costa Oliveira", avatar_url: null },
  { id: "patient-3", full_name: "Camila Ferreira Santos", avatar_url: null },
  { id: "patient-4", full_name: "Diego Almeida Lima", avatar_url: null },
  { id: "patient-5", full_name: "Elena Rodrigues Pereira", avatar_url: null },
  { id: "patient-6", full_name: "Felipe Souza Martins", avatar_url: null },
  { id: "patient-7", full_name: "Gabriela Mendes Rocha", avatar_url: null },
  { id: "patient-8", full_name: "Hugo Nascimento Barbosa", avatar_url: null },
];

const NUTRI_ID = "nutri-main";

const MOCK_MESSAGES: Message[] = [
  // Conversa com Ana Carolina — ativa, com não-lidas
  {
    id: "m1",
    sender_id: NUTRI_ID,
    receiver_id: "patient-1",
    content: "Bom dia, Ana! Vi que você registrou todas as refeições de ontem no app. Parabéns pela disciplina! 🎉",
    created_at: "2026-05-19T08:30:00Z",
    read_at: "2026-05-19T08:32:00Z",
  },
  {
    id: "m2",
    sender_id: "patient-1",
    receiver_id: NUTRI_ID,
    content: "Bom dia, Dra! Obrigada! Estou me sentindo muito melhor desde que comecei a seguir o plano. A minha disposição aumentou muito!",
    created_at: "2026-05-19T08:33:00Z",
    read_at: "2026-05-19T08:34:00Z",
  },
  {
    id: "m3",
    sender_id: NUTRI_ID,
    receiver_id: "patient-1",
    content: "Que ótimo! Isso mostra que o corpo está se adaptando bem. Só uma observação: tente incluir mais proteína no café da manhã. Ovos, iogurte grego ou whey protein são boas opções.",
    created_at: "2026-05-19T08:35:00Z",
    read_at: "2026-05-19T08:36:00Z",
  },
  {
    id: "m4",
    sender_id: "patient-1",
    receiver_id: NUTRI_ID,
    content: "Vou anotar! Posso substituir o pão integral por tapioca? Às vezes fico enjoada com pão de manhã.",
    created_at: "2026-05-19T09:10:00Z",
    read_at: null,
  },
  {
    id: "m5",
    sender_id: "patient-1",
    receiver_id: NUTRI_ID,
    content: "E sobre o lanche da tarde, posso comer frutas secas? Tipo castanhas e amêndoas?",
    created_at: "2026-05-19T09:11:00Z",
    read_at: null,
  },

  // Conversa com Bruno — consulta recente
  {
    id: "m6",
    sender_id: "patient-2",
    receiver_id: NUTRI_ID,
    content: "Dra, estou com dificuldade para seguir a dieta nos fins de semana. Sempre acabo exagerando no churrasco 😅",
    created_at: "2026-05-19T07:00:00Z",
    read_at: "2026-05-19T07:15:00Z",
  },
  {
    id: "m7",
    sender_id: NUTRI_ID,
    receiver_id: "patient-2",
    content: "Bruno, relaxa! O importante é o equilíbrio. Vou te passar um guia de opções saudáveis para churrasco. Carne magra, saladas e legumes grelhados são ótimas escolhas. Evite excesso de pão de alho e maionese.",
    created_at: "2026-05-19T07:20:00Z",
    read_at: "2026-05-19T07:25:00Z",
  },
  {
    id: "m8",
    sender_id: "patient-2",
    receiver_id: NUTRI_ID,
    content: "Perfeito! Vou tentar seguir. Aproveitando, acho que perdi 1kg essa semana. Posso me pesar de novo na sexta?",
    created_at: "2026-05-19T07:26:00Z",
    read_at: "2026-05-19T07:30:00Z",
  },
  {
    id: "m9",
    sender_id: NUTRI_ID,
    receiver_id: "patient-2",
    content: "Claro! Pesa em jejum, pela manhã. E não se preocupe com oscilações naturais — o que importa é a tendência no mês. Estamos no caminho certo! 💪",
    created_at: "2026-05-19T07:45:00Z",
    read_at: "2026-05-19T08:00:00Z",
  },

  // Conversa com Camila — resultados positivos
  {
    id: "m10",
    sender_id: NUTRI_ID,
    receiver_id: "patient-3",
    content: "Camila, seus exames de sangue chegaram! O colesterol LDL baixou 15 pontos. A alimentação está fazendo efeito! 📊",
    created_at: "2026-05-18T18:00:00Z",
    read_at: "2026-05-18T18:10:00Z",
  },
  {
    id: "m11",
    sender_id: "patient-3",
    receiver_id: NUTRI_ID,
    content: "Nossa, que notícia boa! Estou muito feliz! 🎉 Isso significa que posso manter a mesma dieta?",
    created_at: "2026-05-18T18:12:00Z",
    read_at: "2026-05-18T18:15:00Z",
  },
  {
    id: "m12",
    sender_id: NUTRI_ID,
    receiver_id: "patient-3",
    content: "Sim! Vamos manter e ajustar alguns detalhes na próxima consulta. Continua incluindo ômega-3 e fibras. Você está indo muito bem! 😊",
    created_at: "2026-05-18T18:20:00Z",
    read_at: "2026-05-18T18:25:00Z",
  },

  // Conversa com Diego — intolerância alimentar
  {
    id: "m13",
    sender_id: "patient-4",
    receiver_id: NUTRI_ID,
    content: "Dra, tive uma reação depois de tomar leite ontem. Inchaço e desconforto. Será que sou intolerante à lactose?",
    created_at: "2026-05-19T10:00:00Z",
    read_at: "2026-05-19T10:05:00Z",
  },
  {
    id: "m14",
    sender_id: NUTRI_ID,
    receiver_id: "patient-4",
    content: "Diego, pode ser. Vou te orientar a fazer um teste de exclusão por 2 semanas. Remove todos os laticínios e depois reintroduz um por vez. Te enviei um guia completo no e-mail.",
    created_at: "2026-05-19T10:10:00Z",
    read_at: "2026-05-19T10:15:00Z",
  },
  {
    id: "m15",
    sender_id: "patient-4",
    receiver_id: NUTRI_ID,
    content: "Ok, vou seguir. E o que posso tomar no lugar do leite? Leite de amêndoa é uma boa opção?",
    created_at: "2026-05-19T10:18:00Z",
    read_at: null,
  },

  // Conversa com Elena — consulta de retorno
  {
    id: "m16",
    sender_id: "patient-5",
    receiver_id: NUTRI_ID,
    content: "Oi, doutora! Queria confirmar minha consulta de retorno. É na quinta às 14h, certo?",
    created_at: "2026-05-19T11:00:00Z",
    read_at: "2026-05-19T11:20:00Z",
  },
  {
    id: "m17",
    sender_id: NUTRI_ID,
    receiver_id: "patient-5",
    content: "Oi, Elena! Sim, confirmado quinta às 14h. Traga sua ficha alimentar da última semana e os exames que pedi. Até lá! 📋",
    created_at: "2026-05-19T11:25:00Z",
    read_at: "2026-05-19T11:30:00Z",
  },

  // Conversa com Felipe — suplementação
  {
    id: "m18",
    sender_id: NUTRI_ID,
    receiver_id: "patient-6",
    content: "Felipe, parabéns pela consistência! 30 dias seguindo o plano alimentar sem falhar. Isso é impressionante! 🔥",
    created_at: "2026-05-18T20:00:00Z",
    read_at: "2026-05-18T20:30:00Z",
  },
  {
    id: "m19",
    sender_id: "patient-6",
    receiver_id: NUTRI_ID,
    content: "Obrigado, Dra! Tô me sentindo muito melhor. Queria perguntar: posso começar a tomar whey protein junto com o plano?",
    created_at: "2026-05-18T20:35:00Z",
    read_at: "2026-05-18T20:40:00Z",
  },

  // Conversa com Gabriela — gestante
  {
    id: "m20",
    sender_id: "patient-7",
    receiver_id: NUTRI_ID,
    content: "Doutora, estou no 5º mês de gestação. Tenho sentido muita azia depois das refeições. O que posso fazer?",
    created_at: "2026-05-17T14:00:00Z",
    read_at: "2026-05-17T14:30:00Z",
  },
  {
    id: "m21",
    sender_id: NUTRI_ID,
    receiver_id: "patient-7",
    content: "Gabriela, é comum na gestação. Tente fazer refeições menores e mais frequentes. Evite deitar logo após comer. Vou ajustar seu plano com alimentos menos ácidos. Frutas como banana e mamão são ótimas!",
    created_at: "2026-05-17T14:35:00Z",
    read_at: "2026-05-17T14:40:00Z",
  },

  // Conversa com Hugo — desistência
  {
    id: "m22",
    sender_id: "patient-8",
    receiver_id: NUTRI_ID,
    content: "Dra, vou precisar cancelar minha consulta de amanhã. Tive um imprevisto no trabalho. Me desculpa pelo aviso em cima da hora.",
    created_at: "2026-05-19T06:00:00Z",
    read_at: "2026-05-19T06:10:00Z",
  },
  {
    id: "m23",
    sender_id: NUTRI_ID,
    receiver_id: "patient-8",
    content: "Sem problemas, Hugo! Acontece. Vamos reagendar para a próxima semana. Enquanto isso, tenta manter as refeições programadas. Força no trabalho! 💪",
    created_at: "2026-05-19T06:15:00Z",
    read_at: "2026-05-19T06:20:00Z",
  },
];

const MOCK_ONLINE_IDS = new Set(["patient-1", "patient-4", "patient-5"]);

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
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) return formatMessageTime(iso);

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
  profiles: serverProfiles,
  messages: serverMessages,
}: {
  currentUserId: string;
  profiles: Profile[];
  messages: Message[];
}) {
  const profiles = serverProfiles.length > 0 ? serverProfiles : MOCK_PROFILES;
  const allMessages =
    serverMessages.length > 0 ? serverMessages : MOCK_MESSAGES;
  const onlineIds = MOCK_ONLINE_IDS;

  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>(allMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build contacts with metadata
  const contacts: ContactWithMeta[] = useMemo(() => {
    return profiles.map((p) => {
      const convMessages = localMessages.filter(
        (m) =>
          (m.sender_id === currentUserId && m.receiver_id === p.id) ||
          (m.sender_id === p.id && m.receiver_id === currentUserId),
      );

      const lastMsg =
        convMessages.length > 0
          ? convMessages[convMessages.length - 1]
          : null;

      const unreadCount = convMessages.filter(
        (m) => m.sender_id === p.id && m.read_at === null,
      ).length;

      return {
        ...p,
        lastMessage: lastMsg?.content ?? "Nenhuma mensagem ainda",
        lastMessageTime: lastMsg?.created_at ?? "",
        unreadCount,
        isOnline: onlineIds.has(p.id),
      };
    });
  }, [profiles, localMessages, currentUserId, onlineIds]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter((c) =>
      (c.full_name ?? "").toLowerCase().includes(q),
    );
  }, [contacts, searchQuery]);

  // Sort: unread first, then by last message time
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

  // Messages for selected conversation
  const conversationMessages = useMemo(() => {
    if (!selectedContactId) return [];
    return localMessages.filter(
      (m) =>
        (m.sender_id === currentUserId &&
          m.receiver_id === selectedContactId) ||
        (m.sender_id === selectedContactId &&
          m.receiver_id === currentUserId),
    );
  }, [localMessages, selectedContactId, currentUserId]);

  // Group messages by date
  const messagesByDate = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";

    conversationMessages.forEach((msg) => {
      const d = new Date(msg.created_at);
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: msg.created_at, messages: [msg] });
      } else {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup) lastGroup.messages.push(msg);
      }
    });

    return groups;
  }, [conversationMessages]);

  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  );

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length]);

  // Focus input on contact select (desktop)
  useEffect(() => {
    if (selectedContactId && window.innerWidth >= 1024) {
      inputRef.current?.focus();
    }
  }, [selectedContactId]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedContactId) return;

    const msg: Message = {
      id: `local-${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: selectedContactId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
    };

    setLocalMessages((prev) => [...prev, msg]);
    setNewMessage("");
  }, [newMessage, selectedContactId, currentUserId]);

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
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
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
            {/* ── Left: Contact List ─────────────────────────── */}
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
                    placeholder="Buscar paciente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
                  />
                </div>
              </div>

              {/* Contact List */}
              <div className="flex-1 overflow-y-auto">
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
                            {contact.full_name ?? "Paciente"}
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
                      Nenhum paciente encontrado
                    </p>
                    <p className="text-xs text-kore-muted mt-1">
                      Tente buscar por outro nome
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Chat Window ─────────────────────────── */}
            <div
              className={`flex-1 flex flex-col min-w-0 ${
                !selectedContactId ? "hidden lg:flex" : "flex"
              }`}
            >
              {selectedContact ? (
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
                        {selectedContact.full_name ?? "Paciente"}
                      </p>
                      <p className="text-[11px] text-kore-muted">
                        {selectedContact.isOnline
                          ? "Online agora"
                          : "Offline"}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <button
                      type="button"
                      aria-label="Mais opções"
                      className="w-9 h-9 grid place-items-center rounded-xl hover:bg-kore-bg transition text-kore-muted hover:text-kore-ink"
                    >
                      <MoreVertical size={17} />
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
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
                          const prevMsg =
                            idx > 0 ? group.messages[idx - 1] : undefined;
                          const showAvatar =
                            !isMine &&
                            (idx === 0 ||
                              prevMsg?.sender_id !== msg.sender_id);

                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMine ? "justify-end" : "justify-start"} ${idx > 0 ? "mt-1" : ""}`}
                            >
                              {/* Patient avatar */}
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
                        disabled={!newMessage.trim()}
                        aria-label="Enviar mensagem"
                        className={`w-10 h-10 grid place-items-center rounded-xl transition flex-shrink-0 ${
                          newMessage.trim()
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
                    Escolha um paciente na lista ao lado para iniciar ou
                    continuar uma conversa
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