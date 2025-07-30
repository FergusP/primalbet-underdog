'use client';

import React from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface IntegratedPaymentUIProps {
  pdaBalance: number;
  selectedMethod: 'wallet' | 'pda';
  onMethodChange: (method: 'wallet' | 'pda') => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  entryFee: number;
  showPDAOptions?: boolean;
}

export const IntegratedPaymentUI: React.FC<IntegratedPaymentUIProps> = ({
  pdaBalance,
  selectedMethod,
  onMethodChange,
  onDeposit,
  onWithdraw,
  entryFee,
  showPDAOptions = true,
}) => {
  const balanceInSol = pdaBalance / LAMPORTS_PER_SOL;
  const canUsePDA = pdaBalance >= entryFee;

  // Simple wallet-only UI for new users
  if (!showPDAOptions) {
    return (
      <div className="integrated-payment-ui flex items-center gap-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg text-sm">
        <span className="text-blue-400 font-medium">💳 Wallet Payment</span>
      </div>
    );
  }

  // Full UI with PDA options for experienced users
  return (
    <div className="integrated-payment-ui flex items-center gap-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg text-sm">
      {/* Payment Method Toggle - Compact */}
      <div className="flex items-center gap-1 border-r border-gray-600 pr-3">
        <button
          className={`px-2 py-1 rounded text-xs transition-colors ${
            selectedMethod === 'wallet'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          onClick={() => onMethodChange('wallet')}
          title="Pay from wallet"
        >
          💳
        </button>
        <button
          className={`px-2 py-1 rounded text-xs transition-colors ${
            selectedMethod === 'pda'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          } ${!canUsePDA ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => canUsePDA && onMethodChange('pda')}
          disabled={!canUsePDA}
          title="Use PDA (gasless)"
        >
          ⚡
        </button>
      </div>

      {/* PDA Balance */}
      <span className="text-gray-300">PDA:</span>
      <span
        className={`font-medium ${
          pdaBalance > 0 ? 'text-yellow-400' : 'text-gray-500'
        }`}
      >
        {balanceInSol.toFixed(4)} SOL
      </span>

      {/* Action Buttons */}
      <button
        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
        onClick={onDeposit}
        title="Deposit SOL"
      >
        Deposit
      </button>

      <button
        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onWithdraw}
        disabled={pdaBalance === 0}
        title="Withdraw SOL"
      >
        Withdraw
      </button>

      {/* Status Indicator */}
      <span className="text-gray-400 text-xs">
        • {selectedMethod === 'pda' ? 'Gasless' : 'Wallet'} mode
      </span>
    </div>
  );
};
