"use client";

import { create } from "zustand";

export type StudentFilter = "all" | "active" | "paused" | "pending";

interface CoachState {
  studentFilter: StudentFilter;
  setStudentFilter: (f: StudentFilter) => void;

  studentQuery: string;
  setStudentQuery: (q: string) => void;

  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
}

export const useCoach = create<CoachState>((set) => ({
  studentFilter: "all",
  setStudentFilter: (f) => set({ studentFilter: f }),

  studentQuery: "",
  setStudentQuery: (q) => set({ studentQuery: q }),

  mobileNavOpen: false,
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
}));