# **AURELIUS: COMPLETE GAME DESIGN DOCUMENT**
*Real-time PvP Battle Arena on Solana*

## **1. GAME OVERVIEW**

### **Core Concept**
<!-- MVP:START -->
Aurelius is an **input-driven PvP arena** on Solana where players make strategic decisions while watching visual combat theater. There is NO real combat - warriors fighting is pure animation. Players win through strategic input timing, and the winner is determined by a weight-based VRF system.

**MVP Mode**: Arena Blitz - 90-second strategic input collection with visual feedback
<!-- MVP:END -->

<!-- POST-MVP:PHASE3 -->
**Full Vision**: Dual-mode system with:
- **Arena Blitz**: 90-second quick battles for instant action  
- **Glory Siege**: 5-minute strategic wars for epic moments
<!-- POST-MVP:END -->

### **Target Audience**
- Primary: Strategy gamers who prefer thinking over reflexes
- Secondary: Crypto users seeking fair, transparent gaming
- Tertiary: Mobile users wanting quick strategic sessions
- Quaternary: Psychology enthusiasts who enjoy reading other players

### **Platform**
- Web-based only (responsive design)
- Mobile browser optimized
- Desktop and mobile browser support
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
   - Input collection begins

3. **INPUT PHASE** (60-90 seconds)
   - No prep phase - immediate strategic decisions
   - Fast power-up offers (every 10s)
   - Visual effects escalate
   - Arena appears to "shrink" (visual only)

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
   - Pure strategy phase
   - Study opponent placements
   - Plan power-up routes

4. **INPUT COLLECTION** (3-4 minutes)
   - Zone-based strategic positioning
   - Power-ups can be timed/combined
   - Visual effects intensify
   - Multiple visual escalation phases

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
- Visual shrinking effects at 45s

SIEGE MODE:
- Three distinct zones:
  - Outer Ring: Safe, few power-ups
  - Mid Ring: Balanced risk/reward
  - Center: High risk, best rewards
- Territory control points
- Visual multi-phase effects
```

**Environmental Mechanics:**

#### **Arena Blitz Visual Effects**
```
FAST ESCALATION:
- Visual intensity increases rapidly
- Shrinking animation: 45 seconds
- Edge warning effects
- Final phase: Maximum visual chaos
```

#### **Glory Siege Visual Effects**
```
STRATEGIC ESCALATION:
- Visual effects build gradually
- Phase 1: 2 minutes (first escalation)
- Phase 2: 3.5 minutes (mid intensity)
- Phase 3: 4.5 minutes (high intensity)
- Edge warnings for players
```

### **6.2 POWER-UPS**

<!-- MVP:START -->
#### **MVP Power-Ups (Blitz Only)**
```
1. MOMENTUM BOOST (Green orb)
   - Cost: 0.001 SOL
   - Weight Effect: +25% base weight
   - Timing: Instant application
   - Visual: Green energy surge

2. RAGE MODE (Red orb)
   - Cost: 0.002 SOL  
   - Weight Effect: 2x weight multiplier for 10 seconds
   - Timing: Strategic activation crucial
   - Visual: Red aura effect
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
#### **Additional Blitz Power-Ups**
```
3. TACTICAL EDGE (Blue orb)
   - Cost: 0.0015 SOL
   - Weight Effect: +1.5x action efficiency for 8 seconds
   - Timing: Best during input sequences
   - Visual: Blue energy trails

4. GUARDIAN SHIELD (Yellow orb)
   - Cost: 0.003 SOL
   - Weight Effect: +30% weight + immunity to betrayal penalty
   - Duration: One-time protection
   - Visual: Golden protective barrier
```
<!-- POST-MVP:END -->

