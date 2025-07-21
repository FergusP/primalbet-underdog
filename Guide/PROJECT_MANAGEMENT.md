# **AURELIUS PROJECT MANAGEMENT**
*Vibecoding Collaboration Guide*

## **📋 Project Overview**

**Project**: Aurelius - Input-Driven PvP Arena on Solana  
**Game Type**: Strategic input collection with visual battle feedback  
**Platforms**: Web (Next.js) + Mobile (React Native)  
**MVP Duration**: 3 days (Both platforms, Arena Blitz only)  
**Full Duration**: 14-21 days (Both platforms, all features)  
**Team Size**: 2 developers  
**Methodology**: Vibecoding (Domain-based collaboration)  
**Target**: 2 Hackathon submissions  

### **Development Phases (INPUT-DRIVEN)**
- **Phase 1 - MVP (Days 1-3)**: Input collection with power-ups
  - Day 1: Smart contracts with power-up purchases
  - Day 2: Input processing server with weight calculation
  - Day 3: Simple UI for both platforms
- **Phase 2 (Week 2)**: Add VRF, better AI, more power-ups
- **Phase 3 (Week 3)**: Glory Siege mode, advanced features
- **Phase 4 (Week 4+)**: Hackathon submissions and demos

---

## **👥 Team Roles & Responsibilities**

### **Partner A: Blockchain & Backend Specialist**
**Primary Domain**: Smart Contracts, Input Processing, Infrastructure

**MVP Tasks (Days 1-2)**: ~12 tasks
- Smart contracts with power-up purchases (buy_power_up instruction)
- Input processing server (InputProcessor.ts)
- Weight calculation engine (WeightCalculator.ts)
- Prize pool tracking (tracks joins + power-ups)
- ProofNetwork VRF for winner selection

**Full Project Tasks**: ~35 major tasks
- Smart Contract Development: 8 main tasks
- Input Processing & Weights: 10 tasks
- ProofNetwork Integration: 8 tasks  
- Infrastructure & DevOps: 7 tasks
- Power-Up System: 2 tasks

### **Partner B: Frontend & Game Experience**
**Primary Domain**: Web UI/UX, Mobile UI/UX, Visual Design

**MVP Tasks (Day 3)**: ~8 tasks
- Simple UI (no complex controls):
  - Join button (send warrior)
  - Power-up marketplace
  - Live prize pool counter
  - Warriors fighting (watch-only)
- Web: Basic Phaser/Canvas arena
- Mobile: React Native Skia arena

**Full Project Tasks**: ~45 major tasks
- Web Frontend (Next.js): 20 tasks
- Mobile Frontend (React Native): 20 tasks
- Visual & Audio Design: 5 tasks

---

## **🔗 Sacred Interface Contract**

### **Polling API (INPUT-DRIVEN)**
```typescript
// Server → Client (Visual feedback only)
'gameStateUpdate': {
  warriors: Warrior[]    // Visual positions only
  visualEffects: VisualEffect[]  // Fake combat
  timeRemaining: number
  phase: 'waiting' | 'active' | 'ended'
}

'visualUpdate': {        // Server sends visual updates
  warriorId: string
  position: { x: number, y: number }
  hp: number             // Fake HP for display
  effect?: string        // Visual effect to play
}

'powerUpOffers': {       // Marketplace for players
  offers: Array<{
    id: string
    type: 'health' | 'rage' | 'chaos' | 'assassinate'
    price: number        // in SOL
    description: string
    expiresIn: number
  }>
}

'potUpdate': {           // Prize pool growth
  currentPot: number     // in SOL
  lastChange: number
  source: 'join' | 'powerup' | 'alliance'
  totalPlayers: number
}

'powerUpPurchased': {    // Someone bought power-up
  buyer: string
  powerUpType: string
  price: number
  newPotSize: number
}
```

### **Client → Server Events (INPUT-DRIVEN)**
```typescript
'connect': {
  wallet: string        // Just wallet, no signature for MVP
}

'playerInput': {         // Strategic input
  type: 'JOIN_GAME' | 'ACTIVATE_POWERUP' | 'FORM_ALLIANCE' | 'BETRAY_ALLIANCE'
  data?: any
  timestamp: number
}

// NO MOVEMENT COMMANDS - Visual feedback only!
```

### **On-Chain Data Structures**
```typescript
// Shared between both partners
interface Position {
  x: number  // 0-19 (grid position)
  y: number  // 0-19 (grid position)
}

interface GameResult {
  gameId: string
  winner: string
  playerCount: number
  totalPot: number
  endTime: number
  vrfProof?: string
}
```

---

## **📋 Complete Task Division**

## **🚀 PHASE 1 - INPUT-DRIVEN MVP (3 Days)**

### **Partner A: Backend & Input Processing**

#### **Day 1: Smart Contracts**
- [ ] Initialize Anchor project
- [ ] PlayerProfile PDA (wins/earnings only)
- [ ] GameEscrow with pool tracking
- [ ] create_player, join_game instructions
- [ ] buy_power_up instruction (90% to pot!)
- [ ] end_game instruction (winner takes all)
- [ ] Deploy to devnet

