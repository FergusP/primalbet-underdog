'use client';

import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js';

interface PDADepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PDADepositModal: React.FC<PDADepositModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [amount, setAmount] = useState('0.1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const handleDeposit = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setError(null);
      
      // Build deposit instruction
      const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
      const [playerPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('player'), publicKey.toBuffer()],
        programId
      );

      // deposit_to_pda discriminator from IDL
      const discriminator = Buffer.from([15, 100, 42, 57, 235, 206, 59, 185]);
      
      // Convert amount to lamports
      const amountLamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
      
      // Create amount buffer (u64 - 8 bytes) using DataView for browser compatibility
      const amountBuffer = new ArrayBuffer(8);
      const view = new DataView(amountBuffer);
      view.setBigUint64(0, BigInt(amountLamports), true); // true for little-endian
      
      // Combine discriminator and amount
      const data = Buffer.concat([discriminator, Buffer.from(amountBuffer)]);

      const depositIx = new TransactionInstruction({
        programId,
        keys: [
          { pubkey: playerPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data
      });

      const transaction = new Transaction().add(depositIx);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('Deposit successful:', signature);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Deposit failed:', error);
      setError(error.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Deposit to PDA</h2>
        <p className="text-gray-400 mb-6">Deposit SOL for gasless gameplay</p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (SOL)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            placeholder="Amount in SOL"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum: 0.01 SOL (for entry fee)
          </p>
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
            onClick={handleDeposit} 
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Depositing...' : 'Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
};