import { ChatParticipant } from '@/config/client';
import { userRepository } from '@/repositories/userRepository';
import { userTransform } from '@/transform/userTransform';
import { logger } from '@/utils/logger';
import { RestrictedUserDto } from '@shared/dto';
import { ClientWebSocketMessage, ServerWebSocketMessage, WebSocketEventType } from '@shared/types/websocketTypes';
import { IncomingMessage, Server } from 'http';
import * as jwt from 'jsonwebtoken';
import { WebSocket, WebSocketServer } from 'ws';

interface ConnectedUser {
    user: RestrictedUserDto;
    connections: WebSocket[];
}

class ChatWebSocketManager {
    private static instance: ChatWebSocketManager | null = null;
    private wss: WebSocketServer | null = null;
    private connectedUsers: Map<string, ConnectedUser>;
    private logger = logger.child({ module: '[WEBSOCKET][CHAT]' });

    private constructor() {
        this.connectedUsers = new Map();
    }

    public static getInstance(): ChatWebSocketManager {
        if (!ChatWebSocketManager.instance) {
            ChatWebSocketManager.instance = new ChatWebSocketManager();
        }
        return ChatWebSocketManager.instance;
    }

    public initialize(server: Server): void {
        if (this.wss) return;

        this.wss = new WebSocketServer({
            server,
            path: '/ws/chat'
        });
        this.init();
        this.logger.info('WebSocket Chat Manager initialized');
    }

