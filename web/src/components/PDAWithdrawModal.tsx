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
      
      // Create amount buffer (u64 - 8 bytes)
      const amountBuffer = Buffer.alloc(8);
      amountBuffer.writeBigUInt64LE(BigInt(amountLamports), 0);
      
      // Combine discriminator and amount
      const data = Buffer.concat([discriminator, amountBuffer]);

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
      
      console.log('Withdraw successful:', signature);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Withdraw from PDA</h2>
        <p className="text-gray-400 mb-6">Withdraw SOL back to your wallet</p>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">
              Amount (SOL)
            </label>
            <button
              onClick={handleMaxClick}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Max: {maxAmountSol.toFixed(4)} SOL
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
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            onClick={handleWithdraw} 
            disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmountSol}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Withdrawing...' : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
};