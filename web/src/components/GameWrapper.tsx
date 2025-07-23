'use client';

// Game Wrapper - React component that integrates Phaser with wallet
import React, { useEffect, useRef, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { GameService } from '../services/GameService';
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletReconnect } from './WalletReconnect';
import { GameUIOverlay } from './GameUIOverlay';
import { MenuSceneUI } from './MenuSceneUI';
import { CombatSceneUI } from './CombatSceneUI';
import { VaultSceneUI } from './VaultSceneUI';

interface Props {
  className?: string;
}

export const GameWrapper: React.FC<Props> = ({ className }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any | null>(null);
  const [isGameReady, setIsGameReady] = useState(false);
  const [currentScene, setCurrentScene] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  const { 
    publicKey, 
    connected, 
    disconnect, 
    sendTransaction,
    wallet
  } = useWallet();
  
  const { connection } = useConnection();

  // Initialize Phaser game - client-side only
  useEffect(() => {
    if (!gameRef.current || typeof window === 'undefined') return;
    
    // Prevent multiple initializations
    if (gameInstanceRef.current) return;

    let isCancelled = false;

    const initGame = async () => {
      try {
        const { AureliusGame } = await import('../game/Game');
        
        // Double-check we haven't been cancelled and no game exists
        if (isCancelled || gameInstanceRef.current) return;
        
        const gameInstance = new AureliusGame();
        gameInstance.init('game-container');
        
        if (!isCancelled) {
          gameInstanceRef.current = gameInstance;
          setIsGameReady(true);
        } else {
          // Clean up if cancelled during async operation
          gameInstance.destroy();
        }
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    initGame();

    return () => {
      isCancelled = true;
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
        setIsGameReady(false);
      }
    };
  }, []);

  // Handle wallet connection events
  useEffect(() => {
    if (connected && publicKey) {
      // Notify Phaser game about wallet connection
      window.dispatchEvent(new CustomEvent('walletConnected', {
        detail: { 
          address: publicKey.toString(),
          wallet: wallet?.adapter.name 
        }
      }));
    } else {
      // Notify about disconnection
      window.dispatchEvent(new CustomEvent('walletDisconnected'));
    }
  }, [connected, publicKey, wallet]);

  // Check backend connectivity
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const isHealthy = await GameService.checkBackendHealth();
        setBackendStatus(isHealthy ? 'connected' : 'error');
      } catch (error) {
        setBackendStatus('error');
      }
    };

    checkBackend();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  // Set up combat transaction handling
  useEffect(() => {
    if (!connected || !publicKey) return;

    const handleStartCombat = async (event: CustomEvent) => {
      try {
        const { entryFee, combatId, monster } = event.detail;
        
        // Create payment transaction
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: publicKey, // Placeholder - should be colosseum PDA
            lamports: entryFee,
          })
        );

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Send transaction
        const signature = await sendTransaction(transaction, connection);
        
        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');

        // Notify game that combat can proceed
        window.dispatchEvent(new CustomEvent('combatComplete', {
          detail: { 
            txSignature: signature,
            combatId: combatId 
          }
        }));

      } catch (error) {
        console.error('Combat transaction failed:', error);
        
        // Show error to user (could be improved with toast/modal)
        alert('Transaction failed: ' + (error as Error).message);
      }
    };

    window.addEventListener('startCombat', handleStartCombat as unknown as EventListener);
    
    return () => {
      window.removeEventListener('startCombat', handleStartCombat as unknown as EventListener);
    };
  }, [connected, publicKey, connection, sendTransaction]);

  // Handle wallet connection from Phaser
  useEffect(() => {
    const handleConnectWallet = () => {
      // The wallet modal will be triggered by the button click
      const button = document.querySelector('.wallet-adapter-button') as HTMLButtonElement;
      button?.click();
    };

    window.addEventListener('connectWallet', handleConnectWallet);
    
    return () => {
      window.removeEventListener('connectWallet', handleConnectWallet);
    };
  }, []);

  // Listen for scene changes
  useEffect(() => {
    const handleSceneChange = (event: CustomEvent) => {
      console.log('Scene changed to:', event.detail.sceneName);
      setCurrentScene(event.detail.sceneName);
    };

    window.addEventListener('sceneChanged', handleSceneChange as EventListener);
    
    return () => {
      window.removeEventListener('sceneChanged', handleSceneChange as EventListener);
    };
  }, []);

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'Online';
      case 'error': return 'Offline';
      default: return 'Connecting...';
    }
  };

  return (
    <div className={`relative w-full h-screen bg-gray-900 ${className || ''}`}>
      {/* Wallet reconnection helper */}
      <WalletReconnect />
      
      {/* Header with wallet button and status */}
      <div className="absolute top-4 right-4 flex items-center gap-4" style={{ zIndex: 9999 }}>
        {/* Backend status */}
        <div className="flex items-center gap-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${
            backendStatus === 'connected' ? 'bg-green-500' : 
            backendStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Wallet connection */}
        <WalletMultiButton className="!bg-red-600 hover:!bg-red-700 !text-white !font-bold !px-4 !py-2 !rounded-lg transition-colors" />
        
        {/* Manual reconnect for development */}
        {!connected && wallet && (
          <button
            onClick={async () => {
              try {
                await wallet.adapter.connect();
              } catch (err) {
                console.error('Manual reconnect failed:', err);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            Reconnect
          </button>
        )}
      </div>

      {/* Game container */}
      <div 
        id="game-container" 
        ref={gameRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* UI Overlays - Scene-specific rendering */}
      {isGameReady && currentScene === 'MenuScene' && <MenuSceneUI />}
      {isGameReady && currentScene === 'ColosseumScene' && <GameUIOverlay />}
      {isGameReady && currentScene === 'CombatScene' && <CombatSceneUI />}
      {isGameReady && currentScene === 'VaultScene' && <VaultSceneUI />}
      
      {/* Debug: Show current scene */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm" style={{ zIndex: 9999 }}>
          Current Scene: {currentScene || 'None'}
        </div>
      )}

      {/* Loading overlay */}
      {!isGameReady && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">🏛️ AURELIUS COLOSSEUM 🏛️</h2>
            <p className="text-gray-400">Loading the arena...</p>
          </div>
        </div>
      )}

      {/* Offline overlay */}
      {backendStatus === 'error' && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20">
          <div className="text-center bg-gray-800 p-8 rounded-lg">
            <h3 className="text-xl font-bold text-red-500 mb-4">⚠️ CONNECTION LOST</h3>
            <p className="text-gray-300 mb-4">
              Unable to connect to the game server.<br />
              Please check your internet connection and try again.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};