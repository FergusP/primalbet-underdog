// Authentic Roman Design System
// Based on research of ancient Roman architecture, typography, and materials

export const RomanDesignSystem = {
  // Color Palette - Based on authentic Roman materials and pigments
  colors: {
    // Primary Materials
    marbleWhite: '#F8F6F0',        // Carrara marble
    marbleVeined: '#F5F3ED',       // Marble with subtle veining
    travertine: '#E8E2D5',         // Roman travertine stone
    sandstone: '#D4C4A8',          // Roman building stone
    
    // Metals & Precious Materials
    goldLeaf: '#FFD700',           // Pure gold leaf
    goldAntique: '#B8860B',        // Aged gold
    goldDeep: '#DAA520',           // Rich gold
    bronze: '#CD7F32',             // Roman bronze
    bronzePatina: '#8C7853',       // Aged bronze
    
    // Imperial Colors
    purpleImperial: '#663399',     // Tyrian purple (imperial)
    purpleDark: '#4B0082',         // Deep imperial purple
    crimsonRoman: '#DC143C',       // Roman red/crimson
    
    // Natural Pigments
    ochreYellow: '#CC7722',        // Roman ochre
    umberBurnt: '#8A4117',         // Burnt umber
    charcoal: '#36454F',           // Roman charcoal/soot
    ivory: '#FFFFF0',              // Ivory white
    
    // Accent Colors
    oliveBranch: '#808000',        // Olive green (peace symbol)
    laurelGreen: '#355E3B',        // Laurel leaf green
    
    // Text Colors
    inscriptionDark: '#2F2F2F',    // Dark text for marble
    inscriptionGold: '#B8860B',    // Gold text
    shadowDeep: 'rgba(0, 0, 0, 0.6)', // Deep shadows
    shadowSoft: 'rgba(0, 0, 0, 0.3)', // Soft shadows
  },

  // Typography - Based on Roman Trajan Column inscriptions
  typography: {
    // Font Families (using web-safe alternatives to Roman styles)
    display: '"Trajan Pro", "Cinzel", "Times New Roman", serif', // For headings
    inscription: '"Optima", "Futura", "Arial", sans-serif',      // For inscriptions
    body: '"Minion Pro", "Georgia", "Times", serif',             // For body text
    
    // Font Weights
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
      black: 900, // For carved stone effect
    },
    
    // Font Sizes (using classical proportions)
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
    
    // Letter Spacing (Roman inscriptions used generous spacing)
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.1em',
      wider: '0.15em',
      widest: '0.2em', // For inscription headers
    },
  },

  // Textures & Materials
  textures: {
    marble: {
      background: `linear-gradient(135deg, 
        #F8F6F0 0%, 
        #F5F3ED 25%, 
        #F8F6F0 50%, 
        #F2F0EA 75%, 
        #F8F6F0 100%)`,
      pattern: `radial-gradient(ellipse at top left, 
        rgba(200, 200, 200, 0.1) 0%, 
        transparent 50%),
        radial-gradient(ellipse at bottom right, 
        rgba(180, 180, 180, 0.1) 0%, 
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
        #CD7F32 0%, 
        #B8860B 25%, 
        #CD7F32 50%, 
        #8C7853 75%, 
        #CD7F32 100%)`,
    },
    
    stone: {
      background: `linear-gradient(135deg, 
        #E8E2D5 0%, 
        #D4C4A8 50%, 
        #E8E2D5 100%)`,
      texture: `radial-gradient(circle at 25% 25%, 
        rgba(0, 0, 0, 0.1) 0%, 
        transparent 50%),
        radial-gradient(circle at 75% 75%, 
        rgba(0, 0, 0, 0.05) 0%, 
        transparent 50%)`,
    },
  },

  // Shadows & Depth (Roman architecture used dramatic shadows)
  shadows: {
    carved: 'inset 2px 2px 4px rgba(0, 0, 0, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.3)',
    raised: '2px 2px 6px rgba(0, 0, 0, 0.4), -1px -1px 2px rgba(255, 255, 255, 0.3)',
    deep: '4px 8px 16px rgba(0, 0, 0, 0.6)',
    column: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 0, 0, 0.2)',
    inscription: '1px 1px 0px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
  },

  // Borders (Roman architectural elements)
  borders: {
    marble: '2px solid #E8E2D5',
    gold: '2px solid #B8860B',
    bronze: '2px solid #8C7853',
    carved: '1px solid rgba(0, 0, 0, 0.3)',
    ornate: '3px solid #B8860B, inset 0 0 0 1px #FFD700',
  },

  // Border Radius (Roman architecture favored geometric shapes)
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '50%',
    arch: '50% 50% 0 0', // Roman arch shape
  },

  // Spacing (Based on Roman proportional systems)
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
    marble: '2s', // For marble texture shifts
    shimmer: '3s', // For gold shimmer effects
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

// Roman Iconography Constants
export const RomanIcons = {
  // Gladiator Types
  gladiatorTypes: {
    murmillo: '🛡️', // Shield and sword
    retiarius: '🔱', // Trident and net
    thraex: '⚔️', // Curved sword
    secutor: '🗡️', // Straight sword
    hoplomachus: '🏹', // Spear
  },
  
  // Roman Symbols
  symbols: {
    eagle: '🦅',
    laurel: '🌿',
    spqr: 'SPQR',
    column: '🏛️',
    amphitheater: '🏟️',
    crown: '👑',
    olive: '🫒',
  },
  
  // Roman Numerals Helper
  toRomanNumeral: (num: number): string => {
    const romanNumerals = [
      { value: 1000, symbol: 'M' },
      { value: 900, symbol: 'CM' },
      { value: 500, symbol: 'D' },
      { value: 400, symbol: 'CD' },
      { value: 100, symbol: 'C' },
      { value: 90, symbol: 'XC' },
      { value: 50, symbol: 'L' },
      { value: 40, symbol: 'XL' },
      { value: 10, symbol: 'X' },
      { value: 9, symbol: 'IX' },
      { value: 5, symbol: 'V' },
      { value: 4, symbol: 'IV' },
      { value: 1, symbol: 'I' },
    ];
    
    let result = '';
    for (const { value, symbol } of romanNumerals) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  },
};

// Roman Latin Phrases
export const RomanText = {
  combat: {
    fight: 'PUGNA',
    victory: 'VICTORIA',
    defeat: 'CLADES',
    glory: 'GLORIA',
    honor: 'HONOR',
    courage: 'VIRTUS',
    strength: 'FORTITUDO',
  },
  
  general: {
    fortune: 'FORTUNA',
    destiny: 'FATUM',
    glory: 'GLORIA ET HONOR',
    greeting: 'AVE',
    farewell: 'VALE',
    senate: 'SENATUS POPULUSQUE ROMANUS',
    spqr: 'S.P.Q.R.',
  },
  
  phrases: {
    mayFortuneSmile: 'FORTUNA FAVEAT',
    toGlory: 'AD GLORIAM',
    forRome: 'PRO ROMA',
    victoryOrDeath: 'AUT VINCERE AUT MORI',
    weWhoAreAboutToDie: 'MORITURI TE SALUTANT',
    theGamesBegin: 'LUDI INCIPIUNT',
  },
};

export default RomanDesignSystem;