/**
 * Arena Game Service
 * Handles Arena Arcade Game integration with TheVorld
 * Based on official integrateAAG.md documentation
 */

import { io, Socket } from 'socket.io-client';
import { ARENA_CONFIG, ARENA_API } from '../config/arena-config';

// Type definitions from official docs
export interface GamePlayer {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameEvent {
  id: string;
  eventName: string;
  isFinal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GamePackage {
  id: string;
  name: string;
  image: string;
  stats: Array<{
    name: string;
    currentValue: number;
    maxValue: number;
    description: string;
  }>;
  players: string[];
  type: string;
  cost: number;
  unlockAtPoints: number;
  metadata: {
    id: string;
    type: string;
    quantity: string;
  };
}

export interface EvaGameDetails {
  _id: string;
  gameId: string;
  vorldAppId: string;
  appName: string;
  gameDeveloperId: string;
  arcadeGameId: string;
  isActive: boolean;
  numberOfCycles: number;
  cycleTime: number;
  waitingTime: number;
  players: GamePlayer[];
  events: GameEvent[];
  packages: GamePackage[];
  createdAt: string;
  updatedAt: string;
}

export interface GameState {
  gameId: string;
  expiresAt: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  websocketUrl: string;
  evaGameDetails: EvaGameDetails;
  arenaActive: boolean;
  countdownStarted: boolean;
}

export interface BoostData {
  playerId: string;
  playerName: string;
  currentCyclePoints: number;
  totalPoints: number;
  arenaCoinsSpent: number;
  newArenaCoinsBalance: number;
}

export interface ItemDrop {
  itemId: string;
  itemName: string;
  targetPlayer: string;
  cost: number;
}

/**
 * Arena Game Service
 * Manages game sessions, WebSocket connections, and real-time events
 */
export class ArenaGameService {
  private socket: Socket | null = null;
  private gameState: GameState | undefined = undefined;
  private userToken: string = '';

  /**
   * Initialize game with stream URL
   * Creates a new game session and returns WebSocket URL
   */
  async initializeGame(
    streamUrl: string,
    userToken: string
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      this.userToken = userToken;

      const response = await fetch(`${ARENA_API.baseUrl}/games/init`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'X-Arena-Arcade-Game-ID': ARENA_CONFIG.arcadeGameId,
          'X-Vorld-App-ID': ARENA_CONFIG.vorldAppId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streamUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      this.gameState = result.data;

      // Connect to WebSocket
      if (this.gameState?.websocketUrl) {
        await this.connectWebSocket();
      }

      return {
        success: true,
        data: this.gameState,
      };
    } catch (error: any) {
      console.error('[ArenaGame] Initialize error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize game',
      };
    }
  }

  /**
   * Connect to WebSocket for real-time events
   */
  private async connectWebSocket(): Promise<boolean> {
    try {
      if (!this.gameState?.websocketUrl) return false;

      this.socket = io(this.gameState.websocketUrl, {
        transports: ['websocket'],
        auth: {
          token: this.userToken,
          appId: ARENA_CONFIG.vorldAppId,
        },
      });

      this.setupEventListeners();

      return new Promise((resolve) => {
        this.socket?.on('connect', () => {
          console.log('[ArenaGame] Connected to WebSocket');
          resolve(true);
        });

        this.socket?.on('connect_error', (error: Error) => {
          console.error('[ArenaGame] WebSocket connection failed:', error);
          resolve(false);
        });
      });
    } catch (error) {
      console.error('[ArenaGame] Failed to connect to WebSocket:', error);
      return false;
    }
  }

