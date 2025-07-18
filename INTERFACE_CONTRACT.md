# **AURELIUS INTERFACE CONTRACT**
*Sacred Agreement Between Partners*

**Version**: 1.0.0  
**Last Updated**: [Current Date]  
**Status**: ACTIVE

---

## **⚠️ SACRED RULES**

1. **This document is the source of truth** for all integration points
2. **Any changes require BOTH partners' approval**
3. **Breaking changes must be versioned**
4. **All data types must match EXACTLY**
5. **Test with mocks before integration**

---

## **🔌 WebSocket Protocol**

### **Connection Handshake**
```typescript
// Client → Server
{
  type: 'connect',
  data: {
    wallet: string,
    signature: string,
    timestamp: number
  }
}

// Server → Client
{
  type: 'connected',
  data: {
    sessionId: string,
    gameState: GameState | null
  }
}
```

### **Game Events**

#### **Game State Update** (Server → Client)
```typescript
{
  type: 'gameStateUpdate',
  data: {
    gameId: string,
    phase: 'waiting' | 'preparation' | 'battle' | 'sudden_death' | 'ended',
    timeRemaining: number,
    warriors: Array<{
      warriorId: string,
      player: string,
      position: { x: number, y: number },
      hp: number,
      maxHp: number,
      effects: Array<'rage' | 'speed' | 'shield'>,
      isAlive: boolean
    }>,
    powerUps: Array<{
      powerUpId: string,
      type: 'health' | 'rage' | 'speed' | 'shield',
      position: { x: number, y: number },
      isActive: boolean
    }>,
    arenaRadius: number // For shrinking arena
  }
}
```

#### **Warrior Spawned** (Server → Client)
```typescript
{
  type: 'warriorSpawned',
  data: {
    warriorId: string,
    player: string,
    position: { x: number, y: number },
    hp: 100,
    timestamp: number
  }
}
```

#### **Warrior Movement** (Bidirectional)
```typescript
// Client → Server (Request)
{
  type: 'moveWarrior',
  data: {
    direction: { x: -1 | 0 | 1, y: -1 | 0 | 1 },
    timestamp: number
  }
}

// Server → Client (Broadcast)
{
  type: 'warriorMoved',
  data: {
    warriorId: string,
    oldPosition: { x: number, y: number },
    newPosition: { x: number, y: number },
    timestamp: number
  }
}
```

#### **Combat Events** (Server → Client)
```typescript
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
```

#### **Power-Up Events** (Server → Client)
```typescript
// Spawn
{
  type: 'powerUpSpawned',
  data: {
    powerUpId: string,
    type: 'health' | 'rage' | 'speed' | 'shield',
    position: { x: number, y: number },
    spawnTime: number
  }
}

// Collection
{
  type: 'powerUpCollected',
  data: {
    powerUpId: string,
    warriorId: string,
    effect: {
      type: string,
      duration?: number,
      value?: number
    }
  }
}
```

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
    winner: string,
    endType: 'last_standing' | 'time_limit' | 'force_end',
    finalPot: number,
    participants: Array<{
      player: string,
      placement: number,
      survivalTime: number,
      eliminations: number
    }>,
    vrfProof?: string
  }
}
```

---

## **📡 HTTP API Endpoints**

### **Game Info**
```typescript
GET /api/game/current
Response: {
  gameId: string | null,
  status: 'waiting' | 'active' | 'ended',
  playerCount: number,
  potSize: number,
  timeRemaining?: number
}

GET /api/game/:gameId
Response: {
  gameId: string,
  startTime: number,
  endTime?: number,
  winner?: string,
  participants: string[],
  finalPot: number
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
  currentStreak: number
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
    position: Position
) -> Result<()>

pub struct Position {
    x: u8,  // 0-19
    y: u8,  // 0-19
}
```

#### **end_game**
```rust
pub fn end_game(
    ctx: Context<EndGame>,
    winner: Pubkey,
    vrf_proof: Option<String>
) -> Result<()>
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
    pub game_id: Pubkey,       // 32 bytes
    pub total_pot: u64,        // 8 bytes
    pub player_count: u8,      // 1 byte
    pub is_active: bool,       // 1 byte
    pub winner: Option<Pubkey>, // 33 bytes (1 + 32)
    pub start_time: i64,       // 8 bytes
    pub end_time: Option<i64>, // 9 bytes (1 + 8)
}
// Total: 92 bytes
```

---

## **🎮 Phaser Game Constants**

```typescript
// Arena Configuration
export const ARENA_CONFIG = {
  GRID_SIZE: 20,
  CELL_SIZE: 30, // pixels
  ARENA_DIAMETER: 600, // pixels
  SHRINK_START_TIME: 90, // seconds
  SHRINK_PERCENTAGE: 0.2,
  DANGER_ZONE_DAMAGE: 2,
}

// Warrior Configuration  
export const WARRIOR_CONFIG = {
  BASE_HP: 100,
  BASE_SPEED: 100, // pixels per second
  BASE_DAMAGE: [5, 8], // min-max
  ATTACK_RANGE: 1, // grid cells
  ATTACK_COOLDOWN: 1000, // ms
}

// Power-up Configuration
export const POWERUP_CONFIG = {
  HEALTH: { value: 25, spawnRate: 15 },
  RAGE: { duration: 10, multiplier: 2, spawnRate: 30 },
  SPEED: { duration: 8, multiplier: 1.5, spawnRate: 20 },
  SHIELD: { charges: 2, spawnRate: 60 },
}

// Game Phases
export const GAME_PHASES = {
  WAITING: { duration: null },
  PREPARATION: { duration: 10 },
  BATTLE: { duration: 80 },
  SUDDEN_DEATH: { duration: 30 },
  ENDED: { duration: null },
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

---

## **✅ Approval Signatures**

**Partner A**: _________________________ Date: _________

**Partner B**: _________________________ Date: _________

---

*This document represents the sacred agreement between partners. Any modifications require mutual consent and version increment.*