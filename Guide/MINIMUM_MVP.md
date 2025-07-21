# **AURELIUS DUAL-PLATFORM MVP**
*Ship Both Platforms in 5-7 Days, Win Two Hackathons*

## **🎯 MVP Philosophy**
Build the smallest playable game on BOTH web and mobile platforms. Same core gameplay, platform-optimized UX. Prove the concept, generate revenue, win hackathons.

---

## **✅ MVP FEATURES ONLY (5-7 Days)**

### **1. Single Game Mode**
- **Arena Blitz ONLY** - 90 second battles
- Max 10 players (expand to 20 later)
- Fixed entry: 0.002 SOL
- Winner takes 95%

### **2. Simplified Combat**
- Fixed damage: 6 HP per hit
- No VRF initially (use timestamp-based random)
- Attack range: Adjacent cells only
- No veteran bonuses or modifiers

### **3. Basic Power-Ups**
Just 2 types:
- **Health Potion**: +25 HP (green orb)
- **Rage Mode**: 2x damage for 10s (red orb)

### **4. Minimal Smart Contracts**
```rust
// MVP accounts only:
PlayerProfile {
    authority: Pubkey,
    total_games: u32,
    total_wins: u32,
    total_earnings: u64,
}

GameEscrow {
    game_id: [u8; 16],
    total_pot: u64,
    player_count: u8,
    is_active: bool,
    winner: Option<Pubkey>,
}
```

### **5. Basic Game Server**
- Simple Node.js + Socket.io
- Single Redis instance (no cluster)
- Basic movement validation
- No anti-cheat initially

### **6. Dual-Platform UI**
**Web (Days 4-5):**
- Phaser arena (circular, no zones)
- Responsive design for mobile browsers
- Desktop controls (WASD/Arrows) + Touch support
- Wallet adapter integration
- 60 FPS on desktop, adaptive on mobile

**Native Mobile (Days 6-7):**
- React Native Skia arena
- Native touch controls
- Solana Mobile wallet integration
- Optimized 30 FPS rendering
- Android-specific features (haptics)

---

## **❌ NOT IN MVP (Add Later)**

### **Phase 2 (Week 2)**
- ✅ ProofNetwork VRF integration
- ✅ XP & Progression system
- ✅ 2 more power-ups (Speed, Shield)
- ✅ Increase to 20 players
- ✅ Basic anti-cheat

### **Phase 3 (Week 3)**
- ✅ Glory Siege mode
- ✅ Multi-warrior entry
- ✅ Late entry penalties
- ✅ Territory control
- ✅ Platform feature parity

### **Phase 4 (Week 4)**
- ✅ Underdog mechanics
- ✅ Special events (Godslayer, etc)
- ✅ Dynamic modifiers
- ✅ Arena themes
- ✅ Sound & music

---

## **📁 MVP File Structure**

```
aurelius/
├── programs/           # Shared smart contracts
│   └── aurelius/
│       └── src/
│           ├── lib.rs
│           └── state/
│               ├── player.rs
│               └── game.rs
├── server/            # Shared game server
│   └── src/
│       ├── index.ts
│       ├── game.ts
│       └── websocket.ts
├── shared/            # Copy-paste logic
│   ├── battleLogic.ts
│   ├── constants.ts
│   └── types.ts
├── web/               # Web frontend
│   └── src/
│       ├── pages/
│       │   └── index.tsx
│       └── game/
│           └── Arena.ts
└── mobile/            # Mobile app
    └── src/
        ├── screens/
        │   └── Game.tsx
        └── components/
            └── Arena.tsx
```

---

## **🚀 MVP Development Timeline**

### **Day 1: Smart Contracts & Shared Logic**
Morning:
- [ ] Basic Anchor setup
- [ ] PlayerProfile & GameEscrow
- [ ] Join/End game instructions

Afternoon:
- [ ] Create /shared folder
- [ ] Implement battleLogic.ts
- [ ] Define types & constants

### **Day 2: Game Server**
Morning:
- [ ] Node.js + Socket.io setup
- [ ] Platform-agnostic WebSocket
- [ ] Mobile reconnection support

Afternoon:
- [ ] Combat calculations
- [ ] Power-up spawning
- [ ] Winner detection

### **Day 3: Setup Both Platforms**
Morning:
- [ ] Initialize Next.js (web)
- [ ] Initialize Expo (mobile)
- [ ] Copy shared logic to both

Afternoon:
- [ ] Create warrior sprites
- [ ] Design UI mockups
- [ ] Setup build scripts

### **Day 4-5: Web MVP**
Day 4:
- [ ] Phaser arena implementation
- [ ] Wallet adapter integration
- [ ] Desktop controls

Day 5:
- [ ] Connect to server
- [ ] Test gameplay
- [ ] Deploy to Vercel

### **Day 6-7: Mobile MVP**
Day 6:
- [ ] React Native Skia arena
- [ ] Mobile wallet integration
- [ ] Touch controls

Day 7:
- [ ] Connect to server
- [ ] Test on devices
- [ ] TestFlight/Play Store build

---

## **🚀 Quick MVP Setup**

