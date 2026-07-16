export type SidebarKey =
  | "overview"
  | "users"
  | "professionals"
  | "marketplace"
  | "disputes"
  | "finance"
  | "growth"
  | "settings";

export interface AdminMetrics {
  usersCount: number;
  activeProsCount: number;
  pendingProsCount: number;
  openDisputesCount: number;
}

export type ProfessionalKind = "nutritionist" | "trainer" | "merchant";
export type ApprovalStatus = "pending" | "in-review" | "needs-info";

export interface PendingProfessional {
  id: string;
  name: string;
  avatar: string;
  kind: ProfessionalKind;
  registry: string;
  city: string;
  submittedAt: string;
  documents: number;
  documentsTotal: number;
  status: ApprovalStatus;
}

export interface KpiCard {
  id: string;
  label: string;
  value: string;
  delta: number;
  hint: string;
}

export interface RevenuePoint {
  day: string;
  gross: number;
  net: number;
}

export interface CategoryShare {
  name: string;
  value: number;
  color: string;
}

export interface ActivityEntry {
  id: string;
  ts: string;
  kind: "user" | "stripe" | "dispute" | "moderation" | "system";
  actor: string;
  action: string;
}
