import React from 'react';
import { ForestDesignSystem } from '../../../styles/forestDesignSystem';

interface Props {
  name: string;
  position: { x: number; y: number };
}

export const MonsterLabel: React.FC<Props> = ({ name, position }) => {
  // Position the label in the center area
  const style = {
    left: '80%', // Same horizontal position as monster
    top: '55%', // Moved down to center area
    transform: 'translateX(-50%)',
    // Forest-themed styling
    fontFamily: ForestDesignSystem.typography.display,
    fontSize: '2.5rem',
    fontWeight: 900,
    letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
    textTransform: 'uppercase' as const,
    // Blood red gradient for monster name
    background: `linear-gradient(
      135deg,
      ${ForestDesignSystem.colors.crimsonFire} 0%,
      ${ForestDesignSystem.colors.bloodRed} 35%,
      ${ForestDesignSystem.colors.dangerOrange} 65%,
      ${ForestDesignSystem.colors.crimsonFire} 100%
    )`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    // Menacing shadows and glow
    filter: `drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 20px rgba(139, 0, 0, 0.6))`,
    // Animation for intimidation
    animation: 'monsterPulse 3s ease-in-out infinite',
  };

  return (
    <>
      <div 
        className="absolute pointer-events-none"
        style={style}
      >
        {/* Decorative skulls on sides */}
        <span style={{ 
          position: 'absolute', 
          left: '-40px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          fontSize: '1.5rem',
          filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))'
        }}>
          💀
        </span>
        {name}
        <span style={{ 
          position: 'absolute', 
          right: '-40px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          fontSize: '1.5rem',
          filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))'
        }}>
          💀
        </span>
      </div>
      
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes monsterPulse {
          0%, 100% { 
            transform: translateX(-50%) scale(1);
            filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 20px rgba(139, 0, 0, 0.6));
          }
          50% { 
            transform: translateX(-50%) scale(1.05);
            filter: drop-shadow(3px 3px 8px rgba(0, 0, 0, 1)) drop-shadow(0 0 30px rgba(220, 20, 60, 0.8));
          }
        }
      `}</style>
    </>
  );
};