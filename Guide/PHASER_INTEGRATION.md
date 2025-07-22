# **PHASER INTEGRATION GUIDE**
*Monster Combat Visualization for Aurelius Colosseum*

## **🎮 Overview**

This guide covers Phaser.js integration for visualizing monster combat in Aurelius Colosseum. All combat outcomes are predetermined by VRF on the backend - Phaser only provides engaging visual representation.

---

## **📁 Project Structure**

```
web/src/game/
├── scenes/
│   ├── PreloadScene.ts      # Asset loading
│   ├── MenuScene.ts         # Main menu & wallet connect
│   ├── ColosseumScene.ts    # Main game view
│   ├── CombatScene.ts       # Combat visualization
│   └── VaultScene.ts        # Vault crack attempt
├── objects/
│   ├── Gladiator.ts         # Player character
│   ├── Monster.ts           # Monster base class
│   ├── monsters/            # Individual monster classes
│   │   ├── Skeleton.ts
│   │   ├── Goblin.ts
│   │   ├── Minotaur.ts
│   │   ├── Hydra.ts
│   │   ├── Dragon.ts
│   │   └── Titan.ts
│   └── Vault.ts             # Treasure vault
├── effects/
│   ├── CombatEffects.ts     # Hit, slash, magic effects
│   ├── VaultEffects.ts      # Glow, crack, explosion
│   └── ParticleEffects.ts   # General particles
├── ui/
│   ├── JackpotDisplay.ts    # Live jackpot counter
│   ├── MonsterInfo.ts       # Current monster panel
│   ├── CombatLog.ts         # Combat event display
│   └── EntryButton.ts       # Fight button component
├── config/
│   ├── GameConfig.ts        # Phaser configuration
│   └── AssetManifest.ts     # Asset definitions
└── Game.ts                  # Main game instance
```

---

## **🎬 Scene Flow**

```typescript
// Scene navigation flow
PreloadScene → MenuScene → ColosseumScene ↔ CombatScene → VaultScene
                              ↑                               ↓
                              ←───────────────────────────────←
```

---

## **⚔️ Combat Visualization**

### **1. Combat Scene Setup**

```typescript
// scenes/CombatScene.ts
import { Scene } from 'phaser';
import { Gladiator } from '../objects/Gladiator';
import { Monster } from '../objects/Monster';
import { CombatResult } from '@aurelius/shared-types';

export class CombatScene extends Scene {
  private gladiator!: Gladiator;
  private monster!: Monster;
  private combatResult!: CombatResult;
  private background!: Phaser.GameObjects.Image;
  
  constructor() {
    super({ key: 'CombatScene' });
  }
  
  init(data: { combatResult: CombatResult; monster: any }) {
    this.combatResult = data.combatResult;
  }
  
  create() {
    // Arena background
    this.background = this.add.image(0, 0, 'arena-bg').setOrigin(0);
    
    // Create gladiator
    this.gladiator = new Gladiator(this, 200, 400);
    
    // Create appropriate monster
    const MonsterClass = this.getMonsterClass(this.combatResult.monster);
    this.monster = new MonsterClass(this, 600, 400);
    
    // Start combat sequence
    this.startCombatSequence();
  }
  
  private async startCombatSequence() {
    // Entry animations
    await this.gladiator.enterArena();
    await this.monster.roar();
    
    // Pre-determined combat visualization
    await this.visualizeCombat();
    
    // Show result
    if (this.combatResult.victory) {
      await this.showVictory();
      this.scene.start('VaultScene', { 
        combatResult: this.combatResult 
      });
    } else {
      await this.showDefeat();
      this.scene.start('ColosseumScene');
    }
  }
  
  private async visualizeCombat() {
    // Calculate visual HP decrements
    const totalDuration = 10000; // 10 seconds of combat
    const exchanges = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < exchanges; i++) {
      // Gladiator attacks
      await this.gladiator.attack(this.monster);
      this.createHitEffect(this.monster.x, this.monster.y);
      this.monster.takeDamage(this.getFakeVisualDamage());
      
      // Monster counter-attacks
      await this.monster.attack(this.gladiator);
      this.createHitEffect(this.gladiator.x, this.gladiator.y);
      this.gladiator.takeDamage(this.getFakeVisualDamage());
      
      // Pause between exchanges
      await this.delay(totalDuration / exchanges);
    }
    
    // Final blow
    if (this.combatResult.victory) {
      await this.gladiator.performFinisher(this.monster);
      await this.monster.die();
    } else {
      await this.monster.performFinisher(this.gladiator);
      await this.gladiator.die();
    }
  }
  
  private getFakeVisualDamage(): number {
    // Random damage for visual appeal only
    return 10 + Math.floor(Math.random() * 20);
  }
}
```

### **2. Monster Base Class**

