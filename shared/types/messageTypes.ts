import { MessageDto } from '../dto/messageDto';
import { MessageReadData } from './conversationTypes';
import { WebSocketEventType } from './websocketTypes';

// Message-related WebSocket event interfaces
export interface BaseWSInterface<T = any> {
    data: T;
    timestamp: string;
    conversationId?: string;
}

export interface NewMessageEvent extends BaseWSInterface<MessageDto> {
    type: WebSocketEventType.NEW_MESSAGE;
}

export interface MessageReadEvent extends BaseWSInterface<MessageReadData> {
    type: WebSocketEventType.MESSAGE_READ;
} 