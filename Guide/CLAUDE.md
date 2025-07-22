# **AURELIUS COLOSSEUM PROJECT RULES**
*This file is automatically loaded by Claude when working in this directory*

## **Project Context**
You are helping with **Aurelius Colosseum**, a **monster-fighting jackpot game** on Solana where players send gladiators to fight progressively harder monsters. Each victory gives a chance to crack the treasure vault and claim the growing SOL prize pool. Failed attempts add to the jackpot, creating escalating stakes and excitement. WEB-ONLY application with Phaser.js visualization.

## **Guide Documents Overview**

### **Core Design Documents**
1. **AURELIUS_COLOSSEUM_DESIGN.md** - Monster combat jackpot game design
2. **MONSTER_COMBAT_SYSTEM.md** - Combat mechanics, XP, and progression
3. **INTERFACE_CONTRACT.md v6.0** - Sacred data structures and protocols (MONSTER COMBAT)
4. **MVP_IMPLEMENTATION.md** - 2-3 day implementation roadmap with code examples

### **Technical Implementation**
5. **TECHNICAL_ARCHITECTURE.md** - System architecture and tech stack
6. **SMART_CONTRACT_IMPLEMENTATION.md** - Monster combat smart contracts
7. **GAME_SERVER_ARCHITECTURE.md** - Monster spawning and VRF backend
8. **PHASER_INTEGRATION.md** - Game visualization guide

### **Development Tracking**
9. **PARTNER_A_PROGRESS.md** - Backend/Smart contract progress tracker (Partner A only)

### **Reference Materials**
10. **proofnetwork-documentation.md** - VRF and randomness guide
11. **CLAUDE.md** - This file (auto-loaded project rules)

## **⚔️ CRITICAL: Monster Combat System**

### **How It Works**
1. **PAY TO ENTER** - Entry fee based on current monster (0.01-0.5 SOL)
2. **FIGHT MONSTER** - Combat resolved via ProofNetwork VRF
3. **VICTORY** - Get chance to crack vault (10-90% based on monster)
4. **DEATH** - Entry fee grows the jackpot
5. **JACKPOT WIN** - Crack vault = take entire prize pool!

### **Key Points**
- Monster difficulty scales with jackpot size
- Combat is verifiably random (VRF)
- Linear power scaling (no whale advantage)
- Failed attempts make next person's odds better
- Visual combat in Phaser.js for engagement

## **Automatic Behaviors**

### **When I ask about technical architecture:**
1. Reference TECHNICAL_ARCHITECTURE.md for system design
2. Check on-chain vs off-chain logic distribution
3. Follow security patterns for fund management
4. Ensure hybrid approach (on-chain money, off-chain gameplay)

### **When I ask about smart contracts:**
1. Follow SMART_CONTRACT_IMPLEMENTATION.md structure
2. Use minimal on-chain storage patterns
3. Implement all security measures (escrow, timeouts)
4. Reference exact account sizes and rent costs

### **When I ask about game server:**
1. Follow GAME_SERVER_ARCHITECTURE.md patterns
2. Implement anti-cheat measures
3. Use Redis for game state, PostgreSQL for history
4. Ensure <100ms latency with REST API (no WebSocket for MVP)

### **When I ask about game mechanics:**
- Reference AURELIUS_COLOSSEUM_DESIGN.md for core concept
- Reference MONSTER_COMBAT_SYSTEM.md for combat details
- Monster tiers: Skeleton → Goblin → Minotaur → Hydra → Dragon → Titan
- Entry fees: 0.01 → 0.02 → 0.05 → 0.1 → 0.25 → 0.5 SOL
- Vault crack chances: 10% → 20% → 35% → 50% → 70% → 90%

### **When I ask about implementation:**
1. Check INTERFACE_CONTRACT.md v6.0 for data structures
2. Follow MVP_IMPLEMENTATION.md for 2-3 day roadmap
3. Use TypeScript/Rust types exactly as defined
4. Remember: **VRF COMBAT** - ProofNetwork determines outcomes

