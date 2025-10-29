/**
 * Arena Service (Backend)
 * Manages Arena Arcade Game sessions and WebSocket connections
 */

import io from 'socket.io-client';
import axios from 'axios';
import { ARENA_CONFIG, ARENA_API, ACTORS } from '../config/arena-config';

interface GameSession {
  gameId: string;
  websocketUrl: string;
  socket: any | null;
  playerWallet: string;
  userToken: string;
  expiresAt: string;
}

class ArenaService {
  private activeSessions: Map<string, GameSession> = new Map();

  /**
   * Initialize arena game for a player
   * Called when authenticated player enters combat
   */
  async initializePlayerArena(
    playerWallet: string,
    userToken: string,
    streamUrl: string = 'https://primalbet.vercel.app'
  ): Promise<{ success: boolean; gameId?: string; error?: string }> {
    try {
      console.log(`[Arena] Initializing arena for player: ${playerWallet}`);

      // Create game session via TheVorld API
      const response = await axios.post(
        `${ARENA_API.baseUrl}/games/init`,
        { streamUrl },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'X-Arena-Arcade-Game-ID': ARENA_CONFIG.arcadeGameId,
            'X-Vorld-App-ID': ARENA_CONFIG.vorldAppId,
            'Content-Type': 'application/json',
          },
        }
      );

      const gameData = response.data.data;
      console.log(`[Arena] Game created: ${gameData.gameId}`);

      // Store session
      const session: GameSession = {
        gameId: gameData.gameId,
        websocketUrl: gameData.websocketUrl,
        socket: null,
        playerWallet,
        userToken,
        expiresAt: gameData.expiresAt,
      };

      this.activeSessions.set(playerWallet, session);

      // Connect to WebSocket
      await this.connectWebSocket(playerWallet);

      return {
        success: true,
        gameId: gameData.gameId,
      };
    } catch (error: any) {
      console.error('[Arena] Failed to initialize:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to initialize arena',
      };
    }
  }

  /**
   * Connect to TheVorld WebSocket
   */
  private async connectWebSocket(playerWallet: string): Promise<boolean> {
    const session = this.activeSessions.get(playerWallet);
    if (!session) return false;

    try {
      console.log(`[Arena] Connecting to WebSocket for ${playerWallet}`);

      const socket = io(session.websocketUrl, {
        transports: ['websocket'],
        auth: {
          token: session.userToken,
          appId: ARENA_CONFIG.vorldAppId,
        },
      });

      session.socket = socket;

      // Setup event listeners
      this.setupEventListeners(socket, playerWallet);

      return new Promise((resolve) => {
        socket.on('connect', () => {
          console.log(`[Arena] WebSocket connected for ${playerWallet}`);
          resolve(true);
        });

        socket.on('connect_error', (error: any) => {
          console.error(`[Arena] WebSocket error for ${playerWallet}:`, error);
          resolve(false);
        });
      });
    } catch (error) {
      console.error(`[Arena] WebSocket connection failed:`, error);
      return false;
    }
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(socket: any, playerWallet: string): void {
    // Arena lifecycle events
    socket.on('arena_countdown_started', (data: any) => {
      console.log(`[Arena] Countdown started for ${playerWallet}:`, data);
      this.onArenaCountdownStarted?.(playerWallet, data);
    });

    socket.on('countdown_update', (data: any) => {
      console.log(`[Arena] Countdown update for ${playerWallet}: ${data.secondsRemaining}s`);
      this.onCountdownUpdate?.(playerWallet, data);
    });

    socket.on('arena_begins', (data: any) => {
      console.log(`[Arena] Arena begins for ${playerWallet}`);
      this.onArenaBegins?.(playerWallet, data);
    });

    // Viewer interaction events
    socket.on('immediate_item_drop', (data: any) => {
      console.log(`[Arena] Item dropped for ${playerWallet}:`, data);
      this.onImmediateItemDrop?.(playerWallet, data);
    });

    socket.on('player_boost_activated', (data: any) => {
      console.log(`[Arena] Player boosted for ${playerWallet}:`, data);
      this.onPlayerBoostActivated?.(playerWallet, data);
    });

    socket.on('package_drop', (data: any) => {
      console.log(`[Arena] Package drop for ${playerWallet}:`, data);
      this.onPackageDrop?.(playerWallet, data);
    });

    // Game completion
    socket.on('game_completed', (data: any) => {
      console.log(`[Arena] Game completed for ${playerWallet}`);
      this.onGameCompleted?.(playerWallet, data);
      this.cleanupSession(playerWallet);
    });

    socket.on('game_stopped', (data: any) => {
      console.log(`[Arena] Game stopped for ${playerWallet}`);
      this.onGameStopped?.(playerWallet, data);
      this.cleanupSession(playerWallet);
    });
  }

  /**
   * Emit custom event to TheVorld
   */
  async emitGameEvent(
    playerWallet: string,
    eventId: string,
    eventData?: any
  ): Promise<{ success: boolean; error?: string }> {
    const session = this.activeSessions.get(playerWallet);
    if (!session) {
      return { success: false, error: 'No active session' };
    }

    try {
      // Emit event via socket (if connected)
      if (session.socket?.connected) {
        session.socket.emit('trigger_event', {
          eventId,
          eventData,
        });
      }

      console.log(`[Arena] Event emitted: ${eventId} for ${playerWallet}`);
      return { success: true };
    } catch (error: any) {
      console.error('[Arena] Failed to emit event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get active session for player
   */
  getSession(playerWallet: string): GameSession | undefined {
    return this.activeSessions.get(playerWallet);
  }

  /**
   * Check if player has active arena session
   */
  hasActiveSession(playerWallet: string): boolean {
    return this.activeSessions.has(playerWallet);
  }

  /**
   * Cleanup session
   */
  cleanupSession(playerWallet: string): void {
    const session = this.activeSessions.get(playerWallet);
    if (session) {
      session.socket?.disconnect();
      this.activeSessions.delete(playerWallet);
      console.log(`[Arena] Session cleaned up for ${playerWallet}`);
    }
  }

  /**
   * Cleanup all sessions
   */
  cleanupAll(): void {
    for (const [wallet] of this.activeSessions) {
      this.cleanupSession(wallet);
    }
  }

  /**
   * Broadcast package to frontend (for testing)
   * This simulates viewer package purchases
   */
  broadcastPackage(packageData: any): void {
    console.log('[Arena] Broadcasting package:', packageData);
    this.onPackageBroadcast?.(packageData);
  }

  // Event handler callbacks (set by main server)
  onArenaCountdownStarted?: (playerWallet: string, data: any) => void;
  onCountdownUpdate?: (playerWallet: string, data: any) => void;
  onArenaBegins?: (playerWallet: string, data: any) => void;
  onImmediateItemDrop?: (playerWallet: string, data: any) => void;
  onPlayerBoostActivated?: (playerWallet: string, data: any) => void;
  onPackageDrop?: (playerWallet: string, data: any) => void;
  onGameCompleted?: (playerWallet: string, data: any) => void;
  onGameStopped?: (playerWallet: string, data: any) => void;
  onPackageBroadcast?: (data: any) => void;
}

// Singleton instance
export const arenaService = new ArenaService();
