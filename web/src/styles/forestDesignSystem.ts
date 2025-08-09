// Forest Design System for BetBeast
// Dark forest theme with mystical elements and beast combat atmosphere

export const ForestDesignSystem = {
  // Color Palette - Dark forest with gold accents for rewards
  colors: {
    // Primary Forest Colors
    darkBark: '#3E2723',           // Deep brown bark
    forestGreen: '#0B3D0B',        // Deep forest green
    mossGreen: '#4A5D23',          // Moss on trees
    shadowBlack: '#1C1C1C',        // Deep shadows
    
    // Accent Colors - Keeping gold for rewards
    goldShine: '#FFD700',          // Pure gold (KEPT for rewards/jackpots)
    goldAntique: '#B8860B',        // Aged gold
    goldDeep: '#DAA520',           // Rich gold
    emeraldGlow: '#50C878',        // Mystical emerald
    
    // Combat Colors
    bloodRed: '#8B0000',           // Dark blood red
    crimsonFire: '#DC143C',        // Bright combat red
    dangerOrange: '#FF6B35',       // Warning/danger
    
    // Nature Colors
    autumnOrange: '#D2691E',       // Fall leaves
    moonSilver: '#C0C0C0',         // Moonlight
    mistGray: '#778899',           // Forest mist
    stoneGray: '#5D6D7E',          // Rock/stone
    
    // Mystical Colors
    mysticPurple: '#6B46C1',       // Magic effects
    nightBlue: '#191970',          // Night sky
    spiritCyan: '#00CED1',         // Spirit energy
    
    // Text Colors
    textLight: '#F5F5F5',          // Light text
    textDark: '#2F2F2F',           // Dark text
    textGold: '#B8860B',           // Gold text
    shadowDeep: 'rgba(0, 0, 0, 0.8)', // Deep shadows
    shadowSoft: 'rgba(0, 0, 0, 0.4)', // Soft shadows
  },

  // Typography - Rugged fantasy fonts
  typography: {
    // Font Families
    display: '"MedievalSharp", "Cinzel", "Georgia", serif',      // Headers
    body: '"Merriweather", "Crimson Text", "Georgia", serif',    // Body text
    accent: '"UnifrakturMaguntia", "Luminari", "Fantasy"',       // Special text
    
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

  // Textures & Materials
  textures: {
    wood: {
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
    
    goldShimmer: {
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
    
    moss: {
      background: `linear-gradient(135deg, 
        #4A5D23 0%, 
        #556B2F 25%, 
        #4A5D23 50%, 
        #6B8E23 75%, 
        #4A5D23 100%)`,
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
    
    mist: {
      background: `linear-gradient(180deg,
        rgba(119, 136, 153, 0.1) 0%,
        rgba(119, 136, 153, 0.3) 50%,
        rgba(119, 136, 153, 0.1) 100%)`,
    },
  },

  // Shadows & Depth
  shadows: {
    carved: 'inset 2px 2px 4px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.1)',
    raised: '2px 2px 8px rgba(0, 0, 0, 0.6), -1px -1px 2px rgba(255, 255, 255, 0.1)',
    deep: '4px 8px 16px rgba(0, 0, 0, 0.8)',
    tree: '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 0, 0, 0.4)',
    glow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
    mystical: '0 0 30px rgba(107, 70, 193, 0.5), 0 0 60px rgba(107, 70, 193, 0.3)',
    fire: '0 0 20px rgba(220, 20, 60, 0.6), 0 0 40px rgba(255, 69, 0, 0.4)',
  },

  // Borders
  borders: {
    wood: '2px solid #5D4037',
    gold: '2px solid #B8860B',
    stone: '2px solid #5D6D7E',
    moss: '2px solid #4A5D23',
    mystical: '2px solid #6B46C1',
    fire: '2px solid #DC143C',
    ornate: '3px solid #B8860B, inset 0 0 0 1px #FFD700',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '50%',
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
    mystic: '2s',  // For mystical effects
    shimmer: '3s', // For gold shimmer
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

// Forest Icons and Symbols
export const ForestIcons = {
  // Beast Types
  beastTypes: {
    wolf: '🐺',
    bear: '🐻',
    boar: '🐗',
    owl: '🦉',
    raven: '🐦‍⬛',
  },
  
  // Forest Symbols
  symbols: {
    tree: '🌲',
    skull: '💀',
    moon: '🌙',
    fire: '🔥',
    crossed_swords: '⚔️',
    treasure: '💰',
    potion: '🧪',
    crystal: '💎',
  },
  
  // Combat Icons
  combat: {
    sword: '🗡️',
    axe: '🪓',
    bow: '🏹',
    shield: '🛡️',
    blood: '🩸',
  },
  
  // Reward Icons  
  rewards: {
    gold: '🪙',
    crown: '👑',
    trophy: '🏆',
    chest: '🎁',
  },
};

// Forest Battle Text
export const ForestText = {
  combat: {
    fight: 'FIGHT',
    victory: 'VICTORY',
    defeat: 'DEFEATED',
    critical: 'CRITICAL HIT',
    dodge: 'DODGED',
    block: 'BLOCKED',
    rage: 'BEAST RAGE',
  },
  
  actions: {
    hunt: 'ENTER THE HUNT',
    battle: 'BATTLE THE BEAST',
    claim: 'CLAIM THE BOUNTY',
    flee: 'FLEE THE FOREST',
    continue: 'VENTURE DEEPER',
    pool: 'JOIN FOMO POOL',
  },
  
  general: {
    welcome: 'Welcome, Hunter',
    farewell: 'Until next hunt',
    danger: 'DANGER AHEAD',
    treasure: 'TREASURE FOUND',
    level_up: 'POWER INCREASED',
    low_health: 'WOUNDED',
  },
  
  phrases: {
    battleCry: 'For glory and gold!',
    victory: 'The beast falls!',
    defeat: 'The forest claims another...',
    taunt: 'Face your doom!',
    poolCall: 'The FOMO pool grows!',
    jackpot: 'JACKPOT UNLEASHED!',
  },
};

export default ForestDesignSystem;