'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { JackpotDisplay } from './GameUI/JackpotDisplay';
import { HistoryPanel } from './GameUI/HistoryPanel';
import { StatsPanel } from './GameUI/StatsPanel';
import { FightButton } from './GameUI/FightButton';
import { MonsterLabel } from './GameUI/MonsterLabel';

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

interface GameUIOverlayProps {
  selectedPaymentMethod?: 'wallet' | 'pda';
  isPaymentOptionsReady?: boolean;
}

// UI Layer z-indexes as per UI.md
const UILayer = {
  HUD: 100,
  Windows: 500,
  Modals: 1000,
  Notifications: 9999
};

export const GameUIOverlay: React.FC<GameUIOverlayProps> = ({ selectedPaymentMethod = 'wallet', isPaymentOptionsReady = false }) => {
  const [mounted, setMounted] = useState(false);
  const [isFightButtonDisabled, setIsFightButtonDisabled] = useState(false);
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
      console.log('GameUIOverlay received gameState:', event.detail);
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

  // Listen for combat state events
  useEffect(() => {
    const handleCombatStarting = () => {
      setIsFightButtonDisabled(true);
    };

    const handleCombatComplete = () => {
      setIsFightButtonDisabled(false);
    };

    window.addEventListener('combatStarting', handleCombatStarting);
    window.addEventListener('combatStarted', handleCombatComplete);
    window.addEventListener('combatError', handleCombatComplete);
    window.addEventListener('combatComplete', handleCombatComplete);

    return () => {
      window.removeEventListener('combatStarting', handleCombatStarting);
      window.removeEventListener('combatStarted', handleCombatComplete);
      window.removeEventListener('combatError', handleCombatComplete);
      window.removeEventListener('combatComplete', handleCombatComplete);
    };
  }, []);

  const handleFightClick = () => {
    // Include payment method in the event
    window.dispatchEvent(new CustomEvent('fightButtonClicked', {
      detail: {
        paymentMethod: selectedPaymentMethod
      }
    }));
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
        <FightButton 
          onClick={handleFightClick} 
          disabled={isFightButtonDisabled || !isPaymentOptionsReady}
        />
      </div>

      {/* Dynamic Labels */}
      {gameState.monsterPosition && (
        <MonsterLabel 
          name={gameState.monsterName} 
          position={gameState.monsterPosition} 
        />
      )}
      
      
    </div>
  );

  // Use portal to render at document body level for proper layering
  return typeof window !== 'undefined' && document.body
    ? createPortal(uiContent, document.body)
    : uiContent;
};