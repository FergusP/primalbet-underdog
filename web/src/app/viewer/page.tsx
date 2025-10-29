'use client';

import { useState, useEffect } from 'react';

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
      description: 'Doubles player damage output for 10 seconds. Help crush the monster!',
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

  const displayWallet = wallet
    ? `${wallet.slice(0, 8)}...${wallet.slice(-8)}`
    : 'Not set';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-5">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,217,255,0.5)]">
          🎮 Arena Viewer Test Interface
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Simulate viewer package purchases
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-5">
          <h3 className="mb-4 text-lg font-semibold">Arena Status</h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Backend:</span>
            <span className="font-bold" style={{ color: backendColor }}>
              {backendStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Player Wallet:</span>
            <span className="font-bold text-cyan-400">{displayWallet}</span>
          </div>
        </div>

        <input
          type="text"
          className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white mb-5 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          placeholder="Enter player wallet address to test with..."
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />

        <div className="space-y-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`
                bg-white/5 border-2 rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95
                ${
                  pkg.type === 'health'
                    ? 'border-green-500/30 hover:bg-green-500/10 hover:border-green-500/60'
                    : pkg.type === 'damage'
                    ? 'border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/60'
                    : 'border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/60'
                }
              `}
              onClick={() => sendPackage(pkg.id, pkg.name)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{pkg.icon}</div>
                <div className="text-xl font-bold">{pkg.name}</div>
              </div>
              <div className="text-gray-400 mb-2 text-sm">{pkg.description}</div>
              <div className="flex justify-between items-center">
                <div className="text-yellow-400 font-bold">{pkg.cost}</div>
                <div className="text-gray-400 text-xs">{pkg.effect}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {feedback.message && (
        <div
          className={`
            fixed bottom-5 right-5 px-5 py-4 rounded-lg font-bold shadow-xl max-w-xs transition-all
            ${
              feedback.type === 'error'
                ? 'bg-red-500/90 text-white'
                : feedback.type === 'success'
                ? 'bg-green-500/90 text-black'
                : 'bg-cyan-400/90 text-black'
            }
          `}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
