import type {
  ActivityEntry,
  CategoryShare,
  KpiCard,
  PendingProfessional,
  RevenuePoint,
} from "./types";

export const OWNER = {
  name: "Ivisson Milebrand",
  role: "Founder · Super Admin",
  avatar: "👤",
};

export const KPIS: KpiCard[] = [
  {
    id: "revenue",
    label: "Receita bruta (30d)",
    value: "R$ 184.320",
    delta: 12.4,
    hint: "Após split: R$ 156.671",
  },
  {
    id: "users",
    label: "Usuários ativos",
    value: "8.247",
    delta: 6.8,
    hint: "1.412 novos este mês",
  },
  {
    id: "marketplace",
    label: "Conversão marketplace",
    value: "4.62%",
    delta: 0.6,
    hint: "Carrinho → checkout",
  },
  {
    id: "professionals",
    label: "Profissionais ativos",
    value: "342",
    delta: 9.1,
    hint: "23 aguardando aprovação",
  },
];

export const REVENUE_7D: RevenuePoint[] = [
  { day: "Seg", gross: 5200, net: 4420 },
  { day: "Ter", gross: 6100, net: 5180 },
  { day: "Qua", gross: 7400, net: 6290 },
  { day: "Qui", gross: 6800, net: 5780 },
  { day: "Sex", gross: 9200, net: 7820 },
  { day: "Sáb", gross: 11400, net: 9690 },
  { day: "Dom", gross: 8800, net: 7480 },
];

export const CATEGORY_SHARE: CategoryShare[] = [
  { name: "Marketplace", value: 48, color: "#10B981" },
  { name: "Mensalidade Pro", value: 31, color: "#34D399" },
  { name: "Planos Cliente", value: 16, color: "#6EE7B7" },
  { name: "Outros", value: 5, color: "#A7F3D0" },
];

export const PENDING_PROFESSIONALS: PendingProfessional[] = [
  {
    id: "pro-001",
    name: "Marina Cardoso",
    avatar: "👩🏻‍⚕️",
    kind: "nutritionist",
    registry: "CRN-3 12.345",
    city: "São Paulo, SP",
    submittedAt: "2026-05-15T09:14:00Z",
    documents: 4,
    documentsTotal: 4,
    status: "pending",
  },
  {
    id: "pro-002",
    name: "Rafael Monteiro",
    avatar: "🧑🏽‍🏫",
    kind: "trainer",
    registry: "CREF 087654-G/RJ",
    city: "Rio de Janeiro, RJ",
    submittedAt: "2026-05-14T18:42:00Z",
    documents: 3,
    documentsTotal: 4,
    status: "needs-info",
  },
  {
    id: "pro-003",
    name: "Mercado VivaFit",
    avatar: "🏬",
    kind: "merchant",
    registry: "CNPJ 28.114.302/0001-55",
    city: "Belo Horizonte, MG",
    submittedAt: "2026-05-14T11:05:00Z",
    documents: 6,
    documentsTotal: 6,
    status: "in-review",
  },
  {
    id: "pro-004",
    name: "Júlia Sant'Anna",
    avatar: "👩🏼‍⚕️",
    kind: "nutritionist",
    registry: "CRN-4 18.902",
    city: "Recife, PE",
    submittedAt: "2026-05-13T22:18:00Z",
    documents: 4,
    documentsTotal: 4,
    status: "pending",
  },
  {
    id: "pro-005",
    name: "André Bittencourt",
    avatar: "👨🏻‍🏫",
    kind: "trainer",
    registry: "CREF 045128-G/SP",
    city: "Campinas, SP",
    submittedAt: "2026-05-13T08:30:00Z",
    documents: 4,
    documentsTotal: 4,
    status: "pending",
  },
  {
    id: "pro-006",
    name: "Boutique Atleta+",
    avatar: "🏪",
    kind: "merchant",
    registry: "CNPJ 41.220.815/0001-09",
    city: "Curitiba, PR",
    submittedAt: "2026-05-12T16:55:00Z",
    documents: 5,
    documentsTotal: 6,
    status: "needs-info",
  },
  {
    id: "pro-007",
    name: "Beatriz Lopes",
    avatar: "👩🏽‍⚕️",
    kind: "nutritionist",
    registry: "CRN-1 09.812",
    city: "Brasília, DF",
    submittedAt: "2026-05-12T14:01:00Z",
    documents: 4,
    documentsTotal: 4,
    status: "in-review",
  },
];

export const RECENT_ACTIVITY: ActivityEntry[] = [
  {
    id: "act-1",
    ts: "08:42",
    kind: "stripe",
    actor: "Stripe Connect",
    action: "Split confirmado · pedido #43289 · R$ 312,40",
  },
  {
    id: "act-2",
    ts: "08:31",
    kind: "user",
    actor: "Marina Cardoso",
    action: "Submeteu candidatura como Nutricionista",
  },
  {
    id: "act-3",
    ts: "08:14",
    kind: "moderation",
    actor: "Sistema · auto-moderação",
    action: "Reportou listing 'Whey ProFit 5kg' por preço suspeito",
  },
  {
    id: "act-4",
    ts: "07:58",
    kind: "dispute",
    actor: "Loja Suplementos Norte",
    action: "Abriu disputa contra cliente Carlos R. · R$ 89,90",
  },
  {
    id: "act-5",
    ts: "07:40",
    kind: "system",
    actor: "n8n · jornada WhatsApp",
    action: "Disparou retenção pra 412 alunos com aderência <70%",
  },
  {
    id: "act-6",
    ts: "07:22",
    kind: "stripe",
    actor: "Stripe Connect",
    action: "Reembolso processado · pedido #43210 · R$ 154,90",
  },
];

export function professionalKindLabel(kind: PendingProfessional["kind"]) {
  switch (kind) {
    case "nutritionist":
      return "Nutricionista";
    case "trainer":
      return "Personal";
    case "merchant":
      return "Lojista";
  }
}

export function relativeSubmitted(iso: string) {
  const submitted = new Date(iso).getTime();
  const now = new Date("2026-05-17T08:30:00Z").getTime();
  const hours = Math.round((now - submitted) / (1000 * 60 * 60));
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}
