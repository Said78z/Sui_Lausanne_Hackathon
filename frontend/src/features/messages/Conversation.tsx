import { useChatById, useUpdateParticipants } from '@/api/queries/chatQueries';
import { useMarkMessagesAsRead, useSendMessage } from '@/api/queries/messageQueries';
import { useContactableUsers, useOnlineUsers } from '@/api/queries/userQueries';
import { useChat } from '@/hooks/useChat';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Import shared DTOs instead of creating custom interfaces
import { MessageDto } from '@shared/dto';
import { messageStatus, messageType } from '@shared/enums/messageEnums';
import { TypingData } from '@shared/types/conversationTypes';
import { ServerWebSocketData, ServerWebSocketMessage } from '@shared/types/websocketTypes';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    ArrowLeft,
    File,
    Image,
    Info,
    MoreVertical,
    Paperclip,
    PlusCircle,
    Send,
    User,
    UserPlus,
    Users,
    X,
} from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import UserPresenceIndicator from '@/components/ui/UserPresenceIndicator/UserPresenceIndicator';

import { useAuthStore } from '@/stores/authStore';
import { useUserPresenceStore } from '@/stores/userPresenceStore';

// Remove mock imports since we're using real data
// import messagesDataRaw from '@/mocks/messageMock.json';
// import usersData from '@/mocks/usersMock.json';

