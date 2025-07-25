# Event System Documentation

## Overview

Aurelius Colosseum uses a custom event system to enable seamless communication between React components and the Phaser game engine. This bidirectional communication allows for clean separation of concerns while maintaining synchronized state.

## Architecture

### Event Flow
```
React Component → Custom Event → Window → Phaser Scene
Phaser Scene → Game Event → Window → React Component
```

### Event Types
1. **Command Events**: React → Phaser (user actions)
2. **State Events**: Phaser → React (game state updates)
3. **System Events**: Internal coordination

## Event Definitions

```typescript
// lib/gameEvents.ts
export type GameEventType = 
  // Command Events (React → Phaser)
  | 'startCombat'
  | 'walletConnected'
  | 'enterColosseum'
  | 'fightButtonClicked'
  | 'devMonsterSelect'
  | 'pauseGame'
  | 'resumeGame'
  
  // State Events (Phaser → React)
  | 'sceneReady'
  | 'combatStarted'
  | 'combatComplete'
  | 'gameStateUpdate'
  | 'monsterPositionUpdate'
  | 'vaultAttemptStarted'
  | 'vaultAttemptComplete'
  | 'gameError'
  
  // System Events
  | 'assetLoadProgress'
  | 'sceneTransition';

export interface GameEvent<T = any> extends CustomEvent {
  detail: T;
}

// Event payload types
export interface CombatStartPayload {
  monster: MonsterType;
  entryFee: number;
}

export interface CombatCompletePayload {
  victory: boolean;
  gladiator: string;
  monster: string;
  rewards?: number;
  vaultAttempted?: boolean;
  vaultCracked?: boolean;
}

export interface GameStateUpdatePayload {
  jackpot?: number;
  monsterName?: string;
  playerStats?: PlayerStats;
  recentCombats?: Combat[];
}

export interface MonsterPositionPayload {
  x: number;
  y: number;
}
```

## Event Helpers

```typescript
// lib/gameEvents.ts
export class GameEvents {
  // Dispatch event helper
  static dispatch<T>(type: GameEventType, detail: T): void {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  }

  // Type-safe event listener
  static on<T>(
    type: GameEventType, 
    handler: (event: GameEvent<T>) => void
  ): () => void {
    const wrappedHandler = (e: Event) => handler(e as GameEvent<T>);
    window.addEventListener(type, wrappedHandler);
    
    // Return cleanup function
    return () => window.removeEventListener(type, wrappedHandler);
  }

  // One-time event listener
  static once<T>(
    type: GameEventType, 
    handler: (event: GameEvent<T>) => void
  ): void {
    const wrappedHandler = (e: Event) => {
      handler(e as GameEvent<T>);
      window.removeEventListener(type, wrappedHandler);
    };
    window.addEventListener(type, wrappedHandler);
  }
}
```

## React Integration

### Sending Events to Phaser
```typescript
// components/FightButton.tsx
const handleFightClick = () => {
  // Get current monster from game state
  const monster = gameState.currentMonster;
  
  // Dispatch event to Phaser
  GameEvents.dispatch('startCombat', {
    monster: monster.key,
    entryFee: monster.entryFee
  });
};
```

### Listening to Phaser Events
```typescript
// components/GameUIOverlay.tsx
useEffect(() => {
  // Listen for game state updates
  const unsubscribe = GameEvents.on<GameStateUpdatePayload>(
    'gameStateUpdate',
    (event) => {
      setGameState(prev => ({ ...prev, ...event.detail }));
    }
  );

  // Listen for combat completion
  const unsubCombat = GameEvents.on<CombatCompletePayload>(
    'combatComplete',
    (event) => {
      if (event.detail.victory) {
        showVictoryNotification();
      }
    }
  );

  // Cleanup
  return () => {
    unsubscribe();
    unsubCombat();
  };
}, []);
```

