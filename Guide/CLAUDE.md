# **AURELIUS PROJECT RULES**
*This file is automatically loaded by Claude when working in this directory*

## **Project Context**
You are helping with Aurelius, a dual-mode real-time PvP battle arena on Solana featuring Arena Blitz (90s quick battles) and Glory Siege (5min strategic wars). The game is being developed for BOTH web and mobile platforms to target two hackathons simultaneously.

## **Guide Documents Overview**

### **Core Design Documents**
1. **AURELIUS_GAME_DESIGN.md** - Complete game design with dual modes
2. **DUAL_MODE_COMPLETE_DESIGN.md** - Detailed dual-mode mechanics and balance
3. **INTERFACE_CONTRACT.md v3.0** - Sacred data structures and protocols
4. **DUAL_PLATFORM_STRATEGY.md** - Web + Mobile development strategy
5. **MINIMUM_MVP.md** - Dual-platform MVP guide (5-7 days)

### **Technical Implementation**
6. **TECHNICAL_ARCHITECTURE.md** - System architecture and tech stack
7. **SMART_CONTRACT_IMPLEMENTATION.md** - Anchor framework guide
8. **GAME_SERVER_ARCHITECTURE.md** - Real-time backend implementation
9. **SHARED_CODE_PATTERNS.md** - Code sharing between web/mobile platforms

### **Collaboration & Process**
10. **PROJECT_MANAGEMENT.md** - Task division and responsibilities
11. **DESIGN_CHANGE_PROTOCOL.md** - How to handle design changes
12. **WORKFLOW_COLLAB.md** - Vibecoding methodology

### **Reference Materials**
13. **proofnetwork-documentation.md** - VRF and randomness guide
14. **AURELIUS_APPEAL_STRATEGY.md** - User psychology insights

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
1. Check INTERFACE_CONTRACT.md v2.0 for data structures
2. Verify task ownership in PROJECT_MANAGEMENT.md
3. Follow the 10-14 day implementation roadmap
4. Use TypeScript/Rust types exactly as defined

### **When I make design changes:**
1. Follow DESIGN_CHANGE_PROTOCOL.md strictly
2. Update all affected documents
3. Create partner notification
4. Increment INTERFACE_CONTRACT.md version if breaking

### **When writing code:**
- Partner A: Smart contracts (Anchor), game server (Node.js), ProofNetwork
- Partner B: Web Frontend (Next.js/Phaser), Mobile Frontend (React Native/Skia)
- Always use exact types from INTERFACE_CONTRACT.md v3.0
- Share code via /shared folder (copy-paste approach)
- Follow security patterns from architecture guides

### **When working with platforms:**
1. **Shared code changes**: Update /shared first, then sync to both platforms
2. **Platform-specific code**: Clearly mark with comments
3. **Testing**: Always test on BOTH platforms before marking complete
4. **Performance**: Web targets 60 FPS, Mobile targets 30 FPS
5. **Code patterns**: Follow SHARED_CODE_PATTERNS.md for cross-platform code

### **When dual-platform development:**
1. Reference DUAL_PLATFORM_STRATEGY.md for architecture
2. Use SHARED_CODE_PATTERNS.md for code sharing
3. Check MINIMUM_MVP.md for MVP scope (5-7 days)
4. Follow platform-specific optimizations

### **When committing:**
```bash
[A] feat: Implement game escrow with multi-winner support
[B-Web] ui: Add Phaser arena scene for web
[B-Mobile] ui: Add React Native Skia arena for mobile
[B-Shared] feat: Create shared battle logic
[AB] fix: Sync warrior position calculation
```

## **Key Technical Decisions**

### **Architecture Philosophy**
- **Minimal On-Chain**: Only money and verification
- **Maximum Performance**: 60 FPS, <100ms latency
- **Security First**: Funds always in escrow PDAs
- **Cost Efficient**: ~0.003 SOL rent per account
- **Quick Delivery**: MVP in 10-14 days

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

