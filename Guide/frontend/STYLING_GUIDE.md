# Styling and Visual Design Guide

## Design Philosophy

Aurelius Colosseum features a dark, epic fantasy aesthetic with gold accents representing the jackpot prize. The design emphasizes clarity, readability, and mobile responsiveness while maintaining an immersive gaming atmosphere.

## Color Palette

```css
/* Core Colors */
--primary-gold: #FFD700;
--primary-gold-dark: #FFA500;
--primary-red: #DC2626;
--primary-red-dark: #991B1B;

/* Background Colors */
--bg-primary: #1a1a2e;
--bg-secondary: #0f0f23;
--bg-overlay: rgba(0, 0, 0, 0.8);
--bg-panel: rgba(17, 24, 39, 0.9);

/* Text Colors */
--text-primary: #FFFFFF;
--text-secondary: #D1D5DB;
--text-muted: #9CA3AF;
--text-gold: #FFD700;

/* Monster Tier Colors */
--monster-skeleton: #FFFFFF;
--monster-goblin: #00FF00;
--monster-minotaur: #8B4513;
--monster-hydra: #800080;
--monster-dragon: #FF0000;

/* Status Colors */
--success: #10B981;
--error: #EF4444;
--warning: #F59E0B;
--info: #3B82F6;
```

## Typography

```css
/* Font Stack */
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
--font-game: 'Arial Black', 'Arial Bold', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

## UI Layer System

```typescript
// Z-index hierarchy
const UILayer = {
  Background: 0,        // Game canvas
  HUD: 100,            // Main UI elements
  Panels: 200,         // Side panels
  Tooltips: 300,       // Hover tooltips
  Windows: 500,        // Modal windows
  Overlays: 800,       // Full-screen overlays
  Modals: 1000,        // Important modals
  Notifications: 9999  // Toast notifications
};
```

## Component Styling

### Buttons

```css
/* Primary Button (Fight Button) */
.btn-primary {
  @apply px-12 py-6 text-2xl font-bold rounded-lg;
  @apply bg-gradient-to-r from-red-600 to-red-500;
  @apply text-white shadow-lg hover:shadow-xl;
  @apply transform transition-all duration-150;
  @apply hover:scale-105 active:scale-95;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* Secondary Button */
.btn-secondary {
  @apply px-6 py-3 text-lg font-semibold rounded-lg;
  @apply bg-gray-700 hover:bg-gray-600;
  @apply text-white shadow-md;
  @apply transition-colors duration-200;
}

/* Wallet Button */
.btn-wallet {
  @apply px-6 py-3 rounded-lg font-medium;
  @apply bg-purple-600 hover:bg-purple-700;
  @apply text-white shadow-md;
  @apply transition-all duration-200;
}
```

### Panels

```css
/* Game Panel */
.game-panel {
  @apply bg-gray-900/90 p-4 rounded-lg;
  @apply border border-gray-700;
  @apply backdrop-blur-sm;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* Gold Panel (Jackpot) */
.gold-panel {
  @apply bg-gradient-to-r from-yellow-600 to-yellow-400;
  @apply px-8 py-4 rounded-lg shadow-2xl;
  @apply relative overflow-hidden;
}

.gold-panel::before {
  content: '';
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent;
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### Text Effects

```css
/* Glowing Text */
.text-glow {
  text-shadow: 
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 30px currentColor;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Epic Title */
.title-epic {
  @apply text-6xl font-bold text-yellow-400;
  text-shadow: 
    3px 3px 0 #000,
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000,
    0 0 20px rgba(255, 215, 0, 0.5);
}
```

## Responsive Design

### Breakpoints
```css
/* Tailwind default breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile Adaptations
```css
/* Mobile-first approach */
.game-ui-root {
  @apply fixed inset-0 p-2;
}

/* Tablet and up */
@screen md {
  .game-ui-root {
    @apply p-4;
  }
  
  .side-panel {
    @apply w-64;
  }
}

/* Desktop */
@screen lg {
  .game-ui-root {
    @apply p-6;
  }
  
  .side-panel {
    @apply w-80;
  }
}
```

### Touch-Friendly Elements
```css
/* Minimum touch target size: 44x44px */
.touch-target {
  @apply min-w-[44px] min-h-[44px];
  @apply flex items-center justify-center;
}

/* Increased spacing on mobile */
.mobile-spacing {
  @apply space-y-2 md:space-y-4;
}
```

## Animation Guidelines

### Transition Durations
```css
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 1000ms;
```

### Common Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Scale Bounce */
@keyframes scaleBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

/* Float */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### React Animation Utilities
```typescript
// utils/animations.ts
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  },
  
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  }
};
```

## Visual Effects

### Gradients
```css
/* Gold Gradient */
.gradient-gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