#### **Glory Siege Power-Ups**
```
1. MOMENTUM BOOST (Green orb)
   - Cost: 0.001 SOL
   - Weight Effect: +25% instant (or save for +40%)
   - Strategic Use: Can stack 2 for mega-boost
   - Timing: Best during alliance formation

2. EXTENDED RAGE (Red orb)
   - Cost: 0.002 SOL
   - Weight Effect: 1.5x weight multiplier for 20 seconds
   - Strategic Use: Can stack duration (max 40s)
   - Timing: Best during betrayal sequences

3. TACTICAL MASTERY (Blue orb)
   - Cost: 0.0015 SOL
   - Weight Effect: 1.3x action efficiency for 15 seconds
   - Strategic Use: Can share bonus with allies
   - Timing: Best during complex input chains

4. FORTRESS SHIELD (Yellow orb)
   - Cost: 0.003 SOL
   - Weight Effect: +35% weight + betrayal immunity
   - Strategic Use: Can transfer to ally
   - Timing: Best when vulnerable

5. GODSLAYER WEIGHT (Divine gold) - Siege Only
   - Cost: 0.01 SOL
   - Weight Effect: Massive +100% weight bonus
   - Requirements: Must have <50% current weight
   - Visual: Divine golden aura (underdog power!)
```

### **6.3 INPUT-DRIVEN SYSTEM (CORE CONCEPT)**

<!-- MVP:START -->
#### **NO REAL COMBAT - VISUAL THEATER ONLY**
```
CRITICAL UNDERSTANDING:
- NO actual warriors fighting each other
- NO real HP - HP bars are fake visual elements
- NO real damage - damage numbers are decorative
- NO real movement - warriors moving is just animation
- Victory determined by INPUT WEIGHTS + VRF randomness

INPUT COLLECTION (What Actually Matters):
- JOIN_GAME: When you enter affects your weight
- ACTIVATE_POWERUP: Strategic timing crucial for weight
- FORM_ALLIANCE: Cooperation adds weight bonus
- BETRAY_ALLIANCE: Risk/reward decision affecting weight

WEIGHT SYSTEM (Hidden Calculation):
- Entry timing: +50-200 weight (early bird bonus)
- Power-up timing: 1.5x-2x multiplier (perfect timing)
- Alliance success: +50 weight (cooperation)
- Betrayal penalty: -100 weight (trust broken)
- Final weight = better odds (but NOT guaranteed win)

VISUAL FEEDBACK THEATER:
- Warriors "fighting" (pure animation for engagement)
- HP bars decreasing (fake - just visual drama)
- Damage numbers (decorative - no real calculation)
- Power-up effects (visual flair - actual effect is weight)
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
#### **Advanced Input System**
```
ADDITIONAL INPUTS:
- TAUNT_ENEMY: Psychological pressure
- DEFENSIVE_STANCE: Risk mitigation
- RALLY_ALLIES: Group coordination

WEIGHT MODIFIERS:
- Combo bonuses for input sequences
- Precision timing rewards
- Social dynamics tracking
- Underdog multipliers

VRF WINNER SELECTION:
- Weights converted to probabilities
- ProofNetwork VRF selects winner
- Proof stored for transparency
```
<!-- POST-MVP:END -->

<!-- POST-MVP:PHASE4 -->
#### **Entry Timing Balance**
```
EARLY ENTRY BONUSES:
- Weight bonus: +10% per 10 seconds early
- Position choice available
- Power-up priority access
- Lower entry fees

LATE ENTRY PENALTIES:
- Weight penalty: Start at 70% base
- Random positioning only
- Higher entry fees (up to 3x)
- No preparation time
```

#### **Underdog Mechanics**
```
WHEN OUTNUMBERED 5:1:
- Underdog weight bonus: +20%
- Visual "Lone Wolf" aura
- Special victory animations