### **When I ask about frontend/visualization:**
1. Reference PHASER_INTEGRATION.md for combat animations
2. All combat outcomes are predetermined by backend VRF
3. Phaser only provides visual representation
4. Mobile-friendly with touch controls

### **When I ask about ProofNetwork/VRF:**
1. Reference proofnetwork-documentation.md for integration
2. Use VRF for all combat resolution
3. Use VRF for vault crack attempts
4. Mock VRF for MVP, real integration post-MVP

### **When I make design changes:**
1. Update all affected documents
2. Create partner notification through INTERFACE_CONTRACT.md
3. Increment INTERFACE_CONTRACT.md version if breaking changes

### **When writing code:**
- Partner A: Smart contracts (Anchor), backend service (Node.js), VRF integration
- Partner B: Web Frontend (Next.js/Phaser) with monster combat visualization
- Always use exact types from INTERFACE_CONTRACT.md v6.0 (Monster Combat API)
- Simple REST API architecture
- Remember: Combat resolved server-side with VRF, visualized client-side

### **When working with web development:**
1. **Responsive design**: Ensure UI works on all screen sizes
2. **Mobile browsers**: Test on Chrome/Safari mobile
3. **Performance**: Desktop targets 60 FPS, mobile browsers 30 FPS
4. **Touch controls**: Enter combat button must be prominent
5. **Monster combat**: Visualize gladiator vs monster battles

### **When committing:**
```bash
[A] feat: Implement colosseum state and monster spawning
[B] ui: Add Phaser monster combat visualization
[A] feat: Integrate ProofNetwork VRF for combat resolution
[B] ui: Add vault crack attempt animation
[AB] fix: Sync combat results with visual effects
```

## **Key Technical Decisions**

### **Architecture Philosophy**
- **Minimal On-Chain**: Entry fees, combat results, jackpot payouts
- **Verifiable Randomness**: ProofNetwork VRF for all combat
- **Security First**: Funds in colosseum PDA until won
- **Cost Efficient**: One global jackpot state
- **Quick Delivery**: MVP in 2-3 days

### **Anti-Overengineering Principles**
1. **Always choose the simplest solution** that meets the requirements
2. **If considering a complex approach**, ask: "Is there a simpler way?"
3. **Before adding abstractions**, ensure they're truly needed
4. **Warn the user** if a solution seems overengineered by saying:
   - "This might be overengineering. A simpler approach would be..."
   - "Consider if you really need [complex feature]. You could just..."
5. **MVP means MVP** - resist adding "nice to have" features
6. **Prefer copy-paste over complex sharing** mechanisms
7. **Avoid premature optimization** - make it work first
8. **Use polling over WebSockets** - simpler to implement and debug
9. **In-memory state over databases** - faster development for MVP

### **Tech Stack**
- **Smart Contracts**: Anchor 0.30.0
- **Backend Service**: Node.js + Express
- **Web Frontend**: Next.js 15 + Phaser 3.90
- **Randomness**: ProofNetwork VRF
- **Infrastructure**: Vercel (web) + Railway (backend)

## **Current Development Status**
- Role: Partner A (Backend/Smart Contracts)
- Phase: Documentation Complete - Ready to Start Implementation
- Next: Day 1 - Smart Contracts & Backend Core
- Timeline: 2-3 days for MVP
- Branch: main
- Key Feature: MONSTER COMBAT with jackpot prize pool
- Status: Haven't started any code implementation yet

