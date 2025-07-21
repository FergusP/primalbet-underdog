# **AURELIUS INPUT-DRIVEN MVP**
*Ship Input-Driven Arena in 2 Days with Visual Theater*

## **🎯 MVP Philosophy**
Build the simplest input-driven game where players make strategic decisions while watching visual combat theater. NO real combat - all visual. Winner determined by weight calculation + VRF. Ship fast, iterate later.

---

## **✅ MVP FEATURES ONLY (2 Days - Simplified)**

### **1. Input-Driven Arena**
- **Arena Blitz ONLY** - 90 second input collection
- Visual theater only (no real combat)
- Max 10 players initially
- Entry: 0.002 SOL per player
- Winner determined by weight + VRF

### **2. Strategic Input Marketplace**
Players can buy weight bonuses:
- **Momentum Boost**: 0.001 SOL (+30% weight)
- **Rage Mode**: 0.002 SOL (2x weight multiplier)
- **Tactical Edge**: 0.0015 SOL (1.5x efficiency)
- All purchases add to prize pool and affect weight!

### **3. Visual Theater System**
- Show fake warriors "fighting" (animation only)
- Display fake HP bars decreasing
- Show fake damage numbers
- All visual - no real calculations

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

### **5. Input Weight Processing Service**
- Input collection system (timestamps all actions)
- Weight calculation engine
- Power-up marketplace
- Prize pool tracking
- VRF for winner selection
- In-memory state (no database)

### **6. Simple UI (Web Only)**
**What Players See:**
- Join button (strategic entry timing)
- Power-up marketplace with weight effects
- Live prize pool counter
- Visual combat theater (fake fighting)
- Winner announcement

**Strategic Input Controls:**
- Join Game button (timing matters)
- Power-up purchase buttons
- Alliance/Betrayal buttons (future)
- No movement or combat controls

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
mkdir -p programs/aurelius server shared web

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
# Root package.json for scripts
cd .. && npm init -y
```

### **Root Scripts (package.json)**
```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev:server\" \"npm run dev:web\"",
    "dev:server": "cd server && npm run dev",
    "dev:web": "cd web && npm run dev",
    "build:contracts": "cd programs/aurelius && anchor build",
    "test:contracts": "cd programs/aurelius && anchor test",
    "deploy:devnet": "cd programs/aurelius && anchor deploy --provider.cluster devnet"
  }
}
```

---

## **💻 MVP Code Examples**

### **Input-Driven Game Loop**
```typescript
// server/src/game.ts - Input collection and weight processing
class GameServer {
  games: Map<string, Game> = new Map();
  weightCalculator: WeightCalculator;
  visualTheater: VisualTheater;
  
  constructor() {
    this.weightCalculator = new WeightCalculator();
    this.visualTheater = new VisualTheater();
  }
  
  createGame() {
    const game = {
      id: uuid(),
      players: [],
      playerWeights: new Map(), // Track weight per player
      inputHistory: [], // All strategic inputs
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
    
    // Record strategic input with timing
    const joinInput = {
      type: 'JOIN_GAME',
      player,
      timestamp: Date.now(),
      gameTime: game.startTime ? Date.now() - game.startTime : 0,
      position: this.randomPosition() // For visual theater
    };
    game.inputHistory.push(joinInput);
    
    // Calculate entry timing weight
    const entryWeight = this.weightCalculator.calculateEntryWeight(joinInput);
    game.playerWeights.set(player, { base: 1000, bonuses: entryWeight });
    
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
    
    // Record strategic input
    const powerupInput = {
      type: 'ACTIVATE_POWERUP',
      player,
      powerupType: offer.type,
      timestamp: Date.now(),
      gameTime: Date.now() - game.startTime,
      cost: offer.price
    };
    game.inputHistory.push(powerupInput);
    
    // Update player weight
    const weightBonus = this.weightCalculator.calculatePowerupWeight(powerupInput);
    const currentWeight = game.playerWeights.get(player);
    game.playerWeights.set(player, {
      ...currentWeight,
      powerupMultipliers: (currentWeight.powerupMultipliers || 1) * weightBonus
    });
    
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
  
  // Run every 50ms - Visual theater and weight updates!
  async updateGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game.startTime || game.ended) return;
    
    // Update visual theater (fake combat animations)
    this.visualTheater.updateAnimations(game);
    
    // Process any pending weight calculations
    this.weightCalculator.processInputs(game);
    
    // Time limit (90 seconds)
    if (Date.now() - game.startTime > 90000) {
      await this.endGameWithVRF(gameId);
    }
  }
  
