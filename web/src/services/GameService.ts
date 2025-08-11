// Game Service - API communication with backend
import { 
  ForestArenaState, 
  CombatRequest, 
  CombatResponse, 
  PlayerProfile, 
  PlayerStats,
  PaymentOptions 
} from '../types';

export class GameService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Get current arena state (polled every 2s as per guide)
  static async getArenaState(): Promise<ForestArenaState> {
    const response = await fetch(`${this.BASE_URL}/state`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch arena state: ${response.status}`);
    }
    
    return response.json();
  }

  // Enter combat with monster
  static async enterCombat(request: CombatRequest): Promise<CombatResponse> {
    const response = await fetch(`${this.BASE_URL}/combat/enter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get player profile
  static async getPlayerProfile(wallet: string): Promise<PlayerProfile> {
    const response = await fetch(`${this.BASE_URL}/player/${wallet}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch player profile: ${response.status}`);
    }
    
    return response.json();
  }

  // Get payment options for a player
  static async getPaymentOptions(wallet: string): Promise<PaymentOptions> {
    const response = await fetch(`${this.BASE_URL}/player/${wallet}/payment-options`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch payment options: ${response.status}`);
    }
    
    return response.json();
  }

  // Get leaderboard
  static async getLeaderboard(type: 'winnings' | 'winrate' | 'vaults' = 'winnings'): Promise<PlayerStats[]> {
    const response = await fetch(`${this.BASE_URL}/leaderboard?type=${type}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.status}`);
    }
    
    return response.json();
  }

  // Get combat history for player
  static async getCombatHistory(wallet: string): Promise<any[]> {
    const response = await fetch(`${this.BASE_URL}/combat/history/${wallet}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch combat history: ${response.status}`);
    }
    
    return response.json();
  }

  // Validate if backend is reachable
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Removed unused utility methods - they can be added back when actually needed
}

// Error types for better error handling
export class GameServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'GameServiceError';
  }
}

export class NetworkError extends GameServiceError {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class BackendError extends GameServiceError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = 'BackendError';
  }
}