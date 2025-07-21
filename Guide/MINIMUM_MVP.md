# **AURELIUS AUTO-BATTLE MVP**
*Ship Auto-Battle Arena in 2 Days with Simplified Architecture*

## **🎯 MVP Philosophy**
Build the simplest auto-battle game where players send warriors and buy power-ups. AI controls all movement. Every action grows the prize pool. Ship fast, iterate later.

---

## **✅ MVP FEATURES ONLY (2 Days - Simplified)**

### **1. Auto-Battle Arena**
- **Arena Blitz ONLY** - 90 second battles
- AI-controlled warriors (no player movement)
- Max 10 warriors initially
- Entry: 0.002 SOL per warrior
- Winner takes entire pot (minus fees)

### **2. Power-Up Marketplace**
Players can buy:
- **Health Potion**: 0.001 SOL (+25 HP to your warriors)
- **Rage Mode**: 0.002 SOL (2x damage for 10s)
- **Chaos Storm**: 0.01 SOL (20 damage to ALL)
- All purchases add to prize pool!

### **3. Simple AI Logic**
- Find nearest enemy
- Move toward them
- Attack when adjacent
- Use VRF for fair decisions

### **4. Minimal Smart Contracts**
```rust
// MVP accounts:
PlayerProfile {
    authority: Pubkey,
    total_games: u32,
    total_wins: u32,
    total_earnings: u64,
}

GameEscrow {
    game_id: [u8; 16],
    total_pot: u64,
    join_contributions: u64,    // Track joins
    powerup_contributions: u64, // Track power-ups
    player_count: u8,
    is_active: bool,
    winner: Option<Pubkey>,
}

// Instructions:
- create_player
- join_game (send warrior)
- buy_power_up (grows pot!)
- end_game
```

### **5. Simple Backend Service**
- Auto-battle game loop (50ms tick)
- AI warrior control
- Power-up marketplace
- Prize pool tracking
- Simple VRF for randomness
- In-memory state (no database)

### **6. Simple UI (Both Platforms)**
**What Players See:**
- Join button (send warriors)
- Power-up marketplace with prices
- Live prize pool counter
- Warriors fighting (watch-only)
- Winner announcement

**No Complex Controls:**
- No movement controls
- No joysticks
- Just buttons to join/buy

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
- ✅ Mobile browser optimization

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

## **🚀 MVP Development Timeline (2 Days)**

### **Day 1: Smart Contracts & Auto-Battle Server**
Morning (4 hours):
- [ ] Anchor project setup
- [ ] PlayerProfile account (wins/earnings only)
- [ ] GameEscrow with pool tracking (joins + power-ups)
- [ ] create_player, join_game instructions

Afternoon (4 hours):
- [ ] buy_power_up instruction (grows the pot!)
- [ ] end_game instruction (winner takes all)
- [ ] Basic tests for all instructions
- [ ] Deploy to devnet

### **Day 2: Simple Backend & Frontend**
Morning (4 hours):
- [ ] Node.js + Express setup
- [ ] In-memory game state
- [ ] Simple AI logic
- [ ] API endpoints:
  - GET /api/game/state
  - POST /api/game/join
  - POST /api/game/buyPowerUp

Afternoon (4 hours):
- [ ] Next.js + Phaser frontend
- [ ] Polling integration (500ms)
- [ ] Power-up marketplace UI
- [ ] Deploy to Vercel

### **Day 2 (continued): Testing & Deployment**
Evening (2 hours):
- [ ] End-to-end testing
- [ ] Fix critical bugs only
- [ ] Deploy backend to Railway
- [ ] Final testing

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
    "build:contracts": "cd programs/aurelius && anchor build",
    "test:contracts": "cd programs/aurelius && anchor test",
    "deploy:devnet": "cd programs/aurelius && anchor deploy --provider.cluster devnet"
  }
}
```

---

## **💻 MVP Code Examples**

### **Auto-Battle Game Loop with AI**
```typescript
// server/src/game.ts - AI-controlled warriors
class GameServer {
  games: Map<string, Game> = new Map();
  warriorAI: WarriorAI;
  powerUpMarket: PowerUpMarket;
  
  constructor() {
    this.warriorAI = new WarriorAI();
    this.powerUpMarket = new PowerUpMarket();
  }
  
  createGame() {
    const game = {
      id: uuid(),
      players: [],
      warriors: [],
      powerUps: [],
      marketplace: [],
      startTime: null,
      pot: 0,
      joinContributions: 0,
      powerupContributions: 0
    };
    this.games.set(game.id, game);
    
    // Start marketplace offers
    this.powerUpMarket.startOffering(game.id);
    return game;
  }
  
