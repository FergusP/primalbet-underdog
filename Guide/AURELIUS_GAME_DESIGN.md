# **AURELIUS: COMPLETE GAME DESIGN DOCUMENT**
*Real-time PvP Battle Arena on Solana*

## **1. GAME OVERVIEW**

### **Core Concept**
<!-- MVP:START -->
Aurelius is an auto-battle PvP arena on Solana where players send AI-controlled warriors into the colosseum and buy power-ups to help them win. The last survivor claims the growing prize pool funded by all player actions.

**MVP Mode**: Arena Blitz - 90-second auto-battles with strategic power-up purchases
<!-- MVP:END -->

<!-- POST-MVP:PHASE3 -->
**Full Vision**: Dual-mode system with:
- **Arena Blitz**: 90-second quick battles for instant action  
- **Glory Siege**: 5-minute strategic wars for epic moments
<!-- POST-MVP:END -->

### **Target Audience**
- Primary: Crypto gamers seeking both quick thrills and strategic depth
- Secondary: DeFi users looking for gamified yield opportunities
- Tertiary: Mobile gamers wanting bite-sized or epic sessions
- Quaternary: Streamers/content creators seeking viral moments

### **Platform**
- Web-based (MVP)
- Mobile responsive
- Native mobile apps (future)
- Streaming-optimized spectator mode

---

## **2. CORE GAME LOOP**

```
DISCOVER → ENTER → BATTLE → SURVIVE → WIN/LOSE → COLLECT
    ↑                                                    ↓
    ←←←←←←←←←←← REPEAT (FOMO/REVENGE) ←←←←←←←←←←←←←←←←
```

### **Detailed Loop Breakdown**

<!-- MVP:START -->
#### **🔥 Arena Blitz Mode (60-90 seconds) - MVP FOCUS**

1. **DISCOVER** (5 seconds)
   - See active arena with current pot size
   - Watch ongoing battles as spectator
   - Check timer and warrior count
   - "Quick Match" label for mobile users

2. **ENTER** (5 seconds)
   - Connect wallet
   - Pay entry fee (0.002 SOL)
   - Random spawn position
   - Instant combat begins

3. **BATTLE** (60-90 seconds)
   - No prep phase - immediate action
   - Fast power-up spawns (every 10s)
   - High environmental damage (2 HP/3s)
   - Arena shrinks at 45 seconds

4. **WIN/LOSE** (5 seconds)
   - Single winner takes 95%
   - Quick stats display
   - "Play Again" for instant rematch
<!-- MVP:END -->

<!-- POST-MVP:PHASE3 -->
#### **🏰 Glory Siege Mode (3-5 minutes)**

1. **DISCOVER** (30 seconds)
   - See scheduled game countdown
   - Preview current entries (up to 100)
   - Watch previous game highlights
   - Study arena zones and strategy

2. **ENTER** (Until game start)
   - Connect wallet
   - Pay entry fee (0.01 SOL)
   - Choose strategic position
   - Form pre-game alliances (chat)

3. **PREPARATION** (30 seconds)
   - Position warriors strategically
   - No damage during this phase
   - Study opponent placements
   - Plan power-up routes

4. **BATTLE** (3-4 minutes)
   - Zone-based combat
   - Power-ups can be saved/combined
   - Slower environmental damage (1 HP/5s)
   - Multiple shrinking phases

5. **WIN/LOSE** (10 seconds)
   - Top 3 split prizes (60%/25%/10%)
   - Detailed statistics
   - Replay highlights available
   - Next game countdown
<!-- POST-MVP:END -->

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

