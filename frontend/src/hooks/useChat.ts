import { chatService } from '@/api/chatService';
import { useAuthStore } from '@/stores/authStore';
import { ClientWebSocketMessage, ServerWebSocketMessage, WebSocketEventType } from '@shared/types/websocketTypes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWebSocket } from './useWebSocket';

interface UseChatOptions {
    conversationId?: string;
    onNewMessage?: (message: ServerWebSocketMessage) => void;
    onTyping?: (message: ServerWebSocketMessage) => void;
    onStopTyping?: (message: ServerWebSocketMessage) => void;
    onUserJoined?: (message: ServerWebSocketMessage) => void;
    onUserLeft?: (message: ServerWebSocketMessage) => void;
    autoJoin?: boolean;
}

export const useChat = (options: UseChatOptions = {}) => {
    const {
        conversationId,
        onNewMessage,
        onTyping,
        onStopTyping,
        onUserJoined,
        onUserLeft,
        autoJoin = true
    } = options;

    const { user } = useAuthStore();
    const joinedConversationsRef = useRef<Set<string>>(new Set());
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [conversationParticipants, setConversationParticipants] = useState<Map<string, string[]>>(new Map());

    // Fetch conversation details to validate participants
    const validateConversationAccess = useCallback(async (conversationId: string) => {
        if (!user?.id || !conversationId) return false;

        try {
            // Check if we already have the participant list cached
            if (conversationParticipants.has(conversationId)) {
                const participants = conversationParticipants.get(conversationId) || [];
                return participants.includes(user.id);
            }

            // Otherwise fetch the conversation details
            const response = await chatService.getChatById(conversationId);
            if (response.data) {
                const participants = response.data.users.map(u => u.id);

                // Cache the participants list
                setConversationParticipants(prev => {
                    const newMap = new Map(prev);
                    newMap.set(conversationId, participants);
                    return newMap;
                });

                return participants.includes(user.id);
            }
            return false;
        } catch (error) {
            console.error(`Error validating conversation access for ${conversationId}:`, error);
            return false;
        }
    }, [user?.id, conversationParticipants]);

    const handleMessage = useCallback(async (message: ServerWebSocketMessage) => {
        // Only process messages for conversations we're interested in
        if (message.conversationId && message.conversationId !== conversationId) {
            return;
        }

        // Validate that the user is a participant in this conversation
        if (message.conversationId) {
            const isParticipant = await validateConversationAccess(message.conversationId);
            if (!isParticipant) {
                console.warn(`Ignoring message for conversation ${message.conversationId} - user is not a participant`);
                return;
            }
        }

        switch (message.type) {
            case WebSocketEventType.NEW_MESSAGE:
                onNewMessage?.(message);
                break;
            case WebSocketEventType.USER_TYPING:
                onTyping?.(message);
                break;
            case WebSocketEventType.USER_STOPPED_TYPING:
                onStopTyping?.(message);
                break;
            case WebSocketEventType.USER_JOINED:
                onUserJoined?.(message);
                break;
            case WebSocketEventType.USER_LEFT:
                onUserLeft?.(message);
                break;
            default:
                break;
        }
    }, [conversationId, onNewMessage, onTyping, onStopTyping, onUserJoined, onUserLeft, validateConversationAccess]);

    const { connect, disconnect, sendMessage, isConnected } = useWebSocket({
        onMessage: handleMessage,
        onConnect: () => {
            // Re-join previously joined conversations on reconnect
            joinedConversationsRef.current.forEach(id => {
                joinConversation(id);
            });
        }
    });

    const joinConversation = useCallback(async (conversationId: string) => {
        if (!conversationId) return;

        // Validate that the user is a participant before joining
        const isParticipant = await validateConversationAccess(conversationId);
        if (!isParticipant) {
            console.warn(`Cannot join conversation ${conversationId} - user is not a participant`);
            return;
        }

        joinedConversationsRef.current.add(conversationId);

        if (isConnected) {
            const message: ClientWebSocketMessage = {
                type: WebSocketEventType.JOIN_CONVERSATION,
                conversationId,
                timestamp: new Date().toISOString()
            };
            sendMessage(message);
            console.log(`Joined conversation ${conversationId}`);
        }
    }, [isConnected, sendMessage, validateConversationAccess]);

    const leaveConversation = useCallback((conversationId: string) => {
        if (!conversationId) return;

        joinedConversationsRef.current.delete(conversationId);

        if (isConnected) {
            const message: ClientWebSocketMessage = {
                type: WebSocketEventType.LEAVE_CONVERSATION,
                conversationId,
                timestamp: new Date().toISOString()
            };
            sendMessage(message);
            console.log(`Left conversation ${conversationId}`);
        }
    }, [isConnected, sendMessage]);

    const sendTyping = useCallback((conversationId: string) => {
        if (!conversationId || !isConnected) return;

        const message: ClientWebSocketMessage = {
            type: WebSocketEventType.TYPING,
            conversationId,
            timestamp: new Date().toISOString()
        };
        sendMessage(message);

        // Auto stop typing after 3 seconds
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            sendStopTyping(conversationId);
        }, 3000);
    }, [isConnected, sendMessage]);

    const sendStopTyping = useCallback((conversationId: string) => {
        if (!conversationId || !isConnected) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        const message: ClientWebSocketMessage = {
            type: WebSocketEventType.STOP_TYPING,
            conversationId,
            timestamp: new Date().toISOString()
        };
        sendMessage(message);
    }, [isConnected, sendMessage]);

    // Auto-join conversation if specified
    useEffect(() => {
        if (autoJoin && conversationId && isConnected) {
            joinConversation(conversationId);
        }

        return () => {
            if (conversationId) {
                leaveConversation(conversationId);
            }
        };
    }, [autoJoin, conversationId, isConnected, joinConversation, leaveConversation]);

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return {
        connect,
        disconnect,
        joinConversation,
        leaveConversation,
        sendTyping,
        sendStopTyping,
        isConnected
    };
}; 