# **AURELIUS PROJECT MANAGEMENT**
*Vibecoding Collaboration Guide*

## **📋 Project Overview**

**Project**: Aurelius - Dual-Mode PvP Battle Arena on Solana  
**MVP Duration**: 3-5 days (Arena Blitz only, 10 players)  
**Full Duration**: 10-14 days (Both modes, all features)  
**Team Size**: 2 developers  
**Methodology**: Vibecoding (Domain-based collaboration)  

### **Development Phases**
- **Phase 1 - MVP (Days 1-5)**: Arena Blitz only, basic features, 10 players max
- **Phase 2 (Week 2)**: Add VRF, XP system, more power-ups, 20 players
- **Phase 3 (Week 3)**: Glory Siege mode, multi-warrior, late entry
- **Phase 4 (Week 4+)**: Special events, underdog mechanics, polish

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
**Primary Domain**: UI/UX, Phaser Game Engine, Visual Design

**MVP Tasks (Days 1-5)**: ~18 tasks
- Basic Phaser arena (circular, no zones)
- Simple warrior sprites (1 type)
- Wallet connection
- 2 power-ups (health, rage)
- Desktop only

**Full Project Tasks**: ~45 major tasks
- Phaser Game Development: 22 tasks
- React/Next.js Frontend: 15 tasks
- State Management: 10 tasks
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

## **🚀 PHASE 1 - MVP (Days 1-5)**

### **Partner A: MVP Backend Tasks**

#### **Smart Contract Development (Day 1-2)**
- [ ] Initialize Anchor project structure
- [ ] Create basic Player PDA
  - [ ] Simple PlayerProfile (wins, earnings only)
  - [ ] create_player_profile instruction
- [ ] Basic Game Escrow
  - [ ] Fixed entry fee (0.002 SOL)
  - [ ] Single winner payout
  - [ ] 10 player max
- [ ] Simple game flow
  - [ ] join_game instruction (single warrior)
  - [ ] end_game instruction (one winner)
  - [ ] Basic treasury fee (3%)

#### **Game Server (Day 2-3)**
- [ ] Basic Node.js + Socket.io setup
- [ ] Simple game state in Redis
- [ ] Fixed damage combat (6 HP)
- [ ] Basic movement validation
- [ ] 2 power-up types only

### **Partner B: MVP Frontend Tasks**

#### **Phaser Game (Day 1-3)**
- [ ] Basic arena setup (circular, 600px)
- [ ] Simple warrior sprite (1 type)
- [ ] Movement controls
- [ ] Health bars
- [ ] 2 power-ups (health, rage)
- [ ] Basic combat animations

#### **React Frontend (Day 2-3)**
- [ ] Wallet connection
- [ ] Join game button
- [ ] Basic game lobby
- [ ] Winner announcement
- [ ] Desktop layout only

#### **Integration (Day 4-5)**
- [ ] Connect frontend to server
- [ ] Test full game flow
- [ ] Fix critical bugs
- [ ] Deploy to devnet
- [ ] Basic landing page

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

### **MVP Integration Checkpoints (Days 1-5)**
- **Day 1**: Smart contract setup, basic Phaser arena
- **Day 2**: Join game flow working end-to-end
- **Day 3**: Combat and power-ups functional
- **Day 4**: Full game loop testing
- **Day 5**: Deploy and launch!

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
├── contracts/          # Partner A primary
│   ├── programs/
│   ├── tests/
│   └── migrations/
├── server/            # Partner A primary
│   ├── websocket/
│   ├── game-logic/
│   └── proofnetwork/
├── app/               # Partner B primary
│   ├── components/
│   ├── game/
│   └── styles/
└── shared/            # Both partners
    ├── types/
    └── constants/
```

### **Branch Strategy**
- `main` - Production ready code
- `dev` - Integration branch
- `feat/partner-a-*` - Partner A features
- `feat/partner-b-*` - Partner B features
- `design/*` - Game design changes
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
- [ ] Phaser scene loading
- [ ] Sprite collision detection
- [ ] UI responsiveness
- [ ] Mobile compatibility
- [ ] Performance (60 FPS)

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
- [ ] No fund loss bugs
- [ ] <100ms latency
- [ ] 60 FPS on desktop
- [ ] Mobile playable
- [ ] 10+ concurrent games

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