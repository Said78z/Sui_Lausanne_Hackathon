import { create } from 'zustand';

interface UserPresence {
    userId: string;
    status: 'online' | 'offline';
    lastSeen?: string;
}

interface UserPresenceState {
    userPresences: Map<string, UserPresence>;
    setUserPresence: (userId: string, status: 'online' | 'offline', lastSeen?: string) => void;
    getUserPresence: (userId: string) => UserPresence | undefined;
    isUserOnline: (userId: string) => boolean;
    getOnlineUsers: () => string[];
    clearAllPresences: () => void;
    initializeOnlineUsers: (onlineUserIds: string[]) => void;
}

export const useUserPresenceStore = create<UserPresenceState>((set, get) => ({
    userPresences: new Map(),

    setUserPresence: (userId: string, status: 'online' | 'offline', lastSeen?: string) => {
        set((state) => {
            const newPresences = new Map(state.userPresences);
            newPresences.set(userId, {
                userId,
                status,
                lastSeen: lastSeen || new Date().toISOString(),
            });
            return { userPresences: newPresences };
        });
    },

    getUserPresence: (userId: string) => {
        return get().userPresences.get(userId);
    },

    isUserOnline: (userId: string) => {
        const presence = get().userPresences.get(userId);
        return presence?.status === 'online';
    },

    getOnlineUsers: () => {
        const presences = get().userPresences;
        return Array.from(presences.entries())
            .filter(([_, presence]) => presence.status === 'online')
            .map(([userId, _]) => userId);
    },

    clearAllPresences: () => {
        set({ userPresences: new Map() });
    },

    initializeOnlineUsers: (onlineUserIds: string[]) => {
        set((state) => {
            const newPresences = new Map(state.userPresences);

            // Mark all current users as offline first
            newPresences.forEach((presence, userId) => {
                if (presence.status === 'online') {
                    newPresences.set(userId, {
                        ...presence,
                        status: 'offline',
                        lastSeen: new Date().toISOString(),
                    });
                }
            });

            // Mark online users as online
            onlineUserIds.forEach((userId) => {
                newPresences.set(userId, {
                    userId,
                    status: 'online',
                    lastSeen: new Date().toISOString(),
                });
            });

            return { userPresences: newPresences };
        });
    },
})); 