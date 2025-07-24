# UI Components Reference

## Component Library Overview

The Aurelius Colosseum UI is built with reusable React components that overlay the Phaser game canvas. All components are designed to be hydration-safe and responsive.

## Core Components

### GameWrapper
Main container that manages the Phaser game lifecycle and React integration.

```typescript
// components/GameWrapper.tsx
interface GameWrapperProps {
  children?: React.ReactNode;
}

export function GameWrapper({ children }: GameWrapperProps) {
  const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);
  const [mounted, setMounted] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined' && gameRef.current) {
      const game = new Phaser.Game({
        ...gameConfig,
        parent: gameRef.current,
      });
      
      setGameInstance(game);
      
      return () => {
        game.destroy(true);
      };
    }
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={gameRef} id="game-container" className="w-full h-full" />
      {mounted && children}
    </div>
  );
}
```

### ClientWalletButton
Hydration-safe wallet connection button that prevents SSR mismatches.

```typescript
// components/ClientWalletButton.tsx
export function ClientWalletButton({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-side placeholder
  if (!mounted) {
    return (
      <button className={className}>
        Select Wallet
      </button>
    );
  }

  // Client-side actual button
  return <WalletMultiButton className={className} />;
}
```

### GameUIOverlay
Main UI container that provides the HUD and interactive elements.

```typescript
// components/GameUIOverlay.tsx
export const GameUIOverlay: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [gameState, setGameState] = useState<GameState>(initialState);

  // Z-index layers
  const UILayer = {
    HUD: 100,
    Windows: 500,
    Modals: 1000,
    Notifications: 9999
  };

  return createPortal(
    <div
      id="game-ui-root"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: UILayer.HUD }}
    >
      {/* UI Components */}
      <JackpotDisplay amount={gameState.jackpot} />
      <HistoryPanel combats={gameState.recentCombats} />
      <StatsPanel stats={gameState.playerStats} />
      <FightButton onClick={handleFightClick} />
      {devMode && <DevModePanel />}
    </div>,
    document.body
  );
};
```

## Game UI Components

### JackpotDisplay
Animated jackpot counter showing the current prize pool.

```typescript
// components/GameUI/JackpotDisplay.tsx
interface JackpotDisplayProps {
  amount: number;
}

export const JackpotDisplay: React.FC<JackpotDisplayProps> = ({ amount }) => {
  const [displayAmount, setDisplayAmount] = useState(0);
  
  // Animate counter
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = (amount - displayAmount) / steps;
    let current = displayAmount;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= amount) {
        current = amount;
        clearInterval(timer);
      }
      setDisplayAmount(current);
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [amount]);

  return (
    <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 px-8 py-4 rounded-lg shadow-2xl">
      <h2 className="text-white text-sm font-bold text-center mb-1">JACKPOT</h2>
      <div className="text-white text-3xl font-bold text-center">
        {(displayAmount / 1e9).toFixed(3)} SOL
      </div>
    </div>
  );
};
```

### FightButton
Main action button to enter combat.

```typescript
// components/GameUI/FightButton.tsx
interface FightButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const FightButton: React.FC<FightButtonProps> = ({ onClick, disabled }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        px-12 py-6 text-2xl font-bold rounded-lg
        transition-all duration-150 transform
        ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}
        ${disabled 
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
          : 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:shadow-xl'
        }
      `}
      style={{
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        boxShadow: isPressed 
          ? 'inset 0 2px 4px rgba(0,0,0,0.3)' 
          : '0 4px 15px rgba(0,0,0,0.3)'
      }}
    >
      FIGHT!
    </button>
  );
};
```

### HistoryPanel
Shows recent combat results.

```typescript
// components/GameUI/HistoryPanel.tsx
interface Combat {
  gladiator: string;
  monster: string;
  victory: boolean;
  vaultCracked?: boolean;
  vaultAttempted?: boolean;
}

