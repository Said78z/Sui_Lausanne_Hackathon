import React from 'react';

import { Bell, Calendar, CreditCard, FileText, Wrench } from 'lucide-react';

/**
 * Renvoie l'icône appropriée selon le type de notification.
 * @param type - Le type de notification
 * @returns Le composant d'icône React
 */
export const getNotificationIcon = (type: string): React.ReactNode => {
    switch (type) {
        case 'document':
            return <FileText size={18} className="text-primary" />;
        case 'payment':
            return <CreditCard size={18} className="text-primary" />;
        case 'event':
            return <Calendar size={18} className="text-primary" />;
        case 'repair':
            return <Wrench size={18} className="text-primary" />;
        default:
            return <Bell size={18} className="text-primary" />;
    }
};
