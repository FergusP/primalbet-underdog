# Phaser Game Engine Integration

## Overview

Phaser 3.90 powers the visual combat system in Aurelius Colosseum. This document covers the integration, scene architecture, and visualization techniques used to bring blockchain combat to life.

## Game Configuration

```typescript
// game/config/gameConfig.ts
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1024,
  height: 768,
  backgroundColor: '#1a1a2e',
  scene: [PreloadScene, MenuScene, ColosseumScene, CombatScene, VaultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 640, height: 480 },
    max: { width: 1920, height: 1440 }
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  render: {
    pixelArt: false,
    antialias: true
  }
};
```

## Scene Architecture

### Scene Flow
```
PreloadScene (Asset Loading)
    ↓
MenuScene (Wallet Connect + Entry)
    ↓
ColosseumScene (Main Hub)
    ↓ ↑
CombatScene (Battle Visualization)
    ↓
VaultScene (Jackpot Attempt)
```

### Base Scene Pattern
```typescript
// scenes/BaseScene.ts
export abstract class BaseScene extends Phaser.Scene {
  protected fadeIn(duration: number = 300): void {
    this.cameras.main.fadeIn(duration, 0, 0, 0);
  }

  protected fadeOut(duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      this.cameras.main.fadeOut(duration, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', resolve);
    });
  }

  protected createBackground(key: string): void {
    const bg = this.add.image(0, 0, key).setOrigin(0, 0);
    bg.setDisplaySize(this.scale.width, this.scale.height);
  }

  protected setupReactBridge(): void {
    // Listen for React events
    window.addEventListener('sceneCommand', this.handleSceneCommand.bind(this));
  }

  abstract handleSceneCommand(event: CustomEvent): void;
}
```

## Scene Implementations

### 1. PreloadScene
```typescript
export class PreloadScene extends BaseScene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Create loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });

    // Load assets
    this.loadAssets();
  }

  private loadAssets(): void {
    // Backgrounds
    this.load.image('colosseum-bg', 'assets/backgrounds/colosseum.jpg');
    this.load.image('combat-bg', 'assets/backgrounds/arena.jpg');
    this.load.image('vault-bg', 'assets/backgrounds/vault.jpg');

    // UI Elements
    this.load.image('button-normal', 'assets/ui/button.png');
    this.load.image('health-bar-bg', 'assets/ui/health-bar-bg.png');
    this.load.image('health-bar-fill', 'assets/ui/health-bar-fill.png');

    // Create placeholder sprites for monsters
    this.createPlaceholderSprites();

    // Audio
    this.load.audio('menu-music', 'assets/audio/menu.mp3');
    this.load.audio('combat-music', 'assets/audio/combat.mp3');
    this.load.audio('victory', 'assets/audio/victory.mp3');
    this.load.audio('defeat', 'assets/audio/defeat.mp3');
  }

  private createPlaceholderSprites(): void {
    const monsters = [
      { key: 'skeleton', color: 0xFFFFFF, size: 80 },
      { key: 'goblin', color: 0x00FF00, size: 90 },
      { key: 'minotaur', color: 0x8B4513, size: 120 },
      { key: 'hydra', color: 0x800080, size: 140 },
      { key: 'dragon', color: 0xFF0000, size: 160 }
    ];

    monsters.forEach(({ key, color, size }) => {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(color, 1);
      graphics.fillCircle(size / 2, size / 2, size / 2);
      graphics.generateTexture(key, size, size);
      graphics.destroy();
    });

    // Gladiator placeholder
    const gladiator = this.make.graphics({ x: 0, y: 0 }, false);
    gladiator.fillStyle(0xFFD700, 1);
    gladiator.fillCircle(50, 50, 50);
    gladiator.generateTexture('gladiator', 100, 100);
    gladiator.destroy();
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
```

