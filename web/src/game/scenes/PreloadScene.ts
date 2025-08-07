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
    
    // Gladiator - Using Jiwatron atlas (for ColosseumScene)
    this.load.atlas('gladiator', '/assets/sprites/Jiwatron.png', '/assets/sprites/Jiwatron.json');
    
    // Soldier sprites for player in CombatScene
    // Main spritesheet
    this.load.spritesheet('soldier', '/assets/sprites/soldier/Soldier.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    // Individual animation spritesheets
    this.load.spritesheet('soldier_idle', '/assets/sprites/soldier/Soldier-Idle.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('soldier_walk', '/assets/sprites/soldier/Soldier-Walk.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('soldier_attack01', '/assets/sprites/soldier/Soldier-Attack01.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('soldier_attack02', '/assets/sprites/soldier/Soldier-Attack02.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('soldier_attack03', '/assets/sprites/soldier/Soldier-Attack03.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('soldier_hurt', '/assets/sprites/soldier/Soldier-Hurt.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('soldier_death', '/assets/sprites/soldier/Soldier-Death.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    // Arrow sprite for soldier ranged attacks
    this.load.image('soldier_arrow', '/assets/sprites/soldier/Arrow01.png');
    
    // Orc sprites for all monsters
    // Main spritesheet
    this.load.spritesheet('orc', '/assets/sprites/orc/Orc.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    // Individual animation spritesheets
    this.load.spritesheet('orc_idle', '/assets/sprites/orc/Orc-Idle.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('orc_walk', '/assets/sprites/orc/Orc-Walk.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('orc_attack01', '/assets/sprites/orc/Orc-Attack01.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('orc_attack02', '/assets/sprites/orc/Orc-Attack02.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('orc_hurt', '/assets/sprites/orc/Orc-Hurt.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    this.load.spritesheet('orc_death', '/assets/sprites/orc/Orc-Death.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    // Create aliases for all monster types to use orc texture temporarily
    // This allows easy swapping when real sprites are ready
    this.load.on('complete', () => {
      if (this.textures.exists('orc')) {
        // All monster types will use the orc texture for now
        const monsterTypes = ['skeleton', 'goblin', 'minotaur', 'cyclops'];
        monsterTypes.forEach(type => {
          if (!this.textures.exists(type)) {
            // Use the orc texture for all monster types temporarily
            const orcTexture = this.textures.get('orc');
            if (orcTexture && orcTexture.source && orcTexture.source[0]) {
              this.textures.addSpriteSheet(type, 
                orcTexture.source[0].source as HTMLImageElement,
                {
                  frameWidth: 64,
                  frameHeight: 64
                }
              );
            }
          }
        });
      }
    });
    
    // Add load event listeners to debug
    this.load.on('filecomplete-atlas-skeleton', () => {
      console.log('Skeleton atlas loaded successfully');
    });
    
    this.load.on('loaderror', (file: any) => {
      console.error('Failed to load file:', file.key, file.url);
    });
    
    this.load.spritesheet('goblin', '/assets/sprites/goblin.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    this.load.spritesheet('minotaur', '/assets/sprites/minotaur.png', {
      frameWidth: 96,
      frameHeight: 96
    });
    
    // Only 5 monsters exist in backend - removed hydra, dragon, titan
    
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
    // Removed dragon_breath audio - dragon doesn't exist in backend

    // No placeholders - only real assets
  }

  // Removed createPlaceholderAssets - no mock data

  create() {
    // Emit initial scene
    window.dispatchEvent(new CustomEvent('sceneChanged', { 
      detail: { sceneName: 'PreloadScene' } 
    }));
    
    // Debug: Check if skeleton texture loaded
    console.log('PreloadScene - Skeleton texture loaded?', this.textures.exists('skeleton'));
    console.log('PreloadScene - Available textures:', this.textures.getTextureKeys());
    
    // Create all animations
    this.createAnimations();
    
    // Start menu
    this.scene.start('MenuScene');
  }

  private createAnimations() {
    // Soldier animations for player
    this.createSoldierAnimations();
    
    // Orc animations for all monsters
    this.createOrcAnimations();
    
    // Gladiator animations - special handling for Jiwatron atlas
    this.createJiwatronAnimations();
    
    // Monster animations (all use Orc sprite now)
    this.createMonsterAnimations();

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

  private createOrcAnimations() {
    // Orc Idle animation (looping)
    if (this.textures.exists('orc_idle')) {
      this.anims.create({
        key: 'orc_idle',
        frames: this.anims.generateFrameNumbers('orc_idle', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Orc Walk animation (looping)
    if (this.textures.exists('orc_walk')) {
      this.anims.create({
        key: 'orc_walk',
        frames: this.anims.generateFrameNumbers('orc_walk', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
    
    // Orc Attack01
    if (this.textures.exists('orc_attack01')) {
      this.anims.create({
        key: 'orc_attack01',
        frames: this.anims.generateFrameNumbers('orc_attack01', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: 0
      });
    }
    
    // Orc Attack02
    if (this.textures.exists('orc_attack02')) {
      this.anims.create({
        key: 'orc_attack02',
        frames: this.anims.generateFrameNumbers('orc_attack02', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: 0
      });
    }
    
    // Orc Hurt animation
    if (this.textures.exists('orc_hurt')) {
      this.anims.create({
        key: 'orc_hurt',
        frames: this.anims.generateFrameNumbers('orc_hurt', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    }
    
    // Orc Death animation
    if (this.textures.exists('orc_death')) {
      this.anims.create({
        key: 'orc_death',
        frames: this.anims.generateFrameNumbers('orc_death', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: 0
      });
    }
  }

  private createSoldierAnimations() {
    // Idle animation (looping)
    if (this.textures.exists('soldier_idle')) {
      this.anims.create({
        key: 'soldier_idle',
        frames: this.anims.generateFrameNumbers('soldier_idle', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Walk animation (looping)
    if (this.textures.exists('soldier_walk')) {
      this.anims.create({
        key: 'soldier_walk',
        frames: this.anims.generateFrameNumbers('soldier_walk', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
    
    // Attack01 - Sword swing 1
    if (this.textures.exists('soldier_attack01')) {
      this.anims.create({
        key: 'soldier_attack01',
        frames: this.anims.generateFrameNumbers('soldier_attack01', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: 0
      });
    }
    
    // Attack02 - Sword swing 2
    if (this.textures.exists('soldier_attack02')) {
      this.anims.create({
        key: 'soldier_attack02',
        frames: this.anims.generateFrameNumbers('soldier_attack02', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: 0
      });
    }
    
    // Attack03 - Bow/projectile attack (use only bow frames, skip forward movement)
    if (this.textures.exists('soldier_attack03')) {
      this.anims.create({
        key: 'soldier_attack03',
        frames: this.anims.generateFrameNumbers('soldier_attack03', { start: 3, end: 6 }),
        frameRate: 10,
        repeat: 0
      });
    }
    
    // Hurt animation
    if (this.textures.exists('soldier_hurt')) {
      this.anims.create({
        key: 'soldier_hurt',
        frames: this.anims.generateFrameNumbers('soldier_hurt', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    }
    
    // Death animation
    if (this.textures.exists('soldier_death')) {
      this.anims.create({
        key: 'soldier_death',
        frames: this.anims.generateFrameNumbers('soldier_death', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: 0
      });
    }
  }

  private createJiwatronAnimations() {
    if (!this.textures.exists('gladiator')) return;
    
    // Create animations based on Jiwatron's frame tags
    // Idle animation - just use first frame to avoid constant movement
    this.anims.create({
      key: 'gladiator_idle',
      frames: this.anims.generateFrameNames('gladiator', {
        prefix: 'Jiwatron #Idle ',
        suffix: '.aseprite',
        start: 0,
        end: 0  // Single frame
      }),
      frameRate: 1,
      repeat: 0
    });

    // Walk animation (8 frames)
    this.anims.create({
      key: 'gladiator_walk',
      frames: this.anims.generateFrameNames('gladiator', {
        prefix: 'Jiwatron #Walk ',
        suffix: '.aseprite',
        start: 0,
        end: 7
      }),
      frameRate: 12,
      repeat: -1
    });

    // Attack animations
    this.anims.create({
      key: 'gladiator_attack',
      frames: this.anims.generateFrameNames('gladiator', {
        prefix: 'Jiwatron #Attack01 ',
        suffix: '.aseprite',
        start: 0,
        end: 6
      }),
      frameRate: 14,
      repeat: 0
    });

    this.anims.create({
      key: 'gladiator_attack2',
      frames: this.anims.generateFrameNames('gladiator', {
        prefix: 'Jiwatron #Attack02 ',
        suffix: '.aseprite',
        start: 0,
        end: 10
      }),
      frameRate: 16,
      repeat: 0
    });

    this.anims.create({
      key: 'gladiator_attack3',
      frames: this.anims.generateFrameNames('gladiator', {
        prefix: 'Jiwatron #Attack03 ',
        suffix: '.aseprite',
        start: 0,
        end: 8
      }),
      frameRate: 15,
      repeat: 0
    });

    // Hurt animation (4 frames)
    this.anims.create({
      key: 'gladiator_hurt',
      frames: this.anims.generateFrameNames('gladiator', {
        prefix: 'Jiwatron #Hurt ',
        suffix: '.aseprite',
        start: 0,
        end: 3
      }),
      frameRate: 10,
      repeat: 0
    });

    // Death animation (4 frames)
    this.anims.create({
      key: 'gladiator_death',
      frames: this.anims.generateFrameNames('gladiator', {
        prefix: 'Jiwatron #Death ',
        suffix: '.aseprite',
        start: 0,
        end: 3
      }),
      frameRate: 8,
      repeat: 0
    });
  }

  private createMonsterAnimations() {
    // Create animations for all monster types using Orc animations
    const monsterTypes = ['skeleton', 'goblin', 'orc', 'minotaur', 'cyclops'];
    
    monsterTypes.forEach(type => {
      // For orc, the animations are already created
      if (type === 'orc') return;
      
      // Create animations using orc texture frames for all other monster types
      // Since all monsters use the orc sprite, we can use orc_idle, orc_walk, etc directly
      
      // Idle animation
      if (this.textures.exists('orc_idle') && !this.anims.exists(`${type}_idle`)) {
        this.anims.create({
          key: `${type}_idle`,
          frames: this.anims.generateFrameNumbers('orc_idle', { start: 0, end: 5 }),
          frameRate: 8,
          repeat: -1
        });
      }
      
      // Walk animation
      if (this.textures.exists('orc_walk') && !this.anims.exists(`${type}_walk`)) {
        this.anims.create({
          key: `${type}_walk`,
          frames: this.anims.generateFrameNumbers('orc_walk', { start: 0, end: 7 }),
          frameRate: 10,
          repeat: -1
        });
      }
      
      // Attack01 animation
      if (this.textures.exists('orc_attack01') && !this.anims.exists(`${type}_attack01`)) {
        this.anims.create({
          key: `${type}_attack01`,
          frames: this.anims.generateFrameNumbers('orc_attack01', { start: 0, end: 5 }),
          frameRate: 12,
          repeat: 0
        });
      }
      
      // Attack02 animation
      if (this.textures.exists('orc_attack02') && !this.anims.exists(`${type}_attack02`)) {
        this.anims.create({
          key: `${type}_attack02`,
          frames: this.anims.generateFrameNumbers('orc_attack02', { start: 0, end: 5 }),
          frameRate: 12,
          repeat: 0
        });
      }
      
      // Generic attack (uses attack01)
      if (this.textures.exists('orc_attack01') && !this.anims.exists(`${type}_attack`)) {
        this.anims.create({
          key: `${type}_attack`,
          frames: this.anims.generateFrameNumbers('orc_attack01', { start: 0, end: 5 }),
          frameRate: 12,
          repeat: 0
        });
      }
      
      // Hurt animation
      if (this.textures.exists('orc_hurt') && !this.anims.exists(`${type}_hurt`)) {
        this.anims.create({
          key: `${type}_hurt`,
          frames: this.anims.generateFrameNumbers('orc_hurt', { start: 0, end: 3 }),
          frameRate: 10,
          repeat: 0
        });
      }
      
      // Death animation
      if (this.textures.exists('orc_death') && !this.anims.exists(`${type}_death`)) {
        this.anims.create({
          key: `${type}_death`,
          frames: this.anims.generateFrameNumbers('orc_death', { start: 0, end: 3 }),
          frameRate: 8,
          repeat: 0
        });
      }
    });
  }
}