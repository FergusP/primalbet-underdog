export const animations = {
  // Hero Entrance Animations
  heroEntrance: `
    @keyframes heroEntrance {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
      }
      50% {
        opacity: 0.8;
        transform: translateY(-10px) scale(1.02);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `,
  
  // Sword Slash Animation
  swordSlash: `
    @keyframes swordSlash {
      0% {
        transform: rotate(-45deg) translateX(-100%);
        opacity: 0;
      }
      20% {
        opacity: 1;
      }
      100% {
        transform: rotate(45deg) translateX(200%);
        opacity: 0;
      }
    }
  `,
  
  // Blood Drip
  bloodDrip: `
    @keyframes bloodDrip {
      0% {
        transform: translateY(0) scaleY(1);
        opacity: 1;
      }
      100% {
        transform: translateY(100px) scaleY(2);
        opacity: 0;
      }
    }
  `,
  
  // Shield Pulse
  shieldPulse: `
    @keyframes shieldPulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.3;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.8;
      }
    }
  `,
  
  // Gold Shimmer
  goldShimmer: `
    @keyframes goldShimmer {
      0% {
        background-position: -200% center;
      }
      100% {
        background-position: 200% center;
      }
    }
  `,
  
  // Combat Shake
  combatShake: `
    @keyframes combatShake {
      0%, 100% { transform: translateX(0); }
      10% { transform: translateX(-2px) rotateZ(-1deg); }
      20% { transform: translateX(2px) rotateZ(1deg); }
      30% { transform: translateX(-2px) rotateZ(-1deg); }
      40% { transform: translateX(2px) rotateZ(1deg); }
      50% { transform: translateX(0) rotateZ(0); }
    }
  `,
  
  // Victory Glow
  victoryGlow: `
    @keyframes victoryGlow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      }
      50% {
        box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4);
      }
    }
  `,
  
  // Damage Number Float
  damageFloat: `
    @keyframes damageFloat {
      0% {
        transform: translateY(0) scale(0.5);
        opacity: 0;
      }
      20% {
        transform: translateY(-20px) scale(1.5);
        opacity: 1;
      }
      100% {
        transform: translateY(-100px) scale(1);
        opacity: 0;
      }
    }
  `,
};