# **AURELIUS PROJECT MANAGEMENT**
*Vibecoding Collaboration Guide*

## **📋 Project Overview**

**Project**: Aurelius - Real-time PvP Battle Arena on Solana  
**Duration**: 7-10 days (MVP)  
**Team Size**: 2 developers  
**Methodology**: Vibecoding (Domain-based collaboration)

---

## **👥 Team Roles & Responsibilities**

### **Partner A: Blockchain & Backend Specialist**
**Primary Domain**: Smart Contracts, Game Server, Infrastructure

**Total Tasks**: ~31 major tasks
- Smart Contract Development: 6 main tasks
- ProofNetwork Integration: 6 tasks
- Game Server Development: 13 tasks
- Infrastructure & DevOps: 6 tasks

**Core Responsibilities**:
- All on-chain logic (PDAs, escrow, prizes)
- Game server with real-time state management
- Combat calculations and randomness
- WebSocket server for multiplayer
- ProofNetwork VRF integration
- Security and fund management

### **Partner B: Frontend & Game Experience**
**Primary Domain**: UI/UX, Phaser Game Engine, Visual Design

**Total Tasks**: ~34 major tasks
- Phaser Game Development: 17 tasks
- React/Next.js Frontend: 12 tasks
- State Management: 8 tasks
- Visual & Audio Design: 13 tasks

**Core Responsibilities**:
- Complete game visualization in Phaser
- All UI/UX components in React
- Wallet connection interface
- Sprites, animations, and effects
- Sound design and music
- Mobile controls and responsiveness

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

### **Partner A: Blockchain & Backend Tasks**

#### **Smart Contract Development**
- [ ] Initialize Anchor project structure
- [ ] Create Player PDA system
  - [ ] PlayerProfile account structure
  - [ ] create_player_profile instruction
  - [ ] Update player stats logic
- [ ] Implement Game Escrow system
  - [ ] GameEscrow account structure
  - [ ] Fund management logic
  - [ ] Security constraints
- [ ] Build game entry flow
  - [ ] join_game instruction
  - [ ] Entry fee calculation
  - [ ] Position validation
- [ ] Create winner determination
  - [ ] end_game instruction
  - [ ] VRF integration for ties
  - [ ] Prize distribution logic
- [ ] Implement claim_prize instruction
  - [ ] Winner verification
  - [ ] Transfer mechanics
  - [ ] Treasury fee handling

#### **ProofNetwork Integration**
- [ ] Set up ProofNetwork account
- [ ] Implement VRF for combat damage
- [ ] Create random power-up spawning
- [ ] Add tiebreaker randomness
- [ ] Store VRF proofs for verification
- [ ] Implement Blackbox for secret keys

#### **Game Server Development**
- [ ] Set up Node.js/Socket.io server
- [ ] Create WebSocket connection handler
- [ ] Implement game state management
  - [ ] Warrior tracking
  - [ ] Power-up management
  - [ ] Phase transitions
- [ ] Build combat calculation engine
  - [ ] Damage calculations
  - [ ] Range checking
  - [ ] Target selection
- [ ] Create movement validation
  - [ ] Grid position tracking
  - [ ] Collision detection
  - [ ] Speed validation
- [ ] Implement environmental effects
  - [ ] Arena shrinking logic
  - [ ] Danger zone damage
  - [ ] Time-based hazards

#### **Infrastructure & DevOps**
- [ ] Set up Helius RPC endpoints
- [ ] Configure Redis for session management
- [ ] Create development environment
- [ ] Set up staging deployment
- [ ] Implement error logging
- [ ] Create monitoring dashboard

### **Partner B: Frontend & Game Tasks**

#### **Phaser Game Development**
- [ ] Initialize Phaser 3 project
- [ ] Create scene architecture
  - [ ] PreloaderScene
  - [ ] MainMenuScene
  - [ ] ArenaScene
  - [ ] UIScene (overlay)
  - [ ] GameOverScene
- [ ] Design arena environment
  - [ ] Circular colosseum (600px)
  - [ ] Grid system (20x20)
  - [ ] Zone indicators
  - [ ] Shrinking animation
- [ ] Implement warrior system
  - [ ] BaseWarrior class
  - [ ] Movement mechanics
  - [ ] Health bar display
  - [ ] Name tags
  - [ ] Death animations
- [ ] Create power-up sprites
  - [ ] Health potion (green)
  - [ ] Rage mode (red)
  - [ ] Speed boost (blue)
  - [ ] Shield (yellow)
  - [ ] Collection effects
- [ ] Build combat visuals
  - [ ] Attack animations
  - [ ] Damage numbers
  - [ ] Hit effects
  - [ ] Blood spatters
  - [ ] Critical hit indicators

#### **React/Next.js Frontend**
- [ ] Set up Next.js 15 project
- [ ] Create wallet connection UI
  - [ ] Wallet adapter integration
  - [ ] Connection modal
  - [ ] Account display
- [ ] Build game lobby
  - [ ] Current pot display
  - [ ] Player count
  - [ ] Join button
  - [ ] Entry fee display
- [ ] Design HUD components
  - [ ] Timer display
  - [ ] Phase indicator
  - [ ] Kill feed
  - [ ] Player status
- [ ] Create victory/defeat screens
  - [ ] Winner announcement
  - [ ] Stats breakdown
  - [ ] Prize display
  - [ ] Play again button
- [ ] Implement spectator mode UI
  - [ ] Camera controls
  - [ ] Player list
  - [ ] Emote system

#### **State Management & Integration**
- [ ] Set up Zustand stores
  - [ ] Game state store
  - [ ] Player store
  - [ ] UI store
- [ ] Create EventBus system
- [ ] Implement WebSocket client
  - [ ] Connection handling
  - [ ] Event listeners
  - [ ] Reconnection logic
- [ ] Build wallet integration
  - [ ] Transaction building
  - [ ] Signature handling
  - [ ] Error states

#### **Visual & Audio Design**
- [ ] Create warrior sprites (5 variations)
- [ ] Design UI elements
  - [ ] Buttons
  - [ ] Modals
  - [ ] Health bars
  - [ ] Icons
- [ ] Implement particle effects
  - [ ] Power-up collection
  - [ ] Combat impacts
  - [ ] Environmental effects
- [ ] Add sound effects
  - [ ] Combat sounds
  - [ ] UI feedback
  - [ ] Ambient arena
  - [ ] Victory/defeat music
- [ ] Create mobile controls
  - [ ] Virtual joystick
  - [ ] Touch targets
  - [ ] Responsive layout

### **Shared Responsibilities**

#### **Integration Points**
- [ ] Define and maintain interface contract
- [ ] Test WebSocket communication
- [ ] Verify on-chain/off-chain sync
- [ ] Debug cross-domain issues
- [ ] Performance optimization

#### **Testing & QA**
- [ ] End-to-end gameplay testing
- [ ] Multiplayer stress testing
- [ ] Mobile device testing
- [ ] Security audit
- [ ] Bug tracking and fixes

#### **Documentation**
- [ ] Update interface changes
- [ ] Document API endpoints
- [ ] Create setup guides
- [ ] Write deployment instructions

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
2. **Game Entry Flow** (Day 3)
3. **Movement Sync Test** (Day 4)
4. **Combat Integration** (Day 5)
5. **Full Game Loop** (Day 6)
6. **Production Test** (Day 7)

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