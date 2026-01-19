"use client";

import { create } from "zustand";

interface NavigationStore {
    currentPath: string | null;
    setCurrentPath: (path: string | null) => void;
    clearPath: () => void;
}

export const useNavigationStore = create<NavigationStore>(set => ({
    currentPath: null,
    setCurrentPath: (path: string | null) => set({ currentPath: path }),
    clearPath: () => set({ currentPath: null }),
}));
