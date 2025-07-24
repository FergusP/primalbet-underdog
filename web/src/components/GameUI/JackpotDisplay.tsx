import React from 'react';

interface Props {
  amount: number;
}

export const JackpotDisplay: React.FC<Props> = ({ amount }) => {
  const solAmount = (amount / 1e9).toFixed(3);
  
  return (
    <div className="text-center">
      <p className="text-gray-300 text-sm mb-2">pool size (JACKPOT)</p>
      <div className="relative">
        <p className="text-4xl font-bold text-yellow-400"
           style={{ 
             textShadow: '0 0 20px rgba(255, 170, 0, 0.8), 0 0 40px rgba(255, 170, 0, 0.4)',
             animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
           }}>
          {solAmount} SOL
        </p>
      </div>
    </div>
  );
};