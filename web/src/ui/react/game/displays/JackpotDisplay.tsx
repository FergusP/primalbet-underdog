import React from 'react';
import { ForestDesignSystem } from '../../../styles/forestDesignSystem';

interface Props {
  amount: number;
}

export const JackpotDisplay: React.FC<Props> = ({ amount }) => {
  const solAmount = (amount / 1e9).toFixed(3);
  
  return (
    <div className="text-center">
      <p 
        className="text-sm mb-2 uppercase tracking-wider"
        style={{
          fontFamily: ForestDesignSystem.typography.accent,
          color: ForestDesignSystem.colors.mossGreen,
          fontWeight: ForestDesignSystem.typography.weights.bold,
          letterSpacing: ForestDesignSystem.typography.letterSpacing.widest,
          textShadow: `2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(74, 93, 35, 0.4)`,
        }}
      >
        🌲 Forest Pool 🌲
      </p>
      <div className="relative">
        <p 
          className="text-4xl font-bold"
          style={{ 
            fontFamily: ForestDesignSystem.typography.display,
            color: ForestDesignSystem.colors.goldShine,
            textShadow: ForestDesignSystem.shadows.glow,
            filter: `drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))`,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            letterSpacing: ForestDesignSystem.typography.letterSpacing.wide,
          }}
        >
          {solAmount} SOL
        </p>
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '-30px',
            transform: 'translateY(-50%)',
            fontSize: '20px',
            color: ForestDesignSystem.colors.goldAntique,
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          💰
        </div>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '-30px',
            transform: 'translateY(-50%)',
            fontSize: '20px',
            color: ForestDesignSystem.colors.goldAntique,
            animation: 'float 3s ease-in-out infinite reverse',
          }}
        >
          💰
        </div>
      </div>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(-50%) scale(1); }
          50% { transform: translateY(-55%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};