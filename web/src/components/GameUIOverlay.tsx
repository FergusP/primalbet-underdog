'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { JackpotDisplay } from './GameUI/JackpotDisplay';
import { DynamicFightButton } from './UIComponentLoader';
import { MonsterLabel } from './GameUI/MonsterLabel';

interface GameState {
  jackpot: number;
  monsterName: string;
  monsterPosition?: { x: number; y: number };
}

interface GameUIOverlayProps {
  selectedPaymentMethod?: 'wallet' | 'pda';
  isPaymentOptionsReady?: boolean;
  pdaBalance?: number;
  entryFee?: number;
  isLoading?: boolean;
}

// UI Layer z-indexes as per UI.md
const UILayer = {
  HUD: 100,
  Windows: 500,
  Modals: 1000,
  Notifications: 9999
};

export const GameUIOverlay: React.FC<GameUIOverlayProps> = ({ 
  selectedPaymentMethod = 'wallet', 
  isPaymentOptionsReady = false,
  pdaBalance = 0,
  entryFee = 0.01,
  isLoading = false
}) => {
  const [mounted, setMounted] = useState(false);
  const [isFightButtonDisabled, setIsFightButtonDisabled] = useState(false);
  const [hasReceivedGameState, setHasReceivedGameState] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    jackpot: 0,
    monsterName: 'SKELETON WARRIOR'
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
      setHasReceivedGameState(true);
      
      // Hide loading screen now that we have real data and will render it
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('loadingComplete'));
      }, 50); // Small delay to ensure render completes
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

  if (!mounted || !hasReceivedGameState) return null;

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


      {/* Fight Button - Bottom center */}
      <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto" 
           style={{ bottom: '120px' }}>
        <DynamicFightButton 
          onClick={handleFightClick} 
          disabled={isFightButtonDisabled || !isPaymentOptionsReady}
          isLoading={isLoading || isFightButtonDisabled}
          paymentMethod={selectedPaymentMethod}
          pdaBalance={pdaBalance / 1e9} // Convert lamports to SOL
          entryFee={entryFee / 1e9} // Convert lamports to SOL
        />
      </div>

      {/* Dynamic Labels */}
      {hasReceivedGameState && gameState.monsterPosition && (
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