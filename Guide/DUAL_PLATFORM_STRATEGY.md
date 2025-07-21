# **AURELIUS DUAL-PLATFORM STRATEGY**
*One Game, Two Platforms, Two Hackathons*

## **🎯 Overview**
Building Aurelius for **2 hackathons** with both web and mobile platforms, using a shared codebase architecture that allows rapid development without monorepo complexity.

## **🏆 Hackathon Strategy**

### **Hackathon 1: Solana Gaming**
- **Focus**: Web version
- **Highlight**: Blockchain integration, real-time battles
- **Demo**: Live web gameplay
- **Unique**: "First real-time PvP arena on Solana"

### **Hackathon 2: Mobile Gaming/Web3**
- **Focus**: Mobile version (Solana Seeker)
- **Highlight**: Mobile-first UX, touch controls
- **Demo**: Phone gameplay
- **Unique**: "Solana gaming in your pocket"

---

## **📁 Project Structure**

```
/Aurelius
│
├── /web                    # Next.js app
│   ├── /components
│   ├── /pages
│   ├── /lib               # Platform-specific + copied shared code
│   └── package.json
│
├── /mobile                 # Expo/React Native
│   ├── /components
│   ├── /screens
│   ├── /lib               # Platform-specific + copied shared code
│   └── package.json
│
├── /shared                 # Copy-paste friendly modules
│   ├── battleLogic.ts     # Core game logic
│   ├── solanaClient.ts    # Blockchain calls
│   ├── gameConstants.ts   # Shared constants
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Common utilities
│
├── /programs              # Anchor smart contracts
│   └── /aurelius
│       ├── /src
│       └── Cargo.toml
│
├── /server                # Shared game server
│   ├── /src
│   └── package.json
│
├── /Guide                 # All documentation
│
└── README.md
```

**NOT a monorepo** - just organized folders. Each app copies what it needs from `/shared`.

---

## **🚀 Development Flow**

### **Independent Development**
```bash
# Developer 1: Web
cd web && npm install && npm run dev

# Developer 2: Mobile  
cd mobile && npm install && expo start

# Developer 3: Smart contract
cd programs && anchor build && anchor deploy

# Developer 4: Game server
cd server && npm install && npm run dev

# No coordination needed!
```

### **Code Sharing Script**
```json
// Root package.json
{
  "scripts": {
    "sync:shared": "npm run sync:web && npm run sync:mobile",
    "sync:web": "cp -r shared/* web/lib/shared/",
    "sync:mobile": "cp -r shared/* mobile/lib/shared/",
    "dev:web": "cd web && npm run dev",
    "dev:mobile": "cd mobile && expo start",
    "dev:server": "cd server && npm run dev",
    "dev:all": "concurrently \"npm run dev:web\" \"npm run dev:mobile\" \"npm run dev:server\""
  }
}
```

---

## **💡 Smart Code Sharing**

### **1. Battle Logic (shared/battleLogic.ts)**
```typescript
// Pure functions that work everywhere
export function calculateDamage(attacker: Warrior, defender: Warrior): number {
  const baseDamage = Math.floor(Math.random() * 4) + 5; // 5-8
  return attacker.effects.includes('rage') ? baseDamage * 2 : baseDamage;
}

export function validateMovement(
  currentPos: Position, 
  newPos: Position, 
  deltaTime: number
): boolean {
  const distance = Math.sqrt(
    Math.pow(newPos.x - currentPos.x, 2) + 
    Math.pow(newPos.y - currentPos.y, 2)
  );
  const maxDistance = WARRIOR_SPEED * deltaTime;
  return distance <= maxDistance * 1.1; // 10% tolerance
}

export function checkCollision(warrior1: Warrior, warrior2: Warrior): boolean {
  const distance = Math.sqrt(
    Math.pow(warrior1.position.x - warrior2.position.x, 2) + 
    Math.pow(warrior1.position.y - warrior2.position.y, 2)
  );
  return distance < COLLISION_RADIUS;
}
```

### **2. Platform Abstractions**