  joinGame(gameId: string, player: string) {
    const game = this.games.get(gameId);
    if (game.players.length >= 10) throw new Error('Game full');
    
    game.players.push(player);
    const joinFee = 0.002 * LAMPORTS_PER_SOL;
    game.pot += joinFee;
    game.joinContributions += joinFee;
    
    // Spawn AI warrior
    const warrior = {
      id: player,
      hp: 100,
      position: this.randomPosition(),
      target: null,
      effects: []
    };
    game.warriors.push(warrior);
    
    // Emit pot update
    this.io.emit('potUpdate', {
      currentPot: game.pot / LAMPORTS_PER_SOL,
      lastChange: joinFee / LAMPORTS_PER_SOL,
      source: 'join',
      totalPlayers: game.players.length
    });
  }
  
  buyPowerUp(gameId: string, player: string, offerId: string) {
    const game = this.games.get(gameId);
    const offer = game.marketplace.find(o => o.id === offerId);
    if (!offer) throw new Error('Invalid offer');
    
    // 90% goes to pot!
    const poolContribution = (offer.price * 0.9) * LAMPORTS_PER_SOL;
    game.pot += poolContribution;
    game.powerupContributions += poolContribution;
    
    // Apply power-up effect
    this.applyPowerUp(game, player, offer.type);
    
    // Emit pot update
    this.io.emit('potUpdate', {
      currentPot: game.pot / LAMPORTS_PER_SOL,
      lastChange: poolContribution / LAMPORTS_PER_SOL,
      source: 'powerup',
      totalPlayers: game.players.length
    });
    
    // Generate new offer
    this.powerUpMarket.replaceOffer(game, offerId);
  }
  
  // Run every 50ms - AI controls everything!
  async updateGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game.startTime || game.ended) return;
    
    // AI movement for all warriors
    for (const warrior of game.warriors) {
      if (warrior.hp <= 0) continue;
      
      // AI decides target and movement
      const decision = await this.warriorAI.makeDecision(warrior, game);
      
      if (decision.type === 'move') {
        warrior.position = decision.position;
        this.io.emit('warriorMoved', {
          warriorId: warrior.id,
          position: warrior.position
        });
      } else if (decision.type === 'attack') {
        this.performAttack(warrior, decision.target);
      }
    }
    
    // Check winner
    const alive = game.warriors.filter(w => w.hp > 0);
    if (alive.length === 1) {
      await this.endGame(gameId, alive[0].id);
    }
    
    // Time limit (90 seconds)
    if (Date.now() - game.startTime > 90000) {
      const winner = alive.sort((a, b) => b.hp - a.hp)[0];
      await this.endGame(gameId, winner.id);
    }
  }
}
```

### **Auto-Battle AI Logic**
```typescript
// server/src/WarriorAI.ts - Simple but fair AI
import { ProofNetworkClient } from '@proofnetwork/sdk';

export class WarriorAI {
  private proofNetwork: ProofNetworkClient;
  
  constructor() {
    this.proofNetwork = new ProofNetworkClient({
      apiKey: process.env.PROOF_NETWORK_KEY
    });
  }
  
  async makeDecision(warrior: Warrior, game: Game) {
    // Find all enemies
    const enemies = game.warriors.filter(w => 
      w.id !== warrior.id && w.hp > 0
    );
    
    if (enemies.length === 0) return { type: 'wait' };
    
    // Calculate distances
    const enemiesWithDistance = enemies.map(enemy => ({
      enemy,
      distance: this.getDistance(warrior.position, enemy.position)
    }));
    
    // Find closest enemies
    const minDistance = Math.min(...enemiesWithDistance.map(e => e.distance));
    const closestEnemies = enemiesWithDistance
      .filter(e => e.distance === minDistance)
      .map(e => e.enemy);
    
    // If multiple enemies at same distance, use VRF for fairness
    let target: Warrior;
    if (closestEnemies.length > 1) {
      const result = await this.proofNetwork.selectFromArray(
        closestEnemies.map(e => e.id),
        1
      );
      target = closestEnemies.find(e => e.id === result.result[0]);
    } else {
      target = closestEnemies[0];
    }
    
    // If adjacent, attack
    if (minDistance <= 1) {
      return { type: 'attack', target };
    }
    
    // Otherwise, move toward target
    const nextPosition = this.getNextPosition(
      warrior.position,
      target.position
    );
    
    return { type: 'move', position: nextPosition };
  }
  