### **Tech Stack**
- **Smart Contracts**: Anchor 0.30.0 (shared)
- **Game Server**: Fastify + Socket.io + Redis (shared)
- **Web Frontend**: Next.js 15 + Phaser 3.90
- **Mobile Frontend**: React Native + Skia
- **Shared Logic**: TypeScript modules (copy-paste)
- **Infrastructure**: Vercel (web) + EAS (mobile) + Railway + Helius RPC

## **Current Development Status**
- Role: Partner A (Backend)
- Phase: Dual-Platform Architecture Complete
- Next: Core Development (Day 1-3)
- Timeline: 5-7 days for dual-platform MVP
- Branch: main

## **Critical Constants**
```typescript
// Game Modes
BLITZ: { duration: 90s, fee: 0.002 SOL, max: 20 }
SIEGE: { duration: 300s, fee: 0.01 SOL, max: 100 }

// Combat
HP: 100 (70 for late entry)
DAMAGE: 5-8 (VRF)
VETERAN_BONUS: +1% per 10s

// Special Events
GODSLAYER_ORB: 0.5% spawn, 50 damage
SECOND_WIND: 2% chance at <10 HP

// XP System
BASE_PARTICIPATION: 10 XP
PER_ELIMINATION: 25 XP
PER_MINUTE_SURVIVED: 10 XP
DAMAGE_DEALT: 1 XP per 10 damage
POWER_UP_COLLECTED: 5 XP

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
- [ ] Verify against INTERFACE_CONTRACT.md v3.0
- [ ] Follow patterns from technical guides
- [ ] Consider on-chain vs off-chain placement
- [ ] Ensure security measures are in place
- [ ] Will this affect BOTH web and mobile implementations?
- [ ] Is this code shareable between platforms?

## **Quick Command Reference**
```bash
# Initial setup
mkdir aurelius && cd aurelius
mkdir -p programs/aurelius server shared web mobile

# Sync shared code
npm run sync:shared

# Development commands
npm run dev:all      # Run everything
npm run dev:web      # Web only
npm run dev:mobile   # Mobile only
npm run dev:server   # Server only

# Deploy contracts
cd programs/aurelius && anchor deploy --provider.cluster devnet

# Platform builds
cd web && vercel       # Deploy web
cd mobile && eas build # Build mobile
```

## **Dual-Platform Project Structure**
```
/Aurelius
├── /web                    # Next.js web app
├── /mobile                 # React Native mobile app
├── /shared                 # Shared game logic (copy-paste)
├── /programs               # Anchor smart contracts
├── /server                 # Shared game server
└── /Guide                  # All documentation
```

### **Platform-Specific Rules**
- **Web**: Full features, keyboard controls, 60 FPS, all browsers
- **Mobile**: Touch controls, 30 FPS, battery optimization, reconnection handling
- **Shared**: Pure TypeScript functions, no platform-specific imports
- **Server**: Platform-agnostic WebSocket, mobile-optimized batching

## **📚 Complete Documentation Index**

All 15 guide documents are now synchronized:

**Design & Strategy (5)**
- AURELIUS_GAME_DESIGN.md - Core game design
- DUAL_MODE_COMPLETE_DESIGN.md - Mode balance
- DUAL_PLATFORM_STRATEGY.md - Platform strategy
- MINIMUM_MVP.md - MVP implementation
- AURELIUS_APPEAL_STRATEGY.md - User psychology

**Technical (5)**
- TECHNICAL_ARCHITECTURE.md - System design
- SMART_CONTRACT_IMPLEMENTATION.md - Blockchain
- GAME_SERVER_ARCHITECTURE.md - Backend
- INTERFACE_CONTRACT.md - Data contracts
- SHARED_CODE_PATTERNS.md - Code sharing

**Process & Collaboration (3)**
- PROJECT_MANAGEMENT.md - Task tracking
- WORKFLOW_COLLAB.md - Team workflow
- DESIGN_CHANGE_PROTOCOL.md - Change management

**Reference (2)**
- proofnetwork-documentation.md - VRF guide
- CLAUDE.md - This file (auto-loaded)

---
*Updated with dual-platform architecture and comprehensive project context. All guide documentation files are now referenced and synchronized.*