**Wallet Interface (shared/types.ts)**
```typescript
export interface WalletInterface {
  connect(): Promise<PublicKey>;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signMessage?(message: Uint8Array): Promise<Uint8Array>;
  disconnect(): Promise<void>;
}

export interface GameRenderer {
  initialize(container: HTMLElement | View): void;
  renderWarrior(warrior: Warrior): void;
  renderPowerUp(powerUp: PowerUp): void;
  renderDamage(damage: DamageEvent): void;
  cleanup(): void;
}
```

**Web Implementation (web/lib/webWallet.ts)**
```typescript
import { WalletInterface } from './shared/types';
import { useWallet } from '@solana/wallet-adapter-react';

export class WebWallet implements WalletInterface {
  constructor(private wallet: ReturnType<typeof useWallet>) {}
  
  async connect(): Promise<PublicKey> {
    await this.wallet.connect();
    return this.wallet.publicKey!;
  }
  
  async signTransaction(tx: Transaction): Promise<Transaction> {
    return await this.wallet.signTransaction!(tx);
  }
}
```

**Mobile Implementation (mobile/lib/mobileWallet.ts)**
```typescript
import { WalletInterface } from './shared/types';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';

export class MobileWallet implements WalletInterface {
  async connect(): Promise<PublicKey> {
    const result = await transact(async (wallet) => {
      const auth = await wallet.authorize({
        cluster: 'devnet',
        identity: { name: 'Aurelius' }
      });
      return auth.publicKey;
    });
    return new PublicKey(result);
  }
  
  async signTransaction(tx: Transaction): Promise<Transaction> {
    // Mobile wallet signing logic
  }
}
```

### **3. Platform-Specific Rendering**

**Web (web/components/GameArena.tsx)**
```typescript
import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { simulateBattle } from '../lib/shared/battleLogic';

export function GameArena({ gameState }: { gameState: GameState }) {
  const phaserRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: phaserRef.current!,
      width: 600,
      height: 600,
      scene: new ArenaScene(gameState)
    };
    
    const game = new Phaser.Game(config);
    return () => game.destroy(true);
  }, []);
  
  return <div ref={phaserRef} className="arena-container" />;
}
```

**Mobile (mobile/components/GameArena.tsx)**
```typescript
import React from 'react';
import { View, Dimensions } from 'react-native';
import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import { simulateBattle } from '../lib/shared/battleLogic';

export function GameArena({ gameState }: { gameState: GameState }) {
  const { width } = Dimensions.get('window');
  const arenaSize = width * 0.9;
  
  return (
    <View style={{ width: arenaSize, height: arenaSize }}>
      <Canvas style={{ flex: 1 }}>
        {gameState.warriors.map(warrior => (
          <Circle
            key={warrior.id}
            cx={warrior.position.x * arenaSize / 600}
            cy={warrior.position.y * arenaSize / 600}
            r={10}
            color={warrior.isAlive ? "red" : "gray"}
          />
        ))}
      </Canvas>
    </View>
  );
}
```

---

## **📅 Dual-Platform Timeline**

### **Week 1: Core Development**
```
Day 1-2: Smart Contracts
- [ ] Deploy same contract for both platforms
- [ ] Basic player profiles and game escrow
- [ ] Manual buffer encoding setup

Day 3-4: Shared Game Logic
- [ ] Battle calculations in /shared
- [ ] Type definitions
- [ ] Game constants
- [ ] Utility functions

Day 5: Game Server
- [ ] WebSocket setup
- [ ] Redis game state
- [ ] Platform-agnostic events

Day 6-7: Web MVP
- [ ] Next.js setup
- [ ] Phaser integration
- [ ] Wallet adapter
- [ ] Basic gameplay
```

### **Week 2: Platform Split**
```
Day 8-9: Mobile Foundation
- [ ] Expo setup
- [ ] React Native Skia/Game Engine
- [ ] Mobile wallet adapter
- [ ] Touch controls

Day 10-11: Platform Polish
- [ ] Web: Animations, sounds
- [ ] Mobile: Gestures, haptics
- [ ] Both: Performance optimization

Day 12-13: Testing & Demos
- [ ] Cross-platform testing
- [ ] Demo recordings
- [ ] Hackathon submissions

Day 14: Launch
- [ ] Deploy web to Vercel
- [ ] Submit mobile to TestFlight
- [ ] Prepare presentations
```