// Memoized message component to prevent unnecessary re-renders
const MessageItem = React.memo(
    ({
        message,
        isCurrentUser,
        isGroup,
        getInitials,
        formatMessageDate,
        getMessageStatus,
    }: {
        message: MessageDto;
        isCurrentUser: boolean;
        isGroup: boolean;
        getInitials: (firstName: string, lastName: string) => string;
        formatMessageDate: (dateString: string) => string;
        getMessageStatus: (status: string) => string;
    }) => {
        // Handle system messages differently
        if (message.type === messageType.SYSTEM) {
            return (
                <div className="my-2 flex justify-center">
                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        {message.content}
                    </div>
                </div>
            );
        }

        return (
            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                {!isCurrentUser && isGroup && (
                    <div className="xs:block mr-3 mt-1 hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary text-xs text-white">
                            {getInitials(message.author.firstName, message.author.lastName)}
                        </div>
                    </div>
                )}

                <div
                    className={`max-w-[80%] sm:max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}
                >
                    {isGroup && !isCurrentUser && (
                        <div className="mb-1 text-sm font-medium text-gray-700">
                            {message.author.firstName} {message.author.lastName}
                        </div>
                    )}

                    <div
                        className={`rounded-lg px-4 py-3 ${
                            isCurrentUser ? 'bg-tertiary text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <div
                        className={`mt-1 flex text-xs text-gray-500 ${
                            isCurrentUser ? 'justify-end' : ''
                        }`}
                    >
                        <span>{formatMessageDate(message.createdAt)}</span>
                        {isCurrentUser && message.status && (
                            <span className="ml-2">· {getMessageStatus(message.status)}</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

MessageItem.displayName = 'MessageItem';

// Type guard functions using consolidated interfaces
const isTypingData = (data: ServerWebSocketData): data is TypingData => {
    return (
        data &&
        typeof data === 'object' &&
        'userId' in data &&
        'conversationId' in data &&
        typeof data.userId === 'string' &&
        typeof data.conversationId === 'string'
    );
};

// Only used for WebSocket events related to user presence
// which are not currently handled in this component
// const isUserPresenceData = (data: ServerWebSocketData): data is UserPresenceData => {
//     return (
//         data &&
//         typeof data === 'object' &&
//         'userId' in data &&
//         'status' in data &&
//         typeof data.userId === 'string' &&
//         typeof data.status === 'string'
//     );
// };

export default function ConversationDetail() {
    const navigate = useNavigate();
    // Uncomment when translations are needed
    // const { t } = useTranslation();
    const { id: conversationId } = useParams();
    const { user } = useAuthStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // API call to fetch conversation data
    const { data: conversationData, isLoading, error } = useChatById(conversationId || '');
    const sendMessageMutation = useSendMessage();
    const markMessagesAsReadMutation = useMarkMessagesAsRead();
    const updateParticipantsMutation = useUpdateParticipants();

    // Provide a default structure when conversationData is undefined to ensure arrays are always available
    const safeConversationData = useMemo(() => {
        if (!conversationData) {
            return {
                id: '',
                messages: [],
                users: [],
                name: '',
                type: '',
                createdAt: new Date().toISOString(),
            };
        }
        return conversationData;
    }, [conversationData]);

    const [messageInput, setMessageInput] = useState('');
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Add state for add participant modal
    const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
    const [selectedNewParticipants, setSelectedNewParticipants] = useState<string[]>([]);
    const [searchParticipantTerm, setSearchParticipantTerm] = useState('');

    // Memoize derived state to prevent unnecessary re-renders - using safeConversationData
    const messages = useMemo(() => safeConversationData.messages, [safeConversationData.messages]);
    const isGroup = useMemo(
        () => safeConversationData.type === 'group',
        [safeConversationData.type]
    );
    const groupName = useMemo(() => safeConversationData.name || '', [safeConversationData.name]);
    const conversationUsers = useMemo(
        () => safeConversationData.users,
        [safeConversationData.users]
    );

    // Get the other user(s) in the conversation (excluding current user)
    const otherUsers = useMemo(
        () => conversationUsers.filter((u) => u.id !== user?.id),
        [conversationUsers, user?.id]
    );
    const interlocutor = useMemo(
        () => (!isGroup && otherUsers.length > 0 ? otherUsers[0] : null),
        [isGroup, otherUsers]
    );

    // WebSocket integration using useChat hook
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // This ref is used in the sendTyping and sendStopTyping functions
    const lastTypingTimeRef = useRef<number>(0);

    // Memoized callbacks for WebSocket events to prevent re-renders
    const onNewMessage = useCallback(() => {
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.refetchQueries({ queryKey: ['chats'], type: 'active' });

        if (conversationId) {
            queryClient.invalidateQueries({
                queryKey: ['chat', conversationId],
            });
            queryClient.refetchQueries({
                queryKey: ['chat', conversationId],
                type: 'active',
            });
        }

        // Don't auto-scroll if user has scrolled up
        const container = messagesEndRef.current?.parentElement;
        if (container) {
            const isAtBottom =
                container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
            if (isAtBottom) {
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [queryClient, conversationId]);

    const onUserTyping = useCallback(
        (message: ServerWebSocketMessage) => {
            if (
                message.conversationId === conversationId &&
                isTypingData(message.data) &&
                message.data.userId !== user?.id
            ) {
                const typingData = message.data as TypingData;
                setTypingUsers((prev) => {
                    if (prev.has(typingData.userId)) return prev; // Prevent unnecessary updates
                    const newSet = new Set([...prev, typingData.userId]);
                    return newSet;
                });
            }
        },
        [conversationId, user?.id]
    );

    const onUserStoppedTyping = useCallback(
        (message: ServerWebSocketMessage) => {
            if (
                message.conversationId === conversationId &&
                isTypingData(message.data) &&
                message.data.userId !== user?.id
            ) {
                const typingData = message.data as TypingData;
                setTypingUsers((prev) => {
                    if (!prev.has(typingData.userId)) return prev; // Prevent unnecessary updates
                    const newSet = new Set(prev);
                    newSet.delete(typingData.userId);
                    return newSet;
                });
            }
        },
        [conversationId, user?.id]
    );

    // Use the useChat hook for WebSocket functionality
    const { sendTyping, sendStopTyping } = useChat({
        conversationId,
        onNewMessage,
        onTyping: onUserTyping,
        onStopTyping: onUserStoppedTyping,
        autoJoin: true,
    });

    // These handlers are used in the component's input handlers
    // No need to explicitly call them here
    // const handleSendTyping = useCallback(() => {
    //     if (!conversationId) return;

    //     const now = Date.now();
    //     const timeSinceLastTyping = now - lastTypingTimeRef.current;

    //     if (timeSinceLastTyping > 1000) {
    //         sendTyping(conversationId);
    //         lastTypingTimeRef.current = now;
    //     }
    // }, [conversationId, sendTyping]);

    // const handleSendStopTyping = useCallback(() => {
    //     if (conversationId) {
    //         sendStopTyping(conversationId);
    //         lastTypingTimeRef.current = 0;
    //     }
    // }, [conversationId, sendStopTyping]);

    // User presence management
    const { initializeOnlineUsers } = useUserPresenceStore();
    const { data: onlineUsers } = useOnlineUsers();

    // Initialize user presence from API when online users data is available
    useEffect(() => {
        if (onlineUsers) {
            initializeOnlineUsers(onlineUsers);
        }
    }, [onlineUsers, initializeOnlineUsers]);

    // Debounced typing handler
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setMessageInput(newValue);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Only send typing indicator if user is actually typing and not already typing
            if (newValue.length > 0 && !isTyping && conversationId) {
                sendTyping(conversationId);
                setIsTyping(true);
            }

            // Set new timeout to stop typing after 2 seconds of inactivity
            const newTimeout = setTimeout(() => {
                if (isTyping && conversationId) {
                    sendStopTyping(conversationId);
                    setIsTyping(false);
                }
                typingTimeoutRef.current = null;
            }, 2000);

            typingTimeoutRef.current = newTimeout;

            // If input is cleared, stop typing immediately
            if (newValue.length === 0 && isTyping && conversationId) {
                sendStopTyping(conversationId);
                setIsTyping(false);
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = null;
                }
            }
        },
        [typingTimeoutRef, isTyping, sendTyping, sendStopTyping, conversationId]
    );

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (isTyping && conversationId) {
                sendStopTyping(conversationId);
            }
        };
    }, [isTyping, conversationId, sendStopTyping]);

    // Scroll to bottom only when messages actually change
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, []);

    // Only scroll when messages length changes (new messages)
    useEffect(() => {
        scrollToBottom();
    }, [messages.length, scrollToBottom]);

    // Only scroll when typing users change and there are typing users
    useEffect(() => {
        if (typingUsers.size > 0) {
            scrollToBottom();
        }
    }, [typingUsers.size, scrollToBottom]);

    // Mark messages as read - only run once when conversation loads
    useEffect(() => {
        if (
            !conversationData ||
            !safeConversationData.id ||
            !conversationId ||
            !user?.id ||
            markMessagesAsReadMutation.isPending
        )
            return;

        const unreadMessages = safeConversationData.messages.filter(
            (message) => message.status !== messageStatus.READ && message.author.id !== user.id
        );

        if (unreadMessages.length > 0) {
            const messageIds = unreadMessages.map((msg) => msg.id);
            markMessagesAsReadMutation.mutate({
                chatId: conversationId,
                messageData: { messagesIds: messageIds },
            });
        }
    }, [
        safeConversationData?.id,
        conversationId,
        user?.id,
        conversationData,
        markMessagesAsReadMutation,
        safeConversationData.messages,
        messageStatus.READ,
    ]);

    // Enhanced mark as read functionality - triggers on focus, scroll, and visibility
    const markUnreadMessagesAsRead = useCallback(() => {
        if (
            !conversationData ||
            !safeConversationData.id ||
            !conversationId ||
            !user?.id ||
            markMessagesAsReadMutation.isPending
        )
            return;

        const unreadMessages = safeConversationData.messages.filter(
            (message) => message.status !== messageStatus.READ && message.author.id !== user.id
        );

        if (unreadMessages.length > 0) {
            const messageIds = unreadMessages.map((msg) => msg.id);
            markMessagesAsReadMutation.mutate({
                chatId: conversationId,
                messageData: { messagesIds: messageIds },
            });
        }
    }, [
        conversationData,
        safeConversationData,
        conversationId,
        user?.id,
        markMessagesAsReadMutation,
    ]);

    // Mark messages as read when user interacts with the conversation
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Mark as read when tab becomes visible
                setTimeout(() => markUnreadMessagesAsRead(), 500);
            }
        };

        const handleWindowFocus = () => {
            // Mark as read when window gains focus
            setTimeout(() => markUnreadMessagesAsRead(), 500);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [markUnreadMessagesAsRead]);

    // Mark messages as read when new messages arrive (for real-time updates)
    useEffect(() => {
        if (messages.length > 0) {
            // Delay to ensure the conversation is visible and user is likely to see the messages
            const timer = setTimeout(() => {
                markUnreadMessagesAsRead();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [messages.length, markUnreadMessagesAsRead]);

    // Fetch contactable users for adding to the group
    const { data: contactsData, isLoading: isContactsLoading } = useContactableUsers({
        search: searchParticipantTerm,
        page: 1,
        limit: 50,
    });

    // Filter contacts to exclude existing participants
    const filteredContacts = useMemo(() => {
        if (!contactsData?.data?.contacts || !conversationUsers) return [];

        // Get IDs of existing participants
        const existingParticipantIds = conversationUsers.map((user) => user.id);

        // Filter out existing participants
        return contactsData.data.contacts.filter(
            (contact) => !existingParticipantIds.includes(contact.id)
        );
    }, [contactsData?.data?.contacts, conversationUsers]);

    // Handle adding participants to the group
    const handleAddParticipants = useCallback(async () => {
        if (!conversationId || !selectedNewParticipants.length || !user?.id) return;

        try {
            // First, add the participants
            await updateParticipantsMutation.mutateAsync({
                chatId: conversationId,
                participantIds: selectedNewParticipants,
                action: 'add',
            });

            // Get the names of the added participants from the contacts data
            const addedParticipantNames = selectedNewParticipants
                .map((id) => {
                    const contact = filteredContacts.find((c) => c.id === id);
                    return contact ? `${contact.firstName} ${contact.lastName}` : 'Utilisateur';
                })
                .join(', ');

            // Send a system message to notify everyone in the chat
            await sendMessageMutation.mutateAsync({
                chatId: conversationId,
                content: `${user.firstName} ${user.lastName} a ajouté ${addedParticipantNames} au groupe`,
                type: messageType.SYSTEM,
            });

            // Force refresh the chat data to show the new participants immediately
            queryClient.invalidateQueries({
                queryKey: ['chat', conversationId],
            });

            // Reset state and close modal
            setSelectedNewParticipants([]);
            setShowAddParticipantModal(false);
        } catch (error) {
            console.error('Error adding participants to group:', error);
        }
    }, [
        conversationId,
        selectedNewParticipants,
        updateParticipantsMutation,
        sendMessageMutation,
        user,
        filteredContacts,
        queryClient,
    ]);

    // Toggle participant selection
    const toggleParticipantSelection = useCallback((participantId: string) => {
        setSelectedNewParticipants((prev) =>
            prev.includes(participantId)
                ? prev.filter((id) => id !== participantId)
                : [...prev, participantId]
        );
    }, []);

    // Memoize utility functions to prevent recreation on every render
    const getInitials = useCallback((firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`;
    }, []);

    const getMessageStatus = useCallback((status: string) => {
        switch (status) {
            case 'sent':
                return 'Envoyé';
            case 'delivered':
                return 'Distribué';
            case 'read':
                return 'Lu';
            default:
                return '';
        }
    }, []);

    const formatMessageDate = useCallback((dateString: string) => {
        const messageDate = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return format(messageDate, 'HH:mm');
        }

        if (messageDate.toDateString() === yesterday.toDateString()) {
            return `Hier à ${format(messageDate, 'HH:mm')}`;
        }

        return format(messageDate, 'PPP à HH:mm', { locale: fr });
    }, []);

    const formatDateHeader = useCallback((dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Aujourd'hui";
        }

        if (date.toDateString() === yesterday.toDateString()) {
            return 'Hier';
        }

        return format(date, 'PPP', { locale: fr });
    }, []);

    // Memoize grouped messages to prevent recalculation on every render
    const messageGroups = useMemo(() => {
        const groups: { date: string; messages: MessageDto[] }[] = [];
        let currentDate = '';

        const sortedMessages = [...messages].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        sortedMessages.forEach((message) => {
            const messageDate = new Date(message.createdAt).toDateString();

            if (messageDate !== currentDate) {
                currentDate = messageDate;
                groups.push({
                    date: messageDate,
                    messages: [message],
                });
            } else {
                groups[groups.length - 1].messages.push(message);
            }
        });

        return groups;
    }, [messages]);

    // Function to send a message
    const handleSendMessage = useCallback(async () => {
        if (!messageInput.trim() || !conversationId || sendMessageMutation.isPending) return;

        try {
            // Clear typing indicator immediately when sending
            if (isTyping && conversationId) {
                sendStopTyping(conversationId);
                setIsTyping(false);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }

            await sendMessageMutation.mutateAsync({
                chatId: conversationId,
                content: messageInput.trim(),
                type: messageType.TEXT, // Use the correct enum value
            });

            // Clear the input after successful send
            setMessageInput('');
            scrollToBottom();
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
        }
    }, [
        messageInput,
        conversationId,
        sendMessageMutation,
        isTyping,
        sendStopTyping,
        typingTimeoutRef,
        scrollToBottom,
    ]);

    // Loading state
    if (isLoading) {
        return (
            <div className="mx-auto max-w-full py-8">
                <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
                    <div className="flex h-96 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-tertiary border-t-transparent"></div>
                            <p className="text-gray-500">Chargement de la conversation...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="mx-auto max-w-full py-8">
                <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
                    <div className="flex h-96 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <User size={24} className="text-red-500" />
                            </div>
                            <p className="mb-2 text-lg font-medium text-gray-900">
                                Erreur de chargement
                            </p>
                            <p className="text-sm text-gray-500">
                                Impossible de charger la conversation
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => navigate('/messages')}
                            >
                                Retour aux messages
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No conversation found
    if (!conversationData || !safeConversationData.id) {
        return (
            <div className="mx-auto max-w-full py-8">
                <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
                    <div className="flex h-96 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <User size={24} className="text-gray-500" />
                            </div>
                            <p className="mb-2 text-lg font-medium text-gray-900">
                                Conversation introuvable
                            </p>
                            <p className="text-sm text-gray-500">
                                Cette conversation n'existe pas ou vous n'y avez pas accès
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => navigate('/messages')}
                            >
                                Retour aux messages
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Attachment options
    const attachmentOptions = [
        {
            label: 'Photo',
            icon: <Image size={16} />,
            onClick: () => alert('Fonctionnalité à venir'),
        },
        {
            label: 'Document',
            icon: <File size={16} />,
            onClick: () => alert('Fonctionnalité à venir'),
        },
    ];

    // In the message rendering section, replace the message mapping with:
    const renderMessages = () => {
        if (messageGroups.length === 0) {
            return (
                <div className="flex h-full items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            {isGroup ? <Users size={24} /> : <User size={24} />}
                        </div>
                        <p className="mb-2 text-lg font-medium">
                            {isGroup
                                ? `Bienvenue dans ${groupName}`
                                : `Conversation avec ${interlocutor?.firstName} ${interlocutor?.lastName}`}
                        </p>
                        <p className="text-sm">
                            {isGroup
                                ? 'Commencez à discuter avec votre équipe'
                                : 'Envoyez votre premier message'}
                        </p>
                    </div>
                </div>
            );
        }

        return messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-8">
                <div className="mb-6 flex justify-center">
                    <span className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-500">
                        {formatDateHeader(group.date)}
                    </span>
                </div>

                <div className="space-y-4">
                    {group.messages.map((message) => {
                        const isCurrentUser = message.author.id === user?.id;

                        return (
                            <MessageItem
                                key={message.id}
                                message={message}
                                isCurrentUser={isCurrentUser}
                                isGroup={isGroup}
                                getInitials={getInitials}
                                formatMessageDate={formatMessageDate}
                                getMessageStatus={getMessageStatus}
                            />
                        );
                    })}
                </div>
            </div>
        ));
    };

    return (
        <div className="mx-auto max-w-full py-8">
            <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
                {/* Header de la conversation */}
                <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/messages')}
                            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        {isGroup ? (
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-tertiary text-white">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">{groupName}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">
                                            {conversationUsers.length} membres
                                        </span>
                                        <div className="flex -space-x-2">
                                            {conversationUsers
                                                .slice(0, 3)
                                                .map((participant, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] ring-2 ring-white"
                                                    >
                                                        {getInitials(
                                                            participant.firstName,
                                                            participant.lastName
                                                        )}
                                                    </div>
                                                ))}
                                            {conversationUsers.length > 3 && (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] ring-2 ring-white">
                                                    +{conversationUsers.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            interlocutor && (
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-tertiary text-white">
                                        <span>
                                            {getInitials(
                                                interlocutor.firstName,
                                                interlocutor.lastName
                                            )}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-900">
                                            {interlocutor.firstName} {interlocutor.lastName}
                                        </h2>
                                        <UserPresenceIndicator
                                            userId={interlocutor.id}
                                            showText={true}
                                            size="sm"
                                        />
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setShowInfoModal(true)}
                        >
                            <Info size={16} />
                            Info
                        </Button>

                        <div className="relative">
                            <Button
                                variant="outline"
                                className="px-2"
                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                            >
                                <MoreVertical size={20} />
                            </Button>

                            {showMoreMenu && (
                                <>
                                    <div
                                        className="fixed inset-0"
                                        onClick={() => setShowMoreMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                        <div className="py-1">
                                            <button
                                                className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                onClick={() => {
                                                    alert('Fonctionnalité à venir');
                                                    setShowMoreMenu(false);
                                                }}
                                            >
                                                Rechercher
                                            </button>
                                            <button
                                                className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                onClick={() => {
                                                    markUnreadMessagesAsRead();
                                                    setShowMoreMenu(false);
                                                }}
                                                disabled={markMessagesAsReadMutation.isPending}
                                            >
                                                {markMessagesAsReadMutation.isPending ? (
                                                    <>
                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                                        Marquage en cours...
                                                    </>
                                                ) : (
                                                    'Marquer comme lu'
                                                )}
                                            </button>
                                            <button
                                                className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                onClick={() => {
                                                    alert('Fonctionnalité à venir');
                                                    setShowMoreMenu(false);
                                                }}
                                            >
                                                Archiver la conversation
                                            </button>
                                            <button
                                                className="flex w-full items-center px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            'Êtes-vous sûr de vouloir supprimer cette conversation ?'
                                                        )
                                                    ) {
                                                        navigate('/messages');
                                                    }
                                                    setShowMoreMenu(false);
                                                }}
                                            >
                                                Supprimer la conversation
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Corps de la conversation */}
                <div
                    className="flex-1 overflow-y-auto px-8 py-6"
                    style={{ height: 'calc(100vh - 20rem)' }}
                    onClick={markUnreadMessagesAsRead}
                    onFocus={markUnreadMessagesAsRead}
                    onScroll={() => {
                        // Mark as read when user scrolls through messages
                        setTimeout(() => markUnreadMessagesAsRead(), 300);
                    }}
                    tabIndex={0}
                    role="main"
                    aria-label="Messages de la conversation"
                >
                    {renderMessages()}

                    {typingUsers.size > 0 && (
                        <div className="mb-4 flex items-center gap-3 px-4 py-2 text-sm text-gray-500">
                            <div className="flex -space-x-2">
                                {Array.from(typingUsers)
                                    .slice(0, 3)
                                    .map((userId) => {
                                        const participant = conversationUsers.find(
                                            (u) => u.id === userId
                                        );
                                        return (
                                            <div
                                                key={userId}
                                                className="flex h-6 w-6 items-center justify-center rounded-full bg-tertiary text-xs text-white ring-2 ring-white"
                                            >
                                                {getInitials(
                                                    participant?.firstName || '',
                                                    participant?.lastName || ''
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                            <div className="flex items-center gap-1">
                                <span>
                                    {typingUsers.size === 1
                                        ? `${conversationUsers.find((u) => typingUsers.has(u.id))?.firstName || "Quelqu'un"} est en train d'écrire`
                                        : typingUsers.size === 2
                                          ? `${Array.from(typingUsers)
                                                .slice(0, 2)
                                                .map(
                                                    (id) =>
                                                        conversationUsers.find((u) => u.id === id)
                                                            ?.firstName
                                                )
                                                .join(' et ')} sont en train d'écrire`
                                          : `${typingUsers.size} personnes sont en train d'écrire`}
                                </span>
                                <div className="flex space-x-1">
                                    <div
                                        className="h-1 w-1 animate-bounce rounded-full bg-gray-400"
                                        style={{ animationDelay: '0ms' }}
                                    ></div>
                                    <div
                                        className="h-1 w-1 animate-bounce rounded-full bg-gray-400"
                                        style={{ animationDelay: '150ms' }}
                                    ></div>
                                    <div
                                        className="h-1 w-1 animate-bounce rounded-full bg-gray-400"
                                        style={{ animationDelay: '300ms' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <div className="border-t border-gray-100 px-8 py-6">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                        className="flex items-end gap-3"
                    >
                        <div className="relative">
                            <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                                onClick={() => setShowAttachMenu(!showAttachMenu)}
                            >
                                <Paperclip size={20} className="text-gray-500" />
                            </button>

                            {showAttachMenu && (
                                <>
                                    <div
                                        className="fixed inset-0"
                                        onClick={() => setShowAttachMenu(false)}
                                    />
                                    <div className="absolute bottom-12 left-0 rounded-lg bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5">
                                        <div className="space-y-1">
                                            {attachmentOptions.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                                                    onClick={() => {
                                                        option.onClick();
                                                        setShowAttachMenu(false);
                                                    }}
                                                >
                                                    {option.icon}
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex-1">
                            <Input
                                label=""
                                name="message"
                                value={messageInput}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder={`Envoyer un message${isGroup ? ' au groupe' : ''}...`}
                                disabled={sendMessageMutation.isPending}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={!messageInput.trim() || sendMessageMutation.isPending}
                            aria-label="Envoyer le message"
                        >
                            {sendMessageMutation.isPending ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <Send size={20} />
                            )}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Modal d'informations */}
            {showInfoModal && (
                <Modal
                    isOpen={showInfoModal}
                    onClose={() => setShowInfoModal(false)}
                    title={isGroup ? 'Détails du groupe' : 'Détails du contact'}
                >
                    <div className="space-y-6 py-2">
                        {isGroup ? (
                            <>
                                <div className="flex items-center justify-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-tertiary text-white">
                                        <Users size={32} />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {groupName}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Créé le{' '}
                                        {format(new Date(safeConversationData.createdAt), 'PPP', {
                                            locale: fr,
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="mb-3 font-medium text-gray-900">
                                        Membres ({conversationUsers.length})
                                    </h4>
                                    <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-100">
                                        {conversationUsers.map((participant, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary text-xs text-white">
                                                        {getInitials(
                                                            participant.firstName,
                                                            participant.lastName
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {participant.firstName}{' '}
                                                            {participant.lastName}
                                                            {participant.id === user?.id &&
                                                                ' (Vous)'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {participant.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setShowAddParticipantModal(true)}
                                    >
                                        <UserPlus size={16} className="mr-2" />
                                        Ajouter des membres
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => alert('Fonctionnalité à venir')}
                                    >
                                        <PlusCircle size={16} className="mr-2" />
                                        Créer une tâche
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full text-red-500 hover:text-red-600"
                                        onClick={() => {
                                            if (
                                                confirm(
                                                    'Êtes-vous sûr de vouloir quitter ce groupe ?'
                                                )
                                            ) {
                                                navigate('/messages');
                                            }
                                        }}
                                    >
                                        Quitter le groupe
                                    </Button>
                                </div>
                            </>
                        ) : (
                            interlocutor && (
                                <>
                                    <div className="flex items-center justify-center">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-tertiary text-white">
                                            <span className="text-2xl">
                                                {getInitials(
                                                    interlocutor.firstName,
                                                    interlocutor.lastName
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {interlocutor.firstName} {interlocutor.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {interlocutor.email}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                                            <span className="text-sm font-medium text-gray-900">
                                                Email
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {interlocutor.email}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => alert('Fonctionnalité à venir')}
                                        >
                                            <User size={16} className="mr-2" />
                                            Voir le profil
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => alert('Fonctionnalité à venir')}
                                        >
                                            <PlusCircle size={16} className="mr-2" />
                                            Créer une tâche
                                        </Button>
                                    </div>
                                </>
                            )
                        )}
                    </div>
                </Modal>
            )}

            {/* Modal d'ajout de participants */}
            {showAddParticipantModal && (
                <Modal
                    isOpen={showAddParticipantModal}
                    onClose={() => setShowAddParticipantModal(false)}
                    title="Ajouter des membres au groupe"
                >
                    <div className="space-y-4 py-2">
                        <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-700">
                                Sélectionner des utilisateurs à ajouter
                            </h3>

                            <div className="mb-2">
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-tertiary focus:outline-none"
                                    placeholder="Rechercher des utilisateurs..."
                                    value={searchParticipantTerm}
                                    onChange={(e) => setSearchParticipantTerm(e.target.value)}
                                />
                            </div>

                            {selectedNewParticipants.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {selectedNewParticipants.map((participantId) => {
                                        const contact = filteredContacts.find(
                                            (c) => c.id === participantId
                                        );
                                        if (!contact) return null;

                                        return (
                                            <div
                                                key={participantId}
                                                className="flex items-center gap-1 rounded-full bg-tertiary/10 px-2 py-1 text-sm text-tertiary"
                                            >
                                                <span>
                                                    {contact.firstName} {contact.lastName}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="ml-1 rounded-full p-0.5 hover:bg-tertiary/20"
                                                    onClick={() =>
                                                        toggleParticipantSelection(participantId)
                                                    }
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="max-h-60 overflow-y-auto rounded border border-gray-200">
                            {isContactsLoading ? (
                                <div className="flex h-20 items-center justify-center">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-tertiary border-t-transparent"></div>
                                </div>
                            ) : filteredContacts.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    Aucun utilisateur disponible à ajouter
                                </div>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className={`flex items-center justify-between border-b border-gray-100 px-4 py-2 last:border-b-0 ${
                                            selectedNewParticipants.includes(contact.id)
                                                ? 'bg-tertiary/10'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                                                {getInitials(contact.firstName, contact.lastName)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {contact.firstName} {contact.lastName}
                                                </p>
                                                <span className="text-xs text-gray-500">
                                                    {contact.email}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant={
                                                selectedNewParticipants.includes(contact.id)
                                                    ? 'primary'
                                                    : 'outline'
                                            }
                                            onClick={() => toggleParticipantSelection(contact.id)}
                                            className="px-2 py-1 text-sm"
                                        >
                                            {selectedNewParticipants.includes(contact.id) ? (
                                                <span className="flex items-center gap-1">
                                                    <Users size={16} />
                                                    Ajouté
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <UserPlus size={16} />
                                                    Ajouter
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddParticipantModal(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleAddParticipants}
                            disabled={
                                selectedNewParticipants.length === 0 ||
                                updateParticipantsMutation.isPending
                            }
                        >
                            {updateParticipantsMutation.isPending ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Ajout en cours...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} className="mr-2" />
                                    Ajouter à la conversation
                                </>
                            )}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
