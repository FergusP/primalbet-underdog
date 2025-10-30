'use client';

import { useState, useEffect } from 'react';
import { ForestDesignSystem as FDS } from '@/ui/styles/forestDesignSystem';

export default function ViewerTestPage() {
  const [wallet, setWallet] = useState('');
  const [backendStatus, setBackendStatus] = useState('Connecting...');
  const [backendColor, setBackendColor] = useState('#ffd700');
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Use environment variable for API URL
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

  const packages = [
    {
      id: '69008ee1eb39e74d32d2fb08',
      name: 'Health Potion',
      icon: '🧪',
      description: 'Restores 20 HP to the player. Perfect for clutch moments!',
      cost: '50 Arena Coins',
      effect: '+20 HP',
      type: 'health',
    },
    {
      id: '69008f47eb39e74d32d2fce8',
      name: 'Damage Boost',
      icon: '🔥',
      description:
        'Doubles player damage output for 10 seconds. Help crush the monster!',
      cost: '50 Arena Coins',
      effect: '2x DMG',
      type: 'damage',
    },
    {
      id: '69008fb8eb39e74d32d2fd14',
      name: 'Monster Heal',
      icon: '💚',
      description: 'Heals the monster for 50 HP. Troll mode activated! 😈',
      cost: '25 Arena Coins',
      effect: '+50 HP (Monster)',
      type: 'monster',
    },
    {
      id: '69031e9be15317b2fd1c05cc',
      name: 'Blackout Curse',
      icon: '💀',
      description: 'Plunge the player into darkness for 3 seconds! Can they fight blind?',
      cost: '100 Arena Coins',
      effect: '3s Blackout',
      type: 'screen',
    },
    {
      id: '69031ec8e15317b2fd1c05dd',
      name: 'Drunk Vision',
      icon: '🍺',
      description: 'Distort the player\'s vision with a drunken haze for 3 seconds!',
      cost: '100 Arena Coins',
      effect: 'Blur + Sway',
      type: 'screen',
    },
    {
      id: '69031ef6e15317b2fd1c05ef',
      name: 'Strobe Flash',
      icon: '⚡',
      description: 'Blind them with rapid flashes for 3 seconds! Warning: Very disorienting!',
      cost: '100 Arena Coins',
      effect: '3s Flash',
      type: 'screen',
    },
  ];

  const checkBackend = async () => {
    if (!BACKEND_URL) {
      setBackendStatus('Config Error ❌');
      setBackendColor('#ff0000');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (response.ok) {
        setBackendStatus('Connected ✅');
        setBackendColor('#00ff00');
      } else {
        setBackendStatus('Error ❌');
        setBackendColor('#ff0000');
      }
    } catch (error) {
      setBackendStatus('Offline ❌');
      setBackendColor('#ff0000');
    }
  };

  const showFeedback = (message: string, type: string) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const sendPackage = async (packageId: string, packageName: string) => {
    if (!wallet.trim()) {
      showFeedback('⚠️ Please enter a player wallet address first!', 'error');
      return;
    }

    if (!BACKEND_URL) {
      showFeedback('⚠️ Backend URL not configured!', 'error');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/viewer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerWallet: wallet,
          packageId,
          packageName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showFeedback(`✅ ${packageName} sent to player!`, 'success');
      } else {
        showFeedback(`❌ Failed: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error: any) {
      showFeedback(`❌ Network error: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  // Override body overflow for viewer page
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    return () => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };
  }, []);

  const displayWallet = wallet
    ? `${wallet.slice(0, 8)}...${wallet.slice(-8)}`
    : 'Not set';

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#3E2723] to-[#0B3D0B] text-white px-12 py-6 md:px-24 md:py-8 lg:px-40 lg:py-8 xl:px-56 xl:py-10' style={{
      fontFamily: FDS.typography.body
    }}>
      <div className='max-w-6xl mx-auto pb-6'>
        <h1 className='text-3xl md:text-5xl xl:text-6xl font-black text-center mb-5 xl:mb-7' style={{
          fontFamily: FDS.typography.display,
          fontWeight: FDS.typography.weights.black,
          letterSpacing: FDS.typography.letterSpacing.wider,
          background: `linear-gradient(135deg, ${FDS.colors.goldShine} 0%, ${FDS.colors.goldDeep} 30%, ${FDS.colors.goldAntique} 60%, ${FDS.colors.goldShine} 100%)`,
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: `drop-shadow(0 0 20px ${FDS.colors.goldShine}80) drop-shadow(4px 8px 16px rgba(0,0,0,0.8))`,
          animation: 'goldShimmer 3s linear infinite'
        }}>
          🎮 ARENA VIEWER INTERFACE
        </h1>

        <div className='border-[3px] rounded-lg p-4 md:p-6 xl:p-7 mb-5 xl:mb-7' style={{
          backgroundColor: `${FDS.colors.darkBark}33`,
          borderColor: FDS.colors.goldAntique,
          boxShadow: `0 0 20px ${FDS.colors.goldShine}40, ${FDS.shadows.deep}`
        }}>
          <h3 className='mb-4 xl:mb-5 text-xl md:text-2xl xl:text-3xl font-bold' style={{
            fontFamily: FDS.typography.display,
            color: FDS.colors.goldShine,
            textShadow: FDS.shadows.glow,
            letterSpacing: FDS.typography.letterSpacing.wide
          }}>ARENA STATUS</h3>
          <div className='flex flex-col sm:flex-row sm:justify-between gap-2 mb-3'>
            <span className='text-base md:text-lg xl:text-xl' style={{
              color: FDS.colors.emeraldGlow,
              fontFamily: FDS.typography.inscription,
              fontStyle: 'italic'
            }}>Backend:</span>
            <span className='font-bold text-base md:text-lg xl:text-xl' style={{ color: backendColor }}>
              {backendStatus}
            </span>
          </div>
          <div className='flex flex-col sm:flex-row sm:justify-between gap-2'>
            <span className='text-base md:text-lg xl:text-xl' style={{
              color: FDS.colors.emeraldGlow,
              fontFamily: FDS.typography.inscription,
              fontStyle: 'italic'
            }}>Player Wallet:</span>
            <span className='font-bold text-base md:text-lg xl:text-xl break-all' style={{ color: FDS.colors.goldShine }}>{displayWallet}</span>
          </div>
        </div>

        <input
          type='text'
          className='w-full p-4 xl:p-5 rounded-lg text-base md:text-lg xl:text-xl mb-5 xl:mb-7 focus:outline-none'
          style={{
            backgroundColor: `${FDS.colors.darkBark}40`,
            border: `3px solid ${FDS.colors.goldAntique}`,
            color: FDS.colors.goldShine,
            fontFamily: FDS.typography.inscription,
            boxShadow: `inset 0 2px 8px rgba(0,0,0,0.4), 0 0 10px ${FDS.colors.goldShine}30`
          }}
          placeholder='Enter player wallet address...'
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          onFocus={(e) => {
            e.target.style.borderColor = FDS.colors.goldShine;
            e.target.style.boxShadow = `inset 0 2px 8px rgba(0,0,0,0.4), 0 0 20px ${FDS.colors.goldShine}60, ${FDS.shadows.glow}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = FDS.colors.goldAntique;
            e.target.style.boxShadow = `inset 0 2px 8px rgba(0,0,0,0.4), 0 0 10px ${FDS.colors.goldShine}30`;
          }}
        />

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4 xl:gap-5'>
          {packages.map((pkg) => {
            // Determine border color based on package type
            const borderColor = pkg.type === 'health' ? FDS.colors.emeraldGlow
              : pkg.type === 'damage' ? FDS.colors.crimsonFire
              : pkg.type === 'monster' ? FDS.colors.goldShine
              : FDS.colors.goldAntique; // screen type

            const hoverGlow = pkg.type === 'health' ? FDS.colors.emeraldGlow
              : pkg.type === 'damage' ? FDS.colors.crimsonFire
              : pkg.type === 'monster' ? FDS.colors.goldShine
              : FDS.colors.goldAntique;

            return (
              <div
                key={pkg.id}
                className='cursor-pointer transition-all hover:-translate-y-2 active:scale-98 flex flex-col rounded-lg p-4 md:p-5 xl:p-6'
                style={{
                  backgroundColor: `${FDS.colors.darkBark}30`,
                  border: `3px solid ${borderColor}`,
                  boxShadow: `0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
                  fontFamily: FDS.typography.body,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => sendPackage(pkg.id, pkg.name)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 30px ${hoverGlow}60, 0 8px 24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)`;
                  e.currentTarget.style.borderColor = hoverGlow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`;
                  e.currentTarget.style.borderColor = borderColor;
                }}
              >
                <div className='flex items-center gap-3 mb-4'>
                  <div className='text-4xl md:text-5xl xl:text-6xl' style={{
                    filter: `drop-shadow(0 0 10px ${borderColor}80)`
                  }}>{pkg.icon}</div>
                  <div className='text-xl md:text-2xl xl:text-3xl font-bold leading-tight' style={{
                    fontFamily: FDS.typography.display,
                    color: FDS.colors.goldShine,
                    textShadow: FDS.shadows.inscription,
                    letterSpacing: FDS.typography.letterSpacing.wide
                  }}>{pkg.name}</div>
                </div>
                <div className='mb-4 text-sm md:text-base xl:text-lg leading-relaxed flex-grow' style={{
                  color: FDS.colors.moonSilver,
                  fontFamily: FDS.typography.inscription,
                  fontStyle: 'italic'
                }}>
                  {pkg.description}
                </div>
                <div className='flex justify-between items-center flex-wrap gap-2 pt-3' style={{
                  borderTop: `2px solid ${borderColor}40`
                }}>
                  <div className='font-bold text-sm md:text-base xl:text-lg' style={{
                    color: FDS.colors.goldShine,
                    textShadow: FDS.shadows.glow
                  }}>{pkg.cost}</div>
                  <div className='text-xs md:text-sm xl:text-base font-medium' style={{
                    color: borderColor
                  }}>{pkg.effect}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {feedback.message && (
        <div
          className='fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 px-5 py-3 md:px-6 md:py-4 rounded-lg sm:max-w-sm transition-all text-sm md:text-base xl:text-lg font-bold'
          style={{
            backgroundColor: feedback.type === 'error'
              ? `${FDS.colors.crimsonFire}E6`
              : feedback.type === 'success'
              ? `${FDS.colors.emeraldGlow}E6`
              : `${FDS.colors.goldShine}E6`,
            color: feedback.type === 'success' || feedback.type === 'error' ? 'white' : FDS.colors.darkBark,
            border: `3px solid ${feedback.type === 'error' ? FDS.colors.bloodRed : feedback.type === 'success' ? FDS.colors.forestGreen : FDS.colors.goldAntique}`,
            boxShadow: `0 0 30px ${feedback.type === 'error' ? FDS.colors.crimsonFire : feedback.type === 'success' ? FDS.colors.emeraldGlow : FDS.colors.goldShine}80, ${FDS.shadows.deep}`,
            fontFamily: FDS.typography.display,
            letterSpacing: FDS.typography.letterSpacing.wide,
            textShadow: feedback.type === 'success' || feedback.type === 'error' ? FDS.shadows.inscription : 'none'
          }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