MIRACLE COMEBACK:
- Trigger: Weight < 10% of average
- Chance: 2% for weight boost to 30%
- Limit: Once per player per game
- Visual: Phoenix revival effect
```
<!-- POST-MVP:END -->

### **6.3.5 INPUT-DRIVEN BATTLE SYSTEM**

#### **Input-Driven Strategy System**
```
PLAYER STRATEGIC DECISIONS:
- Join Timing: Early entry = +50-200 weight bonus
- Power-Up Purchases: Cost SOL but add weight multipliers
- Alliance Formation: Temporary cooperation for +50 weight
- Betrayal Decisions: Break alliance for potential gain (-100 penalty if caught)
- Resource Management: When to spend SOL on power-ups

NO REAL COMBAT - VISUAL THEATER:
- Warriors "move" around (scripted animation)
- HP bars "decrease" (fake countdown for drama)
- Damage "effects" trigger (visual spectacle only)
- Power-up "activation" shows (weight change is invisible)
```

#### **Backend Weight Processing**
```
HIDDEN WEIGHT CALCULATION:
1. Base weight: 1000 (everyone starts equal)
2. Entry timing bonus: +50-200 (early bird advantage)
3. Power-up multipliers: 1.5x-2.0x (strategic purchases)
4. Action timing: Perfect timing = bonus weight
5. Alliance cooperation: +50 weight per successful alliance
6. Betrayal consequences: -100 weight penalty
7. Combo effects: Chained actions = multiplier bonuses
8. Luck factor: 0.8x-1.2x random (keeps it interesting)

VRF WINNER DETERMINATION:
- Calculate final weight for each player
- Sum all weights (e.g., total = 15,000)
- VRF picks number 0-15,000
- Winner = player whose weight range contains the number
- Example: Player A (0-3000), Player B (3001-8000), etc.
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

#### **Strategic Power-Up System**

```
POWER-UP STRATEGIC UI:

1. MOMENTUM BOOST (Green) - 0.001 SOL
   ┌─ Base Effect: +25% weight
   ├─ PERFECT TIMING (UI shows green glow):
   │  • During Alliance Formation: +50% bonus
   │  • UI: "ALLIANCE SYNERGY!" text + particles
   └─ Strategic Window: 3 seconds before/after alliance input

2. RAGE MODE (Red) - 0.002 SOL  
   ┌─ Base Effect: 2x weight multiplier (10 seconds)
   ├─ PERFECT TIMING (UI shows red pulse):
   │  • During Betrayal Action: +100% bonus 
   │  • UI: "BETRAYAL FURY!" text + screen shake
   └─ Strategic Window: Must activate BEFORE betrayal input

3. TACTICAL EDGE (Blue) - 0.0015 SOL
   ┌─ Base Effect: 1.5x next 3 actions
   ├─ PERFECT TIMING (UI shows blue highlight):
   │  • During Input Chains: +75% bonus
   │  • UI: "COMBO MASTER!" text + chain animation
   └─ Strategic Window: When 2+ inputs planned

4. GUARDIAN SHIELD (Yellow) - 0.003 SOL
   ┌─ Base Effect: +30% weight + betrayal immunity
   ├─ PERFECT TIMING (UI shows golden crown):
   │  • When alliance target: +50% bonus
   │  • UI: "FORTRESS MIND!" text + protective aura
   └─ Strategic Window: After forming alliance

STRATEGIC UI ELEMENTS:
┌─ Power-Up Timing Bar: Shows optimal activation windows
├─ Combo Counter: Tracks sequential power-up usage  
├─ Weight Meter: Visual representation of your advantage
├─ Alliance Status: Shows cooperation/betrayal opportunities
└─ Perfect Timing Alerts: Golden borders on optimal moments
```

#### **Power-Up Combo System (Easy Weight Calculation)**

