import { create } from 'zustand';

interface MessagesStore {
    isMessagesOpen: boolean;
    openMessages: () => void;
    closeMessages: () => void;
    toggleMessages: () => void;
}

export const useMessagesStore = create<MessagesStore>((set) => ({
    isMessagesOpen: false,
    openMessages: () => set({ isMessagesOpen: true }),
    closeMessages: () => set({ isMessagesOpen: false }),
    toggleMessages: () => set((state) => ({ isMessagesOpen: !state.isMessagesOpen })),
}));
