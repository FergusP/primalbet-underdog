import React, { lazy, Suspense } from 'react';
import { USE_ENHANCED_UI } from '../config/uiConfig';

// Also provide Roman alternatives for individual components
const FightButton = lazy(() => 
  USE_ENHANCED_UI
    ? import('./GameUI/RomanFightButtonWrapper').then(m => ({ default: m.RomanFightButtonWrapper }))
    : import('./GameUI/FightButton').then(m => ({ default: m.FightButton }))
);

// Lazy load components based on configuration
const MenuSceneUI = lazy(() => 
  USE_ENHANCED_UI 
    ? import('./MenuSceneUIEnhanced').then(m => ({ default: m.MenuSceneUIEnhanced }))
    : import('./MenuSceneUI').then(m => ({ default: m.MenuSceneUI }))
);

const CombatSceneUI = lazy(() => 
  USE_ENHANCED_UI
    ? import('./CombatSceneUIRoman').then(m => ({ default: m.CombatSceneUIRoman }))
    : import('./CombatSceneUI').then(m => ({ default: m.CombatSceneUI }))
);

const VaultSceneUI = lazy(() => 
  USE_ENHANCED_UI
    ? import('./VaultSceneUIEnhanced').then(m => ({ default: m.VaultSceneUIEnhanced }))
    : import('./VaultSceneUI').then(m => ({ default: m.VaultSceneUI }))
);

// Loading fallback
const UILoadingFallback = () => null;

// Export wrapped components
export const MenuUI: React.FC = () => (
  <Suspense fallback={<UILoadingFallback />}>
    <MenuSceneUI />
  </Suspense>
);

export const CombatUI: React.FC = () => (
  <Suspense fallback={<UILoadingFallback />}>
    <CombatSceneUI />
  </Suspense>
);

export const VaultUI: React.FC = () => (
  <Suspense fallback={<UILoadingFallback />}>
    <VaultSceneUI />
  </Suspense>
);

// Export Roman fight button wrapper
export const DynamicFightButton: React.FC<React.ComponentProps<typeof FightButton>> = (props) => (
  <Suspense fallback={<UILoadingFallback />}>
    <FightButton {...props} />
  </Suspense>
);