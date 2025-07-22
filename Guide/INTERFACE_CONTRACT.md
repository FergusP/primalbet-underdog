# **INTERFACE CONTRACT v7.0**
*The Sacred Source of Truth for Aurelius Colosseum Monster Combat System*

**BREAKING CHANGES FROM v6.0:**
- Frontend handles real-time skill-based combat
- Backend validates combat results with simple checks
- VRF used only for vault crack attempts, not combat
- Session-based API flow for security
- Blockchain-first pot management

---

## **🎮 Game Overview**

**Aurelius Colosseum** is a monster-fighting jackpot game where:
1. Players pay to send gladiators to fight monsters
2. Monster difficulty scales with jackpot size
3. Victory gives chance to crack treasure vault
4. Failed attempts grow the jackpot
5. Winner takes entire prize pool

---

## **📊 Core Data Structures**

### **1. Monster Configuration**

```typescript
// Shared between frontend and backend
interface MonsterTier {
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

// Monster instance
interface Monster {
  id: string;
  type: string;
  tier: MonsterTier;
  baseHealth: number;
  currentHealth: number;              // For visual display
  spawnedAt: number;
  defeatedBy: string | null;
  totalCombats: number;
  victories: number;                   // Gladiators defeated
}
```

### **2. Combat System**

```typescript
// Start combat session
interface CombatStartRequest {
  wallet: string;                      // Player's public key
  txSignature: string;                 // Entry payment proof (0.01 SOL)
}

interface CombatStartResponse {
  sessionId: string;                   // Unique session identifier
  currentMonster: Monster;             // Monster to fight
  sessionExpiry: number;               // Timestamp when session expires
  startTime: number;                   // Combat start timestamp
}

// Complete combat session
interface CombatCompleteRequest {
  wallet: string;
  sessionId: string;
  victory: boolean;                    // Frontend-determined outcome
  combatStats: {
    duration: number;                  // Combat duration in ms
    totalDamageDealt: number;          // Total damage to monster
  };
}

interface CombatCompleteResponse {
  validated: boolean;                  // Backend validation result
  canAttemptVault: boolean;           // True if validated && victory
  validationErrors?: string[];         // Reasons if validation failed
}
```

### **3. Vault System**

```typescript
// Vault crack attempt (only if combat validated && victory)
interface VaultCrackRequest {
  wallet: string;
  sessionId: string;                   // Must have validated combat victory
}

interface VaultCrackResponse {
  gladiator: string;
  monster: string;
  crackChance: number;                 // From monster tier + entry bonus
  roll: number;                        // VRF result (0-99)
  success: boolean;
  prizeWon: number;                    // 0 if failed, jackpot if success
  vrfProof: string;                    // ProofNetwork verification
  newPot?: number;                     // New pot if won (reset to 0)
  timestamp: number;
}
```

### **4. Game State**

```typescript
// Current colosseum state
interface ColosseumState {
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

interface CombatSummary {
  gladiator: string;
  monster: string;
  victory: boolean;
  vaultAttempted: boolean;
  vaultCracked: boolean;
  timestamp: number;
}
```

### **5. Player Data**

```typescript
// Player profile (from blockchain)
interface PlayerProfile {
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

// Player stats for leaderboard
interface PlayerStats {
  wallet: string;
  winRate: number;                     // Victories / totalCombats
  vaultCrackRate: number;              // Cracked / attempts
  biggestWin: number;
  favoriteMonster: string;             // Most fought
  totalEarnings: number;
}
```

---

## **🔌 API Endpoints**

### **Backend REST API**

```typescript
// Base URL: https://api.aurelius-colosseum.com

// 1. Get current game state
GET /api/state
Response: {
  currentMonster: Monster;
  currentJackpot: number;
  totalEntries: number;
  recentCombats: CombatSummary[];
}

// 2. Start combat session
POST /api/combat/start
Body: CombatStartRequest
Response: CombatStartResponse

// 3. Complete combat session
POST /api/combat/complete
Body: CombatCompleteRequest
Response: CombatCompleteResponse

// 4. Attempt vault crack
POST /api/vault/crack
Body: VaultCrackRequest
Response: VaultCrackResponse

// 5. Get player stats
GET /api/player/:wallet
Response: PlayerProfile

// 6. Get leaderboard
GET /api/leaderboard
Query: ?type=winnings|winrate|vaults
Response: PlayerStats[]

// 7. Get combat history
GET /api/combat/history/:wallet
Response: CombatHistory[]
```

---

## **🎮 Frontend Integration**

### **Phaser Scene Events**

```typescript
// Events emitted by combat scene
interface CombatSceneEvents {
  'combat:start': { gladiator: string; monster: Monster };
  'combat:attack': { source: string; target: string; damage: number };
  'combat:victory': { gladiator: string };
  'combat:defeat': { gladiator: string };
  'vault:attempt': { gladiator: string; chance: number };
  'vault:cracked': { gladiator: string; amount: number };
  'vault:failed': { gladiator: string };
}

// Scene state management
interface CombatSceneState {
  phase: 'loading' | 'combat' | 'vault' | 'result';
  gladiatorHealth: number;             // Visual only
  monsterHealth: number;               // Visual only
  combatResult?: CombatResult;
  vaultResult?: VaultCrackResult;
}
```

