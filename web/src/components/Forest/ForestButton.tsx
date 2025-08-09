import React, { useState } from 'react';
import { ForestDesignSystem } from '../../styles/forestDesignSystem';

interface ForestButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'mystical' | 'nature';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: React.CSSProperties;
}

export const ForestButton: React.FC<ForestButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style = {},
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: {
      padding: `${ForestDesignSystem.spacing.sm} ${ForestDesignSystem.spacing.md}`,
      fontSize: ForestDesignSystem.typography.sizes.sm,
      iconSize: ForestDesignSystem.typography.sizes.base,
    },
    medium: {
      padding: `${ForestDesignSystem.spacing.md} ${ForestDesignSystem.spacing.lg}`,
      fontSize: ForestDesignSystem.typography.sizes.base,
      iconSize: ForestDesignSystem.typography.sizes.lg,
    },
    large: {
      padding: `${ForestDesignSystem.spacing.lg} ${ForestDesignSystem.spacing.xl}`,
      fontSize: ForestDesignSystem.typography.sizes.lg,
      iconSize: ForestDesignSystem.typography.sizes.xl,
    },
  };

  // Variant configurations - Forest themed
  const variantConfig = {
    primary: {
      background: ForestDesignSystem.textures.goldShimmer.background,
      border: `3px solid ${ForestDesignSystem.colors.goldDeep}`,
      color: ForestDesignSystem.colors.textDark,
      textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)',
      hoverBackground: `linear-gradient(135deg, 
        ${ForestDesignSystem.colors.goldShine} 0%, 
        ${ForestDesignSystem.colors.goldDeep} 100%)`,
      hoverShadow: ForestDesignSystem.shadows.glow,
    },
    secondary: {
      background: ForestDesignSystem.textures.wood.background,
      border: `3px solid ${ForestDesignSystem.colors.darkBark}`,
      color: ForestDesignSystem.colors.textLight,
      textShadow: ForestDesignSystem.shadows.deep,
      hoverBackground: ForestDesignSystem.colors.mossGreen,
      hoverShadow: ForestDesignSystem.shadows.raised,
    },
    danger: {
      background: `linear-gradient(135deg, 
        ${ForestDesignSystem.colors.bloodRed} 0%, 
        ${ForestDesignSystem.colors.crimsonFire} 100%)`,
      border: `3px solid ${ForestDesignSystem.colors.bloodRed}`,
      color: ForestDesignSystem.colors.textLight,
      textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
      hoverBackground: `linear-gradient(135deg, 
        ${ForestDesignSystem.colors.crimsonFire} 0%, 
        ${ForestDesignSystem.colors.dangerOrange} 100%)`,
      hoverShadow: ForestDesignSystem.shadows.fire,
    },
    mystical: {
      background: `linear-gradient(135deg, 
        ${ForestDesignSystem.colors.mysticPurple} 0%, 
        ${ForestDesignSystem.colors.nightBlue} 100%)`,
      border: `3px solid ${ForestDesignSystem.colors.mysticPurple}`,
      color: ForestDesignSystem.colors.textLight,
      textShadow: ForestDesignSystem.shadows.mystical,
      hoverBackground: `linear-gradient(135deg, 
        ${ForestDesignSystem.colors.spiritCyan} 0%, 
        ${ForestDesignSystem.colors.mysticPurple} 100%)`,
      hoverShadow: ForestDesignSystem.shadows.mystical,
    },
    nature: {
      background: ForestDesignSystem.textures.moss.background,
      border: `3px solid ${ForestDesignSystem.colors.forestGreen}`,
      color: ForestDesignSystem.colors.textLight,
      textShadow: ForestDesignSystem.shadows.deep,
      hoverBackground: ForestDesignSystem.colors.emeraldGlow,
      hoverShadow: ForestDesignSystem.shadows.glow,
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ForestDesignSystem.spacing.sm,
    
    // Layout
    padding: currentSize.padding,
    borderRadius: ForestDesignSystem.borderRadius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    
    // Typography
    fontFamily: ForestDesignSystem.typography.display,
    fontSize: currentSize.fontSize,
    fontWeight: ForestDesignSystem.typography.weights.bold,
    letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
    textTransform: 'uppercase',
    
    // Appearance
    background: isHovered && !disabled ? currentVariant.hoverBackground : currentVariant.background,
    border: currentVariant.border,
    color: disabled ? ForestDesignSystem.colors.mossGreen : currentVariant.color,
    textShadow: currentVariant.textShadow,
    
    // Effects
    boxShadow: isPressed 
      ? ForestDesignSystem.shadows.carved 
      : isHovered && !disabled 
        ? currentVariant.hoverShadow 
        : ForestDesignSystem.shadows.raised,
    
    transform: isPressed ? 'scale(0.98)' : isHovered && !disabled ? 'scale(1.02)' : 'scale(1)',
    opacity: disabled ? 0.6 : 1,
    
    // Animation
    transition: `all ${ForestDesignSystem.animation.fast} ease-out`,
    
    // Overflow for decorative elements
    overflow: 'hidden',
    
    // User provided styles
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled || loading}
    >
      {/* Decorative Corner Elements */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          fontSize: '8px',
          color: ForestDesignSystem.colors.goldAntique,
          opacity: 0.7,
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          transition: `transform ${ForestDesignSystem.animation.fast} ease-out`,
        }}
      >
        ◤
      </div>
      <div
        style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          fontSize: '8px',
          color: ForestDesignSystem.colors.goldAntique,
          opacity: 0.7,
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          transition: `transform ${ForestDesignSystem.animation.fast} ease-out`,
        }}
      >
        ◥
      </div>

      {/* Stone Texture Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: ForestDesignSystem.textures.stone.texture,
          opacity: 0.1,
          pointerEvents: 'none',
        }}
      />

      {/* Icon */}
      {icon && (
        <span
          style={{
            fontSize: currentSize.iconSize,
            filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.6))',
          }}
        >
          {icon}
        </span>
      )}

      {/* Content */}
      <span style={{ position: 'relative', zIndex: 1 }}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: ForestDesignSystem.spacing.xs }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                border: `2px solid ${currentVariant.color}`,
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            {typeof children === 'string' ? 'LOADING...' : children}
          </span>
        ) : (
          children
        )}
      </span>

      {/* Bottom decorative border */}
      <div
        style={{
          position: 'absolute',
          bottom: '2px',
          left: '8px',
          right: '8px',
          height: '1px',
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${ForestDesignSystem.colors.goldAntique} 50%, 
            transparent 100%)`,
          opacity: 0.5,
        }}
      />

      {/* CSS for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

// Specific Forest button variants for common actions
export const ForestFightButton: React.FC<Omit<ForestButtonProps, 'variant' | 'icon'>> = (props) => (
  <ForestButton {...props} variant="danger" icon="⚔️" />
);

export const ForestContinueButton: React.FC<Omit<ForestButtonProps, 'variant' | 'icon'>> = (props) => (
  <ForestButton {...props} variant="secondary" icon="→" />
);

export const ForestGoldButton: React.FC<Omit<ForestButtonProps, 'variant' | 'icon'>> = (props) => (
  <ForestButton {...props} variant="primary" icon="💰" />
);

export const ForestWoodButton: React.FC<Omit<ForestButtonProps, 'variant'>> = (props) => (
  <ForestButton {...props} variant="nature" />
);

export default ForestButton;