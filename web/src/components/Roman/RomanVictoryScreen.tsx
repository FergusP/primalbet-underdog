import React, { useState, useEffect } from 'react';
import { RomanDesignSystem, RomanText, RomanIcons } from '../../styles/romanDesignSystem';

interface RomanVictoryScreenProps {
  isVisible: boolean;
  monsterDefeated: string;
  reward?: number;
  onContinue: () => void;
}

export const RomanVictoryScreen: React.FC<RomanVictoryScreenProps> = ({
  isVisible,
  monsterDefeated,
  reward = 0,
  onContinue
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Stagger animations for dramatic effect
      setTimeout(() => setShowAnimation(true), 200);
      setTimeout(() => setShowReward(true), 800);
    } else {
      setShowAnimation(false);
      setShowReward(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const romanReward = reward > 0 ? RomanIcons.toRomanNumeral(Math.floor(reward)) : '';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: RomanDesignSystem.zIndex.modal,
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Marble Pedestal Base */}
      <div
        style={{
          position: 'relative',
          background: RomanDesignSystem.textures.marble.background,
          backgroundImage: RomanDesignSystem.textures.marble.pattern,
          border: `4px solid ${RomanDesignSystem.colors.travertine}`,
          borderRadius: RomanDesignSystem.borderRadius.lg,
          boxShadow: RomanDesignSystem.shadows.deep,
          padding: RomanDesignSystem.spacing['3xl'],
          maxWidth: '600px',
          width: '90%',
          textAlign: 'center',
          transform: showAnimation ? 'scale(1) rotateY(0deg)' : 'scale(0.8) rotateY(-10deg)',
          opacity: showAnimation ? 1 : 0,
          transition: `all ${RomanDesignSystem.animation.slow} cubic-bezier(0.34, 1.56, 0.64, 1)`,
        }}
      >
        {/* Decorative Top Border with Eagles */}
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: RomanDesignSystem.spacing.lg,
            right: RomanDesignSystem.spacing.lg,
            height: '4px',
            background: RomanDesignSystem.textures.goldLeaf.background,
            borderRadius: RomanDesignSystem.borderRadius.sm,
          }}
        />

        {/* Corner Eagles */}
        <div
          style={{
            position: 'absolute',
            top: RomanDesignSystem.spacing.sm,
            left: RomanDesignSystem.spacing.sm,
            fontSize: RomanDesignSystem.typography.sizes.lg,
            color: RomanDesignSystem.colors.goldDeep,
            filter: `drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.6))`,
            transform: showAnimation ? 'scale(1)' : 'scale(0)',
            transition: `transform ${RomanDesignSystem.animation.slow} ease-out 0.3s`,
          }}
        >
          🦅
        </div>
        <div
          style={{
            position: 'absolute',
            top: RomanDesignSystem.spacing.sm,
            right: RomanDesignSystem.spacing.sm,
            fontSize: RomanDesignSystem.typography.sizes.lg,
            color: RomanDesignSystem.colors.goldDeep,
            filter: `drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.6))`,
            transform: showAnimation ? 'scale(1) scaleX(-1)' : 'scale(0)',
            transition: `transform ${RomanDesignSystem.animation.slow} ease-out 0.4s`,
          }}
        >
          🦅
        </div>

        {/* Golden Laurel Crown */}
        <div
          style={{
            fontSize: RomanDesignSystem.typography.sizes['4xl'],
            marginBottom: RomanDesignSystem.spacing.lg,
            filter: `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))`,
            transform: showAnimation ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
            transition: `all ${RomanDesignSystem.animation.slow} ease-out 0.2s`,
          }}
        >
          👑
        </div>

        {/* Main Victory Inscription */}
        <h1
          style={{
            fontFamily: RomanDesignSystem.typography.display,
            fontSize: RomanDesignSystem.typography.sizes['3xl'],
            fontWeight: RomanDesignSystem.typography.weights.black,
            color: RomanDesignSystem.colors.inscriptionDark,
            textShadow: RomanDesignSystem.shadows.inscription,
            letterSpacing: RomanDesignSystem.typography.letterSpacing.widest,
            marginBottom: RomanDesignSystem.spacing.lg,
            background: `linear-gradient(45deg, 
              ${RomanDesignSystem.colors.goldDeep} 0%,
              ${RomanDesignSystem.colors.goldLeaf} 50%,
              ${RomanDesignSystem.colors.goldAntique} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transform: showAnimation ? 'translateY(0)' : 'translateY(20px)',
            opacity: showAnimation ? 1 : 0,
            transition: `all ${RomanDesignSystem.animation.normal} ease-out 0.5s`,
          }}
        >
          {RomanText.combat.victory}!
        </h1>

        {/* Subtitle - Glory and Honor */}
        <div
          style={{
            fontFamily: RomanDesignSystem.typography.inscription,
            fontSize: RomanDesignSystem.typography.sizes.lg,
            fontWeight: RomanDesignSystem.typography.weights.medium,
            color: RomanDesignSystem.colors.inscriptionGold,
            textShadow: RomanDesignSystem.shadows.inscription,
            letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
            marginBottom: RomanDesignSystem.spacing.xl,
            transform: showAnimation ? 'translateY(0)' : 'translateY(20px)',
            opacity: showAnimation ? 1 : 0,
            transition: `all ${RomanDesignSystem.animation.normal} ease-out 0.6s`,
          }}
        >
          {RomanText.general.glory}
        </div>

        {/* Defeated Monster Information */}
        <div
          style={{
            background: RomanDesignSystem.colors.marbleVeined,
            border: `2px solid ${RomanDesignSystem.colors.goldAntique}`,
            borderRadius: RomanDesignSystem.borderRadius.md,
            padding: RomanDesignSystem.spacing.lg,
            marginBottom: RomanDesignSystem.spacing.xl,
            boxShadow: RomanDesignSystem.shadows.carved,
            transform: showAnimation ? 'scale(1)' : 'scale(0.9)',
            opacity: showAnimation ? 1 : 0,
            transition: `all ${RomanDesignSystem.animation.normal} ease-out 0.7s`,
          }}
        >
          <div
            style={{
              fontFamily: RomanDesignSystem.typography.body,
              fontSize: RomanDesignSystem.typography.sizes.base,
              color: RomanDesignSystem.colors.inscriptionDark,
              marginBottom: RomanDesignSystem.spacing.sm,
              letterSpacing: RomanDesignSystem.typography.letterSpacing.normal,
            }}
          >
            You Defeated:
          </div>
          <div
            style={{
              fontFamily: RomanDesignSystem.typography.display,
              fontSize: RomanDesignSystem.typography.sizes.xl,
              fontWeight: RomanDesignSystem.typography.weights.bold,
              color: RomanDesignSystem.colors.crimsonRoman,
              textShadow: RomanDesignSystem.shadows.inscription,
              letterSpacing: RomanDesignSystem.typography.letterSpacing.wide,
              textTransform: 'uppercase',
            }}
          >
            {monsterDefeated}
          </div>
        </div>

        {/* Reward Display */}
        {reward > 0 && (
          <div
            style={{
              background: RomanDesignSystem.textures.goldLeaf.background,
              border: `3px solid ${RomanDesignSystem.colors.goldDeep}`,
              borderRadius: RomanDesignSystem.borderRadius.lg,
              padding: RomanDesignSystem.spacing.lg,
              marginBottom: RomanDesignSystem.spacing.xl,
              boxShadow: RomanDesignSystem.shadows.glow,
              transform: showReward ? 'scale(1)' : 'scale(0)',
              opacity: showReward ? 1 : 0,
              transition: `all ${RomanDesignSystem.animation.normal} ease-out`,
            }}
          >
            <div
              style={{
                fontFamily: RomanDesignSystem.typography.inscription,
                fontSize: RomanDesignSystem.typography.sizes.base,
                color: RomanDesignSystem.colors.inscriptionDark,
                marginBottom: RomanDesignSystem.spacing.sm,
                letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
              }}
            >
              PRAEMIUM
            </div>
            <div
              style={{
                fontFamily: RomanDesignSystem.typography.display,
                fontSize: RomanDesignSystem.typography.sizes['2xl'],
                fontWeight: RomanDesignSystem.typography.weights.black,
                color: RomanDesignSystem.colors.inscriptionDark,
                textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)',
                letterSpacing: RomanDesignSystem.typography.letterSpacing.wider,
              }}
            >
              {romanReward} SOL
            </div>
          </div>
        )}

        {/* Continue Button - Roman Style */}
        {/* HIDDEN - Using the DEFINE YOUR DESTINY button from CombatSceneUIRoman instead */}

        {/* Decorative Bottom Elements */}
        <div
          style={{
            position: 'absolute',
            bottom: RomanDesignSystem.spacing.sm,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: RomanDesignSystem.spacing.sm,
            fontSize: RomanDesignSystem.typography.sizes.base,
            color: RomanDesignSystem.colors.goldAntique,
            opacity: 0.7,
          }}
        >
          <span>🌿</span>
          <span style={{ letterSpacing: RomanDesignSystem.typography.letterSpacing.widest }}>
            {RomanText.general.spqr}
          </span>
          <span>🌿</span>
        </div>

        {/* Animated Background Particles */}
        {showAnimation && (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  background: RomanDesignSystem.colors.goldLeaf,
                  borderRadius: '50%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};

export default RomanVictoryScreen;