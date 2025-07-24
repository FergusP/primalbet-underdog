import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface CombatSceneUIProps {}

interface HealthData {
  current: number;
  max: number;
}

interface DamageNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

interface CombatState {
  playerHealth: HealthData;
  monsterHealth: HealthData;
  monsterName: string;
  spearCount: number;
  maxSpears: number;
  gameState: 'playing' | 'victory' | 'defeat';
  statusMessage: string;
  showInstructions: boolean;
  debugMode: boolean;
  uiVisible: boolean;
}

export const CombatSceneUI: React.FC<CombatSceneUIProps> = () => {
  const [combatState, setCombatState] = useState<CombatState>({
    playerHealth: { current: 100, max: 100 },
    monsterHealth: { current: 100, max: 100 },
    monsterName: 'Monster',
    spearCount: 2,
    maxSpears: 2,
    gameState: 'playing',
    statusMessage: '',
    showInstructions: true,
    debugMode: false,
    uiVisible: true,
  });

  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [showCrackButton, setShowCrackButton] = useState(false);
  const [devMode] = useState(true); // Development toggle
  const [forceSuccess, setForceSuccess] = useState(false); // Dev: force success

  // Listen for combat state updates from Phaser
  useEffect(() => {
    const handleCombatUpdate = (event: CustomEvent) => {
      const state = event.detail;
      setCombatState((prev) => ({
        ...prev,
        playerHealth: {
          current: state.playerHealth,
          max: state.playerMaxHealth,
        },
        monsterHealth: {
          current: state.monsterHealth,
          max: state.monsterMaxHealth,
        },
        spearCount: state.currentSpears,
        maxSpears: state.maxSpears,
        debugMode: state.debugMode,
      }));
    };

    const handleMonsterInfo = (event: CustomEvent) => {
      setCombatState((prev) => ({ ...prev, monsterName: event.detail.type }));
    };

    const handleDamageNumber = (event: CustomEvent) => {
      const { damage, x, y, type } = event.detail;
      const damageNumber: DamageNumber = {
        id: Date.now() + Math.random().toString(),
        value: damage,
        x: x,
        y: y,
        color: type === 'monster' ? '#ff4444' : '#ffd700',
        timestamp: Date.now(),
      };

      setDamageNumbers((prev) => [...prev, damageNumber]);

      // Remove damage number after animation
      setTimeout(() => {
        setDamageNumbers((prev) =>
          prev.filter((d) => d.id !== damageNumber.id)
        );
      }, 2000);
    };

    const handleCombatFeedback = (event: CustomEvent) => {
      const { message } = event.detail;
      setCombatState((prev) => ({ ...prev, statusMessage: message }));
      setTimeout(() => {
        setCombatState((prev) => ({ ...prev, statusMessage: '' }));
      }, 2000);
    };

    const handleVictoryUI = (event: CustomEvent) => {
      setCombatState((prev) => ({ ...prev, gameState: 'victory' }));
      setShowVictoryAnimation(true);
      // Show crack button after shorter delay
      setTimeout(() => setShowCrackButton(true), 800);
    };

    const handleDefeatUI = () => {
      setCombatState((prev) => ({ ...prev, gameState: 'defeat' }));
    };

    const handleUIVisibility = (event: CustomEvent) => {
      setCombatState((prev) => ({ ...prev, uiVisible: event.detail.visible }));
    };

    // Listen for scene change
    const handleSceneChange = (event: CustomEvent) => {
      if (event.detail.sceneName === 'CombatScene') {
        // Reset state when entering combat
        setCombatState({
          playerHealth: { current: 100, max: 100 },
          monsterHealth: { current: 100, max: 100 },
          monsterName: 'Monster',
          spearCount: 2,
          maxSpears: 2,
          gameState: 'playing',
          statusMessage: '',
          showInstructions: true,
          debugMode: false,
          uiVisible: true,
        });
        // Reset victory state
        setShowVictoryAnimation(false);
        setShowCrackButton(false);
      } else if (event.detail.sceneName === 'VaultScene') {
        // Hide combat UI when entering vault scene
        setCombatState((prev) => ({ ...prev, gameState: 'playing' }));
        setShowVictoryAnimation(false);
        setShowCrackButton(false);
      }
    };

    window.addEventListener(
      'combat-state-update',
      handleCombatUpdate as EventListener
    );
    window.addEventListener('monster-info', handleMonsterInfo as EventListener);
    window.addEventListener(
      'damage-number',
      handleDamageNumber as EventListener
    );
    window.addEventListener(
      'combat-feedback',
      handleCombatFeedback as EventListener
    );
    window.addEventListener('victory-ui', handleVictoryUI as EventListener);
    window.addEventListener('defeat-ui', handleDefeatUI as EventListener);
    window.addEventListener(
      'ui-visibility',
      handleUIVisibility as EventListener
    );
    window.addEventListener('sceneChanged', handleSceneChange as EventListener);

    return () => {
      window.removeEventListener(
        'combat-state-update',
        handleCombatUpdate as EventListener
      );
      window.removeEventListener(
        'monster-info',
        handleMonsterInfo as EventListener
      );
      window.removeEventListener(
        'damage-number',
        handleDamageNumber as EventListener
      );
      window.removeEventListener(
        'combat-feedback',
        handleCombatFeedback as EventListener
      );
      window.removeEventListener(
        'victory-ui',
        handleVictoryUI as EventListener
      );
      window.removeEventListener('defeat-ui', handleDefeatUI as EventListener);
      window.removeEventListener(
        'ui-visibility',
        handleUIVisibility as EventListener
      );
      window.removeEventListener(
        'sceneChanged',
        handleSceneChange as EventListener
      );
    };
  }, []);

  // Handle crack vault button click
  const handleCrackVault = () => {
    // Hide victory UI before transitioning
    setCombatState((prev) => ({ ...prev, gameState: 'playing' }));

    // Simulate VRF check - use dev toggle if enabled
    const success = devMode ? forceSuccess : Math.random() < 0.3;

    // Immediately continue to vault scene with VRF result
    window.dispatchEvent(
      new CustomEvent('continue-from-vault', {
        detail: { vrfResult: success },
      })
    );
  };

  // Removed handleContinue - no longer needed

  const handleReturnToColosseum = () => {
    window.dispatchEvent(new CustomEvent('return-to-colosseum'));
  };

  const getHealthBarColor = (current: number, max: number) => {
    const percentage = current / max;
    if (percentage > 0.6) return '#4ade80'; // Green
    if (percentage > 0.3) return '#facc15'; // Yellow
    return '#ef4444'; // Red
  };

  const getSpearCountColor = () => {
    if (combatState.spearCount === 0) return '#ef4444'; // Red
    if (combatState.spearCount === 1) return '#facc15'; // Yellow
    return '#4ade80'; // Green
  };

  if (
    combatState.gameState !== 'playing' &&
    combatState.gameState !== 'victory' &&
    combatState.gameState !== 'defeat'
  ) {
    return null;
  }

  return createPortal(
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    >
      {/* Health Bars */}
      {combatState.uiVisible && (
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          {/* Player Health */}
          <div className="bg-black/70 p-4 rounded-lg border border-blue-500/50">
            <div className="text-blue-400 font-bold text-lg mb-2">
              GLADIATOR
            </div>
            <div className="w-64 h-6 bg-gray-800 rounded border border-gray-600 relative overflow-hidden">
              <div
                className="h-full transition-all duration-300 ease-out"
                style={{
                  width: `${
                    (combatState.playerHealth.current /
                      combatState.playerHealth.max) *
                    100
                  }%`,
                  backgroundColor: getHealthBarColor(
                    combatState.playerHealth.current,
                    combatState.playerHealth.max
                  ),
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                {combatState.playerHealth.current}/
                {combatState.playerHealth.max}
              </div>
            </div>
          </div>

          {/* Monster Health */}
          <div className="bg-black/70 p-4 rounded-lg border border-red-500/50">
            <div className="text-red-400 font-bold text-lg mb-2 text-right">
              {combatState.monsterName.toUpperCase()}
            </div>
            <div className="w-64 h-6 bg-gray-800 rounded border border-gray-600 relative overflow-hidden">
              <div
                className="h-full transition-all duration-300 ease-out"
                style={{
                  width: `${
                    (combatState.monsterHealth.current /
                      combatState.monsterHealth.max) *
                    100
                  }%`,
                  backgroundColor: getHealthBarColor(
                    combatState.monsterHealth.current,
                    combatState.monsterHealth.max
                  ),
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                {combatState.monsterHealth.current}/
                {combatState.monsterHealth.max}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spear Counter */}
      {combatState.uiVisible && (
        <div className="absolute top-20 right-4">
          <div className="bg-black/70 p-3 rounded-lg border border-yellow-500/50">
            <div
              className="font-bold text-lg"
              style={{ color: getSpearCountColor() }}
            >
              Spears: {combatState.spearCount}/{combatState.maxSpears}
            </div>
          </div>
        </div>
      )}

      {/* Control Instructions */}
      {combatState.showInstructions && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="bg-black/70 p-4 rounded-lg border border-gray-500/50">
            <div className="text-white text-center">
              <div className="text-sm">
                WASD/Arrows: Move • Space: Melee Attack • E: Throw Spear
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {combatState.statusMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-red-600/90 p-6 rounded-lg border-2 border-red-400 animate-pulse">
            <div className="text-white text-2xl font-bold text-center">
              {combatState.statusMessage}
            </div>
          </div>
        </div>
      )}

      {/* Floating Damage Numbers */}
      {damageNumbers.map((damage) => (
        <div
          key={damage.id}
          className="absolute pointer-events-none select-none font-bold text-2xl animate-damage-float"
          style={{
            left: `${damage.x}px`,
            top: `${damage.y}px`,
            color: damage.color,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            WebkitTextStroke: '1px #000000',
          }}
        >
          -{damage.value}
        </div>
      ))}

      {/* Victory Notification */}
      {combatState.gameState === 'victory' && (
        <>
          {/* Victory Background Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/20 to-transparent animate-pulse" />
            {/* Sparkles */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  fontSize: `${Math.random() * 20 + 10}px`,
                }}
              >
                ✨
              </div>
            ))}
          </div>

          {/* Main Victory Text */}
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="relative">
              {/* Glow effect behind text */}
              <div className="absolute inset-0 blur-xl bg-yellow-400/50 animate-pulse" />

              <h1
                className="relative text-8xl font-bold animate-victory-bounce text-center"
                style={{
                  color: '#ffd700',
                  textShadow:
                    '0 0 40px #ffaa00, 0 0 60px #ff6600, 6px 6px 12px #000000',
                  WebkitTextStroke: '3px #ff6600',
                  letterSpacing: '0.1em',
                }}
              >
                VICTORY!
              </h1>
            </div>

            {/* Trophy Icons */}
            <div className="flex justify-center mt-6 space-x-8">
              <span className="text-6xl animate-trophy-spin">🏆</span>
              <span
                className="text-6xl animate-trophy-spin"
                style={{ animationDelay: '0.2s' }}
              >
                ⚔️
              </span>
              <span
                className="text-6xl animate-trophy-spin"
                style={{ animationDelay: '0.4s' }}
              >
                🏆
              </span>
            </div>

            {/* Subtitle */}
            <p
              className="text-3xl text-yellow-300 text-center mt-4 font-bold animate-fade-in-up"
              style={{
                textShadow: '3px 3px 6px #000000',
                animationDelay: '0.5s',
              }}
            >
              You have defeated {combatState.monsterName}!
            </p>

            {/* Crack Vault Button */}
            {showCrackButton && (
              <div
                className="mt-52 animate-fade-in-up pointer-events-auto text-center"
                style={{ animationDelay: '0.3s' }}
              >
                <button
                  onClick={handleCrackVault}
                  className="px-12 py-6 bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 rounded-2xl font-bold text-2xl text-black shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    boxShadow:
                      '0 0 30px rgba(255, 215, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.3)',
                    border: '3px solid #b8860b',
                  }}
                >
                  🔨 CRACK THE VAULT! 🔨
                </button>

                <br />
                {/* Dev Mode Toggle */}
                {devMode && (
                  <div className="mt-4 p-3 bg-purple-900/80 rounded-lg border border-purple-400 inline-block">
                    <label className="flex items-center gap-3 text-white font-mono text-sm">
                      <input
                        type="checkbox"
                        checked={forceSuccess}
                        onChange={(e) => setForceSuccess(e.target.checked)}
                        className="w-4 h-4"
                      />
                      DEV: Force Success ({forceSuccess ? 'ON' : 'OFF'})
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Remove the continue button section - we go directly to vault scene */}
          </div>

          {/* Confetti particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute w-3 h-3 animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: [
                    '#ff6b6b',
                    '#4ecdc4',
                    '#45b7d1',
                    '#fdcb6e',
                    '#6c5ce7',
                  ][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Defeat Screen */}
      {combatState.gameState === 'defeat' && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
          <div className="text-center">
            <h1
              className="text-8xl font-bold mb-6"
              style={{
                color: '#ef4444',
                textShadow: '0 0 30px #dc2626, 4px 4px 8px #000000',
                WebkitTextStroke: '2px #7f1d1d',
              }}
            >
              💀 DEFEATED! 💀
            </h1>

            <h2 className="text-4xl text-white mb-8">
              The monster has defeated you!
            </h2>

            <div
              className="pointer-events-auto cursor-pointer text-2xl text-yellow-400 hover:text-yellow-200 transition-colors duration-200"
              onClick={handleReturnToColosseum}
              style={{ textShadow: '2px 2px 4px #000000' }}
            >
              Click to return to Colosseum
            </div>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {combatState.debugMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="bg-purple-900/80 p-2 rounded border border-purple-400">
            <div className="text-purple-200 text-sm font-mono">
              DEBUG MODE ACTIVE
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes damage-float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(0.8);
            opacity: 0;
          }
        }
        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
        @keyframes victory-bounce {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          25% {
            transform: translateY(-20px) scale(1.1);
          }
          75% {
            transform: translateY(10px) scale(0.95);
          }
        }
        @keyframes trophy-spin {
          0% {
            transform: rotate(0deg) scale(0);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-damage-float {
          animation: damage-float 2s ease-out forwards;
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        .animate-victory-bounce {
          animation: victory-bounce 2s ease-in-out infinite;
        }
        .animate-trophy-spin {
          animation: trophy-spin 1s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
        .animate-sparkle {
          animation: sparkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>,
    document.getElementById('game-ui-root') || document.body
  );
};
