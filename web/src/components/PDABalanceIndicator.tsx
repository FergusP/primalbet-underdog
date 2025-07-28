'use client';

import React from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface PDABalanceIndicatorProps {
  pdaBalance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
}

export const PDABalanceIndicator: React.FC<PDABalanceIndicatorProps> = ({
  pdaBalance,
  onDeposit,
  onWithdraw
}) => {
  const balanceInSol = pdaBalance / LAMPORTS_PER_SOL;

  return (
    <div className="pda-balance-indicator flex items-center gap-3 bg-black bg-opacity-50 px-3 py-2 rounded-lg text-sm">
      <span className="text-gray-300">PDA:</span>
      <span className="font-medium text-yellow-400">
        {balanceInSol.toFixed(4)} SOL
      </span>
      
      <button 
        className="deposit-btn px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors duration-200"
        onClick={onDeposit}
        title="Deposit SOL"
      >
        [+]
      </button>
      
      <button 
        className="withdraw-btn px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onWithdraw}
        disabled={pdaBalance === 0}
        title="Withdraw SOL"
      >
        [-]
      </button>
      
      <span className="text-gray-400 text-xs">
        • Gasless play
      </span>
    </div>
  );
};