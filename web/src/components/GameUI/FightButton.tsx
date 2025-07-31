import React, { useState } from 'react';

interface Props {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  paymentMethod?: 'wallet' | 'pda';
  pdaBalance?: number;
  entryFee?: number;
}

export const FightButton: React.FC<Props> = ({ 
  onClick, 
  disabled = false, 
  isLoading = false,
  paymentMethod = 'wallet',
  pdaBalance = 0,
  entryFee = 0.01
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if PDA has insufficient balance
  const insufficientPDABalance = paymentMethod === 'pda' && pdaBalance < entryFee;
  
  // Determine button text
  let buttonText = 'CLAIM YOUR JACKPOT (ENTER THE FIGHT)';
  if (isLoading) {
    buttonText = 'PROCESSING...';
  } else if (insufficientPDABalance) {
    buttonText = 'INSUFFICIENT PDA BALANCE (TOP UP OR USE WALLET)';
  }
  
  // Determine button color
  let bgColor = 'bg-red-600 hover:bg-red-700';
  if (isLoading) {
    bgColor = 'bg-gray-600';
  } else if (insufficientPDABalance) {
    bgColor = 'bg-orange-600 hover:bg-orange-700';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading || insufficientPDABalance}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        px-8 py-4 
        ${bgColor}
        text-white font-bold text-lg
        rounded-lg 
        transition-all duration-200
        transform hover:scale-105
        shadow-lg hover:shadow-red-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${!disabled && !isLoading && !insufficientPDABalance ? 'animate-pulse' : ''}
      `}
      style={{
        boxShadow: isHovered 
          ? '0 0 30px rgba(239, 68, 68, 0.6), 0 10px 20px rgba(0, 0, 0, 0.3)'
          : '0 10px 20px rgba(0, 0, 0, 0.3)',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
      }}
    >
      {buttonText}
    </button>
  );
};