# Frontend Technical Architecture

## System Overview

The Aurelius Colosseum frontend is a hybrid architecture combining server-side rendered React components with a client-side Phaser game engine. This design ensures optimal SEO, fast initial loads, and rich interactive gameplay.

## Architecture Layers

### 1. **Next.js Application Layer**
- **App Router**: Modern routing with layouts and error boundaries
- **Server Components**: Default for static content
- **Client Components**: Interactive elements and game integration
- **API Routes**: Backend communication endpoints

### 2. **React Component Layer**
- **Provider Components**: Wallet, theme, and game context
- **UI Components**: Reusable interface elements
- **Scene UI Components**: Scene-specific overlays
- **Hydration-Safe Components**: SSR-aware implementations

### 3. **Phaser Game Layer**
- **Game Instance**: Single Phaser.Game managing all scenes
- **Scene Manager**: Controls scene flow and transitions
- **Game Objects**: Sprites, containers, and effects
- **Asset Pipeline**: Texture atlas and audio management

### 4. **Communication Layer**
- **Event Bus**: Custom event system for React ↔ Phaser
- **State Bridge**: Shared state synchronization
- **API Client**: Backend service communication

## Component Architecture

```
App Layout (Server Component)
└── Providers (Client Component)
    ├── WalletProvider
    │   └── WalletContextProvider
    └── GameWrapper (Client Component)
        ├── Phaser Game Instance
        ├── GameUIOverlay
        │   ├── JackpotDisplay
        │   ├── HistoryPanel
        │   ├── StatsPanel
        │   └── FightButton
        └── Scene UI Components
            ├── MenuSceneUI
            ├── CombatSceneUI
            └── VaultSceneUI
```

## State Management

### React State
```typescript
// Global state via Context
interface GameContextState {
  gameInstance: Phaser.Game | null;
  currentScene: string;
  isLoading: boolean;
  error: string | null;
}

// Component state via hooks
const [mounted, setMounted] = useState(false);
const [gameState, setGameState] = useState<GameState>(initialState);
```

### Phaser State
```typescript
// Scene data
interface SceneData {
  combatResult?: CombatResult;
  monsterType?: MonsterType;
  fromScene?: string;
}

// Registry for global state
game.registry.set('currentMonster', monster);
game.registry.get('jackpotAmount');
```

### State Synchronization
```typescript
// React → Phaser
window.dispatchEvent(new CustomEvent('startCombat', { 
  detail: { monster: 'SKELETON_WARRIOR' } 
}));

// Phaser → React
this.game.events.emit('combatComplete', { 
  victory: true, 
  rewards: 100 
});
```

## Hydration Strategy

### Problem
Next.js SSR can cause hydration mismatches with client-only features like wallet connections and game initialization.

### Solution
```typescript
// 1. Mounted state pattern
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

// 2. Client-only wrapper components
export function ClientWalletButton() {
  if (!mounted) {
    return <div>Select Wallet</div>; // Server placeholder
  }
  return <WalletMultiButton />; // Client implementation
}

// 3. Dynamic imports
const Game = dynamic(() => import('../game/Game'), {
  ssr: false,
  loading: () => <div>Loading game...</div>
});
```

## Performance Optimizations

### 1. **Code Splitting**
```typescript
// Lazy load heavy components
const CombatEffects = lazy(() => import('./effects/CombatEffects'));

// Route-based splitting handled by Next.js
```

### 2. **Asset Optimization**
```typescript
// Texture atlases for sprites
this.load.atlas('monsters', 'monsters.png', 'monsters.json');

// Audio sprites for effects
this.load.audioSprite('combat', 'combat.json', 'combat.mp3');
```

### 3. **Render Optimization**
```typescript
// React.memo for expensive components
export const JackpotDisplay = memo(({ amount }) => {
  // Component implementation
});

// Phaser object pooling
const bulletPool = this.add.group({
  classType: Bullet,
  maxSize: 30,
  runChildUpdate: true
});
```

### 4. **Mobile Adaptations**
```typescript
// Detect and adapt
if (isMobile()) {
  game.config.fps.target = 30; // Reduce FPS
  particleManager.setQuality(0.5); // Reduce particles
  scene.scale.setGameSize(800, 600); // Smaller resolution
}
```

## Error Handling

### React Error Boundaries
```typescript
// app/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Phaser Error Handling
```typescript
// Scene error handling
create() {
  this.load.on('loaderror', (file: any) => {
    console.error('Failed to load:', file.key);
    this.scene.start('ErrorScene', { error: file.key });
  });
}

// Global game error handler
game.events.on('error', (error: Error) => {
  window.dispatchEvent(new CustomEvent('gameError', { 
    detail: error 
  }));
});
```

## Security Considerations

### 1. **Input Validation**
All user inputs are validated client-side for UX and server-side for security.

### 2. **State Integrity**
Game state is read-only from server. Client never modifies authoritative state.

### 3. **Wallet Security**
- No private keys in client code
- Transaction signing through wallet adapter
- Signature verification on backend

### 4. **API Security**
```typescript
// Rate limiting awareness
const apiCall = async () => {
  try {
    const response = await fetch('/api/combat', {
      headers: {
        'X-Game-Session': sessionId,
      }
    });
    // Handle response
  } catch (error) {
    if (error.status === 429) {
      // Handle rate limit
    }
  }
};
```

## Build Architecture

### Development Build
```bash
NODE_ENV=development
- Source maps enabled
- Hot module replacement
- Verbose logging
- Dev tools enabled
```

### Production Build
```bash
NODE_ENV=production
- Minified and optimized
- Tree shaking
- Dead code elimination
- Asset compression
```

### Build Output
```
.next/
├── static/          # Static assets
├── server/          # Server-side code
└── cache/           # Build cache

public/
├── assets/          # Game assets
│   ├── sprites/     # Texture atlases
│   ├── audio/       # Sound effects
│   └── fonts/       # Web fonts
└── images/          # UI images
```

## Deployment Architecture

### Vercel Deployment
- **Edge Functions**: API routes at edge locations
- **Static Optimization**: Pre-rendered pages
- **Image Optimization**: Next.js Image component
- **Analytics**: Web vitals monitoring

### CDN Strategy
- **Assets**: Served from Vercel CDN
- **Game Files**: Cached with long TTL
- **API Responses**: Short TTL for dynamic data

## Monitoring and Analytics

### Performance Metrics
```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Custom game metrics
const gameMetrics = {
  sceneLoadTime: performance.now() - sceneStartTime,
  fps: game.loop.actualFps,
  drawCalls: game.renderer.drawCount
};
```

### Error Tracking
```typescript
// Sentry integration (example)
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});
```

## Future Considerations

### Scalability
- **WebWorker**: Offload heavy computations
- **WebAssembly**: Performance-critical code
- **Service Worker**: Offline capability

### Features
- **Multiplayer**: WebRTC for real-time battles
- **Achievements**: Persistent progression system
- **Leaderboards**: Global rankings