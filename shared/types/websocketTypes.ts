// WebSocket Event Types
export enum WebSocketEventType {
    // Connection events
    CONNECT = 'CONNECT',
    DISCONNECT = 'DISCONNECT',
    ERROR = 'ERROR',
    AUTH_ERROR = 'AUTH_ERROR',

    // Heartbeat events
    PING = 'PING',
    PONG = 'PONG',

    // Conversation events
    JOIN_CONVERSATION = 'JOIN_CONVERSATION',
    LEAVE_CONVERSATION = 'LEAVE_CONVERSATION',

    // Message events
    NEW_MESSAGE = 'NEW_MESSAGE',
    MESSAGE_READ = 'MESSAGE_READ',
    MESSAGE_DELETED = 'MESSAGE_DELETED',

    // Typing events
    USER_TYPING = 'USER_TYPING',
    USER_STOPPED_TYPING = 'USER_STOPPED_TYPING',
    TYPING = 'TYPING',
    STOP_TYPING = 'STOP_TYPING',

    // User presence events
    USER_ONLINE = 'USER_ONLINE',
    USER_OFFLINE = 'USER_OFFLINE',
    USER_JOINED = 'USER_JOINED',
    USER_LEFT = 'USER_LEFT',
}

// Import WebSocket event interfaces from appropriate shared type files
import { MessageDto } from '../dto/messageDto';
import {
    ConnectEvent,
    ConversationJoinData,
    ConversationJoinEvent,
    ErrorData,
    ErrorEvent,
    MessageReadData,
    TypingData,
    UserPresenceData,
    UserPresenceEvent,
    UserStoppedTypingEvent,
    UserTypingEvent
} from './conversationTypes';
import { MessageReadEvent, NewMessageEvent } from './messageTypes';

// Base WebSocket message interface
export interface BaseWebSocketMessage {
    type: WebSocketEventType;
    timestamp: string;
    conversationId?: string;
}

// Union type for all possible client message data
export type ClientWebSocketData =
    | TypingData
    | ConversationJoinData
    | Record<string, never>; // For messages without data

// Union type for all possible server message data  
export type ServerWebSocketData =
    | MessageDto
    | MessageReadData
    | TypingData
    | UserPresenceData
    | ConversationJoinData
    | ErrorData
    | { userId: string; message: string }; // For connect events

// Client to Server messages
export interface ClientWebSocketMessage extends BaseWebSocketMessage {
    type:
    | WebSocketEventType.JOIN_CONVERSATION
    | WebSocketEventType.LEAVE_CONVERSATION
    | WebSocketEventType.TYPING
    | WebSocketEventType.STOP_TYPING
    | WebSocketEventType.PING;
    data?: ClientWebSocketData;
}

// Server to Client messages
export interface ServerWebSocketMessage extends BaseWebSocketMessage {
    type:
    | WebSocketEventType.CONNECT
    | WebSocketEventType.NEW_MESSAGE
    | WebSocketEventType.MESSAGE_READ
    | WebSocketEventType.USER_TYPING
    | WebSocketEventType.USER_STOPPED_TYPING
    | WebSocketEventType.USER_ONLINE
    | WebSocketEventType.USER_OFFLINE
    | WebSocketEventType.USER_JOINED
    | WebSocketEventType.USER_LEFT
    | WebSocketEventType.ERROR
    | WebSocketEventType.AUTH_ERROR
    | WebSocketEventType.PONG;
    data: ServerWebSocketData;
}

// Generic WebSocket message (union of client and server)
export interface WebSocketMessage extends BaseWebSocketMessage {
    type: WebSocketEventType;
    data?: ClientWebSocketData | ServerWebSocketData;
}

// Union type for all possible WebSocket events (imported from appropriate type files)
export type WebSocketEvent =
    | NewMessageEvent
    | MessageReadEvent
    | UserTypingEvent
    | UserStoppedTypingEvent
    | UserPresenceEvent
    | ConversationJoinEvent
    | ErrorEvent
    | ConnectEvent;

// WebSocket connection states
export enum WebSocketConnectionState {
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    RECONNECTING = 'RECONNECTING',
    ERROR = 'ERROR',
}

// WebSocket connection info
export interface WebSocketConnectionInfo {
    state: WebSocketConnectionState;
    reconnectAttempts: number;
    lastError?: string;
    connectedAt?: string;
    userId?: string;
} 