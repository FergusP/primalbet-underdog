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
    this.load.image('colosseum-bg', '/assets/backgrounds/Load Image 1.jpg');
    this.load.image('ui_panel', '/assets/ui/panel.png');
    this.load.image('gold_coin', '/assets/particles/coin.png');
    this.load.image('vault_closed', '/assets/sprites/vault_closed.png');
    this.load.image('vault_open', '/assets/sprites/vault_open.png');
    
    // Gladiator - Using Jiwatron atlas (for LobbyScene)
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
    
    // Load all monster sprites
    // ORC (Tier 1)
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
    
    // ARMORED ORC (Tier 2)
    this.load.spritesheet('armored_orc_idle', '/assets/sprites/armored-orc/Armored Orc-Idle.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('armored_orc_walk', '/assets/sprites/armored-orc/Armored Orc-Walk.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('armored_orc_attack01', '/assets/sprites/armored-orc/Armored Orc-Attack01.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('armored_orc_attack02', '/assets/sprites/armored-orc/Armored Orc-Attack02.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('armored_orc_attack03', '/assets/sprites/armored-orc/Armored Orc-Attack03.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('armored_orc_block', '/assets/sprites/armored-orc/Armored Orc-Block.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('armored_orc_hurt', '/assets/sprites/armored-orc/Armored Orc-Hurt.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('armored_orc_death', '/assets/sprites/armored-orc/Armored Orc-Death.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    // ELITE ORC (Tier 3)
    this.load.spritesheet('elite_orc_idle', '/assets/sprites/elite-orc/Elite Orc-Idle.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('elite_orc_walk', '/assets/sprites/elite-orc/Elite Orc-Walk.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('elite_orc_attack01', '/assets/sprites/elite-orc/Elite Orc-Attack01.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('elite_orc_attack02', '/assets/sprites/elite-orc/Elite Orc-Attack02.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('elite_orc_attack03', '/assets/sprites/elite-orc/Elite Orc-Attack03.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('elite_orc_hurt', '/assets/sprites/elite-orc/Elite Orc-Hurt.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('elite_orc_death', '/assets/sprites/elite-orc/Elite Orc-Death.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    // ORC RIDER (Tier 4) - might need larger framesize
    this.load.spritesheet('orc_rider_idle', '/assets/sprites/orc-rider/Orc rider-Idle.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('orc_rider_walk', '/assets/sprites/orc-rider/Orc rider-Walk.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('orc_rider_attack01', '/assets/sprites/orc-rider/Orc rider-Attack01.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('orc_rider_attack02', '/assets/sprites/orc-rider/Orc rider-Attack02.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('orc_rider_attack03', '/assets/sprites/orc-rider/Orc rider-Attack03.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('orc_rider_block', '/assets/sprites/orc-rider/Orc rider-Block.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('orc_rider_hurt', '/assets/sprites/orc-rider/Orc rider-Hurt.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('orc_rider_death', '/assets/sprites/orc-rider/Orc rider-Death.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    // WEREWOLF (Tier 5)
    this.load.spritesheet('werewolf_idle', '/assets/sprites/werewolf/Werewolf-Idle.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werewolf_walk', '/assets/sprites/werewolf/Werewolf-Walk.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werewolf_attack01', '/assets/sprites/werewolf/Werewolf-Attack01.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werewolf_attack02', '/assets/sprites/werewolf/Werewolf-Attack02.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werewolf_attack03', '/assets/sprites/werewolf/Werewolf-Attack03.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werewolf_hurt', '/assets/sprites/werewolf/Werewolf-Hurt.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werewolf_death', '/assets/sprites/werewolf/Werewolf-Death.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    // WEREBEAR (Evolution of Werewolf)
    this.load.spritesheet('werebear_idle', '/assets/sprites/werebear/Werebear-Idle.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werebear_walk', '/assets/sprites/werebear/Werebear-Walk.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werebear_attack01', '/assets/sprites/werebear/Werebear-Attack01.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werebear_attack02', '/assets/sprites/werebear/Werebear-Attack02.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werebear_attack03', '/assets/sprites/werebear/Werebear-Attack03.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werebear_hurt', '/assets/sprites/werebear/Werebear-Hurt.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    this.load.spritesheet('werebear_death', '/assets/sprites/werebear/Werebear-Death.png', {
      frameWidth: 100,
      frameHeight: 100
    });
    
    // No texture aliases needed - we have all the real sprites now
    
    // Add load error listener
    this.load.on('loaderror', (file: any) => {
      console.error('Failed to load file:', file.key, file.url);
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
    
    // All monster animations (Orc, Armored Orc, Elite Orc, Orc Rider, Werewolf)
    this.createAllMonsterAnimations();
    
    // Gladiator animations - special handling for Jiwatron atlas
    this.createJiwatronAnimations();

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

  private createAllMonsterAnimations() {
    // ORC ANIMATIONS
    if (this.textures.exists('orc_idle')) {
      this.anims.create({
        key: 'orc_idle',
        frames: this.anims.generateFrameNumbers('orc_idle', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (this.textures.exists('orc_walk')) {
      this.anims.create({
        key: 'orc_walk',
        frames: this.anims.generateFrameNumbers('orc_walk', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (this.textures.exists('orc_attack01')) {
      this.anims.create({
        key: 'orc_attack01',
        frames: this.anims.generateFrameNumbers('orc_attack01', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: 0
      });
    }
    if (this.textures.exists('orc_attack02')) {
      this.anims.create({
        key: 'orc_attack02',
        frames: this.anims.generateFrameNumbers('orc_attack02', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: 0
      });
    }
    if (this.textures.exists('orc_hurt')) {
      this.anims.create({
        key: 'orc_hurt',
        frames: this.anims.generateFrameNumbers('orc_hurt', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    }
    if (this.textures.exists('orc_death')) {
      this.anims.create({
        key: 'orc_death',
        frames: this.anims.generateFrameNumbers('orc_death', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: 0
      });
    }
    
    // ARMORED ORC ANIMATIONS
    this.createMonsterAnimation('armored_orc', 'idle', 0, 5, 8, -1);
    this.createMonsterAnimation('armored_orc', 'walk', 0, 7, 10, -1);
    this.createMonsterAnimation('armored_orc', 'attack01', 0, 5, 12, 0);
    this.createMonsterAnimation('armored_orc', 'attack02', 0, 5, 12, 0);
    this.createMonsterAnimation('armored_orc', 'attack03', 0, 5, 12, 0);
    this.createMonsterAnimation('armored_orc', 'block', 0, 3, 10, 0);
    this.createMonsterAnimation('armored_orc', 'hurt', 0, 3, 10, 0);
    this.createMonsterAnimation('armored_orc', 'death', 0, 3, 8, 0);
    
    // ELITE ORC ANIMATIONS
    this.createMonsterAnimation('elite_orc', 'idle', 0, 5, 8, -1);
    this.createMonsterAnimation('elite_orc', 'walk', 0, 7, 10, -1);
    this.createMonsterAnimation('elite_orc', 'attack01', 0, 5, 12, 0);
    this.createMonsterAnimation('elite_orc', 'attack02', 0, 5, 12, 0);
    this.createMonsterAnimation('elite_orc', 'attack03', 0, 5, 12, 0);
    this.createMonsterAnimation('elite_orc', 'hurt', 0, 3, 10, 0);
    this.createMonsterAnimation('elite_orc', 'death', 0, 3, 8, 0);
    
    // ORC RIDER ANIMATIONS
    this.createMonsterAnimation('orc_rider', 'idle', 0, 5, 8, -1);
    this.createMonsterAnimation('orc_rider', 'walk', 0, 7, 10, -1);
    this.createMonsterAnimation('orc_rider', 'attack01', 0, 5, 12, 0);
    this.createMonsterAnimation('orc_rider', 'attack02', 0, 5, 12, 0);
    this.createMonsterAnimation('orc_rider', 'attack03', 0, 5, 12, 0);
    this.createMonsterAnimation('orc_rider', 'block', 0, 3, 10, 0);
    this.createMonsterAnimation('orc_rider', 'hurt', 0, 3, 10, 0);
    this.createMonsterAnimation('orc_rider', 'death', 0, 3, 8, 0);
    
    // WEREWOLF ANIMATIONS
    this.createMonsterAnimation('werewolf', 'idle', 0, 5, 8, -1);
    this.createMonsterAnimation('werewolf', 'walk', 0, 7, 10, -1);
    this.createMonsterAnimation('werewolf', 'attack01', 0, 5, 12, 0);
    this.createMonsterAnimation('werewolf', 'attack02', 0, 5, 12, 0);
    this.createMonsterAnimation('werewolf', 'attack03', 0, 5, 12, 0);
    this.createMonsterAnimation('werewolf', 'hurt', 0, 3, 10, 0);
    this.createMonsterAnimation('werewolf', 'death', 0, 3, 8, 0);
    
    // WEREBEAR ANIMATIONS (Evolution)
    this.createMonsterAnimation('werebear', 'idle', 0, 5, 8, -1);
    this.createMonsterAnimation('werebear', 'walk', 0, 7, 10, -1);
    this.createMonsterAnimation('werebear', 'attack01', 0, 5, 12, 0);
    this.createMonsterAnimation('werebear', 'attack02', 0, 5, 12, 0);
    this.createMonsterAnimation('werebear', 'attack03', 0, 5, 12, 0);
    this.createMonsterAnimation('werebear', 'hurt', 0, 3, 10, 0);
    this.createMonsterAnimation('werebear', 'death', 0, 3, 8, 0);
  }
  
  private createMonsterAnimation(monster: string, anim: string, start: number, end: number, fps: number, repeat: number) {
    const key = `${monster}_${anim}`;
    if (this.textures.exists(key)) {
      this.anims.create({
        key: key,
        frames: this.anims.generateFrameNumbers(key, { start, end }),
        frameRate: fps,
        repeat: repeat
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

}