import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';

interface MenuSceneUIProps {}

export const MenuSceneUI: React.FC<MenuSceneUIProps> = () => {
  const { connected, publicKey } = useWallet();
  const [walletConnected, setWalletConnected] = useState(connected);
  const [walletAddress, setWalletAddress] = useState(publicKey?.toString() || '');
  const [showEnterButton, setShowEnterButton] = useState(connected);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setWalletConnected(connected);
    setWalletAddress(publicKey?.toString() || '');
    setShowEnterButton(connected);
  }, [connected, publicKey]);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleConnectWallet = () => {
    window.dispatchEvent(new CustomEvent('connectWallet'));
  };

  const handleEnterArena = () => {
    window.dispatchEvent(new CustomEvent('enterArena'));
  };

  const shortAddress = walletAddress ? 
    `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '';

  return createPortal(
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(139, 0, 0, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(205, 127, 50, 0.05) 0%, transparent 60%)
            `,
            animation: 'pulse 8s ease-in-out infinite',
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: i % 2 === 0 ? 'var(--color-gold)' : 'var(--color-bronze)',
              opacity: Math.random() * 0.5 + 0.1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${20 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center ${
          isLoaded ? 'animate-hero-entrance' : 'opacity-0'
        }`}
      >
        {/* Logo Section */}
        <div className="relative mb-8">
          {/* Decorative Frame */}
          <div 
            className="absolute inset-0 -inset-x-20 -inset-y-10"
            style={{
              background: `url("data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50,50 L350,50 L350,150 L50,150 Z' fill='none' stroke='%23B8860B' stroke-width='2' opacity='0.3'/%3E%3C/svg%3E") center no-repeat`,
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
            }}
          />
          
          {/* Main Title */}
          <h1 
            className="relative text-center select-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 8vw, 120px)',
              fontWeight: 900,
              letterSpacing: '0.02em',
              lineHeight: 1,
              background: `linear-gradient(
                180deg,
                var(--color-light-gold) 0%,
                var(--color-gold) 50%,
                var(--color-dark-gold) 100%
              )`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8))',
            }}
          >
            BETBEAST
            <span 
              className="block mt-2"
              style={{
                fontSize: '0.8em',
                fontWeight: 600,
              }}
            >
              ARENA
            </span>
          </h1>

          {/* Subtitle */}
          <div 
            className="text-center mt-4"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(16px, 2vw, 24px)',
              color: 'var(--color-bronze)',
              fontStyle: 'italic',
              letterSpacing: '0.1em',
            }}
          >
            HUNT • FIGHT • CLAIM THE FOMO POOL
          </div>
        </div>

        {/* Status Section */}
        {walletConnected && (
          <div 
            className="mb-8 px-6 py-3 rounded-lg animate-fade-in"
            style={{
              background: 'rgba(26, 26, 26, 0.8)',
              border: '1px solid var(--color-dark-gold)',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)',
            }}
          >
            <div 
              className="flex items-center gap-3"
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 'clamp(14px, 1.5vw, 18px)',
              }}
            >
              <div 
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ background: 'var(--color-gold)' }}
              />
              <span style={{ color: 'var(--color-bronze)' }}>Connected:</span>
              <span style={{ color: 'var(--color-light-gold)', fontWeight: 600 }}>
                {shortAddress}
              </span>
            </div>
          </div>
        )}

        {/* Button Section */}
        <div className="relative pointer-events-auto">
          {!walletConnected ? (
            <button 
              onClick={handleConnectWallet}
              className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
              style={{
                padding: '24px 64px',
                background: `linear-gradient(135deg, var(--color-bronze) 0%, var(--color-dark-gold) 100%)`,
                borderRadius: '8px',
                border: '2px solid var(--color-gold)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(255, 215, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
              }}
            >
              {/* Button shine effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(
                    105deg,
                    transparent 40%,
                    rgba(255, 255, 255, 0.7) 50%,
                    transparent 60%
                  )`,
                  animation: 'shine 0.5s',
                }}
              />
              
              <span 
                className="relative z-10"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(18px, 2vw, 28px)',
                  fontWeight: 700,
                  color: 'var(--color-light-gold)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  letterSpacing: '0.05em',
                }}
              >
                CONNECT WALLET
              </span>
            </button>
          ) : (
            <button 
              onClick={handleEnterArena}
              className="group relative overflow-hidden transition-all duration-300 hover:scale-105 animate-pulse"
              style={{
                padding: '28px 80px',
                background: `linear-gradient(135deg, var(--color-blood) 0%, var(--color-crimson) 100%)`,
                borderRadius: '8px',
                border: '2px solid var(--color-gold)',
                boxShadow: '0 8px 32px rgba(139, 0, 0, 0.6), 0 0 48px rgba(255, 215, 0, 0.3)',
              }}
            >
              {/* Animated border glow */}
              <div 
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'none',
                  border: '2px solid var(--color-gold)',
                  opacity: 0.5,
                  animation: 'borderGlow 2s ease-in-out infinite',
                }}
              />
              
              <span 
                className="relative z-10 flex items-center gap-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(20px, 2.5vw, 32px)',
                  fontWeight: 900,
                  color: 'var(--color-gold)',
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8)',
                  letterSpacing: '0.05em',
                }}
              >
                <span style={{ fontSize: '1.2em' }}>⚔️</span>
                ENTER THE ARENA
                <span style={{ fontSize: '1.2em' }}>⚔️</span>
              </span>
            </button>
          )}
        </div>

        {/* Lore Text */}
        <div 
          className="mt-12 text-center max-w-2xl px-8 animate-fade-in"
          style={{
            animationDelay: '0.5s',
            opacity: 0,
            animationFillMode: 'forwards',
          }}
        >
          <p 
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(18px, 2vw, 26px)',
              fontStyle: 'italic',
              color: 'var(--color-steel)',
              lineHeight: 1.6,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
            }}
          >
            "In the dark depths of the haunted forest, 
            <br />
            only the bravest warriors may claim the Beast's treasure."
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes float {
          from { transform: translateY(100vh) rotate(0deg); }
          to { transform: translateY(-100vh) rotate(360deg); }
        }
        
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        
        @keyframes borderGlow {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.5;
          }
          50% { 
            transform: scale(1.05);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>,
    document.getElementById('game-ui-root') || document.body
  );
};