  private getDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }
  
  private getNextPosition(from: Position, to: Position): Position {
    const dx = Math.sign(to.x - from.x);
    const dy = Math.sign(to.y - from.y);
    
    // Move diagonally if possible, otherwise horizontal/vertical
    if (dx !== 0 && dy !== 0) {
      // Use VRF to fairly choose between horizontal or vertical
      // This prevents predictable movement patterns
      return { 
        x: from.x + (Math.random() > 0.5 ? dx : 0),
        y: from.y + (Math.random() > 0.5 ? 0 : dy)
      };
    }
    
    return {
      x: from.x + dx,
      y: from.y + dy
    };
  }
}
```

### **Power-Up Marketplace**
```typescript
// server/src/PowerUpMarket.ts - Dynamic offers that grow the pot
export class PowerUpMarket {
  private offers = [
    {
      type: 'health',
      name: 'Health Potion',
      price: 0.001,
      description: 'Heals 25 HP to your warriors',
      target: 'self',
      effect: { heal: 25 }
    },
    {
      type: 'rage',
      name: 'Rage Mode',
      price: 0.002,
      description: '2x damage for 10 seconds',
      target: 'self',
      effect: { duration: 10000, multiplier: 2 }
    },
    {
      type: 'chaos',
      name: 'Chaos Storm',
      price: 0.01,
      description: 'Deals 20 damage to ALL warriors',
      target: 'all',
      effect: { damage: 20 }
    },
    {
      type: 'assassinate',
      name: 'Assassinate',
      price: 0.005,
      description: 'Instantly eliminate weakest enemy',
      target: 'enemy',
      effect: { instant: true }
    }
  ];
  
  startOffering(gameId: string) {
    // Generate 3 random offers every 20 seconds
    setInterval(() => {
      const available = this.generateOffers();
      this.io.to(gameId).emit('powerUpOffers', { offers: available });
    }, 20000);
  }
  
