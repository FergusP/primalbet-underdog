# **AURELIUS COLOSSEUM SERVER ARCHITECTURE**
*Backend for Monster Combat Jackpot System*

<!-- MVP:SUMMARY -->
## **🚀 MVP Server Features (MONSTER COMBAT)**
For the 2-3 day MVP, implement:
- **Node.js + Express**: REST API for game actions
- **Monster Management**: Spawn based on jackpot size
- **Combat Resolution**: ProofNetwork VRF integration
- **Vault Crack System**: Chance-based jackpot wins
- **Real-time Updates**: Combat events and jackpot tracking
- **Solana Integration**: Verify entries and payouts

Skip for MVP: Databases, XP system, achievements
<!-- MVP:END -->

## **🏗️ Monster Combat Architecture**

```
┌─────────────────────┐
│   Web Frontend      │
│  (Next.js/Phaser)   │
└──────────┬──────────┘
           │ HTTP Requests
           ▼
┌─────────────────────┐
│   Backend Service   │
│   (Node.js/Express) │
│                     │
│  Features:          │
│  - Monster spawning │
│  - Combat VRF       │
│  - Vault crack logic│
│  - Jackpot tracking │
│  - ProofNetwork API │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Solana Blockchain  │
│  - Entry payments   │
│  - Combat results   │
│  - Jackpot payouts  │
└─────────────────────┘

Simple REST API with ProofNetwork VRF
No complex state management needed
```

---

## **📁 Server Structure**

<!-- MVP:START -->
```
backend/
├── src/
│   ├── index.ts                 # Server entry point
│   ├── config.ts               # Environment config
│   ├── combat/
│   │   ├── MonsterManager.ts   # Monster spawning logic
│   │   ├── CombatResolver.ts   # VRF combat resolution
│   │   ├── VaultCracker.ts     # Jackpot attempt logic
│   │   └── CombatHandler.ts    # Combat flow orchestration
│   ├── api/
│   │   ├── routes.ts           # REST endpoints
│   │   ├── combatHandler.ts    # Combat request handler
│   │   └── stateHandler.ts     # Game state queries
│   ├── services/
│   │   ├── ProofNetworkVRF.ts  # VRF integration
│   │   └── SolanaService.ts    # Blockchain verification
│   └── utils/
│       └── constants.ts        # Monster tiers, chances
├── package.json
└── .env
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
```
Additional files for full version:
│   ├── config/
│   │   └── database.ts         # PostgreSQL setup
│   ├── game/
│   │   ├── BlitzGame.ts        # Blitz mode specifics
│   │   ├── SiegeGame.ts        # Siege mode specifics
│   ├── websocket/
│   │   ├── ClientManager.ts    # Client connections
│   │   └── MessageValidator.ts # Input validation
│   ├── blockchain/
│   │   ├── GameSettlement.ts   # Result submission
│   │   └── WalletAuth.ts       # Wallet verification
│   ├── services/
│   │   ├── ProofNetworkVRF.ts  # Randomness service
│   │   ├── MatchmakingService.ts # Game creation
│   │   ├── AntiCheatService.ts # Security layer
│   │   └── MetricsService.ts   # Performance tracking
│   └── utils/
│       └── errors.ts           # Error handling
├── tests/
├── scripts/
```
<!-- POST-MVP:END -->

---

## **🎮 Core Game Server Implementation**

<!-- MVP:START -->
### **1. Server Entry Point**

```typescript
// src/index.ts - MONSTER COMBAT VERSION
import express from 'express';
import cors from 'cors';
import { MonsterManager } from './combat/MonsterManager';
import { CombatHandler } from './combat/CombatHandler';
import { ProofNetworkVRF } from './services/ProofNetworkVRF';
import { SolanaService } from './services/SolanaService';
import { setupRoutes } from './api/routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const vrfService = new ProofNetworkVRF();
const solanaService = new SolanaService();
const monsterManager = new MonsterManager();
const combatHandler = new CombatHandler(
  monsterManager,
  vrfService,
  solanaService
);

// Setup API routes
setupRoutes(app, combatHandler, monsterManager);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Aurelius Colosseum backend running on port ${PORT}`);
  
  // Initialize current monster based on jackpot
  monsterManager.initializeMonster();
});
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
```typescript
// Full version with Fastify and Redis cluster
import Fastify from 'fastify';
import socketIO from 'socket.io';
import Redis from 'ioredis';
import { GameManager } from './game/GameManager';
import { SocketManager } from './websocket/SocketManager';
import { SolanaService } from './blockchain/SolanaService';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production'
  }
});

// Initialize Redis with cluster support
const redis = new Redis.Cluster([
  { port: 6379, host: process.env.REDIS_HOST_1 },
  { port: 6379, host: process.env.REDIS_HOST_2 },
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD
  }
});

// Initialize core services
const solanaService = new SolanaService();
const gameManager = new GameManager(redis, solanaService);
const socketManager = new SocketManager(server.server, gameManager);

// Health check endpoint
server.get('/health', async () => ({
  status: 'healthy',
  timestamp: Date.now(),
  activeGames: gameManager.getActiveGameCount(),
  connectedPlayers: socketManager.getConnectedCount()
}));

