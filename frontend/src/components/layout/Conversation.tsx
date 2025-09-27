import { formatRole } from '@/services/formatRoleService';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UserRole } from '@shared/dto/userDto';
import { messageStatus, messageType } from '@shared/enums';
import { motion } from 'framer-motion';
import { ArrowLeft, Expand, Minimize, Send } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';

import { useAuthStore } from '@/stores/authStore';

import messagesDataRaw from '@/mocks/messageMock.json';
import usersData from '@/mocks/usersMock.json';

interface ConversationProps {
    conversationId: string;
    onClose: () => void;
}

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

export default function Conversation({ conversationId, onClose }: ConversationProps) {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [sortedMessages, setSortedMessages] = useState<Message[]>([]);

    useEffect(() => {
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

        // Filtrer les messages pour cette conversation
        const conversationMessages = messages.filter(
            (message) =>
                (message.fromUserId === user?.id?.toString() &&
                    message.toUserId === conversationId) ||
                (message.fromUserId === conversationId && message.toUserId === user?.id?.toString())
        );

        // Trier les messages par date
        const sorted = conversationMessages.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setSortedMessages(sorted);
    }, [conversationId, user?.id]);

    // Obtenir les informations de l'interlocuteur
    const interlocutor = usersData.users.find((u) => u.id === conversationId);

    // Scroll vers le bas quand de nouveaux messages arrivent
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sortedMessages]);

    // Empêcher le défilement de la page
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

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        // Ici, vous devrez implémenter la logique d'envoi de message à votre API
        // Pour l'instant, nous simulons juste l'envoi
        const newMessageObj: Message = {
            id: Date.now().toString(),
            content: newMessage,
            createdAt: new Date().toISOString(),
            fromUserId: user?.id?.toString() || '',
            toUserId: conversationId,
            type: messageType.TEXT,
            status: messageStatus.SENT,
        };

        // Ajouter le message à la liste locale
        setSortedMessages([...sortedMessages, newMessageObj]);
        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-end bg-black/50 pr-48 pt-20">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`flex h-[80vh] ${
                    isFullScreen ? 'w-[60vw]' : 'w-[500px]'
                } flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-300`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* En-tête */}
                <div className="flex items-center justify-between gap-3 border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div
                            onClick={onClose}
                            className="cursor-pointer text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeft size={20} />
                        </div>
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-tertiary text-white">
                            <p>
                                {interlocutor
                                    ? `${interlocutor.firstName[0]}${interlocutor.lastName[0]}`
                                    : '?'}
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {interlocutor
                                    ? `${interlocutor.firstName} ${interlocutor.lastName}`
                                    : 'Utilisateur inconnu'}
                            </h2>
                            <p className="flex items-center gap-2 text-xs text-gray-600">
                                {formatRole(interlocutor?.roles as UserRole)}
                            </p>
                        </div>
                    </div>
                    <div
                        onClick={toggleFullScreen}
                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                    >
                        {isFullScreen ? <Minimize size={20} /> : <Expand size={20} />}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                    {sortedMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`mb-4 flex ${
                                message.fromUserId === user?.id?.toString()
                                    ? 'justify-end'
                                    : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                    message.fromUserId === user?.id?.toString()
                                        ? 'bg-tertiary text-white'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <span className="mt-1 block text-xs opacity-70">
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <div className="border-t p-4">
                    <div className="flex items-center gap-2">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t('messages.placeholder')}
                            className="flex-1 resize-none rounded-lg border border-gray-300 p-2 text-sm focus:border-tertiary focus:outline-none"
                            rows={1}
                        />
                        <Button
                            variant="primary"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                        >
                            <Send size={20} />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
