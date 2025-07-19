# **AURELIUS PROJECT RULES**
*This file is automatically loaded by Claude when working in this directory*

## **Project Context**
You are helping with Aurelius, a dual-mode real-time PvP battle arena on Solana featuring Arena Blitz (90s quick battles) and Glory Siege (5min strategic wars).

## **Guide Documents Overview**

### **Core Design Documents**
1. **AURELIUS_GAME_DESIGN.md** - Complete game design with dual modes
2. **DUAL_MODE_COMPLETE_DESIGN.md** - Detailed dual-mode mechanics and balance
3. **INTERFACE_CONTRACT.md v2.0** - Sacred data structures and protocols

### **Technical Implementation**
4. **TECHNICAL_ARCHITECTURE.md** - System architecture and tech stack
5. **SMART_CONTRACT_IMPLEMENTATION.md** - Anchor framework guide
6. **GAME_SERVER_ARCHITECTURE.md** - Real-time backend implementation

### **Collaboration & Process**
7. **PROJECT_MANAGEMENT.md** - Task division and responsibilities
8. **DESIGN_CHANGE_PROTOCOL.md** - How to handle design changes
9. **WORKFLOW_COLLAB.md** - Vibecoding methodology

### **Reference Materials**
10. **proofnetwork-documentation.md** - VRF and randomness guide
11. **AURELIUS_APPEAL_STRATEGY.md** - User psychology insights

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
- Partner B: Frontend (Next.js), game engine (Phaser), UI/UX
- Always use exact types from INTERFACE_CONTRACT.md v2.0
- Follow security patterns from architecture guides

### **When committing:**
```bash
[A] feat: Implement game escrow with multi-winner support
[B] ui: Add dual-mode selection screen
[AB] fix: Sync warrior position calculation
```

## **Key Technical Decisions**

### **Architecture Philosophy**
- **Minimal On-Chain**: Only money and verification
- **Maximum Performance**: 60 FPS, <100ms latency
- **Security First**: Funds always in escrow PDAs
- **Cost Efficient**: ~0.003 SOL rent per account
- **Quick Delivery**: MVP in 10-14 days

### **Tech Stack**
- **Smart Contracts**: Anchor 0.30.0
- **Game Server**: Fastify + Socket.io + Redis
- **Frontend**: Next.js 15 + Phaser 3.90
- **Infrastructure**: Vercel + Railway + Helius RPC

## **Current Development Status**
- Role: Partner A (Backend)
- Phase: Architecture Planning Complete
- Next: Smart Contract Implementation (Day 1-3)
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
- [ ] Verify against INTERFACE_CONTRACT.md v2.0
- [ ] Follow patterns from technical guides
- [ ] Consider on-chain vs off-chain placement
- [ ] Ensure security measures are in place
- [ ] Will this affect Partner B's implementation?

## **Quick Command Reference**
```bash
# Start smart contract development
anchor init aurelius

# Test game server locally
npm run dev:server

# Run integration tests
npm run test:integration

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

---
*Updated with all guide documents for comprehensive project context*