'use client';

import React from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface PaymentMethodToggleProps {
  selectedMethod: 'wallet' | 'pda';
  onMethodChange: (method: 'wallet' | 'pda') => void;
  pdaBalance: number;
  entryFee: number;
}

export const PaymentMethodToggle: React.FC<PaymentMethodToggleProps> = ({
  selectedMethod,
  onMethodChange,
  pdaBalance,
  entryFee
}) => {
  const canUsePDA = pdaBalance >= entryFee;

  return (
    <div className="payment-toggle-container bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-white">Payment Method</h3>
      <div className="toggle-switch flex gap-2">
        <button
          className={`toggle-option flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${
            selectedMethod === 'wallet' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => onMethodChange('wallet')}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">💳</span>
            <span className="font-medium">Wallet Entry</span>
            <span className="text-xs opacity-80">Pay from wallet</span>
          </div>
        </button>
        
        <button
          className={`toggle-option flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${
            selectedMethod === 'pda' 
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } ${!canUsePDA ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => canUsePDA && onMethodChange('pda')}
          disabled={!canUsePDA}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">⚡</span>
            <span className="font-medium">Gasless Entry</span>
            <span className="text-xs opacity-80">Use PDA balance</span>
          </div>
        </button>
      </div>
      
      {!canUsePDA && selectedMethod === 'pda' && (
        <div className="mt-3 p-2 bg-red-900/30 border border-red-600/50 rounded-lg">
          <p className="text-sm text-red-400">
            Insufficient PDA balance. Need at least {(entryFee / LAMPORTS_PER_SOL).toFixed(3)} SOL
          </p>
        </div>
      )}
    </div>
  );
};