// GameService Implementation Example

export class GameService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Get current game state (pot, monster, etc)
  static async getColosseumState(): Promise<GameState> {
    const response = await fetch(`${this.BASE_URL}/state`);
    if (!response.ok) {
      throw new Error(`Failed to fetch game state: ${response.status}`);
    }
    return response.json();
  }

  // Vault crack attempt after combat victory
  static async attemptVaultCrack(
    wallet: string,
    combatId: string,
    monsterType: string
  ): Promise<VaultAttemptResponse> {
    const response = await fetch(`${this.BASE_URL}/vault/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, combatId, monsterType }),
    });

    if (!response.ok) {
      throw new Error(`Vault attempt failed: ${response.status}`);
    }

    return response.json();
  }

  // Get player profile and stats
  static async getPlayerProfile(wallet: string): Promise<PlayerData> {
    const response = await fetch(`${this.BASE_URL}/player/${wallet}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch player profile: ${response.status}`);
    }
    return response.json();
  }

  // Get payment options for a player
  static async getPaymentOptions(wallet: string): Promise<PaymentOptions> {
    const response = await fetch(
      `${this.BASE_URL}/player/${wallet}/payment-options`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch payment options: ${response.status}`);
    }

    return response.json();
  }

  // Check backend health
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Generate unique combat ID
  static generateCombatId(): string {
    return `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Type definitions
interface GameState {
  currentPot: number;
  currentMonster: Monster;
  totalEntries: number;
  lastWinner: string | null;
  recentCombats: Combat[];
}

interface Monster {
  name: string;
  type: string;
  tier: {
    name: string;
    sprite: string;
    color: string;
  };
  vaultCrackChance: number;
  health: number;
  damage: number;
}

interface Combat {
  id: string;
  gladiator: string;
  monster: string;
  victory: boolean;
  vaultCracked?: boolean;
  vaultAttempted?: boolean;
  timestamp: number;
}

interface PlayerData {
  wallet: string;
  balance: number;
  totalCombats: number;
  victories: number;
  totalWinnings: number;
  lastCombat: number;
  lastPaymentMethod: number;
}

interface PaymentOptions {
  hasAccount: boolean;
  pdaBalance: number;
  canUseWallet: boolean;
  canUsePDA: boolean;
  lastPaymentMethod: string;
}

interface VaultAttemptResponse {
  success: boolean;
  message: string;
  rollResult: number;
  threshold: number;
  prizeAmount?: number;
  txSignature?: string;
}

// Custom hook for game state polling
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(
    null
  );
  const { publicKey } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch game state
      const state = await GameService.getColosseumState();
      setGameState(state);

      // Fetch player data and payment options if wallet connected
      if (publicKey) {
        const [player, options] = await Promise.all([
          GameService.getPlayerProfile(publicKey.toString()),
          GameService.getPaymentOptions(publicKey.toString()),
        ]);
        setPlayerData(player);
        setPaymentOptions(options);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll every 2s

    return () => clearInterval(interval);
  }, [publicKey]);

  return { gameState, playerData, paymentOptions };
};