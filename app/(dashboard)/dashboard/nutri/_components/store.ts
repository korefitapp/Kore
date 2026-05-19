"use client";

import { create } from "zustand";
import type { PatientStatus, SidebarKey } from "./types";

export type PatientFilter = "all" | PatientStatus;

interface NutriState {
  section: SidebarKey;
  setSection: (s: SidebarKey) => void;
  patientFilter: PatientFilter;
  setPatientFilter: (f: PatientFilter) => void;
  patientQuery: string;
  setPatientQuery: (q: string) => void;
}

export const useNutri = create<NutriState>((set) => ({
  section: "overview",
  setSection: (s) => set({ section: s }),
  patientFilter: "all",
  setPatientFilter: (f) => set({ patientFilter: f }),
  patientQuery: "",
  setPatientQuery: (q) => set({ patientQuery: q }),
}));
