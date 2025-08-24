import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ForestDesignSystem,
  ForestText,
  ForestIcons,
} from '../../styles/forestDesignSystem';
import { ForestButton } from '../game/buttons/ForestButton';

interface VaultSceneUIProps {}

interface VaultState {
  victory: boolean;
  monsterDefeated: string;
  walletAddress: string;
  crackChance: number;
  showCrackButton: boolean;
  isAttempting: boolean;
  resultState: 'none' | 'success' | 'failure';
  jackpotAmount: number;
}

export const VaultSceneUI: React.FC<VaultSceneUIProps> = () => {
  const [vaultState, setVaultState] = useState<VaultState>({
    victory: false,
    monsterDefeated: '',
    walletAddress: '',
    crackChance: 0,
    showCrackButton: false,
    isAttempting: false,
    resultState: 'none',
    jackpotAmount: 0,
  });

  const [isOpening, setIsOpening] = useState(false);
  const [showVaultSelection, setShowVaultSelection] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [vrfSuccess, setVrfSuccess] = useState(false);
  const [jackpotAmount, setJackpotAmount] = useState(0);
  const [showParticles, setShowParticles] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with a small delay to ensure proper positioning
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 300); // Increased delay for canvas initialization

    return () => clearTimeout(timer);
  }, []);

  // Listen for vault state updates from Phaser
  useEffect(() => {
    const handleVaultUpdate = (event: CustomEvent) => {
      setVaultState((prev) => ({ ...prev, ...event.detail }));
    };

    const handleVaultAttempt = () => {
      setVaultState((prev) => ({ ...prev, isAttempting: true }));
    };

    const handleVaultResult = (event: CustomEvent) => {
      const { success, jackpotAmount } = event.detail;
      setVaultState((prev) => ({
        ...prev,
        isAttempting: false,
        resultState: success ? 'success' : 'failure',
        jackpotAmount: jackpotAmount || 0,
      }));
    };

    const handleSpinnerStarted = () => {
      setIsOpening(true);
      setShowVaultSelection(false);
    };

    const handleSpinnerResult = (event: CustomEvent) => {
      setVrfSuccess(event.detail.success);
      if (event.detail.prizeAmount) {
        setJackpotAmount(event.detail.prizeAmount / 1e9); // Convert lamports to SOL
      }
    };

    const handleSpinnerReady = () => {
      setShowVaultSelection(true);
    };

    const handleVaultResultDisplay = (event: CustomEvent) => {
      const { success } = event.detail;
      setIsOpening(false);
      setShowResult(true);
      setVrfSuccess(success);
    };

    window.addEventListener(
      'vaultStateUpdate',
      handleVaultUpdate as EventListener
    );
    window.addEventListener(
      'vaultAttempt',
      handleVaultAttempt as EventListener
    );
    window.addEventListener('vaultResult', handleVaultResult as EventListener);
    window.addEventListener(
      'spinner-ready',
      handleSpinnerReady as EventListener
    );
    window.addEventListener(
      'spinner-started',
      handleSpinnerStarted as EventListener
    );
    window.addEventListener(
      'spinner-result',
      handleSpinnerResult as EventListener
    );
    window.addEventListener(
      'vault-result-display',
      handleVaultResultDisplay as EventListener
    );

    return () => {
      window.removeEventListener(
        'vaultStateUpdate',
        handleVaultUpdate as EventListener
      );
      window.removeEventListener(
        'vaultAttempt',
        handleVaultAttempt as EventListener
      );
      window.removeEventListener(
        'vaultResult',
        handleVaultResult as EventListener
      );
      window.removeEventListener(
        'spinner-ready',
        handleSpinnerReady as EventListener
      );
      window.removeEventListener(
        'spinner-started',
        handleSpinnerStarted as EventListener
      );
      window.removeEventListener(
        'spinner-result',
        handleSpinnerResult as EventListener
      );
      window.removeEventListener(
        'vault-result-display',
        handleVaultResultDisplay as EventListener
      );
    };
  }, []);

  const handleContinue = () => {
    window.dispatchEvent(new CustomEvent('continue-from-vault-ui'));
  };

  // Don't render until initialized to prevent positioning issues
  if (!isInitialized) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100,
        opacity: 0,
        visibility: 'visible',
        animation: 'fadeIn 0.3s ease-out forwards',
      }}
    >
      {/* Premium Casino Atmosphere - Subtle vignette only */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vignette effect for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.4) 100%)
            `,
            pointerEvents: 'none',
          }}
        />

        {/* Top spotlight effect */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: '80%',
            height: '40%',
            background:
              'radial-gradient(ellipse at center top, rgba(255, 215, 0, 0.05) 0%, transparent 50%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Luxury Casino Particles - Gold dust effect */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-luxury-float"
              style={{
                width: '2px',
                height: '2px',
                background: 'var(--color-gold)',
                borderRadius: '50%',
                boxShadow: `0 0 ${3 + Math.random() * 3}px var(--color-gold)`,
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
                opacity: Math.random() * 0.6 + 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Premium Title Section */}
      <div
        className="absolute top-10 animate-title-entrance"
        style={{
          left: '50%',
          transform: 'translateX(-50%) scale(0.8)', // Scale down
          width: '90%',
          maxWidth: '600px', // Reduced width
          willChange: 'transform',
          zIndex: 1, // Put title behind vault graphic
          opacity: 0.9, // Make slightly transparent
        }}
      >
        {/* Ornate Casino Badge */}
        <div className="relative">
          {/* Luxury border decoration */}
          <div
            className="absolute -inset-4"
            style={{
              background: `
                linear-gradient(45deg, transparent 30%, var(--color-gold) 50%, transparent 70%),
                linear-gradient(-45deg, transparent 30%, var(--color-gold) 50%, transparent 70%)
              `,
              opacity: 0.2,
              filter: 'blur(2px)',
            }}
          />

          {/* Main title - Forest Temple Style */}
          <h1
            className="relative text-center"
            style={{
              fontFamily: ForestDesignSystem.typography.display,
              fontSize: '48px', // Reduced from 4xl to prevent overlap
              fontWeight: ForestDesignSystem.typography.weights.black,
              letterSpacing: ForestDesignSystem.typography.letterSpacing.widest,
              textTransform: 'uppercase',
              marginBottom: '20px', // Add spacing
              background: `linear-gradient(
                180deg,
                ${ForestDesignSystem.colors.textLight} 0%,
                ${ForestDesignSystem.colors.goldShine} 25%,
                ${ForestDesignSystem.colors.goldDeep} 50%,
                ${ForestDesignSystem.colors.stoneGray} 75%,
                ${ForestDesignSystem.colors.mossGreen} 100%
              )`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: ForestDesignSystem.shadows.inscription,
              filter: `drop-shadow(0 2px 10px ${ForestDesignSystem.colors.goldAntique})`,
            }}
          >
            GROVE OF DESTINY
          </h1>

          {/* Forest subtitle */}
          <div
            className="text-center mt-2"
            style={{
              fontFamily: ForestDesignSystem.typography.inscription,
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#ffd700',
              letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
              textTransform: 'uppercase',
              textShadow:
                '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(255, 215, 0, 0.5)',
              opacity: 1,
            }}
          >
            🌲 PRIMALBET 🌲
          </div>
        </div>
      </div>

      {/* Premium Slot Machine Frame - Now only decorative elements, no blocking */}
      {(showVaultSelection || isOpening) && !showResult && (
        <>
          {/* Top decorative text */}
          {showVaultSelection && !isOpening && (
            <div
              className="absolute"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                top: '30%',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(16px, 2vw, 22px)',
                color: 'var(--color-light-gold)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                letterSpacing: '0.1em',
                zIndex: 10,
              }}
            >
              🌲 MAY THE FOREST GUIDE YOU 🌲
            </div>
          )}

          {/* Animated border frame around slot machine area */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(90vw, 900px)',
              height: '350px',
              marginTop: '20px',
              willChange: 'transform',
            }}
          >
            {/* Just decorative corner accents */}
            <div
              className="absolute top-0 left-0 w-20 h-20"
              style={{
                borderTop: '3px solid var(--color-gold)',
                borderLeft: '3px solid var(--color-gold)',
                borderRadius: '20px 0 0 0',
                opacity: 0.6,
              }}
            />
            <div
              className="absolute top-0 right-0 w-20 h-20"
              style={{
                borderTop: '3px solid var(--color-gold)',
                borderRight: '3px solid var(--color-gold)',
                borderRadius: '0 20px 0 0',
                opacity: 0.6,
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-20 h-20"
              style={{
                borderBottom: '3px solid var(--color-gold)',
                borderLeft: '3px solid var(--color-gold)',
                borderRadius: '0 0 0 20px',
                opacity: 0.6,
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-20 h-20"
              style={{
                borderBottom: '3px solid var(--color-gold)',
                borderRight: '3px solid var(--color-gold)',
                borderRadius: '0 0 20px 0',
                opacity: 0.6,
              }}
            />
          </div>

          {/* Spinning status */}
          {isOpening && (
            <div
              className="absolute"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: '20%',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 900,
                color: '#ffd700',
                textShadow:
                  '3px 3px 6px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 215, 0, 0.6)',
                letterSpacing: '0.05em',
                textAlign: 'center',
                padding: '10px 20px',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '10px',
                border: '2px solid rgba(255, 215, 0, 0.5)',
              }}
            >
              🌲 THE FOREST DECIDES... 🌲
            </div>
          )}
        </>
      )}

      {/* Premium Victory Result */}
      {showResult && vrfSuccess && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Luxury celebration effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Radial burst */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '200%',
                height: '200%',
                background:
                  'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 50%)',
                animation: 'burst 1s ease-out',
              }}
            />

            {/* Confetti particles */}
            {[...Array(100)].map((_, i) => (
              <div
                key={`win-${i}`}
                className="absolute"
                style={
                  {
                    left: '50%',
                    top: '50%',
                    width: `${4 + Math.random() * 4}px`,
                    height: `${8 + Math.random() * 8}px`,
                    background: [
                      'var(--color-gold)',
                      'var(--color-light-gold)',
                      'var(--color-bark)',
                      '#FFFFFF',
                    ][Math.floor(Math.random() * 4)],
                    borderRadius: '2px',
                    transform: 'translate(-50%, -50%)',
                    animation: `confetti 2s ease-out forwards`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    '--angle': `${Math.random() * 360}deg`,
                    '--distance': `${200 + Math.random() * 400}px`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          <div className="relative z-10 text-center animate-victory-entrance pointer-events-auto">
            {/* Luxury backdrop */}
            <div
              className="absolute -inset-x-20 -inset-y-16 -z-10"
              style={{
                background: `
                  radial-gradient(ellipse at center, 
                    rgba(10, 10, 10, 0.95) 0%, 
                    rgba(10, 10, 10, 0.8) 100%
                  )
                `,
                borderRadius: '30px',
                border: '3px solid var(--color-gold)',
                boxShadow: `
                  0 30px 100px rgba(0, 0, 0, 0.8),
                  0 0 100px rgba(255, 215, 0, 0.3),
                  inset 0 0 50px rgba(255, 215, 0, 0.1)
                `,
                backdropFilter: 'blur(20px)',
              }}
            />

            {/* Victory crown */}
            <div
              className="text-8xl mb-4 animate-crown-appear"
              style={{
                filter: 'drop-shadow(0 10px 30px rgba(255, 215, 0, 0.5))',
              }}
            >
              👑
            </div>

            {/* Victory text */}
            <h1
              className="mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(48px, 6vw, 84px)',
                fontWeight: 900,
                letterSpacing: '0.05em',
                background: `linear-gradient(
                  180deg,
                  #FFFFFF 0%,
                  var(--color-light-gold) 30%,
                  var(--color-gold) 60%,
                  var(--color-bark) 100%
                )`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5))',
                textTransform: 'uppercase',
              }}
            >
              Magnificent!
            </h1>

            {/* Prize display */}
            {jackpotAmount > 0 && (
              <div className="mb-8">
                <div
                  className="inline-block px-12 py-6"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                    borderRadius: '15px',
                    border: '2px solid var(--color-gold)',
                    boxShadow: '0 10px 40px rgba(255, 215, 0, 0.2)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(36px, 4.5vw, 64px)',
                      fontWeight: 700,
                      color: 'var(--color-gold)',
                      textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
                    }}
                  >
                    {jackpotAmount.toFixed(2)} SOL
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'clamp(16px, 2vw, 20px)',
                      color: 'var(--color-bark)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginTop: '8px',
                    }}
                  >
                    Your Fortune Awaits
                  </div>
                </div>
              </div>
            )}

            {/* Forest continue button */}
            <ForestButton
              onClick={handleContinue}
              variant="primary"
              size="large"
              icon="👑"
            >
              TO GLORY
            </ForestButton>
          </div>
        </div>
      )}

      {/* Premium Defeat Result */}
      {showResult && !vrfSuccess && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Subtle defeat atmosphere */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
            }}
          />

          <div className="relative z-10 text-center animate-defeat-entrance pointer-events-auto">
            {/* Elegant backdrop */}
            <div
              className="absolute -inset-x-20 -inset-y-16 -z-10"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(10, 10, 10, 0.95) 0%, 
                    rgba(26, 26, 26, 0.9) 100%
                  )
                `,
                borderRadius: '30px',
                border: '2px solid rgba(139, 0, 0, 0.5)',
                boxShadow: `
                  0 30px 100px rgba(0, 0, 0, 0.8),
                  0 0 50px rgba(139, 0, 0, 0.2)
                `,
                backdropFilter: 'blur(20px)',
              }}
            />

            {/* Near miss indicator */}
            <div
              className="text-6xl mb-6 opacity-50"
              style={{
                filter: 'grayscale(1)',
              }}
            >
              🎰
            </div>

            {/* Elegant defeat message */}
            <h1
              className="mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 4.5vw, 64px)',
                fontWeight: 700,
                color: 'var(--color-steel)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              So Close!
            </h1>

            {/* Encouraging message */}
            <p
              className="mb-8 mx-auto"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(18px, 2.5vw, 28px)',
                fontStyle: 'italic',
                color: 'var(--color-bark)',
                maxWidth: '600px',
                lineHeight: 1.6,
                opacity: 0.9,
              }}
            >
              The forest rewards the brave.
              <br />
              Your contribution grows the vault!
            </p>

            {/* Jackpot teaser */}
            <div
              className="mb-8 inline-block px-8 py-4"
              style={{
                background: 'rgba(255, 215, 0, 0.05)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 215, 0, 0.2)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(16px, 2vw, 22px)',
                  color: 'var(--color-gold)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Next Spin Could Be The One
              </div>
            </div>

            {/* Try again button - Forest style */}
            <div>
              <ForestButton
                onClick={handleContinue}
                variant="secondary"
                size="medium"
                icon="🎲"
              >
                TRY YOUR LUCK
              </ForestButton>
            </div>
          </div>
        </div>
      )}

      {/* Premium animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes luxury-float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(50px);
            opacity: 0;
          }
        }

        @keyframes title-entrance {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes burst {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }

        @keyframes confetti {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(
                calc(-50% + var(--distance) * cos(var(--angle))),
                calc(-50% + var(--distance) * sin(var(--angle)) + 100px)
              )
              rotate(720deg) scale(1);
            opacity: 0;
          }
        }

        @keyframes victory-entrance {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes crown-appear {
          0% {
            transform: translateY(-50px) scale(0);
            opacity: 0;
          }
          50% {
            transform: translateY(0) scale(1.2);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes defeat-entrance {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-title-entrance {
          animation: title-entrance 0.8s ease-out;
        }

        .animate-luxury-float {
          animation: luxury-float linear;
        }

        .animate-victory-entrance {
          animation: victory-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-crown-appear {
          animation: crown-appear 0.6s ease-out;
        }

        .animate-defeat-entrance {
          animation: defeat-entrance 0.6s ease-out;
        }

        .group-hover\\:text-gold:hover {
          color: var(--color-gold) !important;
        }
      `}</style>
    </div>,
    document.body
  );
};
