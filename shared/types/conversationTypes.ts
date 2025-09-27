import { WebSocketEventType } from './websocketTypes';

// WebSocket-specific data interfaces
export interface MessageReadData {
    messageIds: string[];
    userId: string;
    conversationId: string;
    readAt: string;
}

export interface TypingData {
    userId: string;
    conversationId: string;
    firstName?: string;
    lastName?: string;
}

export interface UserPresenceData {
    userId: string;
    status: 'online' | 'offline';
    lastSeen?: string;
}

export interface ConversationJoinData {
    userId: string;
    conversationId: string;
    firstName?: string;
    lastName?: string;
}

export interface ErrorData {
    message: string;
    code?: string;
    details?: any;
}

// Base WebSocket interface
export interface BaseWSInterface<T = any> {
    data: T;
    timestamp: string;
    conversationId?: string;
}

// Conversation-related WebSocket event interfaces
export interface UserTypingEvent extends BaseWSInterface<TypingData> {
    type: WebSocketEventType.USER_TYPING;
}

export interface UserStoppedTypingEvent extends BaseWSInterface<TypingData> {
    type: WebSocketEventType.USER_STOPPED_TYPING;
}

export interface UserPresenceEvent extends BaseWSInterface<UserPresenceData> {
    type: WebSocketEventType.USER_ONLINE | WebSocketEventType.USER_OFFLINE;
}

export interface ConversationJoinEvent extends BaseWSInterface<ConversationJoinData> {
    type: WebSocketEventType.USER_JOINED | WebSocketEventType.USER_LEFT;
}

export interface ErrorEvent extends BaseWSInterface<ErrorData> {
    type: WebSocketEventType.ERROR | WebSocketEventType.AUTH_ERROR;
}

export interface ConnectEvent extends BaseWSInterface<{ userId: string; message: string }> {
    type: WebSocketEventType.CONNECT;
} 