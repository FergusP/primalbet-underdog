# **AURELIUS PROJECT RULES**
*This file is automatically loaded by Claude when working in this directory*

## **Project Context**
You are helping with Aurelius, an **input-driven PvP arena** on Solana where players make strategic decisions while watching visual combat theater. **NO REAL COMBAT** - all warrior fighting is fake animation. Winner determined by **weight calculation + VRF system** based on strategic input quality. Features Arena Blitz (90s input collection) and Glory Siege (5min strategic wars). WEB-ONLY application with responsive design.

## **Guide Documents Overview**

### **Core Design Documents**
1. **AURELIUS_GAME_DESIGN.md** - Complete game design with dual modes
2. **DUAL_MODE_COMPLETE_DESIGN.md** - Detailed dual-mode mechanics and balance
3. **INTERFACE_CONTRACT.md v4.0** - Sacred data structures and protocols (INPUT-DRIVEN)
4. **ARCHIVED_DUAL_PLATFORM_STRATEGY.md** - (No longer used - web-only now)
5. **MINIMUM_MVP.md** - Web-only MVP guide (2 days)

### **Technical Implementation**
6. **TECHNICAL_ARCHITECTURE.md** - System architecture and tech stack
7. **SMART_CONTRACT_IMPLEMENTATION.md** - Anchor framework guide
8. **GAME_SERVER_ARCHITECTURE.md** - Real-time backend implementation
9. **SHARED_CODE_PATTERNS.md** - (Archived - no longer needed for web-only)

### **Collaboration & Process**
10. **PROJECT_MANAGEMENT.md** - Task division and responsibilities
11. **DESIGN_CHANGE_PROTOCOL.md** - How to handle design changes
12. **WORKFLOW_COLLAB.md** - Vibecoding methodology

### **Reference Materials**
13. **proofnetwork-documentation.md** - VRF and randomness guide
14. **AURELIUS_APPEAL_STRATEGY.md** - User psychology insights

## **🎮 CRITICAL: Input-Driven Battle System**

### **How It Works**
1. **NO REAL COMBAT** - Warriors don't actually fight each other
2. **INPUT COLLECTION** - Backend collects all player strategic decisions
3. **WEIGHT CALCULATION** - Each input affects player's final weight
4. **VISUAL FEEDBACK** - Frontend shows fake combat animations
5. **VRF SELECTION** - Winner chosen based on weight distribution

### **Key Points**
- Visual HP bars are FAKE (just for show)
- Damage numbers are FAKE (not calculated)
- Movement is VISUAL ONLY (no pathfinding)
- All that matters is WHEN and HOW players make inputs
- Better strategy = Higher weight = Better odds (but not guaranteed)

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
4. Ensure <100ms latency with WebSocket optimization

### **When I ask about game mechanics:**
- Reference DUAL_MODE_COMPLETE_DESIGN.md for mode specifics
- Arena Blitz: 90s, 0.002 SOL, instant action, single winner
- Glory Siege: 5min, 0.01 SOL, strategic, top 3 winners
- Include underdog mechanics and special events

### **When I ask about implementation:**
1. Check INTERFACE_CONTRACT.md v4.0 for data structures
2. Verify task ownership in PROJECT_MANAGEMENT.md
3. Follow the 2-day MVP implementation roadmap
4. Use TypeScript/Rust types exactly as defined
5. Remember: **NO REAL COMBAT** - visual theater only, players make strategic inputs for weight

### **When I make design changes:**
1. Follow DESIGN_CHANGE_PROTOCOL.md strictly
2. Update all affected documents
3. Create partner notification
4. Increment INTERFACE_CONTRACT.md version if breaking

### **When writing code:**
- Partner A: Smart contracts (Anchor), backend service (Node.js), weight calculation system
- Partner B: Web Frontend (Next.js/Phaser) with visual theater
- Always use exact types from INTERFACE_CONTRACT.md v5.0 (Polling API)
- Follow simplified architecture (no WebSockets)
- Remember: NO real combat - only strategic input buttons (join/power-up/alliance/betrayal)

### **When working with web development:**
1. **Responsive design**: Ensure UI works on all screen sizes
2. **Mobile browsers**: Test on Chrome/Safari mobile
3. **Performance**: Desktop targets 60 FPS, mobile browsers 30 FPS
4. **Touch controls**: Buttons must be touch-friendly (44x44px minimum)
5. **Input-driven**: All combat is fake - strategic decisions determine weight/winner

### **When committing:**
```bash
[A] feat: Implement game escrow with power-up purchases
[B] ui: Add Phaser arena scene with visual theater display
[A] feat: Implement weight calculation system
[B] ui: Add strategic input interface (join/power-up buttons)
[AB] fix: Sync weight feedback with visual animations
```

## **Key Technical Decisions**

### **Architecture Philosophy**
- **Minimal On-Chain**: Only money and verification
- **Maximum Performance**: 60 FPS, <100ms latency
- **Security First**: Funds always in escrow PDAs
- **Cost Efficient**: ~0.003 SOL rent per account
- **Quick Delivery**: MVP in 2 days

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

### **Tech Stack (Simplified)**
- **Smart Contracts**: Anchor 0.30.0
- **Backend Service**: Node.js + Express (in-memory state)
- **Web Frontend**: Next.js 15 + Phaser 3.90
- **Randomness**: Simple VRF for winner selection
- **Infrastructure**: Vercel (web + API) + Railway (backend)

