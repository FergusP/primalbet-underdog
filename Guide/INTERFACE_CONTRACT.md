# **AURELIUS INTERFACE CONTRACT**
*Sacred Agreement Between Partners*

**Version**: 4.0.0  
**Last Updated**: [Current Date]  
**Status**: ACTIVE - AUTO-BATTLE UPDATE

<!-- MVP:SUMMARY -->
## **🚀 MVP Interface Features (INPUT-DRIVEN API)**
For the 2-day MVP, only implement:
- **Simple HTTP API**: RESTful endpoints for inputs
- **Polling Updates**: Client polls for visual state
- **Input Collection**: Strategic decisions, not movement
- **Visual Feedback**: Fake combat animations
- **Weight Processing**: Backend calculates from inputs

Skip for MVP: WebSockets, Direct combat, Complex features
<!-- MVP:END -->

---

## **⚠️ SACRED RULES**

1. **This document is the source of truth** for all integration points
2. **Any changes require BOTH partners' approval**
3. **Breaking changes must be versioned**
4. **All data types must match EXACTLY**
5. **Test with mocks before integration**

---

## **🔌 API Protocol (HTTP Polling)**

<!-- MVP:START -->
### **API Endpoints (MVP Version)**

#### **GET /api/game/state**
```typescript
// Request (query params)
?gameId=string&wallet=string

// Response
{
  gameId: string,
  phase: 'waiting' | 'battle' | 'ended',
  timeRemaining: number,
  warriors: Warrior[],
  powerUps: PowerUp[],
  pot: number,
  playerCount: number,
  marketplace: PowerUpOffer[]
}
```

#### **POST /api/game/join**
```typescript
// Request body
{
  wallet: string,
  gameId?: string, // Optional, joins next available
  position?: { x: number, y: number } // Strategic position choice
}

// Response
{
  success: boolean,
  gameId: string,
  warriorId: string,
  entryBonus: number, // Weight bonus for timing
  message?: string
}
```

#### **POST /api/game/input**
```typescript
// Request body
{
  wallet: string,
  gameId: string,
  inputType: 'ACTIVATE_POWERUP' | 'FORM_ALLIANCE' | 'BETRAY_ALLIANCE' | 'TARGET_ENEMY' | 'BOOST_WARRIOR',
  data: any // Input-specific data
}

// Response
{
  success: boolean,
  visualFeedback: {
    type: 'positive' | 'negative' | 'neutral',
    message: string,
    animation: string
  },
  newPotSize?: number
}
```

#### **POST /api/game/buyPowerUp**
```typescript
// Request body
{
  wallet: string,
  gameId: string,
  offerId: string
}

// Response
{
  success: boolean,
  newPotSize: number,
  powerUpId: string, // For later activation
  message?: string
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
### **Connection Handshake (Full Version)**
```typescript
// Full version with signature verification
{
  type: 'connect',
  data: {
    wallet: string,
    signature: string,
    timestamp: number,
    preferredMode?: 'blitz' | 'siege' // Optional mode preference
  }
}

// Server → Client
{
  type: 'connected',
  data: {
    sessionId: string,
    gameState: GameState | null,
    availableModes: Array<'blitz' | 'siege'>
  }
}
```
<!-- POST-MVP:END -->

### **Data Types**

<!-- MVP:START -->
#### **Game State - MVP VERSION**
```typescript
interface GameState {
  gameId: string;
  phase: 'waiting' | 'battle' | 'ended';
  timeRemaining: number; // seconds
  warriors: Warrior[]; // Visual positions only
  visualEffects: VisualEffect[]; // Current animations
  pot: number; // in SOL
  playerCount: number;
  marketplace: PowerUpOffer[];
  momentum: Map<string, number>; // Visual momentum bars
  winner?: string; // wallet address when ended
  winnerWeight?: number; // Show final weight
}

interface Warrior {
  warriorId: string;
  player: string; // wallet
  position: { x: number; y: number }; // Visual only
  visualHp: number; // Fake HP for display
  maxHp: 100;
  effects: string[]; // Visual effects active
  momentum: number; // Visual momentum 0-100
  lastAction?: {
    type: string;
    timestamp: number;
  };
}

