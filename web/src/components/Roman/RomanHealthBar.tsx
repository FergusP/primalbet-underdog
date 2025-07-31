import React from 'react';
import { RomanDesignSystem, RomanIcons } from '../../styles/romanDesignSystem';

interface RomanHealthBarProps {
  currentHealth: number;
  maxHealth: number;
  label: string;
  gladiatorType?: 'murmillo' | 'retiarius' | 'thraex' | 'secutor' | 'hoplomachus';
  isPlayer?: boolean;
}

export const RomanHealthBar: React.FC<RomanHealthBarProps> = ({
  currentHealth,
  maxHealth,
  label,
  gladiatorType = 'murmillo',
  isPlayer = false
}) => {
  const healthPercentage = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
  const romanCurrentHealth = RomanIcons.toRomanNumeral(Math.max(0, currentHealth));
  const romanMaxHealth = RomanIcons.toRomanNumeral(maxHealth);
  
  // Determine health bar color based on percentage
  const getHealthColor = (percentage: number) => {
    if (percentage > 60) return RomanDesignSystem.colors.laurelGreen;
    if (percentage > 30) return RomanDesignSystem.colors.ochreYellow;
    return RomanDesignSystem.colors.crimsonRoman;
  };

  const healthColor = getHealthColor(healthPercentage);
  const gladiatorIcon = RomanIcons.gladiatorTypes[gladiatorType];

  return (
    <div 
      className="relative"
      style={{
        fontFamily: RomanDesignSystem.typography.inscription,
        minWidth: '200px',
        maxWidth: '300px',
      }}
    >
      {/* Stone Tablet Background */}
      <div
        style={{
          background: RomanDesignSystem.textures.marble.background,
          backgroundImage: RomanDesignSystem.textures.marble.pattern,
          border: `3px solid ${RomanDesignSystem.colors.travertine}`,
          borderRadius: RomanDesignSystem.borderRadius.md,
          boxShadow: RomanDesignSystem.shadows.raised,
          padding: RomanDesignSystem.spacing.md,
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
            color: RomanDesignSystem.colors.goldAntique,
            textShadow: RomanDesignSystem.shadows.inscription,
          }}
        >
          🦅
        </div>
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            fontSize: '12px',
            color: RomanDesignSystem.colors.goldAntique,
            textShadow: RomanDesignSystem.shadows.inscription,
            transform: 'scaleX(-1)', // Mirror the eagle
          }}
        >
          🦅
        </div>

        {/* Header with Gladiator Type and Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: RomanDesignSystem.spacing.sm,
            gap: RomanDesignSystem.spacing.sm,
          }}
        >
          {/* Gladiator Type Icon */}
          <div
            style={{
              fontSize: RomanDesignSystem.typography.sizes.lg,
              filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.6))',
            }}
          >
            {gladiatorIcon}
          </div>

          {/* Label */}
          <div
            style={{
              fontSize: RomanDesignSystem.typography.sizes.sm,
              fontWeight: RomanDesignSystem.typography.weights.bold,
              color: RomanDesignSystem.colors.inscriptionDark,
              textShadow: RomanDesignSystem.shadows.inscription,
              letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
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
            background: RomanDesignSystem.colors.sandstone,
            border: `2px solid ${RomanDesignSystem.colors.umberBurnt}`,
            borderRadius: RomanDesignSystem.borderRadius.sm,
            boxShadow: RomanDesignSystem.shadows.carved,
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
              transition: `width ${RomanDesignSystem.animation.normal} ease-out`,
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
              background: RomanDesignSystem.textures.stone.texture,
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

        {/* Health Display - Both Arabic and Roman */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: RomanDesignSystem.spacing.sm,
            gap: '2px',
          }}
        >
          {/* Arabic numerals - Large and clear */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: RomanDesignSystem.spacing.xs,
            }}
          >
            <span
              style={{
                fontSize: RomanDesignSystem.typography.sizes.xl,
                fontWeight: RomanDesignSystem.typography.weights.black,
                color: currentHealth > 0 ? healthColor : RomanDesignSystem.colors.crimsonRoman,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                letterSpacing: RomanDesignSystem.typography.letterSpacing.normal,
              }}
            >
              {currentHealth}
            </span>
            <span
              style={{
                fontSize: RomanDesignSystem.typography.sizes.lg,
                color: RomanDesignSystem.colors.bronzePatina,
                fontWeight: RomanDesignSystem.typography.weights.bold,
              }}
            >
              /
            </span>
            <span
              style={{
                fontSize: RomanDesignSystem.typography.sizes.xl,
                fontWeight: RomanDesignSystem.typography.weights.bold,
                color: RomanDesignSystem.colors.bronzePatina,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                letterSpacing: RomanDesignSystem.typography.letterSpacing.normal,
              }}
            >
              {maxHealth}
            </span>
          </div>
          
          {/* Roman numerals - Smaller, decorative */}
          <div
            style={{
              fontSize: RomanDesignSystem.typography.sizes.xs,
              color: RomanDesignSystem.colors.goldAntique,
              opacity: 0.7,
              letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
            }}
          >
            ({romanCurrentHealth} / {romanMaxHealth})
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
              ${RomanDesignSystem.colors.goldAntique} 50%, 
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
            background: RomanDesignSystem.textures.goldLeaf.background,
            border: `2px solid ${RomanDesignSystem.colors.goldDeep}`,
            borderRadius: RomanDesignSystem.borderRadius.full,
            padding: '4px 8px',
            fontSize: RomanDesignSystem.typography.sizes.xs,
            fontWeight: RomanDesignSystem.typography.weights.bold,
            color: RomanDesignSystem.colors.inscriptionDark,
            textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)',
            letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
            boxShadow: RomanDesignSystem.shadows.raised,
          }}
        >
          TU
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
          zIndex: RomanDesignSystem.zIndex.elevated,
        }}
        // This could be used for floating damage numbers with Roman numerals
      />
    </div>
  );
};

export default RomanHealthBar;