// Game configuration from PHASER_INTEGRATION.md  
import * as Phaser from 'phaser';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: '100%',
  height: '100%',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [], // Will be populated with scene classes
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  render: {
    pixelArt: false,
    antialias: true
  }
};

// Mobile optimization detection
export class MobileOptimizations {
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent);
  }
  
  static applyMobileSettings(game: Phaser.Game) {
    if (this.isMobile()) {
      // Reduce particle effects
      game.registry.set('particleQuality', 0.5);
      
      // Lower texture quality
      Object.values(game.textures.list).forEach((texture) => {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      });
      
      // Simplify animations
      game.anims.globalTimeScale = 0.8;
    }
  }
}