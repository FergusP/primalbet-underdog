# **AURELIUS TECHNICAL ARCHITECTURE**
*Efficient, Secure, and Scalable Implementation Guide*

## **🎯 Architecture Philosophy**

### **Core Principles**
1. **Minimal On-Chain**: Only what MUST be trustless goes on-chain
2. **Maximum Performance**: 60 FPS gameplay, <100ms latency
3. **Security First**: No single point of failure for funds
4. **Cost Efficient**: Minimize transaction fees and RPC calls
5. **Quick Delivery**: MVP in 2-3 days

---

## **🏗️ System Architecture Overview**

### **Simplified Polling Architecture**
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web Frontend  │────▶│  Next.js API     │────▶│  Backend Service│
│  (Next + Phaser)│◀────│    (Proxy)       │◀────│  (Node + Memory)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                                  │
        │                                                  ▼
        │                                         ┌─────────────────┐
        └────────────────────────────────────────▶│  Solana Chain   │
                                                  │   (Anchor)      │
                                                  └─────────────────┘

Polling: Frontend → API → Backend (every 500ms)
No WebSockets, No Redis, Just HTTP polling
```

### **Project Structure**
```
/Aurelius
├── /web                    # Next.js + Phaser.js web app
│   ├── /pages/api         # API routes (proxy to backend)
│   └── /game              # Phaser game files
├── /programs               # Anchor smart contracts
├── /backend                # Backend service (Node.js)
└── /Guide                  # Documentation
```

---

## **📊 On-Chain vs Off-Chain Logic Distribution**

### **ON-CHAIN (Solana/Anchor) - Trust Required**
```yaml
PURPOSE: Financial integrity and verifiable fairness

WHAT GOES ON-CHAIN:
1. Money Management:
   - Entry fee collection
   - Prize pool escrow
   - Winner payouts
   - Treasury fees

2. Player Identity:
   - Player profiles (PDAs)
   - Lifetime statistics
   - Achievement tracking

3. Game Outcomes:
   - Final winners
   - Prize distributions
   - Game summaries

4. Verification:
   - VRF proofs for fairness
   - Game server signatures
```

### **OFF-CHAIN (Backend) - Input Processing**
```yaml
PURPOSE: Collect inputs and calculate weights

WHAT STAYS OFF-CHAIN:
1. Input Collection:
   - Player strategic decisions
   - Timing tracking
   - Action sequences
   - Alliance management

2. Weight Processing:
   - Convert inputs to factors
   - Calculate efficiency scores
   - Apply multipliers
   - Generate final weights

3. Visual Generation:
   - Fake combat animations
   - HP bar updates (visual only)
   - Effect animations
   - Momentum displays

4. VRF Integration:
   - Submit weights to VRF
   - Receive winner selection
   - Verify randomness proof
```

---

## **🔐 Security Architecture**

### **1. Financial Security**

```typescript
// Smart Contract Security Pattern
pub struct GameEscrow {
    // Funds NEVER leave escrow until game ends
    pub authority: Pubkey,      // Only program can withdraw
    pub game_server: Pubkey,    // Authorized to declare winner
    pub total_pot: u64,
    pub game_id: Pubkey,
    pub timeout: i64,           // Auto-refund if server fails
}

// Entry Fee Flow
Player Wallet → Game Escrow PDA → Winner Wallets
                      ↓
                Treasury PDA (3%)
```

### **2. Game Server Security**

```javascript
// Server Authority Management
class GameServerAuth {
  constructor() {
    // Server keypair stored in ProofNetwork Blackbox
    this.serverKey = blackbox.getSecret("gameServerKey");
    
    // All game results must be signed
    this.signGameResult = async (gameId, winners) => {
      const message = {
        gameId,
        winners,
        timestamp: Date.now(),
        serverVersion: "1.0.0"
      };
      
      return await blackbox.signMessage(
        "gameServerKey",
        JSON.stringify(message)
      );
    };
  }
}
```

### **3. Anti-Cheat Measures**

```typescript
// Server-Authoritative Architecture
class AntiCheat {
  // All movement validated server-side
  validateMovement(warrior, newPos, deltaTime) {
    const maxDistance = warrior.speed * deltaTime * 1.1; // 10% tolerance
    const distance = calculateDistance(warrior.pos, newPos);
    
    if (distance > maxDistance) {
      return { valid: false, reason: "SPEED_HACK" };
    }
    
    if (!this.arena.isValidPosition(newPos)) {
      return { valid: false, reason: "OUT_OF_BOUNDS" };
    }
    
    return { valid: true };
  }
  