<!-- MVP:START -->
```typescript
MVP FIRST JOIN FLOW:
1. New player clicks "Join Game"
2. Frontend builds transaction with TWO instructions:
   
   Instruction 1: create_player_profile
   - Creates Player PDA
   - User pays rent (~0.002 SOL)
   - Initializes basic stats (no XP)
   
   Instruction 2: join_game
   - Fixed 0.002 SOL entry fee
   - Max 10 players
   - Random spawn position

3. User signs ONE transaction
4. Both operations atomic - succeed or fail together
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
```typescript
FULL FIRST JOIN FLOW:
- Includes XP initialization
- Multi-warrior support
- Choose spawn position
```
<!-- POST-MVP:END -->

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
- Visual: Top-down view with 2.5D perspective

BLITZ MODE:
- Single zone arena
- Center spawns most power-ups
- Edges relatively safe early
- Rapid shrinking at 45s

SIEGE MODE:
- Three distinct zones:
  - Outer Ring: Safe, few power-ups
  - Mid Ring: Balanced risk/reward
  - Center: High risk, best rewards
- Territory control points
- Gradual multi-phase shrinking
```

**Environmental Mechanics:**

#### **Arena Blitz Environmental**
```
FAST PRESSURE:
- Environmental damage: 2 HP/3 seconds
- Shrink begins: 45 seconds (50% reduction)
- Outside damage: 5 HP/second
- Final phase: 3 HP/2 seconds
```

#### **Glory Siege Environmental**
```
STRATEGIC PRESSURE:
- Environmental damage: 1 HP/5 seconds
- Phase 1 shrink: 2 minutes (20% reduction)
- Phase 2 shrink: 3.5 minutes (40% total)
- Phase 3 shrink: 4.5 minutes (60% total)
- Outside damage: 3 HP/second
```

### **6.2 POWER-UPS**

<!-- MVP:START -->
#### **MVP Power-Ups (Blitz Only)**
```
1. HEALTH POTION (Green orb)
   - Spawn rate: Every 15 seconds
   - Effect: +25 HP instant heal
   - Location: Random positions
   - Visual: Simple green circle

2. RAGE MODE (Red orb)
   - Spawn rate: Every 30 seconds
   - Effect: 2x damage for 10 seconds
   - Location: Center bias
   - Visual: Simple red circle
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
#### **Additional Blitz Power-Ups**
```
3. SPEED BOOST (Blue orb)
   - Spawn rate: Every 15 seconds
   - Effect: 1.5x movement speed for 8 seconds
   - Location: Random positions
   - Visual: Blue trail effect

4. SHIELD (Yellow orb)
   - Spawn rate: Once at 30 seconds
   - Effect: Block next 2 hits
   - Location: Exact center
   - Visual: Golden barrier
```
<!-- POST-MVP:END -->

#### **Glory Siege Power-Ups**
```
1. HEALTH POTION (Green orb)
   - Spawn rate: Every 20 seconds
   - Effect: +25 HP instant (or save for +40 HP)
   - Location: All zones
   - Can combine: 2 potions = full heal

2. RAGE MODE (Red orb)
   - Spawn rate: Every 40 seconds
   - Effect: 1.5x damage for 20 seconds
   - Location: Mid/Center zones only
   - Can stack duration (max 40s)

3. SPEED BOOST (Blue orb)
   - Spawn rate: Every 30 seconds
   - Effect: 1.3x movement speed for 15 seconds
   - Location: Outer/Mid zones
   - Can share with allies

4. SHIELD (Yellow orb)
   - Spawn rate: Every 60 seconds
   - Effect: Block next 3 hits
   - Location: Center zone only
   - Can transfer to ally

5. GODSLAYER ORB (Divine gold) - Siege Only
   - Spawn rate: 0.5% chance when pot > 1 SOL
   - Effect: 50 damage projectile
   - Requirements: ≤3 warriors from same wallet
   - Visual: Divine golden explosion
```

### **6.3 COMBAT SYSTEM**

<!-- MVP:START -->
#### **MVP Combat System**
```
DAMAGE CALCULATION:
- Base warrior HP: 100
- Fixed damage: 6 HP per hit
- Attack speed: 1 hit/second
- Range: Adjacent grid squares only

MOVEMENT (AI-CONTROLLED):
- Base speed: 2 squares/second
- Diagonal movement allowed
- Simple collision detection
- AI pathfinding to nearest enemy

