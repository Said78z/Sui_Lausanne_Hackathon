import { useBreadcrumb } from '@/hooks/useBreadcrumb';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BellIcon, MessageCircle, User2 } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { useNotificationsStore } from '@/stores/notificationsStore';

import Breadcrumb from './Breadcrumb';
import LanguageSwitcher from './LanguageSwitcher';

export default function Topbar() {
    const { user } = useAuthStore();
    const { toggleNotifications } = useNotificationsStore();
    const { toggleMessages } = useMessagesStore();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // Utiliser le hook pour gérer automatiquement les breadcrumbs
    useBreadcrumb();

    return (
        <div className="z-10 ml-80 mt-4 flex h-16 items-center justify-between bg-white px-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-4">
                <Breadcrumb />
            </div>
            <div className="flex items-center space-x-4">
                {/* Profil */}
                <div className="relative">
                    <div className="flex cursor-pointer items-center space-x-2 rounded-lg p-2">
                        <LanguageSwitcher />
                        <div className="flex items-center gap-2 pl-2 pr-2">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                                onClick={toggleMessages}
                            >
                                <MessageCircle size={16} />
                            </div>
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                                onClick={toggleNotifications}
                            >
                                <BellIcon size={16} />
                            </div>
                        </div>
                        <div
                            className="flex items-center gap-3 border-l pl-4"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                <User2 size={16} />
                            </div>
                            <span className="text-sm font-medium">
                                {user?.firstName} {user?.lastName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