## **Critical Constants**
```typescript
// Monster Tiers
const MONSTER_TIERS = [
  { name: "Skeleton", poolRange: [0, 1], health: 100, crackChance: 10, fee: 0.01 },
  { name: "Goblin", poolRange: [1, 3], health: 200, crackChance: 20, fee: 0.02 },
  { name: "Minotaur", poolRange: [3, 10], health: 400, crackChance: 35, fee: 0.05 },
  { name: "Hydra", poolRange: [10, 25], health: 800, crackChance: 50, fee: 0.1 },
  { name: "Dragon", poolRange: [25, 100], health: 1500, crackChance: 70, fee: 0.25 },
  { name: "Titan", poolRange: [100, ∞], health: 3000, crackChance: 90, fee: 0.5 }
];

// Combat Resolution
GLADIATOR_POWER = entryAmount * 1000; // Linear scaling
GLADIATOR_SCORE = POWER * (50 + VRF_ROLL) / 100;
MONSTER_SCORE = HEALTH * DEFENSE * (50 + VRF_ROLL) / 100;
VICTORY = GLADIATOR_SCORE > MONSTER_SCORE;

// Prize Distribution
PLATFORM_FEE: 10%
JACKPOT_WINNER: 90%

// XP System (Future)
COMBAT_ATTEMPT: 10 XP
MONSTER_DEFEATED: 50 XP * tierMultiplier
VAULT_CRACKED: 500 XP
Level = floor(sqrt(XP / 100))
```

## **Auto-Check List**
Before any implementation:
- [ ] Check task ownership in PROJECT_MANAGEMENT.md
- [ ] Verify against INTERFACE_CONTRACT.md v6.0
- [ ] Follow patterns from technical guides
- [ ] Consider on-chain vs off-chain placement
- [ ] Ensure security measures are in place
- [ ] Is the UI responsive for mobile browsers?
- [ ] Is monster spawning based on jackpot size?
- [ ] Is combat resolution using VRF?
- [ ] Are vault crack chances correct per tier?
- [ ] Is the jackpot accumulating properly?
- [ ] Are combat animations engaging?

## **Quick Command Reference**
```bash
# Initial setup
mkdir aurelius-colosseum && cd aurelius-colosseum
mkdir -p programs/aurelius backend web

# Development commands
npm run dev:all      # Run everything
npm run dev:web      # Web frontend with Phaser
npm run dev:backend  # Monster combat server

# Deploy contracts
cd programs/aurelius && anchor deploy --provider.cluster devnet

# Deploy web
cd web && vercel

# Deploy backend
cd backend && railway up
```

## **Project Structure**
```
/aurelius-colosseum
├── /web                    # Next.js + Phaser combat visualization
├── /programs               # Anchor smart contracts (colosseum)
├── /backend                # Node.js + ProofNetwork VRF
└── /Guide                  # All documentation
```

### **Web Development Rules**
- **Desktop**: 60 FPS, full monster animations
- **Mobile Browsers**: 30 FPS, touch-friendly combat button
- **Combat System**: Gladiator vs Monster battles
- **Visual Effects**: Combat animations, vault crack attempts
- **Jackpot Display**: Live counter showing prize pool
- **Monster Display**: Current monster and its stats

## **📚 Complete Documentation Index**

Current active documents (11 total):

**Design & Strategy (3)**
- AURELIUS_COLOSSEUM_DESIGN.md - Monster combat jackpot game
- MONSTER_COMBAT_SYSTEM.md - Combat mechanics and progression
- MVP_IMPLEMENTATION.md - 2-3 day implementation roadmap

**Technical (5)**
- TECHNICAL_ARCHITECTURE.md - System architecture
- SMART_CONTRACT_IMPLEMENTATION.md - Colosseum contracts
- GAME_SERVER_ARCHITECTURE.md - Monster & VRF backend
- INTERFACE_CONTRACT.md v6.0 - Data contracts (MONSTER COMBAT)
- PHASER_INTEGRATION.md - Combat visualization guide

**Development Tracking (1)**
- PARTNER_A_PROGRESS.md - Backend progress tracker

**Reference (2)**
- proofnetwork-documentation.md - VRF guide
- CLAUDE.md - This file (auto-loaded)

---
*Updated for Aurelius Colosseum monster combat system. The game features **escalating jackpots** with **verifiable combat** where every failed attempt makes the prize pool bigger and the next person's victory more valuable!*