'use client';

import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';

interface PDAWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  maxAmount: number; // PDA balance in lamports
}

export const PDAWithdrawModal: React.FC<PDAWithdrawModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  maxAmount
}) => {
  const maxAmountSol = maxAmount / LAMPORTS_PER_SOL;
  const [amount, setAmount] = useState(maxAmountSol.toFixed(4));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const handleWithdraw = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setError(null);
      
      // Build withdraw instruction
      const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
      const [playerPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('player'), publicKey.toBuffer()],
        programId
      );

      // withdraw_from_pda discriminator from IDL
      const discriminator = Buffer.from([176, 181, 251, 79, 48, 70, 9, 74]);
      
      // Convert amount to lamports
      const amountLamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
      
      // Create amount buffer (u64 - 8 bytes) using DataView for browser compatibility
      const amountBuffer = new ArrayBuffer(8);
      const view = new DataView(amountBuffer);
      view.setBigUint64(0, BigInt(amountLamports), true); // true for little-endian
      
      // Combine discriminator and amount
      const data = Buffer.concat([discriminator, Buffer.from(amountBuffer)]);

      const withdrawIx = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: playerPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data
      });

      const transaction = new Transaction().add(withdrawIx);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Withdraw failed:', error);
      setError(error.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(maxAmountSol.toFixed(4));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 10000 }}>
      <div 
        className="rounded-lg p-6 max-w-md w-full mx-4"
        style={{
          background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.98) 0%, rgba(77, 44, 28, 0.95) 50%, rgba(62, 39, 35, 0.98) 100%)',
          border: '3px solid rgba(139, 0, 0, 0.6)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 2px 2px 4px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.1)'
        }}
      >
        <h2 
          className="text-3xl font-bold mb-4"
          style={{
            background: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(220, 20, 60, 0.5)',
            fontFamily: '"MedievalSharp", "Cinzel", serif'
          }}
        >
          🏹 Withdraw from Vault
        </h2>
        <p className="text-amber-200 mb-6">Reclaim your gold from the forest vault</p>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-amber-300">
              💰 Amount (SOL)
            </label>
            <button
              onClick={handleMaxClick}
              className="text-sm font-semibold transition-colors duration-200"
              style={{
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFA500';
                e.currentTarget.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#FFD700';
                e.currentTarget.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.6)';
              }}
            >
              👑 Max: {maxAmountSol.toFixed(4)} SOL
            </button>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            max={maxAmountSol}
            step="0.01"
            placeholder="Amount in SOL"
            className="w-full px-4 py-3 rounded-lg text-white font-semibold focus:outline-none transition-all duration-200"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '2px solid rgba(139, 0, 0, 0.6)',
              boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = '2px solid rgba(220, 20, 60, 0.8)';
              e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 15px rgba(220, 20, 60, 0.3)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = '2px solid rgba(139, 0, 0, 0.6)';
              e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.5)';
            }}
          />
        </div>
        
        {error && (
          <div 
            className="mb-4 p-3 rounded-lg"
            style={{
              background: 'rgba(139, 0, 0, 0.2)',
              border: '2px solid rgba(220, 20, 60, 0.5)',
              boxShadow: '0 0 10px rgba(220, 20, 60, 0.3)'
            }}
          >
            <p className="text-sm text-red-300 font-medium">⚠️ {error}</p>
          </div>
        )}
        
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 px-4 py-3 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #5D4037 0%, #3E2723 100%)',
              border: '2px solid rgba(77, 44, 28, 0.6)',
              boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.6)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '2px 2px 12px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '2px 2px 8px rgba(0, 0, 0, 0.6)';
            }}
          >
            ❌ Cancel
          </button>
          <button 
            onClick={handleWithdraw} 
            disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmountSol}
            className="flex-1 px-4 py-3 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{
              background: loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmountSol
                ? 'linear-gradient(135deg, #3E2723 0%, #2F2F2F 100%)'
                : 'linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #8B0000 100%)',
              border: '2px solid rgba(139, 0, 0, 0.6)',
              boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(220, 20, 60, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!loading && amount && parseFloat(amount) > 0 && parseFloat(amount) <= maxAmountSol) {
                e.currentTarget.style.boxShadow = '2px 2px 12px rgba(220, 20, 60, 0.4), inset 0 0 15px rgba(220, 20, 60, 0.3), 0 0 20px rgba(220, 20, 60, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '2px 2px 8px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(220, 20, 60, 0.2)';
            }}
          >
            {loading ? '⏳ Withdrawing...' : '🏹 Withdraw Gold'}
          </button>
        </div>
      </div>
    </div>
  );
};