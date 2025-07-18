# **AURELIUS: COMPLETE GAME DESIGN DOCUMENT**
*Real-time PvP Battle Arena on Solana*

## **1. GAME OVERVIEW**

### **Core Concept**
Aurelius is a real-time PvP battle arena on Solana where players send gladiator warriors into a colosseum to fight until only one remains. The last warrior standing claims the entire prize pool.

### **Target Audience**
- Primary: Crypto gamers seeking quick, exciting PvP action
- Secondary: DeFi users looking for gamified yield
- Tertiary: Casual mobile gamers (future expansion)

### **Platform**
- Web-based (MVP)
- Mobile responsive
- Native mobile apps (future)

---

## **2. CORE GAME LOOP**

```
DISCOVER → ENTER → BATTLE → SURVIVE → WIN/LOSE → COLLECT
    ↑                                                    ↓
    ←←←←←←←←←←← REPEAT (FOMO/REVENGE) ←←←←←←←←←←←←←←←←
```

### **Detailed Loop Breakdown**

1. **DISCOVER** (5 seconds)
   - See active arena with current pot size
   - Watch ongoing battles as spectator
   - Check timer and warrior count

2. **ENTER** (10 seconds)
   - Connect wallet
   - Pay entry fee (0.002 SOL base)
   - Choose entry position (click on arena)
   - Warrior spawns with entrance animation

3. **BATTLE** (60-120 seconds)
   - Warriors auto-battle in real-time
   - Collect power-ups by positioning
   - Watch HP decrease from combat/environment
   - Strategic movement to avoid crowds

4. **SURVIVE** (Ongoing)
   - Monitor warrior health
   - Anticipate power-up spawns
   - Position for final showdown
   - Watch rivals fall

5. **WIN/LOSE** (5 seconds)
   - Victory fanfare or defeat animation
   - Show final statistics
   - Display winnings/rank

6. **COLLECT** (10 seconds)
   - Auto-credit winnings to wallet
   - Show XP gained (future)
   - Update leaderboard position
   - "Play Again" prompt

---

## **3. TECHNICAL ARCHITECTURE**

### **3.1 Hybrid On-Chain/Off-Chain Design**

```
ON-CHAIN (Solana/Anchor):
- Player registration (PDA creation)
- Game entry and fees
- Winner determination
- Prize distribution
- Player statistics
- Leaderboards

OFF-CHAIN (Game Server):
- Real-time warrior positions
- Combat calculations
- Power-up spawning
- Movement validation
- Battle state broadcasting

SYNCHRONIZATION:
- Game server commits winner on-chain
- Periodic state verification
- WebSocket for real-time updates
```

### **3.2 Tech Stack**
- **Smart Contracts**: Anchor Framework (Rust)
- **Game Engine**: Phaser 3.90+
- **Frontend**: Next.js 15 + React 19
- **State Management**: Zustand
- **Real-time**: WebSocket + Socket.io
- **RPC**: Helius/QuickNode
- **Randomness**: ProofNetwork VRF

---

## **4. WALLET CONNECTION & PLAYER IDENTITY**

### **4.1 Wallet Connection Flow**

```typescript
WALLET CONNECT SEQUENCE:
1. User clicks "Connect Wallet"
2. Wallet adapter connects
3. Frontend checks if Player PDA exists:
   - Derive PDA using: [b"player", wallet_pubkey]
   - Fetch account data
   - If exists: Load player profile/lobby
   - If not: Show new player welcome

NO PDA CREATION ON CONNECT - Only UI updates
```

### **4.2 First Game Entry**

```typescript
FIRST JOIN FLOW:
1. New player clicks "Join Game"
2. Frontend builds transaction with TWO instructions:
   
   Instruction 1: create_player_profile
   - Creates Player PDA
   - User pays rent (~0.002 SOL)
   - Initializes player stats
   
   Instruction 2: join_game
   - Uses existing game logic
   - Deposits entry fee to escrow
   - Creates warrior in arena

3. User signs ONE transaction
4. Both operations atomic - succeed or fail together
```

### **4.3 Account Structure**