// Start server
const start = async () => {
  try {
    await server.listen({ 
      port: process.env.PORT || 3000,
      host: '0.0.0.0'
    });
    
    console.log(`Server running on port ${process.env.PORT}`);
    
    // Start game loops
    gameManager.startGameLoops();
    
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```
<!-- POST-MVP:END -->

<!-- MVP:START -->
### **2. Monster Manager**

```typescript
// src/combat/MonsterManager.ts - MONSTER SPAWNING
import { Monster, MonsterTier, MONSTER_TIERS } from '../utils/constants';

export class MonsterManager {
  private currentMonster: Monster | null = null;
  private monsterHistory: Monster[] = [];
  
  async initializeMonster(): Promise<void> {
    // Get current jackpot from blockchain
    const jackpotAmount = await this.getJackpotAmount();
    this.spawnMonster(jackpotAmount);
  }
  
  spawnMonster(jackpotAmount: number): Monster {
    const tier = this.getMonsterTier(jackpotAmount);
    
    const monster: Monster = {
      id: Date.now().toString(),
      type: tier.name,
      tier: tier,
      baseHealth: tier.baseHealth,
      currentHealth: tier.baseHealth,
      spawnedAt: Date.now(),
      defeatedBy: null,
      totalCombats: 0,
      victories: 0
    };
    
    this.currentMonster = monster;
    this.monsterHistory.push(monster);
    
    console.log(`Spawned ${tier.name} for ${jackpotAmount} SOL jackpot`);
    return monster;
  }
  
  private getMonsterTier(poolAmount: number): MonsterTier {
    // Find appropriate tier based on pool size (in SOL)
    const poolInSol = poolAmount / 1e9;
    
    for (const tier of MONSTER_TIERS) {
      if (poolInSol >= tier.poolRange[0] && poolInSol < tier.poolRange[1]) {
        return tier;
      }
    }
    
    // Return highest tier if pool exceeds all ranges
    return MONSTER_TIERS[MONSTER_TIERS.length - 1];
  }
  
  getCurrentMonster(): Monster | null {
    return this.currentMonster;
  }
  
  recordCombat(gladiator: string, victory: boolean): void {
    if (!this.currentMonster) return;
    
    this.currentMonster.totalCombats++;
    if (!victory) {
      this.currentMonster.victories++;
    } else {
      this.currentMonster.defeatedBy = gladiator;
    }
  }
  
  private async getJackpotAmount(): Promise<number> {
    // TODO: Get from blockchain
    return 0;
  }
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
```typescript
// Full version with dual modes and XP
// src/game/GameManager.ts
import { Redis } from 'ioredis';
import { BlitzGame } from './BlitzGame';
import { SiegeGame } from './SiegeGame';
import { v4 as uuidv4 } from 'uuid';

export class GameManager {
  private activeGames: Map<string, GameInstance> = new Map();
  private blitzQueue: Set<string> = new Set();
  private siegeSchedule: Map<number, string> = new Map();
  private xpCalculator: XPCalculator;
  
  constructor(
    private redis: Redis,
    private solanaService: SolanaService
  ) {
    this.xpCalculator = new XPCalculator();
  }
  
  async createGame(mode: GameMode): Promise<GameInstance> {
    const gameId = uuidv4();
    
    // Create on-chain game escrow
    const escrowAddress = await this.solanaService.createGameEscrow(
      gameId,
      mode
    );
    
    // Create game instance
    const game = mode === GameMode.Blitz
      ? new BlitzGame(gameId, escrowAddress, this.redis)
      : new SiegeGame(gameId, escrowAddress, this.redis);
    
    this.activeGames.set(gameId, game);
    
    // Store in Redis with expiry
    await this.redis.setex(
      `game:${gameId}`,
      3600, // 1 hour expiry
      JSON.stringify(game.getState())
    );
    
    return game;
  }
  
  async joinGame(
    gameId: string,
    playerId: string,
    warriorCount: number
  ): Promise<JoinResult> {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    
    // Verify on-chain payment
    const txSignature = await this.solanaService.verifyGameEntry(
      gameId,
      playerId,
      warriorCount
    );
    
    // Add warriors to game
    const warriors = [];
    for (let i = 0; i < warriorCount; i++) {
      const warrior = game.addWarrior(playerId, i);
      warriors.push(warrior);
    }
    
    // Update Redis
    await this.updateGameState(gameId, game);
    
    return { warriors, txSignature };
  }
  
  startGameLoops(): void {
    // Blitz mode - continuous games
    setInterval(() => this.processBlitzQueue(), 5000);
    
    // Siege mode - scheduled games
    setInterval(() => this.processSiegeSchedule(), 60000);
    
    // Game update loop - 60 FPS
    setInterval(() => this.updateAllGames(), 16.67);
    
    // Cleanup finished games
    setInterval(() => this.cleanupGames(), 30000);
  }
  
  private async updateAllGames(): Promise<void> {
    const updates = [];
    
    for (const [gameId, game] of this.activeGames) {
      if (game.isActive()) {
        game.update(Date.now());
        updates.push(this.updateGameState(gameId, game));
      }
    }
    
    await Promise.all(updates);
  }
  
  private async updateGameState(
    gameId: string, 
    game: GameInstance
  ): Promise<void> {
    const state = game.getState();
    
    // Update Redis
    await this.redis.setex(
      `game:${gameId}`,
      300, // 5 min expiry for active games
      JSON.stringify(state)
    );
    
    // Broadcast to connected clients
    this.emit('gameStateUpdate', { gameId, state });
  }
}
```
<!-- POST-MVP:END -->

<!-- MVP:START -->
### **3. Input Processing System**

```typescript
// src/game/InputProcessor.ts - CONVERT INPUTS TO WEIGHTS
export class InputProcessor {
  processPlayerInput(input: PlayerInput): ProcessedInput {
    const timestamp = Date.now();
    
    return {
      playerId: input.wallet,
      inputType: input.type,
      timestamp,
      data: input.data,
      // Calculate immediate weight factors
      weightFactors: this.calculateWeightFactors(input, timestamp)
    };
  }
  
  private calculateWeightFactors(input: PlayerInput, timestamp: number) {
    switch (input.type) {
      case 'JOIN_GAME':
        return {
          entryTiming: this.calculateEntryBonus(timestamp),
          positionValue: this.evaluatePosition(input.data.position)
        };
        
      case 'ACTIVATE_POWERUP':
        return {
          efficiency: this.calculateEfficiency(input, timestamp),
          combo: this.checkCombo(input.wallet, timestamp)
        };
        
      case 'FORM_ALLIANCE':
        return {
          cooperation: 50,
          trustBonus: 20
        };
        
      case 'BETRAY_ALLIANCE':
        return {
          betrayalPenalty: -100,
          riskTaker: 30
        };
    }
  }
}


interface CombatResult {
  combatId: string;
  gladiator: string;
  monster: string;
  gladiatorPower: number;
  gladiatorScore: number;
  monsterScore: number;
  victory: boolean;
  vrfProof: string;
  timestamp: number;
}
```

### **3. Combat Resolver**

```typescript
// src/combat/CombatResolver.ts - VRF COMBAT RESOLUTION
import { ProofNetworkVRF } from '../services/ProofNetworkVRF';
import { Monster } from '../utils/constants';

export class CombatResolver {
  constructor(private vrfService: ProofNetworkVRF) {}
  
  async resolveCombat(
    gladiator: string,
    entryAmount: number,
    monster: Monster,
    combatId: string
  ): Promise<CombatResult> {
    // 1. Calculate gladiator power (linear scaling)
    const gladiatorPower = this.calculateGladiatorPower(entryAmount);
    
    // 2. Get VRF random values
    const vrfResult = await this.vrfService.requestRandomness({
      seed: `combat_${combatId}`,
      numValues: 2 // One for gladiator, one for monster
    });
    
    // 3. Calculate combat scores
    const gladiatorRoll = vrfResult.values[0] % 100; // 0-99
    const monsterRoll = vrfResult.values[1] % 100;   // 0-99
    
    const gladiatorScore = gladiatorPower * (50 + gladiatorRoll) / 100;
    const monsterScore = monster.baseHealth * 
                        monster.tier.defenseMultiplier * 
                        (50 + monsterRoll) / 100;
    
    // 4. Determine outcome
    const victory = gladiatorScore > monsterScore;
    
    console.log(`Combat: G(${gladiatorScore.toFixed(0)}) vs M(${monsterScore.toFixed(0)}) = ${victory ? 'WIN' : 'LOSE'}`);
    
    return {
      combatId,
      gladiator,
      monster: monster.type,
      gladiatorPower,
      gladiatorScore: Math.floor(gladiatorScore),
      monsterScore: Math.floor(monsterScore),
      victory,
      vrfProof: vrfResult.proof,
      timestamp: Date.now()
    };
  }
  
  private calculateGladiatorPower(entryAmount: number): number {
    // Linear scaling - no whale advantage
    const BASE_POWER_MULTIPLIER = 1000;
    return entryAmount * BASE_POWER_MULTIPLIER;
  }
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
### **3. Game Instance Base Class (Full Version)**

```typescript
// Full abstract class with XP and dual mode support
export abstract class GameInstance {
  protected warriors: Map<string, Warrior> = new Map();
  protected arena: Arena;
  protected powerUpSystem: PowerUpSystem;
  protected combatEngine: CombatEngine;
  protected startTime?: number;
  protected endTime?: number;
  protected phase: GamePhase = GamePhase.Waiting;
  
  constructor(
    public readonly id: string,
    public readonly escrowAddress: string,
    public readonly mode: GameMode
  ) {
    this.arena = new Arena(mode);
    this.powerUpSystem = new PowerUpSystem(mode);
    this.combatEngine = new CombatEngine();
  }
  
  abstract update(currentTime: number): void;
  abstract canJoin(playerId: string): boolean;
  abstract getWinners(): WinnerInfo[];
  
  addWarrior(playerId: string, index: number): Warrior {
    const warriorId = `${playerId}-${index}`;
    
    // Calculate spawn position based on entry time
    const position = this.arena.getSpawnPosition(
      this.warriors.size,
      this.isLateEntry()
    );
    
    // Create warrior with appropriate HP
    const warrior = new Warrior({
      id: warriorId,
      playerId,
      position,
      hp: this.isLateEntry() ? 70 : 100,
      maxHp: 100,
      entryTime: Date.now()
    });
    
    this.warriors.set(warriorId, warrior);
    return warrior;
  }
  
  protected updateCombat(deltaTime: number): void {
    // Process all warrior attacks
    for (const attacker of this.warriors.values()) {
      if (!attacker.isAlive() || attacker.isOnCooldown()) continue;
      
      const target = this.combatEngine.findTarget(
        attacker,
        Array.from(this.warriors.values())
      );
      
      if (target) {
        const damage = this.combatEngine.calculateDamage(attacker);
        target.takeDamage(damage);
        attacker.setAttackCooldown();
        
        // Check for elimination
        if (!target.isAlive()) {
          this.handleElimination(attacker, target);
        }
      }
    }
  }
  
  protected handleElimination(killer: Warrior, victim: Warrior): void {
    // Killer gets HP reward
    killer.heal(5);
    killer.incrementEliminations();
    
    // Update streaks
    const killerPlayer = this.getPlayerStats(killer.playerId);
    killerPlayer.currentStreak++;
    
    const victimPlayer = this.getPlayerStats(victim.playerId);
    victimPlayer.currentStreak = 0;
    
    // Remove victim
    this.warriors.delete(victim.id);
    
    // Emit event
    this.emit('warriorEliminated', {
      victim: victim.id,
      killer: killer.id,
      finalStats: victim.getFinalStats()
    });
  }
  
  protected applyEnvironmentalDamage(deltaTime: number): void {
    const damageRate = this.mode === GameMode.Blitz ? 3000 : 5000; // ms
    const damageAmount = this.mode === GameMode.Blitz ? 2 : 1;
    
    if (Date.now() % damageRate < deltaTime) {
      for (const warrior of this.warriors.values()) {
        warrior.takeDamage(damageAmount);
      }
    }
  }
  
  getState(): GameState {
    return {
      id: this.id,
      mode: this.mode,
      phase: this.phase,
      warriors: Array.from(this.warriors.values()).map(w => w.serialize()),
      powerUps: this.powerUpSystem.getActivePowerUps(),
      arena: this.arena.getState(),
      startTime: this.startTime,
      timeRemaining: this.getTimeRemaining()
    };
  }
  
  async endGame(): Promise<void> {
    this.phase = GamePhase.Ended;
    this.endTime = Date.now();
    
    // Get final placements
    const winners = this.getWinners();
    const allWarriors = this.getAllWarriorStats();
    
    // Calculate XP for all participants
    const xpResults = await this.calculateAllXP(allWarriors, winners);
    
    // Submit results to blockchain
    await this.submitGameResults(winners, xpResults);
    
    // Emit game ended event
    this.emit('gameEnded', {
      gameId: this.id,
      gameMode: this.mode,
      winners,
      xpGained: xpResults,
      finalPot: this.getTotalPot()
    });
  }
  
  private async calculateAllXP(
    warriors: WarriorStats[],
    winners: WinnerInfo[]
  ): Promise<XPResult[]> {
    const xpResults = [];
    
    for (const warrior of warriors) {
      // Determine placement
      const placement = winners.findIndex(w => w.playerId === warrior.playerId) + 1;
      
      // Calculate XP using XPCalculator
      const xpResult = this.gameManager.xpCalculator.calculateWarriorXP(
        warrior,
        this.mode,
        placement || warriors.length // If not in winners, last place
      );
      
      xpResults.push({
        player: warrior.playerId,
        ...xpResult
      });
    }
    
    return xpResults;
  }
}
```
<!-- POST-MVP:END -->

<!-- POST-MVP:PHASE2 -->
### **4. Blitz Mode Implementation**

```typescript
// src/game/BlitzGame.ts - NOT NEEDED FOR MVP
export class BlitzGame extends GameInstance {
  private static readonly DURATION = 90000; // 90 seconds
  private static readonly SHRINK_TIME = 45000; // 45 seconds
  
  update(currentTime: number): void {
    if (!this.startTime) return;
    
    const elapsed = currentTime - this.startTime;
    const deltaTime = 16.67; // 60 FPS
    
    // Check phase transitions
    if (elapsed >= BlitzGame.DURATION) {
      this.endGame();
      return;
    }
    
    // Arena shrinking
    if (elapsed >= BlitzGame.SHRINK_TIME && !this.arena.isShrinking()) {
      this.arena.startShrinking(0.5); // 50% reduction
    }
    
    // Update systems
    this.updateWarriorMovement(deltaTime);
    this.updateCombat(deltaTime);
    this.powerUpSystem.update(currentTime);
    this.applyEnvironmentalDamage(deltaTime);
    
    // Check power-up collisions
    this.checkPowerUpCollections();
    
    // Check for instant win
    if (this.getAliveWarriors().length === 1) {
      this.endGame();
    }
  }
  
  canJoin(playerId: string): boolean {
    // Blitz allows joining until game starts
    return this.phase === GamePhase.Waiting && 
           this.warriors.size < 20;
  }
  
  getWinners(): WinnerInfo[] {
    const alive = this.getAliveWarriors();
    
    if (alive.length === 1) {
      return [{
        playerId: alive[0].playerId,
        placement: 1,
        sharePercentage: 95 // Platform takes 3%, burn 2%
      }];
    }
    
    // Highest HP wins
    const sorted = alive.sort((a, b) => b.hp - a.hp);
    return [{
      playerId: sorted[0].playerId,
      placement: 1,
      sharePercentage: 95
    }];
  }
  
  private checkPowerUpCollections(): void {
    for (const warrior of this.warriors.values()) {
      if (!warrior.isAlive()) continue;
      
      const powerUp = this.powerUpSystem.checkCollection(
        warrior.position
      );
      
      if (powerUp) {
        this.applyPowerUp(warrior, powerUp);
      }
    }
  }
}
```
<!-- POST-MVP:END -->

<!-- MVP:START -->
### **4. Vault Cracker**

```typescript
// src/combat/VaultCracker.ts - JACKPOT ATTEMPT SYSTEM
import { ProofNetworkVRF } from '../services/ProofNetworkVRF';
import { Monster } from '../utils/constants';

export class VaultCracker {
  constructor(private vrfService: ProofNetworkVRF) {}
  
  async attemptVaultCrack(
    gladiator: string,
    monster: Monster,
    combatId: string
  ): Promise<VaultCrackResult> {
    // Get crack chance from monster tier
    const crackChance = monster.tier.vaultCrackChance;
    
    // Request VRF for vault crack
    const vrfResult = await this.vrfService.requestRandomness({
      seed: `vault_${combatId}`,
      numValues: 1
    });
    
    const roll = vrfResult.values[0] % 100; // 0-99
    const success = roll < crackChance;
    
    console.log(`Vault crack attempt: ${roll} < ${crackChance} = ${success}`);
    
    return {
      gladiator,
      monster: monster.type,
      crackChance,
      roll,
      success,
      vrfProof: vrfResult.proof,
      timestamp: Date.now()
    };
  }
}

interface VaultCrackResult {
  gladiator: string;
  monster: string;
  crackChance: number;
  roll: number;
  success: boolean;
  vrfProof: string;
  timestamp: number;
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
### **5. Combat Engine (Full Version)**

```typescript
// Full version with VRF and modifiers
import { ProofNetworkVRF } from '../services/ProofNetworkVRF';

export class CombatEngine {
  constructor(private vrf: ProofNetworkVRF) {}
  
  findTarget(attacker: Warrior, allWarriors: Warrior[]): Warrior | null {
    const inRange = allWarriors.filter(w => 
      w.id !== attacker.id &&
      w.isAlive() &&
      this.isInRange(attacker.position, w.position)
    );
    
    if (inRange.length === 0) return null;
    
    // Priority: Lowest HP
    const byHP = inRange.sort((a, b) => a.hp - b.hp);
    const lowestHP = byHP[0].hp;
    const targets = byHP.filter(w => w.hp === lowestHP);
    
    // If multiple with same HP, use VRF
    if (targets.length > 1) {
      const index = await this.vrf.selectIndex(targets.length);
      return targets[index];
    }
    
    return targets[0];
  }
  
  async calculateDamage(attacker: Warrior): Promise<number> {
    // Base damage with VRF
    const baseDamage = await this.vrf.randomRange(5, 8);
    
    // Apply modifiers
    let damage = baseDamage;
    
    // Veteran bonus
    const survivalTime = Date.now() - attacker.entryTime;
    const veteranBonus = Math.floor(survivalTime / 10000) * 0.01; // 1% per 10s
    damage *= (1 + veteranBonus);
    
    // Rage mode
    if (attacker.hasEffect('rage')) {
      damage *= attacker.mode === GameMode.Blitz ? 2 : 1.5;
    }
    
    // Underdog bonus
    if (attacker.isUnderdog) {
      damage *= 1.1;
    }
    
    return Math.round(damage);
  }
  
  private isInRange(pos1: Position, pos2: Position): boolean {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1; // Adjacent cells
  }
}
```
<!-- POST-MVP:END -->

<!-- MVP:START -->
### **5. Combat Handler**

```typescript
// src/combat/CombatHandler.ts - ORCHESTRATE COMBAT FLOW
import { MonsterManager } from './MonsterManager';
import { CombatResolver } from './CombatResolver';
import { VaultCracker } from './VaultCracker';
import { ProofNetworkVRF } from '../services/ProofNetworkVRF';
import { SolanaService } from '../services/SolanaService';

export class CombatHandler {
  private combatResolver: CombatResolver;
  private vaultCracker: VaultCracker;
  
  constructor(
    private monsterManager: MonsterManager,
    private vrfService: ProofNetworkVRF,
    private solanaService: SolanaService
  ) {
    this.combatResolver = new CombatResolver(vrfService);
    this.vaultCracker = new VaultCracker(vrfService);
  }
  
  async handleCombatRequest(request: CombatRequest): Promise<CombatResponse> {
    const monster = this.monsterManager.getCurrentMonster();
    if (!monster) throw new Error('No active monster');
    
    // 1. Verify entry payment on-chain
    const payment = await this.solanaService.verifyPayment(
      request.wallet,
      request.txSignature,
      monster.tier.entryFee
    );
    
    // 2. Resolve combat
    const combatResult = await this.combatResolver.resolveCombat(
      request.wallet,
      payment.amount,
      monster,
      request.combatId
    );
    
    // 3. Record combat
    this.monsterManager.recordCombat(request.wallet, combatResult.victory);
    
    // 4. Handle victory
    let vaultResult = null;
    if (combatResult.victory && request.attemptVault) {
      vaultResult = await this.vaultCracker.attemptVaultCrack(
        request.wallet,
        monster,
        request.combatId
      );
      
      if (vaultResult.success) {
        // Process jackpot win
        await this.processJackpotWin(request.wallet, vaultResult);
        
        // Spawn new monster
        const newJackpot = await this.solanaService.getJackpotAmount();
        this.monsterManager.spawnMonster(newJackpot);
      }
    }
    
    // 5. Submit results to blockchain
    await this.solanaService.submitCombatResult(
      combatResult,
      vaultResult
    );
    
    return {
      combatResult,
      vaultResult,
      newMonster: this.monsterManager.getCurrentMonster()
    };
  }
  
  private async processJackpotWin(
    winner: string,
    vaultResult: VaultCrackResult
  ): Promise<void> {
    console.log(`JACKPOT WON! ${winner} cracked the vault!`);
    // Blockchain will handle the actual payout
  }
}

interface CombatRequest {
  wallet: string;
  txSignature: string;
  combatId: string;
  attemptVault: boolean;
}

interface CombatResponse {
  combatResult: any;
  vaultResult: any | null;
  newMonster: any;
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
### **6. WebSocket Handler (Full Version)**

```typescript
// Full version with validation and security
import { Server } from 'socket.io';
import { verifyWallet } from '../blockchain/WalletAuth';
import { MessageValidator } from './MessageValidator';

export class SocketManager {
  private io: Server;
  private clients: Map<string, ClientInfo> = new Map();
  private validator: MessageValidator;
  
  constructor(httpServer: any, private gameManager: GameManager) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    this.validator = new MessageValidator();
    this.setupHandlers();
  }
  
  private setupHandlers(): void {
    this.io.on('connection', async (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Require authentication
      socket.on('auth', async (data) => {
        try {
          const { wallet, signature, timestamp } = data;
          
          // Verify wallet signature
          const isValid = await verifyWallet(wallet, signature, timestamp);
          if (!isValid) {
            socket.emit('error', { code: 'AUTH_FAILED' });
            socket.disconnect();
            return;
          }
          
          // Store client info
          this.clients.set(socket.id, {
            wallet,
            socketId: socket.id,
            connectedAt: Date.now()
          });
          
          socket.emit('authenticated', { wallet });
          
        } catch (error) {
          socket.emit('error', { code: 'AUTH_ERROR' });
          socket.disconnect();
        }
      });
      
      // Game events
      socket.on('joinGame', async (data) => {
        try {
          const validated = this.validator.validateJoinGame(data);
          const client = this.clients.get(socket.id);
          
          if (!client) {
            socket.emit('error', { code: 'NOT_AUTHENTICATED' });
            return;
          }
          
          const result = await this.gameManager.joinGame(
            validated.gameId,
            client.wallet,
            validated.warriorCount
          );
          
          // Join game room
          socket.join(`game:${validated.gameId}`);
          
          socket.emit('joinedGame', result);
          
        } catch (error) {
          socket.emit('error', { 
            code: 'JOIN_FAILED',
            message: error.message 
          });
        }
      });
      
      socket.on('moveWarrior', async (data) => {
        try {
          const validated = this.validator.validateMove(data);
          const client = this.clients.get(socket.id);
          
          if (!client) return;
          
          // Process movement
          await this.gameManager.processMove(
            validated.gameId,
            client.wallet,
            validated.warriorId,
            validated.direction
          );
          
        } catch (error) {
          socket.emit('error', { code: 'INVALID_MOVE' });
        }
      });
      
      socket.on('disconnect', () => {
        this.clients.delete(socket.id);
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
  
  broadcastToGame(gameId: string, event: string, data: any): void {
    this.io.to(`game:${gameId}`).emit(event, data);
  }
  
  getConnectedCount(): number {
    return this.clients.size;
  }
}
```
<!-- POST-MVP:END -->

<!-- POST-MVP:PHASE2 -->
### **7. Anti-Cheat Service**

```typescript
// src/services/AntiCheatService.ts - NOT IN MVP
export class AntiCheatService {
  private moveHistory: Map<string, MoveRecord[]> = new Map();
  private suspiciousActivity: Map<string, number> = new Map();
  
  validateMovement(
    warriorId: string,
    oldPos: Position,
    newPos: Position,
    timestamp: number
  ): ValidationResult {
    // Get movement history
    const history = this.moveHistory.get(warriorId) || [];
    const lastMove = history[history.length - 1];
    
    // Check speed
    if (lastMove) {
      const timeDelta = timestamp - lastMove.timestamp;
      const distance = this.calculateDistance(oldPos, newPos);
      const speed = distance / (timeDelta / 1000);
      
      if (speed > MAX_SPEED * 1.1) { // 10% tolerance
        this.flagSuspicious(warriorId, 'SPEED_HACK');
        return { valid: false, reason: 'Movement too fast' };
      }
    }
    
    // Check teleportation
    const distance = this.calculateDistance(oldPos, newPos);
    if (distance > 2) { // Max 2 cells per move
      this.flagSuspicious(warriorId, 'TELEPORT');
      return { valid: false, reason: 'Teleportation detected' };
    }
    
    // Update history
    history.push({ position: newPos, timestamp });
    if (history.length > 100) history.shift();
    this.moveHistory.set(warriorId, history);
    
    return { valid: true };
  }
  
  validateDamage(
    attackerId: string,
    damage: number,
    expectedRange: [number, number]
  ): boolean {
    if (damage < expectedRange[0] || damage > expectedRange[1]) {
      this.flagSuspicious(attackerId, 'DAMAGE_HACK');
      return false;
    }
    return true;
  }
  
  private flagSuspicious(playerId: string, reason: string): void {
    const count = (this.suspiciousActivity.get(playerId) || 0) + 1;
    this.suspiciousActivity.set(playerId, count);
    
    console.warn(`Suspicious activity: ${playerId} - ${reason} (count: ${count})`);
    
    // Auto-ban after threshold
    if (count >= 5) {
      this.banPlayer(playerId);
    }
  }
  
  private banPlayer(playerId: string): void {
    // Implement ban logic
    console.error(`Player banned: ${playerId}`);
  }
}
```

### **8. XP Calculation Service**

```typescript
// src/services/XPCalculator.ts - NOT IN MVP
export class XPCalculator {
  // XP reward constants
  private readonly XP_REWARDS = {
    BASE_PARTICIPATION: 10,
    PER_MINUTE_SURVIVED: 10,
    PER_ELIMINATION: 25,
    DAMAGE_DEALT_RATIO: 0.1, // 1 XP per 10 damage
    POWER_UP_COLLECTED: 5,
    TERRITORY_CONTROLLED: 15, // Per zone per minute
    
    // Victory bonuses
    BLITZ_WINNER: 100,
    SIEGE_1ST: 150,
    SIEGE_2ND: 75,
    SIEGE_3RD: 50,
    
    // Special bonuses
    UNDERDOG_MULTIPLIER: 2,
    GODSLAYER_KILL: 50,
    SPECIAL_EVENT_SURVIVAL: 20,
    FIRST_BLOOD: 15,
    COMEBACK_VICTORY: 30
  };
  
  calculateWarriorXP(
    warrior: WarriorStats,
    gameMode: GameMode,
    placement: number
  ): XPResult {
    let baseXP = this.XP_REWARDS.BASE_PARTICIPATION;
    let bonusXP = 0;
    const breakdown: XPBreakdown = {};
    
    // Survival time
    const minutesSurvived = Math.floor(warrior.survivalTime / 60000);
    const survivalXP = minutesSurvived * this.XP_REWARDS.PER_MINUTE_SURVIVED;
    baseXP += survivalXP;
    breakdown.survival = survivalXP;
    
    // Combat XP
    const eliminationXP = warrior.eliminations * this.XP_REWARDS.PER_ELIMINATION;
    const damageXP = Math.floor(warrior.damageDealt * this.XP_REWARDS.DAMAGE_DEALT_RATIO);
    baseXP += eliminationXP + damageXP;
    breakdown.combat = eliminationXP + damageXP;
    
    // Objectives
    const powerUpXP = warrior.powerUpsCollected * this.XP_REWARDS.POWER_UP_COLLECTED;
    baseXP += powerUpXP;
    breakdown.objectives = powerUpXP;
    
    // Territory control (Siege only)
    if (gameMode === GameMode.Siege && warrior.territoriesControlled) {
      const territoryXP = warrior.territoriesControlled * this.XP_REWARDS.TERRITORY_CONTROLLED;
      baseXP += territoryXP;
      breakdown.objectives = (breakdown.objectives || 0) + territoryXP;
    }
    
    // Victory bonuses
    if (gameMode === GameMode.Blitz && placement === 1) {
      bonusXP += this.XP_REWARDS.BLITZ_WINNER;
      breakdown.victory = this.XP_REWARDS.BLITZ_WINNER;
    } else if (gameMode === GameMode.Siege) {
      const siegeBonuses = [
        this.XP_REWARDS.SIEGE_1ST,
        this.XP_REWARDS.SIEGE_2ND,
        this.XP_REWARDS.SIEGE_3RD
      ];
      if (placement <= 3) {
        bonusXP += siegeBonuses[placement - 1];
        breakdown.victory = siegeBonuses[placement - 1];
      }
    }
    
    // Special bonuses
    if (warrior.gotFirstBlood) {
      bonusXP += this.XP_REWARDS.FIRST_BLOOD;
      breakdown.firstBlood = this.XP_REWARDS.FIRST_BLOOD;
    }
    
    if (warrior.godslayerKills > 0) {
      const godslayerXP = warrior.godslayerKills * this.XP_REWARDS.GODSLAYER_KILL;
      bonusXP += godslayerXP;
      breakdown.godslayer = godslayerXP;
    }
    
    if (warrior.survivedSpecialEvents > 0) {
      const eventXP = warrior.survivedSpecialEvents * this.XP_REWARDS.SPECIAL_EVENT_SURVIVAL;
      bonusXP += eventXP;
      breakdown.specialEvents = eventXP;
    }
    
    if (warrior.comebackVictory) {
      bonusXP += this.XP_REWARDS.COMEBACK_VICTORY;
      breakdown.comeback = this.XP_REWARDS.COMEBACK_VICTORY;
    }
    
    // Calculate total with multipliers
    let totalXP = baseXP + bonusXP;
    let multiplier = 1;
    
    if (warrior.wasUnderdog) {
      multiplier *= this.XP_REWARDS.UNDERDOG_MULTIPLIER;
    }
    
    // Apply any active XP events
    multiplier *= this.getActiveEventMultiplier();
    
    totalXP = Math.floor(totalXP * multiplier);
    
    return {
      baseXP,
      bonusXP,
      multiplier,
      totalXP,
      breakdown,
      newLevel: this.calculateLevel(warrior.currentXP + totalXP),
      leveledUp: this.calculateLevel(warrior.currentXP + totalXP) > warrior.currentLevel
    };
  }
  
  calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100));
  }
  
  getXPToNextLevel(currentXP: number): number {
    const currentLevel = this.calculateLevel(currentXP);
    const nextLevel = currentLevel + 1;
    const nextLevelXP = nextLevel * nextLevel * 100;
    return nextLevelXP - currentXP;
  }
  
  private getActiveEventMultiplier(): number {
    const now = new Date();
    const hour = now.getUTCHours();
    
    // Happy Hour: 20:00-22:00 UTC
    if (hour >= 20 && hour < 22) {
      return 1.5;
    }
    
    // Check for weekend double XP
    const day = now.getUTCDay();
    if (day === 0 || day === 6) {
      return 2.0;
    }
    
    return 1.0;
  }
}

interface WarriorStats {
  playerId: string;
  survivalTime: number;
  eliminations: number;
  damageDealt: number;
  powerUpsCollected: number;
  territoriesControlled?: number;
  gotFirstBlood: boolean;
  godslayerKills: number;
  survivedSpecialEvents: number;
  comebackVictory: boolean;
  wasUnderdog: boolean;
  currentXP: number;
  currentLevel: number;
}

interface XPResult {
  baseXP: number;
  bonusXP: number;
  multiplier: number;
  totalXP: number;
  breakdown: XPBreakdown;
  newLevel: number;
  leveledUp: boolean;
}

interface XPBreakdown {
  survival?: number;
  combat?: number;
  objectives?: number;
  victory?: number;
  firstBlood?: number;
  godslayer?: number;
  specialEvents?: number;
  comeback?: number;
}
```
<!-- POST-MVP:END -->

<!-- MVP:START -->
### **6. ProofNetwork VRF Service**

```typescript
// src/services/ProofNetworkVRF.ts - MVP VERSION
export class ProofNetworkVRF {
  // For MVP, use mock VRF that returns deterministic "random" values
  // Replace with real ProofNetwork API in production
  
  async requestRandomness(params: {
    seed: string;
    numValues: number;
  }): Promise<VRFResult> {
    // Mock implementation for MVP
    const values = [];
    for (let i = 0; i < params.numValues; i++) {
      // Simple hash-based pseudo-random
      const hash = this.simpleHash(params.seed + i);
      values.push(hash);
    }
    
    return {
      values,
      proof: `mock_proof_${params.seed}`,
      timestamp: Date.now()
    };
  }
  
  private simpleHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

interface VRFResult {
  values: number[];
  proof: string;
  timestamp: number;
}

/* Production implementation:
import axios from 'axios';

export class ProofNetworkVRF {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.PROOFNETWORK_API_KEY!;
  }
  
  async requestRandomness(params: {
    seed: string;
    numValues: number;
  }): Promise<VRFResult> {
    const response = await axios.post(
      'https://api.proofnetwork.org/vrf/generate',
      params,
      { headers: { 'X-API-Key': this.apiKey } }
    );
    
    return response.data;
  }
}
*/
```
<!-- MVP:END -->

---

<!-- MVP:START -->
### **7. API Routes**

```typescript
// src/api/routes.ts - REST ENDPOINTS
import { Express } from 'express';
import { CombatHandler } from '../combat/CombatHandler';
import { MonsterManager } from '../combat/MonsterManager';

export function setupRoutes(
  app: Express,
  combatHandler: CombatHandler,
  monsterManager: MonsterManager
) {
  // Get current game state
  app.get('/api/state', async (req, res) => {
    try {
      const monster = monsterManager.getCurrentMonster();
      const jackpot = await getJackpotAmount(); // From blockchain
      
      res.json({
        currentMonster: monster,
        currentJackpot: jackpot,
        totalEntries: monster?.totalCombats || 0
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Enter combat
  app.post('/api/combat/enter', async (req, res) => {
    try {
      const { wallet, txSignature, combatId } = req.body;
      
      const result = await combatHandler.handleCombatRequest({
        wallet,
        txSignature,
        combatId,
        attemptVault: true // Always attempt if victorious
      });
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get combat history
  app.get('/api/combat/history/:wallet', async (req, res) => {
    try {
      // TODO: Implement combat history from blockchain
      res.json({ history: [] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: Date.now() });
  });
}
```

### **8. Constants & Monster Configuration**

```typescript
// src/utils/constants.ts - MONSTER TIERS AND GAME CONFIG
export interface MonsterTier {
  name: string;
  poolRange: [number, number]; // Min/max SOL for spawn
  baseHealth: number;          // Starting HP
  defenseMultiplier: number;   // Combat difficulty
  vaultCrackChance: number;    // % chance after defeat
  entryFee: number;           // SOL to fight (in lamports)
}

export const MONSTER_TIERS: MonsterTier[] = [
  {
    name: "Skeleton Warrior",
    poolRange: [0, 1],
    baseHealth: 100,
    defenseMultiplier: 1.0,
    vaultCrackChance: 10,
    entryFee: 10_000_000, // 0.01 SOL
  },
  {
    name: "Goblin Berserker",
    poolRange: [1, 3],
    baseHealth: 200,
    defenseMultiplier: 1.2,
    vaultCrackChance: 20,
    entryFee: 20_000_000, // 0.02 SOL
  },
  {
    name: "Minotaur Guardian",
    poolRange: [3, 10],
    baseHealth: 400,
    defenseMultiplier: 1.5,
    vaultCrackChance: 35,
    entryFee: 50_000_000, // 0.05 SOL
  },
  {
    name: "Hydra",
    poolRange: [10, 25],
    baseHealth: 800,
    defenseMultiplier: 1.8,
    vaultCrackChance: 50,
    entryFee: 100_000_000, // 0.1 SOL
  },
  {
    name: "Ancient Dragon",
    poolRange: [25, 100],
    baseHealth: 1500,
    defenseMultiplier: 2.2,
    vaultCrackChance: 70,
    entryFee: 250_000_000, // 0.25 SOL
  },
  {
    name: "Titan of Sol",
    poolRange: [100, Infinity],
    baseHealth: 3000,
    defenseMultiplier: 3.0,
    vaultCrackChance: 90,
    entryFee: 500_000_000, // 0.5 SOL
  }
];

export interface Monster {
  id: string;
  type: string;
  tier: MonsterTier;
  baseHealth: number;
  currentHealth: number;
  spawnedAt: number;
  defeatedBy: string | null;
  totalCombats: number;
  victories: number;
}
```
<!-- MVP:END -->

## **🎯 MVP Testing**

```bash
# Test combat flow
curl -X POST http://localhost:4000/api/combat/enter \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "txSignature": "test_sig_123",
    "combatId": "combat_001"
  }'

# Get current state
curl http://localhost:4000/api/state
```

<!-- POST-MVP:PHASE3 -->
## **📊 Performance Optimization**

### **1. Redis Caching Strategy**

```typescript
// Efficient Redis usage
class GameStateCache {
  private redis: Redis.Cluster;
  private updateBuffer: Map<string, any> = new Map();
  
  // Batch updates every 50ms
  constructor(redis: Redis.Cluster) {
    this.redis = redis;
    setInterval(() => this.flushUpdates(), 50);
  }
  
  queueUpdate(gameId: string, state: any): void {
    this.updateBuffer.set(gameId, state);
  }
  
  async flushUpdates(): Promise<void> {
    if (this.updateBuffer.size === 0) return;
    
    const pipeline = this.redis.pipeline();
    
    for (const [gameId, state] of this.updateBuffer) {
      pipeline.setex(
        `game:${gameId}`,
        300,
        JSON.stringify(state)
      );
    }
    
    await pipeline.exec();
    this.updateBuffer.clear();
  }
}
```

### **2. Message Compression**

```typescript
// WebSocket compression
import zlib from 'zlib';

function compressMessage(data: any): Buffer {
  const json = JSON.stringify(data);
  return zlib.gzipSync(json);
}

function decompressMessage(buffer: Buffer): any {
  const json = zlib.gunzipSync(buffer).toString();
  return JSON.parse(json);
}

// Use in socket events
socket.emit('gameState', compressMessage(state));
```

### **3. Connection Pooling**

```typescript
// RPC connection pool
class RPCPool {
  private connections: Connection[] = [];
  private currentIndex = 0;
  
  constructor(urls: string[]) {
    this.connections = urls.map(url => new Connection(url));
  }
  
  getConnection(): Connection {
    const conn = this.connections[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.connections.length;
    return conn;
  }
}
```

---

## **📱 Mobile Client Considerations**

### **1. Mobile-Specific Connection Handling**

```typescript
// src/websocket/MobileConnectionManager.ts
export class MobileConnectionManager {
  private reconnectAttempts: Map<string, number> = new Map();
  private sessionCache: Map<string, GameSession> = new Map();
  
  handleMobileConnection(socket: Socket): void {
    const clientId = socket.handshake.query.clientId as string;
    const platform = socket.handshake.query.platform as string;
    
    if (platform === 'mobile') {
      // Enable aggressive reconnection for mobile
      socket.conn.pingInterval = 10000; // 10s
      socket.conn.pingTimeout = 30000;  // 30s
      
      // Check for existing session
      const cachedSession = this.sessionCache.get(clientId);
      if (cachedSession) {
        this.restoreSession(socket, cachedSession);
      }
    }
  }
  
  handleMobileDisconnect(clientId: string): void {
    // Keep session alive for 5 minutes for mobile
    setTimeout(() => {
      if (!this.isClientConnected(clientId)) {
        this.sessionCache.delete(clientId);
      }
    }, 300000); // 5 minutes
  }
  
  private restoreSession(socket: Socket, session: GameSession): void {
    // Restore game state
    socket.join(`game:${session.gameId}`);
    socket.emit('sessionRestored', {
      gameId: session.gameId,
      warriorId: session.warriorId,
      gameState: session.lastKnownState
    });
  }
}
```

### **2. Mobile-Optimized Message Batching**

```typescript
// src/websocket/MobileBroadcaster.ts
export class MobileBroadcaster {
  private mobileUpdateQueue: Map<string, any[]> = new Map();
  private updateInterval: number = 100; // 10 FPS for mobile
  
  constructor() {
    // Batch updates for mobile clients
    setInterval(() => this.flushMobileUpdates(), this.updateInterval);
  }
  
  queueMobileUpdate(clientId: string, update: any): void {
    if (!this.mobileUpdateQueue.has(clientId)) {
      this.mobileUpdateQueue.set(clientId, []);
    }
    
    const queue = this.mobileUpdateQueue.get(clientId)!;
    
    // Limit queue size to prevent memory issues
    if (queue.length < 50) {
      queue.push(update);
    }
  }
  
  private flushMobileUpdates(): void {
    for (const [clientId, updates] of this.mobileUpdateQueue) {
      if (updates.length === 0) continue;
      
      // Compress updates
      const compressed = this.compressUpdates(updates);
      
      // Send batched update
      this.sendToClient(clientId, 'batchUpdate', compressed);
      
      // Clear queue
      updates.length = 0;
    }
  }
  
  private compressUpdates(updates: any[]): any {
    // Merge similar updates
    const merged = {
      warriors: new Map(),
      powerUps: new Map(),
      events: []
    };
    
    for (const update of updates) {
      if (update.type === 'warriorMove') {
        // Keep only latest position
        merged.warriors.set(update.warriorId, update);
      } else if (update.type === 'powerUpSpawn') {
        merged.powerUps.set(update.powerUpId, update);
      } else {
        merged.events.push(update);
      }
    }
    
    return {
      warriors: Array.from(merged.warriors.values()),
      powerUps: Array.from(merged.powerUps.values()),
      events: merged.events
    };
  }
}
```

### **3. Mobile Network Optimization**

```typescript
// src/utils/MobileOptimization.ts
export class MobileOptimization {
  // Reduce payload size for mobile
  static optimizeGameState(state: GameState, isMobile: boolean): any {
    if (!isMobile) return state;
    
    return {
      // Essential data only
      id: state.id,
      phase: state.phase,
      timeRemaining: Math.floor(state.timeRemaining / 1000), // seconds
      warriors: state.warriors.map(w => ({
        id: w.id,
        p: [w.position.x, w.position.y], // Compress position
        h: w.hp,
        a: w.isAlive ? 1 : 0
      })),
      powerUps: state.powerUps.map(p => ({
        id: p.id,
        t: p.type[0], // 'h' for health, 'r' for rage
        p: [p.position.x, p.position.y]
      }))
    };
  }
  
  // Priority message queue for mobile
  static prioritizeMessages(messages: any[]): any[] {
    return messages.sort((a, b) => {
      const priority = {
        'gameEnd': 1,
        'warriorEliminated': 2,
        'combatEvent': 3,
        'powerUpCollected': 4,
        'warriorMove': 5
      };
      
      return (priority[a.type] || 99) - (priority[b.type] || 99);
    });
  }
}
```

### **4. Mobile-Specific Features**

```typescript
// Platform detection and adaptation
io.on('connection', (socket) => {
  const userAgent = socket.handshake.headers['user-agent'] || '';
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
  
  if (isMobile) {
    // Apply mobile optimizations
    socket.data.platform = 'mobile';
    socket.data.updateRate = 100; // 10 FPS
    socket.data.compressionEnabled = true;
    
    // Join mobile room for targeted broadcasts
    socket.join('mobile-clients');
  } else {
    socket.data.platform = 'web';
    socket.data.updateRate = 16; // 60 FPS
    socket.data.compressionEnabled = false;
  }
});
```

### **5. Background/Foreground Handling**

```typescript
// Handle mobile app lifecycle
socket.on('appStateChange', (data) => {
  const { state, clientId } = data;
  
  if (state === 'background') {
    // Reduce update frequency
    this.setClientUpdateRate(clientId, 1000); // 1 FPS
    
    // Mark as inactive but don't disconnect
    this.markClientInactive(clientId);
  } else if (state === 'foreground') {
    // Restore normal update rate
    this.setClientUpdateRate(clientId, 100); // 10 FPS
    
    // Send full state refresh
    this.sendStateRefresh(clientId);
    
    // Mark as active
    this.markClientActive(clientId);
  }
});
```

---

## **🚀 Deployment Configuration**

### **1. Docker Setup**

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node healthcheck.js

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### **2. Environment Variables**

```env
# .env.production
NODE_ENV=production
PORT=3000

# Redis Cluster
REDIS_HOST_1=redis1.internal
REDIS_HOST_2=redis2.internal
REDIS_PASSWORD=your-secure-password

# PostgreSQL
DATABASE_URL=postgresql://user:pass@db:5432/aurelius

# Solana RPC
HELIUS_RPC_URL=https://rpc.helius.xyz/?api-key=xxx
QUICKNODE_RPC_URL=https://xxx.solana-mainnet.quiknode.pro/

# ProofNetwork
PROOFNETWORK_API_KEY=your-api-key

# Security
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://aurelius.game
```

### **3. Scaling Configuration**

```yaml
# docker-compose.yml
version: '3.8'

services:
  game-server:
    build: .
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
    environment:
      - NODE_ENV=production
    networks:
      - game-network
      
  redis-node-1:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes
    networks:
      - game-network
      
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    networks:
      - game-network
```

---

## **📈 Monitoring & Metrics**

```typescript
// src/services/MetricsService.ts
import { StatsD } from 'hot-shots';

export class MetricsService {
  private statsd: StatsD;
  
  constructor() {
    this.statsd = new StatsD({
      host: process.env.STATSD_HOST,
      port: 8125,
      prefix: 'aurelius.gameserver.'
    });
  }
  
  trackGameMetrics(game: GameInstance): void {
    this.statsd.gauge('active_games', this.getActiveGames());
    this.statsd.gauge('players_online', this.getOnlinePlayers());
    this.statsd.histogram('game_duration', game.getDuration());
    this.statsd.increment('games_completed');
  }
  
  trackPerformance(operation: string, duration: number): void {
    this.statsd.histogram(`operation.${operation}`, duration);
  }
}
```

---

*This architecture provides a simple, verifiable backend for the Aurelius Colosseum monster combat jackpot system.*