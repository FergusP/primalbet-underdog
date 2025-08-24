'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle mouse enter on the container
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200); // Small delay to allow moving cursor to dropdown
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Simple wallet-only UI for new users
  if (!showPDAOptions) {
    return (
      <div
        className="integrated-payment-ui flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300"
        style={{
          background:
            'linear-gradient(135deg, rgba(62, 39, 35, 0.95) 0%, rgba(77, 44, 28, 0.9) 50%, rgba(62, 39, 35, 0.95) 100%)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(74, 93, 35, 0.6)',
          boxShadow:
            'inset 2px 2px 4px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.6)',
        }}
      >
        <span className="text-emerald-200 font-semibold">
          💳 Wallet Payment
        </span>
      </div>
    );
  }

  // Full UI with PDA options - Slimmer design with dropdown
  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="integrated-payment-ui flex items-center gap-3 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #654321 100%)',
          border: '2px solid #FFD700',
          boxShadow: '0 0 12px rgba(255, 215, 0, 0.3)',
          borderRadius: '8px',
          color: '#FFE4B5',
          fontFamily:
            '"Fredoka One", "Luckiest Guy", "Bungee", "MedievalSharp", serif',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          padding: '12px 16px',
          fontSize: '16px',
          fontWeight: '700',
          display: 'inline-flex',
          alignItems: 'center',
          height: '52px',
        }}
      >
        {/* Payment Method Toggle - Compact */}
        <div
          className="flex items-center rounded overflow-hidden"
          style={{ border: '1px solid #654321', fontSize: '14px' }}
        >
          <button
            className="font-semibold transition-all duration-200"
            style={{
              background:
                selectedMethod === 'wallet'
                  ? 'rgba(255, 215, 0, 0.2)'
                  : 'rgba(0, 0, 0, 0.2)',
              color: selectedMethod === 'wallet' ? '#FFD700' : '#FFE4B5',
              borderRight: '1px solid #654321',
              width: '42px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              fontSize: '16px',
            }}
            onClick={() => onMethodChange('wallet')}
            title="Pay from wallet"
          >
            💳
          </button>
          <button
            className={`font-semibold transition-all duration-200 ${
              !canUsePDA ? 'cursor-not-allowed' : ''
            }`}
            style={{
              background:
                selectedMethod === 'pda'
                  ? 'rgba(255, 215, 0, 0.2)'
                  : 'rgba(0, 0, 0, 0.2)',
              color: !canUsePDA
                ? 'rgba(255, 228, 181, 0.3)'
                : selectedMethod === 'pda'
                ? '#FFD700'
                : '#FFE4B5',
              width: '42px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              fontSize: '16px',
            }}
            onClick={() => canUsePDA && onMethodChange('pda')}
            disabled={!canUsePDA}
            title="Use PDA (gasless)"
          >
            ⚡
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: '#654321' }} />

        {/* PDA Balance with dropdown arrow */}
        <div className="flex items-center gap-2">
          <span style={{ color: '#FFE4B5', opacity: 0.8, fontSize: '15px' }}>
            PDA:
          </span>
          <span
            className="font-bold"
            style={{
              color: pdaBalance > 0 ? '#FFD700' : '#8B7355',
              fontSize: '16px',
            }}
          >
            {balanceInSol.toFixed(4)} SOL
          </span>
          
          {/* Dropdown arrow button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="transition-all duration-200 hover:scale-110"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFD700',
              fontSize: '14px',
              padding: '2px',
              cursor: 'pointer',
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
            title="Manage PDA"
          >
            ▼
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          className="absolute mt-2 rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #8B4513 0%, #654321 100%)',
            border: '2px solid #FFD700',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            minWidth: '180px',
            zIndex: 1000,
            right: 0,
          }}
        >
          <button
            className="w-full text-left px-4 py-3 font-semibold transition-all duration-200"
            style={{
              background: 'transparent',
              color: '#FFD700',
              fontSize: '14px',
              borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
              fontFamily: '"Fredoka One", "Luckiest Guy", "Bungee", "MedievalSharp", serif',
            }}
            onClick={() => {
              onDeposit();
              setIsDropdownOpen(false);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            💰 Deposit SOL
          </button>
          
          <button
            className="w-full text-left px-4 py-3 font-semibold transition-all duration-200"
            style={{
              background: 'transparent',
              color: pdaBalance === 0 ? '#8B7355' : '#FFB6C1',
              fontSize: '14px',
              opacity: pdaBalance === 0 ? 0.5 : 1,
              cursor: pdaBalance === 0 ? 'not-allowed' : 'pointer',
              fontFamily: '"Fredoka One", "Luckiest Guy", "Bungee", "MedievalSharp", serif',
            }}
            onClick={() => {
              if (pdaBalance > 0) {
                onWithdraw();
                setIsDropdownOpen(false);
              }
            }}
            disabled={pdaBalance === 0}
            onMouseEnter={(e) => {
              if (pdaBalance > 0) {
                e.currentTarget.style.background = 'rgba(139, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            📤 Withdraw SOL
          </button>
        </div>
      )}
    </div>
  );
};
