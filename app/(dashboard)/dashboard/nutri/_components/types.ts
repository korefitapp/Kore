export type SidebarKey =
  | "overview"
  | "patients"
  | "meal-plans"
  | "food-bank"
  | "consultations"
  | "messages"
  | "finance"
  | "settings";

export type PlanKind = "Mensal" | "Trimestral" | "Semestral" | "Anual";

export type PatientStatus = "em-dia" | "reavaliar" | "atencao";

export type PatientGoal =
  | "Emagrecimento"
  | "Hipertrofia"
  | "Performance"
  | "Saúde clínica"
  | "Recomposição";

export interface Patient {
  id: string;
  name: string;
  avatar: string;
  goal: PatientGoal;
  plan: PlanKind;
  planExpiresInDays: number;
  adherence8w: number[];
  adherenceCurrent: number;
  weightDeltaKg: number;
  lastWeighIn: string;
  status: PatientStatus;
  unreadMessages?: number;
}

export type KpiTone = "amber" | "rose" | "sky" | "emerald";

export interface NutriKpi {
  id: string;
  icon: "calendar-clock" | "trending-down" | "message-warning" | "salad";
  value: number;
  label: string;
  hint: string;
  tone: KpiTone;
}

export type ConsultModality = "presencial" | "online" | "retorno";

export interface Consultation {
  id: string;
  time: string;
  durationMin: number;
  patientName: string;
  patientAvatar: string;
  focus: string;
  modality: ConsultModality;
}

export interface MealPlanToBuild {
  id: string;
  patientName: string;
  patientAvatar: string;
  block: string;
  dueInDays: number;
}

export interface MacrosPoint {
  day: string;
  proteina: number;
  carbo: number;
  gordura: number;
}

export interface Owner {
  name: string;
  registry: string;
  avatar: string;
}