```rust
// Player PDA - Identity & Stats Only
#[account]
pub struct PlayerProfile {
    pub authority: Pubkey,        // wallet owner
    pub total_games: u64,         
    pub total_wins: u64,          
    pub total_earnings: u64,      
    pub current_streak: u16,      
    pub highest_streak: u16,      
    pub xp: u64,                  
    pub level: u8,                
    pub created_at: i64,          
}

// Game Escrow - Holds All Funds
#[account]
pub struct GameEscrow {
    pub game_id: Pubkey,
    pub total_pot: u64,           // SOL in lamports
    pub player_count: u8,
    pub is_active: bool,
    pub winner: Option<Pubkey>,
}

// Warrior Entry - Game State
#[account] 
pub struct WarriorEntry {
    pub game_id: Pubkey,
    pub player: Pubkey,           // player's wallet
    pub warrior_id: u8,           
    pub entry_position: Position,
    pub entry_time: i64,
}
```

---

## **5. FUND MANAGEMENT ARCHITECTURE**

### **5.1 Fund Flow Design**

```
SECURE FUND FLOW:
Player Wallet → Game Escrow → Winner Wallet
                     ↓
                Treasury PDA (fees)

NEVER: Player Wallet → Player PDA → Game
```

### **5.2 Entry Fee Processing**

```rust
pub fn join_game(ctx: Context<JoinGame>, position: Position) -> Result<()> {
    let entry_fee = calculate_entry_fee(ctx.accounts.game_escrow.player_count);
    
    // Transfer directly from player to escrow
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.game_escrow.to_account_info(),
            },
        ),
        entry_fee,
    )?;
    
    // Update game state
    ctx.accounts.game_escrow.total_pot += entry_fee;
    ctx.accounts.game_escrow.player_count += 1;
    
    // Create warrior entry
    // ... warrior initialization logic
}
```

### **5.3 Prize Distribution**

```rust
pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
    // Verify winner
    require!(ctx.accounts.game_escrow.winner == Some(ctx.accounts.winner.key()));
    
    let total_pot = ctx.accounts.game_escrow.total_pot;
    let winner_share = (total_pot * 95) / 100;  // 95% to winner
    let treasury_fee = (total_pot * 3) / 100;   // 3% to treasury
    // 2% stays for burning/future use
    
    // Transfer from escrow to winner
    **ctx.accounts.game_escrow.to_account_info().lamports.borrow_mut() -= winner_share;
    **ctx.accounts.winner.lamports.borrow_mut() += winner_share;
    
    // Transfer fee to treasury
    **ctx.accounts.game_escrow.to_account_info().lamports.borrow_mut() -= treasury_fee;
    **ctx.accounts.treasury.lamports.borrow_mut() += treasury_fee;
    
    // Update player stats
    ctx.accounts.player_profile.total_wins += 1;
    ctx.accounts.player_profile.total_earnings += winner_share;
}
```

---

## **6. GAME MECHANICS**

### **6.1 ARENA FIELD**

**Design Specifications:**
```
ARENA LAYOUT:
- Shape: Circular colosseum (600px diameter)
- Grid: Invisible 20x20 movement grid
- Zones: Center (high risk/reward), Edge (safer)
- Visual: Top-down view with 2.5D perspective

VISUAL ELEMENTS:
- Stone texture floor with grid overlay
- Dramatic lighting from center
- Blood stains that persist (show battle history)
- Crowd sprites in background
- Dynamic shadows under warriors
```

**Environmental Mechanics:**
```
ARENA SHRINKING:
- Last 30 seconds: Arena shrinks by 20%
- Forces remaining warriors to center
- Red danger zone indication
- 2 damage/second outside safe zone

ENVIRONMENTAL HAZARDS:
- Arena deals 1 damage every 3 seconds to all
- Increases to 2 damage in final 20 seconds
- Creates time pressure
- Prevents camping strategies
```

### **6.2 POWER-UPS**

**Types and Effects:**
```
1. HEALTH POTION (Green orb)
   - Spawn rate: Every 15 seconds
   - Effect: +25 HP instant heal
   - Location: Random positions
   - Visual: Glowing green pulse

2. RAGE MODE (Red orb)
   - Spawn rate: Every 30 seconds
   - Effect: 2x damage for 10 seconds
   - Location: Center bias (60%)
   - Visual: Red aura around warrior

3. SPEED BOOST (Blue orb)
   - Spawn rate: Every 20 seconds
   - Effect: 1.5x movement speed for 8 seconds
   - Location: Edge positions
   - Visual: Blue trail effect

4. SHIELD (Yellow orb)
   - Spawn rate: Once at 50% time
   - Effect: Block next 2 hits
   - Location: Exact center
   - Visual: Golden barrier
```