export const HistoryPanel: React.FC<{ combats: Combat[] }> = ({ combats }) => {
  return (
    <div className="bg-gray-900/90 p-4 rounded-lg border border-gray-700 w-64">
      <h3 className="text-yellow-400 font-bold mb-2">RECENT BATTLES</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {combats.map((combat, index) => (
          <div key={index} className="text-xs text-gray-300 border-b border-gray-800 pb-1">
            <div className="flex justify-between">
              <span className="truncate">{combat.gladiator.slice(0, 8)}...</span>
              <span className={combat.victory ? 'text-green-400' : 'text-red-400'}>
                {combat.victory ? 'VICTORY' : 'DEFEAT'}
              </span>
            </div>
            {combat.vaultAttempted && (
              <div className="text-yellow-400">
                Vault: {combat.vaultCracked ? 'CRACKED!' : 'Failed'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### StatsPanel
Displays player statistics.

```typescript
// components/GameUI/StatsPanel.tsx
interface PlayerStats {
  combats: number;
  victories: number;
  vaultsCracked: number;
  totalWinnings: number;
}

export const StatsPanel: React.FC<{ stats: PlayerStats }> = ({ stats }) => {
  const winRate = stats.combats > 0 
    ? ((stats.victories / stats.combats) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="bg-gray-900/90 p-4 rounded-lg border border-gray-700 w-64">
      <h3 className="text-blue-400 font-bold mb-3">YOUR STATS</h3>
      <div className="space-y-2 text-sm">
        <StatRow label="Battles" value={stats.combats} />
        <StatRow label="Victories" value={stats.victories} />
        <StatRow label="Win Rate" value={`${winRate}%`} />
        <StatRow label="Vaults Cracked" value={stats.vaultsCracked} />
        <StatRow 
          label="Total Winnings" 
          value={`${(stats.totalWinnings / 1e9).toFixed(3)} SOL`} 
        />
      </div>
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between text-gray-300">
    <span>{label}:</span>
    <span className="font-mono">{value}</span>
  </div>
);
```

### MonsterLabel
Dynamic label that follows monster position in the game.

```typescript
// components/GameUI/MonsterLabel.tsx
interface MonsterLabelProps {
  name: string;
  position: { x: number; y: number };
}

export const MonsterLabel: React.FC<MonsterLabelProps> = ({ name, position }) => {
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    const rect = gameContainer.getBoundingClientRect();
    const scaleX = rect.width / 1024; // Game width
    const scaleY = rect.height / 768; // Game height

    setScreenPos({
      x: rect.left + (position.x * scaleX),
      y: rect.top + (position.y * scaleY) - 40 // Above the monster
    });
  }, [position]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="bg-black/80 text-white px-2 py-1 rounded text-sm font-bold">
        {name}
      </div>
    </div>
  );
};
```

## Scene UI Components

### MenuSceneUI
Overlay for the menu scene with wallet connection.

```typescript
// components/MenuSceneUI.tsx
export const MenuSceneUI: React.FC = () => {
  const { connected } = useWallet();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div className="pointer-events-auto mb-8">
        <h1 className="text-6xl font-bold text-yellow-400 mb-4 text-center"
            style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
          AURELIUS COLOSSEUM
        </h1>
        <p className="text-xl text-white text-center mb-8">
          Battle monsters. Crack the vault. Claim the jackpot!
        </p>
      </div>
      
      <div className="pointer-events-auto">
        {!connected ? (
          <ClientWalletButton className="px-8 py-4 text-xl" />
        ) : (
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('enterColosseum'))}
            className="px-8 py-4 text-xl bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Enter Colosseum
          </button>
        )}
      </div>
    </div>
  );
};
```

### CombatSceneUI
Shows combat progress and information.

```typescript
// components/CombatSceneUI.tsx
export const CombatSceneUI: React.FC = () => {
  const [combatState, setCombatState] = useState<CombatState>({
    phase: 'preparing',
    gladiatorHealth: 100,
    monsterHealth: 100
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar with health */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <HealthBar 
          label="GLADIATOR" 
          current={combatState.gladiatorHealth} 
          max={100} 
        />
        <HealthBar 
          label="MONSTER" 
          current={combatState.monsterHealth} 
          max={100} 
        />
      </div>

      {/* Combat phase indicator */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/80 text-yellow-400 px-6 py-2 rounded-lg text-xl font-bold">
          {combatState.phase.toUpperCase()}
        </div>
      </div>
    </div>
  );
};
```

### VaultSceneUI
Displays vault crack attempt UI.

```typescript
// components/VaultSceneUI.tsx
export const VaultSceneUI: React.FC = () => {
  const [vaultState, setVaultState] = useState<VaultState>({
    crackChance: 0,
    attempting: false,
    result: null
  });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {vaultState.attempting && !vaultState.result && (
        <div className="pointer-events-auto bg-black/90 p-8 rounded-lg">
          <h2 className="text-3xl text-yellow-400 mb-4">ATTEMPTING VAULT CRACK</h2>
          <div className="text-xl text-white mb-2">
            Success Chance: {vaultState.crackChance}%
          </div>
          <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400 transition-all duration-1000"
              style={{ width: `${vaultState.crackChance}%` }}
            />
          </div>
        </div>
      )}

      {vaultState.result && (
        <div className="pointer-events-auto">
          {vaultState.result.success ? (
            <VaultSuccess amount={vaultState.result.amount} />
          ) : (
            <VaultFailed />
          )}
        </div>
      )}
    </div>
  );
};
```

## Utility Components

### LoadingSpinner
Reusable loading indicator.

```typescript
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <svg className="w-full h-full" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
        />
      </svg>
    </div>
  );
};
```

### ErrorBoundary
Catches and displays errors gracefully.

```typescript
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <div className="text-center">
            <h1 className="text-2xl text-red-500 mb-4">Something went wrong</h1>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Component Guidelines

### 1. Hydration Safety
Always check mounted state before rendering client-specific content.

### 2. Event Handling
Use custom events for React ↔ Phaser communication.

### 3. Performance
- Use React.memo for expensive components
- Implement proper cleanup in useEffect
- Avoid unnecessary re-renders

### 4. Accessibility
- Provide keyboard navigation where possible
- Include ARIA labels for screen readers
- Ensure sufficient color contrast

### 5. Responsive Design
- Test on various screen sizes
- Use relative units (rem, %) where appropriate
- Implement touch-friendly interactions for mobile