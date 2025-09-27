// src/stores/sidebarStore.ts
import { create } from 'zustand';

interface SidebarState {
    isOpen: boolean;
    toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
    isOpen: true,
    toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
}));
