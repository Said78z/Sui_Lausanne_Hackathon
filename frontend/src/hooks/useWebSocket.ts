import { websocketService } from '@/api/websocket/websocketService';
import { useAuthStore } from '@/stores/authStore';
import { ClientWebSocketMessage, ServerWebSocketMessage } from '@shared/types/websocketTypes';
import { useCallback, useEffect, useRef } from 'react';

interface UseWebSocketOptions {
    onMessage?: (message: ServerWebSocketMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
    autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
    const { onMessage, onConnect, onDisconnect, onError, autoConnect = true } = options;
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const isConnectedRef = useRef(false);
    const { accessToken } = useAuthStore();
    const connectionCheckerRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!accessToken) {
            console.warn('No access token available for WebSocket connection');
            return;
        }

        // Use hardcoded URL for now to ensure it works
        // The relative URL approach might be causing issues
        const wsUrl = `ws://localhost:3000/ws/chat?token=${accessToken}`;

        console.log(`Connecting to WebSocket at ${wsUrl}`);

        websocketService.connect(wsUrl)
            .then(() => {
                isConnectedRef.current = true;
                onConnect?.();

                // Subscribe to messages
                if (onMessage) {
                    unsubscribeRef.current = websocketService.onMessage(onMessage);
                }
            })
            .catch((error) => {
                console.error('WebSocket connection failed:', error);
                onError?.(error);
            });
    }, [accessToken, onMessage, onConnect, onError]);

    const disconnect = useCallback(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }

        if (connectionCheckerRef.current) {
            clearInterval(connectionCheckerRef.current);
            connectionCheckerRef.current = null;
        }

        websocketService.disconnect();
        isConnectedRef.current = false;
        onDisconnect?.();
    }, [onDisconnect]);

    const sendMessage = useCallback((message: ClientWebSocketMessage) => {
        websocketService.sendMessage(message);
    }, []);

    const isConnected = websocketService.isConnected;

    // Setup periodic connection checker
    useEffect(() => {
        if (autoConnect && accessToken) {
            // Start a periodic check to ensure connection is alive
            connectionCheckerRef.current = setInterval(() => {
                if (!websocketService.isConnected) {
                    console.log('WebSocket connection check: reconnecting...');
                    connect();
                }
            }, 30000); // Check every 30 seconds instead of 10

            return () => {
                if (connectionCheckerRef.current) {
                    clearInterval(connectionCheckerRef.current);
                    connectionCheckerRef.current = null;
                }
            };
        }
    }, [autoConnect, accessToken, connect]);

    // Initial connection
    useEffect(() => {
        if (autoConnect && accessToken) {
            connect();
        }

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }

            if (connectionCheckerRef.current) {
                clearInterval(connectionCheckerRef.current);
            }
        };
    }, [autoConnect, accessToken, connect]);

    return {
        connect,
        disconnect,
        sendMessage,
        isConnected
    };
}; 