### 2. MenuScene
```typescript
export class MenuScene extends BaseScene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.createBackground('colosseum-bg');
    this.fadeIn();

    // Title text with gradient
    const title = this.add.text(
      this.scale.width / 2, 
      150, 
      'AURELIUS COLOSSEUM',
      {
        fontSize: '64px',
        fontFamily: 'Arial Black',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 8
      }
    ).setOrigin(0.5);

    // Add glow effect
    this.tweens.add({
      targets: title,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // Emit scene ready event
    window.dispatchEvent(new CustomEvent('sceneReady', { 
      detail: { scene: 'MenuScene' } 
    }));

    // Listen for wallet connection
    window.addEventListener('walletConnected', this.onWalletConnected.bind(this));
  }

  private onWalletConnected = async (event: Event) => {
    await this.fadeOut();
    this.scene.start('ColosseumScene');
  };
}
```

### 3. CombatScene
```typescript
export class CombatScene extends BaseScene {
  private gladiator!: Phaser.GameObjects.Sprite;
  private monster!: Phaser.GameObjects.Sprite;
  private combatResult!: CombatResult;

  init(data: { combatResult: CombatResult; monster: string }): void {
    this.combatResult = data.combatResult;
  }

  create(): void {
    this.createBackground('combat-bg');
    this.setupCombatants();
    this.startCombatSequence();
  }

  private setupCombatants(): void {
    // Create gladiator
    this.gladiator = this.add.sprite(200, 400, 'gladiator');
    this.gladiator.setScale(1.5);

    // Create monster based on type
    const monsterKey = this.getMonsterKey(this.combatResult.monster);
    this.monster = this.add.sprite(700, 400, monsterKey);
    this.monster.setScale(2);

    // Add health bars
    this.createHealthBar(this.gladiator, 100);
    this.createHealthBar(this.monster, 100);
  }

  private async startCombatSequence(): Promise<void> {
    // Play combat music
    this.sound.play('combat-music', { loop: true, volume: 0.5 });

    // Entry animations
    await this.animateEntry();

    // Combat exchanges
    const exchanges = this.generateCombatExchanges();
    for (const exchange of exchanges) {
      await this.performExchange(exchange);
    }

    // Final result
    if (this.combatResult.victory) {
      await this.showVictory();
    } else {
      await this.showDefeat();
    }
  }

  private generateCombatExchanges(): CombatExchange[] {
    // Create believable combat flow leading to predetermined result
    const exchanges: CombatExchange[] = [];
    const totalExchanges = 5 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < totalExchanges; i++) {
      exchanges.push({
        attacker: i % 2 === 0 ? 'gladiator' : 'monster',
        damage: 10 + Math.floor(Math.random() * 20),
        critical: Math.random() > 0.8
      });
    }

    return exchanges;
  }

  private async performExchange(exchange: CombatExchange): Promise<void> {
    const attacker = exchange.attacker === 'gladiator' ? this.gladiator : this.monster;
    const defender = exchange.attacker === 'gladiator' ? this.monster : this.gladiator;

    // Attack animation
    await this.tweenPromise({
      targets: attacker,
      x: attacker === this.gladiator ? 300 : 600,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.createHitEffect(defender.x, defender.y);
        this.showDamageNumber(defender.x, defender.y - 50, exchange.damage);
      }
    });

    // Flash on hit
    this.tweens.add({
      targets: defender,
      tint: 0xff0000,
      duration: 100,
      yoyo: true
    });

    await this.delay(500);
  }

  private createHitEffect(x: number, y: number): void {
    const emitter = this.add.particles(x, y, 'spark', {
      speed: { min: 100, max: 300 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      quantity: 10
    });

    this.time.delayedCall(500, () => emitter.destroy());
  }
}
```

