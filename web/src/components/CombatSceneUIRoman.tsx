import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { RomanDesignSystem, RomanText, RomanIcons } from '../styles/romanDesignSystem';
import RomanHealthBar from './Roman/RomanHealthBar';
import RomanVictoryScreen from './Roman/RomanVictoryScreen';
import { RomanFightButton, RomanButton } from './Roman/RomanButton';

interface CombatSceneUIRomanProps {}

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
  isCrit?: boolean;
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

export const CombatSceneUIRoman: React.FC<CombatSceneUIRomanProps> = () => {
  const [combatState, setCombatState] = useState<CombatState>({
    playerHealth: { current: 100, max: 100 },
    monsterHealth: { current: 100, max: 100 },
    monsterName: 'Monster',
    spearCount: 2,
    maxSpears: 2,
    gameState: 'playing',
    statusMessage: '',
    showInstructions: false, // Don't show instructions by default
    debugMode: false,
    uiVisible: true,
  });

  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [showCrackButton, setShowCrackButton] = useState(false);
  const [isLoadingVault, setIsLoadingVault] = useState(false);
  const [victoryMonsterName, setVictoryMonsterName] = useState<string>('');

  // Event listeners for combat state
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

    const handleDamageNumber = (event: CustomEvent) => {
      const { damage, x, y, type, isCrit } = event.detail;
      console.log('Damage event received:', event.detail); // Debug log
      const damageNumber: DamageNumber = {
        id: Date.now() + Math.random().toString(),
        value: damage,
        x: x,
        y: y,
        color: type === 'monster' ? '#ff4444' : '#ffd700',
        timestamp: Date.now(),
        isCrit: isCrit || false,
      };

      setDamageNumbers((prev) => [...prev, damageNumber]);

      // Remove damage number after animation
      setTimeout(() => {
        setDamageNumbers((prev) =>
          prev.filter((d) => d.id !== damageNumber.id)
        );
      }, 2000);
    };

    const handleVictoryUI = (event: CustomEvent) => {
      setCombatState((prev) => ({ ...prev, gameState: 'victory' }));
      // Use monster type from event if available, otherwise fall back to state
      const monsterType = event.detail?.monsterType || combatState.monsterName;
      setVictoryMonsterName(monsterType);
      setShowVictoryAnimation(true);
      // Show crack button after shorter delay
      setTimeout(() => setShowCrackButton(true), 800);
    };

    const handleDefeatUI = () => {
      setCombatState((prev) => ({ ...prev, gameState: 'defeat' }));
    };

    const handleMonsterInfo = (event: CustomEvent) => {
      console.log('Monster info received:', event.detail);
      setCombatState((prev) => ({ 
        ...prev, 
        monsterName: event.detail.type,
        monsterInfo: {
          name: event.detail.type,
          baseHealth: event.detail.baseHealth
        }
      }));
    };

    const handleCombatFeedback = (event: CustomEvent) => {
      const { message } = event.detail;
      setCombatState((prev) => ({ ...prev, statusMessage: message }));
      setTimeout(() => {
        setCombatState((prev) => ({ ...prev, statusMessage: '' }));
      }, 2000);
    };

    // Add event listeners
    window.addEventListener('combat-state-update', handleCombatUpdate as EventListener);
    window.addEventListener('monster-info', handleMonsterInfo as EventListener);
    window.addEventListener('damage-number', handleDamageNumber as EventListener);
    window.addEventListener('combat-feedback', handleCombatFeedback as EventListener);
    window.addEventListener('victory-ui', handleVictoryUI as EventListener);
    window.addEventListener('defeat-ui', handleDefeatUI as EventListener);

    return () => {
      window.removeEventListener('combat-state-update', handleCombatUpdate as EventListener);
      window.removeEventListener('monster-info', handleMonsterInfo as EventListener);
      window.removeEventListener('damage-number', handleDamageNumber as EventListener);
      window.removeEventListener('combat-feedback', handleCombatFeedback as EventListener);
      window.removeEventListener('victory-ui', handleVictoryUI as EventListener);
      window.removeEventListener('defeat-ui', handleDefeatUI as EventListener);
    };
  }, []);


  const handleCrackVault = async () => {
    // Set loading state
    setIsLoadingVault(true);
    
    // Hide victory UI before transitioning
    setCombatState((prev) => ({ ...prev, gameState: 'playing' }));

    try {
      // Get wallet address and combat info from the game
      const walletAddress = window.localStorage.getItem('walletAddress');
      const combatId = window.localStorage.getItem('currentCombatId') || `combat_${Date.now()}`;
      // Try to get monster type from multiple sources
      const monsterType = combatState.monsterInfo?.name || 
                         (combatState.monsterName !== 'Monster' ? combatState.monsterName : 
                         window.localStorage.getItem('currentMonsterType')) || 
                         'Cyclops Titan'; // Default to a valid monster type
      console.log('Vault attempt with monster:', monsterType, 'Full info:', combatState.monsterInfo);
      console.log('Full combat state:', combatState);

      if (!walletAddress) {
        console.error('No wallet address found');
        // Continue to vault scene with failure
        window.dispatchEvent(
          new CustomEvent('continue-from-vault', {
            detail: { vrfResult: false },
          })
        );
        return;
      }

      // Call backend vault attempt API
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

      // Continue to vault scene with actual VRF result
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
      // Continue to vault scene with failure
      window.dispatchEvent(
        new CustomEvent('continue-from-vault', {
          detail: { vrfResult: false },
        })
      );
    } finally {
      setIsLoadingVault(false);
    }
  };

  const handleContinue = useCallback(() => {
    window.dispatchEvent(new CustomEvent('continueToCrack'));
    setShowVictoryAnimation(false);
  }, []);

  if (!combatState.uiVisible) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: RomanDesignSystem.zIndex.overlay,
        fontFamily: RomanDesignSystem.typography.body,
      }}
    >
      {/* Roman Amphitheater Background Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: `linear-gradient(180deg, 
            rgba(0, 0, 0, 0.6) 0%, 
            rgba(0, 0, 0, 0.3) 50%, 
            transparent 100%)`,
          borderBottom: `2px solid ${RomanDesignSystem.colors.goldAntique}`,
        }}
      />

      {/* Imperial Banner - Top Center */}
      <div
        style={{
          position: 'absolute',
          top: RomanDesignSystem.spacing.md,
          left: '50%',
          transform: 'translateX(-50%)',
          background: RomanDesignSystem.textures.marble.background,
          border: `3px solid ${RomanDesignSystem.colors.goldDeep}`,
          borderRadius: RomanDesignSystem.borderRadius.lg,
          padding: `${RomanDesignSystem.spacing.sm} ${RomanDesignSystem.spacing.lg}`,
          boxShadow: RomanDesignSystem.shadows.raised,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: RomanDesignSystem.spacing.sm,
            fontSize: RomanDesignSystem.typography.sizes.lg,
            fontWeight: RomanDesignSystem.typography.weights.bold,
            color: RomanDesignSystem.colors.inscriptionDark,
            textShadow: RomanDesignSystem.shadows.inscription,
            letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
          }}
        >
          <span style={{ color: RomanDesignSystem.colors.goldDeep }}>🦅</span>
          <span>{RomanText.general.spqr}</span>
          <span style={{ color: RomanDesignSystem.colors.goldDeep, transform: 'scaleX(-1)' }}>🦅</span>
        </div>
      </div>

      {/* Left Arena Side - Player Health */}
      <div
        style={{
          position: 'absolute',
          top: '20px', // Move to very top
          left: '20px',
          pointerEvents: 'auto',
          transform: 'scale(0.8)', // Make smaller
          transformOrigin: 'top left',
        }}
      >
        {/* Arena Section Title */}
        <div
          style={{
            background: RomanDesignSystem.textures.bronze.background,
            border: `2px solid ${RomanDesignSystem.colors.bronzePatina}`,
            borderRadius: `${RomanDesignSystem.borderRadius.md} ${RomanDesignSystem.borderRadius.md} 0 0`,
            padding: RomanDesignSystem.spacing.sm,
            textAlign: 'center',
            fontSize: RomanDesignSystem.typography.sizes.sm,
            fontWeight: RomanDesignSystem.typography.weights.bold,
            color: RomanDesignSystem.colors.ivory,
            textShadow: RomanDesignSystem.shadows.inscription,
            letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
            marginBottom: '-2px',
          }}
        >
          PLAYER
        </div>
        
        <RomanHealthBar
          currentHealth={combatState.playerHealth.current}
          maxHealth={combatState.playerHealth.max}
          label="YOUR HEALTH"
          gladiatorType="murmillo"
          isPlayer={true}
        />
      </div>

      {/* Right Arena Side - Monster Health */}
      <div
        style={{
          position: 'absolute',
          top: '20px', // Move to very top
          right: '20px',
          pointerEvents: 'auto',
          transform: 'scale(0.8)', // Make smaller
          transformOrigin: 'top right',
        }}
      >
        {/* Arena Section Title */}
        <div
          style={{
            background: `linear-gradient(135deg, ${RomanDesignSystem.colors.crimsonRoman} 0%, #8B0000 100%)`,
            border: `2px solid ${RomanDesignSystem.colors.crimsonRoman}`,
            borderRadius: `${RomanDesignSystem.borderRadius.md} ${RomanDesignSystem.borderRadius.md} 0 0`,
            padding: RomanDesignSystem.spacing.sm,
            textAlign: 'center',
            fontSize: RomanDesignSystem.typography.sizes.sm,
            fontWeight: RomanDesignSystem.typography.weights.bold,
            color: RomanDesignSystem.colors.ivory,
            textShadow: RomanDesignSystem.shadows.inscription,
            letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
            marginBottom: '-2px',
          }}
        >
          MONSTER
        </div>
        
        <RomanHealthBar
          currentHealth={combatState.monsterHealth.current}
          maxHealth={combatState.monsterHealth.max}
          label={combatState.monsterName}
          gladiatorType="thraex"
          isPlayer={false}
        />
      </div>

      {/* Spear Arsenal - Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '24px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            background: RomanDesignSystem.textures.marble.background,
            border: `3px solid ${RomanDesignSystem.colors.goldAntique}`,
            borderRadius: RomanDesignSystem.borderRadius.lg,
            padding: RomanDesignSystem.spacing.md,
            boxShadow: RomanDesignSystem.shadows.raised,
          }}
        >
          <div
            style={{
              fontSize: RomanDesignSystem.typography.sizes.sm,
              fontWeight: RomanDesignSystem.typography.weights.bold,
              color: RomanDesignSystem.colors.inscriptionDark,
              textAlign: 'center',
              marginBottom: RomanDesignSystem.spacing.sm,
              letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
            }}
          >
            SPEARS
          </div>
          
          <div style={{ display: 'flex', gap: RomanDesignSystem.spacing.xs }}>
            {Array.from({ length: combatState.maxSpears }, (_, i) => (
              <div
                key={i}
                style={{
                  width: '30px',
                  height: '30px',
                  background: i < combatState.spearCount 
                    ? RomanDesignSystem.colors.goldLeaf 
                    : RomanDesignSystem.colors.sandstone,
                  border: `2px solid ${RomanDesignSystem.colors.bronzePatina}`,
                  borderRadius: RomanDesignSystem.borderRadius.sm,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: RomanDesignSystem.typography.sizes.base,
                  boxShadow: i < combatState.spearCount 
                    ? RomanDesignSystem.shadows.raised 
                    : RomanDesignSystem.shadows.carved,
                }}
              >
                🔱
              </div>
            ))}
          </div>
          
          <div
            style={{
              fontSize: RomanDesignSystem.typography.sizes.xs,
              color: RomanDesignSystem.colors.bronzePatina,
              textAlign: 'center',
              marginTop: RomanDesignSystem.spacing.xs,
              letterSpacing: RomanDesignSystem.typography.letterSpacing.wide,
            }}
          >
            {RomanIcons.toRomanNumeral(combatState.spearCount)} / {RomanIcons.toRomanNumeral(combatState.maxSpears)}
          </div>
        </div>
      </div>


      {/* Spear Recharge Canvas Container */}
      <div 
        id="spear-recharge-canvas" 
        style={{
          position: 'absolute',
          bottom: '140px',
          left: '24px',
          pointerEvents: 'none',
          zIndex: RomanDesignSystem.zIndex.elevated,
        }}
      />

      {/* Damage Numbers */}
      {damageNumbers.map((damage) => (
        <div
          key={damage.id}
          className={`absolute pointer-events-none select-none font-bold ${
            damage.isCrit ? 'animate-damage-crit' : 'animate-damage-float'
          }`}
          style={{
            left: `${damage.x}px`,
            top: `${damage.y}px`,
            fontSize: damage.isCrit ? '42px' : '28px',
            color: damage.color,
            textShadow: damage.isCrit 
              ? '0 0 25px currentColor, 4px 4px 8px rgba(0,0,0,0.95)' 
              : '3px 3px 6px rgba(0,0,0,0.9)',
            WebkitTextStroke: '2px #000000',
            zIndex: 1000,
          }}
        >
          {damage.isCrit && <span style={{ fontSize: '20px', marginRight: '4px' }}>💥</span>}
          -{damage.value}
          {damage.isCrit && <span style={{ fontSize: '16px', marginLeft: '4px' }}>CRIT!</span>}
        </div>
      ))}

      {/* Victory Vault Button */}
      {showCrackButton && combatState.gameState === 'victory' && (
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            zIndex: 9999,
          }}
        >
          <RomanFightButton
            onClick={handleCrackVault}
            size="large"
            loading={isLoadingVault}
            disabled={isLoadingVault}
            style={{
              animation: 'pulseGold 2s ease-in-out infinite',
            }}
          >
            {isLoadingVault ? 'LOADING...' : '⚡ DEFINE YOUR DESTINY ⚡'}
          </RomanFightButton>
        </div>
      )}

      {/* Status Message */}
      {combatState.statusMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-red-600/90 p-6 rounded-lg border-2 border-red-400 animate-pulse">
            <div className="text-white text-2xl font-bold text-center">
              {combatState.statusMessage}
            </div>
          </div>
        </div>
      )}

      {/* Instructions - Only show briefly at start */}
      {combatState.showInstructions && combatState.gameState === 'playing' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: RomanDesignSystem.textures.marble.background,
            border: `3px solid ${RomanDesignSystem.colors.goldDeep}`,
            borderRadius: RomanDesignSystem.borderRadius.lg,
            padding: RomanDesignSystem.spacing.xl,
            textAlign: 'center',
            pointerEvents: 'auto',
            animation: 'fadeInOut 4s ease-in-out forwards',
          }}
        >
          <div
            style={{
              fontSize: RomanDesignSystem.typography.sizes.lg,
              fontWeight: RomanDesignSystem.typography.weights.bold,
              color: RomanDesignSystem.colors.inscriptionDark,
              marginBottom: RomanDesignSystem.spacing.md,
              letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
            }}
          >
            PREPARE FOR BATTLE!
          </div>
          
          <div
            style={{
              fontSize: RomanDesignSystem.typography.sizes.base,
              color: RomanDesignSystem.colors.bronzePatina,
              letterSpacing: RomanDesignSystem.typography.letterSpacing.normal,
            }}
          >
            Click to hurl spears • Move with WASD
          </div>
        </div>
      )}

      {/* Roman Victory Screen */}
      <RomanVictoryScreen
        isVisible={showVictoryAnimation}
        monsterDefeated={victoryMonsterName || combatState.monsterName}
        reward={0} // Could pass actual reward amount
        onContinue={handleContinue}
      />

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes damage-float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes damage-crit {
          0% {
            transform: translateY(0) scale(1.8) rotate(-10deg);
            opacity: 1;
          }
          20% {
            transform: translateY(-30px) scale(2.2) rotate(10deg);
          }
          40% {
            transform: translateY(-60px) scale(2.0) rotate(-5deg);
          }
          100% {
            transform: translateY(-120px) scale(1.5) rotate(0deg);
            opacity: 0;
          }
        }

        .animate-damage-float {
          animation: damage-float 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .animate-damage-crit {
          animation: damage-crit 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        @keyframes pulseGold {
          0%, 100% {
            box-shadow: 0 0 20px ${RomanDesignSystem.colors.goldLeaf};
          }
          50% {
            box-shadow: 0 0 40px ${RomanDesignSystem.colors.goldLeaf}, 0 0 60px ${RomanDesignSystem.colors.goldDeep};
          }
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default CombatSceneUIRoman;