### **6.3 COMBAT SYSTEM**

```
DAMAGE CALCULATION:
- Base warrior HP: 100
- Melee damage: 5-8 (ProofNetwork VRF)
- Attack speed: 1 hit/second
- Range: Adjacent grid squares only

MOVEMENT:
- Speed: 2 squares/second
- Diagonal movement allowed
- Collision blocks movement
- Client-side prediction + server reconciliation

TARGETING PRIORITY:
1. Lowest HP enemy in range
2. Closest enemy if tie
3. ProofNetwork VRF random if still tied
```

### **6.4 TIME LIMIT**

```
GAME PHASES:
0:00 - 0:10: PREPARATION PHASE
- Warriors can move but no damage
- Power-ups don't spawn yet
- "Battle begins in..." countdown

0:10 - 1:30: BATTLE PHASE
- Full combat enabled
- Power-ups spawn normally
- Arena at full size

1:30 - 2:00: SUDDEN DEATH
- Arena shrinks
- Double environmental damage
- Power-ups spawn 2x faster
- Dramatic music intensifies

2:00: FORCE END
- If multiple warriors alive:
  - Highest HP wins
  - Tiebreak: Last to enter
- Nuclear explosion animation
```

---

## **7. PHASER IMPLEMENTATION**

### **7.1 Scene Architecture**

```typescript
// Scene hierarchy
- PreloaderScene    // Asset loading
- MainMenuScene     // Wallet connection, lobby
- ArenaScene        // Main gameplay
- UIScene           // Persistent UI overlay
- GameOverScene     // Results and replay

// Scene communication via EventBus
EventBus.emit('warriorSpawned', { player, position })
EventBus.emit('powerUpCollected', { type, warrior })
EventBus.emit('warriorEliminated', { warrior, killer })
```

### **7.2 Sprite System**

```typescript
// Base Warrior Class
export abstract class BaseWarrior extends Phaser.Physics.Arcade.Sprite {
  protected hp: number = 100
  protected maxHp: number = 100
  protected speed: number = 100
  protected damage: number = 5
  protected attackCooldown: number = 1000
  
  // Visual components
  protected healthBar: HealthBar
  protected nameTag: NameTag
  protected effectsContainer: Phaser.GameObjects.Container
  
  // Network sync
  public warriorId: string
  public lastServerPosition: Phaser.Math.Vector2
  public interpolationTarget: Phaser.Math.Vector2
}

// Power-up sprites with particle effects
export class PowerUp extends Phaser.GameObjects.Sprite {
  private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter
  public powerType: PowerUpType
  
  collectEffect(): void {
    // Particle burst on collection
    // Sound effect
    // UI notification
  }
}
```

### **7.3 Real-time Synchronization**

```typescript
// WebSocket integration
export class NetworkManager {
  private socket: Socket
  private gameScene: ArenaScene
  
  connect() {
    this.socket = io(GAME_SERVER_URL)
    
    // Listen for game updates
    this.socket.on('gameState', (state: GameState) => {
      this.reconcileState(state)
    })
    
    this.socket.on('warriorMoved', (data: MovementData) => {
      this.interpolateWarriorPosition(data)
    })
  }
  
  // Client-side prediction
  moveWarrior(direction: Vector2) {
    // Move locally immediately
    this.gameScene.playerWarrior.move(direction)
    
    // Send to server
    this.socket.emit('move', { direction, timestamp: Date.now() })
  }
}
```

---

## **8. USER INTERFACE**

### **8.1 Wallet Integration UI**

```
CONNECTED WALLET DISPLAY:
┌─────────────────────────────────────┐
│ 👛 7xKQ...3nFA  │  💰 12.5 SOL     │
│ ⚔️ Games: 47    │  🏆 Wins: 8      │
│ 📊 Level: 12    │  🔥 Streak: 3    │
└─────────────────────────────────────┘

NEW PLAYER WELCOME:
╔═══════════════════════════════════════╗
║        Welcome to Aurelius!           ║
║                                       ║
║   Your first battle awaits, warrior.  ║
║                                       ║
║  Entry includes profile creation      ║
║  (one-time: 0.002 SOL)               ║
║                                       ║
║  [Enter Arena - 0.004 SOL total] 🗡️   ║
╚═══════════════════════════════════════╝
```

