'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { JackpotDisplay } from './GameUI/JackpotDisplay';
import { HistoryPanel } from './GameUI/HistoryPanel';
import { StatsPanel } from './GameUI/StatsPanel';
import { FightButton } from './GameUI/FightButton';
import { MonsterLabel } from './GameUI/MonsterLabel';
import { getAllMonsterKeys, getMonsterDisplayName } from '../data/monsters';

interface GameState {
  jackpot: number;
  monsterName: string;
  monsterPosition?: { x: number; y: number };
  recentCombats: Array<{
    gladiator: string;
    monster: string;
    victory: boolean;
    vaultCracked?: boolean;
    vaultAttempted?: boolean;
  }>;
  playerStats: {
    combats: number;
    victories: number;
    vaultsCracked: number;
    totalWinnings: number;
  };
}

// UI Layer z-indexes as per UI.md
const UILayer = {
  HUD: 100,
  Windows: 500,
  Modals: 1000,
  Notifications: 9999
};

export const GameUIOverlay: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [devMode, setDevMode] = useState(false); // Dev mode toggle
  const [selectedMonster, setSelectedMonster] = useState('SKELETON_WARRIOR');
  const [gameState, setGameState] = useState<GameState>({
    jackpot: 0,
    monsterName: 'SKELETON WARRIOR',
    recentCombats: [],
    playerStats: {
      combats: 0,
      victories: 0,
      vaultsCracked: 0,
      totalWinnings: 0
    }
  });

  // Ensure client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Listen for game state updates from Phaser
    const handleGameStateUpdate = (event: CustomEvent) => {
      setGameState(prev => ({ ...prev, ...event.detail }));
    };

    const handleMonsterPosition = (event: CustomEvent) => {
      setGameState(prev => ({ 
        ...prev, 
        monsterPosition: event.detail 
      }));
    };


    window.addEventListener('gameStateUpdate', handleGameStateUpdate as EventListener);
    window.addEventListener('monsterPositionUpdate', handleMonsterPosition as EventListener);

    return () => {
      window.removeEventListener('gameStateUpdate', handleGameStateUpdate as EventListener);
      window.removeEventListener('monsterPositionUpdate', handleMonsterPosition as EventListener);
    };
  }, []);

  const handleFightClick = () => {
    window.dispatchEvent(new CustomEvent('fightButtonClicked'));
  };

  if (!mounted) return null;

  const uiContent = (
    <div
      id="game-ui-root"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: UILayer.HUD }}
    >
      {/* Title */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <h1 className="text-xl text-white" 
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          AURELIUS COLOSSEUM
        </h1>
      </div>

      {/* Jackpot Display - Center top */}
      <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto" 
           style={{ top: '80px' }}>
        <JackpotDisplay amount={gameState.jackpot} />
      </div>

      {/* Right Sidebar - Fixed right position */}
      <div className="absolute pointer-events-auto" 
           style={{ right: '20px', top: '180px' }}>
        <div className="space-y-4">
          <HistoryPanel combats={gameState.recentCombats} />
          <StatsPanel stats={gameState.playerStats} />
        </div>
      </div>

      {/* Fight Button - Bottom center */}
      <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto" 
           style={{ bottom: '120px' }}>
        <FightButton onClick={handleFightClick} />
      </div>

      {/* Dynamic Labels */}
      {gameState.monsterPosition && (
        <MonsterLabel 
          name={gameState.monsterName} 
          position={gameState.monsterPosition} 
        />
      )}
      
      {/* Dev Mode Panel */}
      <div className="absolute left-4 top-40 pointer-events-auto">
        <div className="bg-purple-900/80 p-4 rounded-lg border border-purple-400 space-y-3">
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={devMode}
              onChange={(e) => setDevMode(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="font-mono">DEV MODE</span>
          </label>
          
          {devMode && (
            <div className="space-y-2">
              <div className="text-purple-200 text-xs font-mono">SELECT MONSTER:</div>
              <select
                value={selectedMonster}
                onChange={(e) => {
                  setSelectedMonster(e.target.value);
                  // Emit event to update monster
                  window.dispatchEvent(new CustomEvent('devMonsterSelect', { 
                    detail: { monster: e.target.value } 
                  }));
                }}
                className="bg-purple-800 text-white border border-purple-600 rounded px-2 py-1 text-sm w-full"
              >
                {getAllMonsterKeys().map(key => (
                  <option key={key} value={key}>
                    {getMonsterDisplayName(key)}
                  </option>
                ))}
              </select>
              <div className="text-purple-300 text-xs">
                Entry Fee: 0.01 SOL
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );

  // Use portal to render at document body level for proper layering
  return typeof window !== 'undefined' && document.body
    ? createPortal(uiContent, document.body)
    : uiContent;
};