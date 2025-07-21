# **AURELIUS SHARED CODE PATTERNS**
*Write Once, Run Everywhere (Via Copy-Paste)*

## **🎯 Philosophy**
Share game logic between web and mobile platforms using a simple copy-paste approach. No monorepo complexity, no dependency hell, just clean TypeScript that works everywhere.

---

## **📁 Shared Code Structure**

```
/shared
├── battleLogic.ts      # Combat calculations
├── gameConstants.ts    # Game configuration
├── types.ts           # TypeScript interfaces
├── utils.ts           # Helper functions
├── solanaClient.ts    # Blockchain abstractions
└── validators.ts      # Input validation
```

---

## **🔧 Core Patterns**

### **1. Platform-Agnostic Types**

```typescript
// shared/types.ts
// These types work on both web and mobile

export interface Position {
  x: number;  // 0-19 grid position
  y: number;  // 0-19 grid position
}

export interface Warrior {
  id: string;
  player: string;
  position: Position;
  hp: number;
  maxHp: number;
  effects: Effect[];
  isAlive: boolean;
  lastUpdate: number;
}

export interface GameState {
  id: string;
  mode: 'blitz' | 'siege';
  phase: GamePhase;
  warriors: Warrior[];
  powerUps: PowerUp[];
  arenaRadius: number;
  timeRemaining: number;
}

// Platform-specific rendering is handled separately
export interface GameRenderer {
  platform: 'web' | 'mobile';
  initialize(container: any): void;
  renderWarrior(warrior: Warrior): void;
  renderPowerUp(powerUp: PowerUp): void;
  cleanup(): void;
}
```

### **2. Pure Game Logic Functions**

```typescript
// shared/battleLogic.ts
// Pure functions with no platform dependencies

export function calculateDamage(
  attacker: Warrior, 
  defender: Warrior,
  gameMode: GameMode
): number {
  let baseDamage = COMBAT_CONFIG.BASE_DAMAGE;
  
  // Apply rage effect
  if (attacker.effects.includes('rage')) {
    baseDamage *= gameMode === 'blitz' ? 2 : 1.5;
  }
  
  // Apply veteran bonus (time-based)
  const survivalTime = Date.now() - attacker.entryTime;
  const veteranBonus = Math.floor(survivalTime / 10000) * 0.01;
  baseDamage *= (1 + veteranBonus);
  
  return Math.round(baseDamage);
}

export function isInAttackRange(
  attacker: Position, 
  target: Position
): boolean {
  const dx = Math.abs(attacker.x - target.x);
  const dy = Math.abs(attacker.y - target.y);
  return dx <= 1 && dy <= 1; // Adjacent cells
}

export function validateMovement(
  currentPos: Position,
  newPos: Position,
  deltaTime: number
): boolean {
  const distance = Math.sqrt(
    Math.pow(newPos.x - currentPos.x, 2) + 
    Math.pow(newPos.y - currentPos.y, 2)
  );
  
  const maxDistance = MOVEMENT_CONFIG.BASE_SPEED * deltaTime / 1000;
  return distance <= maxDistance * 1.1; // 10% tolerance
}

export function checkCollision(
  warrior1: Warrior,
  warrior2: Warrior
): boolean {
  return warrior1.position.x === warrior2.position.x &&
         warrior1.position.y === warrior2.position.y;
}
```

### **3. Game Constants**

```typescript
// shared/gameConstants.ts
// All game balance values in one place

export const GAME_CONFIG = {
  BLITZ: {
    DURATION: 90,          // seconds
    MAX_PLAYERS: 20,
    ENTRY_FEE: 0.002,      // SOL
    ARENA_SIZE: 20,        // grid cells
  },
  SIEGE: {
    DURATION: 300,         // seconds
    MAX_PLAYERS: 100,
    ENTRY_FEE: 0.01,       // SOL
    ARENA_SIZE: 30,
  }
};

export const COMBAT_CONFIG = {
  BASE_DAMAGE: 6,          // MVP fixed damage
  BASE_HP: 100,
  LATE_ENTRY_HP: 70,
  ATTACK_COOLDOWN: 1000,   // ms
  KILL_REWARD_HP: 5,
};

export const MOVEMENT_CONFIG = {
  BASE_SPEED: 5,           // cells per second
  DIAGONAL_MODIFIER: 0.707, // sqrt(2)/2
};

export const POWERUP_CONFIG = {
  HEALTH: {
    VALUE: 25,
    SPAWN_RATE: 10,        // seconds
  },
  RAGE: {
    DURATION: 10,          // seconds
    DAMAGE_MULTIPLIER: 2,
    SPAWN_RATE: 20,
  }
};
```

### **4. Utility Functions**

```typescript
// shared/utils.ts
// Helper functions used by both platforms

export function generateWarriorId(player: string): string {
  return `${player.slice(0, 8)}-${Date.now()}`;
}

export function randomPosition(arenaSize: number): Position {
  return {
    x: Math.floor(Math.random() * arenaSize),
    y: Math.floor(Math.random() * arenaSize)
  };
}

export function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) + 
    Math.pow(pos2.y - pos1.y, 2)
  );
}

export function isInsideArena(
  position: Position, 
  arenaRadius: number
): boolean {
  const center = arenaRadius / 2;
  const distance = calculateDistance(
    position, 
    { x: center, y: center }
  );
  return distance <= arenaRadius / 2;
}

// Time formatting that works everywhere
export function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### **5. Platform Abstraction Layer**

```typescript
// shared/solanaClient.ts
// Abstract blockchain operations