interface PowerUp {
  powerUpId: string;
  type: 'health' | 'rage' | 'chaos';
  position: { x: number; y: number };
  isActive: boolean;
}

interface PowerUpOffer {
  id: string;
  type: 'health' | 'rage' | 'chaos' | 'assassinate';
  price: number; // in SOL
  description: string;
  weightHint: 'defensive' | 'aggressive' | 'tactical' | 'chaotic';
  expiresIn: number; // seconds
}

interface VisualEffect {
  id: string;
  type: 'damage' | 'heal' | 'powerup' | 'alliance' | 'betrayal';
  position: { x: number; y: number };
  target?: string;
  value?: number; // Fake damage/heal amount
  duration: number;
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
#### **Game State Update - FULL VERSION** (Server → Client)
```typescript
{
  type: 'gameStateUpdate',
  data: {
    gameId: string,
    gameMode: 'blitz' | 'siege',
    phase: 'waiting' | 'preparation' | 'battle' | 'sudden_death' | 'ended',
    timeRemaining: number,
    warriors: Array<{
      warriorId: string,
      player: string,
      position: { x: number, y: number },
      hp: number,
      maxHp: number,
      effects: Array<'rage' | 'speed' | 'shield'>,
      isAlive: boolean,
      veteranBonus?: number, // Damage bonus percentage
      entryTime: number,
      eliminations: number
    }>,
    powerUps: Array<{
      powerUpId: string,
      type: 'health' | 'rage' | 'speed' | 'shield' | 'godslayer',
      position: { x: number, y: number },
      isActive: boolean,
      tier?: 'normal' | 'enhanced' // For siege mode combinations
    }>,
    arenaRadius: number, // For shrinking arena
    arenaZones?: Array<{ // Siege mode only
      type: 'outer' | 'mid' | 'center',
      controlledBy?: string, // Player wallet
      bonus: string // e.g., "+2 HP/10s"
    }>,
    activeModifiers?: Array<string> // Dynamic game modifiers
  }
}
```
<!-- POST-MVP:END -->

<!-- MVP:START -->
#### **Warrior Spawned - MVP VERSION** (Server → Client)
```typescript
{
  type: 'warriorSpawned',
  data: {
    warriorId: string,
    player: string,
    position: { x: number, y: number },
    hp: 100, // Always 100 for MVP
    maxHp: 100
  }
}
```

#### **Power-Up Purchase - MVP VERSION** (Bidirectional)
```typescript
// Client → Server (Request)
{
  type: 'buyPowerUp',
  data: {
    offerId: string,
    targetWarriorId?: string // Optional for targeted power-ups
  }
}

// Server → Client (Confirmation)
{
  type: 'powerUpPurchased',
  data: {
    buyer: string,
    powerUpType: string,
    price: number,
    targetWarrior?: string,
    newPotSize: number
  }
}
```

#### **Power-Up Marketplace - MVP VERSION** (Server → Client)
```typescript
{
  type: 'powerUpOffers',
  data: {
    offers: Array<{
      id: string,
      type: 'health' | 'rage' | 'chaos' | 'assassinate',
      price: number, // in SOL
      description: string,
      target: 'self' | 'all' | 'enemy',
      expiresIn: number // seconds
    }>
  }
}
```

#### **Prize Pool Update - MVP VERSION** (Server → Client)
```typescript
{
  type: 'potUpdate',
  data: {
    currentPot: number, // in SOL
    lastChange: number,
    source: 'join' | 'powerup',
    totalPlayers: number
  }
}
```

#### **Warrior Movement - MVP VERSION** (Server → Client ONLY)
```typescript
// Server broadcasts AI movement
{
  type: 'warriorMoved',
  data: {
    warriorId: string,
    position: { x: number, y: number }
  }
}
```

#### **Combat Events - MVP VERSION** (Server → Client)
```typescript
{
  type: 'combatEvent',
  data: {
    attackerId: string,
    targetId: string,
    damage: 6, // Fixed damage for MVP
    newHp: number
  }
}
```

#### **Power-Up Events - MVP VERSION** (Server → Client)
```typescript
// Spawn
{
  type: 'powerUpSpawned',
  data: {
    powerUpId: string,
    type: 'health' | 'rage', // Only 2 types for MVP
    position: { x: number, y: number }
  }
}

// Collection
{
  type: 'powerUpCollected',
  data: {
    powerUpId: string,
    warriorId: string,
    type: 'health' | 'rage'
  }
}
```

#### **Game End - MVP VERSION** (Server → Client)
```typescript
{
  type: 'gameEnded',
  data: {
    gameId: string,
    winner: string,
    prize: number
  }
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
#### **Full Version Events**

```typescript
// Warrior Spawned (with late entry)
{
  type: 'warriorSpawned',
  data: {
    warriorId: string,
    player: string,
    position: { x: number, y: number },
    hp: number, // 100 for early, 70 for late entry
    maxHp: 100,
    entryTiming: 'early' | 'late',
    spawnImmunity: number, // seconds
    timestamp: number
  }
}

// Enhanced Movement
{
  type: 'warriorMoved',
  data: {
    warriorId: string,
    oldPosition: { x: number, y: number },
    newPosition: { x: number, y: number },
    timestamp: number
  }
}

// Full Combat Events
{
  type: 'combatEvent',
  data: {
    eventType: 'attack' | 'damage' | 'block' | 'miss',
    attackerId: string,
    targetId: string,
    damage?: number,
    newHp?: number,
    isCritical?: boolean,
    timestamp: number
  }
}

// Enhanced Power-ups
{
  type: 'powerUpSpawned',
  data: {
    powerUpId: string,
    type: 'health' | 'rage' | 'speed' | 'shield' | 'godslayer',
    position: { x: number, y: number },
    spawnTime: number,
    tier?: 'normal' | 'enhanced'
  }
}

{
  type: 'powerUpCollected',
  data: {
    powerUpId: string,
    warriorId: string,
    effect: {
      type: string,
      duration?: number,
      value?: number,
      stackable?: boolean // For siege mode
    }
  }
}

// Special Events (Server → Client)
{
  type: 'specialEvent',
  data: {
    eventType: 'equalizer' | 'berserker_plague' | 'teleport_chaos' | 'divine_shield' | 'second_wind',
    affectedWarriors: string[],
    description: string,
    duration?: number
  }
}

// Full Game End Event
{
  type: 'gameEnded',
  data: {
    gameId: string,
    gameMode: 'blitz' | 'siege',
    winners: Array<{
      player: string,
      placement: number,
      prizeShare: number
    }>,
    xpGained: Array<{
      player: string,
      xp: number,
      newLevel: number
    }>
  }
}
```
<!-- POST-MVP:END -->

---

#### **Elimination Event** (Server → Client)
```typescript
{
  type: 'warriorEliminated',
  data: {
    warriorId: string,
    eliminatedBy: string | 'environment',
    position: { x: number, y: number },
    finalStats: {
      survivalTime: number,
      damageDealt: number,
      damageTaken: number,
      eliminations: number
    }
  }
}
```

#### **Game End Event** (Server → Client)
```typescript
{
  type: 'gameEnded',
  data: {
    gameId: string,
    gameMode: 'blitz' | 'siege',
    winners: Array<{ // Single for blitz, top 3 for siege
      player: string,
      placement: number,
      prizeShare: number // In lamports
    }>,
    endType: 'last_standing' | 'time_limit' | 'force_end',
    finalPot: number,
    participants: Array<{
      player: string,
      placement: number,
      survivalTime: number,
      eliminations: number,
      damageDealt: number,
      territoriesControlled?: number // Siege only
    }>,
    xpGained: Array<{
      player: string,
      baseXP: number,
      bonusXP: number,
      multiplier: number,
      totalXP: number,
      newLevel?: number,
      leveledUp: boolean
    }>,
    vrfProof?: string,
    nextGameStart?: number // For siege mode scheduling
  }
}
```

#### **XP Update Event** (Server → Client)
```typescript
{
  type: 'xpGained',
  data: {
    player: string,
    action: string, // "Elimination", "Power-up Collected", etc.
    xpAmount: number,
    totalSessionXP: number,
    currentLevel: number,
    xpToNextLevel: number
  }
}
```

---

## **📱 Platform-Specific Interface**

### **Mobile Connection Protocol**
```typescript
// Mobile → Server Connection
{
  type: 'connect',
  data: {
    wallet: string,
    platform: 'mobile', // Required for mobile
    clientId: string,   // Persistent client ID for reconnection
    appVersion: string, // Mobile app version
    osVersion: string   // iOS/Android version
  }
}

// Server → Mobile Response
{
  type: 'connected',
  data: {
    sessionId: string,
    gameState: GameState | null,
    updateRate: number, // 100ms for mobile (10 FPS)
    compressionEnabled: boolean // true for mobile
  }
}
```

### **Mobile-Specific Events**

#### **App State Change** (Mobile → Server)
```typescript
{
  type: 'appStateChange',
  data: {
    state: 'foreground' | 'background' | 'inactive',
    timestamp: number
  }
}
```

#### **Touch Input** (Mobile → Server)
```typescript
{
  type: 'touchInput',
  data: {
    action: 'tap' | 'swipe' | 'hold',
    position?: { x: number, y: number }, // For tap
    direction?: { x: number, y: number }, // For swipe
    duration?: number // For hold
  }
}
```

#### **Batched Update** (Server → Mobile)
```typescript
{
  type: 'batchUpdate',
  data: {
    timestamp: number,
    warriors: Array<{
      id: string,
      p: [number, number], // Compressed position
      h: number,           // HP
      a: 0 | 1            // Alive (0/1)
    }>,
    powerUps: Array<{
      id: string,
      t: 'h' | 'r',       // Type (health/rage)
      p: [number, number]  // Position
    }>,
    events: Array<any>     // Priority sorted events
  }
}
```

### **Platform Abstraction Interfaces**

```typescript
// Shared wallet interface
interface WalletAdapter {
  platform: 'web' | 'mobile';
  connect(): Promise<PublicKey>;
  signTransaction(tx: Transaction): Promise<Transaction>;
  disconnect(): Promise<void>;
}

// Web implementation
class WebWalletAdapter implements WalletAdapter {
  platform = 'web' as const;
  // Uses @solana/wallet-adapter-react
}

// Mobile implementation  
class MobileWalletAdapter implements WalletAdapter {
  platform = 'mobile' as const;
  // Uses @solana-mobile/mobile-wallet-adapter-protocol
}

// Game renderer interface
interface GameRenderer {
  platform: 'web' | 'mobile';
  initialize(container: any): void;
  renderWarrior(warrior: Warrior): void;
  renderPowerUp(powerUp: PowerUp): void;
  handleInput(input: InputEvent): void;
  cleanup(): void;
}
```

---

## **📡 HTTP API Endpoints**

### **Game Info**
```typescript
GET /api/games/current
Response: {
  blitz: {
    gameId: string | null,
    status: 'waiting' | 'active' | 'ended',
    playerCount: number,
    potSize: number,
    timeRemaining?: number
  },
  siege: {
    gameId: string | null,
    status: 'scheduled' | 'recruiting' | 'active' | 'ended',
    playerCount: number,
    maxPlayers: 100,
    potSize: number,
    nextStartTime: number,
    timeRemaining?: number
  }
}

GET /api/game/:gameId
Response: {
  gameId: string,
  gameMode: 'blitz' | 'siege',
  startTime: number,
  endTime?: number,
  winners: Array<{
    player: string,
    placement: number,
    prizeShare: number
  }>,
  participants: string[],
  finalPot: number,
  modifiers?: string[]
}
```

### **Player Stats**
```typescript
GET /api/player/:wallet
Response: {
  wallet: string,
  totalGames: number,
  wins: number,
  totalEarnings: number,
  winRate: number,
  averagePlacement: number,
  currentStreak: number,
  xp: number,
  level: number,
  xpToNextLevel: number,
  levelTitle: string
}
```

---

## **⚓ Anchor Program Interface**

### **Instructions**

#### **create_player_profile**
```rust
pub fn create_player_profile(ctx: Context<CreatePlayer>) -> Result<()>
```

#### **join_game**
```rust
pub fn join_game(
    ctx: Context<JoinGame>, 
    game_mode: GameMode,
    position: Option<Position>, // Required for siege, ignored for blitz
    warrior_count: u8 // For multi-warrior entry
) -> Result<()>

pub enum GameMode {
    Blitz,
    Siege,
}

pub struct Position {
    x: u8,  // 0-19
    y: u8,  // 0-19
}
```

#### **end_game**
```rust
pub fn end_game(
    ctx: Context<EndGame>,
    game_mode: GameMode,
    winners: Vec<Winner>, // Single for blitz, top 3 for siege
    vrf_proof: Option<String>
) -> Result<()>

pub struct Winner {
    player: Pubkey,
    placement: u8,
    prize_share: u64, // lamports
}
```

#### **claim_prize**
```rust
pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()>
```

### **Account Structures**

#### **PlayerProfile**
```rust
#[account]
pub struct PlayerProfile {
    pub authority: Pubkey,      // 32 bytes
    pub total_games: u64,       // 8 bytes
    pub total_wins: u64,        // 8 bytes
    pub total_earnings: u64,    // 8 bytes
    pub current_streak: u16,    // 2 bytes
    pub highest_streak: u16,    // 2 bytes
    pub xp: u64,               // 8 bytes
    pub level: u8,             // 1 byte
    pub created_at: i64,       // 8 bytes
}
// Total: 77 bytes
```

#### **GameEscrow**
```rust
#[account]
pub struct GameEscrow {
    pub game_id: Pubkey,        // 32 bytes
    pub game_mode: GameMode,    // 1 byte (enum)
    pub total_pot: u64,         // 8 bytes
    pub player_count: u8,       // 1 byte
    pub max_players: u8,        // 1 byte
    pub is_active: bool,        // 1 byte
    pub winners: Vec<Winner>,   // Variable (max 3)
    pub start_time: i64,        // 8 bytes
    pub end_time: Option<i64>,  // 9 bytes (1 + 8)
    pub modifiers: u16,         // 2 bytes (bit flags)
}
// Total: ~120 bytes (with 3 winners)
```

---

## **🎮 Phaser Game Constants**

```typescript
// Arena Configuration
export const ARENA_CONFIG = {
  GRID_SIZE: 20,
  CELL_SIZE: 30, // pixels
  ARENA_DIAMETER: 600, // pixels
  BLITZ: {
    SHRINK_START_TIME: 45, // seconds
    SHRINK_PERCENTAGE: 0.5,
    DANGER_ZONE_DAMAGE: 5,
    ENV_DAMAGE_RATE: 3, // seconds
    ENV_DAMAGE_AMOUNT: 2,
  },
  SIEGE: {
    SHRINK_PHASES: [120, 210, 270], // seconds
    SHRINK_PERCENTAGES: [0.2, 0.4, 0.6],
    DANGER_ZONE_DAMAGE: 3,
    ENV_DAMAGE_RATE: 5, // seconds
    ENV_DAMAGE_AMOUNT: 1,
    ZONES: ['outer', 'mid', 'center'],
  },
}

// Warrior Configuration  
export const WARRIOR_CONFIG = {
  BASE_HP: 100,
  LATE_ENTRY_HP: 70,
  BASE_SPEED: 100, // pixels per second
  BASE_DAMAGE: [5, 8], // min-max
  ATTACK_RANGE: 1, // grid cells
  ATTACK_COOLDOWN: 1000, // ms
  VETERAN_BONUS_RATE: 0.01, // 1% per 10 seconds
  KILL_REWARD_HP: 5,
  UNDERDOG_THRESHOLD: 5, // 5:1 ratio
  UNDERDOG_BONUSES: {
    damage: 0.1, // 10%
    speed: 0.1, // 10%
    dodge: 0.2, // 20%
  },
}

// Power-up Configuration
export const POWERUP_CONFIG = {
  BLITZ: {
    HEALTH: { value: 25, spawnRate: 10 },
    RAGE: { duration: 10, multiplier: 2, spawnRate: 20 },
    SPEED: { duration: 8, multiplier: 1.5, spawnRate: 15 },
    SHIELD: { charges: 2, spawnRate: 30 },
  },
  SIEGE: {
    HEALTH: { value: 25, enhanced: 40, spawnRate: 20 },
    RAGE: { duration: 20, multiplier: 1.5, spawnRate: 40 },
    SPEED: { duration: 15, multiplier: 1.3, spawnRate: 30 },
    SHIELD: { charges: 3, spawnRate: 60 },
    GODSLAYER: { damage: 50, spawnChance: 0.005 },
  },
}

// Game Phases
export const GAME_PHASES = {
  BLITZ: {
    WAITING: { duration: null },
    BATTLE: { duration: 90 },
    ENDED: { duration: null },
  },
  SIEGE: {
    WAITING: { duration: null },
    PREPARATION: { duration: 30 },
    BATTLE: { duration: 270 },
    ENDED: { duration: null },
  },
}

// Entry Fee Scaling
export const ENTRY_FEES = {
  BLITZ: {
    BASE: 0.002, // SOL
    MULTI_WARRIOR: [1, 1.05, 1.10, 1.15, 1.20],
    LATE_ENTRY: [1, 1.5, 2.0, 3.0], // by quarter
  },
  SIEGE: {
    BASE: 0.01, // SOL
    MULTI_WARRIOR: [1, 1.05, 1.10, 1.15, 1.20],
    LATE_ENTRY: [1, 1.5, 2.0, 3.0], // by quarter
  },
}

// Special Events
export const SPECIAL_EVENTS = {
  SECOND_WIND: { chance: 0.02, healTo: 30 },
  EQUALIZER: { chance: 0.01, damage: [30, 50] },
  BERSERKER_PLAGUE: { chance: 0.005, setHp: 50 },
  TELEPORT_CHAOS: { chance: 0.01, immunity: 3 },
  DIVINE_SHIELD: { chance: 0.005, duration: 5 },
}
```

---

## **🔐 Error Codes**

```typescript
enum ErrorCode {
  // Connection Errors (1xxx)
  INVALID_SIGNATURE = 1001,
  SESSION_EXPIRED = 1002,
  ALREADY_CONNECTED = 1003,
  
