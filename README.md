# Aurelius Colosseum - Monster Combat Jackpot Game on Solana

Aurelius Colosseum is a skill-based monster-fighting game where players battle increasingly difficult monsters for a chance to crack the treasure vault and claim the growing SOL jackpot. Every failed attempt adds to the prize pool, creating escalating stakes and excitement. Built on Solana with real-time combat powered by Phaser 3.

## 🎮 Game Overview

### Core Game Loop
1. **Pay 0.01 SOL** - Fixed entry fee for all players
2. **Fight Monster** - Real-time skill-based combat (WASD movement + Space to attack)
3. **Victory?** - Your skill determines the outcome
4. **Vault Attempt** - If victorious, get a VRF-powered chance to crack the vault
5. **Win Jackpot** - Success means you take the entire prize pool!

### Key Features
- **Growing Jackpot**: Every failed attempt increases the prize pool
- **Skill-Based Combat**: Player movement and timing determine victory
- **Dynamic Difficulty**: Monsters get tougher as the jackpot grows
- **Provably Fair**: ProofNetwork VRF for vault crack attempts only
- **Instant Payouts**: 90% to winner, 10% platform fee
- **Monster Tiers**: Orc → Armored Orc → Elite Orc → Orc Rider → Werewolf → Werebear

## 📚 Documentation

- [Game Design Document](./Guide/AURELIUS_COLOSSEUM_DESIGN.md) - Core game concept and mechanics
- [Monster Combat System](./Guide/MONSTER_COMBAT_SYSTEM.md) - Detailed combat mechanics
- [Interface Contract v7.0](./Guide/INTERFACE_CONTRACT.md) - API and data structures
- [Combat Validation](./Guide/COMBAT_VALIDATION.md) - Anti-cheat and validation system
- [Technical Architecture](./Guide/TECHNICAL_ARCHITECTURE.md) - System design

## 🛠 Tech Stack

### Frontend
- **Game Engine**: Phaser 3.90+ (real-time combat)
- **Framework**: Next.js 15 + React 19
- **Wallet**: Solana Wallet Adapter
- **Combat**: Player-controlled, skill-based mechanics

### Backend
- **API**: Node.js + Express (session validation)
- **Validation**: Simple duration + damage checks
- **VRF**: ProofNetwork (vault attempts only)
- **Sessions**: 5-minute expiry, single-use

### Blockchain
- **Smart Contracts**: Anchor Framework (minimal)
- **On-chain**: Pot tracking and winner payouts only
- **Network**: Solana (devnet/mainnet)
- **Entry Fee**: Fixed 0.01 SOL

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Anchor CLI 0.30+
- Solana CLI 1.17+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Aurelius.git
cd Aurelius

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
aurelius/
├── programs/           # Anchor smart contracts (minimal pot tracking)
├── web/               # Next.js + Phaser frontend
│   └── src/
│       └── game/      # Combat scenes and mechanics
├── backend/           # Node.js validation server
│   └── src/
│       ├── session/   # Session management
│       └── validation/# Combat validation
├── Guide/             # All documentation
└── tests/             # Test suites
```

## 🎯 How It Works (For Judges)

### Architecture Overview
1. **Frontend** handles real-time combat with player skill determining outcomes
2. **Backend** validates combat sessions (minimum 3s duration, damage within ±20% of monster HP)
3. **Blockchain** stores minimal data - just pot amount and processes payouts
4. **VRF** is used ONLY for vault crack attempts, not combat outcomes

### Why This Design?
- **Skill > Luck**: Combat is determined by player ability, not RNG
- **Anti-Cheat**: Simple validation prevents obvious exploits
- **Minimal On-chain**: Reduces costs and complexity
- **Growing Stakes**: Failed attempts create FOMO as jackpot increases

### Monster Progression
| Pot Size | Monster | HP | Vault Chance |
|----------|---------|-----|-------------|
| 0-0.01 SOL | Orc | 80 | Low |
| 0.01-0.02 SOL | Armored Orc | 100 | Medium |
| 0.02-0.03 SOL | Elite Orc | 130 | Low |
| 0.03-0.04 SOL | Orc Rider | 170 | Low |
| 0.04+ SOL | Werewolf | 100 | None (must evolve) |
| Evolution | Werebear | 100 | Very High |

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/aurelius.git
cd aurelius
npm install

# Start everything
npm run dev:all

# Or individually:
npm run dev:contracts  # Deploy contracts
npm run dev:backend    # Start validation server
npm run dev:web        # Start game frontend
```

## 🤝 Team

Built for the Solana Game Jam by a distributed team focusing on creating an engaging skill-based gambling experience.

---

*"Every fallen warrior's gold makes the next beast stronger!" - Aurelius Colosseum*