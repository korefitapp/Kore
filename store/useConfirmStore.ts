import { create } from "zustand";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  danger?: boolean;
}

interface ConfirmState {
  options: ConfirmOptions | null;
  isOpen: boolean;
  openConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  options: null,
  isOpen: false,
  openConfirm: (options) => set({ options, isOpen: true }),
  closeConfirm: () => set({ isOpen: false, options: null }),
}));

export const confirmAction = (options: ConfirmOptions) => {
  useConfirmStore.getState().openConfirm(options);
};
