import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { ForestDesignSystem } from '../../styles/forestDesignSystem';

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
              radial-gradient(circle at 20% 30%, rgba(80, 200, 120, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(74, 93, 35, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 60%)
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
              background: i % 2 === 0 ? ForestDesignSystem.colors.goldShine : ForestDesignSystem.colors.emeraldGlow,
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
          {/* Main Title */}
          <h1 
            className="relative text-center select-none"
            style={{
              fontFamily: ForestDesignSystem.typography.display,
              fontSize: 'clamp(48px, 8vw, 120px)',
              fontWeight: 900,
              letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
              lineHeight: 1,
              background: `linear-gradient(
                135deg,
                ${ForestDesignSystem.colors.goldShine} 0%,
                ${ForestDesignSystem.colors.goldDeep} 35%,
                ${ForestDesignSystem.colors.goldAntique} 65%,
                ${ForestDesignSystem.colors.goldShine} 100%
              )`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(${ForestDesignSystem.shadows.deep}) drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))`,
              textShadow: ForestDesignSystem.shadows.glow,
            }}
          >
            PRIMALBET
          </h1>

          {/* Subtitle */}
          <div 
            className="text-center mt-4"
            style={{
              fontFamily: ForestDesignSystem.typography.body,
              fontSize: 'clamp(16px, 2vw, 24px)',
              color: ForestDesignSystem.colors.emeraldGlow,
              fontStyle: 'italic',
              letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
              textShadow: `2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(80, 200, 120, 0.3)`,
            }}
          >
            HUNT • FIGHT • CLAIM THE FOMO POOL
          </div>
        </div>

        {/* Button Placeholder - Takes up space for Phaser button */}
        <div 
          id="menu-button-placeholder"
          className="relative"
          style={{
            height: '80px', // Reserve space for the button
            width: '100%',
            marginTop: '60px', // Shift button down
            marginBottom: '20px',
          }}
        />

        {/* Lore Text */}
        <div 
          className="mt-12 text-center max-w-3xl px-8 animate-fade-in"
          style={{
            animationDelay: '0.5s',
            opacity: 0,
            animationFillMode: 'forwards',
          }}
        >
          <p 
            style={{
              fontFamily: ForestDesignSystem.typography.inscription,
              fontSize: 'clamp(14px, 1.5vw, 18px)',
              fontStyle: 'italic',
              color: ForestDesignSystem.colors.moonSilver,
              lineHeight: 1.4,
              textShadow: ForestDesignSystem.shadows.inscription,
              margin: 0,
            }}
          >
            "In the dark depths of the haunted forest, only the bravest warriors
            <br />
            may claim the Beast's treasure."
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