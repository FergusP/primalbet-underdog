# **AURELIUS PROJECT MANAGEMENT**
*Vibecoding Collaboration Guide*

## **📋 Project Overview**

**Project**: Aurelius - Dual-Mode PvP Battle Arena on Solana  
**Platforms**: Web (Next.js) + Mobile (React Native)  
**MVP Duration**: 5-7 days (Both platforms, Arena Blitz only)  
**Full Duration**: 14-21 days (Both platforms, all features)  
**Team Size**: 2 developers  
**Methodology**: Vibecoding (Domain-based collaboration)  
**Target**: 2 Hackathon submissions  

### **Development Phases**
- **Phase 1 - Core (Days 1-3)**: Shared logic, smart contracts, game server
- **Phase 2 - MVP (Days 4-7)**: Web MVP + Mobile MVP (Arena Blitz only)
- **Phase 3 (Week 2)**: Add VRF, XP system, platform polish
- **Phase 4 (Week 3)**: Glory Siege mode, advanced features
- **Phase 5 (Week 4+)**: Hackathon submissions and demos

---

## **👥 Team Roles & Responsibilities**

### **Partner A: Blockchain & Backend Specialist**
**Primary Domain**: Smart Contracts, Game Server, Infrastructure

**MVP Tasks (Days 1-5)**: ~15 tasks
- Basic smart contracts (player profile, game escrow, join/end game)
- Simple Node.js + Socket.io server
- Fixed damage combat (no VRF)
- Basic Redis game state

**Full Project Tasks**: ~42 major tasks
- Smart Contract Development: 9 main tasks
- ProofNetwork Integration: 8 tasks  
- Game Server Development: 18 tasks
- Infrastructure & DevOps: 7 tasks

### **Partner B: Frontend & Game Experience**
**Primary Domain**: Web UI/UX, Mobile UI/UX, Game Engines, Visual Design

**MVP Tasks (Days 1-7)**: ~25 tasks
- Web: Phaser arena, wallet adapter, desktop UI
- Mobile: React Native Skia arena, mobile wallet, touch controls
- Shared: Warrior sprites, power-ups, game states

**Full Project Tasks**: ~60 major tasks
- Web Frontend (Next.js + Phaser): 25 tasks
- Mobile Frontend (React Native): 25 tasks
- Shared Components: 10 tasks
- Visual & Audio Design: 15 tasks

---

## **🔗 Sacred Interface Contract**

### **WebSocket Events (Server → Client)**
```typescript
// Game State Events
'gameStateUpdate': {
  warriors: Warrior[]
  powerUps: PowerUp[]
  timeRemaining: number
  phase: 'preparation' | 'battle' | 'sudden_death'
}

'warriorSpawned': {
  warriorId: string
  player: string
  position: { x: number, y: number }
  hp: number
}

'warriorMoved': {
  warriorId: string
  position: { x: number, y: number }
  timestamp: number
}

'warriorDamaged': {
  warriorId: string
  damage: number
  newHp: number
  attackerId: string
}

'warriorEliminated': {
  warriorId: string
  killedBy: string
  finalPosition: { x: number, y: number }
}

'powerUpSpawned': {
  powerUpId: string
  type: 'health' | 'rage' | 'speed' | 'shield'
  position: { x: number, y: number }
}

'powerUpCollected': {
  powerUpId: string
  warriorId: string
}

'gameEnded': {
  winner: string
  finalState: GameState
  prize: number
}
```