import { PublicKey, Transaction } from '@solana/web3.js';

export interface WalletAdapter {
  platform: 'web' | 'mobile';
  connect(): Promise<PublicKey>;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signMessage?(message: Uint8Array): Promise<Uint8Array>;
  disconnect(): Promise<void>;
}

export interface GameConnection {
  joinGame(gameId: string, wallet: WalletAdapter): Promise<string>;
  getPlayerProfile(wallet: string): Promise<PlayerProfile>;
  claimPrize(gameId: string, wallet: WalletAdapter): Promise<string>;
}

// Shared transaction building (no platform-specific code)
export function buildJoinGameTx(
  gameId: string,
  player: PublicKey,
  entryFee: number
): Transaction {
  // Build transaction that works on both platforms
  const tx = new Transaction();
  // ... add instructions
  return tx;
}
```

---

## **🔄 Sync Workflow**

### **1. Initial Setup**
```bash
# Create folder structure
mkdir -p shared web/lib/shared mobile/lib/shared

# Create sync script in root package.json
{
  "scripts": {
    "sync:shared": "npm run sync:web && npm run sync:mobile",
    "sync:web": "rm -rf web/lib/shared && cp -r shared web/lib/",
    "sync:mobile": "rm -rf mobile/lib/shared && cp -r shared mobile/lib/"
  }
}
```

### **2. Development Flow**
```bash
# 1. Make changes in /shared
cd shared
# Edit battleLogic.ts

# 2. Test shared logic
npm test

# 3. Sync to both platforms
cd ..
npm run sync:shared

# 4. Test on each platform
cd web && npm test
cd ../mobile && npm test

# 5. Commit everything
git add .
git commit -m "[Shared] feat: Update damage calculation"
```

---

## **📱 Platform-Specific Usage**

### **Web Usage (Next.js + Phaser)**
```typescript
// web/src/game/CombatSystem.ts
import { calculateDamage, isInAttackRange } from '../lib/shared/battleLogic';
import { COMBAT_CONFIG } from '../lib/shared/gameConstants';

export class CombatSystem {
  private scene: Phaser.Scene;
  
  processCombat(attacker: Warrior, target: Warrior) {
    if (!isInAttackRange(attacker.position, target.position)) {
      return;
    }
    
    const damage = calculateDamage(attacker, target, 'blitz');
    
    // Web-specific: Phaser animations
    this.scene.tweens.add({
      targets: target.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
    
    // Update HP using shared logic
    target.hp = Math.max(0, target.hp - damage);
  }
}
```

### **Mobile Usage (React Native)**
```typescript
// mobile/src/game/CombatSystem.ts
import { calculateDamage, isInAttackRange } from '../lib/shared/battleLogic';
import { COMBAT_CONFIG } from '../lib/shared/gameConstants';
import { Haptics } from 'expo-haptics';

export class CombatSystem {
  processCombat(attacker: Warrior, target: Warrior) {
    if (!isInAttackRange(attacker.position, target.position)) {
      return;
    }
    
    const damage = calculateDamage(attacker, target, 'blitz');
    
    // Mobile-specific: Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Update HP using shared logic
    target.hp = Math.max(0, target.hp - damage);
  }
}
```

---

## **✅ Best Practices**

### **DO:**
- Keep shared code pure (no side effects)
- Use TypeScript for type safety
- Test shared code independently
- Document platform differences
- Version shared code changes

### **DON'T:**
- Import platform-specific libraries
- Use global variables
- Assume platform capabilities
- Mix rendering with logic
- Forget to sync before testing

---

## **🧪 Testing Shared Code**

```typescript
// shared/__tests__/battleLogic.test.ts
import { calculateDamage, isInAttackRange } from '../battleLogic';

describe('Battle Logic', () => {
  test('calculates base damage correctly', () => {
    const attacker = createMockWarrior({ effects: [] });
    const defender = createMockWarrior();
    
    const damage = calculateDamage(attacker, defender, 'blitz');
    expect(damage).toBe(6); // Base damage
  });
  
  test('applies rage effect', () => {
    const attacker = createMockWarrior({ effects: ['rage'] });
    const defender = createMockWarrior();
    
    const damage = calculateDamage(attacker, defender, 'blitz');
    expect(damage).toBe(12); // 2x for rage in blitz
  });
  
  test('validates attack range', () => {
    expect(isInAttackRange({x: 5, y: 5}, {x: 6, y: 5})).toBe(true);
    expect(isInAttackRange({x: 5, y: 5}, {x: 7, y: 5})).toBe(false);
  });
});
```

---

## **📊 Code Sharing Metrics**

Track shared code effectiveness:
- **Duplication**: < 5% between platforms
- **Bugs**: Fixed once, resolved everywhere
- **Updates**: Single source of truth
- **Testing**: 100% coverage on shared logic
- **Performance**: No platform-specific bottlenecks

---

*This pattern ensures maximum code reuse while maintaining platform independence. Simple, effective, and hackathon-friendly!*