#### **Day 2: Input Processing Server**
- [ ] Node.js + Express setup
- [ ] InputProcessor.ts - Collect inputs:
  - Track timing
  - Validate actions
  - Store sequences
- [ ] WeightCalculator.ts - Convert to weights
- [ ] VisualEngine.ts - Generate fake combat
- [ ] ProofNetwork VRF for winner selection
- [ ] 50ms visual update loop
- [ ] Test with mock inputs

### **Partner B: Simple UI**

#### **Day 3: Both Platforms**
- [ ] Web: Next.js + basic arena canvas
  - [ ] Join button (0.002 SOL)
  - [ ] Power-up marketplace UI
  - [ ] Live pot counter
  - [ ] Warriors display (watch-only)
- [ ] Mobile: React Native + Skia
  - [ ] Same simple UI as web
  - [ ] Touch-friendly buttons
- [ ] Connect both to server
- [ ] Deploy web to Vercel
- [ ] Build mobile APK

## **📈 POST-MVP FEATURES**

### **Week 2: Enhanced Input System**

#### **Partner A Tasks**
- [ ] Advanced weight factors (combo bonuses)
- [ ] More input types (taunt, defend, rally)
- [ ] Alliance system implementation
- [ ] Better VRF integration
- [ ] Anti-cheat for input timing
- [ ] Performance optimization

#### **Partner B Tasks**  
- [ ] Better animations
- [ ] Sound effects
- [ ] Particle effects
- [ ] Leaderboard UI
- [ ] Power-up purchase effects
- [ ] Mobile optimization

---

## **📈 POST-MVP PHASES**

### **PHASE 2 (Week 2) - Enhanced Features**

#### **Partner A Tasks**
- [ ] ProofNetwork VRF integration (random damage 5-8)
- [ ] XP system implementation
- [ ] Update player stats tracking
- [ ] Increase to 20 players max
- [ ] Add 2 more power-ups (speed, shield)
- [ ] Basic anti-cheat measures

#### **Partner B Tasks**  
- [ ] Add 2 more power-up visuals
- [ ] XP/Level display
- [ ] Improved animations
- [ ] Sound effects
- [ ] Mobile responsive design

### **PHASE 3 (Week 3) - Glory Siege Mode**

#### **Partner A Tasks**
- [ ] Implement Siege mode (5min games, 100 players)
- [ ] Multi-warrior entry support (up to 5)
- [ ] Late entry penalty logic
- [ ] Territory control system
- [ ] Top 3 prize distribution
- [ ] Enhanced power-ups for Siege

#### **Partner B Tasks**
- [ ] Siege mode UI (mode selection, lobbies)
- [ ] Territory control visuals
- [ ] Multi-warrior management UI
- [ ] Zone indicators (outer/mid/center)
- [ ] Enhanced power-up sprites

### **PHASE 4 (Week 4+) - Advanced Features**

#### **Partner A Tasks**
- [ ] Special event system (Chaos Equalizer, etc.)
- [ ] Underdog mechanics
- [ ] Veteran bonuses
- [ ] Godslayer Orb implementation
- [ ] Dynamic modifiers
- [ ] Advanced anti-cheat

#### **Partner B Tasks**
- [ ] Special event animations
- [ ] Arena themes (6 variations)
- [ ] Complete sound design
- [ ] Particle effects system
- [ ] Spectator mode
- [ ] Mobile optimization

---

## **🏃 Daily Sync & Integration**

### **3-Day Sprint Checkpoints**
- **Day 1 AM**: Anchor project initialized
- **Day 1 PM**: All contracts deployed to devnet
- **Day 2 AM**: Input processor collecting data
- **Day 2 PM**: Weight calculation working
- **Day 3 AM**: Both UIs showing visual feedback
- **Day 3 PM**: Full MVP live on both platforms!

---

## **🔄 Daily Sync Protocol**

### **3-Day MVP Sprint Format**
```
🏃 DAY 1 - Smart Contracts
✅ Partner A:
- [ ] All instructions working
- [ ] Power-ups grow the pot
- [ ] Deployed to devnet

🏃 DAY 2 - Input Server
✅ Partner A:
- [ ] Inputs being collected
- [ ] Weights calculated
- [ ] Visual feedback generated

🏃 DAY 3 - Simple UI
✅ Partner B:
- [ ] Both UIs connect
- [ ] Can make strategic inputs
- [ ] Visual combat displayed
```

### **MVP Integration Checkpoints**
1. **Smart Contract Deploy** (Day 1 PM)
2. **Input Server Running** (Day 2 PM)
3. **Weight System Live** (Day 2 PM)
4. **UI Connects to Server** (Day 3 AM)
5. **Visual Feedback Works** (Day 3 PM)
6. **Both Platforms Live** (Day 3 PM)

---

## **🛠️ Development Guidelines**