TARGETING PRIORITY:
1. Closest enemy in range
2. Random if tie
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
#### **Full Combat System**
```
DAMAGE CALCULATION:
- Base warrior HP: 100
- Variable damage: 5-8 (ProofNetwork VRF)
- Attack speed: 1 hit/second
- Range: Adjacent grid squares only

MOVEMENT:
- Client-side prediction + server reconciliation
- Advanced pathfinding

TARGETING PRIORITY:
1. Lowest HP enemy in range
2. Closest enemy if tie
3. ProofNetwork VRF random if still tied
```
<!-- POST-MVP:END -->

<!-- POST-MVP:PHASE4 -->
#### **Entry Timing Balance**
```
EARLY ENTRY BONUSES:
- Veteran Damage: +1% per 10 seconds survived
- Territory Control: +2 HP/10s in controlled zones
- Kill Reward: +5 HP per elimination
- Power-up Priority: 5s early access window

LATE ENTRY PENALTIES:
- Spawn HP: 70 (not 100)
- Random spawn in danger zones
- Spawn immunity: 1 second (vs 5 for early)
- Entry fee scaling: up to 3x base fee
```

#### **Underdog Mechanics**
```
WHEN OUTNUMBERED 5:1:
- Underdog Rage: +10% damage
- Survivor Speed: +10% movement
- Evasion Chance: 20% dodge
- Visual: "Lone Wolf" glowing aura

SECOND WIND MIRACLE:
- Trigger: HP < 10
- Chance: 2% (ProofNetwork VRF)
- Effect: Instant heal to 30 HP
- Limit: First 2 warriors per wallet
- Visual: Phoenix rebirth animation
```
<!-- POST-MVP:END -->

### **6.3.5 INPUT-DRIVEN BATTLE SYSTEM**

#### **Player Input System**
```
STRATEGIC INPUTS:
- Join Timing: Early bird bonus vs late entry risk
- Position Choice: Center (risky) vs edges (safe)
- Power-Up Timing: When to activate for max weight
- Alliance Decisions: Form, maintain, or betray
- Resource Management: Save or spend power-ups

VISUAL FEEDBACK (Not Real Combat):
- See warriors "fighting" (animation only)
- Watch HP bars decrease (fake damage)
- Power-up effects trigger (visual only)
- Momentum bar fills (psychological)
```

#### **Backend Processing**
```
WEIGHT CALCULATION FACTORS:
1. Entry timing score (earlier = better)
2. Action efficiency (quality over quantity)
3. Power-up timing (strategic usage)
4. Alliance behavior (cooperation bonus)
5. Risk-taking score (bold moves rewarded)
6. Combo multiplier (chained actions)
7. Hidden luck factor (0.8-1.2x)

VRF WINNER SELECTION:
- Sum all warrior weights
- VRF picks random number
- Winner = warrior whose weight range contains number
- Higher weight = better odds (but not guaranteed)
```

### **6.4 POWER-UP MARKETPLACE**

#### **How It Works**
```
MARKETPLACE SYSTEM:
- Power-ups displayed with SOL prices
- Limited time offers (10-30 seconds)
- Purchase adds to prize pool
- Affects your weight calculation

WEIGHT IMPACT:
- Timing matters (use at right moment)
- Efficiency counts (don't waste them)
- Combos increase weight (chain actions)
- Strategic usage = higher weight
```

#### **Power-Up Effects**
```
VISUAL EFFECTS (What You See):
1. Health Boost: +25 HP animation (fake)
2. Rage Mode: Red aura, 2x damage text
3. Speed Boost: Blue trails, faster movement
4. Shield: Golden bubble effect

WEIGHT MODIFIERS (Hidden):
1. Health Boost: +Defensive score
2. Rage Mode: +Aggressive score
3. Speed Boost: +Tactical score
4. Shield: +Survival score

PRICING:
- Basic (0.001-0.002 SOL): Small weight boost
- Advanced (0.003-0.005 SOL): Medium weight boost
- Ultimate (0.008-0.01 SOL): Large weight boost
```

### **6.5 WINNER DETERMINATION SYSTEM**

