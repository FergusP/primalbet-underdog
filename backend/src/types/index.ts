// Backend Types
export interface MonsterTier {
  tier: number;
  name: string;
  minPot: number; // in SOL
  maxPot: number; // in SOL
  hp: number;
  attackPower: number;
  defenseMultiplier: number;
  vaultCrackChance: number; // percentage (0-100)
  sprite: string;
}

export interface CombatSession {
  combatId: string;
  wallet: string;
  monsterType: string;
  startTime: number;
  endTime?: number;
  valid: boolean;
}

export interface VaultAttemptRequest {
  wallet: string;
  combatId: string;
  monsterType: string;
}

export interface VaultAttemptResponse {
  success: boolean;
  roll: number;
  crackChance: number;
  prizeAmount?: number;
  claimTx?: string;
  message: string;
  vrfProof: any;
}

export interface GameStateResponse {
  currentPot: number;
  currentMonster: MonsterTier;
  totalEntries: number;
  lastWinner: {
    wallet: string;
    amount: number;
    timestamp: number;
  } | null;
  recentCombats: any[];
}

export interface VRFResponse {
  result: number | number[]; // Can be a single number or array
  proof: {
    seed: string;
    nonce: string;
    hash: string;
    steps: string[];
  };
}