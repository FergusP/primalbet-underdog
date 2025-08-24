'use client';

// Game Wrapper - React component that integrates Phaser with wallet
import React, { useEffect, useRef, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { GameService } from '../../../services/GameService';
import {
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
import { WalletReconnect } from '../wallet/WalletReconnect';
import { ClientWalletButton } from '../wallet/ClientWalletButton';
import { GameUIOverlay } from '../scenes/GameUIOverlay';
import { IntegratedPaymentUI } from '../wallet/IntegratedPaymentUI';
import { PDADepositModal } from '../wallet/PDADepositModal';
import { PDAWithdrawModal } from '../wallet/PDAWithdrawModal';
// Import UI components
import { MenuSceneUI } from '../scenes/MenuSceneUI';
import { CombatSceneUI } from '../scenes/CombatSceneUI';
import { VaultSceneUI } from '../scenes/VaultSceneUI';
import { LoadingScreen } from './LoadingScreen';
import type { PaymentOptions } from '../../../types';

interface Props {
  className?: string;
}

export const GameWrapper: React.FC<Props> = ({ className }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any | null>(null);
  const [isGameReady, setIsGameReady] = useState(false);
  const [currentScene, setCurrentScene] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<
    'connecting' | 'connected' | 'error'
  >('connecting');
  const [mounted, setMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<{
    message: string;
    canRetry: boolean;
  } | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(false);

  // Payment UI states - only for LobbyScene
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(
    null
  );
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'wallet' | 'pda'
  >('wallet');
  const [isCombatProcessing, setIsCombatProcessing] = useState(false);

  const { publicKey, connected, disconnect, sendTransaction, wallet } =
    useWallet();

  const { connection } = useConnection();

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Phaser game - client-side only
  useEffect(() => {
    if (!gameRef.current || typeof window === 'undefined') return;

    // Prevent multiple initializations
    if (gameInstanceRef.current) return;

    let isCancelled = false;

    const initGame = async () => {
      try {
        const { PrimalBetGame } = await import('../../../game/Game');

        // Double-check we haven't been cancelled and no game exists
        if (isCancelled || gameInstanceRef.current) return;

        const gameInstance = new PrimalBetGame();
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
      // Store wallet address for vault attempts
      window.localStorage.setItem('walletAddress', publicKey.toString());

      // Small delay to ensure game is ready to receive the event
      const timeoutId = setTimeout(() => {
        // Notify Phaser game about wallet connection
        window.dispatchEvent(
          new CustomEvent('walletConnected', {
            detail: {
              address: publicKey.toString(),
              wallet: wallet?.adapter.name,
            },
          })
        );
      }, 100);

      return () => clearTimeout(timeoutId);
    } else {
      // Clear wallet address on disconnect
      window.localStorage.removeItem('walletAddress');

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

  // Fetch payment options when wallet connects and we're in LobbyScene
  useEffect(() => {
    const fetchPaymentOptions = async () => {
      if (!publicKey || !connected || currentScene !== 'LobbyScene') {
        setPaymentOptions(null);
        return;
      }

      try {
        const options = await GameService.getPaymentOptions(
          publicKey.toString()
        );
        setPaymentOptions(options);

        // Check localStorage first for last used payment method
        const savedPaymentMethod = localStorage.getItem('lastPaymentMethod');

        // Always respect the user's saved preference if it exists
        if (savedPaymentMethod === 'pda') {
          setSelectedPaymentMethod('pda');
        } else if (savedPaymentMethod === 'wallet') {
          setSelectedPaymentMethod('wallet');
        } else if (options.lastPaymentMethod === 'pda' && options.canUsePDA) {
          // Fall back to backend's last method only if no saved preference
          setSelectedPaymentMethod('pda');
        } else {
          setSelectedPaymentMethod('wallet');
        }
      } catch (error) {
        console.error('Failed to fetch payment options:', error);
      }
    };

    fetchPaymentOptions();
  }, [publicKey, connected, currentScene]);

  const handleBalanceUpdate = () => {
    // Refresh payment options after deposit/withdraw
    if (publicKey && connected && currentScene === 'LobbyScene') {
      GameService.getPaymentOptions(publicKey.toString())
        .then(setPaymentOptions)
        .catch(console.error);
    }
  };

  // Set up combat transaction handling
  useEffect(() => {
    if (!connected || !publicKey) return;

    const handleStartCombat = async (event: CustomEvent) => {
      // Set loading state
      setIsCombatProcessing(true);
      // Dispatch combat starting event to disable button
      window.dispatchEvent(new CustomEvent('combatStarting'));

      try {
        const { paymentMethod } = event.detail;

        if (paymentMethod === 'pda') {
          // For PDA payment, use the gasless endpoint
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
            }/combat/enter-gasless`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                playerWallet: publicKey.toString(),
              }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to enter combat');
          }

          const result = await response.json();

          // Generate and store combat ID
          const combatId = `combat_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          window.localStorage.setItem('currentCombatId', combatId);

          // Save payment method to localStorage
          localStorage.setItem('lastPaymentMethod', 'pda');

          // Notify game that combat can proceed
          window.dispatchEvent(
            new CustomEvent('combatStarted', {
              detail: {
                txSignature: result.txSignature,
                combatId: combatId,
                paymentMethod: 'pda',
              },
            })
          );
        } else {
          // For wallet payment, build transaction directly
          const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);

          // Derive PDAs
          const [gameStatePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('game_state')],
            programId
          );
          const [potVaultPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('pot_vault')],
            programId
          );
          const [playerPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('player'), publicKey.toBuffer()],
            programId
          );

          // Treasury address from backend
          const treasuryPubkey = new PublicKey(
            'EsRy4vmaHbnj3kfj2X9rpRRgbKcA6a9DtdXrBddnNoVi'
          );

          // Build enter_combat instruction
          const discriminator = Buffer.from([
            206, 145, 23, 55, 61, 45, 122, 210,
          ]); // enter_combat

          const instruction = new TransactionInstruction({
            programId,
            keys: [
              { pubkey: playerPDA, isSigner: false, isWritable: true },
              { pubkey: gameStatePDA, isSigner: false, isWritable: true },
              { pubkey: potVaultPDA, isSigner: false, isWritable: true },
              { pubkey: publicKey, isSigner: true, isWritable: true },
              { pubkey: treasuryPubkey, isSigner: false, isWritable: true },
              {
                pubkey: SystemProgram.programId,
                isSigner: false,
                isWritable: false,
              },
            ],
            data: discriminator,
          });

          // Create and send transaction
          const transaction = new Transaction().add(instruction);
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;

          // Send transaction - user will see wallet popup
          const signature = await sendTransaction(transaction, connection);

          // Wait for confirmation
          await connection.confirmTransaction(signature, 'confirmed');

          // Generate and store combat ID
          const combatId = `combat_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          window.localStorage.setItem('currentCombatId', combatId);

          // Save payment method to localStorage
          localStorage.setItem('lastPaymentMethod', 'wallet');

          // Notify game that combat can proceed
          window.dispatchEvent(
            new CustomEvent('combatStarted', {
              detail: {
                txSignature: signature,
                combatId: combatId,
                paymentMethod: 'wallet',
              },
            })
          );
        }
      } catch (error) {
        console.error('Combat transaction failed:', error);

        // Clear loading state
        setIsCombatProcessing(false);

        // Show error to user
        window.dispatchEvent(
          new CustomEvent('combatError', {
            detail: {
              error: (error as Error).message,
              paymentMethod: event.detail.paymentMethod,
            },
          })
        );
      }
    };

    // Listen for fight button click from the UI overlay
    const handleFightButtonClick = async (event: CustomEvent) => {
      const { paymentMethod } = event.detail;

      // Dispatch start combat event with payment method
      window.dispatchEvent(
        new CustomEvent('startCombat', {
          detail: { paymentMethod },
        })
      );
    };

    window.addEventListener(
      'startCombat',
      handleStartCombat as unknown as EventListener
    );
    window.addEventListener(
      'fightButtonClicked',
      handleFightButtonClick as unknown as EventListener
    );

    return () => {
      window.removeEventListener(
        'startCombat',
        handleStartCombat as unknown as EventListener
      );
      window.removeEventListener(
        'fightButtonClicked',
        handleFightButtonClick as unknown as EventListener
      );
    };
  }, [connected, publicKey, connection, sendTransaction]);

  // Handle wallet connection from Phaser
  useEffect(() => {
    const handleConnectWallet = () => {
      // The wallet modal will be triggered by the button click
      const button = document.querySelector(
        '.wallet-adapter-button'
      ) as HTMLButtonElement;
      button?.click();
    };

    window.addEventListener('connectWallet', handleConnectWallet);

    return () => {
      window.removeEventListener('connectWallet', handleConnectWallet);
    };
  }, []);

  // Refresh payment options when combat starts (after successful payment)
  useEffect(() => {
    const handleCombatStarted = () => {
      // Clear loading state
      setIsCombatProcessing(false);

      // Small delay to ensure payment has been processed
      setTimeout(() => {
        handleBalanceUpdate();
      }, 1000);
    };

    window.addEventListener('combatStarted', handleCombatStarted);

    return () => {
      window.removeEventListener('combatStarted', handleCombatStarted);
    };
  }, []);

  // Listen for scene changes
  useEffect(() => {
    const handleSceneChange = (event: CustomEvent) => {
      setCurrentScene(event.detail.sceneName);

      // Refresh payment options when returning to LobbyScene
      if (event.detail.sceneName === 'LobbyScene' && publicKey && connected) {
        handleBalanceUpdate();
      }
    };

    window.addEventListener('sceneChanged', handleSceneChange as EventListener);

    return () => {
      window.removeEventListener(
        'sceneChanged',
        handleSceneChange as EventListener
      );
    };
  }, [publicKey, connected]);

  // Listen for loading events
  useEffect(() => {
    const handleLoadingStarted = () => {
      setIsLoading(true);
      setLoadingProgress(0);
      setLoadingError(null); // Clear any previous errors
    };

    const handleLoadingProgress = (event: CustomEvent) => {
      setLoadingProgress(event.detail.progress);
    };

    const handleLoadingComplete = () => {
      setIsLoading(false);
      setLoadingProgress(100);
      setLoadingError(null);
    };

    const handleLoadingError = (event: CustomEvent) => {
      setLoadingError({
        message: event.detail.message,
        canRetry: event.detail.canRetry,
      });
      setLoadingProgress(0);
    };

    window.addEventListener('loadingStarted', handleLoadingStarted);
    window.addEventListener(
      'loadingProgress',
      handleLoadingProgress as EventListener
    );
    window.addEventListener('loadingComplete', handleLoadingComplete);
    window.addEventListener(
      'loadingError',
      handleLoadingError as EventListener
    );

    return () => {
      window.removeEventListener('loadingStarted', handleLoadingStarted);
      window.removeEventListener(
        'loadingProgress',
        handleLoadingProgress as EventListener
      );
      window.removeEventListener('loadingComplete', handleLoadingComplete);
      window.removeEventListener(
        'loadingError',
        handleLoadingError as EventListener
      );
    };
  }, []);

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected':
        return 'Online';
      case 'error':
        return 'Offline';
      default:
        return 'Connecting...';
    }
  };

  return (
    <div className={`relative w-full h-screen bg-gray-900 ${className || ''}`}>
      {/* Loading Screen */}
      <LoadingScreen
        progress={loadingProgress}
        isVisible={isLoading}
        error={loadingError || undefined}
        onRetry={() => {
          // Dispatch enterArena event to retry
          window.dispatchEvent(new CustomEvent('enterArena'));
        }}
      />

      {/* Wallet reconnection helper */}
      <WalletReconnect />

      {/* Backend status - Top left - Hide during combat and vault scenes */}
      {currentScene !== 'CombatScene' && currentScene !== 'VaultScene' && (
        <div className="absolute top-4 left-4" style={{ zIndex: 9999 }}>
          <div className="flex items-center gap-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
            <div
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected'
                  ? 'bg-green-500'
                  : backendStatus === 'error'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`}
            ></div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      )}

      {/* Debug alignment lines - to verify wallet and PDA alignment */}

      {/* PDA Payment UI - Left side - only show in LobbyScene when wallet connected */}
      {currentScene === 'LobbyScene' &&
        connected &&
        publicKey &&
        paymentOptions && (
          <div
            className="absolute left-32"
            style={{ top: '30px', zIndex: 9999 }}
          >
            <IntegratedPaymentUI
              pdaBalance={paymentOptions.pdaBalance}
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
              onDeposit={() => setShowDepositModal(true)}
              onWithdraw={() => setShowWithdrawModal(true)}
              entryFee={0.01 * LAMPORTS_PER_SOL}
              showPDAOptions={
                paymentOptions.canUsePDA ||
                paymentOptions.pdaBalance > 0 ||
                localStorage.getItem('lastPaymentMethod') === 'pda'
              }
            />
          </div>
        )}

      {/* Header with wallet button - Right side - Hide during combat and vault scenes */}
      {currentScene !== 'CombatScene' && currentScene !== 'VaultScene' && (
        <div
          className="absolute right-32 flex items-center gap-4"
          style={{ top: '23px', zIndex: 9999 }}
        >
          {/* Wallet connection */}
          <ClientWalletButton className="!bg-red-600 hover:!bg-red-700 !text-white !font-bold !px-4 !py-2 !rounded-lg transition-colors" />

          {/* Manual reconnect for development - only show on client */}
          {mounted && !connected && wallet && (
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
      )}

      {/* Game container */}
      <div
        id="game-container"
        ref={gameRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* UI Root Container */}
      <div
        id="game-ui-root"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* UI Overlays - Scene-specific rendering */}
      {isGameReady && currentScene === 'MenuScene' && <MenuSceneUI />}
      {isGameReady && currentScene === 'LobbyScene' && (
        <GameUIOverlay
          selectedPaymentMethod={selectedPaymentMethod}
          isPaymentOptionsReady={!!paymentOptions}
          pdaBalance={paymentOptions?.pdaBalance || 0}
          entryFee={0.01 * LAMPORTS_PER_SOL}
          isLoading={isCombatProcessing}
        />
      )}
      {isGameReady && currentScene === 'CombatScene' && <CombatSceneUI />}
      {isGameReady && currentScene === 'VaultScene' && <VaultSceneUI />}


      {/* Loading overlay */}
      {!isGameReady && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">
              🌲 PRIMALBET 🌲
            </h2>
            <p className="text-gray-400">Loading the game...</p>
          </div>
        </div>
      )}

      {/* Offline overlay */}
      {backendStatus === 'error' && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20">
          <div className="text-center bg-gray-800 p-8 rounded-lg">
            <h3 className="text-xl font-bold text-red-500 mb-4">
              ⚠️ CONNECTION LOST
            </h3>
            <p className="text-gray-300 mb-4">
              Unable to connect to the game server.
              <br />
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

      {/* Deposit Modal - only for LobbyScene */}
      {currentScene === 'LobbyScene' && showDepositModal && (
        <PDADepositModal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          onSuccess={handleBalanceUpdate}
        />
      )}

      {/* Withdraw Modal - only for LobbyScene */}
      {currentScene === 'LobbyScene' && showWithdrawModal && paymentOptions && (
        <PDAWithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          maxAmount={paymentOptions.pdaBalance}
          onSuccess={handleBalanceUpdate}
        />
      )}
    </div>
  );
};