#### **Input Processing**
```
BACKEND COLLECTS ALL INPUTS:
1. Entry time & position
2. Power-up purchases & activation
3. Alliance formations/betrayals
4. Action timing & efficiency
5. Risk-taking behavior

CONVERTS TO WEIGHT FACTORS:
- Entry bonus: +50-200 (early bird)
- Position value: +20-100 (risk/reward)
- Action count: +5 per action
- Efficiency: ×1.0-2.0 multiplier
- Combos: ×1.1-3.0 multiplier
- Luck: ×0.8-1.2 (random)
```

#### **VRF Selection**
```
FINAL WEIGHT CALCULATION:
1. Base weight (1000) + all bonuses
2. Apply all multipliers
3. Result: Each warrior has final weight

WINNER SELECTION:
1. Sum all warrior weights (e.g., 10,000)
2. VRF picks number 0-10,000
3. Find warrior whose range contains number
4. That warrior wins entire pot!

Example:
- Warrior A: 0-2500 (weight 2500)
- Warrior B: 2501-6000 (weight 3500)
- Warrior C: 6001-10000 (weight 4000)
- VRF picks: 7234 → Warrior C wins!
```

### **6.6 TIME LIMITS & PHASES**

<!-- MVP:START -->
#### **MVP Arena Blitz (90s only)**
```
0:00 - 0:45: BATTLE PHASE
- Instant combat on spawn
- 2 power-up types only
- Full arena available

0:45 - 1:30: FINAL PHASE
- Arena shrinks to 50%
- Environmental damage: 2 HP/3s
- Last warrior standing wins
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
#### **Full Arena Blitz Phases**
```
0:00 - 0:45: PURE CHAOS
- All 4 power-up types
- Dynamic spawn rates
- Advanced effects

0:45 - 1:30: FINAL SHOWDOWN
- Faster power-up spawns
- Increased environmental damage
```
<!-- POST-MVP:END -->

<!-- POST-MVP:PHASE3 -->
#### **Glory Siege Phases (3-5 min)**
```
0:00 - 0:30: STRATEGY PHASE
- No damage allowed
- Position warriors
- Study opponents
- Form alliances

0:30 - 2:00: EARLY GAME
- Combat begins
- Territory control matters
- Power-ups spawn normally
- Full arena available

2:00 - 3:30: MID GAME
- First shrink (20%)
- Alliances tested
- Power-up combinations active
- Veteran bonuses accumulate

3:30 - 4:30: LATE GAME
- Second shrink (40% total)
- Environmental damage increases
- Special events may trigger
- Top warriors emerge

4:30 - 5:00: FINAL BATTLE
- Final shrink (60% total)
- Chaos events more likely
- Top 3 positions decided
- Epic finale
```
<!-- POST-MVP:END -->

<!-- POST-MVP:PHASE4 -->
### **6.5 SPECIAL EVENTS**

#### **Chaos Equalizer Events (0.5-2% chance)**
```
1. THE GREAT EQUALIZER
   - Lightning strikes top 3 HP warriors
   - Damage: 30-50 HP
   - Visual: Thunder and lightning
   
2. BERSERKER PLAGUE
   - All warriors set to 50 HP
   - Temporary 2x damage for all
   - Visual: Red mist covers arena
   
3. TELEPORT CHAOS
   - All positions randomized
   - 3 second immunity for all
   - Visual: Portal effects
   
4. DIVINE SHIELD
   - Lowest HP warrior gets immunity
   - Duration: 5 seconds
   - Visual: Golden bubble
```

#### **Dynamic Modifiers (0-2 per game)**
```
COMBAT MODIFIERS:
- Blood Moon: 2x damage for all
- Glass Cannon: 2x damage given/taken
- Pacifist's Curse: -50% all damage
- Berserker Mode: 2x attack speed

ARENA MODIFIERS:
- Tiny Arena: 50% size from start
- Fog of War: Limited vision range
- Lava Floor: Constant 1 HP/sec damage
- Ice Rink: 2x speed, reduced control

