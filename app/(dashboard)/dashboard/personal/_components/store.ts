"use client";

import { create } from "zustand";
import type { SidebarKey, StudentStatus } from "./types";

export type StudentFilter = "all" | StudentStatus;

interface PersonalState {
  section: SidebarKey;
  setSection: (s: SidebarKey) => void;
  studentFilter: StudentFilter;
  setStudentFilter: (f: StudentFilter) => void;
  studentQuery: string;
  setStudentQuery: (q: string) => void;
}

export const usePersonal = create<PersonalState>((set) => ({
  section: "overview",
  setSection: (s) => set({ section: s }),
  studentFilter: "all",
  setStudentFilter: (f) => set({ studentFilter: f }),
  studentQuery: "",
  setStudentQuery: (q) => set({ studentQuery: q }),
}));