### **8.2 In-Game HUD**

```typescript
// React component overlay
export function ArenaHUD() {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {/* Top bar */}
      <div className="flex justify-between p-4">
        <PotDisplay amount={potSize} />
        <Timer seconds={timeRemaining} phase={gamePhase} />
        <WarriorCount alive={aliveCount} total={totalCount} />
      </div>
      
      {/* Kill feed */}
      <KillFeed events={eliminationEvents} />
      
      {/* Player status */}
      <PlayerStatus 
        hp={playerHp}
        effects={activeEffects}
        position={gridPosition}
      />
    </div>
  )
}
```

### **8.3 Mobile Controls**

```typescript
// Touch-optimized controls
export function MobileControls() {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4">
      <Joystick
        size={120}
        baseColor="rgba(255,255,255,0.3)"
        stickColor="rgba(255,255,255,0.8)"
        onMove={(direction) => EventBus.emit('joystickMove', direction)}
      />
    </div>
  )
}
```

---

## **9. SOUND & VISUAL EFFECTS**

### **9.1 Audio Design**

```
SOUND CATEGORIES:
- Ambient: Crowd cheers, arena atmosphere
- Combat: Sword clashes, hit impacts
- UI: Button clicks, notifications
- Music: Epic orchestral, dynamic intensity

IMPLEMENTATION:
- Use Howler.js for web audio
- Positional audio for combat sounds
- Dynamic music layers based on game phase
```

### **9.2 Visual Effects**

```
PARTICLE EFFECTS:
- Blood splatter on hits
- Dust clouds on movement
- Power-up collection bursts
- Death disintegration

SCREEN EFFECTS:
- Camera shake on eliminations
- Arena lighting changes in sudden death
- Victory spotlight on winner
```

---

## **10. MONETIZATION & ECONOMY**

### **10.1 Revenue Streams**

```
PRIMARY:
- 3% platform fee on prize pools
- Premium cosmetic warrior skins (future)

SECONDARY:
- Battle pass system (future)
- Tournament entry fees (future)
- Sponsored arenas (future)
```

### **10.2 Token Economics (Future)**

```
$GLADIUS TOKEN:
- Governance over game parameters
- Staking for fee reduction
- Exclusive tournament access
- Cosmetic purchases
```

---

## **11. PROOFNETWORK INTEGRATION**

### **11.1 VRF Implementation**

ProofNetwork provides cryptographically secure randomness with verifiable proofs, essential for fair gameplay mechanics.

```javascript
// Game Server VRF Integration
const ProofNetworkAPI = {
  // Combat damage calculation
  async calculateDamage(warriorId) {
    const result = await vrfApi.selectNumber(5, 8);
    return {
      damage: result.result,
      proof: result.proof,
      seed: result.seed
    };
  },

  // Power-up spawn location
  async selectPowerUpLocation(validPositions) {
    const result = await vrfApi.selectFromArray(validPositions, 1);
    return {
      position: result.result[0],
      verificationSteps: result.verificationSteps
    };
  },

  // Target selection for AI
  async selectTarget(equalPriorityTargets) {
    const result = await vrfApi.selectFromArray(equalPriorityTargets, 1);
    return result.result[0];
  }
};
```

### **11.2 Smart Contract Integration**

```javascript
// ProofNetwork Smart Contract for Winner Verification
const state = {
  games: {},
  vrfResults: {}
};

async function determineWinner(inputs) {
  const { gameId } = inputs;
  const game = state.games[gameId];
  
  if (!game || !game.isEnded) {
    throw new Error("Game not ended");
  }
  
  // Multiple warriors with same HP - use VRF
  const topWarriors = game.warriors.filter(w => w.hp === game.maxHp);
  
  if (topWarriors.length > 1) {
    const result = await vrfApi.selectFromArray(
      topWarriors.map(w => w.player),
      1
    );
    
    // Store VRF proof for transparency
    state.vrfResults[gameId] = {
      winner: result.result[0],
      proof: result.proof,
      seed: result.seed,
      timestamp: Date.now()
    };
    
    return {
      winner: result.result[0],
      method: "VRF_TIEBREAK",
      vrfProof: result.proof
    };
  }
  
  return {
    winner: topWarriors[0].player,
    method: "HIGHEST_HP"
  };
}
```

