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
  isCritical?: boolean;
}

interface CombatState {
  playerHealth: HealthData;
  monsterHealth: HealthData;
  monsterName: string;
  monsterInfo?: { name: string; baseHealth: number };
  spearCount: number;
  maxSpears: number;
  gameState: 'playing' | 'victory' | 'defeat';
  statusMessage: string;
  showInstructions: boolean;
  debugMode: boolean;
  uiVisible: boolean;
}

export const CombatSceneUIEnhanced: React.FC<CombatSceneUIProps> = () => {
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
  const [combatIntensity, setCombatIntensity] = useState(0);

  // All the event listeners from original file...
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
      
      // Update combat intensity based on health
      const healthRatio = state.playerHealth / state.playerMaxHealth;
      if (healthRatio < 0.3) setCombatIntensity(2);
      else if (healthRatio < 0.6) setCombatIntensity(1);
      else setCombatIntensity(0);
    };

    const handleMonsterInfo = (event: CustomEvent) => {
      setCombatState((prev) => ({ 
        ...prev, 
        monsterName: event.detail.type,
        monsterInfo: {
          name: event.detail.type,
          baseHealth: event.detail.baseHealth
        }
      }));
    };

    const handleDamageNumber = (event: CustomEvent) => {
      const { damage, x, y, type } = event.detail;
      const isCritical = damage > 20;
      const damageNumber: DamageNumber = {
        id: Date.now() + Math.random().toString(),
        value: damage,
        x: x,
        y: y,
        color: type === 'monster' ? '#ff4444' : '#ffd700',
        timestamp: Date.now(),
        isCritical,
      };

      setDamageNumbers((prev) => [...prev, damageNumber]);

      setTimeout(() => {
        setDamageNumbers((prev) =>
          prev.filter((d) => d.id !== damageNumber.id)
        );
      }, 2000);
    };

    const handleVictoryUI = (event: CustomEvent) => {
      setCombatState((prev) => ({ ...prev, gameState: 'victory' }));
      setShowVictoryAnimation(true);
      setTimeout(() => setShowCrackButton(true), 800);
    };

    const handleDefeatUI = () => {
      setCombatState((prev) => ({ ...prev, gameState: 'defeat' }));
    };

    // Add all event listeners
    window.addEventListener('combat-state-update', handleCombatUpdate as EventListener);
    window.addEventListener('monster-info', handleMonsterInfo as EventListener);
    window.addEventListener('damage-number', handleDamageNumber as EventListener);
    window.addEventListener('victory-ui', handleVictoryUI as EventListener);
    window.addEventListener('defeat-ui', handleDefeatUI as EventListener);

    return () => {
      window.removeEventListener('combat-state-update', handleCombatUpdate as EventListener);
      window.removeEventListener('monster-info', handleMonsterInfo as EventListener);
      window.removeEventListener('damage-number', handleDamageNumber as EventListener);
      window.removeEventListener('victory-ui', handleVictoryUI as EventListener);
      window.removeEventListener('defeat-ui', handleDefeatUI as EventListener);
    };
  }, []);

  const handleCrackVault = async () => {
    setCombatState((prev) => ({ ...prev, gameState: 'playing' }));

    try {
      const walletAddress = window.localStorage.getItem('walletAddress');
      const combatId = window.localStorage.getItem('currentCombatId') || `combat_${Date.now()}`;
      const monsterType = combatState.monsterInfo?.name || 'Unknown';

      if (!walletAddress) {
        console.error('No wallet address found');
        window.dispatchEvent(
          new CustomEvent('continue-from-vault', {
            detail: { vrfResult: false },
          })
        );
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${backendUrl}/vault/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: walletAddress,
          combatId: combatId,
          monsterType: monsterType,
        }),
      });

      const result = await response.json();
      console.log('Vault attempt result:', result);

      window.dispatchEvent(
        new CustomEvent('continue-from-vault', {
          detail: { 
            vrfResult: result.success,
            prizeAmount: result.prizeAmount,
            roll: result.roll,
            crackChance: result.crackChance,
            claimTx: result.claimTx
          },
        })
      );
    } catch (error) {
      console.error('Vault attempt failed:', error);
      window.dispatchEvent(
        new CustomEvent('continue-from-vault', {
          detail: { vrfResult: false },
        })
      );
    }
  };

  const getHealthBarGradient = (current: number, max: number) => {
    const percentage = current / max;
    if (percentage > 0.6) return 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)';
    if (percentage > 0.3) return 'linear-gradient(90deg, #f59e0b 0%, #facc15 100%)';
    return 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)';
  };

  if (combatState.gameState !== 'playing' && 
      combatState.gameState !== 'victory' && 
      combatState.gameState !== 'defeat') {
    return null;
  }

  return createPortal(
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {/* Combat Effects Overlay */}
      {combatIntensity > 0 && (
        <div 
          className="absolute inset-0"
          style={{
            background: combatIntensity === 2 
              ? 'radial-gradient(ellipse at center, transparent 30%, rgba(139, 0, 0, 0.3) 100%)'
              : 'radial-gradient(ellipse at center, transparent 50%, rgba(139, 0, 0, 0.1) 100%)',
            animation: combatIntensity === 2 ? 'combatShake 0.3s infinite' : undefined,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Enhanced Health Bars */}
      {combatState.uiVisible && (
        <div className="absolute top-4 left-4 right-4 flex justify-between gap-4">
          {/* Player Health - Gladiator Style */}
          <div 
            className="flex-1 max-w-md"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%)',
              borderRadius: '8px',
              border: '2px solid var(--color-bronze)',
              padding: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 215, 0, 0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(16px, 1.8vw, 22px)',
                  fontWeight: 700,
                  color: 'var(--color-gold)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  letterSpacing: '0.05em',
                }}
              >
                GLADIATOR
              </span>
              <span style={{ fontSize: '24px' }}>⚔️</span>
            </div>
            
            {/* Health bar container */}
            <div 
              className="relative overflow-hidden"
              style={{
                height: '32px',
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '4px',
                border: '1px solid rgba(255, 215, 0, 0.3)',
              }}
            >
              {/* Health bar fill */}
              <div
                className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                style={{
                  width: `${(combatState.playerHealth.current / combatState.playerHealth.max) * 100}%`,
                  background: getHealthBarGradient(
                    combatState.playerHealth.current,
                    combatState.playerHealth.max
                  ),
                  boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                }}
              >
                {/* Animated shine effect */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                    transform: 'skewX(-20deg)',
                    animation: 'healthShine 3s ease-in-out infinite',
                  }}
                />
              </div>
              
              {/* Health text */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                {combatState.playerHealth.current} / {combatState.playerHealth.max}
              </div>
            </div>
          </div>

          {/* Monster Health - Enemy Style */}
          <div 
            className="flex-1 max-w-md"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.2) 0%, rgba(26, 26, 26, 0.9) 100%)',
              borderRadius: '8px',
              border: '2px solid var(--color-crimson)',
              padding: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(220, 20, 60, 0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: '24px' }}>👹</span>
              <span 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(16px, 1.8vw, 22px)',
                  fontWeight: 700,
                  color: 'var(--color-crimson)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  letterSpacing: '0.05em',
                }}
              >
                {combatState.monsterName.toUpperCase()}
              </span>
            </div>
            
            <div 
              className="relative overflow-hidden"
              style={{
                height: '32px',
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '4px',
                border: '1px solid rgba(220, 20, 60, 0.3)',
              }}
            >
              <div
                className="absolute inset-y-0 right-0 transition-all duration-500 ease-out"
                style={{
                  width: `${(combatState.monsterHealth.current / combatState.monsterHealth.max) * 100}%`,
                  background: getHealthBarGradient(
                    combatState.monsterHealth.current,
                    combatState.monsterHealth.max
                  ),
                  boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                }}
              />
              
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                {combatState.monsterHealth.current} / {combatState.monsterHealth.max}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Spear Counter */}
      {combatState.uiVisible && (
        <div className="absolute left-1/2 transform -translate-x-1/2 top-24">
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.95) 100%)',
              borderRadius: '50px',
              border: '2px solid var(--color-gold)',
              padding: '12px 32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 48px rgba(255, 215, 0, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex items-center gap-4">
              {/* Spear icons */}
              <div className="flex gap-2">
                {[...Array(combatState.maxSpears)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '32px',
                      opacity: i < combatState.spearCount ? 1 : 0.3,
                      transform: i < combatState.spearCount ? 'scale(1)' : 'scale(0.8)',
                      transition: 'all 0.3s ease-out',
                      filter: i < combatState.spearCount 
                        ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' 
                        : 'grayscale(1)',
                    }}
                  >
                    🗡️
                  </div>
                ))}
              </div>
              
              <div 
                id="spear-recharge-canvas" 
                style={{ 
                  width: '50px',
                  height: '50px',
                  position: 'relative'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Damage Numbers */}
      {damageNumbers.map((damage) => (
        <div
          key={damage.id}
          className={`absolute pointer-events-none select-none ${
            damage.isCritical ? 'animate-critical-hit' : 'animate-damage-float'
          }`}
          style={{
            left: `${damage.x}px`,
            top: `${damage.y}px`,
            fontSize: damage.isCritical ? '48px' : '32px',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            color: damage.color,
            textShadow: `
              0 0 20px ${damage.color},
              0 2px 4px rgba(0, 0, 0, 0.8),
              0 0 40px ${damage.color}
            `,
            WebkitTextStroke: '2px rgba(0, 0, 0, 0.8)',
          }}
        >
          {damage.isCritical && '💥'}-{damage.value}{damage.isCritical && '!'}
        </div>
      ))}

      {/* Enhanced Victory Screen */}
      {combatState.gameState === 'victory' && (
        <>
          {/* Victory Background */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.2) 0%, rgba(0, 0, 0, 0.9) 100%)',
                animation: 'victoryPulse 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Victory Content */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <div className="text-center animate-hero-entrance">
              <h1
                className="mb-8"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(60px, 10vw, 140px)',
                  fontWeight: 900,
                  background: 'linear-gradient(180deg, var(--color-light-gold) 0%, var(--color-gold) 50%, var(--color-bronze) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.8))',
                  letterSpacing: '0.05em',
                  animation: 'victoryBounce 2s ease-in-out infinite',
                }}
              >
                VICTORIA!
              </h1>

              <p
                className="mb-12"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  fontStyle: 'italic',
                  color: 'var(--color-bronze)',
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                You have conquered {combatState.monsterName}!
              </p>

              {showCrackButton && (
                <button
                  onClick={handleCrackVault}
                  className="group relative overflow-hidden animate-fade-in"
                  style={{
                    padding: '32px 80px',
                    background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-bronze) 100%)',
                    borderRadius: '8px',
                    border: '3px solid var(--color-light-gold)',
                    boxShadow: '0 16px 64px rgba(255, 215, 0, 0.4), 0 0 80px rgba(255, 215, 0, 0.3)',
                    transform: 'perspective(1000px) rotateX(5deg)',
                    transition: 'all 0.3s ease-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 20px 80px rgba(255, 215, 0, 0.6), 0 0 120px rgba(255, 215, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(5deg) scale(1)';
                    e.currentTarget.style.boxShadow = '0 16px 64px rgba(255, 215, 0, 0.4), 0 0 80px rgba(255, 215, 0, 0.3)';
                  }}
                >
                  <span 
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(24px, 3vw, 40px)',
                      fontWeight: 900,
                      color: 'var(--background)',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    ⚡ DEFINE YOUR DESTINY ⚡
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes healthShine {
          0%, 100% { transform: translateX(-100%) skewX(-20deg); }
          50% { transform: translateX(200%) skewX(-20deg); }
        }
        
        @keyframes critical-hit {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          20% {
            transform: scale(2) rotate(10deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(-120px) rotate(-5deg);
            opacity: 0;
          }
        }
        
        @keyframes victoryPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes victoryBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-20px) scale(1.05); }
          75% { transform: translateY(10px) scale(0.98); }
        }
        
        .animate-critical-hit {
          animation: critical-hit 1.5s ease-out forwards;
        }
      `}</style>
    </div>,
    document.getElementById('game-ui-root') || document.body
  );
};