### Hook for Event Handling
```typescript
// hooks/useGameEvent.ts
export function useGameEvent<T>(
  eventType: GameEventType,
  handler: (detail: T) => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const unsubscribe = GameEvents.on<T>(eventType, (event) => {
      handler(event.detail);
    });

    return unsubscribe;
  }, deps);
}

// Usage
useGameEvent<CombatCompletePayload>('combatComplete', (detail) => {
  console.log('Combat ended:', detail.victory ? 'Victory!' : 'Defeat');
});
```

## Phaser Integration

### Setting Up Event Listeners
```typescript
// scenes/BaseScene.ts
export abstract class BaseScene extends Phaser.Scene {
  protected eventCleanup: Array<() => void> = [];

  create(): void {
    this.setupEventListeners();
  }

  protected setupEventListeners(): void {
    // Listen for React commands
    this.eventCleanup.push(
      GameEvents.on('pauseGame', () => this.pauseGame()),
      GameEvents.on('resumeGame', () => this.resumeGame())
    );
  }

  shutdown(): void {
    // Clean up event listeners
    this.eventCleanup.forEach(cleanup => cleanup());
    this.eventCleanup = [];
  }
}
```

### Dispatching Events from Phaser
```typescript
// scenes/CombatScene.ts
private onCombatComplete(): void {
  // Notify React of combat completion
  GameEvents.dispatch('combatComplete', {
    victory: this.combatResult.victory,
    gladiator: this.playerWallet,
    monster: this.combatResult.monster,
    rewards: this.combatResult.rewards,
    vaultAttempted: this.combatResult.vaultAttempted,
    vaultCracked: this.combatResult.vaultCracked
  });

  // Update game state
  GameEvents.dispatch('gameStateUpdate', {
    playerStats: {
      combats: this.registry.get('totalCombats') + 1,
      victories: this.registry.get('totalVictories') + (this.combatResult.victory ? 1 : 0),
      vaultsCracked: this.registry.get('vaultsCracked'),
      totalWinnings: this.registry.get('totalWinnings')
    }
  });
}
```

### Scene-Specific Events
```typescript
// scenes/ColosseumScene.ts
create(): void {
  super.create();
  
  // Scene is ready
  GameEvents.dispatch('sceneReady', { scene: 'ColosseumScene' });
  
  // Listen for fight button
  this.eventCleanup.push(
    GameEvents.on('fightButtonClicked', () => {
      this.startCombatSequence();
    })
  );
  
  // Listen for dev mode monster selection
  this.eventCleanup.push(
    GameEvents.on<{ monster: MonsterType }>('devMonsterSelect', (event) => {
      this.currentMonster = event.detail.monster;
      this.updateMonsterDisplay();
    })
  );
  
  // Track monster position for UI labels
  this.events.on('update', () => {
    if (this.monster) {
      GameEvents.dispatch('monsterPositionUpdate', {
        x: this.monster.x,
        y: this.monster.y
      });
    }
  });
}
```

## Event Patterns

### 1. Request-Response Pattern
```typescript
// React: Request combat result
GameEvents.dispatch('requestCombatResult', { combatId: '123' });

// Phaser: Respond with result
GameEvents.on('requestCombatResult', (event) => {
  const result = this.getCombatResult(event.detail.combatId);
  GameEvents.dispatch('combatResultResponse', result);
});

// React: Handle response
GameEvents.once('combatResultResponse', (event) => {
  updateCombatUI(event.detail);
});
```

### 2. State Synchronization
```typescript
// Phaser: Emit state changes
class GameStateManager {
  private emitStateChange(): void {
    GameEvents.dispatch('gameStateUpdate', {
      jackpot: this.currentJackpot,
      monsterName: this.currentMonster.name,
      playerStats: this.playerStats,
      recentCombats: this.recentCombats.slice(-10)
    });
  }
  
  updateJackpot(amount: number): void {
    this.currentJackpot = amount;
    this.emitStateChange();
  }
}

// React: Subscribe to state
const [gameState, setGameState] = useState(initialState);

useGameEvent<GameStateUpdatePayload>('gameStateUpdate', (state) => {
  setGameState(prev => ({ ...prev, ...state }));
});
```