---

## **🎮 Platform-Specific Features**

### **Web MVP (5 days)**
- ✅ Wallet adapter (Phantom, Solflare, etc)
- ✅ Canvas/WebGL battle arena
- ✅ Keyboard controls (WASD/Arrows)
- ✅ Real-time WebSocket
- ✅ Responsive design
- ✅ Social share buttons
- ✅ Leaderboard display

### **Mobile MVP (5 days)**
- ✅ Solana Mobile Stack integration
- ✅ Touch-optimized controls
- ✅ Gesture-based movement
- ✅ Push notifications
- ✅ Simplified graphics
- ✅ Offline queue support
- ✅ Haptic feedback

### **Shared Features**
- ✅ Same smart contracts
- ✅ Same game server
- ✅ Same game logic
- ✅ Same WebSocket protocol
- ✅ Same scoring system

---

## **🔧 Technical Decisions**

### **Why Not Monorepo?**
- Too complex for hackathon timeline
- Dependency conflicts between platforms
- Harder to onboard team members
- Build tool configuration overhead

### **Why Copy-Paste Sharing?**
- Simple and fast
- No dependency management
- Each platform fully independent
- Easy to understand
- Can diverge when needed

### **Game Engine Choices**
- **Web**: Phaser 3 (mature, performant, web-focused)
- **Mobile**: React Native Skia or Game Engine (native performance)
- **Alternative**: Unity WebGL export (if need 3D later)

### **State Management**
- **Web**: Zustand + React Query
- **Mobile**: Zustand + React Query (same!)
- **Server**: Redis for game state

---

## **⚡ Quick Commands**

### **Initial Setup**
```bash
# Clone and setup
git clone <repo>
cd Aurelius

# Install root dependencies
npm install

# Setup all platforms
npm run setup:all
```

### **Development**
```bash
# Sync shared code
npm run sync:shared

# Run specific platform
npm run dev:web
npm run dev:mobile
npm run dev:server

# Run everything
npm run dev:all
```

### **Deployment**
```bash
# Deploy contracts
cd programs && anchor deploy

# Deploy web
cd web && vercel

# Build mobile
cd mobile && eas build
```

---

## **🚨 Important Guidelines**

### **Code Sharing Rules**
1. **Always share**: Game logic, types, constants
2. **Never share**: UI components, platform APIs
3. **Carefully share**: Rendering logic, asset loading

### **Development Workflow**
1. Make changes in `/shared` first
2. Run `npm run sync:shared`
3. Test on both platforms
4. Commit changes

### **Platform Parity**
- Core gameplay must be identical
- UI/UX can be platform-optimized
- Performance tuning per platform
- Same blockchain integration

---

## **📊 Success Metrics**

### **Both Platforms**
- [ ] 10+ concurrent games supported
- [ ] <100ms server latency
- [ ] No fund loss bugs
- [ ] Smooth 30+ FPS gameplay

### **Web Specific**
- [ ] Works on Chrome, Firefox, Safari
- [ ] 60 FPS on desktop
- [ ] Mobile browser playable
- [ ] SEO optimized

### **Mobile Specific**
- [ ] 30 FPS on mid-range phones
- [ ] <50MB app size
- [ ] Offline queue functionality
- [ ] App store ready

---

## **🎯 Hackathon Pitch Points**

### **Web Version**
- "Real-time PvP on Solana with sub-second transactions"
- "No installation required - play instantly"
- "Cross-platform multiplayer battles"
- "Provably fair with VRF"

### **Mobile Version**
- "First mobile-native Solana battle arena"
- "Optimized for Solana Seeker/Saga"
- "Play anywhere with touch controls"
- "Integrated with mobile wallets"

---

*This dual-platform strategy maximizes code reuse while allowing platform-specific optimizations, perfect for winning two hackathons with one game concept!*