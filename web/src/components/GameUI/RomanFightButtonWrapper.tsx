import React from 'react';
import { RomanFightButton } from '../Roman/RomanButton';
import { RomanText } from '../../styles/romanDesignSystem';

interface Props {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  paymentMethod?: 'wallet' | 'pda';
  pdaBalance?: number;
  entryFee?: number;
}

export const RomanFightButtonWrapper: React.FC<Props> = ({ 
  onClick, 
  disabled = false, 
  isLoading = false,
  paymentMethod = 'wallet',
  pdaBalance = 0,
  entryFee = 0.01
}) => {
  // Check if PDA has insufficient balance
  const insufficientPDABalance = paymentMethod === 'pda' && pdaBalance < entryFee;
  
  // Determine button text
  let buttonText = 'ENTER COMBAT';
  if (isLoading) {
    buttonText = 'LOADING...';
  } else if (insufficientPDABalance) {
    buttonText = 'INSUFFICIENT FUNDS (ADD OR USE WALLET)';
  }

  return (
    <RomanFightButton
      onClick={onClick}
      disabled={disabled || isLoading || insufficientPDABalance}
      loading={isLoading}
      size="large"
      style={{
        minWidth: '300px',
        fontSize: insufficientPDABalance ? '14px' : '18px', // Smaller text for long message
      }}
    >
      {buttonText}
    </RomanFightButton>
  );
};

export default RomanFightButtonWrapper;