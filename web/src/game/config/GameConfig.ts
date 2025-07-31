// Game configuration from PHASER_INTEGRATION.md  
import * as Phaser from 'phaser';

// Fixed game dimensions
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#2a1f1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
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