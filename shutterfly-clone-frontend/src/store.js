import { create } from "zustand";

export const useAppStore = create((set) => ({
  canvaToken: null,
  setCanvaToken: (tok) => set((state) => ({ canvaToken: tok })),
}));