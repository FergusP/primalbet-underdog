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
      <div 
        className="integrated-payment-ui flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.95) 0%, rgba(77, 44, 28, 0.9) 50%, rgba(62, 39, 35, 0.95) 100%)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(74, 93, 35, 0.6)',
          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.6)'
        }}
      >
        <span className="text-emerald-200 font-semibold">💳 Wallet Payment</span>
      </div>
    );
  }

  // Full UI with PDA options for experienced users
  return (
    <div 
      className="integrated-payment-ui flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.95) 0%, rgba(77, 44, 28, 0.9) 50%, rgba(62, 39, 35, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
        border: '2px solid rgba(74, 93, 35, 0.6)',
        boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Payment Method Toggle - Compact */}
      <div 
        className="flex items-center gap-1 pr-3"
        style={{
          borderRight: '2px solid rgba(74, 93, 35, 0.4)'
        }}
      >
        <button
          className={`px-2.5 py-1.5 rounded text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95`}
          style={{
            background: selectedMethod === 'wallet'
              ? 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #6B46C1 100%)'
              : 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)',
            border: '1px solid rgba(107, 70, 193, 0.6)',
            boxShadow: selectedMethod === 'wallet'
              ? '0 0 10px rgba(107, 70, 193, 0.5), inset 0 0 5px rgba(107, 70, 193, 0.3)'
              : '2px 2px 4px rgba(0, 0, 0, 0.4)',
            color: 'white',
            opacity: selectedMethod === 'wallet' ? 1 : 0.7
          }}
          onClick={() => onMethodChange('wallet')}
          title="Pay from wallet"
          onMouseEnter={(e) => {
            if (selectedMethod !== 'wallet') {
              e.currentTarget.style.opacity = '1';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedMethod !== 'wallet') {
              e.currentTarget.style.opacity = '0.7';
            }
          }}
        >
          💳
        </button>
        <button
          className={`px-2.5 py-1.5 rounded text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
            !canUsePDA ? 'cursor-not-allowed' : ''
          }`}
          style={{
            background: selectedMethod === 'pda'
              ? 'linear-gradient(135deg, #4A5D23 0%, #556B2F 50%, #4A5D23 100%)'
              : 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)',
            border: '1px solid rgba(74, 93, 35, 0.6)',
            boxShadow: selectedMethod === 'pda'
              ? '0 0 10px rgba(80, 200, 120, 0.5), inset 0 0 5px rgba(80, 200, 120, 0.3)'
              : '2px 2px 4px rgba(0, 0, 0, 0.4)',
            color: 'white',
            opacity: !canUsePDA ? 0.3 : (selectedMethod === 'pda' ? 1 : 0.7)
          }}
          onClick={() => canUsePDA && onMethodChange('pda')}
          disabled={!canUsePDA}
          title="Use PDA (gasless)"
          onMouseEnter={(e) => {
            if (canUsePDA && selectedMethod !== 'pda') {
              e.currentTarget.style.opacity = '1';
            }
          }}
          onMouseLeave={(e) => {
            if (canUsePDA && selectedMethod !== 'pda') {
              e.currentTarget.style.opacity = '0.7';
            }
          }}
        >
          ⚡
        </button>
      </div>

      {/* PDA Balance */}
      <span className="text-emerald-200 font-semibold">PDA:</span>
      <span 
        className="font-bold"
        style={{
          background: pdaBalance > 0 
            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)'
            : 'linear-gradient(135deg, #5D6D7E 0%, #708090 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: pdaBalance > 0 ? '0 0 20px rgba(255, 215, 0, 0.6)' : 'none'
        }}
      >
        {balanceInSol.toFixed(4)} SOL
      </span>

      {/* Action Buttons */}
      <button 
        className="px-3 py-1.5 text-white rounded text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #4A5D23 0%, #556B2F 50%, #4A5D23 100%)',
          border: '1px solid rgba(107, 142, 35, 0.6)',
          boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(80, 200, 120, 0.2)'
        }}
        onClick={onDeposit}
        title="Deposit SOL"
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '2px 2px 12px rgba(80, 200, 120, 0.4), inset 0 0 15px rgba(80, 200, 120, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '2px 2px 8px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(80, 200, 120, 0.2)';
        }}
      >
        [+] Deposit
      </button>

      <button 
        className="px-3 py-1.5 text-white rounded text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: pdaBalance === 0 
            ? 'linear-gradient(135deg, #5D4037 0%, #3E2723 100%)' 
            : 'linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #8B0000 100%)',
          border: '1px solid rgba(139, 0, 0, 0.6)',
          boxShadow: pdaBalance === 0 
            ? '2px 2px 8px rgba(0, 0, 0, 0.6)' 
            : '2px 2px 8px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(220, 20, 60, 0.2)'
        }}
        onClick={onWithdraw}
        disabled={pdaBalance === 0}
        title="Withdraw SOL"
        onMouseEnter={(e) => {
          if (pdaBalance > 0) {
            e.currentTarget.style.boxShadow = '2px 2px 12px rgba(220, 20, 60, 0.4), inset 0 0 15px rgba(220, 20, 60, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (pdaBalance > 0) {
            e.currentTarget.style.boxShadow = '2px 2px 8px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(220, 20, 60, 0.2)';
          }
        }}
      >
        [-] Withdraw
      </button>

      {/* Status Indicator */}
      <span 
        className="text-xs font-medium ml-2"
        style={{
          color: 'rgba(192, 192, 192, 0.9)',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
        }}
      >
        🌲 {selectedMethod === 'pda' ? 'Gasless Hunt' : 'Wallet Hunt'}
      </span>
    </div>
  );
};
