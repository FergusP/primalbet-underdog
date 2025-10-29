# PrimalBet - Monster Combat Jackpot Game with Live Stream Interaction

**Winner of TheVorld Airdrop Arcade Hackathon** 🏆

PrimalBet is a skill-based monster-fighting game on Solana where players battle increasingly difficult monsters for a chance to crack the treasure vault and claim the growing SOL jackpot. **Now enhanced with TheVorld Airdrop Arcade integration** - viewers can interact with live streams by purchasing power-ups, heals, and even trolling the player with monster heals!

---

## 🌟 What's New: TheVorld Integration

### Viewer Interaction Features

- 🧪 **Health Potion** (50 Arena Coins) - Support the player with +20 HP
- 🔥 **Damage Boost** (50 Arena Coins) - Empower player with 2x damage for 10 seconds
- 💚 **Monster Heal** (25 Arena Coins) - **Troll Mode!** Help the monster with +50 HP

### Streaming Features

- **Real-time Combat Effects** - All viewer purchases apply instantly during live combat
- **Custom Events** - 5 tracked events: Combat Started, Monster Defeated, Player Died, Vault Cracked, Vault Failed
- **Visual Feedback** - Toast notifications and glow effects for every viewer action
- **Optional Authentication** - Existing players unaffected, arena features activate when streaming

---

## 🎮 Core Game Overview

### Game Loop

1. **Pay 0.01 SOL** - Fixed entry fee for all players
2. **Fight Monster** - Real-time skill-based combat (WASD + Space to attack)
3. **Victory?** - Player skill determines the outcome
4. **Vault Attempt** - VRF-powered chance to crack the vault
5. **Win Jackpot** - Take 90% of the prize pool!

### Key Features

- ✅ **Growing Jackpot** - Every failed attempt increases the prize pool (currently 0.0095 SOL)
- ✅ **Skill-Based Combat** - Player movement and timing determine victory
- ✅ **Dynamic Difficulty** - 6 monster tiers that scale with pot size
- ✅ **Provably Fair** - VRF for vault crack attempts only
- ✅ **Instant Payouts** - 90% to winner, 10% platform fee
- ✅ **Live Stream Interaction** - Viewers can help or hinder players in real-time

---

## 🛠 Tech Stack

### Frontend

- **Game Engine**: Phaser 3.90+ (real-time combat)
- **Framework**: Next.js 15.4.2 + React 19 (Turbopack)
- **Wallet**: Solana Wallet Adapter (Phantom support)
- **WebSocket**: Socket.IO client for TheVorld integration
- **Auth**: TheVorld Vorld Auth (optional)

### Backend

- **API**: Node.js + Express + TypeScript
- **WebSocket**: Socket.IO client + native WebSocket server (dual system)
- **Arena Relay**: Connects TheVorld platform to frontend
- **Validation**: Duration + damage checks (anti-cheat)
- **Sessions**: 5-minute expiry, wallet-keyed

### Blockchain

- **Network**: Solana Devnet
- **Program ID**: `J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z`
- **On-chain**: Pot tracking + winner payouts only
- **Entry Fee**: Fixed 0.01 SOL
- **Manual Encoding**: No Anchor/Coral, direct buffer manipulation

### TheVorld Integration

- **Platform**: TheVorld Airdrop Arcade
- **Actors**: 3 (Player, Monster, Skeletons)
- **Events**: 5 custom game events
- **Packages**: 3 immediate purchase items

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Solana wallet (Phantom recommended)
- TheVorld account (optional, for streaming features)

### Installation

```bash
# Clone the repository
git clone https://github.com/FergusP/primalbet-underdog.git
cd PrimalBet

# Install frontend dependencies
cd web
npm install

# Install backend dependencies
cd ../backend
npm install

# Start backend server
npm run dev
# Backend runs on http://localhost:3001

# In another terminal, start frontend
cd ../web
npm run dev
# Frontend runs on http://localhost:3000
```

### Testing Viewer Interactions

```bash
# 1. Start backend and frontend (see above)

# 2. Open game in browser
open http://localhost:3000

# 3. Open mock viewer interface in another tab
open http://localhost:3000/viewer-test.html

# 4. In game tab:
#    - Connect Solana wallet
#    - Copy your wallet address
#    - Click "BATTLE THE BEAST"

# 5. In viewer tab:
#    - Paste wallet address
#    - Click package buttons to send effects
#    - Watch effects apply in real-time in game tab!
```

---

## 📁 Project Structure

