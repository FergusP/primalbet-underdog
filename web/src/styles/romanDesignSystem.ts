// Forest Design System for BetBeast (formerly RomanDesignSystem)
// Dark forest theme with mystical elements and beast combat atmosphere
// NOTE: Keeping original export names for backward compatibility during migration

export const RomanDesignSystem = {
  // Color Palette - Dark forest with gold accents for rewards
  colors: {
    // Primary Forest Colors (replacing marble/stone)
    marbleWhite: '#3E2723',        // Now dark bark
    marbleVeined: '#4A5D23',       // Now moss green  
    travertine: '#5D6D7E',         // Now stone gray
    sandstone: '#6B8E23',          // Now forest moss
    
    // Metals & Precious Materials (keeping gold)
    goldLeaf: '#FFD700',           // Pure gold (KEPT)
    goldAntique: '#B8860B',        // Aged gold (KEPT)
    goldDeep: '#DAA520',           // Rich gold (KEPT)
    bronze: '#5D6D7E',             // Now stone gray
    bronzePatina: '#4A5D23',       // Now moss green
    
    // Imperial Colors (now forest themed)
    purpleImperial: '#0B3D0B',     // Now deep forest green
    purpleDark: '#1C3A1C',         // Now darker forest
    crimsonRoman: '#8B0000',       // Now blood red
    
    // Natural Pigments (forest themed)
    ochreYellow: '#D2691E',        // Autumn orange
    umberBurnt: '#5D4037',         // Dark wood
    charcoal: '#1C1C1C',           // Shadow black
    ivory: '#F5F5F5',              // Light text
    
    // Accent Colors (forest themed)
    oliveBranch: '#4A5D23',        // Moss green
    laurelGreen: '#0B3D0B',        // Deep forest green
    
    // Text Colors
    inscriptionDark: '#2F2F2F',    // Dark text
    inscriptionGold: '#B8860B',    // Gold text
    shadowDeep: 'rgba(0, 0, 0, 0.8)',
    shadowSoft: 'rgba(0, 0, 0, 0.4)',
  },

  // Typography - Rugged fantasy fonts
  typography: {
    // Font Families
    display: '"MedievalSharp", "Cinzel", "Georgia", serif',
    inscription: '"Merriweather", "Crimson Text", "Georgia", serif',
    body: '"Merriweather", "Georgia", "Times", serif',
    
    // Font Weights
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
      black: 900,
    },
    
    // Font Sizes (responsive)
    sizes: {
      xs: 'clamp(10px, 1.2vw, 14px)',
      sm: 'clamp(12px, 1.5vw, 16px)',
      base: 'clamp(14px, 1.8vw, 18px)',
      lg: 'clamp(16px, 2.2vw, 22px)',
      xl: 'clamp(20px, 2.8vw, 28px)',
      '2xl': 'clamp(24px, 3.5vw, 36px)',
      '3xl': 'clamp(32px, 4.5vw, 48px)',
      '4xl': 'clamp(40px, 5.5vw, 64px)',
      '5xl': 'clamp(48px, 6.5vw, 80px)',
    },
    
    // Letter Spacing
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.05em',
      wider: '0.1em',
      widest: '0.15em',
    },
  },

  // Textures & Materials (forest themed)
  textures: {
    marble: {
      background: `linear-gradient(135deg, 
        #3E2723 0%, 
        #5D4037 25%, 
        #3E2723 50%, 
        #4E342E 75%, 
        #3E2723 100%)`,
      pattern: `radial-gradient(ellipse at top left, 
        rgba(77, 44, 28, 0.3) 0%, 
        transparent 50%),
        radial-gradient(ellipse at bottom right, 
        rgba(62, 39, 35, 0.3) 0%, 
        transparent 50%)`,
    },
    
    goldLeaf: {
      background: `linear-gradient(135deg, 
        #FFD700 0%, 
        #FFA500 25%, 
        #FFD700 50%, 
        #DAA520 75%, 
        #FFD700 100%)`,
      shimmer: `linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.4) 50%, 
        transparent 100%)`,
    },
    
    bronze: {
      background: `linear-gradient(135deg, 
        #5D6D7E 0%, 
        #708090 25%, 
        #5D6D7E 50%, 
        #778899 75%, 
        #5D6D7E 100%)`,
    },
    
    stone: {
      background: `linear-gradient(135deg, 
        #5D6D7E 0%, 
        #708090 50%, 
        #5D6D7E 100%)`,
      texture: `radial-gradient(circle at 25% 25%, 
        rgba(0, 0, 0, 0.2) 0%, 
        transparent 50%),
        radial-gradient(circle at 75% 75%, 
        rgba(0, 0, 0, 0.1) 0%, 
        transparent 50%)`,
    },
  },

  // Shadows & Depth (forest themed)
  shadows: {
    carved: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.1)',
    raised: '2px 2px 8px rgba(0, 0, 0, 0.6), -1px -1px 2px rgba(255, 255, 255, 0.1)',
    deep: '4px 8px 16px rgba(0, 0, 0, 0.8)',
    column: '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 0, 0, 0.4)',
    inscription: '1px 1px 0px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
  },

  // Borders (forest themed)
  borders: {
    marble: '2px solid #5D4037',
    gold: '2px solid #B8860B',
    bronze: '2px solid #5D6D7E',
    carved: '1px solid rgba(0, 0, 0, 0.3)',
    ornate: '3px solid #B8860B, inset 0 0 0 1px #FFD700',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '50%',
    arch: '50% 50% 0 0',
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
    '5xl': '128px',
  },

  // Animation Durations
  animation: {
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s',
    marble: '2s',
    shimmer: '3s',
  },

  // Z-index layers
  zIndex: {
    base: 1,
    elevated: 10,
    overlay: 100,
    modal: 1000,
    tooltip: 1100,
  },
};

