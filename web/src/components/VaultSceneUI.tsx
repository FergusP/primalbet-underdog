import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
    jackpotAmount: 0
  });
  
  const [isOpening, setIsOpening] = useState(false);
  const [showVaultSelection, setShowVaultSelection] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [vrfSuccess, setVrfSuccess] = useState(false);
  const [jackpotAmount, setJackpotAmount] = useState(0);

  const [showParticles, setShowParticles] = useState(true);

  // Listen for vault state updates from Phaser
  useEffect(() => {
    const handleVaultUpdate = (event: CustomEvent) => {
      setVaultState(prev => ({ ...prev, ...event.detail }));
    };

    const handleVaultAttempt = () => {
      setVaultState(prev => ({ ...prev, isAttempting: true }));
    };

    const handleVaultResult = (event: CustomEvent) => {
      const { success, jackpotAmount } = event.detail;
      setVaultState(prev => ({
        ...prev,
        isAttempting: false,
        resultState: success ? 'success' : 'failure',
        jackpotAmount: jackpotAmount || 0
      }));
    };

    // Listen for spinner started
    const handleSpinnerStarted = () => {
      setIsOpening(true);
      setShowVaultSelection(false);
    };
    
    // Listen for spinner result
    const handleSpinnerResult = (event: CustomEvent) => {
      setVrfSuccess(event.detail.success);
      if (event.detail.prizeAmount) {
        console.log('VaultSceneUI: Setting jackpot from prizeAmount:', event.detail.prizeAmount, 'lamports =', event.detail.prizeAmount / 1e9, 'SOL');
        setJackpotAmount(event.detail.prizeAmount / 1e9); // Convert lamports to SOL
      }
    };
    
    // Listen for spinner ready
    const handleSpinnerReady = () => {
      setShowVaultSelection(true);
    };
    
    // Listen for vault result display
    const handleVaultResultDisplay = (event: CustomEvent) => {
      const { success, jackpotAmount } = event.detail;
      setIsOpening(false);
      setShowResult(true);
      setVrfSuccess(success);
      // Don't set jackpot amount here - it's already set in handleVaultOpening
    };

    window.addEventListener('vaultStateUpdate', handleVaultUpdate as EventListener);
    window.addEventListener('vaultAttempt', handleVaultAttempt as EventListener);
    window.addEventListener('vaultResult', handleVaultResult as EventListener);
    window.addEventListener('spinner-ready', handleSpinnerReady as EventListener);
    window.addEventListener('spinner-started', handleSpinnerStarted as EventListener);
    window.addEventListener('spinner-result', handleSpinnerResult as EventListener);
    window.addEventListener('vault-result-display', handleVaultResultDisplay as EventListener);

    return () => {
      window.removeEventListener('vaultStateUpdate', handleVaultUpdate as EventListener);
      window.removeEventListener('vaultAttempt', handleVaultAttempt as EventListener);
      window.removeEventListener('vaultResult', handleVaultResult as EventListener);
      window.removeEventListener('spinner-ready', handleSpinnerReady as EventListener);
      window.removeEventListener('spinner-started', handleSpinnerStarted as EventListener);
      window.removeEventListener('spinner-result', handleSpinnerResult as EventListener);
      window.removeEventListener('vault-result-display', handleVaultResultDisplay as EventListener);
    };
  }, []);

  // Removed handleCrackVault - no longer needed as vault opens automatically

  const handleContinue = () => {
    window.dispatchEvent(new CustomEvent('continue-from-vault-ui'));
  };

  return createPortal(
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {/* Background overlay for Roman victory chamber effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-transparent to-yellow-900/20" />
      
      {/* Mystical Particles */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-particle-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Title - moved higher */}
      <h1 
        className="absolute font-bold text-center select-none"
        style={{
          top: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(28px, 3.5vw, 42px)',
          color: '#ffd700',
          textShadow: '0 0 25px #ffaa00, 0 0 50px #ff6600, 4px 4px 8px #000000'
        }}
      >
        ⚔️ CHAMBER OF FORTUNA ⚔️
      </h1>

      {/* Removed defeated monster text - no longer needed */}

      {/* Spinner Instruction - positioned above spinner */}
      {showVaultSelection && !isOpening && !showResult && (
        <div className="absolute text-center select-none animate-fade-in"
             style={{
               top: '25%',
               left: '50%',
               transform: 'translateX(-50%)',
               padding: '10px 24px',
               backgroundColor: 'rgba(0, 0, 0, 0.7)',
               borderRadius: '10px',
               border: '2px solid rgba(255, 215, 0, 0.2)',
               whiteSpace: 'nowrap'
             }}>
          <p className="font-bold"
             style={{
               fontSize: 'clamp(16px, 2vw, 22px)',
               color: '#ffd700',
               textShadow: '0 0 10px #000000, 2px 2px 4px #000000',
               margin: 0
             }}>
            The fates are spinning... Your destiny awaits!
          </p>
        </div>
      )}

      {/* Spinning Animation Text - moved lower */}
      {isOpening && !showResult && (
        <div 
          className="absolute text-center font-bold select-none animate-pulse"
          style={{
            bottom: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(20px, 2.5vw, 28px)',
            color: '#ffffff',
            textShadow: '0 0 30px #ffffff, 3px 3px 6px #000000',
            zIndex: 10
          }}
        >
          ⚡ THE FATES ARE DECIDING... ⚡
        </div>
      )}

      {/* Success Result - better positioned */}
      {showResult && vrfSuccess && (
        <div className="absolute inset-0 flex items-start justify-center" style={{ paddingTop: '20%' }}>
          <div className="text-center">
            {/* Success Flash Effect */}
            <div className="absolute inset-0 bg-gradient-radial from-yellow-400/30 via-transparent to-transparent animate-ping" />
            
            {/* Glowing effect behind text */}
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-yellow-400/40 animate-pulse" />
              
              {/* Success Text - Roman style with enhanced glow */}
              <h1 
                className="relative font-bold mb-6 animate-bounce-in select-none animate-glow"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 38px)',
                  color: '#ffd700',
                  textShadow: '0 0 40px #ffaa00, 0 0 60px #ff6600, 0 0 20px #ffff00, 4px 4px 8px #000000',
                  WebkitTextStroke: '2px #b8860b'
                }}
              >
                ⚔️ FORTUNA SMILES UPON YOU! ⚔️
              </h1>
            </div>
            
            {/* Jackpot Amount */}
            {jackpotAmount > 0 && (
              <h2 
                className="font-bold mb-6 select-none"
                style={{
                  fontSize: 'clamp(20px, 3vw, 32px)',
                  color: '#ffd700',
                  textShadow: '0 0 20px #ffaa00, 2px 2px 4px #000000'
                }}
              >
                💰 YOU WON {jackpotAmount.toFixed(2)} SOL! 💰
              </h2>
            )}
            
            {/* Continue Button */}
            <div className="pointer-events-auto">
              <button 
                onClick={handleContinue}
                className="group relative transition-all duration-200 hover:scale-105"
                style={{
                  padding: '15px 40px',
                  background: 'linear-gradient(to bottom, #4444ff, #3333cc)',
                  borderRadius: '15px',
                  border: '3px solid #2222aa',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textShadow: '1px 1px 2px #000000'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, #6666ff, #4444ff)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, #4444ff, #3333cc)';
                }}
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failure Result - Empty Vault */}
      {showResult && !vrfSuccess && (
        <div className="absolute inset-0 flex items-start justify-center" style={{ paddingTop: '20%' }}>
          <div className="text-center">
            {/* Empty Vault Text - Roman style with glow */}
            <div className="relative mb-6">
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-lg animate-pulse" />
              <h1 
                className="relative font-bold select-none"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 36px)',
                  color: '#ff6666',
                  textShadow: '0 0 30px #ff0000, 0 0 60px #ff0000, 0 0 20px #000000, 4px 4px 8px #000000',
                  WebkitTextStroke: '1px #330000',
                  letterSpacing: '0.05em'
                }}
              >
                ⚫ THE GODS WERE NOT FAVORABLE ⚫
              </h1>
            </div>
            
            {/* Removed redundant empty description - vault visual shows it's empty */}
            
            {/* Jackpot Contribution Text - More Engaging */}
            <div className="relative mb-6">
              {/* Subtle glow background */}
              <div className="absolute inset-0 bg-yellow-400/10 blur-lg rounded-lg" />
              <p 
                className="relative select-none animate-pulse"
                style={{
                  fontSize: 'clamp(16px, 2vw, 22px)',
                  color: '#ffd700',
                  textShadow: '0 0 25px #ffaa00, 0 0 40px #ff6600, 3px 3px 6px #000000',
                  fontWeight: 'bold',
                  padding: '8px 16px'
                }}
              >
                ⚔️ Your tribute feeds the colosseum's treasure! Try again, champion! ⚔️
              </p>
            </div>
            
            {/* Continue Button */}
            <div className="pointer-events-auto">
              <button 
                onClick={handleContinue}
                className="group relative transition-all duration-200 hover:scale-105"
                style={{
                  padding: '15px 40px',
                  background: 'linear-gradient(to bottom, #4444ff, #3333cc)',
                  borderRadius: '15px',
                  border: '3px solid #2222aa',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textShadow: '1px 1px 2px #000000'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, #6666ff, #4444ff)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to bottom, #4444ff, #3333cc)';
                }}
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes particle-fall {
          0% {
            transform: translateY(-10px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes glow {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 30px #ffaa00);
          }
          50% {
            filter: brightness(1.2) drop-shadow(0 0 50px #ffd700);
          }
        }
        .animate-particle-fall {
          animation: particle-fall linear infinite;
        }
        .animate-bounce-in {
          animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>,
    document.getElementById('game-ui-root') || document.body
  );
};