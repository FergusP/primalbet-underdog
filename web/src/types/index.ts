// Shared types for PrimalBet Forest Arena
// Monster Combat System Types

export interface MonsterTier {
  name: string;                      // Display name
  sprite: string;                    // Phaser sprite key
  poolRange: [number, number];       // Min/max SOL for spawn
  baseHealth: number;                // Starting HP
  attackPower: number;               // Visual combat only
  defenseMultiplier: number;         // Affects combat difficulty
  vaultCrackChance: number;          // % chance after defeat
  entryFee: number;                  // SOL to fight (in lamports)
  animations: {
    idle: string;
    attack: string;
    hurt: string;
    death: string;
  };
}

export interface Monster {
  id: string;
  type: string;
  tier: MonsterTier;
  baseHealth: number;
  currentHealth: number;              // For visual display
  spawnedAt: number;
  defeatedBy: string | null;
  totalCombats: number;
  victories: number;                   // Warriors defeated
  evolution?: MonsterTier;             // Optional evolution form (e.g., Werewolf -> Werebear)
}

export interface CombatRequest {
  wallet: string;                      // Player's public key
  txSignature: string;                 // Entry payment proof
  combatId: string;                    // Unique combat identifier
  attemptVault: boolean;               // Always true for MVP
}

export interface CombatResult {
  combatId: string;
  warrior: string;                   // Player wallet
  monster: string;                     // Monster type name
  warriorPower: number;              // Calculated from entry amount
  warriorScore: number;              // Final combat score
  monsterScore: number;                // Monster's combat score
  victory: boolean;                    // Combat outcome
  vrfProof: string;                    // ProofNetwork verification
  timestamp: number;
  
  // Visual data for frontend
  combatLog?: CombatLogEntry[];        // For animation sequencing
}

export interface CombatLogEntry {
  action: 'attack' | 'defend' | 'special';
  source: 'warrior' | 'monster';
  damage?: number;                     // Visual only
  effect?: string;
  timestamp: number;
}

export interface VaultCrackResult {
  warrior: string;
  monster: string;
  crackChance: number;                 // From monster tier
  roll: number;                        // VRF result (0-99)
  success: boolean;
  prizeWon: number;                    // 0 if failed, jackpot if success
  vrfProof: string;
  timestamp: number;
}

export interface ForestArenaState {
  currentMonster: Monster;
  currentJackpot: number;              // In lamports
  lastWinner: {
    wallet: string;
    amount: number;
    monster: string;
    timestamp: number;
  } | null;
  totalEntries: number;                // Lifetime combat entries
  recentCombats: CombatSummary[];     // Last 10 for display
}

export interface CombatSummary {
  warrior: string;
  monster: string;
  victory: boolean;
  vaultAttempted: boolean;
  vaultCracked: boolean;
  timestamp: number;
}

export interface PlayerProfile {
  wallet: string;
  totalCombats: number;
  monstersDefeated: number;
  vaultAttempts: number;
  vaultsCracked: number;
  totalWinnings: number;               // Lifetime SOL won
  totalSpent: number;                  // Lifetime SOL spent
  lastCombat: number;                  // Timestamp
  
  // Future: XP/Level system
  xp?: number;
  level?: number;
}

export interface PlayerStats {
  wallet: string;
  winRate: number;                     // Victories / totalCombats
  vaultCrackRate: number;              // Cracked / attempts
  biggestWin: number;
  favoriteMonster: string;             // Most fought
  totalEarnings: number;
}

// UI Component Types
export interface JackpotDisplay {
  currentAmount: number;
  lastChange: number;
  isIncreasing: boolean;
  formattedAmount: string;             // "12.5 SOL"
}

export interface MonsterInfoPanel {
  monster: Monster;
  defeatedCount: number;
  averageVictoryRate: number;
  nextMonster: MonsterTier;            // What spawns at next tier
}

export interface EntryButtonState {
  enabled: boolean;
  entryFee: number;
  buttonText: string;                  // "Fight for 0.05 SOL"
  warning?: string;                    // "Insufficient balance"
}

// Phaser Scene Events
export interface CombatSceneEvents {
  'combat:start': { warrior: string; monster: Monster };
  'combat:attack': { source: string; target: string; damage: number };
  'combat:victory': { warrior: string };
  'combat:defeat': { warrior: string };
  'vault:attempt': { warrior: string; chance: number };
  'vault:cracked': { warrior: string; amount: number };
  'vault:failed': { warrior: string };
}

export interface CombatSceneState {
  phase: 'loading' | 'combat' | 'vault' | 'result';
  warriorHealth: number;             // Visual only
  monsterHealth: number;               // Visual only
  combatResult?: CombatResult;
  vaultResult?: VaultCrackResult;
}

// API Response Types
export interface CombatResponse {
  combatResult: CombatResult;
  vaultResult?: VaultCrackResult;      // Only if victory
  newMonster?: Monster;                // If jackpot won
}

// Payment System Types
export interface PaymentOptions {
  hasAccount: boolean;                 // Player account exists
  pdaBalance: number;                  // Balance in player PDA (lamports)
  canUseWallet: boolean;               // Can pay from wallet
  canUsePDA: boolean;                  // Can pay from PDA
  lastPaymentMethod: string;           // 'wallet' or 'pda'
}
// Remove backward compatibility - no longer needed
