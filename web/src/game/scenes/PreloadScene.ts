// PreloadScene from PHASER_INTEGRATION.md
import { Scene } from 'phaser';

export class PreloadScene extends Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Load assets without showing loading screen
    // UI elements
    this.load.image('arena-bg', '/assets/backgrounds/arena.png');
    this.load.image('ui_panel', '/assets/ui/panel.png');
    this.load.image('gold_coin', '/assets/particles/coin.png');
    this.load.image('vault_closed', '/assets/sprites/vault_closed.png');
    this.load.image('vault_open', '/assets/sprites/vault_open.png');
    
    // Gladiator
    this.load.spritesheet('gladiator', '/assets/sprites/gladiator.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    // Monsters - following the 6 tier system from guide
    this.load.spritesheet('skeleton', '/assets/sprites/skeleton.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    this.load.spritesheet('goblin', '/assets/sprites/goblin.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    this.load.spritesheet('minotaur', '/assets/sprites/minotaur.png', {
      frameWidth: 96,
      frameHeight: 96
    });
    
    this.load.spritesheet('hydra', '/assets/sprites/hydra.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    
    this.load.spritesheet('dragon', '/assets/sprites/dragon.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    
    this.load.spritesheet('titan', '/assets/sprites/titan.png', {
      frameWidth: 160,
      frameHeight: 160
    });
    
    // Effects
    this.load.spritesheet('impact', '/assets/effects/impact.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    this.load.spritesheet('fire_breath', '/assets/effects/fire_breath.png', {
      frameWidth: 96,
      frameHeight: 96
    });
    
    this.load.image('spark', '/assets/particles/spark.png');
    
    // Audio
    this.load.audio('combat_music', '/assets/audio/combat.mp3');
    this.load.audio('monster_roar', '/assets/audio/roar.mp3');
    this.load.audio('sword_hit', '/assets/audio/hit.mp3');
    this.load.audio('jackpot_win', '/assets/audio/fanfare.mp3');
    this.load.audio('monster_attack', '/assets/audio/monster_attack.mp3');
    this.load.audio('monster_death', '/assets/audio/monster_death.mp3');
    this.load.audio('dragon_breath', '/assets/audio/dragon_breath.mp3');

    // Placeholder assets for MVP (can be replaced later)
    this.createPlaceholderAssets();
  }

  private createPlaceholderAssets() {
    // Create colored rectangles as placeholder sprites for MVP
    const graphics = this.add.graphics();
    
    // Arena background
    graphics.fillStyle(0x2a2a3a);
    graphics.fillRect(0, 0, 1024, 768);
    graphics.generateTexture('arena-bg-placeholder', 1024, 768);
    
    // UI panel
    graphics.clear();
    graphics.fillStyle(0x333333);
    graphics.fillRoundedRect(0, 0, 200, 80, 10);
    graphics.generateTexture('ui_panel', 200, 80);
    
    // Create placeholder sprites for gladiator and monsters
    graphics.clear();
    graphics.fillStyle(0x4444ff);
    graphics.fillCircle(32, 32, 30);
    graphics.generateTexture('gladiator-placeholder', 64, 64);
    
    // Monster placeholders with different colors for each tier
    // Skeleton Warrior - Red (Easy)
    graphics.clear();
    graphics.fillStyle(0xff4444);
    graphics.fillCircle(32, 32, 30);
    graphics.generateTexture('skeleton-placeholder', 64, 64);
    
    // Goblin Archer - Green (Easy-Medium)
    graphics.clear();
    graphics.fillStyle(0x44ff44);
    graphics.fillCircle(32, 32, 30);
    graphics.generateTexture('goblin-placeholder', 64, 64);
    
    // Orc Gladiator - Orange (Medium)
    graphics.clear();
    graphics.fillStyle(0xff8844);
    graphics.fillCircle(32, 32, 30);
    graphics.generateTexture('orc-placeholder', 64, 64);
    
    // Minotaur Champion - Purple (Hard)
    graphics.clear();
    graphics.fillStyle(0x8844ff);
    graphics.fillCircle(32, 32, 30);
    graphics.generateTexture('minotaur-placeholder', 64, 64);
    
    // Cyclops Titan - Dark Red (Very Hard)
    graphics.clear();
    graphics.fillStyle(0x880000);
    graphics.fillCircle(32, 32, 30);
    graphics.generateTexture('cyclops-placeholder', 64, 64);
    
    // Vault placeholder
    graphics.clear();
    graphics.fillStyle(0xffd700);
    graphics.fillRect(0, 0, 80, 100);
    graphics.generateTexture('vault-placeholder', 80, 100);
    
    // Spark placeholder for particles
    graphics.clear();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('spark-placeholder', 8, 8);
    
    graphics.destroy();
  }

  create() {
    // Emit initial scene
    window.dispatchEvent(new CustomEvent('sceneChanged', { 
      detail: { sceneName: 'PreloadScene' } 
    }));
    
    // Create all animations
    this.createAnimations();
    
    // Start menu
    this.scene.start('MenuScene');
  }

  private createAnimations() {
    // Gladiator animations
    this.createCharacterAnimations('gladiator', 64, 64);
    
    // Monster animations
    this.createCharacterAnimations('skeleton', 64, 64);
    this.createCharacterAnimations('goblin', 64, 64);
    this.createCharacterAnimations('minotaur', 96, 96);
    this.createCharacterAnimations('hydra', 128, 128);
    this.createCharacterAnimations('dragon', 128, 128);
    this.createCharacterAnimations('titan', 160, 160);

    // Impact animation
    if (this.textures.exists('impact')) {
      this.anims.create({
        key: 'impact_anim',
        frames: this.anims.generateFrameNumbers('impact', { start: 0, end: 7 }),
        frameRate: 24,
        repeat: 0
      });
    }

    // Fire breath animation
    if (this.textures.exists('fire_breath')) {
      this.anims.create({
        key: 'fire_breath_anim',
        frames: this.anims.generateFrameNumbers('fire_breath', { start: 0, end: 11 }),
        frameRate: 20,
        repeat: 0
      });
    }
  }

  private createCharacterAnimations(key: string, frameWidth: number, frameHeight: number) {
    if (!this.textures.exists(key)) return;

    // Standard 4-direction animations (idle, attack, hurt, death)
    const framesPerAnimation = 4;
    
    this.anims.create({
      key: `${key}_idle`,
      frames: this.anims.generateFrameNumbers(key, { start: 0, end: framesPerAnimation - 1 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.anims.create({
      key: `${key}_attack`,
      frames: this.anims.generateFrameNumbers(key, { start: framesPerAnimation, end: (framesPerAnimation * 2) - 1 }),
      frameRate: 12,
      repeat: 0
    });
    
    this.anims.create({
      key: `${key}_hurt`,
      frames: this.anims.generateFrameNumbers(key, { start: framesPerAnimation * 2, end: (framesPerAnimation * 3) - 1 }),
      frameRate: 10,
      repeat: 0
    });
    
    this.anims.create({
      key: `${key}_death`,
      frames: this.anims.generateFrameNumbers(key, { start: framesPerAnimation * 3, end: (framesPerAnimation * 4) - 1 }),
      frameRate: 8,
      repeat: 0
    });

    // Special roar animation for monsters
    if (key !== 'gladiator') {
      this.anims.create({
        key: `${key}_roar`,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: framesPerAnimation - 1 }),
        frameRate: 6,
        repeat: 2
      });
    }
  }
}