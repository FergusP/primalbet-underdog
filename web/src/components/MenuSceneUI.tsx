import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@solana/wallet-adapter-react';

interface MenuSceneUIProps {}

export const MenuSceneUI: React.FC<MenuSceneUIProps> = () => {
  const { connected, publicKey } = useWallet();
  const [walletConnected, setWalletConnected] = useState(connected);
  const [walletAddress, setWalletAddress] = useState(publicKey?.toString() || '');
  const [showEnterButton, setShowEnterButton] = useState(connected);

  // Update state when wallet connection changes
  useEffect(() => {
    setWalletConnected(connected);
    setWalletAddress(publicKey?.toString() || '');
    setShowEnterButton(connected);
  }, [connected, publicKey]);

  const handleConnectWallet = () => {
    window.dispatchEvent(new CustomEvent('connectWallet'));
  };

  const handleEnterArena = () => {
    // Navigate to Colosseum scene
    window.dispatchEvent(new CustomEvent('enterArena'));
  };

  const shortAddress = walletAddress ? 
    `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '';

  return createPortal(
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {/* Text Backdrop */}
      <div 
        className="absolute bg-black/60 rounded-[30px]" 
        style={{
          left: '5%',
          top: '10%',
          width: '90%',
          height: '60%'
        }}
      />

      {/* Crossed Swords Behind Title */}
      <div className="absolute flex items-center justify-center" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)' }}>
        <span 
          className="text-[180px] text-[#8b4513] opacity-30 absolute"
          style={{ 
            transform: 'rotate(-23deg) translateX(-100px)',
            fontFamily: 'system-ui'
          }}
        >
          ⚔️
        </span>
        <span 
          className="text-[180px] text-[#8b4513] opacity-30 absolute"
          style={{ 
            transform: 'rotate(23deg) translateX(100px)',
            fontFamily: 'system-ui'
          }}
        >
          ⚔️
        </span>
      </div>

      {/* Main Title with Glowing Effect */}
      <h1 
        className="absolute font-bold text-center select-none whitespace-nowrap"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(48px, 6vw, 90px)',
          color: '#ffd700',
          WebkitTextStroke: '2px #000000',
          textShadow: '0 0 30px #ffaa00, 0 0 20px #ff6600, 3px 3px 6px #000000',
          animation: 'titlePulse 2s ease-in-out infinite'
        }}
      >
        AURELIUS COLOSSEUM
      </h1>

      {/* Connected Status */}
      {walletConnected && (
        <div 
          className="absolute text-center select-none"
          style={{
            top: '36%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(16px, 1.8vw, 24px)',
            color: '#00ff00',
            fontWeight: 'bold',
            WebkitTextStroke: '0.5px #000000',
            textShadow: '0 0 10px #00ff00, 2px 2px 4px #000000'
          }}
        >
          Connected: {shortAddress}
        </div>
      )}

      {/* Subtitle */}
      {!walletConnected && (
        <h2 
          className="absolute text-center select-none"
          style={{
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(20px, 2.2vw, 32px)',
            color: '#ffffff',
            fontWeight: 'bold',
            WebkitTextStroke: '0.5px #000000',
            textShadow: '0 0 10px #ff6600, 2px 2px 4px #000000'
          }}
        >
          PVGNA • VINCE • DIVITIAS CAPE
        </h2>
      )}

      {/* Translation Text */}
      {!walletConnected && (
        <p 
          className="absolute text-center italic select-none"
          style={{
            top: '38%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(16px, 2vw, 24px)',
            color: '#ffdd00',
            fontWeight: 'bold',
            WebkitTextStroke: '0.5px #000000',
            textShadow: '0 0 8px #ffaa00, 2px 2px 3px #000000'
          }}
        >
          ( Fight • Conquer • Claim Riches )
        </p>
      )}

      {/* Lore Text */}
      <div 
        className="absolute text-center italic select-none"
        style={{
          top: '44%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(18px, 2.2vw, 28px)',
          color: '#ffffff',
          fontWeight: 'bold',
          WebkitTextStroke: '0.5px #000000',
          textShadow: '0 0 20px #ffaa00, 0 0 15px #ff6600, 3px 3px 6px #000000',
          animation: 'loreShimmer 2.5s ease-in-out infinite',
          letterSpacing: '0.5px',
          lineHeight: '1.4',
          width: '90%',
          maxWidth: '800px'
        }}
      >
        <div>"Ave, gladiator! The beasts of the arena await."</div>
        <div style={{ marginTop: '8px' }}>"Only the victorious may challenge the Vault of Sol."</div>
      </div>

      {/* Decorative Elements */}
      <span 
        className="absolute text-[100px] text-[#228b22] select-none"
        style={{ 
          top: '15%', 
          left: 'clamp(50px, 10vw, 150px)',
          transform: 'rotate(-17deg)'
        }}
      >
        🌿
      </span>
      <span 
        className="absolute text-[100px] text-[#228b22] select-none"
        style={{ 
          top: '15%', 
          right: 'clamp(50px, 10vw, 150px)',
          transform: 'rotate(17deg)'
        }}
      >
        🌿
      </span>
      <span 
        className="absolute text-[60px] text-[#cd853f] opacity-40 select-none"
        style={{ 
          top: '50%', 
          left: 'clamp(100px, 15vw, 200px)'
        }}
      >
        🛡️
      </span>
      <span 
        className="absolute text-[60px] text-[#cd853f] opacity-40 select-none"
        style={{ 
          top: '50%', 
          right: 'clamp(100px, 15vw, 200px)'
        }}
      >
        🛡️
      </span>

      {/* Floating Coins */}
      {[0, 1, 2, 3, 4].map((i) => (
        <span 
          key={i} 
          className="absolute text-[40px] text-[#ffd700] opacity-60 select-none"
          style={{
            left: `${15 + (i * 17)}%`,
            top: '75%',
            animation: `coinFloat ${2 + (i * 0.3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`
          }}
        >
          🪙
        </span>
      ))}

      {/* Connect Wallet Button */}
      {!walletConnected && (
        <div 
          className="absolute pointer-events-auto"
          style={{
            top: '60%',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <button 
            onClick={handleConnectWallet}
            className="group relative transition-all duration-200 hover:scale-105"
            style={{
              padding: '20px 60px',
              background: 'linear-gradient(to bottom, #8b7355, #654321)',
              borderRadius: '8px',
              border: '3px solid rgba(74, 60, 42, 0.8)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to bottom, #a08970, #8b7355)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to bottom, #8b7355, #654321)';
            }}
          >
            {/* Top highlight */}
            <div 
              className="absolute top-[3px] left-[10px] right-[10px] h-[2px]"
              style={{ background: 'rgba(218, 165, 32, 0.3)' }}
            />
            <span 
              className="font-bold text-white group-hover:text-[#ffd700] transition-colors duration-200"
              style={{
                fontSize: 'clamp(16px, 2vw, 26px)',
                fontWeight: 'bold',
                WebkitTextStroke: '0.5px #000000',
                textShadow: '0 0 15px #ffd700, 0 0 8px #ffaa00, 2px 2px 4px #000000'
              }}
            >
              CONNECT WALLET
            </span>
          </button>
        </div>
      )}

      {/* Enter Arena Button */}
      {showEnterButton && (
        <div 
          className="absolute pointer-events-auto"
          style={{
            top: '68%',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <button 
            onClick={handleEnterArena}
            className="group relative transition-all duration-200 hover:scale-105"
            style={{
              padding: '24px 80px',
              background: 'linear-gradient(to bottom, #8b4513, #654321)',
              borderRadius: '10px',
              border: '4px solid rgba(139, 0, 0, 0.8)',
              animation: 'enterButtonGlow 1s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to bottom, #a0522d, #8b4513)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to bottom, #8b4513, #654321)';
            }}
          >
            {/* Top highlight */}
            <div 
              className="absolute top-[3px] left-[10px] right-[10px] h-[2px]"
              style={{ background: 'rgba(255, 215, 0, 0.4)' }}
            />
            <span 
              className="font-bold text-white group-hover:scale-105 transition-transform duration-200"
              style={{
                fontSize: 'clamp(18px, 2.2vw, 30px)',
                fontWeight: 'bold',
                WebkitTextStroke: '1px #000000',
                textShadow: '0 0 20px #ff6600, 0 0 10px #ffd700, 3px 3px 5px #000000'
              }}
            >
              ENTER THE ARENA
            </span>
          </button>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes titlePulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
        }
        @keyframes loreShimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes enterButtonGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes coinFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>,
    document.getElementById('game-ui-root') || document.body
  );
};