### **Code Organization**
```
Aurelius/
├── programs/           # Partner A primary
│   └── aurelius/      # Anchor smart contracts
├── server/            # Partner A primary
│   ├── websocket/
│   ├── game-logic/
│   └── proofnetwork/
├── web/               # Partner B primary
│   ├── components/
│   ├── pages/
│   └── lib/
├── mobile/            # Partner B primary
│   ├── components/
│   ├── screens/
│   └── lib/
├── shared/            # Both partners (copy-paste)
│   ├── battleLogic.ts
│   ├── types.ts
│   └── constants.ts
└── Guide/             # Documentation
```

### **Branch Strategy**
- `main` - Production ready code
- `dev` - Integration branch
- `feat/partner-a-*` - Partner A features
- `feat/partner-b-*` - Partner B features
- `platform/web-*` - Web-specific features
- `platform/mobile-*` - Mobile-specific features
- `shared/*` - Shared logic updates
- `mode/blitz-*` - Blitz mode specific
- `mode/siege-*` - Siege mode specific

### **Commit Convention**
```
[A] feat: Add player PDA system
[B] ui: Implement arena scene
[AB] fix: Resolve WebSocket sync issue
```

---

## **🧪 Testing Strategy**

### **Partner A Tests**
- [ ] Smart contract unit tests
- [ ] PDA creation/deletion
- [ ] Fund flow security
- [ ] VRF integration
- [ ] WebSocket stress test

### **Partner B Tests**

#### **Web Tests**
- [ ] Phaser scene loading
- [ ] Browser compatibility (Chrome, Firefox, Safari)
- [ ] Wallet adapter integration
- [ ] Desktop performance (60 FPS)
- [ ] Responsive design

#### **Mobile Tests**
- [ ] React Native Skia rendering
- [ ] Touch gesture accuracy
- [ ] Mobile wallet connection
- [ ] Device compatibility (iOS/Android)
- [ ] Mobile performance (30+ FPS)

### **Integration Tests**
- [ ] Wallet connection flow
- [ ] Game entry process
- [ ] Real-time synchronization
- [ ] Winner payout flow
- [ ] Error handling

---

## **📡 Communication Channels**

### **Primary**: Discord/Telegram
- Daily standups
- Quick questions
- Blocker alerts

### **Secondary**: GitHub
- Code reviews
- Issue tracking
- Documentation

### **Emergency**: Direct calls
- Critical blockers
- Integration issues
- Launch decisions

---

## **🚨 Conflict Resolution**

### **Technical Conflicts**
1. Discuss in daily sync
2. Prototype both solutions
3. Test performance/UX
4. Make data-driven decision

### **Interface Changes**
1. **STOP all work**
2. Discuss impact
3. Update interface contract
4. Update both codebases
5. Test integration

### **Timeline Pressure**
1. Identify MVP features
2. Move nice-to-haves to v2
3. Focus on core loop
4. Polish can come later

---

## **📊 Success Metrics**

### **MVP Completion (INPUT-DRIVEN)**
- [ ] Players can connect wallets
- [ ] Players can join games (0.002 SOL)
- [ ] Players make strategic inputs
- [ ] Visual feedback shows fake combat
- [ ] VRF selects winner by weight
- [ ] 90-second input collection works

### **Quality Metrics**

#### **Both Platforms**
- [ ] No fund loss bugs
- [ ] <100ms server latency
- [ ] 10+ concurrent games
- [ ] Cross-platform multiplayer works

#### **Web Specific**
- [ ] 60 FPS on desktop
- [ ] Works on all major browsers
- [ ] Wallet adapter connects smoothly

#### **Mobile Specific**
- [ ] 30+ FPS on mid-range phones
- [ ] Touch controls responsive
- [ ] Background/foreground handling
- [ ] <50MB app size

---

## **🔄 Development Workflow**

### **Code Integration Process**
```bash
# Daily workflow
1. Partner A pushes contracts/server updates
2. Partner B pulls and integrates with UI
3. Test together via Discord/call
4. Fix issues immediately
5. Deploy when stable
```

### **Browser Testing Matrix**
| Feature | Desktop Chrome | Desktop Safari | Mobile Chrome | Mobile Safari |
|---------|----------------|----------------|---------------|---------------|
| Wallet  | ✓              | ✓              | ✓             | ✓             |
| Combat  | ✓              | ✓              | ✓             | ✓             |
| Network | ✓              | ✓              | ✓             | ✓             |
| FPS     | 60             | 60             | 30            | 30            |

---

## **🎯 Post-MVP Roadmap**

### **Week 2 Priorities**
- Mobile browser optimization
- Sound design
- Particle effects
- Leaderboards
- Tournament mode

### **Month 2 Goals**
- Token integration
- Cosmetic system
- Social features
- Marketing launch
- 1000+ daily users

---

## **🤝 Collaboration Agreement**

By working on this project, both partners agree to:
1. **Communicate daily** via agreed channels
2. **Respect domain boundaries** - trust your partner
3. **Document all changes** that affect the other
4. **Test before integrating** to avoid breaking builds
5. **Celebrate wins together** - this is a team effort!

---

## **📝 Notes Section**

### **Key Decisions**
- _Record important technical decisions here_

### **Lessons Learned**
- _Document what works/doesn't work_

### **Ideas for v2**
- _Park future features here_

---

*Remember: The interface contract is SACRED. Honor it!*