ECONOMY MODIFIERS:
- Gold Rush: 3x entry fees and prizes
- Penny Arcade: 0.0005 SOL entry
- High Stakes: 10x everything
- Robin Hood: Top player redistributes HP
```
<!-- POST-MVP:END -->

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
- 3% platform fee on all prize pools
- Mode-specific revenue:
  - Blitz: High volume × 0.002 SOL
  - Siege: Lower volume × 0.01 SOL
- Multi-warrior entry scaling fees

SECONDARY:
- Premium cosmetic warrior skins (future)
- Battle pass system (future)
- Tournament entry fees (future)
- Sponsored arenas (future)
```

### **10.2 Entry Fee Structure**

```
BASE FEES:
- Arena Blitz: 0.002 SOL (~$0.50)
- Glory Siege: 0.01 SOL (~$2.50)

MULTI-WARRIOR SCALING:
1st warrior: Base fee
2nd warrior: Base × 1.05
3rd warrior: Base × 1.10
4th warrior: Base × 1.15
5th+ warrior: Base × 1.20

LATE ENTRY SCALING:
- First 25% of game: Base fee
- 25-50% of game: Base × 1.5
- 50-75% of game: Base × 2.0
- Last 25% of game: Base × 3.0
```

### **10.3 Prize Distribution**

```
ARENA BLITZ:
- Winner: 95% of pot
- Treasury: 3%
- Burn: 2%

GLORY SIEGE:
- 1st Place: 60% of pot
- 2nd Place: 25% of pot
- 3rd Place: 10% of pot
- Treasury: 3%
- Burn: 2%
```

### **10.4 Special Events**

```
DAILY CINDERELLA ARENA:
- One special Blitz game per day
- Max 1 warrior per wallet
- Entry: 0.001 SOL (half price)
- Guaranteed pot: 10 SOL
- True equal odds for all

WEEKLY GLORY CHAMPIONSHIP:
- Special Siege game
- Entry: 0.05 SOL
- Guaranteed pot: 100 SOL
- Top 10 receive prizes
- Streaming featured
```

### **10.5 Token Economics (Future)**

```
$AURELIUS TOKEN:
- Governance over game parameters
- Vote on special event rules
- Staking for fee reduction:
  - 1000 tokens: 5% discount
  - 5000 tokens: 10% discount
  - 10000 tokens: 20% discount
- Exclusive tournament access
- Premium cosmetic purchases
```

---

## **11. PROOFNETWORK INTEGRATION**

### **11.1 VRF Implementation for Auto-Battle AI**

ProofNetwork provides cryptographically secure randomness with verifiable proofs, essential for fair AI decisions and gameplay mechanics.