## **Current Development Status**
- Role: Partner A (Backend)
- Phase: Web-Only Architecture Complete
- Next: Core Development (Day 1-2)
- Timeline: 2 days for web MVP
- Branch: main
- Key Feature: INPUT-DRIVEN with weight-based VRF winner selection

## **Critical Constants**
```typescript
// Game Modes
BLITZ: { duration: 90s, fee: 0.002 SOL, max: 20 }
SIEGE: { duration: 300s, fee: 0.01 SOL, max: 100 }

// Visual Theater System (NO REAL COMBAT)
FAKE_HP: 100 (visual countdown only)
FAKE_DAMAGE: 5-8 (pure animation)
FAKE_EFFECTS: All power-up visuals
THEATER_UPDATE_RATE: 50ms (visual only)

// Weight System (Hidden from Players)
BASE_WEIGHT: 1000 (everyone starts equal)
ENTRY_TIMING_BONUS: 50-300 (early bird advantage)
POWERUP_MULTIPLIERS: 1.3x-2.0x (strategic purchases)
PERFECT_TIMING_BONUS: +25-50% (optimal usage)
ALLIANCE_BONUS: +75 (cooperation)
BETRAYAL_PENALTY: -100 (trust broken)
UNDERDOG_MULTIPLIER: 2x (comeback protection)
LUCK_FACTOR: 0.85x-1.15x (prevents deterministic)

// Input Types
JOIN_GAME: Entry with position choice
ACTIVATE_POWERUP: Use at strategic moment
FORM_ALLIANCE: Cooperate for bonus
BETRAY_ALLIANCE: Risk for reward


// Victory XP
BLITZ_WINNER: 100 XP
SIEGE_1ST: 150 XP, 2ND: 75 XP, 3RD: 50 XP

// Special Bonuses
UNDERDOG_MULTIPLIER: 2x
GODSLAYER_KILL: 50 XP
FIRST_BLOOD: 15 XP

// Level Formula
Level = floor(sqrt(XP / 100))
```

## **Auto-Check List**
Before any implementation:
- [ ] Check task ownership in PROJECT_MANAGEMENT.md
- [ ] Verify against INTERFACE_CONTRACT.md v5.0
- [ ] Follow patterns from technical guides
- [ ] Consider on-chain vs off-chain placement
- [ ] Ensure security measures are in place
- [ ] Is the UI responsive for mobile browsers?
- [ ] Are strategic inputs being collected with timestamps?
- [ ] Is weight calculation working correctly?
- [ ] Are perfect timing bonuses being applied?
- [ ] Is visual theater engaging but clearly fake?
- [ ] Is VRF winner selection transparent?

## **Quick Command Reference**
```bash
# Initial setup
mkdir aurelius && cd aurelius
mkdir -p programs/aurelius server web

# Development commands
npm run dev:all      # Run everything
npm run dev:web      # Web frontend
npm run dev:server   # Game server

# Deploy contracts
cd programs/aurelius && anchor deploy --provider.cluster devnet

# Deploy web
cd web && vercel
```

## **Simplified Project Structure**
```
/Aurelius
├── /web                    # Next.js + Phaser + API routes
├── /programs               # Anchor smart contracts
├── /backend                # Simple Node.js service
└── /Guide                  # All documentation
```

### **Web Development Rules**
- **Desktop**: 60 FPS, full effects, keyboard shortcuts
- **Mobile Browsers**: 30 FPS, touch-friendly UI, simplified effects
- **Input System**: Collect strategic decisions (JOIN_GAME, ACTIVATE_POWERUP, FORM_ALLIANCE, BETRAY_ALLIANCE)
- **Visual Theater**: Show fake combat animations to maintain engagement
- **Weight System**: All inputs affect final weight → VRF winner selection
- **Perfect Timing**: Power-ups get bonus effects when used optimally

## **📚 Complete Documentation Index**

All 15 guide documents are now synchronized:

**Design & Strategy (5)**
- AURELIUS_GAME_DESIGN.md - Core game design (INPUT-DRIVEN)
- DUAL_MODE_COMPLETE_DESIGN.md - Mode balance
- ARCHIVED_DUAL_PLATFORM_STRATEGY.md - (Archived)
- MINIMUM_MVP.md - MVP implementation (2-day web)
- AURELIUS_APPEAL_STRATEGY.md - User psychology

**Technical (5)**
- TECHNICAL_ARCHITECTURE.md - Simplified polling design
- SMART_CONTRACT_IMPLEMENTATION.md - Blockchain
- GAME_SERVER_ARCHITECTURE.md - Backend service
- INTERFACE_CONTRACT.md v5.0 - Data contracts (POLLING API)
- ARCHIVED_SHARED_CODE_PATTERNS.md - (Mobile removed)

**Process & Collaboration (3)**
- PROJECT_MANAGEMENT.md - Task tracking
- WORKFLOW_COLLAB.md - Team workflow
- DESIGN_CHANGE_PROTOCOL.md - Change management

**Reference (2)**
- proofnetwork-documentation.md - VRF guide
- CLAUDE.md - This file (auto-loaded)

---
*Updated for web-only input-driven architecture. The game features **strategic decision-making** with **visual combat theater** where every action affects your weight/odds and grows the prize pool!*