  // VRF-based winner selection using weights
  async endGameWithVRF(gameId: string) {
    const game = this.games.get(gameId);
    
    // Calculate final weights for all players
    const finalWeights = new Map();
    for (const player of game.players) {
      const weight = this.weightCalculator.calculateFinalWeight(
        game.playerWeights.get(player),
        game.inputHistory.filter(input => input.player === player)
      );
      finalWeights.set(player, weight);
    }
    
    // Use VRF to select winner based on weight distribution
    const winner = await this.selectWinnerWithVRF(finalWeights);
    await this.endGame(gameId, winner);
  }
}
```

### **Weight Calculation System**
```typescript
// server/src/WeightCalculator.ts - Input-driven weight system
export class WeightCalculator {
  
  constructor() {}
  
  // Calculate weight bonus for entry timing
  calculateEntryWeight(joinInput: JoinInput): number {
    const gameTime = joinInput.gameTime;
    // Early entry bonus: +50-200 points
    if (gameTime < 10000) return 200; // First 10 seconds
    if (gameTime < 30000) return 150; // First 30 seconds
    if (gameTime < 60000) return 100; // First minute
    return 50; // Late entry
  }
  
  // Calculate weight bonus for power-up timing
  calculatePowerupWeight(powerupInput: PowerupInput): number {
    const { powerupType, timestamp, gameTime } = powerupInput;
    
    switch (powerupType) {
      case 'MOMENTUM_BOOST':
        return 1.3; // +30% weight multiplier
      case 'RAGE_MODE':
        // Better multiplier if used strategically (mid-game)
        return gameTime > 30000 && gameTime < 60000 ? 2.0 : 1.5;
      case 'TACTICAL_EDGE':
        return 1.5; // +50% efficiency for next inputs
      default:
        return 1.0;
    }
  }
  
  // Calculate final weight combining all factors
  calculateFinalWeight(playerWeight: PlayerWeight, inputs: Input[]): number {
    let finalWeight = playerWeight.base + (playerWeight.bonuses || 0);
    
    // Apply all multipliers from power-ups
    finalWeight *= (playerWeight.powerupMultipliers || 1);
    
    // Add random luck factor (0.8x - 1.2x)
    finalWeight *= (0.8 + Math.random() * 0.4);
    
    return Math.max(100, Math.floor(finalWeight)); // Minimum 100 weight
  }
  
  processInputs(game: Game) {
    // Process any timing-based bonuses
    // Update alliance/betrayal weights
    // Handle combo bonuses
  }
  
}

### **Visual Theater System**
```typescript
// server/src/VisualTheater.ts - Fake combat animations
export class VisualTheater {
  
  updateAnimations(game: Game) {
    // Generate fake warrior movements
    this.updateFakePositions(game);
    
    // Generate fake combat events
    this.generateFakeCombat(game);
    
    // Update fake HP bars
    this.updateFakeHP(game);
  }
  
  private updateFakePositions(game: Game) {
    // Move warriors around for visual effect
    // No real pathfinding - just visual movement
  }
  
  private generateFakeCombat(game: Game) {
    // Show fake damage numbers
    // Display fake power-up effects
    // Create engaging visual spectacle
  }
  
  private updateFakeHP(game: Game) {
    // Gradually decrease HP bars for drama
    // All visual - no actual HP calculation
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