```javascript
// Game Server VRF Integration for Auto-Battle
const ProofNetworkAPI = {
  // AI Target Selection (When multiple enemies at same distance)
  async selectAITarget(warrior, equalDistanceEnemies) {
    const result = await vrfApi.selectFromArray(equalDistanceEnemies, 1);
    return {
      target: result.result[0],
      proof: result.proof,
      reason: "Multiple enemies at equal distance"
    };
  },

  // AI Movement Direction (When multiple paths available)
  async selectMovementPath(warrior, validPaths) {
    const result = await vrfApi.selectFromArray(validPaths, 1);
    return {
      path: result.result[0],
      proof: result.proof,
      reason: "Multiple valid paths to target"
    };
  },

  // AI Power-up Usage Timing
  async decidePowerUpUsage(warrior, powerUp) {
    const useChance = await vrfApi.selectNumber(1, 100);
    const shouldUse = useChance.result <= powerUp.aiUsageChance;
    return {
      shouldUse,
      proof: useChance.proof,
      roll: useChance.result,
      threshold: powerUp.aiUsageChance
    };
  },

  // Combat damage calculation
  async calculateDamage(warriorId) {
    const result = await vrfApi.selectNumber(5, 8);
    return {
      damage: result.result,
      proof: result.proof,
      seed: result.seed
    };
  },

  // Spawn position selection
  async selectSpawnPosition(availablePositions) {
    const result = await vrfApi.selectFromArray(availablePositions, 1);
    return {
      position: result.result[0],
      proof: result.proof
    };
  }
};

// Example AI Decision with Proof
async function makeAIDecision(warrior) {
  const enemies = findEnemiesInRange(warrior);
  
  // If multiple enemies at same distance, use VRF
  const groupedByDistance = groupEnemiesByDistance(enemies);
  const closestDistance = Math.min(...Object.keys(groupedByDistance));
  const closestEnemies = groupedByDistance[closestDistance];
  
  if (closestEnemies.length > 1) {
    // Provably fair random selection
    const decision = await ProofNetworkAPI.selectAITarget(warrior, closestEnemies);
    
    // Log decision for transparency
    await logAIDecision({
      warriorId: warrior.id,
      decision: 'target_selection',
      options: closestEnemies.map(e => e.id),
      selected: decision.target.id,
      proof: decision.proof,
      timestamp: Date.now()
    });
    
    return decision.target;
  }
  
  return closestEnemies[0];
}
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

<!-- POST-MVP:PHASE2 -->
## **17. XP & PROGRESSION SYSTEM**

### **17.1 XP Rewards Structure**

XP is earned through various in-game actions, rewarding both participation and skill:

```typescript
// Base XP Rewards
const XP_REWARDS = {
  // Participation
  BASE_PARTICIPATION: 10,        // Just for playing
  PER_MINUTE_SURVIVED: 10,       // Survival bonus
  
  // Combat
  PER_ELIMINATION: 25,           // Each kill
  DAMAGE_DEALT: 0.1,            // 1 XP per 10 damage
  
  // Objectives  
  POWER_UP_COLLECTED: 5,         // Each power-up
  TERRITORY_CONTROLLED: 15,      // Per zone per minute (Siege)
  
  // Victory Bonuses
  BLITZ_WINNER: 100,            // Single winner
  SIEGE_1ST: 150,               // First place
  SIEGE_2ND: 75,                // Second place  
  SIEGE_3RD: 50,                // Third place
  
  // Special Bonuses
  UNDERDOG_MULTIPLIER: 2,       // 2x all XP
  GODSLAYER_KILL: 50,          // Using Godslayer orb
  SPECIAL_EVENT_SURVIVAL: 20,   // Surviving chaos events
  FIRST_BLOOD: 15,             // First elimination
  COMEBACK_VICTORY: 30,         // Win from <20 HP
}
```

### **17.2 Level Calculation**

```typescript
// Level Formula
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