  /**
   * Set up WebSocket event listeners
   */
  private setupEventListeners(): void {
    // Arena Events
    this.socket?.on('arena_countdown_started', (data: any) => {
      console.log('[ArenaGame] Arena countdown started:', data);
      this.onArenaCountdownStarted?.(data);
    });

    this.socket?.on('countdown_update', (data: any) => {
      console.log('[ArenaGame] Countdown update:', data);
      this.onCountdownUpdate?.(data);
    });

    this.socket?.on('arena_begins', (data: any) => {
      console.log('[ArenaGame] Arena begins:', data);
      this.onArenaBegins?.(data);
    });

    // Boost Events
    this.socket?.on('player_boost_activated', (data: any) => {
      console.log('[ArenaGame] Player boost activated:', data);
      this.onPlayerBoostActivated?.(data);
    });

    this.socket?.on('boost_cycle_update', (data: any) => {
      console.log('[ArenaGame] Boost cycle update:', data);
      this.onBoostCycleUpdate?.(data);
    });

    this.socket?.on('boost_cycle_complete', (data: any) => {
      console.log('[ArenaGame] Boost cycle complete:', data);
      this.onBoostCycleComplete?.(data);
    });

    // Package Events
    this.socket?.on('package_drop', (data: any) => {
      console.log('[ArenaGame] Package drop:', data);
      this.onPackageDrop?.(data);
    });

    this.socket?.on('immediate_item_drop', (data: any) => {
      console.log('[ArenaGame] Immediate item drop:', data);
      this.onImmediateItemDrop?.(data);
    });

    // Game Events
    this.socket?.on('event_triggered', (data: any) => {
      console.log('[ArenaGame] Event triggered:', data);
      this.onEventTriggered?.(data);
    });

    this.socket?.on('player_joined', (data: any) => {
      console.log('[ArenaGame] Player joined:', data);
      this.onPlayerJoined?.(data);
    });

    this.socket?.on('game_completed', (data: any) => {
      console.log('[ArenaGame] Game completed:', data);
      this.onGameCompleted?.(data);
    });

    this.socket?.on('game_stopped', (data: any) => {
      console.log('[ArenaGame] Game stopped:', data);
      this.onGameStopped?.(data);
    });
  }

  /**
   * Get game details
   */
  async getGameDetails(
    gameId: string
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      const response = await fetch(`${ARENA_API.baseUrl}/games/${gameId}`, {
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          'X-Arena-Arcade-Game-ID': ARENA_CONFIG.arcadeGameId,
          'X-Vorld-App-ID': ARENA_CONFIG.vorldAppId,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get game details',
      };
    }
  }

  /**
   * Boost a player with Arena Coins
   */
  async boostPlayer(
    gameId: string,
    playerId: string,
    amount: number,
    username: string
  ): Promise<{ success: boolean; data?: BoostData; error?: string }> {
    try {
      const response = await fetch(
        `${ARENA_API.baseUrl}/games/boost/player/${gameId}/${playerId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.userToken}`,
            'X-Arena-Arcade-Game-ID': ARENA_CONFIG.arcadeGameId,
            'X-Vorld-App-ID': ARENA_CONFIG.vorldAppId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount, username }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to boost player',
      };
    }
  }

  /**
   * Drop immediate item to target player
   */
  async dropImmediateItem(
    gameId: string,
    itemId: string,
    targetPlayer: string
  ): Promise<{ success: boolean; data?: ItemDrop; error?: string }> {
    try {
      const response = await fetch(`${ARENA_API.baseUrl}/items/drop/${gameId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          'X-Arena-Arcade-Game-ID': ARENA_CONFIG.arcadeGameId,
          'X-Vorld-App-ID': ARENA_CONFIG.vorldAppId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, targetPlayer }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to drop item',
      };
    }
  }

  /**
   * Update stream URL
   */
  async updateStreamUrl(
    gameId: string,
    streamUrl: string,
    oldStreamUrl: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${ARENA_API.baseUrl}/games/${gameId}/stream-url`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.userToken}`,
          'X-Arena-Arcade-Game-ID': ARENA_CONFIG.arcadeGameId,
          'X-Vorld-App-ID': ARENA_CONFIG.vorldAppId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streamUrl, oldStreamUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update stream URL',
      };
    }
  }

  // Event handler callbacks (to be set by components)
  onArenaCountdownStarted?: (data: any) => void;
  onCountdownUpdate?: (data: any) => void;
  onArenaBegins?: (data: any) => void;
  onPlayerBoostActivated?: (data: any) => void;
  onBoostCycleUpdate?: (data: any) => void;
  onBoostCycleComplete?: (data: any) => void;
  onPackageDrop?: (data: any) => void;
  onImmediateItemDrop?: (data: any) => void;
  onEventTriggered?: (data: any) => void;
  onPlayerJoined?: (data: any) => void;
  onGameCompleted?: (data: any) => void;
  onGameStopped?: (data: any) => void;

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.gameState = undefined;
    console.log('[ArenaGame] Disconnected');
  }

  /**
   * Get current game state
   */
  getGameState(): GameState | undefined {
    return this.gameState;
  }
}