### 4. VaultScene
```typescript
export class VaultScene extends BaseScene {
  private vault!: Phaser.GameObjects.Sprite;
  private vaultResult!: VaultCrackResult;

  create(): void {
    this.createBackground('vault-bg');
    this.createVault();
    this.attemptVaultCrack();
  }

  private createVault(): void {
    this.vault = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'vault');
    this.vault.setScale(2);

    // Add glow effect
    const glowFx = this.vault.postFX.addGlow(0xFFD700, 4, 0, false, 0.1, 32);
    
    this.tweens.add({
      targets: glowFx,
      outerStrength: 4,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  private async attemptVaultCrack(): Promise<void> {
    // Show crack chance
    const chanceText = this.add.text(
      this.scale.width / 2,
      100,
      `Vault Crack Chance: ${this.vaultResult.crackChance}%`,
      { fontSize: '32px', color: '#FFD700' }
    ).setOrigin(0.5);

    // Build suspense
    await this.delay(2000);

    // Roll animation
    const roll = await this.showDiceRoll();

    if (this.vaultResult.success) {
      await this.vaultCrackSuccess();
    } else {
      await this.vaultCrackFailed();
    }
  }

  private async vaultCrackSuccess(): Promise<void> {
    // Crack open animation
    this.tweens.add({
      targets: this.vault,
      scaleX: 2.5,
      angle: 15,
      duration: 500,
      ease: 'Bounce.easeOut'
    });

    // Gold explosion
    const emitter = this.add.particles(0, 0, 'gold', {
      x: this.scale.width / 2,
      y: this.scale.height / 2,
      speed: { min: 200, max: 600 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 2000,
      quantity: 50,
      gravityY: 200
    });

    // Victory sound
    this.sound.play('jackpot', { volume: 0.8 });

    // Show winnings
    const winText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 100,
      `YOU WON ${this.vaultResult.amount} SOL!`,
      { fontSize: '48px', color: '#FFD700' }
    ).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: winText,
      scale: 1,
      duration: 1000,
      ease: 'Bounce.easeOut'
    });
  }
}
```

## Mobile Optimizations

```typescript
// game/utils/mobileOptimizations.ts
export class MobileOptimizations {
  static apply(game: Phaser.Game): void {
    if (!this.isMobile()) return;

    // Reduce particle density
    game.registry.set('particleMultiplier', 0.5);

    // Lower texture quality for performance
    game.renderer.setPixelArt(true);

    // Reduce target FPS
    game.config.fps = { target: 30 };

    // Simplify shaders
    game.renderer.pipelines.remove('CustomPipeline');
  }

  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
}
```

## Performance Monitoring

```typescript
// game/utils/performanceMonitor.ts
export class PerformanceMonitor {
  private scene: Phaser.Scene;
  private fpsText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createDebugDisplay();
  }

  private createDebugDisplay(): void {
    if (process.env.NODE_ENV !== 'development') return;

    this.fpsText = this.scene.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#00FF00'
    }).setScrollFactor(0).setDepth(9999);

    this.scene.events.on('update', this.update, this);
  }

  private update(): void {
    const fps = Math.round(this.scene.game.loop.actualFps);
    const drawCalls = (this.scene.game.renderer as any).drawCount;
    
    this.fpsText.setText([
      `FPS: ${fps}`,
      `Draw Calls: ${drawCalls}`,
      `Objects: ${this.scene.children.length}`
    ]);
  }
}
```

## Asset Management

### Texture Atlases
```typescript
// Combine multiple sprites into atlases
this.load.atlas('combat-sprites', 'combat.png', 'combat.json');
this.load.atlas('ui-elements', 'ui.png', 'ui.json');
```

### Audio Sprites
```typescript
// Combine sound effects
this.load.audioSprite('combat-sounds', 
  ['combat.mp3', 'combat.ogg'], 
  'combat-audio.json'
);
```

### Dynamic Loading
```typescript
// Load assets on demand
async loadMonsterAssets(monsterType: string): Promise<void> {
  return new Promise((resolve) => {
    this.load.atlas(monsterType, `${monsterType}.png`, `${monsterType}.json`);
    this.load.once('complete', resolve);
    this.load.start();
  });
}
```

## Integration Points

### React → Phaser Events
- `startCombat`: Initiate combat with selected monster
- `walletConnected`: Proceed from menu
- `devMonsterSelect`: Change monster in dev mode

### Phaser → React Events
- `sceneReady`: Scene loaded and ready
- `combatComplete`: Battle finished with results
- `gameStateUpdate`: Jackpot or stats changed
- `monsterPositionUpdate`: For UI label positioning