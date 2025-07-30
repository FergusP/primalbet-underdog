// Transaction Flow Examples

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';

// 1. Wallet Payment Flow - User pays directly from wallet
export const EnterBattleWithWallet = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);

  const handleEnterBattle = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);

      // Build enter_combat instruction
      const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
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

      const discriminator = Buffer.from([206, 145, 23, 55, 61, 45, 122, 210]); // enter_combat
      
      const enterCombatIx = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: playerPDA, isSigner: false, isWritable: true },
          { pubkey: gameStatePDA, isSigner: false, isWritable: true },
          { pubkey: potVaultPDA, isSigner: false, isWritable: true },
          {
            pubkey: new PublicKey(
              'EsRy4vmaHbnj3kfj2X9rpRRgbKcA6a9DtdXrBddnNoVi'
            ), // treasury
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: discriminator,
      });

      const transaction = new Transaction().add(enterCombatIx);

      // User sees wallet popup here for approval
      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Store combat ID for later use
      const combatId = `combat_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('lastCombatId', combatId);
      localStorage.setItem('walletAddress', publicKey.toBase58());
      
      // Transition to combat
      window.dispatchEvent(
        new CustomEvent('combatStarted', {
          detail: { 
            paymentMethod: 'wallet', 
            txSignature: signature,
            combatId,
            walletAddress: publicKey.toBase58()
          },
        })
      );
    } catch (error: any) {
      if (error.message?.includes('User rejected')) {
        console.log('User cancelled transaction');
        // Stay in lobby, no side effects
      } else {
        console.error('Transaction failed:', error);
        // Show error to user
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnterBattle}
      disabled={loading || !publicKey}
      className="enter-battle-btn"
    >
      {loading ? 'Awaiting approval...' : 'Enter Battle (0.01 SOL)'}
    </button>
  );
};

// 2. PDA Payment Flow - Gasless transaction after deposit
export const EnterBattleGasless = () => {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleEnterBattle = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);

      // No wallet popup - backend handles transaction
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/combat/enter-gasless`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerWallet: publicKey.toString() }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.error === 'Insufficient PDA balance') {
          // Prompt to deposit
          window.dispatchEvent(new CustomEvent('show-deposit-modal'));
          return;
        }
        throw new Error(error.error);
      }

      const result = await response.json();

      // Store combat ID for later use
      const combatId = `combat_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('lastCombatId', combatId);
      localStorage.setItem('walletAddress', publicKey.toBase58());
      
      // Transition to combat immediately - no approval needed
      window.dispatchEvent(
        new CustomEvent('combatStarted', {
          detail: { 
            paymentMethod: 'pda', 
            txSignature: result.txSignature,
            combatId,
            walletAddress: publicKey.toBase58()
          },
        })
      );
    } catch (error) {
      console.error('Gasless entry failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnterBattle}
      disabled={loading || !publicKey}
      className="enter-battle-btn gasless"
    >
      {loading ? 'Entering...' : '⚡ Enter Battle (Gasless)'}
    </button>
  );
};

// 3. Complete Lobby Integration
export const GameLobby = () => {
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'pda'>('wallet');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { gameState, playerData, paymentOptions } = useGameState();

  // Listen for deposit prompt
  useEffect(() => {
    const handleDepositPrompt = () => setShowDepositModal(true);
    window.addEventListener('show-deposit-modal', handleDepositPrompt);
    return () =>
      window.removeEventListener('show-deposit-modal', handleDepositPrompt);
  }, []);

  return (
    <div className="game-lobby">
      {/* Payment Method Selection */}
      <PaymentMethodToggle
        selectedMethod={paymentMethod}
        onMethodChange={setPaymentMethod}
        pdaBalance={playerData?.balance || 0}
        entryFee={0.01 * LAMPORTS_PER_SOL}
      />

      {/* PDA Balance Display */}
      <PDABalanceIndicator
        pdaBalance={playerData?.balance || 0}
        onDeposit={() => setShowDepositModal(true)}
        onWithdraw={() => setShowWithdrawModal(true)}
      />

      {/* Enter Battle Button */}
      {paymentMethod === 'wallet' ? (
        <EnterBattleWithWallet />
      ) : (
        <EnterBattleGasless />
      )}

      {/* Modals */}
      <PDADepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={() => {
          // Refresh payment options
          window.location.reload();
        }}
      />

      <PDAWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={() => {
          // Refresh payment options
          window.location.reload();
        }}
      />
    </div>
  );
};

// 4. Error Handling Utilities
export const handleTransactionError = (error: any): string => {
  if (error.message?.includes('User rejected')) {
    return 'Transaction cancelled by user';
  }
  if (error.message?.includes('Insufficient funds')) {
    return 'Insufficient SOL balance';
  }
  if (error.message?.includes('0x1')) {
    return 'Insufficient PDA balance';
  }
  if (error.message?.includes('Blockhash not found')) {
    return 'Network error - please try again';
  }
  return 'Transaction failed - please try again';
};