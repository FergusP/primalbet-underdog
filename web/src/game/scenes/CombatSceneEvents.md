# CombatScene Events Documentation

This document lists all events emitted by the CombatScene that the UI should listen to.

## Game State Events

### `combat-state-update`
Emitted whenever the game state changes (health, spears, etc.)
```typescript
{
  playerHealth: number;
  playerMaxHealth: number;
  monsterHealth: number;
  monsterMaxHealth: number;
  currentSpears: number;
  maxSpears: number;
  isSlowed: boolean;
  isGameOver: boolean;
}
```

### `monster-info`
Emitted once at the start with monster information
```typescript
{
  type: string; // e.g., "SKELETON", "GOBLIN"
  baseHealth: number;
}
```

### `combat-instructions`
Emitted once at the start with game instructions
```typescript
{
  text: string; // Instructions text
  debugMode: boolean;
}
```

## Position Events

### `sprite-positions`
Emitted every frame to update sprite positions for UI overlay
```typescript
{
  player: { x: number; y: number };
  monster: { x: number; y: number; alive: boolean };
  vault: { x: number; y: number };
}
```

## Feedback Events

### `combat-feedback`
Emitted for various combat feedback messages
```typescript
{
  type: 'too-far' | 'already-defeated' | 'no-spears' | 'slowed';
  x: number;
  y: number;
  text: string;
}
```

### `damage-number`
Emitted when damage is dealt
```typescript
{
  x: number;
  y: number;
  damage: number;
  color: string; // RGBA color string
}
```

### `distance-indicator`
Emitted to show distance to melee range (debug)
```typescript
{
  x: number;
  y: number;
  distance: number;
}
```

### `debug-distance`
Emitted to show spear distance (debug)
```typescript
{
  x: number;
  y: number;
  distance: number;
}
```

## Game Flow Events

### `game-over`
Emitted when the game ends
```typescript
{
  victory: boolean;
  monsterType: string;
}
```

### `ui-visibility`
Emitted to hide/show UI elements
```typescript
{
  visible: boolean;
}
```

### `victory-ui`
Emitted to show victory UI overlay
```typescript
{
  centerX: number;
  centerY: number;
}
```

### `defeat-ui`
Emitted to show defeat UI overlay
```typescript
{
  width: number;
  height: number;
}
```

### `combat-resize`
Emitted when the game resizes
```typescript
{
  width: number;
  height: number;
}
```

## Usage Example

In your CombatSceneUI component, you would listen to these events like:

```typescript
// In your UI component
const game = useGame(); // Get Phaser game instance

useEffect(() => {
  if (!game) return;

  const handleStateUpdate = (data: any) => {
    // Update health bars, spear counter, etc.
  };

  const handleSpritePositions = (data: any) => {
    // Update UI overlay positions
  };

  game.events.on('combat-state-update', handleStateUpdate);
  game.events.on('sprite-positions', handleSpritePositions);
  // ... add other listeners

  return () => {
    game.events.off('combat-state-update', handleStateUpdate);
    game.events.off('sprite-positions', handleSpritePositions);
    // ... remove other listeners
  };
}, [game]);
```