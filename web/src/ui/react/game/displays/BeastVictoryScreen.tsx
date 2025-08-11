import React, { useState, useEffect } from 'react';
import { ForestDesignSystem, ForestText, ForestIcons } from '../../../styles/forestDesignSystem';

interface BeastVictoryScreenProps {
  isVisible: boolean;
  monsterDefeated: string;
  reward?: number;
  onContinue: () => void;
}

export const BeastVictoryScreen: React.FC<BeastVictoryScreenProps> = ({
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

  const rewardDisplay = reward > 0 ? ForestIcons.toNumber(Math.floor(reward)) : '';

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
        zIndex: ForestDesignSystem.zIndex.modal,
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Marble Pedestal Base */}
      <div
        style={{
          position: 'relative',
          background: ForestDesignSystem.textures.marble.background,
          backgroundImage: ForestDesignSystem.textures.marble.pattern,
          border: `4px solid ${ForestDesignSystem.colors.stoneGray}`,
          borderRadius: ForestDesignSystem.borderRadius.lg,
          boxShadow: ForestDesignSystem.shadows.deep,
          padding: ForestDesignSystem.spacing['3xl'],
          maxWidth: '600px',
          width: '90%',
          textAlign: 'center',
          transform: showAnimation ? 'scale(1) rotateY(0deg)' : 'scale(0.8) rotateY(-10deg)',
          opacity: showAnimation ? 1 : 0,
          transition: `all ${ForestDesignSystem.animation.slow} cubic-bezier(0.34, 1.56, 0.64, 1)`,
        }}
      >
        {/* Decorative Top Border with Eagles */}
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: ForestDesignSystem.spacing.lg,
            right: ForestDesignSystem.spacing.lg,
            height: '4px',
            background: ForestDesignSystem.textures.goldShimmer.background,
            borderRadius: ForestDesignSystem.borderRadius.sm,
          }}
        />

        {/* Corner Eagles */}
        <div
          style={{
            position: 'absolute',
            top: ForestDesignSystem.spacing.sm,
            left: ForestDesignSystem.spacing.sm,
            fontSize: ForestDesignSystem.typography.sizes.lg,
            color: ForestDesignSystem.colors.goldDeep,
            filter: `drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.6))`,
            transform: showAnimation ? 'scale(1)' : 'scale(0)',
            transition: `transform ${ForestDesignSystem.animation.slow} ease-out 0.3s`,
          }}
        >
          🦉
        </div>
        <div
          style={{
            position: 'absolute',
            top: ForestDesignSystem.spacing.sm,
            right: ForestDesignSystem.spacing.sm,
            fontSize: ForestDesignSystem.typography.sizes.lg,
            color: ForestDesignSystem.colors.goldDeep,
            filter: `drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.6))`,
            transform: showAnimation ? 'scale(1) scaleX(-1)' : 'scale(0)',
            transition: `transform ${ForestDesignSystem.animation.slow} ease-out 0.4s`,
          }}
        >
          🦉
        </div>

        {/* Forest Trophy */}
        <div
          style={{
            fontSize: ForestDesignSystem.typography.sizes['4xl'],
            marginBottom: ForestDesignSystem.spacing.lg,
            filter: `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))`,
            transform: showAnimation ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
            transition: `all ${ForestDesignSystem.animation.slow} ease-out 0.2s`,
          }}
        >
          👑
        </div>

        {/* Main Victory Inscription */}
        <h1
          style={{
            fontFamily: ForestDesignSystem.typography.display,
            fontSize: ForestDesignSystem.typography.sizes['3xl'],
            fontWeight: ForestDesignSystem.typography.weights.black,
            color: ForestDesignSystem.colors.textDark,
            textShadow: ForestDesignSystem.shadows.inscription,
            letterSpacing: ForestDesignSystem.typography.letterSpacing.widest,
            marginBottom: ForestDesignSystem.spacing.lg,
            background: `linear-gradient(45deg, 
              ${ForestDesignSystem.colors.goldDeep} 0%,
              ${ForestDesignSystem.colors.goldShine} 50%,
              ${ForestDesignSystem.colors.goldAntique} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transform: showAnimation ? 'translateY(0)' : 'translateY(20px)',
            opacity: showAnimation ? 1 : 0,
            transition: `all ${ForestDesignSystem.animation.normal} ease-out 0.5s`,
          }}
        >
          {ForestText.combat.victory}!
        </h1>

        {/* Subtitle - Glory and Honor */}
        <div
          style={{
            fontFamily: ForestDesignSystem.typography.inscription,
            fontSize: ForestDesignSystem.typography.sizes.lg,
            fontWeight: ForestDesignSystem.typography.weights.medium,
            color: ForestDesignSystem.colors.textGold,
            textShadow: ForestDesignSystem.shadows.inscription,
            letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
            marginBottom: ForestDesignSystem.spacing.xl,
            transform: showAnimation ? 'translateY(0)' : 'translateY(20px)',
            opacity: showAnimation ? 1 : 0,
            transition: `all ${ForestDesignSystem.animation.normal} ease-out 0.6s`,
          }}
        >
          {ForestText.general.glory}
        </div>

        {/* Defeated Monster Information */}
        <div
          style={{
            background: ForestDesignSystem.colors.mossGreen,
            border: `2px solid ${ForestDesignSystem.colors.goldAntique}`,
            borderRadius: ForestDesignSystem.borderRadius.md,
            padding: ForestDesignSystem.spacing.lg,
            marginBottom: ForestDesignSystem.spacing.xl,
            boxShadow: ForestDesignSystem.shadows.carved,
            transform: showAnimation ? 'scale(1)' : 'scale(0.9)',
            opacity: showAnimation ? 1 : 0,
            transition: `all ${ForestDesignSystem.animation.normal} ease-out 0.7s`,
          }}
        >
          <div
            style={{
              fontFamily: ForestDesignSystem.typography.body,
              fontSize: ForestDesignSystem.typography.sizes.base,
              color: ForestDesignSystem.colors.textDark,
              marginBottom: ForestDesignSystem.spacing.sm,
              letterSpacing: ForestDesignSystem.typography.letterSpacing.normal,
            }}
          >
            You Defeated:
          </div>
          <div
            style={{
              fontFamily: ForestDesignSystem.typography.display,
              fontSize: ForestDesignSystem.typography.sizes.xl,
              fontWeight: ForestDesignSystem.typography.weights.bold,
              color: ForestDesignSystem.colors.bloodRed,
              textShadow: ForestDesignSystem.shadows.inscription,
              letterSpacing: ForestDesignSystem.typography.letterSpacing.wide,
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
              background: ForestDesignSystem.textures.goldShimmer.background,
              border: `3px solid ${ForestDesignSystem.colors.goldDeep}`,
              borderRadius: ForestDesignSystem.borderRadius.lg,
              padding: ForestDesignSystem.spacing.lg,
              marginBottom: ForestDesignSystem.spacing.xl,
              boxShadow: ForestDesignSystem.shadows.glow,
              transform: showReward ? 'scale(1)' : 'scale(0)',
              opacity: showReward ? 1 : 0,
              transition: `all ${ForestDesignSystem.animation.normal} ease-out`,
            }}
          >
            <div
              style={{
                fontFamily: ForestDesignSystem.typography.inscription,
                fontSize: ForestDesignSystem.typography.sizes.base,
                color: ForestDesignSystem.colors.textDark,
                marginBottom: ForestDesignSystem.spacing.sm,
                letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
              }}
            >
              PRAEMIUM
            </div>
            <div
              style={{
                fontFamily: ForestDesignSystem.typography.display,
                fontSize: ForestDesignSystem.typography.sizes['2xl'],
                fontWeight: ForestDesignSystem.typography.weights.black,
                color: ForestDesignSystem.colors.textDark,
                textShadow: '1px 1px 0px rgba(255, 255, 255, 0.8)',
                letterSpacing: ForestDesignSystem.typography.letterSpacing.wider,
              }}
            >
              {rewardDisplay} SOL
            </div>
          </div>
        )}

        {/* Continue Button - Forest Style */}
        {/* HIDDEN - Using the DEFINE YOUR DESTINY button from CombatSceneUI instead */}

        {/* Decorative Bottom Elements */}
        <div
          style={{
            position: 'absolute',
            bottom: ForestDesignSystem.spacing.sm,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: ForestDesignSystem.spacing.sm,
            fontSize: ForestDesignSystem.typography.sizes.base,
            color: ForestDesignSystem.colors.goldAntique,
            opacity: 0.7,
          }}
        >
          <span>🌿</span>
          <span style={{ letterSpacing: ForestDesignSystem.typography.letterSpacing.widest }}>
            {ForestText.general.spqr}
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
                  background: ForestDesignSystem.colors.goldShine,
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

export default BeastVictoryScreen;