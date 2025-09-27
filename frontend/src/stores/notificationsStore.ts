import { create } from 'zustand';

interface NotificationsStore {
    isNotificationsOpen: boolean;
    openNotifications: () => void;
    closeNotifications: () => void;
    toggleNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
    isNotificationsOpen: false,
    openNotifications: () => set({ isNotificationsOpen: true }),
    closeNotifications: () => set({ isNotificationsOpen: false }),
    toggleNotifications: () =>
        set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),
}));
