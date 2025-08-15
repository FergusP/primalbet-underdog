import React from 'react';
import { ForestDesignSystem, ForestIcons } from '../../../styles/forestDesignSystem';

interface BeastHealthBarProps {
  currentHealth: number;
  maxHealth: number;
  label: string;
  isPlayer?: boolean;
}

export const BeastHealthBar: React.FC<BeastHealthBarProps> = ({
  currentHealth,
  maxHealth,
  label,
  isPlayer = false
}) => {
  const healthPercentage = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
  
  // Determine health bar color based on percentage
  const getHealthColor = (percentage: number) => {
    if (percentage > 60) return ForestDesignSystem.colors.forestGreen;
    if (percentage > 30) return ForestDesignSystem.colors.autumnOrange;
    return ForestDesignSystem.colors.bloodRed;
  };

  const healthColor = getHealthColor(healthPercentage);

  return (
    <div 
      className="relative"
      style={{
        fontFamily: ForestDesignSystem.typography.inscription,
        width: '320px',
        height: '55px',
      }}
    >
      {/* Horizontal Health Bar Container */}
      <div
        style={{
          background: `linear-gradient(135deg, 
            ${isPlayer ? 'rgba(34, 139, 34, 0.95)' : 'rgba(139, 0, 0, 0.95)'} 0%, 
            ${isPlayer ? 'rgba(0, 100, 0, 0.9)' : 'rgba(80, 0, 0, 0.9)'} 100%)`,
          border: `3px solid ${isPlayer ? ForestDesignSystem.colors.goldDeep : ForestDesignSystem.colors.bloodRed}`,
          borderRadius: ForestDesignSystem.borderRadius.md,
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.2)`,
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Label Section */}
        <div
          style={{
            fontSize: ForestDesignSystem.typography.sizes.md,
            fontWeight: ForestDesignSystem.typography.weights.black,
            color: '#FFFFFF',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
            letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
            textTransform: 'uppercase',
            minWidth: '75px',
            textAlign: 'center',
          }}
        >
          {isPlayer ? 'PLAYER' : 'ENEMY'}
        </div>

        {/* Health Bar */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            height: '25px',
            background: 'rgba(0, 0, 0, 0.6)',
            border: `2px solid rgba(255, 255, 255, 0.3)`,
            borderRadius: ForestDesignSystem.borderRadius.sm,
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden',
          }}
        >
          {/* Health Fill */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${healthPercentage}%`,
              background: `linear-gradient(90deg, 
                ${healthColor} 0%, 
                ${healthColor}EE 50%,
                ${healthColor} 100%)`,
              transition: `width ${ForestDesignSystem.animation.normal} ease-out`,
              boxShadow: `inset 0 2px 4px rgba(255, 255, 255, 0.4), 
                         0 0 10px ${healthColor}88`,
            }}
          />

          {/* Divider Lines (every 25%) */}
          {[25, 50, 75].map((position) => (
            <div
              key={position}
              style={{
                position: 'absolute',
                left: `${position}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '1px 0 1px rgba(0, 0, 0, 0.5)',
              }}
            />
          ))}
        </div>

        {/* Health Numbers */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            minWidth: '90px',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px 8px',
            borderRadius: ForestDesignSystem.borderRadius.sm,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <span
            style={{
              fontSize: ForestDesignSystem.typography.sizes.lg,
              fontWeight: ForestDesignSystem.typography.weights.black,
              color: '#FFFFFF',
              textShadow: `2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 8px ${healthColor}66`,
            }}
          >
            {currentHealth}
          </span>
          <span
            style={{
              fontSize: ForestDesignSystem.typography.sizes.md,
              color: '#CCCCCC',
              fontWeight: ForestDesignSystem.typography.weights.bold,
            }}
          >
            /
          </span>
          <span
            style={{
              fontSize: ForestDesignSystem.typography.sizes.lg,
              fontWeight: ForestDesignSystem.typography.weights.bold,
              color: '#FFFFFF',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
            }}
          >
            {maxHealth}
          </span>
        </div>
      </div>

      {/* Damage/Healing Animation Container */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: ForestDesignSystem.zIndex.elevated,
        }}
        // This could be used for floating damage numbers
      />
    </div>
  );
};

export default BeastHealthBar;