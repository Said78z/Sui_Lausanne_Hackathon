
import { ClientWebSocketMessage, ServerWebSocketMessage, WebSocketEventType } from '@shared/types/websocketTypes';

type MessageHandler = (message: ServerWebSocketMessage) => void;

class WebSocketService {
    private static instance: WebSocketService | null = null;
    private socket: WebSocket | null = null;
    private messageHandlers: MessageHandler[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 20; // Increased from 10 to 20
    private reconnectDelay = 2000; // Reduced from 5000 to 2000 ms
    private isConnecting = false;
    private url: string = '';
    private messageQueue: ClientWebSocketMessage[] = []; // Queue for messages when socket is not connected
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private heartbeatTimeout = 60000; // Increased from 30000 to 60000 ms (1 minute)

    private constructor() { }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    public connect(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            if (this.isConnecting) {
                reject(new Error('Connection already in progress'));
                return;
            }

            this.isConnecting = true;
            this.url = url;
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log('WebSocket Connected');
                this.isConnecting = false;
                this.reconnectAttempts = 0;

                // Send any queued messages
                this.flushMessageQueue();

                // Start heartbeat to keep connection alive
                this.startHeartbeat();

                resolve();
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(event);
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket Disconnected', event.code, event.reason);
                this.isConnecting = false;
                this.socket = null;

                // Stop heartbeat
                this.stopHeartbeat();

                // Auto-reconnect if not a manual close
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.warn(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket Error:', error);
                this.isConnecting = false;
                reject(error);
            };
        });
    }

    public disconnect(): void {
        this.stopHeartbeat();

        if (this.socket) {
            this.socket.close(1000, 'Manual disconnect');
            this.socket = null;
        }
        this.messageHandlers = [];
        this.messageQueue = []; // Clear message queue on manual disconnect
        this.reconnectAttempts = 0; // Reset reconnect attempts on manual disconnect
    }

    public sendMessage(message: ClientWebSocketMessage): void {
        // First check connection and try to reconnect if needed
        this.checkConnectionAndReconnect();

        if (this.socket?.readyState === WebSocket.OPEN) {
            try {
                this.socket.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                // Queue message for retry
                this.messageQueue.push(message);
            }
        } else {
            console.warn('WebSocket not connected, queueing message for later');
            this.messageQueue.push(message);

            // Try to connect if not already connecting
            if (!this.isConnecting && this.url && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.connect(this.url).catch(error => {
                    console.error('Failed to reconnect:', error);
                });
            }
        }
    }

    // Check connection status and reconnect if needed
    public checkConnectionAndReconnect(): void {
        if (this.socket?.readyState !== WebSocket.OPEN && !this.isConnecting && this.url) {
            console.log('WebSocket not connected, attempting to reconnect...');
            this.connect(this.url).catch(error => {
                console.error('Failed to reconnect:', error);
            });
        }
    }

    // Getter for connection status
    public get isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    // Start heartbeat to keep connection alive
    private startHeartbeat(): void {
        this.stopHeartbeat(); // Clear any existing interval

        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                // Send a ping message to keep the connection alive
                this.socket.send(JSON.stringify({
                    type: WebSocketEventType.PING,
                    timestamp: new Date().toISOString()
                }));
            } else {
                // If socket is closed, try to reconnect
                this.checkConnectionAndReconnect();
            }
        }, this.heartbeatTimeout);
    }

    // Stop heartbeat
    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private flushMessageQueue(): void {
        if (this.socket?.readyState !== WebSocket.OPEN || this.messageQueue.length === 0) {
            return;
        }

        console.log(`Sending ${this.messageQueue.length} queued messages`);

        // Create a copy of the queue and clear it before sending
        const queueCopy = [...this.messageQueue];
        this.messageQueue = [];

        queueCopy.forEach(message => {
            try {
                if (this.socket?.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify(message));
                } else {
                    // Put back in queue if socket closed during sending
                    this.messageQueue.push(message);
                }
            } catch (error) {
                console.error('Error sending queued message:', error);
                this.messageQueue.push(message);
            }
        });
    }

    public onMessage(callback: MessageHandler): () => void {
        this.messageHandlers.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.messageHandlers.indexOf(callback);
            if (index > -1) {
                this.messageHandlers.splice(index, 1);
            }
        };
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const message: ServerWebSocketMessage = JSON.parse(event.data);

            // Validate message structure
            if (!message.type || !message.timestamp) {
                console.warn('Invalid WebSocket message structure:', message);
                return;
            }

            // Handle PONG responses (heartbeat)
            if (message.type === WebSocketEventType.PONG) {
                // Heartbeat received, connection is alive
                console.debug('Heartbeat received from server');
                return;
            }

            // Log important messages for debugging
            if (message.type !== WebSocketEventType.USER_TYPING &&
                message.type !== WebSocketEventType.USER_STOPPED_TYPING) {
                console.log('Received WebSocket message:', message.type, message);
            }

            this.messageHandlers.forEach(handler => {
                try {
                    handler(message);
                } catch (error) {
                    console.error('WebSocket handler failed:', error, 'Message:', message);
                }
            });
        } catch (error) {
            console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data);
        }
    }

    private scheduleReconnect(): void {
        this.reconnectAttempts++;
        // Use exponential backoff with a cap
        const delay = Math.min(
            this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
            30000 // Maximum 30 seconds between retries
        );

        console.log(`Attempting to reconnect in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect(this.url).catch(error => {
                console.error('Reconnection failed:', error);
            });
        }, delay);
    }
}

export const websocketService = WebSocketService.getInstance(); 