  // Game Errors (2xxx)
  GAME_NOT_ACTIVE = 2001,
  ALREADY_IN_GAME = 2002,
  INVALID_POSITION = 2003,
  INSUFFICIENT_FUNDS = 2004,
  
  // Combat Errors (3xxx)
  INVALID_TARGET = 3001,
  OUT_OF_RANGE = 3002,
  COOLDOWN_ACTIVE = 3003,
  
  // Server Errors (5xxx)
  INTERNAL_ERROR = 5000,
  DATABASE_ERROR = 5001,
  RPC_ERROR = 5002,
}
```

---

## **📝 Version History**

| Version | Date | Changes | Approved By |
|---------|------|---------|-------------|
| 1.0.0 | [Date] | Initial interface contract | Partner A & B |
| 2.0.0 | [Date] | Added dual-mode system (Blitz/Siege), underdog mechanics, special events | Partner A |
| 2.1.0 | [Date] | Added XP & Progression system, level tracking, XP events | Partner A |
| 3.0.0 | [Date] | Added platform-specific interfaces for web/mobile dual deployment | Partner A |
| 4.0.0 | [Current Date] | **MAJOR UPDATE**: Switched to auto-battle AI system, removed player movement, added power-up marketplace | Partner A |

---

## **✅ Approval Signatures**

**Partner A**: _________________________ Date: _________

**Partner B**: _________________________ Date: _________

---

*This document represents the sacred agreement between partners. Any modifications require mutual consent and version increment.*