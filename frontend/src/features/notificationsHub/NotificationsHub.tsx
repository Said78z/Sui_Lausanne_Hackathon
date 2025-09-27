import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';
import FormattedDateService from '@/services/formattedDateService';
import { getNotificationIcon } from '@/services/notificationIcon.tsx';

import { useMemo } from 'react';

import { notificationSchema } from '@shared/dto/notificationDto';
import { NotificationStatus } from '@shared/enums';

import { useAuthStore } from '@/stores/authStore';

import notificationsDataRaw from '@/mocks/notificationMock.json';

export default function NotificationsHub() {
    const { user } = useAuthStore();

    // Récupérer toutes les notifications de l'utilisateur connecté
    const userNotifications = useMemo(() => {
        // Utiliser l'ID 4 par défaut pour le développement (Sophie Leroy)
        const currentUserId = user?.id || '4';

        // Convertir et typer les données mockées
        const notificationsData = notificationsDataRaw.map((notification) =>
            notificationSchema.parse(notification)
        );

        // Filtrer les notifications de l'utilisateur
        return notificationsData.filter(
            (notification) => notification.userId === Number(currentUserId)
        );
    }, [user]);

    return (
        <div className="w-[calc(100vw-23rem)] px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Centre de notifications</h1>

            <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                <Table className="border-collapse">
                    <TableHeader>
                        <TableRow className="border-b">
                            <TableHead className="px-8 py-4 font-medium text-gray-600">
                                Notification
                            </TableHead>
                            <TableHead className="px-0 py-4 font-medium text-gray-600">
                                Date de réception
                            </TableHead>
                            <TableHead className="px-0 py-4 font-medium text-gray-600">
                                Statut
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userNotifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="p-8 text-center text-gray-500">
                                    Vous n'avez aucune notification
                                </TableCell>
                            </TableRow>
                        ) : (
                            userNotifications.map((notification) => (
                                <TableRow
                                    key={notification.id}
                                    className={`${notification.status === NotificationStatus.UNREAD ? 'bg-tertiary/5 hover:bg-tertiary/10' : 'hover:bg-gray-50'}`}
                                >
                                    <TableCell className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex-shrink-0 rounded-full bg-white p-2 shadow-md ${notification.status === NotificationStatus.UNREAD ? 'text-tertiary' : 'text-gray-400'}`}
                                            >
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {notification.title}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {notification.content}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-0 py-6 text-sm text-gray-600">
                                        {FormattedDateService.formatDate(notification.createdDate)}
                                    </TableCell>
                                    <TableCell className="px-8 py-6">
                                        <div
                                            className={`flex items-center justify-between ${notification.status === NotificationStatus.UNREAD ? 'text-tertiary' : 'text-gray-600'}`}
                                        >
                                            <span className="text-sm">
                                                {notification.status === NotificationStatus.UNREAD ? 'Non lu' : 'Lu'}
                                            </span>
                                            {notification.status === NotificationStatus.UNREAD && (
                                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
