// Game Service - API communication with backend
import { 
  ColosseumState, 
  CombatRequest, 
  CombatResponse, 
  PlayerProfile, 
  PlayerStats,
  PaymentOptions 
} from '../types';

export class GameService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Get current colosseum state (polled every 2s as per guide)
  static async getColosseumState(): Promise<ColosseumState> {
    const response = await fetch(`${this.BASE_URL}/state`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch colosseum state: ${response.status}`);
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

  // Generate unique combat ID
  static generateCombatId(): string {
    return `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  // Format SOL amounts for display
  static formatSolAmount(lamports: number): string {
    const sol = lamports / 1e9;
    if (sol >= 1000) {
      return `${(sol / 1000).toFixed(1)}K SOL`;
    } else if (sol >= 1) {
      return `${sol.toFixed(3)} SOL`;
    } else {
      return `${sol.toFixed(6)} SOL`;
    }
  }

  // Format wallet address for display
  static formatWalletAddress(address: string): string {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  // Calculate win rate percentage
  static calculateWinRate(victories: number, totalCombats: number): string {
    if (totalCombats === 0) return '0%';
    return `${Math.round((victories / totalCombats) * 100)}%`;
  }

  // Get monster emoji by name
  static getMonsterEmoji(monsterName: string): string {
    const emojiMap: { [key: string]: string } = {
      'skeleton': '💀',
      'skeleton warrior': '💀',
      'goblin': '👹',
      'goblin berserker': '👹',
      'minotaur': '🐂',
      'minotaur guardian': '🐂',
      'hydra': '🐍',
      'dragon': '🐉',
      'ancient dragon': '🐉',
      'titan': '⚡',
      'titan of sol': '⚡'
    };
    
    return emojiMap[monsterName.toLowerCase()] || '👹';
  }

  // Check if combat is still valid (not too old)
  static isCombatValid(combatTimestamp: number, maxAgeMs: number = 300000): boolean {
    return Date.now() - combatTimestamp < maxAgeMs; // 5 minutes default
  }

  // Retry mechanism for failed requests
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        console.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms:`, error);
        await this.delay(delayMs * attempt); // Exponential backoff
      }
    }
    
    throw lastError;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
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