// XP Requirements per Level
LEVEL_REQUIREMENTS = {
  1: 100,         // New warrior
  5: 2500,        // Experienced
  10: 10000,      // Veteran
  15: 22500,      // Elite
  20: 40000,      // Champion
  25: 62500,      // Master
  30: 90000,      // Grandmaster
  40: 160000,     // Legend
  50: 250000,     // Mythic
  75: 562500,     // Immortal
  100: 1000000,   // God of War
}
```

### **17.3 XP Calculation Example**

```typescript
// Game Server XP Calculation
class XPCalculator {
  calculateGameXP(
    warrior: WarriorStats,
    gameMode: GameMode,
    placement: number
  ): XPBreakdown {
    let baseXP = XP_REWARDS.BASE_PARTICIPATION;
    let bonusXP = 0;
    
    // Survival time
    const minutesSurvived = Math.floor(warrior.survivalTime / 60);
    baseXP += minutesSurvived * XP_REWARDS.PER_MINUTE_SURVIVED;
    
    // Combat XP
    baseXP += warrior.eliminations * XP_REWARDS.PER_ELIMINATION;
    baseXP += Math.floor(warrior.damageDealt * XP_REWARDS.DAMAGE_DEALT);
    
    // Objectives
    baseXP += warrior.powerUpsCollected * XP_REWARDS.POWER_UP_COLLECTED;
    
    // Victory bonuses
    if (gameMode === GameMode.Blitz && placement === 1) {
      bonusXP += XP_REWARDS.BLITZ_WINNER;
    } else if (gameMode === GameMode.Siege) {
      if (placement === 1) bonusXP += XP_REWARDS.SIEGE_1ST;
      else if (placement === 2) bonusXP += XP_REWARDS.SIEGE_2ND;
      else if (placement === 3) bonusXP += XP_REWARDS.SIEGE_3RD;
    }
    
    // Special bonuses
    if (warrior.gotFirstBlood) bonusXP += XP_REWARDS.FIRST_BLOOD;
    if (warrior.godslayerKills > 0) {
      bonusXP += warrior.godslayerKills * XP_REWARDS.GODSLAYER_KILL;
    }
    if (warrior.survivedSpecialEvents > 0) {
      bonusXP += warrior.survivedSpecialEvents * XP_REWARDS.SPECIAL_EVENT_SURVIVAL;
    }
    
    // Apply multipliers
    let totalXP = baseXP + bonusXP;
    if (warrior.wasUnderdog) {
      totalXP *= XP_REWARDS.UNDERDOG_MULTIPLIER;
    }
    
    return {
      baseXP,
      bonusXP,
      multiplier: warrior.wasUnderdog ? 2 : 1,
      totalXP,
      breakdown: this.getDetailedBreakdown(warrior)
    };
  }
}
```

### **17.4 Progression Milestones**

```typescript
// Milestone Rewards (For Future Implementation)
const LEVEL_MILESTONES = {
  // Titles
  1: { type: 'TITLE', reward: 'Recruit' },
  5: { type: 'TITLE', reward: 'Warrior' },
  10: { type: 'TITLE', reward: 'Veteran' },
  20: { type: 'TITLE', reward: 'Champion' },
  50: { type: 'TITLE', reward: 'Legend' },
  
  // Cosmetic Unlocks (Future)
  15: { type: 'COSMETIC', reward: 'Golden Aura' },
  25: { type: 'COSMETIC', reward: 'Victory Banner' },
  35: { type: 'COSMETIC', reward: 'Elite Warrior Skin' },
  
  // Feature Access (Future)
  30: { type: 'ACCESS', reward: 'Tournament Qualifier' },
  40: { type: 'ACCESS', reward: 'Private Lobbies' },
  
  // Prestige Levels (Future)
  100: { type: 'PRESTIGE', reward: 'Prestige 1 - Reset with Legacy Badge' }
}
```

### **17.5 XP Events & Multipliers**

```typescript
// Temporary XP Events
const XP_EVENTS = {
  DOUBLE_XP_WEEKEND: {
    multiplier: 2,
    duration: '48 hours',
    frequency: 'Monthly'
  },
  
  FIRST_WIN_BONUS: {
    bonus: 50,
    frequency: 'Daily',
    resetTime: '00:00 UTC'
  },
  
  HAPPY_HOUR: {
    multiplier: 1.5,
    timeSlot: '20:00-22:00 UTC',
    frequency: 'Daily'
  },
  
  SEASONAL_EVENTS: {
    multiplier: 3,
    examples: ['Launch Week', 'Holiday Special', 'Anniversary']
  }
}
```

### **17.6 Level Display & UI**

```typescript
// Player Profile Display
interface PlayerLevelDisplay {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
  title: string;
  badge: string; // Visual indicator
}

// In-Game XP Notifications
interface XPNotification {
  action: string;        // "Elimination!"
  xpGained: number;     // "+25 XP"
  multiplier?: number;  // "2x Underdog!"
  total: number;        // Running total for session
}

// Post-Game XP Summary
interface PostGameXPSummary {
  breakdown: {
    participation: number;
    combat: number;
    objectives: number;
    bonuses: number;
  };
  multipliers: string[];
  totalGained: number;
  levelProgress: {
    before: number;
    after: number;
    leveledUp: boolean;
  };
}
```

### **17.7 Future XP Features**

```
PLANNED EXPANSIONS:
- Seasonal Battle Pass with XP requirements
- XP Boosters (purchasable/earnable)
- Clan/Guild shared XP bonuses
- Mentor system (bonus XP for helping new players)
- Achievement-based XP rewards
- Daily/Weekly XP challenges
- Leaderboards by XP gain rate
```
<!-- POST-MVP:END -->

---

*Last Updated: [Current Date]*
*Version: 1.1.0*