```
COMBO MECHANICS (Stack Effects):

🔗 TIER 1 COMBOS (2 Power-Ups):
├─ "MOMENTUM RAGE" (Green + Red):
│  • Effect: 3x weight multiplier instead of 2x
│  • UI: Purple energy explosion
│  • Calculation: (base_weight + 25%) × 3.0
│
├─ "TACTICAL SHIELD" (Blue + Yellow):
│  • Effect: 1.5x efficiency + immunity + 50% weight
│  • UI: Cyan protective barrier
│  • Calculation: base_weight × 1.5 × 1.5 + betrayal_immunity
│
└─ "SHIELD MOMENTUM" (Yellow + Green):
   • Effect: 55% weight + betrayal immunity + alliance bonus
   • UI: Golden-green aura
   • Calculation: base_weight × 1.55 + alliance_double_bonus

🔗 TIER 2 COMBOS (3 Power-Ups):
├─ "TRIPLE THREAT" (Green + Red + Blue):
│  • Effect: 4x weight multiplier for all actions
│  • UI: Rainbow energy storm
│  • Calculation: base_weight × 4.0 (all bonuses stack)
│
└─ "PERFECT DEFENSE" (Green + Yellow + Blue):
   • Effect: 2x weight + immunity + perfect timing on everything
   • UI: Prismatic shield effect
   • Calculation: base_weight × 2.0 + all_perfect_timing_bonuses

🔗 LEGENDARY COMBO (All 4 Power-Ups):
"GLADIATOR ASCENSION":
├─ Effect: 5x weight + all bonuses + guaranteed perfect timing
├─ UI: Epic golden explosion with screen effects
├─ Calculation: base_weight × 5.0 + all_perfect_bonuses
└─ Achievement: "Master Strategist" badge

COMBO TIMING RULES:
├─ Window: Must activate within 5 seconds of each other
├─ Order Matters: Specific sequences give bonus multipliers
├─ UI Feedback: Combo counter shows progress
└─ Strategy: Expensive but game-changing

OPTIMAL COMBO SEQUENCES:
1. Early Game: Shield → Momentum (safe growth)
2. Mid Game: Tactical → Rage (aggressive push) 
3. Late Game: All 4 → "Ascension" (ultimate play)
4. Betrayal Setup: Rage → Tactical (maximum betrayal weight)
```

#### **Strategic UI Implementation**

```
POWER-UP INTERFACE DESIGN:

┌─ Power-Up Store (Always Visible):
│  ┌─ [🟢 MOMENTUM] 0.001 SOL - Ready
│  ├─ [🔴 RAGE] 0.002 SOL - Ready  
│  ├─ [🔵 TACTICAL] 0.0015 SOL - Ready
│  └─ [🟡 SHIELD] 0.003 SOL - Ready
│
├─ Strategy Timing Panel:
│  ┌─ Alliance Opportunity: 🟢 OPTIMAL (green glow)
│  ├─ Betrayal Window: 🔴 AVAILABLE (red pulse)
│  ├─ Input Chain Ready: 🔵 ACTIVE (blue highlight)
│  └─ Vulnerability Status: 🟡 PROTECTED (shield icon)
│
├─ Combo Tracker:
│  ┌─ Current Combo: 0/4 
│  ├─ Combo Timer: [████████] 5s remaining
│  ├─ Next Bonus: "Momentum Rage" (+1x multiplier)
│  └─ Combo Value: +125% total weight bonus
│
└─ Weight Advantage Display:
   ┌─ Your Weight: ████████░░ 80%
   ├─ Average Weight: ████░░░░░░ 40%  
   ├─ Win Probability: 65% chance
   └─ Power-Up Impact: +25% from bonuses

STRATEGIC DECISION PROMPTS:
├─ "Alliance forming - Momentum optimal!" (green notification)
├─ "Betrayal opportunity - Rage recommended!" (red alert) 
├─ "Input chain detected - Tactical advantage!" (blue suggestion)
└─ "Under threat - Shield protection!" (yellow warning)

FEEDBACK SYSTEMS:
├─ Perfect Timing: Screen flash + bonus text + sound
├─ Combo Achieved: Celebration animation + weight boost
├─ Missed Opportunity: Subtle red border + "Try Again!"
└─ Strategic Advantage: Confidence meter + probability update
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