```typescript
// objects/Monster.ts
export abstract class Monster extends Phaser.GameObjects.Container {
  protected sprite: Phaser.GameObjects.Sprite;
  protected healthBar: Phaser.GameObjects.Graphics;
  protected maxHealth: number;
  protected currentHealth: number;
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, maxHealth: number) {
    super(scene, x, y);
    
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    
    // Create sprite
    this.sprite = scene.add.sprite(0, 0, texture);
    this.add(this.sprite);
    
    // Create health bar
    this.createHealthBar();
    
    // Add to scene
    scene.add.existing(this);
    
    // Setup animations
    this.setupAnimations();
  }
  
  protected abstract setupAnimations(): void;
  
  async roar(): Promise<void> {
    this.sprite.play(`${this.texture.key}_roar`);
    this.scene.sound.play(`${this.texture.key}_roar_sound`);
    await this.delay(1000);
  }
  
  async attack(target: Phaser.GameObjects.Container): Promise<void> {
    // Move towards target
    await this.tweenTo(target.x - 100, this.y, 300);
    
    // Play attack animation
    this.sprite.play(`${this.texture.key}_attack`);
    this.scene.sound.play('monster_attack');
    
    // Move back
    await this.tweenTo(this.x + 100, this.y, 300);
  }
  
  takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.updateHealthBar();
    
    // Flash red
    this.scene.tweens.add({
      targets: this.sprite,
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
    
    // Damage number
    this.showDamageNumber(amount);
  }
  
  async die(): Promise<void> {
    this.sprite.play(`${this.texture.key}_death`);
    this.scene.sound.play('monster_death');
    
    await this.delay(2000);
    
    // Fade out
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1000
    });
  }
}
```

### **3. Individual Monster Classes**

```typescript
// objects/monsters/Dragon.ts
import { Monster } from '../Monster';

export class Dragon extends Monster {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'dragon', 1500);
    this.setScale(2);
  }
  
  protected setupAnimations(): void {
    // Define dragon-specific animations
    this.scene.anims.create({
      key: 'dragon_idle',
      frames: this.scene.anims.generateFrameNumbers('dragon', { 
        start: 0, 
        end: 7 
      }),
      frameRate: 8,
      repeat: -1
    });
    
    this.scene.anims.create({
      key: 'dragon_attack',
      frames: this.scene.anims.generateFrameNumbers('dragon', { 
        start: 8, 
        end: 15 
      }),
      frameRate: 12,
      repeat: 0
    });
    
    this.scene.anims.create({
      key: 'dragon_death',
      frames: this.scene.anims.generateFrameNumbers('dragon', { 
        start: 16, 
        end: 23 
      }),
      frameRate: 8,
      repeat: 0
    });
    
    // Start idle
    this.sprite.play('dragon_idle');
  }
  
  async attack(target: Phaser.GameObjects.Container): Promise<void> {
    // Dragon breathes fire instead of melee
    this.sprite.play('dragon_attack');
    
    // Create fire breath effect
    const fire = this.scene.add.sprite(this.x, this.y, 'fire_breath');
    fire.play('fire_breath_anim');
    
    // Move fire towards target
    this.scene.tweens.add({
      targets: fire,
      x: target.x,
      y: target.y,
      duration: 500,
      onComplete: () => fire.destroy()
    });
    
    this.scene.sound.play('dragon_breath');
    await this.delay(1000);
  }
}
```

---

## **🏆 Vault Crack Visualization**

```typescript
// scenes/VaultScene.ts
export class VaultScene extends Scene {
  private vault!: Vault;
  private gladiator!: Phaser.GameObjects.Sprite;
  private vaultResult?: VaultCrackResult;
  
  create() {
    // Create vault
    this.vault = new Vault(this, 400, 300);
    
    // Create gladiator
    this.gladiator = this.add.sprite(400, 500, 'gladiator');
    
    // Get vault result from backend
    this.attemptVaultCrack();
  }
  
  private async attemptVaultCrack() {
    // Show crack chance
    const chanceText = this.add.text(400, 200, 
      `Vault Crack Chance: ${this.vaultResult.crackChance}%`,
      { fontSize: '24px', color: '#ffffff' }
    ).setOrigin(0.5);
    
    // Build suspense
    await this.vault.startGlowing();
    await this.delay(2000);
    
    // Show dice roll animation
    await this.showDiceRoll(this.vaultResult.roll);
    
    if (this.vaultResult.success) {
      await this.showJackpotWin();
    } else {
      await this.showVaultFailure();
    }
  }
  
  private async showJackpotWin() {
    // Vault cracks open
    await this.vault.crackOpen();
    
    // Gold explosion
    this.createGoldExplosion();
    
    // Victory fanfare
    this.sound.play('jackpot_win');
    
    // Show winnings
    const winText = this.add.text(400, 300,
      `YOU WON ${this.vaultResult.prizeWon / 1e9} SOL!`,
      { fontSize: '48px', color: '#ffd700' }
    ).setOrigin(0.5).setScale(0);
    
    this.tweens.add({
      targets: winText,
      scale: 1,
      duration: 1000,
      ease: 'Bounce.easeOut'
    });
  }
  
  private createGoldExplosion() {
    const emitter = this.add.particles('gold_coin').createEmitter({
      x: 400,
      y: 300,
      speed: { min: 200, max: 600 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 2000,
      quantity: 50
    });
    
    this.time.delayedCall(2000, () => emitter.stop());
  }
}
```

