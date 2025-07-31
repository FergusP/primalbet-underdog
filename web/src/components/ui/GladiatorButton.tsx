import React, { useState } from 'react';

interface GladiatorButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'victory';
  size?: 'small' | 'medium' | 'large' | 'hero';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const GladiatorButton: React.FC<GladiatorButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  style = {},
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--color-bronze) 0%, var(--color-dark-gold) 100%)',
      border: '2px solid var(--color-gold)',
      color: 'var(--color-light-gold)',
      hoverShadow: '0 12px 48px rgba(255, 215, 0, 0.3)',
      activeShadow: '0 4px 16px rgba(255, 215, 0, 0.2)',
    },
    secondary: {
      background: 'linear-gradient(135deg, var(--color-stone) 0%, var(--color-steel) 100%)',
      border: '2px solid var(--color-steel)',
      color: 'var(--color-light-gold)',
      hoverShadow: '0 12px 48px rgba(113, 121, 126, 0.3)',
      activeShadow: '0 4px 16px rgba(113, 121, 126, 0.2)',
    },
    danger: {
      background: 'linear-gradient(135deg, var(--color-blood) 0%, var(--color-crimson) 100%)',
      border: '2px solid var(--color-crimson)',
      color: 'var(--color-light-gold)',
      hoverShadow: '0 12px 48px rgba(220, 20, 60, 0.3)',
      activeShadow: '0 4px 16px rgba(220, 20, 60, 0.2)',
    },
    victory: {
      background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-bronze) 100%)',
      border: '3px solid var(--color-light-gold)',
      color: 'var(--background)',
      hoverShadow: '0 20px 80px rgba(255, 215, 0, 0.6), 0 0 120px rgba(255, 215, 0, 0.4)',
      activeShadow: '0 10px 40px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.3)',
    },
  };

  const sizes = {
    small: {
      padding: '12px 24px',
      fontSize: 'clamp(14px, 1.5vw, 18px)',
      borderRadius: '6px',
    },
    medium: {
      padding: '20px 48px',
      fontSize: 'clamp(16px, 2vw, 24px)',
      borderRadius: '8px',
    },
    large: {
      padding: '24px 64px',
      fontSize: 'clamp(18px, 2.5vw, 28px)',
      borderRadius: '10px',
    },
    hero: {
      padding: '32px 80px',
      fontSize: 'clamp(24px, 3vw, 40px)',
      borderRadius: '12px',
    },
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`gladiator-button ${className}`}
      style={{
        ...currentSize,
        ...currentVariant,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-out',
        transform: isPressed 
          ? 'scale(0.95)' 
          : isHovered 
            ? 'scale(1.05)' 
            : 'scale(1)',
        boxShadow: isPressed
          ? currentVariant.activeShadow
          : isHovered
            ? currentVariant.hoverShadow
            : '0 8px 32px rgba(0, 0, 0, 0.4)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {/* Shine effect */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.7) 50%, transparent 60%)',
          transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.6s ease-out',
          pointerEvents: 'none',
        }}
      />
      
      {/* Content */}
      <span 
        style={{
          position: 'relative',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          zIndex: 1,
        }}
      >
        {children}
      </span>
      
      {/* Border glow for victory variant */}
      {variant === 'victory' && (
        <div 
          style={{
            position: 'absolute',
            inset: -3,
            background: 'none',
            border: '3px solid var(--color-gold)',
            borderRadius: currentSize.borderRadius,
            opacity: isHovered ? 1 : 0.5,
            animation: 'borderGlow 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}
    </button>
  );
};