// Forest Icons (replacing Roman iconography)
export const RomanIcons = {
  // Beast Types (replacing gladiator types)
  gladiatorTypes: {
    murmillo: '🐺',    // Wolf
    retiarius: '🐻',   // Bear
    thraex: '⚔️',      // Sword
    secutor: '🗡️',     // Dagger
    hoplomachus: '🏹', // Bow
  },
  
  // Forest Symbols (replacing Roman symbols)
  symbols: {
    eagle: '🦉',       // Owl instead of eagle
    laurel: '🌲',      // Tree instead of laurel
    spqr: 'BETBEAST',  // BetBeast instead of SPQR
    column: '🌲',      // Tree instead of column
    amphitheater: '🏞️', // Forest instead of amphitheater
    crown: '💀',       // Skull instead of crown
    olive: '🍄',       // Mushroom instead of olive
  },
  
  // No Roman numerals - using regular numbers
  toRomanNumeral: (num: number): string => {
    return num.toString(); // Just return regular numbers
  },
};

// Forest Battle Text (replacing Latin)
export const RomanText = {
  combat: {
    fight: 'FIGHT',
    victory: 'VICTORY',
    defeat: 'DEFEATED',
    glory: 'GLORY',
    honor: 'HONOR',
    courage: 'COURAGE',
    strength: 'STRENGTH',
  },
  
  general: {
    fortune: 'FORTUNE',
    destiny: 'DESTINY', 
    glory: 'GLORY AND GOLD',
    greeting: 'WELCOME HUNTER',
    farewell: 'UNTIL NEXT HUNT',
    senate: 'THE FOREST COUNCIL',
    spqr: 'BETBEAST',
  },
  
  phrases: {
    mayFortuneSmile: 'FORTUNE FAVORS THE BOLD',
    toGlory: 'TO GLORY',
    forRome: 'FOR THE HUNT',
    victoryOrDeath: 'VICTORY OR DEATH',
    weWhoAreAboutToDie: 'THE HUNT BEGINS',
    theGamesBegin: 'LET THE GAMES BEGIN',
  },
};

export default RomanDesignSystem;