  // Combat verification
  validateDamage(attacker, target, damage) {
    const range = calculateDistance(attacker.pos, target.pos);
    if (range > ATTACK_RANGE) return false;
    
    const expectedDamage = this.calculateDamage(attacker);
    if (Math.abs(damage - expectedDamage) > 1) return false;
    
    return true;
  }
}
```

### **4. DOS Protection**

```javascript
// Rate Limiting
const rateLimiter = {
  connections: new Map(), // IP → count
  messages: new Map(),    // socketId → count
  
  checkConnection(ip) {
    const count = this.connections.get(ip) || 0;
    if (count > 5) return false; // Max 5 connections per IP
    this.connections.set(ip, count + 1);
    return true;
  },
  
  checkMessage(socketId) {
    const count = this.messages.get(socketId) || 0;
    if (count > 30) return false; // Max 30 msgs/sec
    this.messages.set(socketId, count + 1);
    return true;
  }
};
```

---

## **💾 Data Architecture**

### **1. On-Chain Data Structures**

```rust
// Minimal on-chain storage for cost efficiency
#[account]
pub struct PlayerProfile {
    pub authority: Pubkey,      // 32 bytes
    pub total_games: u32,       // 4 bytes (not u64)
    pub total_wins: u32,        // 4 bytes
    pub total_earnings: u64,    // 8 bytes (needs precision)
    pub last_game: i64,         // 8 bytes
    // Total: 56 bytes (~0.002 SOL rent)
}

#[account]
pub struct GameEscrow {
    pub game_id: [u8; 16],      // 16 bytes (UUID, not Pubkey)
    pub mode: u8,               // 1 byte (0=blitz, 1=siege)
    pub pot: u64,               // 8 bytes
    pub player_count: u8,       // 1 byte
    pub server_authority: Pubkey, // 32 bytes
    pub created_at: i64,        // 8 bytes
    pub timeout: i64,           // 8 bytes
    // Total: 74 bytes (~0.003 SOL rent)
}
```

### **2. Off-Chain Data (Redis)**

```javascript
// Game State in Redis (expires after game)
const gameState = {
  gameId: "uuid",
  mode: "blitz",
  phase: "battle",
  startTime: Date.now(),
  warriors: {
    "wallet1": {
      id: "warrior1",
      pos: { x: 10, y: 15 },
      hp: 85,
      effects: ["rage"],
      lastUpdate: Date.now()
    }
  },
  powerUps: Map(),
  events: []
};

// Player Session (expires in 1 hour)
const playerSession = {
  wallet: "7xKQ...3nFA",
  socketId: "abc123",
  gameId: "current-game",
  latency: 45,
  lastSeen: Date.now()
};
```

### **3. Database Schema (PostgreSQL)**

```sql
-- Historical data for analytics
CREATE TABLE game_results (
    id UUID PRIMARY KEY,
    game_mode VARCHAR(10),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    total_pot BIGINT,
    player_count INT,
    winners JSONB,
    vrf_proof TEXT
);

