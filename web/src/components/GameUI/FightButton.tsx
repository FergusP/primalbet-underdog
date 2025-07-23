import React, { useState } from 'react';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export const FightButton: React.FC<Props> = ({ onClick, disabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        px-8 py-4 
        bg-red-600 hover:bg-red-700 
        text-white font-bold text-lg
        rounded-lg 
        transition-all duration-200
        transform hover:scale-105
        shadow-lg hover:shadow-red-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${!disabled ? 'animate-pulse' : ''}
      `}
      style={{
        boxShadow: isHovered 
          ? '0 0 30px rgba(239, 68, 68, 0.6), 0 10px 20px rgba(0, 0, 0, 0.3)'
          : '0 10px 20px rgba(0, 0, 0, 0.3)',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
      }}
    >
      CLAIM YOUR JACKPOT (ENTER THE FIGHT)
    </button>
  );
};