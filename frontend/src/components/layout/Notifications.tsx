import { getNotificationIcon } from '@/services/notificationIcon';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Notification, notificationSchema } from '@shared/dto/notificationDto';
import { NotificationStatus } from '@shared/enums';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';

import notificationsDataRaw from '@/mocks/notificationMock.json';

interface NotificationsProps {
    onClose: () => void;
}

export default function Notifications({ onClose }: NotificationsProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');
    const unreadTabRef = useRef<HTMLButtonElement>(null);
    const allTabRef = useRef<HTMLButtonElement>(null);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Conversion et typage des données mockées
    const notificationsData = notificationsDataRaw.map((notification) =>
        notificationSchema.parse(notification)
    );

    // Utiliser l'ID utilisateur du store ou une valeur par défaut pour le développement
    const currentUserId = user?.id ? Number(user.id) : 4; // Utilise l'ID 4 par défaut (Sophie Leroy)

    // Filtrer pour obtenir seulement les notifications de l'utilisateur connecté
    const userNotifications = notificationsData.filter(
        (notification) => notification.userId === currentUserId
    );

    const [notifications, setNotifications] = useState<Notification[]>(userNotifications);

    // Empêcher le défilement de la page quand les notifications sont ouvertes
    useEffect(() => {
        // Sauvegarder la position actuelle du défilement
        const scrollY = window.scrollY;

        // Empêcher le défilement
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflowY = 'hidden';

        return () => {
            // Restaurer le défilement quand le composant est démonté
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflowY = '';
            window.scrollTo(0, scrollY);
        };
    }, []);

    const filteredNotifications =
        activeTab === 'unread' ? notifications.filter((n) => n.status === NotificationStatus.UNREAD) : notifications;

    const unreadCount = notifications.filter((n) => n.status === NotificationStatus.UNREAD).length;

    // Marquer tout comme lu
    const markAllAsRead = () => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) => ({
                ...notification,
                status: NotificationStatus.READ,
            }))
        );
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-end bg-black/50 pr-48 pt-20">
            {/* Conteneur des notifications */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex max-h-[80vh] w-[500px] flex-col overflow-hidden rounded-lg bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* En-tête */}
                <div className="px-6 pb-0 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {t('notifications.title')}
                            </h2>
                            {unreadCount > 0 && (
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            )}
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Onglets */}
                    <div className="relative flex">
                        <button
                            ref={unreadTabRef}
                            className={`relative px-5 py-3 text-sm font-medium ${activeTab === 'unread' ? 'text-gray-900' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('unread')}
                        >
                            {t('notifications.tabs.unread')}
                            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {unreadCount}
                            </span>
                        </button>
                        <button
                            ref={allTabRef}
                            className={`px-5 py-3 text-sm font-medium ${activeTab === 'all' ? 'text-gray-900' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('all')}
                        >
                            {t('notifications.tabs.all')}
                        </button>

                        <AnimatePresence initial={false}>
                            <motion.div
                                key={activeTab}
                                className="absolute bottom-0 h-[2px] rounded-t-full bg-tertiary"
                                layoutId="activeTab"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                style={{
                                    width: activeTab === 'unread' ? '90px' : '70px',
                                    left: activeTab === 'unread' ? '15px' : '135px',
                                }}
                            />
                        </AnimatePresence>
                    </div>
                </div>

                {/* Liste des notifications */}
                <div className="flex-1 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            {t('notifications.empty')}
                        </div>
                    ) : (
                        <div>
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative flex items-center gap-3 py-5 pl-6 pr-10 transition-colors ${notification.status === NotificationStatus.UNREAD ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex-shrink-0 rounded-full bg-white p-2 shadow-md">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xs font-semibold text-gray-900">
                                            {notification.title}
                                        </h3>
                                        <p className="mt-0 text-xs text-gray-600">
                                            {notification.content}
                                        </p>
                                    </div>

                                    {notification.status === NotificationStatus.UNREAD && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                            <div className="h-2 w-2 rounded-full bg-tertiary"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bouton en bas */}
                <div className="flex justify-center p-2">
                    <button
                        className="rounded-full px-6 py-3 text-sm font-medium text-tertiary"
                        onClick={() => {
                            if (activeTab === 'unread') {
                                if (unreadCount > 0) {
                                    markAllAsRead();
                                } else {
                                    setActiveTab('all');
                                }
                            } else if (activeTab === 'all') {
                                navigate('/notifications-hub');
                                onClose();
                            }
                        }}
                    >
                        {activeTab === 'unread' && (
                            <p>
                                {unreadCount > 0
                                    ? t('notifications.actions.markAllAsRead')
                                    : t('notifications.actions.viewAll')}
                            </p>
                        )}
                        {activeTab === 'all' && <p>{t('notifications.actions.viewAll')}</p>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
