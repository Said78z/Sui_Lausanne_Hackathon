import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';

import messagesDataRaw from '@/mocks/messageMock.json';
import usersData from '@/mocks/usersMock.json';

import Conversation from './Conversation';

// Interface locale pour les messages mockés
interface Message {
    id: string;
    content: string;
    createdAt: string;
    fromUserId: string;
    toUserId: string;
    type: string;
    status: string;
}

interface Conversation {
    id: string;
    participants: string[];
    lastMessage: Message;
    unreadCount: number;
    messages: Message[];
}

interface MessagesProps {
    onClose: () => void;
}

export default function Messages({ onClose }: MessagesProps) {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

    // Conversion des données mockées
    const messages = messagesDataRaw.map((message: any) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        fromUserId: message.fromUserId,
        toUserId: message.toUserId,
        type: message.type,
        status: message.status,
    }));

    // Utiliser l'utilisateur du store ou un ID par défaut pour le développement
    const currentUserId = user?.id?.toString() || '4'; // Utilise l'ID de Sophie Leroy (consultant) par défaut

    // Filtrer les messages pour ne garder que ceux de l'utilisateur actuel
    const userMessages = messages.filter(
        (message) => message.fromUserId === currentUserId || message.toUserId === currentUserId
    );

    // Grouper les messages par conversation (basé sur les participants)
    const conversationsMap = userMessages.reduce<Record<string, Conversation>>((acc, message) => {
        // Créer un ID de conversation unique basé sur les participants
        const otherUserId =
            message.fromUserId === currentUserId ? message.toUserId : message.fromUserId;

        const conversationId = otherUserId;

        if (!acc[conversationId]) {
            acc[conversationId] = {
                id: conversationId,
                participants: [currentUserId, otherUserId],
                messages: [],
                unreadCount: 0,
                lastMessage: message,
            };
        }

        acc[conversationId].messages.push(message);

        // Mettre à jour le dernier message si celui-ci est plus récent
        if (new Date(message.createdAt) > new Date(acc[conversationId].lastMessage.createdAt)) {
            acc[conversationId].lastMessage = message;
        }

        // Incrémenter le compteur de messages non lus si le message est destiné à l'utilisateur actuel
        if (message.status !== 'read' && message.toUserId === currentUserId) {
            acc[conversationId].unreadCount++;
        }

        return acc;
    }, {});

    // Trier les conversations par date du dernier message (du plus récent au plus ancien)
    const conversations = Object.values(conversationsMap).sort(
        (a, b) =>
            new Date(b.lastMessage.createdAt).getTime() -
            new Date(a.lastMessage.createdAt).getTime()
    );

    const [conversationsState, _setConversationsState] = useState<Conversation[]>(conversations);

    // Fonction pour obtenir le nom de l'interlocuteur
    const getInterlocutorName = (participants: string[]) => {
        const interlocutorId = participants.find((id) => id !== currentUserId);
        const interlocutor = usersData.users.find((u) => u.id === interlocutorId);
        return interlocutor
            ? `${interlocutor.firstName} ${interlocutor.lastName}`
            : 'Utilisateur inconnu';
    };

    // Fonction pour obtenir les initiales de l'interlocuteur
    const getInterlocutorInitials = (participants: string[]) => {
        const interlocutorId = participants.find((id) => id !== currentUserId);
        const interlocutor = usersData.users.find((u) => u.id === interlocutorId);
        return interlocutor ? `${interlocutor.firstName[0]}${interlocutor.lastName[0]}` : '?';
    };

    // Empêcher le défilement de la page quand les messages sont ouverts
    useEffect(() => {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflowY = 'hidden';

        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflowY = '';
            window.scrollTo(0, scrollY);
        };
    }, []);

    if (selectedConversation) {
        return (
            <Conversation
                conversationId={selectedConversation}
                onClose={() => setSelectedConversation(null)}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-end bg-black/50 pr-48 pt-20">
            {/* Conteneur des messages */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex max-h-[80vh] w-[500px] flex-col overflow-hidden rounded-lg bg-white pb-2 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* En-tête */}
                <div className="px-6 pb-0 pt-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {t('messages.title')}
                            </h2>
                        </div>
                        <div
                            onClick={onClose}
                            className="cursor-pointer text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </div>
                    </div>
                </div>

                {/* Liste des conversations */}
                <div className="flex-1 overflow-y-auto">
                    {conversationsState.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            {t('messages.empty')}
                        </div>
                    ) : (
                        <div>
                            {conversationsState.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    className={`relative flex cursor-pointer items-center gap-3 py-4 pl-6 pr-10 transition-colors hover:bg-gray-50 ${conversation.unreadCount > 0 ? 'bg-gray-100' : ''}`}
                                    onClick={() => setSelectedConversation(conversation.id)}
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-tertiary text-white">
                                        <p>{getInterlocutorInitials(conversation.participants)}</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {getInterlocutorName(conversation.participants)}
                                                </h3>
                                                {conversation.unreadCount > 0 && (
                                                    <p className="h-1.5 w-1.5 rounded-full bg-red-500"></p>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(
                                                    conversation.lastMessage.createdAt
                                                ).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <p className="mt-1 line-clamp-1 text-xs text-gray-600">
                                            {conversation.lastMessage.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