```
PrimalBet/
├── programs/                 # Solana smart contracts
│   └── primalbet/           # Program with manual buffer encoding
├── web/                     # Next.js frontend
│   ├── public/
│   │   └── viewer-test.html # Mock viewer test interface
│   └── src/
│       ├── game/            # Phaser combat scenes
│       │   └── scenes/      # CombatScene, VaultScene
│       ├── services/        # TheVorld integration
│       │   ├── arena-game.ts           # Arena API client
│       │   ├── arena-integration.ts    # Coordination layer
│       │   ├── backend-websocket.ts    # Real-time events
│       │   └── vorld-auth.ts           # Authentication
│       ├── config/
│       │   └── arena-config.ts         # Platform IDs
│       └── ui/
│           └── react/
│               └── auth/    # Auth components
├── backend/                 # Node.js + Express
│   └── src/
│       ├── services/
│       │   ├── arena-service.ts        # TheVorld relay
│       │   └── solana-service.ts       # Blockchain
│       ├── routes/
│       │   └── arena-routes.ts         # Arena API
│       ├── config/
│       │   └── arena-config.ts         # Platform IDs
│       └── index.ts         # Main server + WebSocket
├── Guide/                   # Documentation
└── tests/                   # Test suites
```

---

## 🎯 Architecture Overview

### Integration Flow

```
TheVorld Platform (Socket.IO)
    ↓
Backend Arena Service (relay)
    ↓ WebSocket broadcast
Frontend Game (Phaser)
    ↓ Apply effects
Real-time Combat Updates
```

### Backend Relay System

1. **Socket.IO Client** connects to TheVorld WebSocket
2. **Arena Service** manages sessions by wallet address
3. **Event Listeners** handle 8 arena lifecycle events
4. **WebSocket Broadcast** relays to all frontend clients
5. **Frontend** applies effects in Phaser combat scene

### Zero Breaking Changes

- Game works perfectly **without** authentication
- Arena features only activate when authenticated + streaming
- 487+ existing players continue playing normally
- Integration is purely additive

---

## 🎪 TheVorld Arena Features

### Package Effects (Implemented)

#### 🧪 Health Potion (`69008ee1eb39e74d32d2fb08`)

- **Cost**: 50 Arena Coins
- **Effect**: Instant +20 HP to player
- **Visual**: Green toast notification
- **Use Case**: Support player in tough fights

#### 🔥 Damage Boost (`69008f47eb39e74d32d2fce8`)

- **Cost**: 50 Arena Coins
- **Effect**: 2x damage multiplier for 10 seconds
- **Visual**: Orange player glow + orange toast
- **Implementation**: Applied to 5 attack types (explosion, melee, spear, spin, collision)
- **Use Case**: Help player defeat monster faster

#### 💚 Monster Heal (`69008fb8eb39e74d32d2fd14`)

- **Cost**: 25 Arena Coins (intentionally cheaper!)
- **Effect**: +50 HP to monster
- **Visual**: Red toast notification
- **Innovation**: **Troll Mode** - viewers can make combat harder
- **Use Case**: Create chaos and unpredictable gameplay

### Custom Events (Emitted)

1. **Combat Started** (`68ff41d6eb39e74d32d2e766`)

   - Triggered: Player enters arena
   - Data: Monster tier name

2. **Monster Defeated** (`68ff41e6eb39e74d32d2e773`)

   - Triggered: Player wins combat
   - Data: Monster tier, damage dealt

3. **Player Died** (`68ff41edeb39e74d32d2e782`)

   - Triggered: Player loses combat
   - Data: Monster tier, player final HP

4. **Vault Cracked** (`68ff4feeb39e74d32d2e793`)

   - Triggered: Player wins jackpot
   - Data: Prize amount, monster defeated

5. **Vault Failed Attempt** (`68ff4208eb39e74d32d2e7a6`)
   - Triggered: Player fails vault crack
   - Data: Monster defeated, pot size

---

## 🧪 Testing with Mock Viewer

The mock viewer interface allows testing without live streaming:

1. **Open Game**: http://localhost:3000
2. **Open Mock Viewer**: http://localhost:3000/viewer-test.html
3. **Enter Combat**: Connect wallet and fight monster
4. **Send Packages**: Click buttons in mock viewer tab
5. **Watch Effects**: See real-time updates in game tab

### Mock Viewer Features

- Backend connection status indicator
- Wallet address input
- 3 clickable package cards
- Toast notifications for delivery confirmation
- Auto-refresh connection check

---

## 🏆 Hackathon Highlights

### What We Built (3 Weeks)

- Complete TheVorld Airdrop Arcade integration
- Optional authentication system (Vorld Auth)
- Real-time viewer interaction (3 packages)
- Backend WebSocket relay architecture
- Custom event emission (5 events)
- Mock viewer test interface
- Toast notification system
- Visual feedback for all viewer actions

### Key Innovations

1. **Troll Mode**: Monster Heal creates chaos and audience engagement
2. **Hybrid Architecture**: On-chain pot + backend relay + frontend combat
3. **Mock Viewer System**: Reliable demo without stream dependencies
4. **Real Production Game**: Not a prototype, actual deployed game with real users

### Technical Achievements

- Socket.IO integration with TypeScript
- Dual WebSocket system (TheVorld + frontend)
- Session management by wallet address
- Real-time effect application in Phaser
- Event emission to external platform
- Optional authentication without mandatory requirements

---

## 🎬 Demo Video

[Link to demo video showing gameplay + viewer interactions]

---

_"Every fallen warrior's gold makes the next beast stronger! Now with live viewers who can help... or hinder!"_ - PrimalBet