### **Client → Server Events**
```typescript
'joinGame': {
  player: string
  position: { x: number, y: number }
  signature: string
}

'moveWarrior': {
  direction: { x: number, y: number }
  timestamp: number
}

'requestGameState': {}
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

## **🚀 PHASE 1 - CORE DEVELOPMENT (Days 1-3)**

### **Partner A: Core Backend**

#### **Smart Contracts (Day 1)**
- [ ] Initialize Anchor project structure
- [ ] Create basic Player PDA
- [ ] Basic Game Escrow (0.002 SOL entry)
- [ ] join_game and end_game instructions
- [ ] Manual buffer encoding setup

#### **Game Server (Day 2)**
- [ ] Node.js + Socket.io setup
- [ ] Redis game state management
- [ ] Fixed damage combat (6 HP)
- [ ] Movement validation
- [ ] Platform-agnostic WebSocket protocol

#### **Shared Logic (Day 3)**
- [ ] Create /shared folder structure
- [ ] Implement battleLogic.ts
- [ ] Define types.ts interfaces
- [ ] Game constants
- [ ] Test shared functions

### **Partner B: Foundation Setup**

#### **Project Setup (Day 1)**
- [ ] Initialize web (Next.js) project
- [ ] Initialize mobile (Expo) project
- [ ] Setup shared folder structure
- [ ] Configure build scripts

#### **Asset Creation (Day 2-3)**
- [ ] Warrior sprites (web + mobile versions)
- [ ] Power-up graphics
- [ ] Arena backgrounds
- [ ] UI mockups for both platforms

## **🚀 PHASE 2 - DUAL PLATFORM MVP (Days 4-7)**

### **Partner A: Backend Integration**
- [ ] Deploy contracts to devnet
- [ ] ProofNetwork basic setup
- [ ] Server deployment (Railway)
- [ ] Cross-platform testing support
- [ ] Basic monitoring

### **Partner B: Platform Implementation**

#### **Web MVP (Days 4-5)**
- [ ] Phaser arena implementation
- [ ] Wallet adapter integration
- [ ] WebSocket connection
- [ ] Game UI (lobby, results)
- [ ] Desktop controls (WASD)
- [ ] Deploy to Vercel

#### **Mobile MVP (Days 6-7)**
- [ ] React Native Skia arena
- [ ] Mobile wallet integration
- [ ] Touch controls
- [ ] Mobile UI adaptation
- [ ] WebSocket reconnection handling
- [ ] TestFlight build

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

### **Dual-Platform Integration Checkpoints**
- **Day 1**: Smart contracts + Project setup complete
- **Day 2**: Game server running + Assets ready
- **Day 3**: Shared logic tested + Copy to platforms
- **Day 4**: Web MVP playable on localhost
- **Day 5**: Web deployed to Vercel
- **Day 6**: Mobile MVP on simulator
- **Day 7**: Both platforms live!

---

## **🔄 Daily Sync Protocol**

### **Daily Standup Format** (via Discord/Telegram)
```
🌅 PARTNER A - [Date] [Time]
✅ Completed:
- Item 1
- Item 2

🚧 Working on:
- Current task

❓ Blockers:
- Any issues

🔗 Links:
- Relevant commits/PRs
```

### **Integration Checkpoints**
1. **Wallet Connection Test** (Day 2)
2. **Game Mode Selection** (Day 3)
3. **Blitz Mode Entry Flow** (Day 4)
4. **Siege Mode Entry Flow** (Day 5)
5. **Movement & Combat Sync** (Day 6)
6. **Special Events Test** (Day 7)
7. **Full Game Loop Both Modes** (Day 8)
8. **Production Test** (Day 9)

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

### **MVP Completion**
- [ ] Players can connect wallets
- [ ] Players can join games
- [ ] Warriors move and fight
- [ ] Winners receive prizes
- [ ] 2-minute game loop works

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

## **🔄 Platform Coordination**

### **Shared Code Sync Process**
```bash
# When updating shared logic
1. Make changes in /shared
2. Run tests on shared code
3. Copy to both platforms:
   npm run sync:shared
4. Test on both platforms
5. Commit all changes together
```

### **Platform Feature Parity**
- **Core Gameplay**: Must be identical
- **UI/UX**: Can be platform-optimized
- **Controls**: Platform-specific
- **Performance**: Tuned per platform
- **Features**: Same blockchain integration

### **Testing Matrix**
| Feature | Web Chrome | Web Safari | Mobile iOS | Mobile Android |
|---------|------------|------------|------------|----------------|
| Wallet  | ✓          | ✓          | ✓          | ✓              |
| Combat  | ✓          | ✓          | ✓          | ✓              |
| Network | ✓          | ✓          | ✓          | ✓              |
| Render  | 60 FPS     | 60 FPS     | 30 FPS     | 30 FPS         |

---

## **🎯 Post-MVP Roadmap**

### **Week 2 Priorities**
- Mobile optimization
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