# Aurelius Colosseum Frontend Documentation

## Overview

Aurelius Colosseum is a web-based monster combat jackpot game built on Solana. The frontend combines Next.js 15 for the web framework with Phaser 3.90 for game visualization, creating an engaging visual experience for blockchain-based combat.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Game Engine**: Phaser 3.90
- **Blockchain**: Solana Web3.js + Wallet Adapter
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React hooks + Custom event system

### Key Features
- **Hybrid Rendering**: SSR-aware components with client-side game engine
- **Responsive Design**: Mobile and desktop support
- **Real-time Visualization**: Combat animations synchronized with blockchain results
- **Wallet Integration**: Phantom and other Solana wallets
- **Dev Mode**: Monster selection for testing

## Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Home page with game
│   ├── components/            # React components
│   │   ├── GameWrapper.tsx    # Main game container
│   │   ├── GameUIOverlay.tsx  # UI layer over Phaser
│   │   ├── ClientWalletButton.tsx # Hydration-safe wallet
│   │   ├── GameUI/           # UI component library
│   │   └── *SceneUI.tsx      # Scene-specific overlays
│   ├── game/                  # Phaser game code
│   │   ├── Game.ts           # Game instance
│   │   ├── scenes/           # Game scenes
│   │   ├── objects/          # Game objects
│   │   └── config/           # Game configuration
│   ├── data/                  # Game data
│   │   └── monsters.ts       # Monster configurations
│   └── lib/                   # Utilities
│       └── gameEvents.ts     # Event definitions
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start
```

## Core Concepts

### 1. **Hydration-Safe Components**
All wallet and client-specific components handle SSR/CSR differences to prevent hydration mismatches.

### 2. **Event-Driven Architecture**
React and Phaser communicate through a custom event system, maintaining clean separation of concerns.

### 3. **Scene-Based Game Flow**
```
PreloadScene → MenuScene → ColosseumScene ↔ CombatScene → VaultScene
```

### 4. **Monster Tier System**
5 progressively difficult monsters with varying entry fees and vault crack chances:
- Skeleton Warrior (0.01 SOL, 10% crack chance)
- Goblin Chieftain (0.02 SOL, 20% crack chance)
- Minotaur Guardian (0.05 SOL, 35% crack chance)
- Hydra (0.1 SOL, 50% crack chance)
- Ancient Dragon (0.25 SOL, 70% crack chance)

### 5. **Visual-Only Combat**
All combat outcomes are determined by the backend VRF. The frontend provides engaging visualization of pre-determined results.

## Key Components

### GameWrapper
Main container that initializes Phaser and manages the game lifecycle.

### GameUIOverlay
React overlay providing UI elements on top of the Phaser canvas:
- Jackpot display
- Combat history
- Player stats
- Fight button
- Dev mode controls

### Scene UI Components
Each Phaser scene has a corresponding React UI component:
- `MenuSceneUI`: Wallet connection and game entry
- `CombatSceneUI`: Combat progress and animations
- `VaultSceneUI`: Vault crack attempt visualization

## Development Guidelines

### Performance Targets
- **Desktop**: 60 FPS
- **Mobile**: 30 FPS
- **Load Time**: < 3 seconds
- **Bundle Size**: < 2MB

### Mobile Considerations
- Touch-friendly UI elements
- Reduced particle effects
- Simplified animations
- Responsive layouts

### State Management
- **React State**: UI state, wallet connection, user preferences
- **Phaser State**: Game objects, animations, visual effects
- **Shared State**: Synchronized through events

## Important Files

1. **GameWrapper.tsx**: Core integration between React and Phaser
2. **gameEvents.ts**: Event type definitions and helpers
3. **monsters.ts**: Monster data and configuration
4. **Game.ts**: Phaser game instance configuration
5. **ClientWalletButton.tsx**: Hydration-safe wallet component

## Common Issues

### Hydration Mismatch
Solution: Use `ClientWalletButton` component and check `mounted` state before rendering client-specific content.

### Phaser Not Loading
Solution: Ensure game container div exists and has proper dimensions before initializing.

### Event Communication Failed
Solution: Check event listener registration timing and ensure proper cleanup in useEffect.

## Next Steps

See other documentation files for detailed information:
- **ARCHITECTURE.md**: Technical deep dive
- **PHASER_INTEGRATION.md**: Game engine specifics
- **UI_COMPONENTS.md**: Component library reference
- **EVENT_SYSTEM.md**: Event communication patterns