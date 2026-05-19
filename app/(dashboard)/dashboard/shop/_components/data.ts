import type {
  InventoryAlert,
  Order,
  Owner,
  RevenuePoint,
  ShopKpi,
  TopProduct,
} from "./types";

export const OWNER: Owner = {
  name: "Marina Tavares",
  registry: "KORE Suplementos · Loja Oficial",
  avatar: "🛍️",
};

export const KPIS: ShopKpi[] = [
  {
    id: "pending",
    icon: "package-clock",
    value: "12",
    label: "Pedidos pendentes",
    hint: "4 atrasados há mais de 24h",
    tone: "amber",
  },
  {
    id: "stockout",
    icon: "alert-triangle",
    value: "6",
    label: "Ruptura de estoque",
    hint: "Whey baunilha, BCAA e mais 4 SKUs",
    tone: "rose",
  },
  {
    id: "unread",
    icon: "message-warning",
    value: "9",
    label: "Mensagens não lidas",
    hint: "3 reclamações de envio aguardando",
    tone: "sky",
  },
  {
    id: "revenue-today",
    icon: "credit-card",
    value: "R$ 4.820",
    label: "Faturamento hoje",
    hint: "+18,4% vs. ontem · 27 pedidos",
    tone: "emerald",
  },
];

export const ORDERS: Order[] = [
  {
    id: "ord-1042",
    code: "#1042",
    customerName: "Helena Prado",
    customerAvatar: "🥗",
    itemsCount: 3,
    totalBrl: 312.4,
    placedAt: "há 12min",
    status: "pendente",
    paymentMethod: "Pix",
    delta24h: 0,
  },
  {
    id: "ord-1041",
    code: "#1041",
    customerName: "Renan Castro",
    customerAvatar: "🍳",
    itemsCount: 2,
    totalBrl: 189.9,
    placedAt: "há 45min",
    status: "pendente",
    paymentMethod: "Crédito",
  },
  {
    id: "ord-1040",
    code: "#1040",
    customerName: "Diego Martins",
    customerAvatar: "🧑‍🏫",
    itemsCount: 5,
    totalBrl: 612.0,
    placedAt: "há 2h",
    status: "preparando",
    paymentMethod: "Pix",
  },
  {
    id: "ord-1039",
    code: "#1039",
    customerName: "Ana Souza",
    customerAvatar: "🍇",
    itemsCount: 1,
    totalBrl: 89.9,
    placedAt: "há 4h",
    status: "preparando",
    paymentMethod: "Crédito",
  },
  {
    id: "ord-1038",
    code: "#1038",
    customerName: "Júlia Sant'Anna",
    customerAvatar: "👩🏼‍⚕️",
    itemsCount: 2,
    totalBrl: 254.0,
    placedAt: "há 6h",
    status: "enviado",
    paymentMethod: "Pix",
  },
  {
    id: "ord-1037",
    code: "#1037",
    customerName: "Marcos Figueiredo",
    customerAvatar: "🥩",
    itemsCount: 4,
    totalBrl: 478.6,
    placedAt: "ontem",
    status: "enviado",
    paymentMethod: "Boleto",
  },
  {
    id: "ord-1036",
    code: "#1036",
    customerName: "Beatriz Lopes",
    customerAvatar: "🥕",
    itemsCount: 2,
    totalBrl: 162.4,
    placedAt: "há 2 dias",
    status: "entregue",
    paymentMethod: "Pix",
  },
  {
    id: "ord-1035",
    code: "#1035",
    customerName: "Felipe Carvalho",
    customerAvatar: "🥥",
    itemsCount: 3,
    totalBrl: 295.0,
    placedAt: "há 3 dias",
    status: "entregue",
    paymentMethod: "Crédito",
  },
];

export const INVENTORY_ALERTS: InventoryAlert[] = [
  {
    id: "sku-whey-bau",
    sku: "WHEY-VAN-900",
    name: "Whey Protein · Baunilha",
    emoji: "🥛",
    stock: 2,
    threshold: 12,
    category: "Suplementos",
  },
  {
    id: "sku-bcaa-300",
    sku: "BCAA-300",
    name: "BCAA 2:1:1 · 300g",
    emoji: "💊",
    stock: 0,
    threshold: 8,
    category: "Suplementos",
  },
  {
    id: "sku-shak-pre",
    sku: "SHK-PRE-CIT",
    name: "Pré-treino · Citrus",
    emoji: "⚡",
    stock: 3,
    threshold: 10,
    category: "Pré-treino",
  },
  {
    id: "sku-tee-blk",
    sku: "TEE-BLK-M",
    name: "Camiseta Dry-Fit M · Preta",
    emoji: "👕",
    stock: 4,
    threshold: 15,
    category: "Vestuário",
  },
];

export const TOP_PRODUCTS: TopProduct[] = [
  {
    id: "p-whey-choco",
    name: "Whey Protein · Chocolate",
    emoji: "🍫",
    category: "Suplementos",
    unitsSold7d: 142,
    revenue7d: 12340,
    trend: [80, 92, 104, 110, 122, 132, 142],
  },
  {
    id: "p-creatina",
    name: "Creatina monohidratada 300g",
    emoji: "💪",
    category: "Suplementos",
    unitsSold7d: 96,
    revenue7d: 7680,
    trend: [60, 64, 72, 78, 84, 90, 96],
  },
  {
    id: "p-shaker-450",
    name: "Shaker 450ml · KORE",
    emoji: "🥤",
    category: "Acessórios",
    unitsSold7d: 84,
    revenue7d: 2520,
    trend: [50, 56, 64, 70, 74, 80, 84],
  },
  {
    id: "p-multivit",
    name: "Multivitamínico 90 caps",
    emoji: "🟠",
    category: "Vitaminas",
    unitsSold7d: 58,
    revenue7d: 3480,
    trend: [40, 42, 48, 50, 52, 56, 58],
  },
];

export const WEEKLY_REVENUE: RevenuePoint[] = [
  { day: "Seg", receita: 3820, devolucoes: 140 },
  { day: "Ter", receita: 4180, devolucoes: 96 },
  { day: "Qua", receita: 4560, devolucoes: 210 },
  { day: "Qui", receita: 4920, devolucoes: 132 },
  { day: "Sex", receita: 5380, devolucoes: 168 },
  { day: "Sáb", receita: 6240, devolucoes: 220 },
  { day: "Dom", receita: 2980, devolucoes: 88 },
];

export function statusLabel(s: Order["status"]): string {
  switch (s) {
    case "pendente":
      return "Pendente";
    case "preparando":
      return "Preparando";
    case "enviado":
      return "Enviado";
    case "entregue":
      return "Entregue";
  }
}

export function formatBrl(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: v >= 1000 ? 0 : 2,
  });
}
