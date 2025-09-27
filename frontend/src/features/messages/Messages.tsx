import { useChats, useCreateChat, useGroups } from '@/api/queries/chatQueries';
import { useUnreadMessageCounts } from '@/api/queries/messageQueries';
import { useContactableUsers, useOnlineUsers, useValidateContact } from '@/api/queries/userQueries';
import { websocketService } from '@/api/websocket/websocketService';
import { useWebSocket } from '@/hooks/useWebSocket';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Import shared DTOs instead of creating custom interfaces
import { ContactType, ConversationDto, RestrictedUserDto } from '@shared/dto';
import { UserRole } from '@shared/dto/userDto';
import { TypingData, UserPresenceData } from '@shared/types/conversationTypes';
import { ServerWebSocketMessage, WebSocketEventType } from '@shared/types/websocketTypes';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, PlusCircle, User, UserPlus, Users, X } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { SearchBar } from '@/components/ui/SearchBar/SearchBar';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import UserPresenceIndicator from '@/components/ui/UserPresenceIndicator/UserPresenceIndicator';

import { useAuthStore } from '@/stores/authStore';
import { useUserPresenceStore } from '@/stores/userPresenceStore';

// Remove mock imports since we're using real data
// import messagesDataRaw from '@/mocks/messageMock.json';
// import usersData from '@/mocks/usersMock.json';

type UserType = 'ALL' | 'CLIENT' | 'AGENT' | 'LEAD' | 'CGP' | 'GROUP';

// Type guard functions using consolidated interfaces
const isTypingData = (data: any): data is TypingData => {
    return (
        data &&
        typeof data === 'object' &&
        typeof data.userId === 'string' &&
        typeof data.conversationId === 'string'
    );
};

const isUserPresenceData = (data: any): data is UserPresenceData => {
    return (
        data &&
        typeof data === 'object' &&
        typeof data.userId === 'string' &&
        typeof data.status === 'string'
    );
};

