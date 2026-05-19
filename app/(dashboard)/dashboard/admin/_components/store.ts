"use client";

import { create } from "zustand";
import type { SidebarKey } from "./types";

interface AdminState {
  section: SidebarKey;
  setSection: (s: SidebarKey) => void;

  selectedProId: string | null;
  setSelectedProId: (id: string | null) => void;

  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
}

export const useAdmin = create<AdminState>((set) => ({
  section: "overview",
  setSection: (s) => set({ section: s }),

  selectedProId: null,
  setSelectedProId: (id) => set({ selectedProId: id }),

  mobileNavOpen: false,
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
}));
