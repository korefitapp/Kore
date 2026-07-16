export type SidebarKey =
  | "overview"
  | "students"
  | "workouts"
  | "library"
  | "agenda"
  | "messages"
  | "finance"
  | "settings";

export type PlanKind = "Mensal" | "Trimestral" | "Semestral" | "Anual";

export type StudentStatus = "em-dia" | "renovar" | "atencao" | "aguardando";

export interface Student {
  id: string;
  name: string;
  avatar: string;
  goal: string;
  plan: PlanKind;
  planExpiresInDays: number;
  adherence8w: number[];
  adherenceCurrent: number;
  loadDeltaPct: number;
  lastWorkout: string;
  status: StudentStatus;
  unreadMessages?: number;
}

export type KpiTone = "amber" | "rose" | "sky" | "emerald";

export interface PersonalKpi {
  id: string;
  icon: "calendar-clock" | "trending-down" | "message-warning" | "activity";
  value: number;
  label: string;
  hint: string;
  tone: KpiTone;
}

export type AgendaModality = "presencial" | "online" | "consultoria";

export interface AgendaSession {
  id: string;
  time: string;
  durationMin: number;
  studentName: string;
  studentAvatar: string;
  focus: string;
  modality: AgendaModality;
}

export interface WorkoutToBuild {
  id: string;
  studentName: string;
  studentAvatar: string;
  block: string;
  dueInDays: number;
}

export interface VolumePoint {
  day: string;
  treinos: number;
  kcal100: number;
}

export interface Owner {
  name: string;
  registry: string;
  avatar: string;
}