---

## **💫 Visual Effects**

### **1. Combat Effects**

```typescript
// effects/CombatEffects.ts
export class CombatEffects {
  static createHitEffect(scene: Phaser.Scene, x: number, y: number) {
    // Impact sprite
    const impact = scene.add.sprite(x, y, 'impact');
    impact.play('impact_anim');
    impact.once('animationcomplete', () => impact.destroy());
    
    // Particle burst
    const particles = scene.add.particles('spark');
    const emitter = particles.createEmitter({
      x: x,
      y: y,
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      quantity: 10
    });
    
    scene.time.delayedCall(300, () => particles.destroy());
  }
  
  static createDamageNumber(scene: Phaser.Scene, x: number, y: number, damage: number) {
    const text = scene.add.text(x, y, `-${damage}`, {
      fontSize: '32px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 4
    });
    
    scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }
}
```

### **2. UI Components**

```typescript
// ui/JackpotDisplay.ts
export class JackpotDisplay extends Phaser.GameObjects.Container {
  private jackpotText: Phaser.GameObjects.Text;
  private currentAmount: number = 0;
  private targetAmount: number = 0;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    
    // Background
    const bg = scene.add.nineslice(0, 0, 'ui_panel', 0, 300, 80, 20, 20, 20, 20);
    this.add(bg);
    
    // Title
    const title = scene.add.text(0, -20, 'JACKPOT', {
      fontSize: '24px',
      color: '#ffd700'
    }).setOrigin(0.5);
    this.add(title);
    
    // Amount
    this.jackpotText = scene.add.text(0, 10, '0 SOL', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(this.jackpotText);
    
    scene.add.existing(this);
    
    // Start polling for updates
    this.startPolling();
  }
  
  private startPolling() {
    // Poll backend every 2 seconds
    this.scene.time.addEvent({
      delay: 2000,
      callback: this.updateJackpot,
      callbackScope: this,
      loop: true
    });
  }
  
  private async updateJackpot() {
    const response = await fetch('/api/state');
    const data = await response.json();
    
    this.targetAmount = data.currentJackpot / 1e9; // Convert to SOL
    
    // Animate counter
    this.scene.tweens.add({
      targets: this,
      currentAmount: this.targetAmount,
      duration: 1000,
      onUpdate: () => {
        this.jackpotText.setText(`${this.currentAmount.toFixed(3)} SOL`);
      }
    });
  }
}
```

---

## **🎮 Game Configuration**

```typescript
// config/GameConfig.ts
import Phaser from 'phaser';
import { PreloadScene } from '../scenes/PreloadScene';
import { MenuScene } from '../scenes/MenuScene';
import { ColosseumScene } from '../scenes/ColosseumScene';
import { CombatScene } from '../scenes/CombatScene';
import { VaultScene } from '../scenes/VaultScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1024,
  height: 768,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 640,
      height: 480
    },
    max: {
      width: 1920,
      height: 1440
    }
  },
  scene: [
    PreloadScene,
    MenuScene,
    ColosseumScene,
    CombatScene,
    VaultScene
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  render: {
    pixelArt: false,
    antialias: true
  }
};
```

---

## **📦 Asset Loading**

```typescript
// scenes/PreloadScene.ts
export class PreloadScene extends Scene {
  preload() {
    // UI elements
    this.load.image('arena-bg', 'assets/backgrounds/arena.png');
    this.load.image('ui_panel', 'assets/ui/panel.png');
    this.load.image('gold_coin', 'assets/particles/coin.png');
    
    // Gladiator
    this.load.spritesheet('gladiator', 'assets/sprites/gladiator.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    // Monsters
    this.load.spritesheet('skeleton', 'assets/sprites/skeleton.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    this.load.spritesheet('dragon', 'assets/sprites/dragon.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    
    // Effects
    this.load.spritesheet('impact', 'assets/effects/impact.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    // Audio
    this.load.audio('combat_music', 'assets/audio/combat.mp3');
    this.load.audio('monster_roar', 'assets/audio/roar.mp3');
    this.load.audio('sword_hit', 'assets/audio/hit.mp3');
    this.load.audio('jackpot_win', 'assets/audio/fanfare.mp3');
  }
  
  create() {
    // Create all animations
    this.createAnimations();
    
    // Start menu
    this.scene.start('MenuScene');
  }
}
```

---

## **📱 Mobile Optimizations**

```typescript
// Detect mobile and adjust
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
      game.textures.list.forEach((texture) => {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      });
      
      // Simplify animations
      game.anims.globalTimeScale = 0.8;
    }
  }
}
```

---

## **🔗 Integration with Backend**

```typescript
// Integration service
export class GameService {
  static async enterCombat(wallet: string, txSignature: string): Promise<any> {
    const response = await fetch('/api/combat/enter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet,
        txSignature,
        combatId: this.generateCombatId()
      })
    });
    
    return response.json();
  }
  
  static generateCombatId(): string {
    return `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

*This guide provides a complete Phaser.js implementation for visualizing the Aurelius Colosseum monster combat system.*