  private generateOffers() {
    // Randomly select 3 offers
    const shuffled = [...this.offers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(offer => ({
      id: uuid(),
      ...offer,
      expiresIn: 20
    }));
  }
}
```

---

## **📱 Platform-Specific MVP Code**

### **Simple UI Components**

#### **Web UI (Next.js + Simple Canvas)**
```tsx
// web/src/pages/index.tsx - MVP UI
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import io from 'socket.io-client';

export default function Game() {
  const { publicKey } = useWallet();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [pot, setPot] = useState(0);
  const [powerUps, setPowerUps] = useState([]);
  
  useEffect(() => {
    if (publicKey) {
      const ws = io(process.env.NEXT_PUBLIC_SERVER_URL);
      ws.emit('connect', { wallet: publicKey.toString() });
      
      ws.on('gameStateUpdate', setGameState);
      ws.on('potUpdate', data => setPot(data.currentPot));
      ws.on('powerUpOffers', data => setPowerUps(data.offers));
      
      setSocket(ws);
    }
  }, [publicKey]);
  
  const joinBattle = async () => {
    // Call join_game instruction
    const tx = await program.methods.joinGame()
      .accounts({ /* ... */ })
      .rpc();
    
    socket.emit('playerJoined', { wallet: publicKey.toString() });
  };
  
  const buyPowerUp = async (offer) => {
    // Call buy_power_up instruction
    const tx = await program.methods.buyPowerUp(
      offer.type,
      offer.price * LAMPORTS_PER_SOL
    )
      .accounts({ /* ... */ })
      .rpc();
      
    socket.emit('buyPowerUp', { offerId: offer.id });
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Aurelius Arena</h1>
          <WalletMultiButton />
        </div>
        
        {/* Prize Pool */}
        <div className="bg-yellow-600 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-2xl mb-2">PRIZE POOL</h2>
          <div className="text-5xl font-bold">{pot.toFixed(3)} SOL</div>
          <p className="text-sm mt-2">Winner takes all!</p>
        </div>
        
        {/* Arena (Simple Canvas) */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <canvas 
            id="arena" 
            width="600" 
            height="600"
            className="mx-auto"
          />
        </div>
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Join Button */}
          <button
            onClick={joinBattle}
            className="bg-green-600 hover:bg-green-700 p-6 rounded-lg"
            disabled={gameState?.phase !== 'waiting'}
          >
            <h3 className="text-xl font-bold">Join Battle</h3>
            <p>Send warrior for 0.002 SOL</p>
          </button>
          
          {/* Power-up Marketplace */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">Power-Up Market</h3>
            {powerUps.map(offer => (
              <button
                key={offer.id}
                onClick={() => buyPowerUp(offer)}
                className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded mb-2"
              >
                <div className="font-bold">{offer.name}</div>
                <div className="text-sm">{offer.description}</div>
                <div className="text-lg">{offer.price} SOL</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### **Mobile UI (React Native)**
```tsx
// mobile/src/screens/Game.tsx - Same simple UI
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';

export function GameScreen() {
  const [gameState, setGameState] = useState(null);
  const [pot, setPot] = useState(0);
  const [powerUps, setPowerUps] = useState([]);
  
  const joinBattle = async () => {
    await transact(async (wallet) => {
      // Sign and send join transaction
    });
  };
  
  const buyPowerUp = async (offer) => {
    await transact(async (wallet) => {
      // Sign and send power-up transaction
    });
  };
  
  return (
    <View style={styles.container}>
      {/* Prize Pool */}
      <View style={styles.prizePool}>
        <Text style={styles.poolLabel}>PRIZE POOL</Text>
        <Text style={styles.poolAmount}>{pot.toFixed(3)} SOL</Text>
      </View>
      
      {/* Arena */}
      <View style={styles.arena}>
        <Canvas style={{ flex: 1 }}>
          <Circle cx={150} cy={150} r={150} color="#1a1a2e" />
          {gameState?.warriors.map(warrior => (
            <Circle
              key={warrior.id}
              cx={warrior.position.x * 15}
              cy={warrior.position.y * 15}
              r={5}
              color={warrior.hp > 0 ? 'red' : 'gray'}
            />
          ))}
        </Canvas>
      </View>
      
      {/* Join Button */}
      <TouchableOpacity 
        style={styles.joinButton}
        onPress={joinBattle}
      >
        <Text style={styles.buttonText}>Join Battle (0.002 SOL)</Text>
      </TouchableOpacity>
      
      {/* Power-ups */}
      <View style={styles.powerUps}>
        {powerUps.map(offer => (
          <TouchableOpacity
            key={offer.id}
            style={styles.powerUpButton}
            onPress={() => buyPowerUp(offer)}
          >
            <Text style={styles.powerUpName}>{offer.name}</Text>
            <Text style={styles.powerUpPrice}>{offer.price} SOL</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  prizePool: { backgroundColor: '#f59e0b', padding: 20, alignItems: 'center' },
  poolLabel: { fontSize: 20, color: 'white' },
  poolAmount: { fontSize: 40, fontWeight: 'bold', color: 'white' },
  arena: { height: 300, margin: 20, backgroundColor: '#374151' },
  joinButton: { backgroundColor: '#10b981', padding: 20, margin: 20 },
  buttonText: { color: 'white', fontSize: 18, textAlign: 'center' },
  powerUps: { flexDirection: 'row', flexWrap: 'wrap', padding: 20 },
  powerUpButton: { backgroundColor: '#8b5cf6', padding: 10, margin: 5 },
  powerUpName: { color: 'white', fontWeight: 'bold' },
  powerUpPrice: { color: 'white' }
});
```

## **📊 Success Metrics for MVP**

### **Day 3 Launch Goals**
- ✅ Smart contracts deployed to devnet
- ✅ Game server running with AI
- ✅ Both UIs connect and play
- ✅ Power-ups grow the pot
- ✅ Winner receives funds

### **Week 1 Targets**
- 50 unique players
- 200 games played  
- 0.5 SOL daily volume
- Zero fund loss bugs
- <200ms AI response time

### **What Success Looks Like**
- Players understand auto-battle immediately
- Power-up purchases feel exciting
- Pot grows visibly with each action
- AI movement looks natural
- Winners get paid instantly

---

## **🔥 Post-MVP Expansion**

Once MVP is live and stable:

### **Week 2 Priorities**
1. **More Power-Ups** - Speed boost, shield, freeze
2. **Better AI** - Smarter targeting, retreating when low HP
3. **Arena Obstacles** - Walls, traps, cover
4. **Sound Effects** - Combat sounds, power-up collection
5. **Leaderboard** - Top winners, biggest pots

### **Week 3-4 Features**
- Siege mode (100 players)
- XP & progression system
- Multi-warrior entry
- Special events
- Arena themes

### **Development Philosophy**
1. **Ship daily** - Small improvements every day
2. **Listen to players** - They'll tell you what's fun
3. **Keep it simple** - Complexity can come later
4. **Fix bugs first** - Stability before features

---

## **🚨 Common Pitfalls to Avoid**

1. **Don't overthink the AI** - Simple is better than complex
2. **Don't add features** - Ship MVP first, iterate later
3. **Don't optimize early** - Make it work, then make it fast
4. **Don't skip testing** - Every SOL matters
5. **Don't delay launch** - Perfect is the enemy of good

---

## **✅ MVP Checklist**

### **Before Launch**
- [ ] Contracts handle edge cases (0 players, timeouts)
- [ ] AI makes decisions in <50ms
- [ ] Power-up purchases update pot instantly
- [ ] Winner receives funds correctly
- [ ] Both platforms can play

### **Launch Day**
- [ ] Monitor devnet transactions
- [ ] Watch for stuck games
- [ ] Check winner payouts
- [ ] Gather player feedback
- [ ] Fix critical bugs only

---

*Remember: It's better to have 10 players loving a simple auto-battle game than 0 players waiting for complex manual controls.*