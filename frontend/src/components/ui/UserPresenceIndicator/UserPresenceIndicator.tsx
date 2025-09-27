import { memo } from 'react';

import { useUserPresenceStore } from '@/stores/userPresenceStore';

interface UserPresenceIndicatorProps {
    userId: string;
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const UserPresenceIndicator = memo(
    ({ userId, showText = false, size = 'md', className = '' }: UserPresenceIndicatorProps) => {
        const { isUserOnline, getUserPresence } = useUserPresenceStore();

        const isOnline = isUserOnline(userId);
        const presence = getUserPresence(userId);

        const sizeClasses = {
            sm: 'h-2 w-2',
            md: 'h-3 w-3',
            lg: 'h-4 w-4',
        };

        const textSizeClasses = {
            sm: 'text-xs',
            md: 'text-sm',
            lg: 'text-base',
        };

        const formatLastSeen = (lastSeen?: string) => {
            if (!lastSeen) return '';

            const now = new Date();
            const lastSeenDate = new Date(lastSeen);
            const diffInMinutes = Math.floor(
                (now.getTime() - lastSeenDate.getTime()) / (1000 * 60)
            );

            if (diffInMinutes < 1) return "À l'instant";
            if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `Il y a ${diffInHours}h`;

            const diffInDays = Math.floor(diffInHours / 24);
            return `Il y a ${diffInDays}j`;
        };

        if (showText) {
            return (
                <div className={`flex items-center gap-1.5 ${className}`}>
                    <div
                        className={`${sizeClasses[size]} rounded-full ${
                            isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                    />
                    <span
                        className={`${textSizeClasses[size]} ${
                            isOnline ? 'text-green-600' : 'text-gray-500'
                        }`}
                    >
                        {isOnline ? 'En ligne' : formatLastSeen(presence?.lastSeen)}
                    </span>
                </div>
            );
        }

        return (
            <div
                className={`${sizeClasses[size]} rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                } ${className}`}
                title={
                    isOnline
                        ? 'En ligne'
                        : `Dernière connexion: ${formatLastSeen(presence?.lastSeen)}`
                }
            />
        );
    }
);

UserPresenceIndicator.displayName = 'UserPresenceIndicator';

export default UserPresenceIndicator;
