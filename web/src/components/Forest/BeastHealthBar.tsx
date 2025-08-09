import React from 'react';
import { ForestDesignSystem, ForestIcons } from '../../styles/forestDesignSystem';

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
  const currentHealthDisplay = ForestIcons.toNumber(Math.max(0, currentHealth));
  const maxHealthDisplay = ForestIcons.toNumber(maxHealth);
  
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
        minWidth: '200px',
        maxWidth: '300px',
      }}
    >
      {/* Stone Tablet Background */}
      <div
        style={{
          background: ForestDesignSystem.textures.marble.background,
          backgroundImage: ForestDesignSystem.textures.marble.pattern,
          border: `3px solid ${ForestDesignSystem.colors.stoneGray}`,
          borderRadius: ForestDesignSystem.borderRadius.md,
          boxShadow: ForestDesignSystem.shadows.raised,
          padding: ForestDesignSystem.spacing.md,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Corner Eagles */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            fontSize: '12px',
            color: ForestDesignSystem.colors.goldAntique,
            textShadow: ForestDesignSystem.shadows.inscription,
          }}
        >
          🦉
        </div>
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            fontSize: '12px',
            color: ForestDesignSystem.colors.goldAntique,
            textShadow: ForestDesignSystem.shadows.inscription,
            transform: 'scaleX(-1)', // Mirror the eagle
          }}
        >
          🦉
        </div>

        {/* Header with Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: ForestDesignSystem.spacing.sm,
            gap: ForestDesignSystem.spacing.sm,
          }}
        >
          {/* Label */}
          <div
            style={{
              fontSize: ForestDesignSystem.typography.sizes.sm,
              fontWeight: ForestDesignSystem.typography.weights.bold,
              color: ForestDesignSystem.colors.textDark,
              textShadow: ForestDesignSystem.shadows.inscription,
              letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>
        </div>

        {/* Health Bar Container - Carved Stone Effect */}
        <div
          style={{
            position: 'relative',
            height: '20px',
            background: ForestDesignSystem.colors.autumnOrange,
            border: `2px solid ${ForestDesignSystem.colors.umberBurnt}`,
            borderRadius: ForestDesignSystem.borderRadius.sm,
            boxShadow: ForestDesignSystem.shadows.carved,
            overflow: 'hidden',
          }}
        >
          {/* Health Fill - Animated */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${healthPercentage}%`,
              background: `linear-gradient(90deg, 
                ${healthColor} 0%, 
                ${healthColor}CC 100%)`,
              transition: `width ${ForestDesignSystem.animation.normal} ease-out`,
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3)',
            }}
          />

          {/* Decorative Stone Texture Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: ForestDesignSystem.textures.stone.texture,
              opacity: 0.3,
              pointerEvents: 'none',
            }}
          />

          {/* Carved Divider Lines (every 20%) */}
          {[20, 40, 60, 80].map((position) => (
            <div
              key={position}
              style={{
                position: 'absolute',
                left: `${position}%`,
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'rgba(0, 0, 0, 0.4)',
                boxShadow: '1px 0 0 rgba(255, 255, 255, 0.2)',
              }}
            />
          ))}
        </div>

        {/* Health Display - Both Arabic and formatted */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: ForestDesignSystem.spacing.sm,
            gap: '2px',
          }}
        >
          {/* Arabic numerals - Large and clear */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: ForestDesignSystem.spacing.xs,
            }}
          >
            <span
              style={{
                fontSize: ForestDesignSystem.typography.sizes.xl,
                fontWeight: ForestDesignSystem.typography.weights.black,
                color: currentHealth > 0 ? healthColor : ForestDesignSystem.colors.bloodRed,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                letterSpacing: ForestDesignSystem.typography.letterSpacing.normal,
              }}
            >
              {currentHealth}
            </span>
            <span
              style={{
                fontSize: ForestDesignSystem.typography.sizes.lg,
                color: ForestDesignSystem.colors.mossGreen,
                fontWeight: ForestDesignSystem.typography.weights.bold,
              }}
            >
              /
            </span>
            <span
              style={{
                fontSize: ForestDesignSystem.typography.sizes.xl,
                fontWeight: ForestDesignSystem.typography.weights.bold,
                color: ForestDesignSystem.colors.mossGreen,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                letterSpacing: ForestDesignSystem.typography.letterSpacing.normal,
              }}
            >
              {maxHealth}
            </span>
          </div>
          
          {/* Formatted numbers - Smaller, decorative */}
          <div
            style={{
              fontSize: ForestDesignSystem.typography.sizes.xs,
              color: ForestDesignSystem.colors.goldAntique,
              opacity: 0.7,
              letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
            }}
          >
            ({currentHealthDisplay} / {maxHealthDisplay})
          </div>
        </div>

        {/* Bottom Decorative Border */}
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '12px',
            right: '12px',
            height: '2px',
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${ForestDesignSystem.colors.goldAntique} 50%, 
              transparent 100%)`,
            opacity: 0.6,
          }}
        />
      </div>

      {/* Optional Player Indicator */}
      {isPlayer && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: ForestDesignSystem.textures.goldShimmer.background,
            border: `2px solid ${ForestDesignSystem.colors.goldDeep}`,
            borderRadius: ForestDesignSystem.borderRadius.full,
            padding: '4px 8px',
            fontSize: ForestDesignSystem.typography.sizes.xs,
            fontWeight: ForestDesignSystem.typography.weights.bold,
            color: ForestDesignSystem.colors.textDark,
            textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)',
            letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
            boxShadow: ForestDesignSystem.shadows.raised,
          }}
        >
          YOU
        </div>
      )}

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