    private init(): void {
        if (!this.wss) return;

        this.wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
            try {
                const token = this.extractToken(req);
                const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

                // Désérialiser les rôles si ils sont stockés en tant que JSON string
                if (decoded.roles) {
                    if (typeof decoded.roles === 'string') {
                        try {
                            decoded.roles = JSON.parse(decoded.roles);
                        } catch (error) {
                            console.error('Error parsing roles in WebSocket:', error);
                            decoded.roles = [];
                        }
                    }
                } else {
                    decoded.roles = [];
                }

                const user = await userRepository.findById(decoded.id);

                if (!user) {
                    throw new Error('Utilisateur non trouvé');
                }

                const restrictedUserDto = userTransform.toRestrictedUserDto(user);
                this.addUserConnection(restrictedUserDto, ws);

                // Handle incoming messages
                ws.on('message', (data: Buffer) => {
                    this.handleMessage(restrictedUserDto.id, data);
                });

                ws.on('close', () => {
                    this.removeUserConnection(restrictedUserDto.id, ws);
                });

                ws.on('error', (error: Error) => {
                    this.logger.error(`WebSocket error for user ${restrictedUserDto.id}: ${error.message}`);
                    ws.close();
                });

            } catch (error: any) {
                this.logger.error(`WebSocket connection error: ${error.message}`);
                ws.close();
            }
        });
    }

    private addUserConnection(user: RestrictedUserDto, ws: WebSocket): void {
        const wasOffline = !this.connectedUsers.has(user.id);

        if (!this.connectedUsers.has(user.id)) {
            this.connectedUsers.set(user.id, {
                user,
                connections: [ws]
            });
            this.logger.info(`User ${user.id} connected to WebSocket`);
        } else {
            const existingUser = this.connectedUsers.get(user.id);
            if (existingUser) {
                existingUser.connections.push(ws);
                this.logger.info(`User ${user.id} added additional WebSocket connection`);
            }
        }

        // Broadcast user online status if this is their first connection
        if (wasOffline) {
            this.broadcastUserPresence(user.id, 'online');
        }
    }

    private removeUserConnection(userId: string, ws: WebSocket): void {
        const user = this.connectedUsers.get(userId);
        if (user) {
            user.connections = user.connections.filter(conn => conn !== ws);
            if (user.connections.length === 0) {
                this.connectedUsers.delete(userId);
                this.logger.info(`User ${userId} disconnected from WebSocket`);

                // Broadcast user offline status
                this.broadcastUserPresence(userId, 'offline');
            } else {
                this.logger.info(`User ${userId} closed one WebSocket connection, ${user.connections.length} remaining`);
            }
        }
    }

    private handleMessage(userId: string, data: Buffer): void {
        try {
            const message: ClientWebSocketMessage = JSON.parse(data.toString());

            switch (message.type) {
                case WebSocketEventType.PING:
                    // Respond to ping with a pong to keep the connection alive
                    this.sendPongToUser(userId);
                    break;
                case WebSocketEventType.JOIN_CONVERSATION:
                    // We no longer need to track conversation membership since we'll check
                    // participants directly from the database when sending messages
                    this.logger.info(`User ${userId} requested to join conversation ${message.conversationId}`);
                    break;
                case WebSocketEventType.LEAVE_CONVERSATION:
                    this.logger.info(`User ${userId} left conversation ${message.conversationId}`);
                    break;
                case WebSocketEventType.TYPING:
                    this.handleTypingEvent(userId, message.conversationId!, true);
                    break;
                case WebSocketEventType.STOP_TYPING:
                    this.handleTypingEvent(userId, message.conversationId!, false);
                    break;
                default:
                    this.logger.warn(`Received unknown WebSocket message type: ${message.type}`);
            }
        } catch (error: any) {
            this.logger.error(`Error handling WebSocket message: ${error.message}`);
        }
    }

    // Send a pong response to a specific user
    private sendPongToUser(userId: string): void {
        const user = this.connectedUsers.get(userId);
        if (!user) return;

        const pongMessage = {
            type: WebSocketEventType.PONG,
            timestamp: new Date().toISOString()
        };

        const messageString = JSON.stringify(pongMessage);

        user.connections.forEach(connection => {
            if (connection.readyState === WebSocket.OPEN) {
                connection.send(messageString);
            }
        });
    }

    private async handleTypingEvent(userId: string, conversationId: string, isTyping: boolean): Promise<void> {
        try {
            // Import here to avoid circular dependency
            const { chatRepository } = require('@/repositories/chatRepository');

            // Check if user is a participant in the conversation
            const conversation = await chatRepository.findConversationById(conversationId);
            const isParticipant = conversation.participants.some((p: ChatParticipant) => p.userId === userId);

            if (!isParticipant) {
                this.logger.warn(`User ${userId} attempted to send typing status for conversation ${conversationId} but is not a participant`);
                return;
            }

            // Get list of participant IDs
            const participantIds = conversation.participants.map((p: ChatParticipant) => p.userId);

            // Create the message
            const message: ServerWebSocketMessage = {
                type: isTyping ? WebSocketEventType.USER_TYPING : WebSocketEventType.USER_STOPPED_TYPING,
                data: { userId, conversationId },
                conversationId,
                timestamp: new Date().toISOString()
            };

            // Send typing indicator to all other participants
            const recipientIds = participantIds.filter((id: string) => id !== userId);
            this.sendMessageToSpecificUsers(recipientIds, message);
            this.logger.debug(`Sent typing status from ${userId} to ${recipientIds.length} users in conversation ${conversationId}`);
        } catch (error: any) {
            this.logger.error(`Error handling typing event: ${error.message}`);
        }
    }

    public async broadcastNewMessage(conversationId: string, messageData: any): Promise<void> {
        try {
            // Import here to avoid circular dependency
            const { chatRepository } = require('@/repositories/chatRepository');

            // Get the conversation to check participants
            const conversation = await chatRepository.findConversationById(conversationId);

            // Get list of participant IDs
            const participantIds = conversation.participants.map((p: ChatParticipant) => p.userId);

            // Create the message
            const message: ServerWebSocketMessage = {
                type: WebSocketEventType.NEW_MESSAGE,
                data: messageData,
                conversationId,
                timestamp: new Date().toISOString()
            };

            // Send message only to actual participants
            this.sendMessageToSpecificUsers(participantIds, message);
            this.logger.info(`Broadcasted message to ${participantIds.length} participants in conversation ${conversationId}`);
        } catch (error: any) {
            this.logger.error(`Error broadcasting message: ${error.message}`);
        }
    }

    // Simplified method to send messages only to specific users
    private sendMessageToSpecificUsers(userIds: string[], message: ServerWebSocketMessage): void {
        if (!userIds || userIds.length === 0) {
            this.logger.warn(`Attempted to send message to empty user list: ${message.type}`);
            return;
        }

        const messageString = JSON.stringify(message);
        const sentTo: string[] = [];

        userIds.forEach(userId => {
            const user = this.connectedUsers.get(userId);
            if (user) {
                user.connections.forEach(connection => {
                    if (connection.readyState === WebSocket.OPEN) {
                        connection.send(messageString);
                        sentTo.push(userId);
                    }
                });
            }
        });

        // Log detailed information about message delivery
        this.logger.debug(`Message ${message.type} for conversation ${message.conversationId} sent to users: ${sentTo.join(', ')}`);

        // Log users who didn't receive the message because they're offline
        const offlineUsers = userIds.filter((id: string) => !sentTo.includes(id));
        if (offlineUsers.length > 0) {
            this.logger.debug(`Message not delivered to offline users: ${offlineUsers.join(', ')}`);
        }
    }

    public async broadcastMessageRead(conversationId: string, messageIds: string[], readByUserId: string): Promise<void> {
        try {
            // Import here to avoid circular dependency
            const { chatRepository } = require('@/repositories/chatRepository');

            // Get the conversation to check participants
            const conversation = await chatRepository.findConversationById(conversationId);

            if (!conversation) {
                this.logger.warn(`Cannot broadcast message read status: Conversation ${conversationId} not found`);
                return;
            }

            // Get list of participant IDs
            const participantIds = conversation.participants.map((p: ChatParticipant) => p.userId);

            if (!participantIds.includes(readByUserId)) {
                this.logger.warn(`User ${readByUserId} is not a participant in conversation ${conversationId} but tried to mark messages as read`);
                return;
            }

            // Create the message
            const message: ServerWebSocketMessage = {
                type: WebSocketEventType.MESSAGE_READ,
                data: {
                    messageIds,
                    userId: readByUserId,
                    conversationId,
                    readAt: new Date().toISOString()
                },
                conversationId,
                timestamp: new Date().toISOString()
            };

            // Send read status to ALL participants (including the user who marked as read)
            // This ensures all clients are in sync with the read status
            this.sendMessageToSpecificUsers(participantIds, message);
            this.logger.info(`Sent message read status from ${readByUserId} to ${participantIds.length} users in conversation ${conversationId}`);
        } catch (error: any) {
            this.logger.error(`Error broadcasting message read status: ${error.message}`);
            // Don't rethrow - we don't want to break the API response because of WebSocket issues
        }
    }

    public notifyUser(userId: string, message: ServerWebSocketMessage): void {
        this.sendMessageToSpecificUsers([userId], message);
    }

    public getConnectedUsers(): string[] {
        return Array.from(this.connectedUsers.keys());
    }

    public isUserConnected(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }

    private extractToken(req: IncomingMessage): string {
        if (!req.url) {
            throw new Error('URL manquante dans la requête');
        }
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        if (!token) {
            throw new Error('Token manquant');
        }
        return token;
    }

    private broadcastUserPresence(userId: string, status: 'online' | 'offline'): void {
        // Create presence message
        const presenceMessage: ServerWebSocketMessage = {
            type: status === 'online' ? WebSocketEventType.USER_ONLINE : WebSocketEventType.USER_OFFLINE,
            data: {
                userId,
                status,
                lastSeen: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        };

        // Broadcast to all connected users except the user themselves
        const allUserIds = Array.from(this.connectedUsers.keys()).filter(id => id !== userId);
        this.sendMessageToSpecificUsers(allUserIds, presenceMessage);
        this.logger.info(`Broadcasted ${status} status for user ${userId} to ${allUserIds.length} connected users`);
    }
}

export const chatWebSocketManager = ChatWebSocketManager.getInstance(); 