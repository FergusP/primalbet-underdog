/**
 * Backend WebSocket Service
 * Manages WebSocket connection to backend for pot updates and arena events
 */

type BackendEventHandler = (data: any) => void;

class BackendWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private eventHandlers: Map<string, BackendEventHandler[]> = new Map();
  private isConnecting: boolean = false;

  /**
   * Connect to backend WebSocket
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return; // Already connected or connecting
    }

    this.isConnecting = true;

    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http://', 'ws://').replace('https://', 'wss://').replace('/api', '') || 'ws://localhost:3001';

    console.log('[BackendWS] Connecting to:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[BackendWS] Connected to backend');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[BackendWS] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[BackendWS] Connection error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('[BackendWS] Connection closed');
        this.isConnecting = false;
        this.ws = null;

        // Attempt reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`[BackendWS] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

          setTimeout(() => {
            this.connect();
          }, this.reconnectDelay);
        } else {
          console.error('[BackendWS] Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('[BackendWS] Failed to create WebSocket:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: any): void {
    const { type, playerWallet, data, currentPot } = message;

    console.log('[BackendWS] Received:', type, message);

    // Handle pot updates (legacy)
    if (type === 'pot-update') {
      this.emit('pot-update', { currentPot });
      return;
    }

    // Handle arena events
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler({ playerWallet, ...data }));
    }
  }

  /**
   * Subscribe to event
   */
  on(eventType: string, handler: BackendEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Unsubscribe from event
   */
  off(eventType: string, handler: BackendEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to subscribers
   */
  private emit(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const backendWebSocket = new BackendWebSocketService();
