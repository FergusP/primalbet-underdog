import React, { useState } from 'react';
import { RomanDesignSystem } from '../../styles/romanDesignSystem';

interface RomanButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'imperial' | 'bronze' | 'marble';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: React.CSSProperties;
}

export const RomanButton: React.FC<RomanButtonProps> = ({
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
      padding: `${RomanDesignSystem.spacing.sm} ${RomanDesignSystem.spacing.md}`,
      fontSize: RomanDesignSystem.typography.sizes.sm,
      iconSize: RomanDesignSystem.typography.sizes.base,
    },
    medium: {
      padding: `${RomanDesignSystem.spacing.md} ${RomanDesignSystem.spacing.lg}`,
      fontSize: RomanDesignSystem.typography.sizes.base,
      iconSize: RomanDesignSystem.typography.sizes.lg,
    },
    large: {
      padding: `${RomanDesignSystem.spacing.lg} ${RomanDesignSystem.spacing.xl}`,
      fontSize: RomanDesignSystem.typography.sizes.lg,
      iconSize: RomanDesignSystem.typography.sizes.xl,
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      background: RomanDesignSystem.textures.goldLeaf.background,
      border: `3px solid ${RomanDesignSystem.colors.goldDeep}`,
      color: RomanDesignSystem.colors.inscriptionDark,
      textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)',
      hoverBackground: `linear-gradient(135deg, 
        ${RomanDesignSystem.colors.goldLeaf} 0%, 
        ${RomanDesignSystem.colors.goldDeep} 100%)`,
      hoverShadow: RomanDesignSystem.shadows.glow,
    },
    secondary: {
      background: RomanDesignSystem.textures.marble.background,
      border: `3px solid ${RomanDesignSystem.colors.travertine}`,
      color: RomanDesignSystem.colors.inscriptionDark,
      textShadow: RomanDesignSystem.shadows.inscription,
      hoverBackground: RomanDesignSystem.colors.marbleVeined,
      hoverShadow: RomanDesignSystem.shadows.raised,
    },
    imperial: {
      background: `linear-gradient(135deg, 
        ${RomanDesignSystem.colors.goldDeep} 0%, 
        ${RomanDesignSystem.colors.goldAntique} 100%)`,
      border: `3px solid ${RomanDesignSystem.colors.goldDeep}`,
      color: RomanDesignSystem.colors.obsidianBlack,
      textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)',
      hoverBackground: `linear-gradient(135deg, 
        ${RomanDesignSystem.colors.goldLeaf} 0%, 
        ${RomanDesignSystem.colors.goldDeep} 100%)`,
      hoverShadow: RomanDesignSystem.shadows.glow,
    },
    bronze: {
      background: RomanDesignSystem.textures.bronze.background,
      border: `3px solid ${RomanDesignSystem.colors.bronzePatina}`,
      color: RomanDesignSystem.colors.ivory,
      textShadow: RomanDesignSystem.shadows.inscription,
      hoverBackground: `linear-gradient(135deg, 
        ${RomanDesignSystem.colors.bronze} 0%, 
        ${RomanDesignSystem.colors.goldAntique} 100%)`,
      hoverShadow: RomanDesignSystem.shadows.deep,
    },
    marble: {
      background: RomanDesignSystem.textures.marble.background,
      backgroundImage: RomanDesignSystem.textures.marble.pattern,
      border: `3px solid ${RomanDesignSystem.colors.goldAntique}`,
      color: RomanDesignSystem.colors.inscriptionDark,
      textShadow: RomanDesignSystem.shadows.inscription,
      hoverBackground: RomanDesignSystem.colors.marbleVeined,
      hoverShadow: RomanDesignSystem.shadows.column,
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: RomanDesignSystem.spacing.sm,
    
    // Layout
    padding: currentSize.padding,
    borderRadius: RomanDesignSystem.borderRadius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    
    // Typography
    fontFamily: RomanDesignSystem.typography.display,
    fontSize: currentSize.fontSize,
    fontWeight: RomanDesignSystem.typography.weights.bold,
    letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
    textTransform: 'uppercase',
    
    // Appearance - avoid mixing background shorthand with backgroundImage
    ...(variant === 'marble' ? {
      backgroundImage: isHovered && !disabled 
        ? `${currentVariant.hoverBackground}, ${currentVariant.backgroundImage}`
        : `${currentVariant.background}, ${currentVariant.backgroundImage}`,
      backgroundColor: 'transparent',
    } : {
      background: isHovered && !disabled ? currentVariant.hoverBackground : currentVariant.background,
    }),
    border: currentVariant.border,
    color: disabled ? RomanDesignSystem.colors.bronzePatina : currentVariant.color,
    textShadow: currentVariant.textShadow,
    
    // Effects
    boxShadow: isPressed 
      ? RomanDesignSystem.shadows.carved 
      : isHovered && !disabled 
        ? currentVariant.hoverShadow 
        : RomanDesignSystem.shadows.raised,
    
    transform: isPressed ? 'scale(0.98)' : isHovered && !disabled ? 'scale(1.02)' : 'scale(1)',
    opacity: disabled ? 0.6 : 1,
    
    // Animation
    transition: `all ${RomanDesignSystem.animation.fast} ease-out`,
    
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
          color: RomanDesignSystem.colors.goldAntique,
          opacity: 0.7,
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          transition: `transform ${RomanDesignSystem.animation.fast} ease-out`,
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
          color: RomanDesignSystem.colors.goldAntique,
          opacity: 0.7,
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          transition: `transform ${RomanDesignSystem.animation.fast} ease-out`,
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
          background: RomanDesignSystem.textures.stone.texture,
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
          <span style={{ display: 'flex', alignItems: 'center', gap: RomanDesignSystem.spacing.xs }}>
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
            ${RomanDesignSystem.colors.goldAntique} 50%, 
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

// Specific Roman button variants for common actions
export const RomanFightButton: React.FC<Omit<RomanButtonProps, 'variant' | 'icon'>> = (props) => (
  <RomanButton {...props} variant="imperial" icon="⚔️" />
);

export const RomanContinueButton: React.FC<Omit<RomanButtonProps, 'variant' | 'icon'>> = (props) => (
  <RomanButton {...props} variant="bronze" icon="→" />
);

export const RomanGoldButton: React.FC<Omit<RomanButtonProps, 'variant' | 'icon'>> = (props) => (
  <RomanButton {...props} variant="primary" icon="👑" />
);

export const RomanMarbleButton: React.FC<Omit<RomanButtonProps, 'variant'>> = (props) => (
  <RomanButton {...props} variant="marble" />
);

export default RomanButton;