### **UI Components Data**

```typescript
// Jackpot display
interface JackpotDisplay {
  currentAmount: number;
  lastChange: number;
  isIncreasing: boolean;
  formattedAmount: string;             // "12.5 SOL"
}

// Monster info panel
interface MonsterInfoPanel {
  monster: Monster;
  defeatedCount: number;
  averageVictoryRate: number;
  nextMonster: MonsterTier;            // What spawns at next tier
}

// Entry button state
interface EntryButtonState {
  enabled: boolean;
  entryFee: number;
  buttonText: string;                  // "Fight for 0.05 SOL"
  warning?: string;                    // "Insufficient balance"
}
```

---

## **⚡ Real-time Updates**

### **Polling Strategy**

```typescript
// Frontend polls these endpoints
const POLLING_INTERVALS = {
  gameState: 2000,      // 2s - Current monster & jackpot
  leaderboard: 10000,   // 10s - Less critical
  playerStats: 5000,    // 5s - After combat only
};

// State change events to watch
interface StateChangeEvents {
  'monster:spawned': { old: Monster; new: Monster };
  'jackpot:increased': { amount: number; total: number };
  'jackpot:won': { winner: string; amount: number };
  'combat:completed': { gladiator: string; victory: boolean };
}
```

---

## **🔒 Security Considerations**

### **Backend Validation**

```typescript
// Session validation requirements
interface SessionValidation {
  validTxSignature: boolean;           // Verified on-chain (0.01 SOL)
  activeSession: boolean;              // Session not expired
  singleCompletion: boolean;           // Session used only once
  authorizedWallet: boolean;           // Matches tx signer
}

// Combat validation rules
interface CombatValidation {
  minimumDuration: 3000;               // 3 seconds minimum
  damageTolerancePercent: 20;          // ±20% of monster HP
  sessionTimeout: 300000;              // 5 minutes max
}

// VRF requirements (vault only)
interface VaultVRFRequirements {
  verifiableProof: boolean;            // Can be checked on-chain
  uniqueSeed: boolean;                 // Includes sessionId
  validatedCombat: boolean;            // Must have valid combat victory
}
```

---

## **🎨 Visual Assets Requirements**

### **Monster Sprites**

```typescript
// Required for each monster
interface MonsterAssets {
  spriteSheet: string;                 // Path to sprite sheet
  frameSize: { width: number; height: number };
  animations: {
    idle: { frames: number[]; fps: number };
    attack: { frames: number[]; fps: number };
    hurt: { frames: number[]; fps: number };
    death: { frames: number[]; fps: number };
  };
  scale: number;                       // Display scale
  offset: { x: number; y: number };    // Position offset
}
```

### **Effect Requirements**

```typescript
interface VisualEffects {
  combatHit: string;                   // Impact effect
  vaultGlow: string;                   // Vault attempt effect
  goldExplosion: string;               // Jackpot win effect
  defeatFade: string;                  // Death effect
}
```

---

## **📱 Platform Considerations**

### **Mobile Optimizations**

```typescript
// Reduced data for mobile
interface MobileGameState {
  m: Monster;                          // Current monster
  j: number;                           // Jackpot (in SOL)
  e: number;                           // Entry fee (in SOL)
}

// Simplified combat result
interface MobileCombatResult {
  v: boolean;                          // Victory
  vr?: boolean;                        // Vault result (if attempted)
  p?: number;                          // Prize (if won)
}
```

---

## **🚀 Implementation Timeline**

### **MVP (Day 1-3)**
- Basic monster spawning
- Combat resolution with mock VRF
- Vault crack mechanics
- Simple Phaser visualization
- Core smart contracts

### **Post-MVP Additions**
- Real ProofNetwork integration
- XP/Level system
- Achievement system
- Special event monsters
- Tournament mode

---

## **📋 Type Exports**

```typescript
// backend/src/types/index.ts
export * from './monsters';
export * from './combat';
export * from './vault';
export * from './player';

// web/src/types/index.ts
export * from '@aurelius/shared-types';
export * from './ui';
export * from './phaser';

// Smart contract IDL types
export * from '../idl/aurelius_colosseum';
```

---

**Version History:**
- v7.0 (Current) - Frontend combat with backend validation, VRF vault-only
- v6.0 (Deprecated) - VRF-based combat resolution
- v5.0 (Deprecated) - Input-driven weight-based arena
- v4.0 (Deprecated) - Dual-platform architecture
- v3.0 (Deprecated) - WebSocket real-time
- v2.0 (Deprecated) - Initial arena concept
- v1.0 (Deprecated) - Original PvP design

---

*This contract is the source of truth. Any deviation requires version increment and partner notification.*