CREATE TABLE player_stats (
    wallet VARCHAR(44) PRIMARY KEY,
    games_played INT DEFAULT 0,
    total_damage BIGINT DEFAULT 0,
    favorite_mode VARCHAR(10),
    last_seen TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX idx_games_mode_time ON game_results(game_mode, started_at);
CREATE INDEX idx_player_last_seen ON player_stats(last_seen);
```

---

## **⚡ Performance Optimization**

### **1. Smart Contract Optimization**

```rust
// Batch operations to save transactions
pub fn join_game_multi(
    ctx: Context<JoinGameMulti>,
    warrior_count: u8,
    positions: Vec<Position>
) -> Result<()> {
    // One transaction for multiple warriors
    let total_fee = calculate_multi_fee(warrior_count);
    
    // Single transfer
    transfer(/* ... */, total_fee)?;
    
    // Batch create warriors
    for i in 0..warrior_count {
        // Create warrior entries
    }
}
```

### **2. RPC Optimization**

```javascript
// Connection pooling and caching
class SolanaConnection {
  constructor() {
    this.connections = [
      new Connection(HELIUS_URL_1),
      new Connection(HELIUS_URL_2),
      new Connection(QUICKNODE_URL)
    ];
    
    this.cache = new Map();
  }
  
  async getPlayerProfile(wallet) {
    // Check cache first
    const cached = this.cache.get(wallet);
    if (cached && Date.now() - cached.time < 60000) {
      return cached.data;
    }
    
    // Round-robin RPC calls
    const conn = this.connections[this.current++ % 3];
    const data = await conn.getAccountInfo(/* ... */);
    
    this.cache.set(wallet, { data, time: Date.now() });
    return data;
  }
}
```

### **3. Polling Optimization**

```javascript
// Simple polling with in-memory state
class GameStateManager {
  constructor() {
    this.games = new Map();
    this.gameLoop();
  }
  
  gameLoop() {
    setInterval(() => {
      for (const [gameId, game] of this.games) {
        if (game.status === 'active') {
          this.updateGame(game);
        }
      }
    }, 50); // Game updates every 50ms
  }
  
  // API endpoint handler
  getGameState(gameId) {
    const game = this.games.get(gameId);
    if (!game) return null;
    
    return {
      warriors: game.warriors,
      powerUps: game.powerUps,
      pot: game.pot,
      timeRemaining: 90 - ((Date.now() - game.startTime) / 1000),
      status: game.status
    };
  }
}
```

---

## **🚀 Implementation Roadmap**

### **Phase 1: Foundation (Days 1-3)**
```yaml
Day 1:
  Morning:
    - Initialize Anchor project
    - Create basic PDAs
    - Set up Node.js server
  Afternoon:
    - Redis connection
    - Basic WebSocket setup
    - ProofNetwork account

Day 2:
  Morning:
    - Game entry smart contract
    - Escrow implementation
    - Server authority system
  Afternoon:
    - Basic game state management
    - Movement validation
    - Frontend scaffolding

Day 3:
  Morning:
    - Combat calculations
    - VRF integration
    - Power-up system
  Afternoon:
    - Integration testing
    - Security review
    - Performance baseline
```

### **Phase 2: Game Modes (Days 4-7)**
```yaml
Day 4-5: Blitz Mode
  - Instant matchmaking
  - 90-second game loop
  - Single winner logic
  - Quick power-ups

Day 6-7: Siege Mode
  - Scheduled games
  - Territory system
  - Multi-winner payouts
  - Enhanced power-ups
```

### **Phase 3: Polish & Launch (Days 8-10)**
```yaml
Day 8: Special Features
  - Underdog mechanics
  - Special events
  - Dynamic modifiers

Day 9: Testing
  - Load testing (100 concurrent)
  - Security audit
  - Mobile testing

Day 10: Launch Prep
  - Deployment scripts
  - Monitoring setup
  - Documentation
```

---

## **🔧 Tech Stack Summary**

### **Smart Contracts**
```toml
[dependencies]
anchor-lang = "0.30.0"
anchor-spl = "0.30.0"
solana-program = "1.18.0"
```

### **Game Server**
```json
{
  "dependencies": {
    "fastify": "^4.26.0",
    "socket.io": "^4.7.0",
    "redis": "^4.6.0",
    "bullmq": "^5.0.0",
    "@solana/web3.js": "^1.90.0",
    "zod": "^3.22.0"
  }
}
```

### **Web Frontend**
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "phaser": "^3.90.0",
    "zustand": "^4.5.0",
    "@solana/wallet-adapter-react": "^0.15.0",
    "framer-motion": "^11.0.0",
    "socket.io-client": "^4.7.0"
  }
}
```

### **Mobile Frontend**
```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "react-native": "0.74.0",
    "@shopify/react-native-skia": "^1.2.0",
    "zustand": "^4.5.0",
    "@solana-mobile/mobile-wallet-adapter-protocol": "^2.0.0",
    "socket.io-client": "^4.7.0"
  }
}
```

### **Shared Code**
```typescript
// No package.json - just TypeScript files to copy
// - battleLogic.ts
// - gameConstants.ts
// - types.ts
// - solanaClient.ts
```

### **Infrastructure**
- **Web Hosting**: Vercel (Next.js)
- **Mobile Distribution**: Expo EAS + TestFlight/Play Store
- **Backend**: Railway (Game Server)
- **Database**: Supabase PostgreSQL
- **Cache**: Upstash Redis
- **RPC**: Helius Pro plan
- **Monitoring**: Datadog
- **CDN**: Cloudflare

---

## **🌐 Web-Optimized Architecture**

### **Auto-Battle AI Logic**
```typescript
// server/src/ai.ts - Server-side AI control
export function calculateAIMove(warrior: Warrior, gameState: GameState): AIDecision {
  const enemies = gameState.warriors.filter(w => w.player !== warrior.player && w.hp > 0);
  const nearest = findNearestEnemy(warrior, enemies);
  
  if (!nearest) return { type: 'idle' };
  
  const distance = getDistance(warrior.position, nearest.position);
  if (distance <= 1) {
    return { type: 'attack', target: nearest.id };
  }
  
  return { 
    type: 'move', 
    position: calculatePath(warrior.position, nearest.position)
  };
}

// Power-up marketplace
export function generatePowerUpOffers(): PowerUpOffer[] {
  return [
    { id: uuid(), type: 'health', price: 0.001, expiresIn: 20 },
    { id: uuid(), type: 'rage', price: 0.002, expiresIn: 20 },
    { id: uuid(), type: 'chaos', price: 0.01, expiresIn: 20 }
  ];
}
```

### **Responsive Web Design**
```typescript
// Adaptive canvas sizing for all devices
export const getCanvasConfig = (): Phaser.Types.Core.GameConfig => {
  const isMobile = window.innerWidth < 768;
  return {
    type: Phaser.AUTO,
    width: isMobile ? 350 : 600,
    height: isMobile ? 350 : 600,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    fps: {
      target: isMobile ? 30 : 60,
      forceSetTimeOut: true
    }
  };
};
```

### **Mobile Browser Optimizations**
- **Touch-friendly buttons** (minimum 44x44px)
- **Simplified graphics** for better performance
- **Reduced particle count** on mobile devices
- **Viewport meta tag** for proper scaling
- **PWA support** for app-like experience

### **Desktop Browser Features**
- **Full particle effects** and animations
- **Keyboard shortcuts** for quick actions
- **Higher resolution** graphics
- **60 FPS** target performance
- **Social sharing** integration

---

## **💡 Key Architecture Decisions**

### **1. Why Hybrid Architecture?**
- **On-chain**: Only for money and verification (slow but trustless)
- **Off-chain**: For gameplay (fast but trusted)
- **Result**: Best of both worlds

### **2. Why Not Fully On-Chain?**
- Transaction fees would be $50+ per game
- 400ms+ latency per action
- Poor user experience
- Technical limitations

### **3. Why Not Fully Off-Chain?**
- No trustless prize distribution
- Centralized point of failure
- No verifiable fairness
- Regulatory concerns

### **4. Security Trade-offs**
- Server has temporary authority (but can't steal funds)
- Timeout mechanism prevents server lockup
- VRF proofs ensure fairness
- Open-source verification possible

### **5. Why Web-First Strategy?**
- **Instant accessibility** - no app download required
- **Cross-platform reach** - works on all devices with browsers
- **Faster iteration** - deploy updates instantly
- **Lower barrier to entry** - players can try immediately
- **Responsive design** - one codebase for all screen sizes

---

## **📋 Quick Reference**

### **What Goes Where?**
| Feature | On-Chain | Off-Chain | Why |
|---------|----------|-----------|-----|
| Entry fees | ✅ | ❌ | Trust |
| Prize payout | ✅ | ❌ | Trust |
| Movement | ❌ | ✅ | Performance |
| Combat | ❌ | ✅ | Performance |
| Power-ups | ❌ | ✅ | Performance |
| Final results | ✅ | ✅ | Both needed |
| Player stats | ✅ | ✅ | Permanent + cache |

### **Security Checklist**
- [ ] Funds in escrow PDA only
- [ ] Server key in ProofNetwork Blackbox
- [ ] All results signed by server
- [ ] Timeout mechanism for refunds
- [ ] Rate limiting on all endpoints
- [ ] Input validation everywhere
- [ ] No client-side game logic

---

*This architecture balances security, performance, and delivery speed for a production-ready game.*