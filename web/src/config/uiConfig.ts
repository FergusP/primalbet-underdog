// UI Configuration
// Set this to true to use the enhanced UI components
export const USE_ENHANCED_UI = true;

// Component mappings
export const UI_COMPONENTS = {
  MenuSceneUI: USE_ENHANCED_UI
    ? () =>
        import('../components/MenuSceneUIEnhanced').then(
          (m) => m.MenuSceneUIEnhanced
        )
    : () => import('../components/MenuSceneUI').then((m) => m.MenuSceneUI),

  CombatSceneUI: USE_ENHANCED_UI
    ? () =>
        import('../components/CombatSceneUIEnhanced').then(
          (m) => m.CombatSceneUIEnhanced
        )
    : () => import('../components/CombatSceneUI').then((m) => m.CombatSceneUI),
};

// UI Theme Configuration
export const UI_THEME = {
  colors: {
    primary: USE_ENHANCED_UI ? 'var(--color-gold)' : '#ffd700',
    secondary: USE_ENHANCED_UI ? 'var(--color-blood)' : '#ff6600',
    background: USE_ENHANCED_UI ? 'var(--background)' : '#000000',
    surface: USE_ENHANCED_UI ? 'var(--surface)' : '#1a1a1a',
  },
  fonts: {
    display: USE_ENHANCED_UI ? 'var(--font-display)' : 'Arial, sans-serif',
    body: USE_ENHANCED_UI ? 'var(--font-body)' : 'Arial, sans-serif',
  },
  animations: {
    enabled: USE_ENHANCED_UI,
    duration: USE_ENHANCED_UI ? '0.3s' : '0.2s',
  },
};
