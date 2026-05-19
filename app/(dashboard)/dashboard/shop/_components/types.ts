export type SidebarKey =
  | "overview"
  | "orders"
  | "products"
  | "inventory"
  | "promotions"
  | "customers"
  | "messages"
  | "finance"
  | "settings";

export type OrderStatus = "pendente" | "preparando" | "enviado" | "entregue";

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerAvatar: string;
  itemsCount: number;
  totalBrl: number;
  placedAt: string;
  status: OrderStatus;
  paymentMethod: "Pix" | "Crédito" | "Boleto";
  delta24h?: number;
}

export type KpiTone = "amber" | "rose" | "sky" | "emerald";

export interface ShopKpi {
  id: string;
  icon:
    | "package-clock"
    | "alert-triangle"
    | "message-warning"
    | "credit-card";
  value: string;
  label: string;
  hint: string;
  tone: KpiTone;
}

export interface InventoryAlert {
  id: string;
  sku: string;
  name: string;
  emoji: string;
  stock: number;
  threshold: number;
  category: string;
}

export interface TopProduct {
  id: string;
  name: string;
  emoji: string;
  category: string;
  unitsSold7d: number;
  revenue7d: number;
  trend: number[];
}

export interface RevenuePoint {
  day: string;
  receita: number;
  devolucoes: number;
}

export interface Owner {
  name: string;
  registry: string;
  avatar: string;
}