### 3. Error Handling
```typescript
// Phaser: Emit errors
try {
  await this.loadCombatAssets();
} catch (error) {
  GameEvents.dispatch('gameError', {
    type: 'ASSET_LOAD_FAILED',
    message: error.message,
    scene: this.scene.key
  });
}

// React: Handle errors
useGameEvent<GameErrorPayload>('gameError', (error) => {
  console.error('Game error:', error);
  
  if (error.type === 'ASSET_LOAD_FAILED') {
    showErrorNotification('Failed to load game assets. Please refresh.');
  }
});
```

### 4. Debounced Events
```typescript
// utils/eventDebounce.ts
export function createDebouncedEvent<T>(
  eventType: GameEventType,
  delay: number = 100
): (detail: T) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (detail: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      GameEvents.dispatch(eventType, detail);
    }, delay);
  };
}

// Usage in Phaser
const debouncedPositionUpdate = createDebouncedEvent<MonsterPositionPayload>(
  'monsterPositionUpdate',
  50 // Update every 50ms max
);

update(): void {
  if (this.monster) {
    debouncedPositionUpdate({ x: this.monster.x, y: this.monster.y });
  }
}
```

## Testing Events

```typescript
// __tests__/gameEvents.test.ts
describe('GameEvents', () => {
  beforeEach(() => {
    // Clear all event listeners
    jest.clearAllMocks();
  });

  it('should dispatch and receive events', (done) => {
    const payload = { monster: 'SKELETON_WARRIOR', entryFee: 10000000 };
    
    GameEvents.on<CombatStartPayload>('startCombat', (event) => {
      expect(event.detail).toEqual(payload);
      done();
    });
    
    GameEvents.dispatch('startCombat', payload);
  });

  it('should cleanup listeners', () => {
    const handler = jest.fn();
    const cleanup = GameEvents.on('gameStateUpdate', handler);
    
    GameEvents.dispatch('gameStateUpdate', { jackpot: 1000 });
    expect(handler).toHaveBeenCalledTimes(1);
    
    cleanup();
    
    GameEvents.dispatch('gameStateUpdate', { jackpot: 2000 });
    expect(handler).toHaveBeenCalledTimes(1); // Not called again
  });
});
```

## Best Practices

### 1. Event Naming
- Use camelCase for event names
- Be descriptive but concise
- Group related events with prefixes

### 2. Payload Design
- Keep payloads flat when possible
- Include only necessary data
- Use TypeScript interfaces for type safety

### 3. Memory Management
- Always clean up event listeners
- Use `once` for single-use events
- Avoid creating listeners in render loops

### 4. Performance
- Debounce high-frequency events
- Batch state updates when possible
- Use event delegation for similar handlers

### 5. Debugging
```typescript
// Enable event logging in development
if (process.env.NODE_ENV === 'development') {
  const originalDispatch = GameEvents.dispatch;
  GameEvents.dispatch = (type, detail) => {
    console.log(`[GameEvent] ${type}:`, detail);
    originalDispatch(type, detail);
  };
}
```

## Common Event Flows

### Combat Flow
```
1. User clicks fight button
2. React: dispatch('startCombat')
3. Phaser: receive event, transition to CombatScene
4. Phaser: dispatch('combatStarted')
5. React: show combat UI
6. Phaser: run combat visualization
7. Phaser: dispatch('combatComplete')
8. React: update stats and history
```

### Wallet Connection Flow
```
1. User connects wallet
2. React: dispatch('walletConnected')
3. Phaser: transition from MenuScene to ColosseumScene
4. Phaser: dispatch('sceneReady')
5. React: show game UI overlay
```

### Dev Mode Flow
```
1. User toggles dev mode
2. User selects monster from dropdown
3. React: dispatch('devMonsterSelect')
4. Phaser: update current monster
5. Phaser: dispatch('gameStateUpdate')
6. React: reflect new monster in UI
```