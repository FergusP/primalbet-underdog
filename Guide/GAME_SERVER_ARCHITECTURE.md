# **AURELIUS GAME SERVER ARCHITECTURE**
*High-Performance Real-Time Backend Implementation*

## **🏗️ Server Architecture Overview**

```
┌─────────────────────┐
│   Load Balancer     │
│    (Cloudflare)     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐     ┌─────────────────┐
│   Game Server 1     │────▶│   Redis Cluster │
│  (Node.js/Fastify)  │◀────│  (Game State)   │
└─────────────────────┘     └─────────────────┘
           │                         │
┌──────────▼──────────┐     ┌───────▼─────────┐
│   WebSocket Layer   │     │   PostgreSQL    │
│    (Socket.io)      │     │  (Historical)   │
└─────────────────────┘     └─────────────────┘
           │
┌──────────▼──────────┐     ┌─────────────────┐
│  ProofNetwork API   │────▶│  Solana RPC     │
│   (VRF/Blackbox)    │     │   (Helius)      │
└─────────────────────┘     └─────────────────┘
```

---

## **📁 Server Structure**

```
server/
├── src/
│   ├── index.ts                 # Server entry point
│   ├── config/
│   │   ├── env.ts              # Environment config
│   │   ├── redis.ts            # Redis connection
│   │   ├── database.ts         # PostgreSQL setup
│   │   └── solana.ts           # RPC connections
│   ├── game/
│   │   ├── GameManager.ts      # Core game orchestration
│   │   ├── GameInstance.ts     # Individual game logic
│   │   ├── BlitzGame.ts        # Blitz mode specifics
│   │   ├── SiegeGame.ts        # Siege mode specifics
│   │   ├── CombatEngine.ts     # Combat calculations
│   │   └── PowerUpSystem.ts    # Power-up management
│   ├── entities/
│   │   ├── Warrior.ts          # Warrior class
│   │   ├── Arena.ts            # Arena management
│   │   └── PowerUp.ts          # Power-up class
│   ├── websocket/
│   │   ├── SocketManager.ts    # WebSocket orchestration
│   │   ├── GameEvents.ts       # Event handlers
│   │   ├── ClientManager.ts    # Client connections
│   │   └── MessageValidator.ts # Input validation
│   ├── blockchain/
│   │   ├── SolanaService.ts    # Chain interactions
│   │   ├── GameSettlement.ts   # Result submission
│   │   └── WalletAuth.ts       # Wallet verification
│   ├── services/
│   │   ├── ProofNetworkVRF.ts  # Randomness service
│   │   ├── MatchmakingService.ts # Game creation
│   │   ├── AntiCheatService.ts # Security layer
│   │   └── MetricsService.ts   # Performance tracking
│   └── utils/
│       ├── logger.ts           # Structured logging
│       ├── errors.ts           # Error handling
│       └── constants.ts        # Game constants
├── tests/
├── scripts/
└── package.json
```

---

## **🎮 Core Game Server Implementation**

### **1. Server Entry Point**

```typescript
// src/index.ts
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

### **2. Game Manager**

```typescript
// src/game/GameManager.ts
import { Redis } from 'ioredis';
import { BlitzGame } from './BlitzGame';
import { SiegeGame } from './SiegeGame';
import { v4 as uuidv4 } from 'uuid';

export class GameManager {
  private activeGames: Map<string, GameInstance> = new Map();
  private blitzQueue: Set<string> = new Set();
  private siegeSchedule: Map<number, string> = new Map();
  
  constructor(
    private redis: Redis,
    private solanaService: SolanaService
  ) {}
  
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

### **3. Game Instance Base Class**

```typescript
// src/game/GameInstance.ts
import { Warrior } from '../entities/Warrior';
import { Arena } from '../entities/Arena';
import { PowerUpSystem } from './PowerUpSystem';
import { CombatEngine } from './CombatEngine';

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
}
```

### **4. Blitz Mode Implementation**

```typescript
// src/game/BlitzGame.ts
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

### **5. Combat Engine**

```typescript
// src/game/CombatEngine.ts
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

### **6. WebSocket Handler**

```typescript
// src/websocket/SocketManager.ts
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

### **7. Anti-Cheat Service**

```typescript
// src/services/AntiCheatService.ts
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

### **8. ProofNetwork Integration**

```typescript
// src/services/ProofNetworkVRF.ts
import axios from 'axios';
import { blackbox } from '@proofnetwork/sdk';

export class ProofNetworkVRF {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.PROOFNETWORK_API_KEY!;
  }
  
  async randomRange(min: number, max: number): Promise<number> {
    const response = await axios.post(
      'https://api.proofnetwork.org/vrf/range',
      { min, max },
      { headers: { 'X-API-Key': this.apiKey } }
    );
    
    return response.data.result;
  }
  
  async selectIndex(arrayLength: number): Promise<number> {
    const response = await axios.post(
      'https://api.proofnetwork.org/vrf/select',
      { max: arrayLength - 1 },
      { headers: { 'X-API-Key': this.apiKey } }
    );
    
    return response.data.result;
  }
  
  async triggerSpecialEvent(probability: number): Promise<boolean> {
    const roll = await this.randomRange(0, 10000);
    return roll < probability * 10000;
  }
  
  async getServerSigningKey(): Promise<any> {
    return await blackbox.getSecret('gameServerKey');
  }
  
  async signGameResult(gameId: string, winners: any[]): Promise<string> {
    const message = JSON.stringify({
      gameId,
      winners,
      timestamp: Date.now(),
      serverVersion: '1.0.0'
    });
    
    return await blackbox.signMessage('gameServerKey', message);
  }
}
```

---

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

*This architecture provides a scalable, secure foundation for real-time gameplay with <100ms latency.*