### **11.3 Blackbox Security for Game Keys**

```javascript
// Secure key management for game server
async function initializeGameServer(inputs) {
  // Generate and store game server signing key
  const keypair = blackbox.generateSolanaKeypair();
  blackbox.storeSecret("gameServerKey", keypair.privateKey);
  
  // Store API keys securely
  blackbox.storeSecret("heliusApiKey", inputs.heliusKey);
  blackbox.storeSecret("socketSecret", inputs.socketSecret);
  
  state.gameServer = {
    publicKey: keypair.publicKey,
    initialized: true
  };
  
  return { 
    serverPublicKey: keypair.publicKey 
  };
}

// Sign game results for on-chain verification
async function signGameResult(inputs) {
  const { gameId, winner, finalState } = inputs;
  
  const message = JSON.stringify({
    gameId,
    winner,
    timestamp: Date.now(),
    finalState
  });
  
  const signature = await blackbox.signMessage(
    "gameServerKey",
    message
  );
  
  return {
    signature,
    message,
    serverKey: state.gameServer.publicKey
  };
}
```

### **11.4 Performance Benefits**

```
PROOFNETWORK ADVANTAGES:
- VRF Response Time: <5ms for combat calculations
- Array Selection: Up to 20,000 items supported
- Rate Limits: 500 requests/second per contract
- Verification: Independent proof verification
- No external dependencies or oracles needed
```

---

## **12. SECURITY & ANTI-CHEAT**

### **12.1 Security Measures**

```
ON-CHAIN SECURITY:
✅ PDAs control permissions
✅ Escrow holds all game funds
✅ ProofNetwork VRF for true randomness
✅ Time-based game endings
✅ Winner verification logic

OFF-CHAIN SECURITY:
✅ Server-authoritative movement
✅ Input validation and sanitization
✅ Rate limiting on actions
✅ Replay system for disputes
```

### **12.2 Anti-Cheat System**

```typescript
// Server-side validation
class AntiCheat {
  validateMovement(warrior: Warrior, newPos: Position): boolean {
    // Check movement speed
    const distance = calculateDistance(warrior.position, newPos)
    const maxDistance = warrior.speed * deltaTime
    if (distance > maxDistance * 1.1) return false
    
    // Check collision
    if (checkCollision(newPos)) return false
    
    // Check bounds
    if (!arena.contains(newPos)) return false
    
    return true
  }
}
```

---

## **13. DEVELOPMENT ROADMAP**

### **13.1 MVP Phase (7 Days)**

```
Day 1-2: Smart Contracts
- [ ] Player PDA system
- [ ] Game escrow mechanics
- [ ] Entry and prize distribution
- [ ] ProofNetwork smart contract integration

Day 3-4: Game Server
- [ ] WebSocket setup
- [ ] Battle state management
- [ ] Movement and combat logic
- [ ] ProofNetwork VRF integration for randomness

Day 5-6: Frontend
- [ ] Phaser arena scene
- [ ] Wallet integration
- [ ] Real-time synchronization

Day 7: Polish & Deploy
- [ ] Testing and bug fixes
- [ ] Basic sound effects
- [ ] Deployment to devnet
```

### **13.2 Post-MVP Features**

```
PHASE 2 (Week 2-3):
- [ ] Mobile responsive design
- [ ] Advanced particle effects
- [ ] Leaderboards
- [ ] Sound and music

PHASE 3 (Month 2):
- [ ] Tournament mode
- [ ] Cosmetic system
- [ ] Social features
- [ ] Referral program

PHASE 4 (Month 3+):
- [ ] Token launch
- [ ] DAO governance
- [ ] Cross-chain expansion
- [ ] Mobile apps
```

---

## **14. TECHNICAL SPECIFICATIONS**

### **14.1 Performance Targets**

```
METRICS:
- 60 FPS on desktop
- 30 FPS on mobile
- <100ms input latency
- <50ms server tick rate
- Support 100 concurrent battles
```