export default function Messages() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const { initializeOnlineUsers } = useUserPresenceStore();

    // API calls
    const { data: conversationsData, isLoading, error } = useChats();

    // Fetch groups data
    const { data: groupsData, isLoading: isGroupsLoading, error: groupsError } = useGroups();

    const { data: onlineUsers } = useOnlineUsers();
    const createConversationMutation = useCreateChat();

    // Get unread message counts from API
    const { data: unreadMessageCounts = [] } = useUnreadMessageCounts();

    // Create a map of conversation ID to unread count for quick lookup
    const unreadCountsMap = useMemo(() => {
        const map = new Map<string, number>();
        unreadMessageCounts.forEach((item) => {
            map.set(item.conversationId, item.unreadCount);
        });
        return map;
    }, [unreadMessageCounts]);

    const [activeTab, setActiveTab] = useState<'messages' | 'contacts'>('messages');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserType, setSelectedUserType] = useState<UserType>('ALL');

    // Helper function to convert UserType to UserRole
    const getRoleFromUserType = (userType: UserType): UserRole => {
        switch (userType) {
            case 'CLIENT':
                return UserRole.Client;
            case 'AGENT':
                return UserRole.Agent;
            case 'LEAD':
                return UserRole.Lead;
            case 'CGP':
                return UserRole.CGP;
            default:
                return UserRole.User;
        }
    };

    // Helper function to convert UserType to ContactType
    const getContactTypeFromUserType = (userType: UserType): ContactType => {
        switch (userType) {
            case 'CLIENT':
                return ContactType.Client;
            case 'AGENT':
                return ContactType.Agent;
            case 'LEAD':
                return ContactType.Prospect;
            case 'CGP':
                return ContactType.CGP;
            default:
                return ContactType.Admin;
        }
    };

    // Contact permissions API calls
    const {
        data: contactsData,
        isLoading: isContactsLoading,
        error: contactsError,
        refetch: refetchContacts,
    } = useContactableUsers({
        search: searchQuery,
        type: selectedUserType !== 'ALL' ? getContactTypeFromUserType(selectedUserType) : undefined,
        page: 1,
        limit: 50,
    });
    const validateContactMutation = useValidateContact();
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [showNewMessageMenu, setShowNewMessageMenu] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [tabIndicatorStyle, setTabIndicatorStyle] = useState({ width: 0, left: 0 });
    const messagesTabRef = useRef<HTMLButtonElement>(null);
    const contactsTabRef = useRef<HTMLButtonElement>(null);
    const newMessageButtonRef = useRef<HTMLButtonElement>(null);

    // Contacts from API - will be populated from contactsData
    const [contacts, setContacts] = useState<RestrictedUserDto[]>([]);

    // State for real-time typing indicators per conversation
    const [typingIndicators, setTypingIndicators] = useState<Map<string, Set<string>>>(new Map());

    // State to track recently updated conversations for visual feedback
    const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(new Set());

    // WebSocket message handler
    const handleWebSocketMessage = useCallback(
        (message: ServerWebSocketMessage) => {
            try {
                if (!message || !message.type) {
                    console.warn('Received invalid WebSocket message:', message);
                    return;
                }

                console.log(`Processing WebSocket message: ${message.type}`, message);

                switch (message.type) {
                    case 'NEW_MESSAGE':
                        // Only process messages for conversations we're actually in
                        if (message.conversationId) {
                            // Check if this message belongs to a chat we're in
                            const isUserInChat =
                                conversationsData?.some(
                                    (conv) => conv.id === message.conversationId
                                ) ||
                                groupsData?.some((group) => group.id === message.conversationId);

                            if (!isUserInChat) {
                                console.log(
                                    `Ignoring message for chat ${message.conversationId} - user is not a participant`
                                );
                                return;
                            }

                            console.log(
                                `Updating data for new message in conversation ${message.conversationId}`
                            );

                            // Invalidate both conversations and groups queries
                            queryClient.invalidateQueries({ queryKey: ['chats'] });
                            queryClient.refetchQueries({
                                queryKey: ['chats'],
                                type: 'active',
                            });
                            queryClient.invalidateQueries({ queryKey: ['groups'] });
                            queryClient.refetchQueries({ queryKey: ['groups'], type: 'active' });

                            // Also invalidate unread counts
                            queryClient.invalidateQueries({ queryKey: ['unreadMessageCounts'] });

                            // Add visual feedback for the updated conversation
                            setRecentlyUpdated((prev) => {
                                const newSet = new Set(prev);
                                newSet.add(message.conversationId!);
                                return newSet;
                            });

                            // Remove the highlight after 3 seconds
                            setTimeout(() => {
                                setRecentlyUpdated((prev) => {
                                    const newSet = new Set(prev);
                                    newSet.delete(message.conversationId!);
                                    return newSet;
                                });
                            }, 3000);
                        }
                        break;

                    case 'MESSAGE_READ':
                        // Only process read status for conversations we're in
                        if (message.conversationId && message.data) {
                            const isUserInChat =
                                conversationsData?.some(
                                    (conv) => conv.id === message.conversationId
                                ) ||
                                groupsData?.some((group) => group.id === message.conversationId);

                            if (!isUserInChat) {
                                console.log(
                                    `Ignoring read status for chat ${message.conversationId} - user is not a participant`
                                );
                                return;
                            }

                            console.log(
                                `Updating data for read status in conversation ${message.conversationId}`
                            );

                            // Invalidate both conversations and groups queries
                            queryClient.invalidateQueries({ queryKey: ['chats'] });
                            queryClient.refetchQueries({
                                queryKey: ['chats'],
                                type: 'active',
                            });
                            queryClient.invalidateQueries({ queryKey: ['groups'] });
                            queryClient.refetchQueries({ queryKey: ['groups'], type: 'active' });

                            // Also invalidate unread counts
                            queryClient.invalidateQueries({ queryKey: ['unreadMessageCounts'] });
                        }
                        break;

                    case 'USER_TYPING':
                        if (message.conversationId && isTypingData(message.data)) {
                            // Check if this typing indicator is for a chat we're in
                            const isUserInChat =
                                conversationsData?.some(
                                    (conv) => conv.id === message.conversationId
                                ) ||
                                groupsData?.some((group) => group.id === message.conversationId);

                            if (!isUserInChat) {
                                console.log(
                                    `Ignoring typing indicator for chat ${message.conversationId} - user is not a participant`
                                );
                                return;
                            }

                            setTypingIndicators((prev) => {
                                const newMap = new Map(prev);
                                const conversationTyping =
                                    newMap.get(message.conversationId!) || new Set();
                                conversationTyping.add((message.data as TypingData).userId);
                                newMap.set(message.conversationId!, conversationTyping);
                                return newMap;
                            });
                        }
                        break;

                    case 'USER_STOPPED_TYPING':
                        if (message.conversationId && isTypingData(message.data)) {
                            // Check if this typing indicator is for a chat we're in
                            const isUserInChat =
                                conversationsData?.some(
                                    (conv) => conv.id === message.conversationId
                                ) ||
                                groupsData?.some((group) => group.id === message.conversationId);

                            if (!isUserInChat) {
                                console.log(
                                    `Ignoring stopped typing indicator for chat ${message.conversationId} - user is not a participant`
                                );
                                return;
                            }

                            setTypingIndicators((prev) => {
                                const newMap = new Map(prev);
                                const conversationTyping = newMap.get(message.conversationId!);
                                if (conversationTyping) {
                                    conversationTyping.delete((message.data as TypingData).userId);
                                    if (conversationTyping.size === 0) {
                                        newMap.delete(message.conversationId!);
                                    } else {
                                        newMap.set(message.conversationId!, conversationTyping);
                                    }
                                }
                                return newMap;
                            });
                        }
                        break;

                    case 'USER_ONLINE':
                        if (isUserPresenceData(message.data) && message.data.userId !== user?.id) {
                            initializeOnlineUsers([message.data.userId]); // Add user to online list
                        }
                        break;

                    case 'USER_OFFLINE':
                        if (isUserPresenceData(message.data) && message.data.userId !== user?.id) {
                            // Remove user from online list - this would need a new method in the store
                            console.log('User went offline:', message.data.userId);
                        }
                        break;

                    default:
                        break;
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error, message);
            }
        },
        [conversationsData, groupsData, user?.id, queryClient, initializeOnlineUsers]
    );

    // Use WebSocket hook
    const { sendMessage, isConnected } = useWebSocket({
        onMessage: handleWebSocketMessage,
        autoConnect: true,
    });

    // Function to manually refresh data
    const handleManualRefresh = useCallback(() => {
        console.log('Manual refresh triggered');
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.refetchQueries({ queryKey: ['chats'], type: 'active' });
        queryClient.invalidateQueries({ queryKey: ['groups'] });
        queryClient.refetchQueries({ queryKey: ['groups'], type: 'active' });
        queryClient.invalidateQueries({ queryKey: ['unreadMessageCounts'] });
    }, [queryClient]);

    // Set up polling as a fallback for WebSocket
    useEffect(() => {
        // Poll every 5 seconds if disconnected, 30 seconds if connected
        const interval = setInterval(
            () => {
                if (!isConnected) {
                    console.log('WebSocket disconnected - polling for updates');
                    handleManualRefresh();
                } else {
                    // Still poll occasionally even when connected
                    console.log('Periodic refresh while connected');
                    handleManualRefresh();
                }
            },
            isConnected ? 30000 : 5000
        );

        return () => clearInterval(interval);
    }, [isConnected, handleManualRefresh]);

    // Join all conversations for real-time updates
    useEffect(() => {
        if (isConnected && (conversationsData || groupsData)) {
            // Combine conversations and groups, ensuring no duplicates
            const allConversations = [...(conversationsData || [])];

            // Add groups that aren't already in conversations
            if (groupsData) {
                const conversationIds = new Set(allConversations.map((conv) => conv.id));
                groupsData.forEach((group) => {
                    if (!conversationIds.has(group.id)) {
                        allConversations.push(group);
                    }
                });
            }

            console.log(
                `Joining ${allConversations.length} conversations/groups for WebSocket updates`
            );

            // Throttle joining conversations to avoid overwhelming the server
            const joinConversation = (index: number) => {
                if (index >= allConversations.length) return;

                const conversation = allConversations[index];
                sendMessage({
                    type: WebSocketEventType.JOIN_CONVERSATION,
                    conversationId: conversation.id,
                    timestamp: new Date().toISOString(),
                });

                // Join next conversation after a small delay
                setTimeout(() => joinConversation(index + 1), 100);
            };

            // Start joining conversations
            joinConversation(0);

            // Cleanup: leave conversations when component unmounts or conversations change
            return () => {
                allConversations.forEach((conversation) => {
                    sendMessage({
                        type: WebSocketEventType.LEAVE_CONVERSATION,
                        conversationId: conversation.id,
                        timestamp: new Date().toISOString(),
                    });
                });
            };
        }
    }, [
        isConnected,
        // Use stable dependencies to avoid frequent reconnections
        conversationsData ? conversationsData.length : 0,
        groupsData ? groupsData.length : 0,
        sendMessage,
    ]);

    // Options pour le filtre de type d'utilisateur
    const userTypeOptions = [
        { value: 'ALL' as UserType, label: 'Tous' },
        { value: 'CLIENT' as UserType, label: 'Clients' },
        { value: 'AGENT' as UserType, label: 'Agents' },
        { value: 'LEAD' as UserType, label: 'Leads' },
        { value: 'CGP' as UserType, label: 'CGP' },
        { value: 'GROUP' as UserType, label: 'Groupes' },
    ];

    // Memoize the combined conversations and groups
    const conversations: ConversationDto[] = useMemo(() => {
        const directConversations = conversationsData || [];
        const groups = groupsData || [];

        // Create a set of conversation IDs to check for duplicates
        const conversationIds = new Set(directConversations.map((conv) => conv.id));

        // Filter out groups that already exist in conversations
        const uniqueGroups = groups.filter((group) => !conversationIds.has(group.id));

        console.log(
            `Combining ${directConversations.length} conversations and ${uniqueGroups.length} unique groups (filtered out ${groups.length - uniqueGroups.length} duplicates)`
        );

        return [...directConversations, ...uniqueGroups];
    }, [conversationsData, groupsData]);

    // Remove duplicate conversations - keep the most recent one
    const uniqueConversations = useMemo(() => {
        // First, deduplicate by ID (this handles exact duplicates)
        const uniqueById = new Map<string, ConversationDto>();

        // Add all conversations to the map, with the ID as the key
        conversations.forEach((conv) => {
            uniqueById.set(conv.id, conv);
        });

        // Convert map values to array
        const deduplicatedById = Array.from(uniqueById.values());

        // Sort by creation date (most recent first)
        const sorted = [...deduplicatedById].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Now handle 1:1 conversations with the same participants
        const seen = new Set<string>();
        const userPairs = new Map<string, ConversationDto[]>();

        // Group private conversations by the other participant
        sorted
            .filter(
                (conv) => conv.type !== 'group' && conv.type !== 'groupe' && conv.type !== 'privé'
            )
            .forEach((conv) => {
                const otherUsers =
                    conv.users?.filter((u: RestrictedUserDto) => u.id !== user?.id) || [];
                if (otherUsers.length === 1) {
                    const otherUserId = otherUsers[0].id;
                    if (!userPairs.has(otherUserId)) {
                        userPairs.set(otherUserId, []);
                    }
                    userPairs.get(otherUserId)!.push(conv);
                }
            });

        // For each user pair, mark all but the most recent as seen (to be filtered out)
        userPairs.forEach((convs, userId) => {
            if (convs.length > 1) {
                // Sort by date (most recent first)
                const sorted = [...convs].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                // Keep the first (most recent) and mark the rest as seen
                for (let i = 1; i < sorted.length; i++) {
                    seen.add(sorted[i].id);
                }
            }
        });

        // Return only conversations that aren't marked as duplicates
        const result = sorted.filter((conv) => !seen.has(conv.id));
        console.log(
            `After full deduplication: ${result.length} conversations (removed ${sorted.length - result.length} duplicates)`
        );
        return result;
    }, [conversations, user?.id]);

    // Calculate unread count and last message for each conversation
    const processedConversations = useMemo(() => {
        return uniqueConversations
            .map((conv) => {
                // Get unread count from the API response
                const unreadCount = unreadCountsMap.get(conv.id) || 0;

                const lastMessage =
                    conv.messages && conv.messages.length > 0
                        ? conv.messages.sort(
                              (a, b) =>
                                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                          )[0]
                        : undefined;

                return {
                    ...conv,
                    unreadCount,
                    lastMessage,
                };
            })
            .sort((a: any, b: any) => {
                // Sort by last message timestamp (most recent first)
                const aTime = a.lastMessage
                    ? new Date(a.lastMessage.createdAt).getTime()
                    : new Date(a.createdAt).getTime();
                const bTime = b.lastMessage
                    ? new Date(b.lastMessage.createdAt).getTime()
                    : new Date(b.createdAt).getTime();
                return bTime - aTime;
            });
    }, [uniqueConversations, unreadCountsMap]);

    // Update contacts from API data
    useEffect(() => {
        if (contactsData?.data?.contacts) {
            setContacts(contactsData.data.contacts);
        }
    }, [contactsData]);

    // Extract unique contacts from conversations as fallback
    useEffect(() => {
        if (
            conversationsData &&
            Array.isArray(conversationsData) &&
            (!contactsData || !contactsData.data?.contacts)
        ) {
            const allUsers = new Map<string, RestrictedUserDto>();

            conversationsData.forEach((conv) => {
                // Ensure users array exists and is an array
                const users = conv.users || [];
                users.forEach((convUser) => {
                    if (convUser && convUser.id && convUser.id !== user?.id) {
                        // Exclude current user and ensure user exists
                        allUsers.set(convUser.id, convUser);
                    }
                });
            });

            setContacts(Array.from(allUsers.values()));
        }
    }, [conversationsData, user?.id, contactsData]);

    // Initialize user presence from API when online users data is available
    useEffect(() => {
        if (onlineUsers) {
            initializeOnlineUsers(onlineUsers);
        }
    }, [onlineUsers, initializeOnlineUsers]);

    // Fonction pour obtenir le type d'un utilisateur à partir de son rôle
    const getUserTypeFromRole = (user: RestrictedUserDto): UserType => {
        // Check if user has roles array
        if (!user.roles || user.roles.length === 0) {
            return 'ALL';
        }

        // Check for specific roles in priority order
        if (user.roles.includes(UserRole.Client)) return 'CLIENT';
        if (user.roles.includes(UserRole.Agent)) return 'AGENT';
        if (user.roles.includes(UserRole.Lead)) return 'LEAD';
        if (user.roles.includes(UserRole.CGP)) return 'CGP';

        // Default to ALL if no specific role matches
        return 'ALL';
    };

    // Fonction pour vérifier si un contact correspond au filtre de type sélectionné
    const matchesUserTypeFilter = (contact: RestrictedUserDto): boolean => {
        if (selectedUserType === 'ALL') return true;
        const contactType = getUserTypeFromRole(contact);
        return contactType === selectedUserType;
    };

    // Filtrer les conversations selon la recherche et le type d'utilisateur
    const filteredConversations = processedConversations.filter((conv) => {
        // Helper function to check if conversation is a group
        const isGroup = conv.type === 'group' || conv.type === 'groupe' || conv.type === 'privé';

        // Si on filtre sur les groupes uniquement
        if (selectedUserType === 'GROUP') {
            return (
                isGroup &&
                (conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery)
            );
        }

        // Pour les groupes, filtrer par nom du groupe
        if (isGroup) {
            // Si on ne veut pas montrer les groupes avec les autres filtres
            if (selectedUserType !== 'ALL') return false;

            return conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery;
        }

        // Pour les conversations 1:1, filtrer par nom de l'interlocuteur
        const otherUsers = conv.users?.filter((u) => u.id !== user?.id) || [];
        const interlocutor = otherUsers[0];

        if (!interlocutor) return false;

        const nameMatches = `${interlocutor.firstName} ${interlocutor.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const typeMatches =
            selectedUserType === 'ALL' || getUserTypeFromRole(interlocutor) === selectedUserType;

        return nameMatches && typeMatches;
    });

    const filteredContacts = contacts.filter((contact) => {
        const nameMatches = `${contact.firstName} ${contact.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const typeMatches = matchesUserTypeFilter(contact);
        return nameMatches && typeMatches;
    });

    // Fonction pour obtenir le nom de l'interlocuteur ou du groupe
    const getConversationName = (conversation: ConversationDto) => {
        // If it's a group with a name, use that name
        if (
            (conversation.type === 'group' ||
                conversation.type === 'groupe' ||
                conversation.type === 'privé') &&
            conversation.name
        ) {
            return conversation.name;
        }

        // If it's a group without a name, show up to 3 participant names
        if (
            conversation.type === 'group' ||
            conversation.type === 'groupe' ||
            conversation.type === 'privé'
        ) {
            const otherUsers = conversation.users?.filter((u) => u.id !== user?.id) || [];

            if (otherUsers.length === 0) return 'Groupe sans participants';

            if (otherUsers.length === 1) {
                return `${otherUsers[0].firstName} ${otherUsers[0].lastName}`;
            }

            if (otherUsers.length === 2) {
                return `${otherUsers[0].firstName} ${otherUsers[0].lastName}, ${otherUsers[1].firstName} ${otherUsers[1].lastName}`;
            }

            return `${otherUsers[0].firstName} ${otherUsers[0].lastName}, ${otherUsers[1].firstName} ${otherUsers[1].lastName} et ${otherUsers.length - 2} autres`;
        }

        // For regular 1:1 conversations
        const otherUsers =
            conversation.users?.filter((u: RestrictedUserDto) => u.id !== user?.id) || [];
        const interlocutor = otherUsers[0];
        return interlocutor
            ? `${interlocutor.firstName} ${interlocutor.lastName}`
            : 'Utilisateur inconnu';
    };

    // Fonction pour obtenir les initiales de la personne ou du groupe
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`;
    };

    // Fonction pour obtenir l'interlocuteur d'une conversation
    const getInterlocutor = (conversation: ConversationDto) => {
        const otherUsers =
            conversation.users?.filter((u: RestrictedUserDto) => u.id !== user?.id) || [];
        return otherUsers[0];
    };

    const handleSelectContact = async (contactId: string) => {
        // Validate contact permissions first
        try {
            const validationResult = await validateContactMutation.mutateAsync({
                targetUserId: contactId,
            });

            if (!validationResult.data?.canContact) {
                console.warn('Contact not allowed:', validationResult.data?.reason);
                // You could show a toast notification here
                return;
            }
        } catch (error) {
            console.error('Error validating contact:', error);
            // Proceed anyway if validation fails
        }

        // Improved logic to find existing conversation with this contact
        const existingConv = processedConversations.find((conv) => {
            // Skip group conversations - check for both 'group' and 'groupe'
            if (conv.type === 'group' || conv.type === 'groupe') return false;

            // For private conversations, check if it's between current user and the selected contact
            const userIds = conv.users?.map((u) => u.id) || [];
            const hasCurrentUser = userIds.includes(user?.id || '');
            const hasTargetContact = userIds.includes(contactId);
            const isOnlyTwoUsers = userIds.length === 2;

            // Must be a private conversation between exactly these two users
            return hasCurrentUser && hasTargetContact && isOnlyTwoUsers;
        });

        if (existingConv) {
            console.log('Found existing conversation:', existingConv.id);
            navigate(`/messages/${existingConv.id}`);
        } else {
            // Créer une nouvelle conversation via l'API
            try {
                console.log('Creating new conversation with contact:', contactId);
                const newConversation = await createConversationMutation.mutateAsync({
                    type: 'private',
                    userIds: [user?.id || '', contactId], // Include current user in the conversation
                });

                console.log('New conversation created:', newConversation);

                // Refresh conversations list to include the new conversation
                queryClient.invalidateQueries({ queryKey: ['chats'] });

                navigate(`/messages/${newConversation.id}`);
            } catch (error) {
                console.error('Erreur lors de la création de la conversation:', error);
            }
        }
    };

    // Gestion de la recherche
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // Refetch contacts when search changes
        if (activeTab === 'contacts') {
            refetchContacts();
        }
    };

    // Gestion du changement de filtre de type
    const handleTypeFilterChange = (value: string) => {
        setSelectedUserType(value as UserType);
        // Refetch contacts when filter changes
        if (activeTab === 'contacts') {
            refetchContacts();
        }
    };

    // Fonction pour créer un groupe
    const handleCreateGroup = async () => {
        // Validate inputs
        if (!groupName.trim()) {
            alert('Veuillez entrer un nom pour le groupe');
            return;
        }

        if (selectedContacts.length === 0) {
            alert('Veuillez sélectionner au moins un contact pour le groupe');
            return;
        }

        try {
            // Show loading state is handled by the button's disabled prop
            const newGroup = await createConversationMutation.mutateAsync({
                type: 'group',
                name: groupName.trim(),
                userIds: [user?.id || '', ...selectedContacts], // Include current user in the group
            });

            console.log('Groupe créé avec succès:', newGroup);

            // Réinitialiser le formulaire et fermer la modale
            setGroupName('');
            setSelectedContacts([]);
            setShowCreateGroupModal(false);

            // Refresh conversations list to include the new group
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });

            // Naviguer vers la nouvelle conversation de groupe
            navigate(`/messages/${newGroup.id}`);
        } catch (error: any) {
            console.error('Erreur lors de la création du groupe:', error);
            alert(
                `Erreur lors de la création du groupe: ${error?.message || 'Une erreur est survenue'}`
            );
        }
    };

    // Toggle sélection d'un contact pour un groupe
    const toggleContactSelection = (contactId: string) => {
        setSelectedContacts((prev) =>
            prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
        );
    };

    // Rediriger vers la page de conversation
    const handleConversationClick = (conversationId: string) => {
        navigate(`/messages/${conversationId}`);
    };

    // Ajouter des états pour les recherches dans les modales
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [directMessageSearchTerm, setDirectMessageSearchTerm] = useState('');

    // Gérer les recherches dans les modales
    const handleGroupSearch = (query: string) => {
        setGroupSearchTerm(query);
    };

    const handleDirectMessageSearch = (query: string) => {
        setDirectMessageSearchTerm(query);
    };

    // Filtrer les contacts pour la modale de message direct
    const filteredContactsForDirectMessage = contacts.filter((contact) => {
        const nameMatches = `${contact.firstName} ${contact.lastName}`
            .toLowerCase()
            .includes(directMessageSearchTerm.toLowerCase());
        return nameMatches;
    });

    // Filtrer les contacts pour la modale de groupe
    const filteredContactsForGroup = contacts.filter((contact) => {
        const nameMatches = `${contact.firstName} ${contact.lastName}`
            .toLowerCase()
            .includes(groupSearchTerm.toLowerCase());
        return nameMatches;
    });

    // Effet pour calculer la position et largeur de l'indicateur d'onglet
    useEffect(() => {
        const updateTabIndicator = () => {
            const activeTabRef = activeTab === 'messages' ? messagesTabRef : contactsTabRef;
            const messagesTab = messagesTabRef.current;

            if (activeTabRef.current && messagesTab) {
                const activeRect = activeTabRef.current.getBoundingClientRect();
                const messagesRect = messagesTab.getBoundingClientRect();

                setTabIndicatorStyle({
                    width: activeRect.width,
                    left: activeRect.left - messagesRect.left,
                });
            }
        };

        // Calculer immédiatement
        updateTabIndicator();

        // Recalculer lors du redimensionnement
        window.addEventListener('resize', updateTabIndicator);

        return () => {
            window.removeEventListener('resize', updateTabIndicator);
        };
    }, [activeTab]);

    // Loading state
    if (isLoading) {
        return (
            <div className="mx-auto max-w-full py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {t('messages.centerTitle')}
                    </h1>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="flex h-96 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-tertiary border-t-transparent"></div>
                            <p className="text-gray-500">Chargement des conversations...</p>
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
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {t('messages.centerTitle')}
                    </h1>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="flex h-96 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <MessageCircle size={24} className="text-red-500" />
                            </div>
                            <p className="mb-2 text-lg font-medium text-gray-900">
                                Erreur de chargement
                            </p>
                            <p className="text-sm text-gray-500">
                                Impossible de charger les conversations
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-full py-8">
            {/* Connection Status Indicator */}
            {!isConnected && (
                <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
                            <span className="text-sm text-yellow-700">
                                Reconnexion en cours... Les messages en temps réel sont
                                temporairement indisponibles.
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Force WebSocket reconnection
                                websocketService.disconnect();
                                setTimeout(() => {
                                    const protocol =
                                        window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                                    const host = window.location.host;
                                    const wsUrl = `ws://localhost:3000/ws/chat?token=${useAuthStore.getState().accessToken}`;
                                    websocketService.connect(wsUrl);
                                }, 500);

                                // Also refresh data
                                handleManualRefresh();
                            }}
                            className="px-2 py-1 text-sm"
                        >
                            Forcer la reconnexion
                        </Button>
                    </div>
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {t('messages.centerTitle')}
                    </h1>
                    {isConnected && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs">En ligne</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleManualRefresh}
                        variant="outline"
                        className="flex items-center gap-2"
                        title="Actualiser les conversations"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 2v6h-6"></path>
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                            <path d="M3 22v-6h6"></path>
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                        </svg>
                        Actualiser
                    </Button>
                    <Button
                        ref={newMessageButtonRef}
                        onClick={() => setShowNewMessageMenu(!showNewMessageMenu)}
                        className="flex items-center gap-2"
                    >
                        <PlusCircle size={18} />
                        {t('messages.actions.newMessage')}
                    </Button>

                    {showNewMessageMenu && (
                        <>
                            <div
                                className="fixed inset-0"
                                onClick={() => setShowNewMessageMenu(false)}
                            />
                            <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="py-1">
                                    <button
                                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100"
                                        onClick={() => {
                                            setShowNewMessageMenu(false);
                                            setShowNewMessageModal(true);
                                        }}
                                    >
                                        <User size={16} />
                                        {t('messages.actions.directMessage')}
                                    </button>
                                    <button
                                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100"
                                        onClick={() => {
                                            setShowNewMessageMenu(false);
                                            setShowCreateGroupModal(true);
                                        }}
                                    >
                                        <Users size={16} />
                                        {t('messages.actions.newGroup')}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="mb-8 flex items-center justify-between">
                <div className="flex">
                    {/* Onglets de navigation */}
                    <div className="relative flex">
                        <button
                            ref={messagesTabRef}
                            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium ${activeTab === 'messages' ? 'text-gray-900' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('messages')}
                        >
                            <MessageCircle size={18} />
                            {t('messages.tabs.conversations')}
                            {processedConversations.reduce((acc, conv) => {
                                return acc + (conv.unreadCount || 0);
                            }, 0) > 0 && (
                                <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {(() => {
                                        const total = processedConversations.reduce(
                                            (acc, conv) => acc + (conv.unreadCount || 0),
                                            0
                                        );
                                        return total;
                                    })()}
                                </span>
                            )}
                        </button>
                        <button
                            ref={contactsTabRef}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium ${activeTab === 'contacts' ? 'text-gray-900' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('contacts')}
                        >
                            <User size={18} />
                            {t('messages.tabs.contacts')}
                        </button>

                        <AnimatePresence initial={false}>
                            <motion.div
                                key={activeTab}
                                className="absolute bottom-0 h-[2px] rounded-t-full bg-tertiary"
                                layoutId="activeTab"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                style={{
                                    width: `${tabIndicatorStyle.width}px`,
                                    left: `${tabIndicatorStyle.left}px`,
                                }}
                            />
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Sélecteur de type d'utilisateur */}
                    <div className="w-48">
                        <SelectInput
                            label=""
                            name="userType"
                            options={userTypeOptions}
                            value={selectedUserType}
                            onChange={handleTypeFilterChange}
                        />
                    </div>

                    {/* Barre de recherche */}
                    <div className="w-64">
                        <SearchBar
                            placeholder={t(
                                `messages.searchPlaceholder.${activeTab === 'messages' ? 'conversation' : 'contact'}`
                            )}
                            onSearch={handleSearch}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
                {activeTab === 'messages' && (
                    <div className="space-y-1">
                        {filteredConversations.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                                {searchQuery || selectedUserType !== 'ALL'
                                    ? t('messages.noSearchResults')
                                    : t('messages.empty')}
                            </div>
                        ) : (
                            filteredConversations.map((conversation) => {
                                const typingUsers = typingIndicators.get(conversation.id);
                                const isTyping = typingUsers && typingUsers.size > 0;
                                const isRecentlyUpdated = recentlyUpdated.has(conversation.id);

                                return (
                                    <div
                                        key={conversation.id}
                                        className={`relative flex cursor-pointer items-center gap-3 rounded-lg py-4 pl-6 pr-10 transition-all duration-300 hover:bg-gray-50 ${
                                            (conversation.unreadCount || 0) > 0
                                                ? 'border-l-4 border-l-blue-500 bg-blue-50'
                                                : isRecentlyUpdated
                                                  ? 'border-l-4 border-l-green-500 bg-green-50'
                                                  : ''
                                        }`}
                                        onClick={() => handleConversationClick(conversation.id)}
                                    >
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-tertiary text-white">
                                            {conversation.type === 'group' ||
                                            conversation.type === 'groupe' ||
                                            conversation.type === 'privé' ? (
                                                <Users size={18} />
                                            ) : (
                                                <p>
                                                    {getConversationName(conversation)
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                        .substring(0, 2)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {getConversationName(conversation)}
                                                    </h3>
                                                    {(conversation.unreadCount || 0) > 0 && (
                                                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                                            {conversation.unreadCount}
                                                        </span>
                                                    )}
                                                    {(conversation.type === 'group' ||
                                                        conversation.type === 'groupe' ||
                                                        conversation.type === 'privé') && (
                                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                                            {conversation.users?.length || 0}{' '}
                                                            {t('messages.group.members')}
                                                        </span>
                                                    )}
                                                    {/* Show presence indicator for 1:1 conversations */}
                                                    {conversation.type !== 'group' &&
                                                        conversation.type !== 'groupe' &&
                                                        conversation.type !== 'privé' && (
                                                            <UserPresenceIndicator
                                                                userId={
                                                                    getInterlocutor(conversation)
                                                                        ?.id || ''
                                                                }
                                                                size="sm"
                                                            />
                                                        )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {conversation.type !== 'group' &&
                                                        conversation.type !== 'groupe' &&
                                                        conversation.type !== 'privé' && (
                                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                                                {
                                                                    getInterlocutor(
                                                                        conversation
                                                                    )?.email.split('@')[0]
                                                                }
                                                            </span>
                                                        )}
                                                    <span className="text-xs text-gray-500">
                                                        {conversation.lastMessage &&
                                                            new Date(
                                                                conversation.lastMessage.createdAt
                                                            ).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                {isTyping ? (
                                                    <div className="flex items-center gap-1 text-xs text-tertiary">
                                                        <div className="flex space-x-1">
                                                            <div
                                                                className="h-1 w-1 animate-bounce rounded-full bg-tertiary"
                                                                style={{ animationDelay: '0ms' }}
                                                            ></div>
                                                            <div
                                                                className="h-1 w-1 animate-bounce rounded-full bg-tertiary"
                                                                style={{ animationDelay: '150ms' }}
                                                            ></div>
                                                            <div
                                                                className="h-1 w-1 animate-bounce rounded-full bg-tertiary"
                                                                style={{ animationDelay: '300ms' }}
                                                            ></div>
                                                        </div>
                                                        <span>
                                                            {typingUsers!.size === 1
                                                                ? "En train d'écrire..."
                                                                : `${typingUsers!.size} personnes écrivent...`}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p className="line-clamp-1 text-xs text-gray-600">
                                                        {(conversation.type === 'group' ||
                                                            conversation.type === 'groupe' ||
                                                            conversation.type === 'privé') &&
                                                        conversation.lastMessage
                                                            ? `${conversation.lastMessage.author?.firstName}: ${conversation.lastMessage.content || t('messages.status.noMessage')}`
                                                            : conversation.lastMessage?.content ||
                                                              t('messages.status.noMessage')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'contacts' && (
                    <div className="space-y-1">
                        {isContactsLoading ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                                <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-tertiary border-t-transparent"></div>
                                Chargement des contacts...
                            </div>
                        ) : contactsError ? (
                            <div className="p-4 text-center text-sm text-red-500">
                                Erreur lors du chargement des contacts
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                                {searchQuery || selectedUserType !== 'ALL'
                                    ? t('messages.noContactsFound')
                                    : t('messages.noContacts')}
                            </div>
                        ) : (
                            filteredContacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="relative flex cursor-pointer items-center gap-3 rounded-lg py-3 pl-6 pr-10 transition-colors hover:bg-gray-50"
                                    onClick={() => handleSelectContact(contact.id)}
                                >
                                    <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-tertiary text-white">
                                        <p>{getInitials(contact.firstName, contact.lastName)}</p>
                                        {/* Absolute positioned presence indicator */}
                                        <UserPresenceIndicator
                                            userId={contact.id}
                                            size="sm"
                                            className="absolute -bottom-0.5 -right-0.5 border-2 border-white"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {contact.firstName} {contact.lastName}
                                                </h3>
                                                <UserPresenceIndicator
                                                    userId={contact.id}
                                                    showText={true}
                                                    size="sm"
                                                />
                                            </div>
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                                {contact.email.split('@')[0]}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-600">
                                            {contact.email}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal de nouveau message direct */}
            {showNewMessageModal && (
                <Modal
                    isOpen={showNewMessageModal}
                    onClose={() => setShowNewMessageModal(false)}
                    title={t('messages.modal.newMessageTitle')}
                >
                    <div className="space-y-4 py-2">
                        <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-700">
                                {t('messages.modal.selectContact')}
                            </h3>
                            <div className="mb-2">
                                <SearchBar
                                    placeholder={t('messages.modal.searchContact')}
                                    onSearch={handleDirectMessageSearch}
                                />
                            </div>

                            <div className="max-h-80 overflow-y-auto rounded border border-gray-200">
                                {filteredContactsForDirectMessage.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="flex cursor-pointer items-center justify-between border-b border-gray-100 px-4 py-2 last:border-b-0 hover:bg-gray-50"
                                        onClick={() => {
                                            handleSelectContact(contact.id);
                                            setShowNewMessageModal(false);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-tertiary text-white">
                                                {getInitials(contact.firstName, contact.lastName)}
                                                <UserPresenceIndicator
                                                    userId={contact.id}
                                                    size="sm"
                                                    className="absolute -bottom-0.5 -right-0.5 border border-white"
                                                />
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal de création de groupe */}
            {showCreateGroupModal && (
                <Modal
                    isOpen={showCreateGroupModal}
                    onClose={() => setShowCreateGroupModal(false)}
                    title={t('messages.group.createTitle')}
                >
                    <div className="space-y-4 py-2">
                        <Input
                            label={t('messages.group.nameLabel')}
                            name="groupName"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder={t('messages.group.namePlaceholder')}
                            required
                        />

                        <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-700">
                                {t('messages.group.addMembers')}
                            </h3>
                            <div className="mb-2">
                                <SearchBar
                                    placeholder={t('messages.group.searchMembers')}
                                    onSearch={handleGroupSearch}
                                />
                            </div>

                            {selectedContacts.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {selectedContacts.map((contactId) => {
                                        const contact = contacts.find((c) => c.id === contactId);
                                        if (!contact) return null;

                                        return (
                                            <div
                                                key={contactId}
                                                className="flex items-center gap-1 rounded-full bg-tertiary/10 px-2 py-1 text-sm text-tertiary"
                                            >
                                                <span>
                                                    {contact.firstName} {contact.lastName}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="ml-1 rounded-full p-0.5 hover:bg-tertiary/20"
                                                    onClick={() =>
                                                        toggleContactSelection(contactId)
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
                            {filteredContactsForGroup.map((contact) => (
                                <div
                                    key={contact.id}
                                    className={`flex items-center justify-between border-b border-gray-100 px-4 py-2 last:border-b-0 ${
                                        selectedContacts.includes(contact.id)
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
                                            selectedContacts.includes(contact.id)
                                                ? 'primary'
                                                : 'outline'
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleContactSelection(contact.id);
                                        }}
                                        className="px-2 py-1 text-sm"
                                    >
                                        {selectedContacts.includes(contact.id) ? (
                                            <span className="flex items-center gap-1">
                                                <Users size={16} />
                                                {t('messages.actions.added')}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <UserPlus size={16} />
                                                {t('messages.actions.add')}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCreateGroupModal(false)}>
                            {t('messages.actions.cancel')}
                        </Button>
                        <Button
                            onClick={handleCreateGroup}
                            disabled={
                                !groupName.trim() ||
                                selectedContacts.length === 0 ||
                                createConversationMutation.isPending
                            }
                        >
                            {createConversationMutation.isPending ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Création...
                                </>
                            ) : (
                                <>
                                    <PlusCircle size={16} className="mr-2" />
                                    {t('messages.actions.createGroup')}
                                </>
                            )}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
