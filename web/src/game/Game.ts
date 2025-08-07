// Main Game class - entry point for Phaser game
import * as Phaser from 'phaser';
import { gameConfig, MobileOptimizations } from './config/GameConfig';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { LobbyScene } from './scenes/LobbyScene';
import { CombatScene } from './scenes/CombatScene';
import { VaultScene } from './scenes/VaultScene';

export class AureliusGame {
  private game: Phaser.Game | null = null;

  constructor() {
    // Add scenes to config
    gameConfig.scene = [
      PreloadScene,
      MenuScene, 
      LobbyScene,
      CombatScene,
      VaultScene
    ];
  }

  public init(containerId: string): Phaser.Game {
    if (this.game) {
      this.destroy();
    }

    // Clean up any existing canvas elements in the container
    const container = document.getElementById(containerId);
    if (container) {
      const existingCanvas = container.querySelector('canvas');
      if (existingCanvas) {
        existingCanvas.remove();
      }
    }

    // Update container ID
    gameConfig.parent = containerId;

    // Create game instance
    this.game = new Phaser.Game(gameConfig);

    // Apply mobile optimizations if needed
    MobileOptimizations.applyMobileSettings(this.game);

    // Set up global event handlers for React integration
    this.setupGlobalEventHandlers();

    return this.game;
  }

  private setupGlobalEventHandlers() {
    if (!this.game) return;

    // Handle combat completion from React
    window.addEventListener('combatComplete', ((event: CustomEvent) => {
      const lobbyScene = this.game?.scene.getScene('LobbyScene') as LobbyScene;
      if (lobbyScene && lobbyScene.scene.isActive()) {
        lobbyScene.processCombat(event.detail.txSignature, event.detail.combatId);
      }
    }) as EventListener);

    // Handle wallet state changes
    window.addEventListener('walletStateChanged', ((event: CustomEvent) => {
      // Can be used to pause/resume game or update UI based on wallet state
      console.log('Wallet state changed:', event.detail);
    }) as EventListener);
  }

  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  public getGame(): Phaser.Game | null {
    return this.game;
  }

  // Utility methods for React integration
  public pauseGame(): void {
    if (this.game) {
      this.game.scene.getScenes(true).forEach(scene => {
        if (scene.scene.isActive()) {
          scene.scene.pause();
        }
      });
    }
  }

  public resumeGame(): void {
    if (this.game) {
      this.game.scene.getScenes(true).forEach(scene => {
        if (scene.scene.isPaused()) {
          scene.scene.resume();
        }
      });
    }
  }

  public getCurrentScene(): string | null {
    if (!this.game) return null;

    const activeScenes = this.game.scene.getScenes(true).filter(scene => scene.scene.isActive());
    return activeScenes.length > 0 ? activeScenes[0].scene.key : null;
  }

  // Development helpers
  public getSceneManager(): Phaser.Scenes.SceneManager | null {
    return this.game?.scene || null;
  }

  public isGameReady(): boolean {
    return this.game !== null && this.game.isRunning;
  }
}