/* Dark Gradient */
.gradient-dark {
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f23 100%);
}

/* Victory Gradient */
.gradient-victory {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

/* Defeat Gradient */
.gradient-defeat {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
}
```

### Shadows
```css
/* Elevation System */
.shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
.shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
.shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.2);
.shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.3);
.shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.4);

/* Glow Shadows */
.shadow-glow-gold: 0 0 20px rgba(255, 215, 0, 0.5);
.shadow-glow-red: 0 0 20px rgba(239, 68, 68, 0.5);
.shadow-glow-green: 0 0 20px rgba(16, 185, 129, 0.5);
```

## Phaser Visual Integration

### Canvas Styling
```css
#game-container {
  @apply w-full h-full;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* Prevent mobile selection */
#game-container canvas {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
```

### Phaser Text Styles
```typescript
// game/styles/textStyles.ts
export const TextStyles = {
  title: {
    fontSize: '64px',
    fontFamily: 'Arial Black',
    color: '#FFD700',
    stroke: '#000000',
    strokeThickness: 8
  },
  
  heading: {
    fontSize: '32px',
    fontFamily: 'Arial Bold',
    color: '#FFFFFF',
    stroke: '#000000',
    strokeThickness: 4
  },
  
  body: {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#FFFFFF',
    stroke: '#000000',
    strokeThickness: 2
  },
  
  damage: {
    fontSize: '36px',
    fontFamily: 'Arial Black',
    color: '#FF0000',
    stroke: '#000000',
    strokeThickness: 4
  }
};
```

## Accessibility

### Focus Styles
```css
/* Custom focus indicator */
.focus-visible:focus {
  @apply outline-none ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900;
}

/* Skip to content link */
.skip-link {
  @apply absolute -top-10 left-0 p-2 bg-yellow-400 text-black;
  @apply focus:top-0 z-50;
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .game-panel {
    @apply border-2 border-white;
  }
  
  .btn-primary {
    @apply border-2 border-white;
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Theme Variables

```typescript
// styles/theme.ts
export const theme = {
  colors: {
    primary: {
      gold: '#FFD700',
      goldDark: '#FFA500',
      red: '#DC2626',
      redDark: '#991B1B'
    },
    
    monster: {
      skeleton: '#FFFFFF',
      goblin: '#00FF00',
      minotaur: '#8B4513',
      hydra: '#800080',
      dragon: '#FF0000'
    },
    
    status: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    }
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px'
  }
};
```

## Performance Guidelines

### CSS Optimization
1. Use CSS containment for panels
2. Minimize repaints with transform animations
3. Use will-change sparingly
4. Leverage GPU acceleration

### Image Optimization
1. Use WebP format where supported
2. Implement lazy loading for off-screen images
3. Provide multiple resolutions with srcset
4. Optimize sprite sheets

### Animation Performance
1. Prefer transform and opacity animations
2. Use CSS animations over JavaScript where possible
3. Throttle/debounce scroll handlers
4. Remove animations on low-end devices