```bash
# Initial setup (30 minutes)
mkdir aurelius && cd aurelius

# Create all folders
mkdir -p programs/aurelius server shared web mobile

# Smart contracts
cd programs/aurelius && anchor init .

# Server
cd ../../server && npm init -y
npm install fastify socket.io redis

# Shared logic
cd ../shared && npm init -y

# Web app
cd ../web && npx create-next-app@latest . --typescript
npm install phaser @solana/wallet-adapter-react

# Mobile app (using Solana Mobile Expo template)
cd ../mobile && yarn create expo-app . --template @solana-mobile/solana-mobile-expo-template
npm install @shopify/react-native-skia

# Root package.json for scripts
cd .. && npm init -y
```

### **Root Scripts (package.json)**
```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev:server\" \"npm run dev:web\" \"npm run dev:mobile\"",
    "dev:server": "cd server && npm run dev",
    "dev:web": "cd web && npm run dev",
    "dev:mobile": "cd mobile && expo start",
    "sync:shared": "cp -r shared/* web/lib/shared/ && cp -r shared/* mobile/lib/shared/"
  }
}
```

---

## **💻 MVP Code Examples**

### **Simplified Game Loop**
```typescript
// Just the essentials
class GameServer {
  games: Map<string, Game> = new Map();
  
  createGame() {
    const game = {
      id: uuid(),
      players: [],
      warriors: [],
      powerUps: [],
      startTime: null,
      pot: 0
    };
    this.games.set(game.id, game);
    return game;
  }
  
  joinGame(gameId: string, player: string) {
    const game = this.games.get(gameId);
    if (game.players.length >= 10) throw new Error('Game full');
    
    game.players.push(player);
    game.pot += 0.002 * LAMPORTS_PER_SOL;
    
    // Spawn warrior at random position
    const warrior = {
      id: player,
      hp: 100,
      position: this.randomPosition(),
      effects: []
    };
    game.warriors.push(warrior);
  }
  
  // Run every 50ms
  updateGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game.startTime) return;
    
    // Simple combat
    this.processAttacks(game);
    
    // Check winner
    const alive = game.warriors.filter(w => w.hp > 0);
    if (alive.length === 1) {
      this.endGame(gameId, alive[0].id);
    }
    
    // Time limit
    if (Date.now() - game.startTime > 90000) {
      const winner = alive.sort((a, b) => b.hp - a.hp)[0];
      this.endGame(gameId, winner.id);
    }
  }
}
```

### **Minimal Smart Contract**
```rust
pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
    let game = &mut ctx.accounts.game_escrow;
    
    require!(game.is_active, ErrorCode::GameNotActive);
    require!(game.player_count < 10, ErrorCode::GameFull);
    
    // Transfer entry fee
    let fee = 2_000_000; // 0.002 SOL
    transfer(/* ... */, fee)?;
    
    game.total_pot += fee;
    game.player_count += 1;
    
    Ok(())
}
```

---

## **📱 Platform-Specific MVP Code**

### **Shared Battle Logic**
```typescript
// shared/battleLogic.ts - Works on both platforms
export function calculateDamage(attacker: Warrior): number {
  const baseDamage = 6; // Fixed for MVP
  return attacker.hasRage ? baseDamage * 2 : baseDamage;
}

export function checkCollision(w1: Warrior, w2: Warrior): boolean {
  return Math.abs(w1.pos.x - w2.pos.x) <= 1 && 
         Math.abs(w1.pos.y - w2.pos.y) <= 1;
}
```

### **Web Arena (Phaser)**
```typescript
// web/src/game/Arena.ts
import { calculateDamage } from '../lib/shared/battleLogic';

export class ArenaScene extends Phaser.Scene {
  create() {
    this.arena = this.add.circle(300, 300, 300, 0x1a1a2e);
    this.warriors = this.add.group();
  }
  
  handleKeyboard() {
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) this.moveWarrior(-1, 0);
    // ... other directions
  }
}
```

### **Mobile Arena (React Native)**
```tsx
// mobile/src/components/Arena.tsx
import { Canvas, Circle } from '@shopify/react-native-skia';
import { calculateDamage } from '../lib/shared/battleLogic';

export function Arena({ gameState, onTouch }) {
  return (
    <Canvas style={{ width: 300, height: 300 }} onTouch={onTouch}>
      <Circle cx={150} cy={150} r={150} color="#1a1a2e" />
      {gameState.warriors.map(warrior => (
        <Circle
          key={warrior.id}
          cx={warrior.pos.x * 15}
          cy={warrior.pos.y * 15}
          r={5}
          color={warrior.hp > 0 ? "red" : "gray"}
        />
      ))}
    </Canvas>
  );
}
```

## **📊 Success Metrics for MVP**

### **Combined Platform Goals (Week 1)**
- 100 unique players (both platforms)
- 500 games played
- 1 SOL in daily volume
- <100ms game latency
- Zero fund loss bugs

### **Platform-Specific Metrics**
**Web:**
- 60 FPS on desktop
- All major browsers work
- Wallet connects smoothly

**Mobile:**
- 30 FPS on mid-range phones
- Touch controls responsive
- <50MB app size

---

## **🔥 Post-MVP Expansion**

Once MVP is live and stable:

1. **Listen to players** - What do they want most?
2. **Fix critical issues** - Bugs before features
3. **Add one feature at a time** - Test each thoroughly
4. **Keep shipping daily** - Momentum is everything

The full game design is your North Star, but player feedback is your compass.

---

*Remember: It's better to have 10 players loving a simple game than 0 players waiting for a complex one.*