### **14.2 Scalability Design**

```
ARCHITECTURE:
- Horizontal game server scaling
- Redis for session management
- CDN for static assets
- RPC endpoint load balancing
- Database sharding for stats
```

---

## **15. ANALYTICS & METRICS**

### **15.1 Key Metrics**

```
PLAYER METRICS:
- Daily Active Users (DAU)
- Average session length
- Retention (D1, D7, D30)
- Average games per session
- Win rate distribution

ECONOMIC METRICS:
- Total Value Locked (TVL)
- Average pot size
- Fee revenue
- Player lifetime value
```

### **15.2 Analytics Implementation**

```typescript
// Event tracking
Analytics.track('game_started', {
  player: wallet.publicKey,
  entry_fee: entryFee,
  warrior_count: warriorCount,
  pot_size: potSize
})

Analytics.track('game_ended', {
  player: wallet.publicKey,
  result: 'win' | 'lose',
  placement: placement,
  duration: duration,
  eliminations: eliminations
})
```

---

## **16. LAUNCH STRATEGY**

### **16.1 Soft Launch**

```
WEEK 1:
- Private beta (100 users)
- Bug bounty program
- Streamer early access

WEEK 2-3:
- Public beta on devnet
- Community feedback
- Balance adjustments

WEEK 4:
- Mainnet launch
- Marketing campaign
- Influencer partnerships
```

### **16.2 Community Building**

```
CHANNELS:
- Discord server with roles
- Twitter with daily updates
- Twitch streams of battles
- YouTube tutorials
- Reddit community

INCENTIVES:
- Early player rewards
- Referral bonuses
- Community tournaments
- Creator program
```

---

## **17. COMPETITIVE ADVANTAGES**

```
WHY AURELIUS WINS:
1. TRUE OWNERSHIP: On-chain verification
2. INSTANT PAYOUTS: No withdrawal delays
3. FAIR PLAY: ProofNetwork VRF randomness
4. SMOOTH GAMEPLAY: 60 FPS experience
5. MOBILE READY: Play anywhere
6. SOCIAL PROOF: Transparent stats
7. LOW FEES: Only 3% platform cut
8. QUICK GAMES: 2-minute matches
```

---

## **18. RISK MITIGATION**

### **18.1 Technical Risks**

```
RISK: Network congestion
MITIGATION: Priority fees, transaction retry

RISK: Server downtime
MITIGATION: Multi-region deployment, failover

RISK: Smart contract bugs
MITIGATION: Audits, bug bounty, upgradeable
```

### **18.2 Business Risks**

```
RISK: Low player liquidity
MITIGATION: Bot players, guaranteed pots

RISK: Regulatory issues
MITIGATION: Legal review, geo-blocking

RISK: Competition
MITIGATION: Fast iteration, community focus
```

---

## **19. APPENDICES**

### **A. Vibecoding Collaboration Plan**

```
PARTNER SPLIT:
Partner A (Smart Contracts):
- Anchor program development
- On-chain game logic
- Security implementation

Partner B (Frontend/Game):
- Phaser implementation
- UI/UX design
- Real-time server

INTERFACE CONTRACT:
- Defined before coding
- WebSocket event specs
- Data structure alignment
```

### **B. Asset Requirements**

```
SPRITES NEEDED:
- Warrior designs (5 variations)
- Power-up orbs (4 types)
- Arena tileset
- UI elements
- Particle textures

AUDIO NEEDED:
- Combat sounds (10+)
- UI sounds (5+)
- Background music (3 tracks)
- Victory/defeat stingers
```

### **C. Dependencies**

```json
{
  "dependencies": {
    "@coral-xyz/anchor": "^0.30.0",
    "@solana/web3.js": "^1.90.0",
    "phaser": "^3.90.0",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "zustand": "^4.5.0",
    "socket.io-client": "^4.7.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  },
  "proofNetworkIntegration": {
    "apiEndpoint": "https://proofnetwork.lol/api",
    "vrfEndpoints": {
      "range": "/vrf/range",
      "array": "/vrf/array"
    },
    "smartContracts": {
      "deploy": "/blockchain/contracts/deploy",
      "call": "/blockchain/contracts/call"
    }
  }
}
```

---

*Last Updated: [Current Date]*
*Version: 1.0.0*