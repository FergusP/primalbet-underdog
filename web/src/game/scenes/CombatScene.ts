// Action Combat Scene - Real-time combat with movement
import { BaseScene } from './BaseScene';
import { Monster } from '../../types';
import { SpearRechargeIndicatorHTML } from '../../ui/phaser/SpearRechargeIndicatorHTML';
import { SkeletonEnemy } from '../sprites/SkeletonEnemy';
import { SlimeEnemy } from '../sprites/SlimeEnemy';

export class CombatScene extends BaseScene {
  private player!: Phaser.GameObjects.Sprite;
  private monster!: Phaser.GameObjects.Sprite;

  // Game objects
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;
  private qKey!: Phaser.Input.Keyboard.Key;
  private shiftKey!: Phaser.Input.Keyboard.Key;

  // Combat
  private spears!: Phaser.GameObjects.Group;
  private maxSpears: number = 2;
  private currentSpears: number = 2;
  private spearRechargeIndicator!: SpearRechargeIndicatorHTML;

  // Game state
  private playerHealth: number = 100;
  private playerMaxHealth: number = 100;
  private monsterHealth: number = 100;
  private monsterMaxHealth: number = 100;
  private monsterData!: Monster;
  private lastMeleeTime: number = 0;
  private lastSpearTime: number = 0;
  private meleeCooldown: number = 500; // 0.5 seconds
  private spearCooldown: number = 500; // 0.5 seconds
  private spearRegenTime: number = 3500; // 3.5 seconds per spear
  private lastSpearRegen: number = 0;
  private isGameOver: boolean = false;

  // Monster attack properties (adjusted based on difficulty)
  private monsterAttackRange: number = 80; // Monster attacks when this close
  private monsterAttackCooldown: number = 2500; // Base cooldown, increased for balance
  private lastMonsterAttackTime: number = 0;
  private isMonsterAttacking: boolean = false; // Track if monster is currently attacking

  // Evolution state for werewolf -> werebear
  private isEvolved: boolean = false;
  private isEvolving: boolean = false; // During evolution animation

  // Range indicators (for development)
  private meleeRangeIndicator!: Phaser.GameObjects.Graphics;
  private meleeRange: number = 110; // Increased by 10px for better reach
  private debugGraphics!: Phaser.GameObjects.Graphics;
  private debugMode: boolean = false; // Toggle for debug visualization
  private attackRangeIndicator!: Phaser.GameObjects.Graphics; // Shows where player can attack

  // Movement penalty system
  private isSlowed: boolean = false;
  private slowedUntil: number = 0;
  private normalSpeed: number = 150;
  private slowedSpeed: number = 60;

  // Performance optimizations
  private cachedPlayerMonsterDistance: number = 0;
  private lastDistanceCalculation: number = 0;
  private distanceCalculationInterval: number = 50; // Calculate every 50ms
  private lastSpritePositionEmit: number = 0;
  private spritePositionEmitInterval: number = 100; // Emit every 100ms
  private prevPlayerX: number = 0;
  private prevPlayerY: number = 0;
  private prevMonsterX: number = 0;
  private prevMonsterY: number = 0;

  // Arena borders - stored to avoid recreating on resize
  private borders: Phaser.GameObjects.Rectangle[] = [];

  // Store previous viewport dimensions for relative positioning
  private previousWidth: number = 0;
  private previousHeight: number = 0;

  // Player animation states
  private isPlayerMoving: boolean = false;
  private currentPlayerAnimation: string = 'soldier_idle';

  // Monster animation states
  private isMonsterMoving: boolean = false;
  private currentMonsterAnimation: string = '';
  private monsterSpriteKey: string = 'orc';

  // Monster slow effect
  private monsterSlowedUntil: number = 0;
  private monsterBaseSpeed: number = 60;
  private monsterCurrentSpeed: number = 60;
  
  // Shield powerup
  private shieldStacks: number = 0;
  private shieldOrbs: Phaser.GameObjects.Graphics[] = [];
  private shieldTimer?: Phaser.Time.TimerEvent;

  // Enemy spawn system
  private skeletons!: Phaser.GameObjects.Group;
  private slimes!: Phaser.GameObjects.Group;
  private spawnTimers: Phaser.Time.TimerEvent[] = [];
  private continuousSpawnTimer?: Phaser.Time.TimerEvent;
  private isMainMonsterDead: boolean = false;
  private waveNumber: number = 0;

  // Combo system
  private comboCount: number = 0;
  private lastHitTime: number = 0;
  private comboResetTime: number = 1000; // 1 second to continue combo
  private comboMultiplier: number = 1.0;
  private maxCombo: number = 3;
  private comboText?: Phaser.GameObjects.Text;

  // Crowd control abilities
  private dashCooldown: number = 0;
  private dashDistance: number = 180; // Fixed dash distance in pixels
  private dashDuration: number = 300;
  private isDashing: boolean = false;
  private isInvincible: boolean = false; // Invincibility during dash
  private slamCooldown: number = 0;
  private slamCooldownMax: number = 5000;
  private lastDashDirection: string = '';
  private lastDashTime: number = 0;
  private doubleTapTime: number = 300; // Time window for double tap

  // Projectile variety system
  private currentArrowType: 'yellow' | 'blue' | 'red' = 'yellow';
  private arrowTypes = {
    yellow: {
      sprite: 'arrow_yellow',
      damage: 1.0,
      description: 'Standard',
      slowDuration: 400,
    }, // Half slow (400ms)
    blue: {
      sprite: 'arrow_blue',
      damage: 0.6,
      description: 'Frost',
      slowDuration: 0,
    }, // Low damage but slows monster, no player slow
    red: {
      sprite: 'arrow_red',
      damage: 1.5,
      description: 'Heavy',
      aoe: true,
      slowDuration: 800,
    }, // Full slow (800ms) - heavy draw
  };
  private arrowTypeIndicator?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data: { monster: Monster; combatId: string; walletAddress?: string }) {
    if (!data || !data.monster) {
      console.error('No monster data provided to CombatScene');
      // Return to lobby if no monster data
      this.scene.start('LobbyScene');
      return;
    }

    this.monsterData = data.monster;
    this.monsterHealth = this.monsterData.baseHealth;
    this.monsterMaxHealth = this.monsterData.baseHealth;

    // Reset evolution flags for new combat
    this.isEvolved = false;
    this.isEvolving = false;

    // Reset other game state
    this.playerHealth = this.playerMaxHealth;
    this.isGameOver = false;
    this.lastMeleeTime = 0;
    this.lastMonsterAttackTime = 0;

    // Reset spear state
    this.currentSpears = this.maxSpears;
    this.lastSpearTime = 0;
    this.lastSpearRegen = this.time.now;

    // Reset movement penalty state
    this.isSlowed = false;
    this.slowedUntil = 0;

    // Reset optimization state
    this.cachedPlayerMonsterDistance = 0;
    this.lastDistanceCalculation = 0;
    this.lastSpritePositionEmit = 0;

    // Reset spawn system
    this.isMainMonsterDead = false;
    this.waveNumber = 0;

    // Clear any existing spawn timers
    if (this.spawnTimers) {
      this.spawnTimers.forEach((timer) => timer?.destroy());
      this.spawnTimers = [];
    }
    if (this.continuousSpawnTimer) {
      this.continuousSpawnTimer.destroy();
      this.continuousSpawnTimer = undefined;
    }

    // Reset combo system
    this.comboCount = 0;
    this.lastHitTime = 0;
    this.comboMultiplier = 1.0;

    // Reset crowd control
    this.dashCooldown = 0;
    this.slamCooldown = 0;
    this.isDashing = false;
  }

  protected createScene() {
    // Emit scene change event
    window.dispatchEvent(
      new CustomEvent('sceneChanged', {
        detail: { sceneName: 'CombatScene' },
      })
    );

    // Safety check - ensure we have monster data
    if (!this.monsterData) {
      console.error('CombatScene create: No monster data available');
      this.scene.start('LobbyScene');
      return;
    }

    // Wait for UI to be ready before sending monster info
    const sendMonsterInfo = () => {
      window.dispatchEvent(
        new CustomEvent('monster-info', {
          detail: {
            type: this.monsterData.tier.name, // Use tier.name for the actual monster name
            baseHealth: this.monsterData.baseHealth,
          },
        })
      );

      // Also emit game state
      this.emitGameState();
      this.emitMonsterInfo();
    };

    // Listen for UI ready signal
    const handleUIReady = () => {
      window.removeEventListener('combat-ui-ready', handleUIReady);
      sendMonsterInfo();
    };

    window.addEventListener('combat-ui-ready', handleUIReady);

    // Fallback: send after 100ms if UI doesn't signal ready
    this.time.delayedCall(100, () => {
      window.removeEventListener('combat-ui-ready', handleUIReady);
      sendMonsterInfo();
    });

    const { width, height } = this.cameras.main;

    // Store initial dimensions
    this.previousWidth = width;
    this.previousHeight = height;

    // Create arena background with forest image
    // Check if texture exists
    if (this.textures.exists('arena-bg')) {
      const arenaBg = this.add.tileSprite(
        width / 2,
        height / 2,
        width,
        height,
        'arena-bg'
      );
      arenaBg.setOrigin(0.5, 0.5);
      // Darken the background to reduce distraction
      arenaBg.setTint(0x808080); // 50% darker
      this.registerUIElement('bg', arenaBg);
    } else {
      console.error('Arena texture not found! Creating fallback background');
      // Fallback to solid color
      const bgRect = this.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0x8b7355
      );
      this.registerUIElement('bg', bgRect);
    }

    // Add arena borders with forest theme colors
    this.borders = [
      this.add.rectangle(width / 2, 20, width - 40, 40, 0x2d1810, 0.7),
      this.add.rectangle(width / 2, height - 20, width - 40, 40, 0x2d1810, 0.7),
      this.add.rectangle(20, height / 2, 40, height - 40, 0x2d1810, 0.7),
      this.add.rectangle(
        width - 20,
        height / 2,
        40,
        height - 40,
        0x2d1810,
        0.7
      ),
    ];

    // Add border outlines for better visibility
    this.borders.forEach((border) => {
      border.setStrokeStyle(2, 0x8b4513, 0.5); // Saddle brown outline
    });

    // Register borders for proper management
    this.borders.forEach((border, index) => {
      this.registerUIElement(`border${index}`, border);
    });

    // Create player with soldier sprite
    this.player = this.add.sprite(width * 0.2, height * 0.5, 'soldier_idle', 0);
    this.player.setOrigin(0.5, 0.5);
    this.player.setScale(2.0); // Scale up the soldier sprite

    // Don't play idle animation to avoid constant movement
    // Just show static frame 0

    // Initialize position tracking
    this.prevPlayerX = this.player.x;
    this.prevPlayerY = this.player.y;

    // Create monster using appropriate sprite for each monster type
    // Add null safety for tier check
    const monsterName = (
      this.monsterData.tier?.name ||
      this.monsterData.type ||
      'orc'
    ).toLowerCase();

    // Determine sprite key for animations based on new monster names
    let spriteKey = 'orc';
    if (monsterName.includes('werewolf')) {
      spriteKey = 'werewolf';
    } else if (monsterName.includes('orc rider')) {
      spriteKey = 'orc_rider';
    } else if (monsterName.includes('elite orc')) {
      spriteKey = 'elite_orc';
    } else if (monsterName.includes('armored orc')) {
      spriteKey = 'armored_orc';
    } else if (monsterName.includes('orc')) {
      spriteKey = 'orc';
    }

    // Store sprite key for animations
    this.monsterSpriteKey = spriteKey;

    // Create monster sprite using the correct texture
    this.monster = this.add.sprite(width * 0.7, height * 0.5, spriteKey, 0);

    // Set the origin to center for proper positioning
    this.monster.setOrigin(0.5, 0.5);

    // Scale based on monster type - increased for better differentiation
    const scales: Record<string, number> = {
      orc: 3.0,
      armored_orc: 3.2,
      elite_orc: 3.5,
      orc_rider: 3.8,
      werewolf: 3.5,
    };
    this.monster.setScale(scales[spriteKey] || 3.0);

    // Add subtle red tint to boss for differentiation
    this.monster.setTint(0xffcccc);

    // Add simple shadow under the boss
    const shadow = this.add.ellipse(
      this.monster.x,
      this.monster.y + 40,
      80,
      30,
      0x000000,
      0.3
    );
    shadow.setDepth(4); // Below the monster
    this.registerUIElement('bossShadow', shadow);

    // Make shadow follow monster
    this.events.on('postupdate', () => {
      if (shadow && this.monster) {
        shadow.x = this.monster.x;
        shadow.y = this.monster.y + 40;
      }
    });

    // Play idle animation
    const idleAnimKey = `${spriteKey}_idle`;
    this.currentMonsterAnimation = idleAnimKey;
    if (this.anims.exists(idleAnimKey)) {
      this.monster.play(idleAnimKey);
    }
    this.monster.setAlpha(1); // Ensure fully visible
    this.monster.setVisible(true);
    this.monster.setDepth(5); // Ensure proper rendering order

    // Initialize monster position tracking
    this.prevMonsterX = this.monster.x;
    this.prevMonsterY = this.monster.y;

    // Enable physics
    this.physics.add.existing(this.player);
    this.physics.add.existing(this.monster);

    // Set player physics properties
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);
    playerBody.setDrag(300);
    playerBody.setMaxVelocity(200);

    // Set monster physics properties
    const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;
    monsterBody.setCollideWorldBounds(true);
    monsterBody.setImmovable(false); // Ensure monster can be hit multiple times

    // Create input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D');
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.qKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

    // Add SHIFT key for dash
    this.shiftKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT
    );

    // Create spear group for projectiles - NO collision detection
    this.spears = this.physics.add.group();

    // Create range indicator (for development)
    this.createRangeIndicator();

    // Create debug graphics
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(100); // On top of everything

    // Create spear texture once
    this.createSpearTexture();

    // Arrow type indicator removed - now handled by React UI
    // this.createArrowTypeIndicator();

    // Delay creation of HTML spear recharge indicator to ensure DOM is ready
    this.time.delayedCall(500, () => {
      // Create HTML spear recharge indicator
      this.spearRechargeIndicator = new SpearRechargeIndicatorHTML(this, {
        containerId: 'spear-recharge-canvas',
        rechargeDuration: this.spearRegenTime,
      });

      // Remove any existing listener first to prevent duplicates
      this.events.off('spear-recharged', this.onSpearRecharged, this);

      // Set up spear recharge event listener
      this.events.on('spear-recharged', this.onSpearRecharged, this);
    });

    // Emit initial game state for UI
    this.emitGameState();
    this.emitMonsterInfo();
    this.emitInstructions();

    // Re-emit monster info after a short delay to ensure UI is ready
    this.time.delayedCall(100, () => {
      this.emitMonsterInfo();
    });

    // Add mouse click for attacks
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptMeleeAttack();
      } else if (pointer.rightButtonDown()) {
        this.throwSpear(pointer);
      }
    });

    console.log('🎮 ACTION COMBAT STARTED!');
    console.log('🕹️  WASD or Arrow Keys to move');
    console.log('⚔️  SPACE/Left Click for melee attack');
    console.log(
      '🏹  E/Right Click to throw arrows (Limited: 2 max, slows movement)'
    );
    console.log('💀 Skeletons will spawn to crowd the battle!');
    console.log('💚 Kill slimes for healing!');

    // Emit initial state for UI
    this.emitCombatState();
    this.emitMonsterInfo();

    // Emit instructions
    window.dispatchEvent(
      new CustomEvent('combat-instructions', {
        detail: {
          text: 'WASD: Move • SPACE/Click: Melee • E/Right-Click: Arrow (Limited) • Defeat monster!',
          visible: true,
        },
      })
    );

    // Initialize enemy groups
    this.skeletons = this.add.group({
      classType: SkeletonEnemy,
      maxSize: 10,
      runChildUpdate: true,
    });

    this.slimes = this.add.group({
      classType: SlimeEnemy,
      maxSize: 3,
      runChildUpdate: true,
    });

    // Set up collision detection for additional enemies
    this.setupEnemyCollisions();

    // Initialize spawn system
    this.initializeSpawnSystem();

    // Listen for skeleton attacks
    this.events.on('skeleton-attack', this.handleSkeletonAttack, this);

    // Listen for bonus drops
    this.events.on('bonus-dropped', this.handleBonusDrop, this);

    // Listen for healing orb drops
    this.events.on('healing-orb-dropped', this.handleHealingOrbDrop, this);
  }

  emitGameState() {
    // Safety clamp spears to never exceed max
    this.currentSpears = Math.min(this.currentSpears, this.maxSpears);

    console.log(
      `EMITTING GAME STATE: currentSpears=${this.currentSpears}, maxSpears=${this.maxSpears}`
    );

    window.dispatchEvent(
      new CustomEvent('combat-state-update', {
        detail: {
          playerHealth: this.playerHealth,
          playerMaxHealth: this.playerMaxHealth,
          monsterHealth: this.monsterHealth,
          monsterMaxHealth: this.monsterMaxHealth,
          currentSpears: this.currentSpears,
          maxSpears: this.maxSpears,
          isSlowed: this.isSlowed,
          isGameOver: this.isGameOver,
        },
      })
    );
  }

  emitCombatState() {
    window.dispatchEvent(
      new CustomEvent('combat-state-update', {
        detail: {
          playerHealth: this.playerHealth,
          playerMaxHealth: this.playerMaxHealth,
          monsterHealth: this.monsterHealth,
          monsterMaxHealth: this.monsterMaxHealth,
          currentSpears: this.currentSpears,
          maxSpears: this.maxSpears,
          isSlowed: this.isSlowed,
          isGameOver: this.isGameOver,
          debugMode: this.debugMode,
        },
      })
    );
  }

  emitMonsterInfo() {
    window.dispatchEvent(
      new CustomEvent('monster-info', {
        detail: {
          type: this.monsterData?.tier?.name || 'UNKNOWN MONSTER', // Use tier.name
          baseHealth: this.monsterData?.baseHealth || 100,
        },
      })
    );
  }

  emitInstructions() {
    window.dispatchEvent(
      new CustomEvent('combat-instructions', {
        detail: {
          text: 'WASD: Move • SPACE/Click: Melee • E/Right-Click: Spear (Limited) • Defeat monster!',
          debugMode: this.debugMode,
        },
      })
    );
  }

  createRangeIndicator() {
    // Create a graphics object for the melee range
    this.meleeRangeIndicator = this.add.graphics();
    this.meleeRangeIndicator.setDepth(1); // Above floor, below sprites
  }

  createSpearTexture() {
    // Create spear texture once to avoid creating it every throw
    const graphics = this.add.graphics();
    graphics.fillStyle(0xccaa00);
    graphics.fillRect(0, 0, 20, 4);
    graphics.generateTexture('spear-texture', 20, 4);
    graphics.destroy();
  }

  createArrowTypeIndicator() {
    // Create UI for showing current arrow type - positioned bottom-right for better visibility
    const x = this.cameras.main.width - 120;
    const y = this.cameras.main.height - 50;

    this.arrowTypeIndicator = this.add.container(x, y);

    // Background panel with marble texture style (matching forest theme)
    const bg = this.add.rectangle(0, 0, 200, 60, 0x3d2817, 0.95);
    bg.setStrokeStyle(3, 0xffd700); // Gold border

    // Add subtle glow effect
    const glow = this.add.rectangle(0, 0, 205, 65, 0xffd700, 0.2);

    // Arrow emoji instead of sprite (since sprites don't exist)
    const arrowEmoji = this.add
      .text(-70, 0, '🏹', {
        fontSize: '24px',
      })
      .setOrigin(0.5, 0.5);

    // Arrow type text - bigger and brighter
    const typeText = this.add
      .text(-20, 0, this.arrowTypes[this.currentArrowType].description, {
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif',
        color: this.getArrowColor(this.currentArrowType),
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0, 0.5);

    // Damage indicator
    const damageText = this.add
      .text(50, 0, `DMG: ${this.arrowTypes[this.currentArrowType].damage}x`, {
        fontSize: '16px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 1,
      })
      .setOrigin(0, 0.5);

    // Q key hint - more visible
    const keyHint = this.add
      .text(0, -35, '[Q] SWITCH TYPE', {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5, 0.5);

    this.arrowTypeIndicator.add([
      glow,
      bg,
      arrowEmoji,
      typeText,
      damageText,
      keyHint,
    ]);
    this.arrowTypeIndicator.setDepth(100); // Higher depth for better visibility

    // Store references for updating
    (this.arrowTypeIndicator as any).typeText = typeText;
    (this.arrowTypeIndicator as any).damageText = damageText;
  }

  getArrowColor(type: 'yellow' | 'blue' | 'red'): string {
    switch (type) {
      case 'yellow':
        return '#ffff00';
      case 'blue':
        return '#00aaff';
      case 'red':
        return '#ff4444';
    }
  }

  switchArrowType() {
    // Cycle through arrow types
    const types: ('yellow' | 'blue' | 'red')[] = ['yellow', 'blue', 'red'];
    const currentIndex = types.indexOf(this.currentArrowType);
    this.currentArrowType = types[(currentIndex + 1) % types.length];

    // Emit event to React UI
    window.dispatchEvent(
      new CustomEvent('arrow-type-changed', {
        detail: {
          type: this.currentArrowType,
          damage: this.arrowTypes[this.currentArrowType].damage,
        },
      })
    );

    // Show feedback
    const feedbackText = this.add
      .text(
        this.player.x,
        this.player.y - 60,
        `${this.arrowTypes[this.currentArrowType].description} Arrows`,
        {
          fontSize: '16px',
          color: this.getArrowColor(this.currentArrowType),
          stroke: '#000000',
          strokeThickness: 3,
        }
      )
      .setOrigin(0.5);

    this.tweens.add({
      targets: feedbackText,
      y: feedbackText.y - 20,
      alpha: 0,
      duration: 800,
      onComplete: () => feedbackText.destroy(),
    });
  }

  updateArrowTypeIndicator() {
    if (!this.arrowTypeIndicator) return;

    // Get stored references
    const typeText = (this.arrowTypeIndicator as any).typeText;
    const damageText = (this.arrowTypeIndicator as any).damageText;

    if (typeText) {
      typeText.setText(this.arrowTypes[this.currentArrowType].description);
      typeText.setColor(this.getArrowColor(this.currentArrowType));
    }

    if (damageText) {
      damageText.setText(
        `DMG: ${this.arrowTypes[this.currentArrowType].damage}x`
      );
    }

    // Add a pulse effect when switching
    this.tweens.add({
      targets: this.arrowTypeIndicator,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 150,
      yoyo: true,
      ease: 'Power2',
    });
  }

  createExplosion(x: number, y: number) {
    // Fixed position explosion effect
    
    // Store the exact position to prevent movement
    const explosionX = x;
    const explosionY = y;
    
    // 1. Main explosion - bright orange/red expanding circle
    const explosion = this.add.circle(explosionX, explosionY, 20, 0xff4444, 1);
    explosion.setDepth(10);
    explosion.setBlendMode(Phaser.BlendModes.ADD);
    explosion.setScrollFactor(1, 1); // Make sure it follows world coordinates
    
    // 2. Inner bright core
    const core = this.add.circle(explosionX, explosionY, 10, 0xffff00, 1);
    core.setDepth(11);
    core.setBlendMode(Phaser.BlendModes.ADD);
    core.setScrollFactor(1, 1);
    
    // 3. Damage radius ring to show actual range
    const ring = this.add.graphics();
    ring.setDepth(9);
    ring.lineStyle(3, 0xff8800, 1);
    ring.strokeCircle(0, 0, 30);
    ring.setPosition(explosionX, explosionY);
    ring.setScrollFactor(1, 1);
    
    // Animate explosion expansion (scale only, not position)
    this.tweens.add({
      targets: explosion,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        if (explosion && explosion.active) explosion.destroy();
      },
    });
    
    // Animate core (scale only)
    this.tweens.add({
      targets: core,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 250,
      ease: 'Power2',
      onComplete: () => {
        if (core && core.active) core.destroy();
      },
    });
    
    // Animate ring to show 100 pixel damage radius (scale only)
    this.tweens.add({
      targets: ring,
      scaleX: 3.3,  // ~100 pixel radius
      scaleY: 3.3,
      alpha: 0,
      duration: 500,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (ring && ring.active) ring.destroy();
      },
    });
    
    // Create fire effect with circles at fixed positions
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const startX = explosionX + Math.cos(angle) * 20;
      const startY = explosionY + Math.sin(angle) * 20;
      
      const spark = this.add.circle(
        startX,
        startY,
        4,
        Phaser.Math.Between(0xff0000, 0xffaa00),
        1
      );
      spark.setDepth(8);
      spark.setScrollFactor(1, 1);
      
      const distance = Phaser.Math.Between(60, 100);
      const endX = explosionX + Math.cos(angle) * distance;
      const endY = explosionY + Math.sin(angle) * distance;
      
      this.tweens.add({
        targets: spark,
        x: endX,
        y: endY,
        scale: 0,
        alpha: 0,
        duration: Phaser.Math.Between(300, 500),
        ease: 'Power2',
        onComplete: () => {
          if (spark && spark.active) spark.destroy();
        },
      });
    }
    
    // Screen shake
    this.cameras.main.shake(200, 0.01);
  }

  damageNearbyEnemies(x: number, y: number, damage: number, range: number) {
    // Damage the main monster if it's in range and not at the explosion center
    if (this.monster && this.monsterHealth > 0) {
      const monsterDist = Phaser.Math.Distance.Between(
        x,
        y,
        this.monster.x,
        this.monster.y
      );
      // Only damage if monster is nearby but not the primary target (avoid double damage)
      if (monsterDist > 10 && monsterDist <= range) {
        // Deal explosion damage to monster
        this.monsterHealth = Math.max(0, this.monsterHealth - damage);
        
        // Show damage number
        this.showDamageNumber(
          this.monster.x,
          this.monster.y - 40,
          damage,
          0xff8800
        );
        
        // Flash effect
        this.monster.setTint(0xff8800);
        this.time.delayedCall(100, () => {
          if (this.monster && this.monster.active && this.monsterHealth > 0) {
            this.monster.clearTint();
          }
        });
        
        // Emit updated game state
        this.emitGameState();
        
        // Knockback effect on monster
        const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;
        if (monsterBody) {
          const angle = Phaser.Math.Angle.Between(
            x,
            y,
            this.monster.x,
            this.monster.y
          );
          monsterBody.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
          // Reset velocity after knockback
          this.time.delayedCall(200, () => {
            if (monsterBody) {
              monsterBody.setVelocity(0, 0);
            }
          });
        }
      }
    }
    
    // Damage skeletons in range
    if (this.skeletons) {
      this.skeletons.children.entries.forEach((skeleton: any) => {
        if (skeleton.active) {
          const dist = Phaser.Math.Distance.Between(
            x,
            y,
            skeleton.x,
            skeleton.y
          );
          if (dist <= range) {
            const killed = skeleton.takeDamage(Math.floor(damage));
            if (killed) {
              // Check if all enemies are defeated after skeleton dies
              this.time.delayedCall(600, () => {
                if (this.isMainMonsterDead && !this.isGameOver) {
                  const remainingSkeletons = this.skeletons
                    ? this.skeletons.getLength()
                    : 0;
                  if (remainingSkeletons === 0) {
                    this.gameOver(true);
                  }
                }
              });
            }
            // Knockback (check if body exists)
            if (skeleton.body) {
              const angle = Phaser.Math.Angle.Between(
                x,
                y,
                skeleton.x,
                skeleton.y
              );
              const body = skeleton.body as Phaser.Physics.Arcade.Body;
              body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
            }
          }
        }
      });
    }

    // Damage slimes in range
    if (this.slimes) {
      this.slimes.children.entries.forEach((slime: any) => {
        if (slime.active) {
          const dist = Phaser.Math.Distance.Between(x, y, slime.x, slime.y);
          if (dist <= range) {
            slime.takeDamage(Math.floor(damage));
          }
        }
      });
    }
  }

  triggerRevengeBoost(x: number, y: number) {
    // Boost nearby skeletons when one dies
    const revengeRange = 150;

    if (this.skeletons) {
      this.skeletons.children.entries.forEach((skeleton: any) => {
        if (skeleton.active && skeleton instanceof SkeletonEnemy) {
          const dist = Phaser.Math.Distance.Between(
            x,
            y,
            skeleton.x,
            skeleton.y
          );
          if (dist <= revengeRange) {
            skeleton.applyRevengeBoost();
          }
        }
      });
    }

    // Visual indicator of revenge trigger
    const revengeText = this.add
      .text(x, y - 40, 'REVENGE!', {
        fontSize: '16px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: revengeText,
      y: revengeText.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => revengeText.destroy(),
    });
  }

  // Cached distance calculation
  private getPlayerMonsterDistance(): number {
    const currentTime = this.time.now;
    if (
      currentTime - this.lastDistanceCalculation >
      this.distanceCalculationInterval
    ) {
      this.cachedPlayerMonsterDistance = Phaser.Math.Distance.Between(
        this.monster.x,
        this.monster.y,
        this.player.x,
        this.player.y
      );
      this.lastDistanceCalculation = currentTime;
    }
    return this.cachedPlayerMonsterDistance;
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    // Update dash cooldown
    if (this.dashCooldown > 0) {
      this.dashCooldown -= delta;
      if (this.dashCooldown < 0) this.dashCooldown = 0;
    }

    this.handlePlayerMovement();
    this.handleMonsterAI();
    this.handleInputAttacks(time);
    this.regenerateSpears(time); // RE-ENABLED: Limited spear system
    this.updateRangeIndicator();
    this.checkSpearCollisions(); // RE-ENABLED: Fixed spear collision
    this.checkGameOver();

    // Only emit sprite positions if enough time has passed AND positions changed
    if (time - this.lastSpritePositionEmit > this.spritePositionEmitInterval) {
      const positionThreshold = 2;
      const playerMoved =
        Math.abs(this.player.x - this.prevPlayerX) > positionThreshold ||
        Math.abs(this.player.y - this.prevPlayerY) > positionThreshold;
      const monsterMoved =
        Math.abs(this.monster.x - this.prevMonsterX) > positionThreshold ||
        Math.abs(this.monster.y - this.prevMonsterY) > positionThreshold;

      if (playerMoved || monsterMoved) {
        this.emitSpritePositions();
        this.lastSpritePositionEmit = time;
        this.prevPlayerX = this.player.x;
        this.prevPlayerY = this.player.y;
        this.prevMonsterX = this.monster.x;
        this.prevMonsterY = this.monster.y;
      }
    }
  }

  // Helper methods for cleaner evolution protection
  canDamageMonster(): boolean {
    return !this.isEvolving && this.monsterHealth > 0;
  }

  canMonsterAct(): boolean {
    return !this.isEvolving && !this.isGameOver && this.monsterHealth > 0;
  }

  updateRangeIndicator() {
    // Update position to follow player
    this.meleeRangeIndicator.setPosition(this.player.x, this.player.y);

    // Check distance to monster
    const distance = this.getPlayerMonsterDistance();
    const inRange = distance < this.meleeRange && this.monsterHealth > 0;

    // Clear and redraw
    this.meleeRangeIndicator.clear();

    // Only show indicators if monster is alive
    if (this.monsterHealth > 0) {
      // Show monster's attack range (danger zone)
      const monsterDistance = Phaser.Math.Distance.Between(
        this.monster.x,
        this.monster.y,
        this.player.x,
        this.player.y
      );
      if (monsterDistance <= this.monsterAttackRange) {
        // DANGER! Monster can attack you
        this.meleeRangeIndicator.lineStyle(3, 0xff0000, 0.6);
        this.meleeRangeIndicator.strokeCircle(0, 0, 35);
        this.meleeRangeIndicator.fillStyle(0xff0000, 0.2);
        this.meleeRangeIndicator.fillCircle(0, 0, 35);
      }

      if (inRange) {
        // IN RANGE: Show bright green circle pulsing with stronger visibility
        const pulse = Math.sin(this.time.now * 0.008) * 0.4 + 0.6;
        this.meleeRangeIndicator.lineStyle(6, 0x00ff00, pulse);
        this.meleeRangeIndicator.strokeCircle(0, 0, 60); // Larger, more visible indicator

        // Show attack zone with brighter fill
        this.meleeRangeIndicator.fillStyle(0x00ff00, 0.2);
        this.meleeRangeIndicator.fillCircle(0, 0, 60);

        // Add inner circle for better visibility
        this.meleeRangeIndicator.lineStyle(3, 0x00ff00, pulse * 0.7);
        this.meleeRangeIndicator.strokeCircle(0, 0, 40);
      } else if (monsterDistance > this.monsterAttackRange) {
        // OUT OF RANGE: Show distance to get in range with better visibility
        this.meleeRangeIndicator.lineStyle(3, 0xffaa00, 0.6); // Orange color for warning

        // Draw a line from player to monster
        const angle = Phaser.Math.Angle.Between(
          this.player.x,
          this.player.y,
          this.monster.x,
          this.monster.y
        );
        const lineEndX = Math.cos(angle) * (distance - 50);
        const lineEndY = Math.sin(angle) * (distance - 50);

        this.meleeRangeIndicator.moveTo(0, 0);
        this.meleeRangeIndicator.lineTo(lineEndX, lineEndY);
        this.meleeRangeIndicator.strokePath();

        // Show how much closer you need to be
        const distanceToRange = Math.floor(distance - this.meleeRange);
        if (distanceToRange > 0) {
          // Emit distance indicator for UI
          window.dispatchEvent(
            new CustomEvent('distance-indicator', {
              detail: {
                x: this.player.x + lineEndX / 2,
                y: this.player.y + lineEndY / 2 - 10,
                distance: distanceToRange,
              },
            })
          );
        }
      }
    }
  }

  handlePlayerMovement() {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Check if slowdown period has ended
    const currentTime = this.time.now;
    if (this.isSlowed && currentTime > this.slowedUntil) {
      this.isSlowed = false;
      this.player.clearTint(); // Clear tint for Jiwatron sprite
      // Emit updated game state when slowdown ends
      this.emitGameState();
    }

    // Determine current speed based on slowdown status
    const speed = this.isSlowed ? this.slowedSpeed : this.normalSpeed;

    // Reset velocity
    playerBody.setVelocity(0);

    let isMoving = false;
    let moveX = 0;
    let moveY = 0;

    // Handle input
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      moveX = -1;
      this.player.setFlipX(true); // Face left
      isMoving = true;
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      moveX = 1;
      this.player.setFlipX(false); // Face right
      isMoving = true;
    }

    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      moveY = -1;
      isMoving = true;
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      moveY = 1;
      isMoving = true;
    }

    // Check for dash (SHIFT + direction)
    if (
      this.shiftKey &&
      this.shiftKey.isDown &&
      isMoving &&
      !this.isDashing &&
      this.dashCooldown <= 0
    ) {
      // Normalize the direction vector
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      if (length > 0) {
        const dashDirection = {
          x: moveX / length,
          y: moveY / length,
        };
        this.performDash(dashDirection);
      }
    } else if (!this.isDashing) {
      // Normal movement (only if not dashing)
      playerBody.setVelocityX(moveX * speed);
      playerBody.setVelocityY(moveY * speed);
    }

    // Handle soldier animations based on movement
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      this.player.setFlipX(true); // Face left
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      this.player.setFlipX(false); // Face right
    }

    // Update animation based on movement state
    // Don't override attack animations
    const isAttacking =
      this.currentPlayerAnimation === 'soldier_attack01' ||
      this.currentPlayerAnimation === 'soldier_attack02' ||
      this.currentPlayerAnimation === 'soldier_attack03';

    if (isMoving) {
      if (
        !this.isPlayerMoving ||
        this.currentPlayerAnimation !== 'soldier_walk'
      ) {
        this.isPlayerMoving = true;
        // Only change to walk animation if not currently attacking
        if (!isAttacking) {
          this.currentPlayerAnimation = 'soldier_walk';
          if (this.anims.exists('soldier_walk')) {
            this.player.play('soldier_walk');
          }
        }
      }
    } else {
      if (this.isPlayerMoving) {
        this.isPlayerMoving = false;
        // Only change to idle if not currently attacking
        if (!isAttacking) {
          this.currentPlayerAnimation = 'idle';
          // Stop animation to show static frame
          this.player.stop();
        }
      }
    }
  }

  handleMonsterAI() {
    // Stop if no body
    if (!this.monster.body) return;

    const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;

    // If dead or evolving, ensure monster stops moving
    if (this.monsterHealth <= 0 || this.isEvolving) {
      monsterBody.setVelocity(0, 0);
      if (this.monsterHealth <= 0 && !this.isEvolving) {
        monsterBody.enable = false; // Disable physics completely when dead (but not during evolution)
      }
      return;
    }

    const distance = this.getPlayerMonsterDistance();

    // Check if monster can attack
    if (distance <= this.monsterAttackRange && this.playerHealth > 0) {
      // Stop moving when in attack range
      monsterBody.setVelocity(0);

      // Play idle animation when stopped (but not if currently attacking or dead)
      if (
        !this.isMonsterAttacking &&
        this.monsterHealth > 0 &&
        (!this.isMonsterMoving ||
          this.currentMonsterAnimation !== `${this.monsterSpriteKey}_idle`)
      ) {
        this.isMonsterMoving = false;
        this.currentMonsterAnimation = `${this.monsterSpriteKey}_idle`;
        if (this.anims.exists(this.currentMonsterAnimation)) {
          this.monster.play(this.currentMonsterAnimation);
        }
      }

      // Try to attack if cooldown is over
      const currentTime = this.time.now;
      // Adjust cooldown based on monster tier - higher tiers attack slightly faster but not too much
      const monsterName = (this.monsterData.tier?.name || '').toLowerCase();
      let adjustedCooldown = this.monsterAttackCooldown;
      
      // Set specific cooldowns for each tier for better balance
      if (monsterName.includes('orc') && !monsterName.includes('armored') && !monsterName.includes('elite') && !monsterName.includes('rider')) {
        adjustedCooldown = 2500; // Tier 1: 2.5 seconds
      } else if (monsterName.includes('armored orc')) {
        adjustedCooldown = 2400; // Tier 2: 2.4 seconds
      } else if (monsterName.includes('elite orc')) {
        adjustedCooldown = 2300; // Tier 3: 2.3 seconds
      } else if (monsterName.includes('orc rider')) {
        adjustedCooldown = 2200; // Tier 4: 2.2 seconds
      } else if (monsterName.includes('werewolf')) {
        adjustedCooldown = 2100; // Tier 5: 2.1 seconds
      } else if (monsterName.includes('werebear')) {
        adjustedCooldown = 2000; // Tier 6: 2.0 seconds
      }

      if (currentTime > this.lastMonsterAttackTime + adjustedCooldown) {
        this.performMonsterAttack();
        this.lastMonsterAttackTime = currentTime;
      }
    } else if (distance > this.monsterAttackRange) {
      // Move toward player if not in attack range
      const angle = Phaser.Math.Angle.Between(
        this.monster.x,
        this.monster.y,
        this.player.x,
        this.player.y
      );
      // Calculate base speed for this monster
      const baseSpeed = 80;
      const speedMultiplier = 1.5 - this.monsterData.tier.defenseMultiplier; // Inverse relationship
      const normalSpeed = baseSpeed * (1 + speedMultiplier);

      // Check if monster is slowed by frost arrow
      const currentTime = this.time.now;
      let speed: number;

      if (currentTime < this.monsterSlowedUntil) {
        // Monster is slowed - use 50% speed
        speed = normalSpeed * 0.5;
      } else {
        // Use normal speed
        speed = normalSpeed;
        // Clear tint if slow expired
        if (
          this.monsterSlowedUntil > 0 &&
          this.monster.tintTopLeft === 0x88ccff
        ) {
          this.monster.clearTint();
          this.monsterSlowedUntil = 0; // Reset slow timer
        }
      }

      monsterBody.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      // Play walk animation (only if alive)
      if (
        this.monsterHealth > 0 &&
        (this.isMonsterMoving === false ||
          this.currentMonsterAnimation !== `${this.monsterSpriteKey}_walk`)
      ) {
        this.isMonsterMoving = true;
        this.currentMonsterAnimation = `${this.monsterSpriteKey}_walk`;
        if (this.anims.exists(this.currentMonsterAnimation)) {
          this.monster.play(this.currentMonsterAnimation);
        }
      }

      // Face the player
      if (this.player.x < this.monster.x) {
        this.monster.setFlipX(true); // Face left
      } else {
        this.monster.setFlipX(false); // Face right
      }
    }
  }

  handleInputAttacks(time: number) {
    // Check for keyboard attacks
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.attemptMeleeAttack();
    }

    // Arrow type switching with Q key
    if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
      this.switchArrowType();
    }

    // Spear throwing with E key (now shoots arrows)
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      // Set aiming flag for skeleton zigzag
      (this as any).isPlayerAiming = true;
      this.time.delayedCall(500, () => {
        (this as any).isPlayerAiming = false;
      });

      // Safety check: ensure monster exists before calculating angle
      if (this.monster && this.monster.active && this.monsterHealth > 0) {
        const angle = Phaser.Math.Angle.Between(
          this.player.x,
          this.player.y,
          this.monster.x,
          this.monster.y
        );
        this.throwSpearAtAngle(angle);
      }
    }
  }

  attemptMeleeAttack() {
    const time = this.time.now;
    if (time < this.lastMeleeTime + this.meleeCooldown) return;

    // Check combo timing
    if (time - this.lastHitTime > this.comboResetTime) {
      // Combo expired, reset
      this.comboCount = 0;
      this.comboMultiplier = 1.0;
    }

    // Get all enemies in range (including main monster, skeletons, and slimes)
    const enemiesInRange: any[] = [];

    // Check main monster
    if (this.monsterHealth > 0) {
      const distance = this.getPlayerMonsterDistance();
      if (distance < this.meleeRange) {
        enemiesInRange.push({
          target: this.monster,
          type: 'monster',
          distance,
        });
      }
    }

    // Check skeletons
    this.skeletons.getChildren().forEach((skeleton: any) => {
      if (skeleton.active) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          skeleton.x,
          skeleton.y
        );
        if (dist < this.meleeRange) {
          enemiesInRange.push({
            target: skeleton,
            type: 'skeleton',
            distance: dist,
          });
        }
      }
    });

    // Check slimes
    this.slimes.getChildren().forEach((slime: any) => {
      if (slime.active) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          slime.x,
          slime.y
        );
        if (dist < this.meleeRange) {
          enemiesInRange.push({ target: slime, type: 'slime', distance: dist });
        }
      }
    });

    // Always perform the swing animation
    this.performMeleeSwing(enemiesInRange.length > 0, enemiesInRange);
    this.lastMeleeTime = time;
  }

  performMeleeSwing(willHit: boolean, enemiesInRange: any[] = []) {
    // Calculate angle - if enemies in range, face the closest one
    let angleToTarget = 0;
    if (enemiesInRange.length > 0) {
      const closest = enemiesInRange.reduce((a, b) =>
        a.distance < b.distance ? a : b
      );
      angleToTarget = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        closest.target.x,
        closest.target.y
      );
    } else if (this.monster && this.monster.active) {
      // Fallback to monster if no enemies in range
      angleToTarget = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        this.monster.x,
        this.monster.y
      );
    }

    // Play random melee attack animation (Attack01 or Attack02)
    const attackAnim =
      Phaser.Math.Between(1, 2) === 1 ? 'soldier_attack01' : 'soldier_attack02';
    if (this.anims.exists(attackAnim)) {
      this.currentPlayerAnimation = attackAnim;
      this.player.play(attackAnim);

      // Return to idle after attack completes
      this.player.once('animationcomplete', () => {
        if (!this.isPlayerMoving) {
          this.currentPlayerAnimation = 'idle';
          // Stop animation to show static frame
          this.player.stop();
        } else {
          this.currentPlayerAnimation = 'soldier_walk';
          if (this.anims.exists('soldier_walk')) {
            this.player.play('soldier_walk');
          }
        }
      });
    }

    // Create sword swing effect
    const swingGraphics = this.add.graphics();
    swingGraphics.setPosition(this.player.x, this.player.y);
    swingGraphics.setDepth(10);

    // Draw sword arc - always same size
    const arcAngle = Phaser.Math.DegToRad(90);
    const swingReach = 180; // Visual reach of sword

    if (willHit) {
      // Successful hit - bright white swing
      swingGraphics.lineStyle(4, 0xffffff, 0.8);
    } else {
      // Miss - dimmer red swing
      swingGraphics.lineStyle(3, 0xff6666, 0.5);
    }

    swingGraphics.beginPath();
    swingGraphics.arc(
      0,
      0,
      swingReach,
      angleToTarget - arcAngle / 2,
      angleToTarget + arcAngle / 2,
      false
    );
    swingGraphics.strokePath();

    // Add whoosh effect for misses
    if (!willHit) {
      // Create "whoosh" lines
      for (let i = 0; i < 3; i++) {
        const offsetAngle = angleToTarget + (i - 1) * 0.1;
        swingGraphics.lineStyle(2, 0xcccccc, 0.3 - i * 0.1);
        swingGraphics.beginPath();
        swingGraphics.arc(
          0,
          0,
          swingReach + i * 10,
          offsetAngle - arcAngle / 3,
          offsetAngle + arcAngle / 3,
          false
        );
        swingGraphics.strokePath();
      }
    }

    // Animate the swing
    this.tweens.add({
      targets: swingGraphics,
      alpha: 0,
      scaleX: willHit ? 1.2 : 1.1,
      scaleY: willHit ? 1.2 : 1.1,
      duration: willHit ? 200 : 300,
      onComplete: () => swingGraphics.destroy(),
    });

    // Player attack animation
    this.tweens.add({
      targets: this.player,
      scaleX: 2.5,
      scaleY: 2.5,
      duration: 100,
      yoyo: true,
      ease: 'Power1',
    });

    if (willHit) {
      // Delay damage to sync with animation (6 frames at 12fps = 500ms, hit at frame 3 = ~250ms)
      this.time.delayedCall(250, () => {
        let hitSomething = false;

        // Deal damage to all enemies that are still in range
        enemiesInRange.forEach((enemy) => {
          // Re-check distance for each enemy
          const currentDist = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            enemy.target.x,
            enemy.target.y
          );

          if (currentDist <= this.meleeRange * 1.2) {
            // Grace zone
            hitSomething = true;

            // Calculate damage with combo multiplier
            const baseDamage =
              enemy.type === 'monster'
                ? Math.floor(Math.random() * 15) + 10 // 10-25 for monster (reduced)
                : Math.floor(Math.random() * 10) + 15; // 15-25 for others
            const damage = Math.floor(baseDamage * this.comboMultiplier);
            const isCrit = this.comboCount >= 2; // 3rd hit is always crit

            if (enemy.type === 'monster') {
              // Use existing dealMeleeDamage for monster (it handles evolution)
              this.dealMeleeDamage();
            } else if (
              enemy.type === 'skeleton' &&
              enemy.target instanceof SkeletonEnemy
            ) {
              const killed = enemy.target.takeDamage(damage);
              this.showDamageNumber(
                enemy.target.x,
                enemy.target.y - 40,
                damage,
                0xff4444,
                isCrit
              );
              if (killed) {
                // Check if all enemies are defeated after skeleton dies
                this.time.delayedCall(600, () => {
                  if (this.isMainMonsterDead && !this.isGameOver) {
                    const remainingSkeletons = this.skeletons
                      ? this.skeletons.getLength()
                      : 0;
                    if (remainingSkeletons === 0) {
                      this.gameOver(true);
                    }
                  }
                });
              }
            } else if (
              enemy.type === 'slime' &&
              enemy.target instanceof SlimeEnemy
            ) {
              enemy.target.takeDamage(damage);
              this.showDamageNumber(
                enemy.target.x,
                enemy.target.y - 40,
                damage,
                0xff4444,
                isCrit
              );
            }
          }
        });

        if (hitSomething) {
          // Play sword hit sound
          if (this.cache.audio.exists('sword_hit')) {
            this.sound.play('sword_hit', { volume: 0.4 });
          }
          
          // Successful hit - update combo
          this.comboCount++;
          this.lastHitTime = this.time.now;

          // Update multiplier
          if (this.comboCount === 1) {
            this.comboMultiplier = 1.0;
          } else if (this.comboCount === 2) {
            this.comboMultiplier = 1.25;
          } else if (this.comboCount >= 3) {
            this.comboMultiplier = 1.5;
          }

          // Show combo counter
          if (this.comboCount > 1) {
            this.showComboCounter();
          }

          // Trigger spin attack on 3rd hit
          if (this.comboCount === 3) {
            this.time.delayedCall(100, () => {
              this.performSpinAttack();
              // Reset combo after spin attack
              this.comboCount = 0;
              this.comboMultiplier = 1.0;
            });
          }
        } else {
          this.showMissFeedback();
        }
      });
    } else {
      // Show miss feedback immediately for out-of-range attacks
      this.showMissFeedback();
    }
  }

  showMissFeedback() {
    // Play sword miss sound
    if (this.cache.audio.exists('sword_miss')) {
      this.sound.play('sword_miss', { volume: 0.3 });
    }
    
    // Subtle miss indicators
    const missText = this.add.text(
      this.player.x + 50,
      this.player.y - 30,
      'Miss!',
      {
        fontSize: '18px',
        color: '#ff9999',
        stroke: '#000000',
        strokeThickness: 2,
      }
    );

    this.tweens.add({
      targets: missText,
      y: missText.y - 20,
      alpha: 0,
      duration: 500,
      onComplete: () => missText.destroy(),
    });
  }

  dealMeleeDamage() {
    // Don't attack if we can't damage the monster
    if (!this.canDamageMonster()) {
      return;
    }

    // Critical hit calculation (20% chance)
    const isCrit = Math.random() < 0.2;

    // Calculate base damage
    let damage = Math.floor(Math.random() * 15) + 10; // 10-25 damage (reduced)

    // Apply critical multiplier
    if (isCrit) {
      damage = Math.floor(damage * 2); // 2x damage for crits
    }

    // For werewolf, check evolution threshold and cap damage

    if (
      this.monsterData.tier.name === 'Werewolf' &&
      !this.isEvolved &&
      !this.isEvolving
    ) {
      const evolutionThreshold = Math.floor(this.monsterMaxHealth * 0.1); // 10% health
      // If damage would bring health to or below 10%, cap at exactly 10%
      if (this.monsterHealth - damage <= evolutionThreshold) {
        // Cap damage to exactly reach threshold
        damage = this.monsterHealth - evolutionThreshold;
        this.monsterHealth = evolutionThreshold;

        // Show capped damage
        this.showDamageNumber(
          this.monster.x,
          this.monster.y - 40,
          damage,
          0xff4444,
          isCrit
        );

        // Emit updated game state before evolution
        this.emitGameState();

        // Trigger evolution and return early
        this.evolveToWerebear();
        return;
      }
    }

    this.monsterHealth = Math.max(0, this.monsterHealth - damage);

    this.showDamageNumber(
      this.monster.x,
      this.monster.y - 40,
      damage,
      0xff4444,
      isCrit
    );

    // Emit updated game state
    this.emitGameState();

    // Play hurt or death animation
    if (this.monsterHealth <= 0) {
      // Monster died - play death animation
      // Werewolves should never reach here due to evolution at 10%
      if (
        this.monsterData.tier.name === 'Werewolf' &&
        !this.isEvolved &&
        !this.isEvolving
      ) {
        console.error(
          'Warning: Werewolf died without evolving - this should not happen!'
        );
      }

      {
        // Play death animation
        // Use the current sprite key which is 'werebear' if evolved
        const deathKey = `${this.monsterSpriteKey}_death`;
        if (this.anims.exists(deathKey)) {
          this.currentMonsterAnimation = deathKey;
          this.monster.play(deathKey);
          // Don't return to idle after death - stay on last frame
        }

        // Fade to grey
        this.monster.setTint(0x666666);

        // Stop monster movement
        if (this.monster.body) {
          const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;
          monsterBody.setVelocity(0, 0);
          monsterBody.enable = false;
        }
      }
    } else {
      // Monster hurt - play hurt animation
      const hurtKey = `${this.monsterSpriteKey}_hurt`;
      if (this.anims.exists(hurtKey)) {
        this.currentMonsterAnimation = hurtKey;
        this.monster.play(hurtKey);

        // Return to idle after hurt animation
        this.monster.once('animationcomplete', () => {
          if (this.monsterHealth > 0) {
            // Only return to idle if still alive
            this.currentMonsterAnimation = `${this.monsterSpriteKey}_idle`;
            if (this.anims.exists(this.currentMonsterAnimation)) {
              this.monster.play(this.currentMonsterAnimation);
            }
            this.isMonsterMoving = false;
          }
        });
      }

      // Flash effect
      this.monster.setTint(0xffffff);
      this.time.delayedCall(100, () => {
        this.monster.setTint(0xff4444);
      });
    }
  }

  performMonsterAttack() {
    // Don't attack if monster can't act
    if (!this.canMonsterAct()) {
      return;
    }

    // Set attacking flag to prevent idle animation override
    this.isMonsterAttacking = true;

    // Stop movement during attack to make animation visible
    if (this.monster.body) {
      const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;
      monsterBody.setVelocity(0, 0);
    }
    this.isMonsterMoving = false;

    // Play attack animation (randomly choose between attack01 and attack02)
    const attackAnim =
      Phaser.Math.Between(1, 2) === 1
        ? `${this.monsterSpriteKey}_attack01`
        : `${this.monsterSpriteKey}_attack02`;

    if (this.anims.exists(attackAnim)) {
      this.currentMonsterAnimation = attackAnim;
      this.monster.play(attackAnim);

      // Delay damage to sync with animation impact (halfway through animation)
      // Animation is 6 frames at 12fps = 500ms total, so impact at ~250ms
      this.time.delayedCall(250, () => {
        this.applyMonsterDamage();
      });

      // Return to idle after attack
      this.monster.once('animationcomplete', () => {
        this.isMonsterAttacking = false; // Clear attacking flag
        this.currentMonsterAnimation = `${this.monsterSpriteKey}_idle`;
        if (this.anims.exists(this.currentMonsterAnimation)) {
          this.monster.play(this.currentMonsterAnimation);
        }
        this.isMonsterMoving = false;
      });
    } else {
      // Fallback tween animation with immediate damage
      this.tweens.add({
        targets: this.monster,
        scaleX: 3,
        scaleY: 3,
        duration: 150,
        yoyo: true,
        ease: 'Power1',
        onComplete: () => {
          this.isMonsterAttacking = false; // Clear attacking flag after tween
        },
      });

      // For fallback, apply damage immediately
      this.applyMonsterDamage();
    }
  }

  private applyMonsterDamage() {
    // Check if player is invincible (from dash)
    if (this.isInvincible) {
      // Show dodge feedback
      this.showBonusText('DODGED!', 0x00ffff);
      return;
    }

    // Check if player is still in range (they might have moved away)
    const distance = this.getPlayerMonsterDistance();
    if (distance > this.monsterAttackRange * 1.5) {
      return; // Attack misses if player moved away
    }

    // Create claw swipe effect
    const swipeGraphics = this.add.graphics();
    swipeGraphics.setPosition(this.player.x, this.player.y);
    swipeGraphics.setDepth(10);

    // Draw claw marks
    swipeGraphics.lineStyle(3, 0xff0000, 0.8);
    for (let i = 0; i < 3; i++) {
      swipeGraphics.moveTo(-20 + i * 20, -30);
      swipeGraphics.lineTo(-10 + i * 20, 30);
    }
    swipeGraphics.strokePath();

    // Animate the swipe
    this.tweens.add({
      targets: swipeGraphics,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      onComplete: () => swipeGraphics.destroy(),
    });

    // Deal damage to player based on monster's attack power
    let baseDamage = this.monsterData.tier.attackPower;
    
    // Balance adjustment for higher tier monsters
    const monsterName = (this.monsterData.tier?.name || '').toLowerCase();
    if (monsterName.includes('werewolf')) {
      baseDamage = Math.min(baseDamage, 30); // Cap werewolf damage
    } else if (monsterName.includes('werebear')) {
      baseDamage = Math.min(baseDamage, 35); // Cap werebear damage  
    } else if (monsterName.includes('orc rider')) {
      baseDamage = Math.min(baseDamage, 25); // Cap orc rider damage
    }
    
    // Calculate actual damage: (baseDamage/2) to (baseDamage + baseDamage/2)
    let damage =
      Math.floor(Math.random() * baseDamage) + Math.floor(baseDamage / 2);
    
    // Apply shield reduction if active
    if (this.shieldStacks > 0) {
      damage = Math.floor(damage * 0.2); // 80% damage reduction
      this.shieldStacks--;
      
      // Visual feedback for shield block
      const shieldText = this.add.text(
        this.player.x,
        this.player.y - 40,
        '🛡️ BLOCKED!',
        {
          fontSize: '16px',
          color: '#ffff00',
          stroke: '#000000',
          strokeThickness: 3
        }
      ).setOrigin(0.5);
      
      this.tweens.add({
        targets: shieldText,
        y: shieldText.y - 20,
        alpha: 0,
        duration: 800,
        onComplete: () => shieldText.destroy()
      });
    }
    
    this.playerHealth = Math.max(0, this.playerHealth - damage);

    console.log(
      'Damage dealt:',
      damage,
      'Player health after:',
      this.playerHealth
    );

    // Show damage number
    this.showDamageNumber(this.player.x, this.player.y - 40, damage, 0xff0000);

    // Screen shake effect
    this.cameras.main.shake(100, 0.01);

    // Emit updated game state
    this.emitGameState();

    // Play hurt or death animation based on health
    if (this.playerHealth <= 0) {
      // Player died from this attack
      if (this.anims.exists('soldier_death')) {
        this.currentPlayerAnimation = 'soldier_death';
        this.player.play('soldier_death');
        // Don't return to idle after death - stay on last frame
      }
    } else if (this.anims.exists('soldier_hurt')) {
      // Player still alive, play hurt animation
      this.currentPlayerAnimation = 'soldier_hurt';
      this.player.play('soldier_hurt');

      // Return to idle after hurt animation completes
      this.player.once('animationcomplete', () => {
        if (this.playerHealth > 0) {
          // Only return to idle if still alive
          if (!this.isPlayerMoving) {
            this.currentPlayerAnimation = 'idle';
            // Stop animation to show static frame
            this.player.stop();
          } else {
            this.currentPlayerAnimation = 'soldier_walk';
            if (this.anims.exists('soldier_walk')) {
              this.player.play('soldier_walk');
            }
          }
        }
      });
    }

    // Flash red tint
    this.player.setTint(0xff0000);

    // Clear tint after a short delay
    this.time.delayedCall(200, () => {
      this.player.clearTint();
    });

    // Check if game is over
    this.checkGameOver();
  }

  throwSpear(pointer?: Phaser.Input.Pointer) {
    if (pointer) {
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );
      this.throwSpearAtAngle(angle);
    }
  }

  throwSpearAtAngle(angle: number) {
    const time = this.time.now;

    // Check cooldown and spear availability
    if (time < this.lastSpearTime + this.spearCooldown) {
      return;
    }

    if (this.currentSpears <= 0) {
      // Emit feedback event
      window.dispatchEvent(
        new CustomEvent('combat-feedback', {
          detail: {
            type: 'no-spears',
            x: this.player.x,
            y: this.player.y,
            text: 'No spears!',
          },
        })
      );
      return;
    }

    // Safety check: ensure spear group exists
    if (!this.spears) {
      console.error('Spear group not initialized!');
      return;
    }

    // Check if player is facing toward the target
    const angleToMonster = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.monster.x,
      this.monster.y
    );

    // Determine player's facing direction based on flipX
    // flipX = true means facing left (angle = π or -π)
    // flipX = false means facing right (angle = 0)
    const playerFacingAngle = this.player.flipX ? Math.PI : 0;

    // Calculate the difference between where player is facing and where monster is
    let angleDifference = Math.abs(angleToMonster - playerFacingAngle);

    // Normalize angle difference to be within -π to π
    if (angleDifference > Math.PI) {
      angleDifference = 2 * Math.PI - angleDifference;
    }

    // Check if angle is within 90 degrees (π/2 radians) cone
    const maxAllowedAngle = Math.PI / 2; // 90 degrees
    const willMiss = angleDifference > maxAllowedAngle;

    console.log(
      'Spear throw - Facing:',
      this.player.flipX ? 'left' : 'right',
      'Angle to monster:',
      angleToMonster,
      'Difference:',
      angleDifference,
      'Will miss:',
      willMiss
    );

    // Play spear throw animation (Attack03)
    if (this.anims.exists('soldier_attack03')) {
      this.currentPlayerAnimation = 'soldier_attack03';
      this.player.play('soldier_attack03');

      // Return to idle after attack completes
      this.player.once('animationcomplete', () => {
        if (!this.isPlayerMoving) {
          this.currentPlayerAnimation = 'idle';
          // Stop animation to show static frame
          this.player.stop();
        } else {
          this.currentPlayerAnimation = 'soldier_walk';
          if (this.anims.exists('soldier_walk')) {
            this.player.play('soldier_walk');
          }
        }
      });
    }

    try {
      // Check if spear texture exists
      if (!this.textures.exists('spear-texture')) {
        console.error('Spear texture does not exist! Creating fallback...');
        this.createSpearTexture();
      }

      // Create arrow sprite based on current type
      const arrowData = this.arrowTypes[this.currentArrowType];
      const spear = this.spears.create(
        this.player.x,
        this.player.y,
        arrowData.sprite
      );

      if (!spear) {
        console.error('Failed to create arrow sprite!');
        return;
      }

      // Set arrow properties based on type
      spear.setData('arrowType', this.currentArrowType);
      spear.setData('damageMultiplier', arrowData.damage);
      spear.setScale(0.3); // Arrows are smaller than spears

      // If the spear will miss, alter its trajectory
      let actualAngle = angle;
      if (willMiss) {
        // Spear goes off in the wrong direction (add random offset)
        const missOffset = ((Math.random() - 0.5) * Math.PI) / 3; // Random offset up to 60 degrees
        actualAngle =
          angle + missOffset + (this.player.flipX ? -Math.PI / 4 : Math.PI / 4);

        // Mark spear as a miss so it won't deal damage
        spear.setData('willMiss', true);

        // Visual feedback - tint the spear red to show it's a bad throw
        spear.setTint(0xff6666);

        // Show feedback text
        const feedbackText = this.add.text(
          this.player.x,
          this.player.y - 50,
          'Wrong Direction!',
          {
            fontSize: '14px',
            color: '#ff6666',
            stroke: '#000000',
            strokeThickness: 2,
          }
        );

        this.tweens.add({
          targets: feedbackText,
          y: feedbackText.y - 30,
          alpha: 0,
          duration: 800,
          onComplete: () => feedbackText.destroy(),
        });
      } else {
        spear.setData('willMiss', false);
      }

      spear.rotation = actualAngle;

      // Set spear velocity
      const speed = willMiss ? 350 : 400; // Slightly slower for misses
      spear.setVelocity(
        Math.cos(actualAngle) * speed,
        Math.sin(actualAngle) * speed
      );

      // Play arrow shoot sound
      if (this.cache.audio.exists('arrow_shoot')) {
        this.sound.play('arrow_shoot', { volume: 0.3 });
      }

      // Update spear count
      const beforeCount = this.currentSpears;
      this.currentSpears--;
      this.lastSpearTime = time;

      // Start recharge animation if we have spears to regenerate
      if (this.currentSpears < this.maxSpears) {
        if (!this.spearRechargeIndicator) {
          console.warn('Spear recharge indicator not yet created!');
        } else if (this.spearRechargeIndicator.getIsActive()) {
        } else {
          this.spearRechargeIndicator.startRecharge();
        }
      }

      // Emit updated game state
      this.emitGameState();

      // Apply movement slowdown penalty
      this.applySpearSlowdown();

      // Auto-destroy spear after 2 seconds
      this.time.delayedCall(2000, () => {
        if (spear && spear.active) {
          spear.destroy();
        }
      });
    } catch (error) {
      console.error('Error throwing spear:', error);
    }
  }

  applySpearSlowdown() {
    // Apply movement slowdown based on arrow type
    const arrowData = this.arrowTypes[this.currentArrowType];
    const slowDuration =
      arrowData.slowDuration !== undefined ? arrowData.slowDuration : 800; // Default to 800ms if not specified

    if (slowDuration > 0) {
      this.isSlowed = true;
      this.slowedUntil = this.time.now + slowDuration;
    } else {
      // No slow for frost arrows
      this.isSlowed = false;
    }

    // Visual feedback: tint player orange to show slowdown (only if slowed)
    if (this.isSlowed) {
      this.player.setTint(0xffa500);
    }

    // Emit slowdown feedback
    window.dispatchEvent(
      new CustomEvent('combat-feedback', {
        detail: {
          type: 'slowed',
          x: this.player.x,
          y: this.player.y,
          text: 'Slowed!',
        },
      })
    );
  }

  checkSpearCollisions() {
    // Safety check: ensure monster exists and has not been destroyed
    if (!this.monster || !this.monster.active || !this.monster.body) {
      return;
    }

    // Clear debug graphics
    if (this.debugMode) {
      this.debugGraphics.clear();

      // Draw monster collision circle
      this.debugGraphics.lineStyle(2, 0x00ff00, 0.5);
      this.debugGraphics.strokeCircle(this.monster.x, this.monster.y, 40);
    }

    // Manual collision detection for each spear
    this.spears.children.entries.forEach((spearObj) => {
      const spear = spearObj as Phaser.GameObjects.Sprite;

      // Skip if spear is not active
      if (!spear.active) return;

      // Calculate distance between spear and monster
      const distance = Phaser.Math.Distance.Between(
        spear.x,
        spear.y,
        this.monster.x,
        this.monster.y
      );

      // Debug: Draw line from spear to monster
      if (this.debugMode) {
        this.debugGraphics.lineStyle(
          1,
          distance < 40 ? 0xff0000 : 0xffffff,
          0.3
        );
        this.debugGraphics.strokeLineShape(
          new Phaser.Geom.Line(spear.x, spear.y, this.monster.x, this.monster.y)
        );

        // Emit debug distance for UI
        window.dispatchEvent(
          new CustomEvent('debug-distance', {
            detail: {
              x: spear.x,
              y: spear.y - 10,
              distance: Math.floor(distance),
            },
          })
        );
      }

      // Check if collision occurred (within 40 pixels)
      if (distance < 40) {
        // Check if this spear is marked as a miss
        const willMiss = spear.getData('willMiss');

        if (willMiss) {
          // Show miss feedback at impact point
          const missText = this.add.text(
            this.monster.x,
            this.monster.y - 60,
            'Bad Angle!',
            {
              fontSize: '16px',
              color: '#ff6666',
              stroke: '#000000',
              strokeThickness: 2,
            }
          );

          this.tweens.add({
            targets: missText,
            y: missText.y - 20,
            alpha: 0,
            duration: 600,
            onComplete: () => missText.destroy(),
          });

          // Destroy the spear
          spear.destroy();
          return; // Skip damage calculation
        }

        console.log(
          'COLLISION! Distance:',
          distance,
          'Monster HP:',
          this.monsterHealth
        );

        // Only damage if we can damage the monster and it still exists
        if (this.canDamageMonster() && this.monster && this.monster.active) {
          // Critical hit calculation (20% chance)
          const isCrit = Math.random() < 0.2;

          // Get arrow type and damage multiplier
          const arrowType = spear.getData('arrowType') || 'yellow';
          const damageMultiplier = spear.getData('damageMultiplier') || 1.0;

          // Deal significantly reduced damage for ranged attack (8-12 instead of 15-40 for melee)
          let damage = Math.floor(Math.random() * 5) + 8; // 8-12 base damage

          // Apply arrow type multiplier
          damage = Math.floor(damage * damageMultiplier);

          // Apply critical multiplier
          if (isCrit) {
            damage = Math.floor(damage * 2); // 2x damage for crits
          }

          // Handle special arrow effects
          if (arrowType === 'red') {
            // Red arrow: Explosive AOE damage
            this.createExplosion(this.monster.x, this.monster.y);
            // Damage nearby skeletons
            this.damageNearbyEnemies(
              this.monster.x,
              this.monster.y,
              damage * 0.5,
              100
            );
          } else if (arrowType === 'blue') {
            // Blue arrow (Frost): Apply slow effect to monster
            this.monsterSlowedUntil = this.time.now + 2000; // 2 second slow

            // Visual feedback - tint monster blue
            this.monster.setTint(0x88ccff);

            // Show slow effect text
            const slowText = this.add
              .text(this.monster.x, this.monster.y - 60, '❄️ SLOWED', {
                fontSize: '18px',
                color: '#88ccff',
                stroke: '#000000',
                strokeThickness: 3,
              })
              .setOrigin(0.5);

            this.tweens.add({
              targets: slowText,
              y: slowText.y - 30,
              alpha: 0,
              duration: 1000,
              onComplete: () => slowText.destroy(),
            });
          }

          // For werewolf, check evolution threshold and cap damage
          console.log('Spear evolution check:', {
            tierName: this.monsterData.tier?.name,
            monsterType: this.monsterData.type,
            hasEvolutionData: !!this.monsterData.evolution,
            isEvolved: this.isEvolved,
            isEvolving: this.isEvolving,
            currentHealth: this.monsterHealth,
            maxHealth: this.monsterMaxHealth,
          });

          if (
            this.monsterData.tier.name === 'Werewolf' &&
            !this.isEvolved &&
            !this.isEvolving
          ) {
            const evolutionThreshold = Math.floor(this.monsterMaxHealth * 0.1); // 10% health
            // If damage would bring health to or below 10%, cap at exactly 10%
            if (this.monsterHealth - damage <= evolutionThreshold) {
              // Cap damage to exactly reach threshold
              damage = this.monsterHealth - evolutionThreshold;
              this.monsterHealth = evolutionThreshold;

              // Show capped damage
              this.showDamageNumber(
                this.monster.x,
                this.monster.y - 40,
                damage,
                0xffaa00,
                isCrit
              );

              // Emit updated game state before evolution
              this.emitGameState();

              // Destroy spear and trigger evolution
              spear.destroy();
              this.evolveToWerebear();
              return; // Exit early from collision handler
            }
          }

          this.monsterHealth = Math.max(0, this.monsterHealth - damage);

          console.log(
            'Spear damage dealt:',
            damage,
            isCrit ? '(CRITICAL!)' : '',
            'New HP:',
            this.monsterHealth
          );

          // Show damage number with spear color
          this.showDamageNumber(
            this.monster.x,
            this.monster.y - 40,
            damage,
            0xffaa00,
            isCrit
          );

          // Emit updated game state
          this.emitGameState();

          // Play hurt or death animation (ensure monster still exists)
          if (this.monster && this.monster.active) {
            if (this.monsterHealth <= 0) {
              // Monster died - play death animation
              // Werewolves should never reach here due to evolution at 10%
              if (
                this.monsterData.tier.name === 'Werewolf' &&
                !this.isEvolved &&
                !this.isEvolving
              ) {
                console.error(
                  'Warning: Werewolf died without evolving - this should not happen!'
                );
              }

              {
                // Play death animation
                // Use the current sprite key which is 'werebear' if evolved
                const deathKey = `${this.monsterSpriteKey}_death`;
                if (this.anims.exists(deathKey)) {
                  this.currentMonsterAnimation = deathKey;
                  this.monster.play(deathKey);
                  // Don't return to idle after death
                } else {
                  // Fallback for placeholder sprites
                  this.monster.setTint(0x666666);
                }
              }
            } else {
              // Monster hurt - play hurt animation
              const hurtKey = `${this.monsterSpriteKey}_hurt`;
              if (this.anims.exists(hurtKey)) {
                this.currentMonsterAnimation = hurtKey;
                this.monster.play(hurtKey);

                // Return to idle after hurt animation
                this.monster.once('animationcomplete', () => {
                  if (this.monsterHealth > 0) {
                    // Only return to idle if still alive
                    this.currentMonsterAnimation = `${this.monsterSpriteKey}_idle`;
                    if (this.anims.exists(this.currentMonsterAnimation)) {
                      this.monster.play(this.currentMonsterAnimation);
                    }
                    this.isMonsterMoving = false;
                  }
                });
              }

              // Flash effect
              this.monster.setTint(0xffffaa);
              this.time.delayedCall(100, () => {
                if (this.monster && this.monster.active) {
                  this.monster.setTint(0xff4444);
                }
              });
            }
          }

          // If monster just died, stop it immediately
          if (this.monsterHealth <= 0 && this.monster.body) {
            const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;
            monsterBody.setVelocity(0, 0);
            monsterBody.enable = false;
          }
        }

        // Safely destroy the arrow after processing
        if (spear && spear.active) {
          spear.destroy();
        }
        // Blue arrows continue through enemies
      }
    });
  }

  regenerateSpears(time: number) {
    // Note: This method is now replaced by the Phaser-based recharge indicator
    // The spear regeneration is handled by the onSpearRecharged event
  }

  private onSpearRecharged(): void {
    // Simple logic: add 1 spear
    this.currentSpears++;

    // If still under max, start another recharge
    if (this.currentSpears < this.maxSpears) {
      this.spearRechargeIndicator.startRecharge();
    } else {
      // At max, hide indicator
      this.spearRechargeIndicator.reset();
    }

    this.emitGameState();
  }

  emitSpritePositions() {
    // Get screen positions for sprites
    const camera = this.cameras.main;

    const playerScreenPos = camera.getWorldPoint(this.player.x, this.player.y);
    const monsterScreenPos = camera.getWorldPoint(
      this.monster.x,
      this.monster.y
    );

    window.dispatchEvent(
      new CustomEvent('sprite-positions', {
        detail: {
          player: { x: playerScreenPos.x, y: playerScreenPos.y },
          monster: {
            x: monsterScreenPos.x,
            y: monsterScreenPos.y,
            alive: this.monsterHealth > 0,
          },
        },
      })
    );
  }

  showDamageNumber(
    x: number,
    y: number,
    damage: number,
    color: number,
    isCrit: boolean = false
  ) {
    // Emit damage number event for UI to display
    window.dispatchEvent(
      new CustomEvent('damage-number', {
        detail: {
          x: x,
          y: y,
          damage: damage,
          color: Phaser.Display.Color.IntegerToColor(color).rgba,
          isCrit: isCrit,
        },
      })
    );
  }

  // Removed updatePlayerHealthBar and updateMonsterHealthBar methods
  // These are now handled by the UI through event emissions

  checkGameOver() {
    if (this.isGameOver) return;

    if (this.playerHealth <= 0) {
      this.gameOver(false); // Player died
    } else if (this.monsterHealth <= 0 && !this.isEvolving) {
      // Main monster is dead (and not evolving), check if there are any remaining hostile enemies (skeletons)
      const remainingSkeletons = this.skeletons
        ? this.skeletons.getLength()
        : 0;

      if (remainingSkeletons === 0) {
        // All hostile enemies defeated - player wins
        this.gameOver(true);
      } else {
        // Main monster dead but skeletons remain - mark boss as dead to stop spawning
        this.isMainMonsterDead = true;
        this.stopAllSpawning();

        // Play main monster death animation if not already playing
        const deathKey = `${this.monsterSpriteKey}_death`;
        if (
          this.anims.exists(deathKey) &&
          this.monster &&
          this.monster.active
        ) {
          this.currentMonsterAnimation = deathKey;
          this.monster.play(deathKey);
          this.monster.setTint(0x666666);

          // Disable monster physics
          if (this.monster.body) {
            const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;
            monsterBody.setVelocity(0, 0);
            monsterBody.enable = false;
          }
        }
      }
    }
  }

  private evolveToWerebear() {
    this.isEvolving = true;

    // Store initial positions for reset
    const { width, height } = this.cameras.main;
    const initialPlayerX = width * 0.3;
    const initialPlayerY = height * 0.5;
    const initialMonsterX = width * 0.7;
    const initialMonsterY = height * 0.5;

    // Disable player input during evolution
    this.isPlayerMoving = false;

    // Phase 1: Monster Roar (0-500ms)
    const hurtKey = `${this.monsterSpriteKey}_hurt`;
    if (this.anims.exists(hurtKey)) {
      this.currentMonsterAnimation = hurtKey;
      this.monster.play(hurtKey);
    }

    // Roar text that expands
    const roarText = this.add.text(
      this.monster.x,
      this.monster.y - 80,
      'ROAAAAR!',
      {
        fontSize: '36px',
        color: '#ff6600',
        stroke: '#000000',
        strokeThickness: 5,
      }
    );
    roarText.setOrigin(0.5);
    roarText.setDepth(101);
    roarText.setScale(0.5);

    // Animate roar text expanding
    this.tweens.add({
      targets: roarText,
      scale: 2,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => roarText.destroy(),
    });

    // Monster scales up slightly during roar
    this.tweens.add({
      targets: this.monster,
      scaleX: this.monster.scaleX * 1.2,
      scaleY: this.monster.scaleY * 1.2,
      duration: 300,
      yoyo: true,
      ease: 'Power2',
    });

    // Play roar sound if available
    if (this.sound.get('monster_roar')) {
      this.sound.play('monster_roar', { volume: 0.8 });
    }

    // Phase 2: Shockwave & Knockback (500-1200ms)
    this.time.delayedCall(500, () => {
      // Create expanding shockwave
      const shockwave = this.add.graphics();
      shockwave.setDepth(50);
      shockwave.lineStyle(4, 0xffffff, 1);
      shockwave.strokeCircle(this.monster.x, this.monster.y, 10);

      // Animate shockwave expanding
      let radius = 10;
      const shockwaveTween = this.tweens.add({
        targets: { radius: 10 },
        radius: 300,
        duration: 700,
        ease: 'Power2',
        onUpdate: (tween) => {
          const value = tween.getValue();
          if (value !== null) {
            shockwave.clear();
            shockwave.lineStyle(4, 0xffffff, 1 - value / 300);
            shockwave.strokeCircle(this.monster.x, this.monster.y, value);
          }
        },
        onComplete: () => shockwave.destroy(),
      });

      // Knockback player
      const knockbackDistance = 200;
      const angle = Phaser.Math.Angle.Between(
        this.monster.x,
        this.monster.y,
        this.player.x,
        this.player.y
      );

      // Calculate knockback position
      const knockbackX = this.player.x + Math.cos(angle) * knockbackDistance;
      const knockbackY = this.player.y + Math.sin(angle) * knockbackDistance;

      // Play player hurt animation
      if (this.anims.exists('soldier_hurt')) {
        this.player.play('soldier_hurt');
      }

      // Knockback tween with rotation
      this.tweens.add({
        targets: this.player,
        x: knockbackX,
        y: knockbackY,
        rotation: this.player.rotation + Math.PI / 4, // Slight tumble
        duration: 400,
        ease: 'Power2.Out',
        onComplete: () => {
          // Reset rotation
          this.player.rotation = 0;
        },
      });

      // Dust particles at player feet
      const dustParticles = this.add.particles(
        this.player.x,
        this.player.y + 20,
        'spark-placeholder',
        {
          lifespan: 600,
          speed: { min: 50, max: 150 },
          scale: { start: 0.5, end: 0 },
          blendMode: 'NORMAL',
          tint: 0x8b7355,
          quantity: 15,
          gravityY: 100,
        }
      );

      this.time.delayedCall(800, () => dustParticles.destroy());

      // Camera shake
      this.cameras.main.shake(700, 0.015);
    });

    // Phase 3: Transformation Build-up (1200-1800ms)
    this.time.delayedCall(1200, () => {
      // Transforming text
      const evolutionText = this.add.text(
        this.monster.x,
        this.monster.y - 100,
        'TRANSFORMING!',
        {
          fontSize: '32px',
          color: '#ff00ff',
          stroke: '#000000',
          strokeThickness: 4,
        }
      );
      evolutionText.setOrigin(0.5);
      evolutionText.setDepth(100);

      // Purple energy particles gathering
      const energyParticles = this.add.particles(
        this.monster.x,
        this.monster.y,
        'spark-placeholder',
        {
          lifespan: 600,
          speed: { min: 0, max: 50 },
          scale: { start: 0.8, end: 0.3 },
          blendMode: 'ADD',
          tint: [0xff00ff, 0x9900ff],
          quantity: 5,
          frequency: 50,
          emitZone: {
            type: 'random',
            source: new Phaser.Geom.Circle(0, 0, 100),
          } as any,
        }
      );

      // Scene darkens
      const darkenOverlay = this.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0x000000,
        0.3
      );
      darkenOverlay.setDepth(49);

      // Clean up after phase
      this.time.delayedCall(600, () => {
        evolutionText.destroy();
        energyParticles.destroy();
        darkenOverlay.destroy();
      });
    });

    // Phase 4: Flash & Evolution (1800-2300ms)
    this.time.delayedCall(1800, () => {
      // Flash effect
      this.cameras.main.flash(500, 255, 0, 255);

      // Explosion particles
      const explosionParticles = this.add.particles(
        this.monster.x,
        this.monster.y,
        'spark-placeholder',
        {
          lifespan: 1000,
          speed: { min: 200, max: 400 },
          scale: { start: 1, end: 0 },
          blendMode: 'ADD',
          tint: [0xff00ff, 0xff00ff, 0xffff00],
          quantity: 50,
          gravityY: -50,
        }
      );

      // Update monster data to werebear using evolution data from backend
      if (this.monsterData.evolution) {
        this.monsterData.tier = this.monsterData.evolution;
        // Keep the evolved name from the tier data
        this.monsterData.type = this.monsterData.evolution.name || 'Werebear';
        this.monsterSpriteKey = 'werebear';
        this.isEvolved = true;

        // Reset health to werebear's max from evolution data
        this.monsterHealth = this.monsterData.evolution.baseHealth || 100;
        this.monsterMaxHealth = this.monsterData.evolution.baseHealth || 100;

        // Store the evolved monster type
        window.localStorage.setItem(
          'currentMonsterType',
          this.monsterData.type
        );

        // Emit updated monster info to UI
        this.emitMonsterInfo();
      } else {
        console.error('No evolution data found for werewolf!');
        // Fallback values if evolution data is missing
        this.monsterData.type = 'Werebear'; // Update the type for victory screen
        this.monsterSpriteKey = 'werebear';
        this.isEvolved = true;
        this.monsterHealth = 100;
        this.monsterMaxHealth = 100;

        // Store fallback monster type
        window.localStorage.setItem('currentMonsterType', 'Werebear');

        // Emit updated monster info to UI
        this.emitMonsterInfo();
      }

      // Clear tint and play werebear idle
      this.monster.clearTint();
      this.currentMonsterAnimation = 'werebear_idle';
      if (this.anims.exists('werebear_idle')) {
        this.monster.play('werebear_idle');
      }

      // Re-enable physics
      if (this.monster.body) {
        const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;
        monsterBody.enable = true;
      }

      // Intense camera shake
      this.cameras.main.shake(500, 0.02);

      // Clean up explosion particles after delay
      this.time.delayedCall(1200, () => explosionParticles.destroy());
    });

    // Phase 5: Enraged Message & Position Reset (2300-3000ms)
    this.time.delayedCall(2300, () => {
      // Reset positions - both player and monster return to initial spots
      this.tweens.add({
        targets: this.player,
        x: initialPlayerX,
        y: initialPlayerY,
        duration: 500,
        ease: 'Power2.InOut',
        onComplete: () => {
          // Return to idle animation
          if (this.anims.exists('soldier_idle')) {
            this.player.play('soldier_idle');
          }
        },
      });

      this.tweens.add({
        targets: this.monster,
        x: initialMonsterX,
        y: initialMonsterY,
        duration: 500,
        ease: 'Power2.InOut',
      });

      // Show enraged message
      const enragedText = this.add.text(
        this.cameras.main.width / 2,
        100,
        'THE BEAST IS ENRAGED!',
        {
          fontSize: '48px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 6,
        }
      );
      enragedText.setOrigin(0.5);
      enragedText.setDepth(100);
      enragedText.setScale(0);

      // Animate enraged text appearing
      this.tweens.add({
        targets: enragedText,
        scale: 1,
        duration: 300,
        ease: 'Back.out',
        onComplete: () => {
          // Pulse animation
          this.tweens.add({
            targets: enragedText,
            scale: 1.1,
            duration: 400,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              // Fade out
              this.tweens.add({
                targets: enragedText,
                alpha: 0,
                y: enragedText.y - 30,
                duration: 500,
                onComplete: () => enragedText.destroy(),
              });
            },
          });
        },
      });

      // Update UI
      this.emitGameState();

      // Re-enable player control after positions are reset
      this.time.delayedCall(500, () => {
        this.isEvolving = false;
        this.isMonsterMoving = false;
        this.isPlayerMoving = false;
      });
    });
  }

  gameOver(victory: boolean) {
    this.isGameOver = true;
    const { width, height } = this.cameras.main;

    // If victory, mark main monster as dead and stop spawning
    if (victory) {
      this.isMainMonsterDead = true;
      this.stopAllSpawning();
    }

    // Play death animation if player died
    if (!victory && this.playerHealth <= 0) {
      if (this.anims.exists('soldier_death')) {
        this.currentPlayerAnimation = 'soldier_death';
        this.player.play('soldier_death');
        // Don't return to idle after death - stay on last frame
      }
    }

    // Emit game over event
    window.dispatchEvent(
      new CustomEvent('game-over', {
        detail: {
          victory: victory,
          monsterType: this.monsterData?.type || 'unknown',
        },
      })
    );

    if (victory) {
      this.createVictoryAnimation(width, height);
    } else {
      this.createDefeatAnimation();
    }
  }

  createVictoryAnimation(width: number, height: number) {
    // Phase 1: Darken entire arena (0-500ms)
    const backgroundOverlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0
    );
    backgroundOverlay.setDepth(10); // Above arena elements but below UI

    this.tweens.add({
      targets: backgroundOverlay,
      alpha: 0.85,
      duration: 500,
      ease: 'Power2.easeOut',
      onComplete: () => {
        // Show victory screen directly
        this.showVictoryText(width / 2, height / 2);
      },
    });

    // Hide/dim UI elements during victory
    this.hideUIElements();

    // Stop all movement immediately
    if (this.player.body) {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0);
    }
    if (this.monster.body) {
      (this.monster.body as Phaser.Physics.Arcade.Body).setVelocity(0);
    }

    // Dim the player and monster sprites
    this.player.setAlpha(0.3);
    this.monster.setAlpha(0.2);

    // Hide range indicators
    if (this.meleeRangeIndicator) {
      this.meleeRangeIndicator.setVisible(false);
    }
    if (this.debugGraphics) {
      this.debugGraphics.setVisible(false);
    }
  }

  createParticleExplosion(centerX: number, centerY: number) {
    // Create multiple sparkle effects
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const distance = 80 + Math.random() * 60;
      const sparkle = this.add.graphics();
      sparkle.setPosition(centerX, centerY);
      sparkle.fillStyle(0xffd700);

      // Create a simple diamond/star shape manually
      sparkle.beginPath();
      sparkle.moveTo(0, -8); // Top point
      sparkle.lineTo(6, 0); // Right point
      sparkle.lineTo(0, 8); // Bottom point
      sparkle.lineTo(-6, 0); // Left point
      sparkle.closePath();
      sparkle.fillPath();

      // Add a smaller inner diamond for sparkle effect
      sparkle.fillStyle(0xffff00);
      sparkle.beginPath();
      sparkle.moveTo(0, -4);
      sparkle.lineTo(3, 0);
      sparkle.lineTo(0, 4);
      sparkle.lineTo(-3, 0);
      sparkle.closePath();
      sparkle.fillPath();

      sparkle.setDepth(50);

      const targetX = centerX + Math.cos(angle) * distance;
      const targetY = centerY + Math.sin(angle) * distance;

      this.tweens.add({
        targets: sparkle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.3,
        rotation: Math.random() * Math.PI * 2,
        duration: 800 + Math.random() * 400,
        delay: Math.random() * 200,
        ease: 'Power2.easeOut',
        onComplete: () => sparkle.destroy(),
      });
    }

    // Screen flash effect
    const flashOverlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0xffd700,
      0
    );
    flashOverlay.setDepth(100);

    this.tweens.add({
      targets: flashOverlay,
      alpha: 0.4,
      duration: 100,
      yoyo: true,
      onComplete: () => flashOverlay.destroy(),
    });
  }

  showVictoryText(centerX: number, centerY: number) {
    // Add particle explosion first
    this.createParticleExplosion(centerX, centerY);

    // Emit victory UI event with monster type
    window.dispatchEvent(
      new CustomEvent('victory-ui', {
        detail: {
          centerX: centerX,
          centerY: centerY - 150,
          monsterType: this.monsterData.type,
        },
      })
    );

    // Listen for continue event from UI
    const handleContinue = (event: any) => {
      window.removeEventListener('continue-from-vault', handleContinue);
      const vrfResult = event.detail?.vrfResult || false;
      const prizeAmount = event.detail?.prizeAmount || 0;

      // Proceed to vault scene with VRF result
      this.scene.start('VaultScene', {
        victory: true,
        walletAddress: 'test-wallet',
        monsterDefeated: this.monsterData.type,
        vrfSuccess: vrfResult,
        prizeAmount: prizeAmount,
      });
    };
    window.addEventListener('continue-from-vault', handleContinue);
  }

  hideUIElements() {
    // Emit UI visibility event
    window.dispatchEvent(
      new CustomEvent('ui-visibility', {
        detail: {
          visible: false,
        },
      })
    );
  }

  createDefeatAnimation() {
    const { width, height } = this.cameras.main;

    // Dim the screen
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Emit defeat UI event
    window.dispatchEvent(
      new CustomEvent('defeat-ui', {
        detail: {
          width: width,
          height: height,
        },
      })
    );

    // Listen for return to arena event from UI
    const handleReturn = (event: any) => {
      window.removeEventListener('return-to-arena', handleReturn);
      const walletAddress = event.detail?.walletAddress || 'test-wallet';

      // Return to Arena scene
      this.scene.start('LobbyScene', {
        walletAddress: walletAddress,
      });
    };

    window.addEventListener('return-to-arena', handleReturn);

    // Also allow clicking anywhere to return (fallback)
    this.input.once('pointerdown', () => {
      window.removeEventListener('return-to-arena', handleReturn);
      this.scene.start('LobbyScene', {
        walletAddress: 'test-wallet',
      });
    });
  }

  protected repositionUI(width: number, height: number) {
    // Update background
    const bg = this.getUIElement<Phaser.GameObjects.Rectangle>('bg');
    if (bg) {
      bg.setSize(width, height);
      bg.setPosition(this.centerX(width), this.centerY(height));
    }

    // Update existing arena borders instead of creating new ones
    if (this.borders.length === 4) {
      // Top border
      this.borders[0].setPosition(width / 2, 20).setSize(width - 40, 40);
      // Bottom border
      this.borders[1]
        .setPosition(width / 2, height - 20)
        .setSize(width - 40, 40);
      // Left border
      this.borders[2].setPosition(20, height / 2).setSize(40, height - 40);
      // Right border
      this.borders[3]
        .setPosition(width - 20, height / 2)
        .setSize(40, height - 40);
    }

    // Maintain relative positions during resize
    if (this.previousWidth > 0 && this.previousHeight > 0) {
      // Calculate relative positions based on previous viewport
      if (this.player) {
        const playerRelX = this.player.x / this.previousWidth;
        const playerRelY = this.player.y / this.previousHeight;
        this.player.setPosition(width * playerRelX, height * playerRelY);
        // Update position tracking
        this.prevPlayerX = this.player.x;
        this.prevPlayerY = this.player.y;
      }
      if (this.monster && this.monster.active) {
        const monsterRelX = this.monster.x / this.previousWidth;
        const monsterRelY = this.monster.y / this.previousHeight;
        this.monster.setPosition(width * monsterRelX, height * monsterRelY);
        // Update position tracking
        this.prevMonsterX = this.monster.x;
        this.prevMonsterY = this.monster.y;
      }
    }

    // Update stored dimensions
    this.previousWidth = width;
    this.previousHeight = height;

    // Emit resize event for UI
    window.dispatchEvent(
      new CustomEvent('combat-resize', {
        detail: {
          width: width,
          height: height,
        },
      })
    );
  }

  // ========== ENEMY SPAWN SYSTEM ==========

  initializeSpawnSystem() {
    // Initial spawn at 2 seconds - VERY EARLY!
    const timer0 = this.time.delayedCall(2000, () => {
      this.spawnSkeletonWave(
        3,
        Phaser.Math.RND.pick(['corners', 'sides', 'circle'])
      );
    });
    this.spawnTimers.push(timer0);

    // Wave 1: 3 more skeletons at 5 seconds
    const timer1 = this.time.delayedCall(5000, () => {
      this.spawnSkeletonWave(3, 'corners');
      console.log('💀 Wave 1: 3 skeletons spawned!');
    });
    this.spawnTimers.push(timer1);

    // Wave 2: 3 skeletons + 1 slime at 8 seconds
    const timer2 = this.time.delayedCall(8000, () => {
      this.spawnSkeletonWave(3, 'sides');
      this.spawnSlime();
      console.log('💀 Wave 2: 3 skeletons + 1 slime spawned!');
    });
    this.spawnTimers.push(timer2);

    // Wave 3: 4 skeletons at 12 seconds
    const timer3 = this.time.delayedCall(12000, () => {
      this.spawnSkeletonWave(4, 'circle');
      console.log('💀 Wave 3: 4 skeletons spawned!');
    });
    this.spawnTimers.push(timer3);

    // 2 slimes at 15 seconds
    const timer4 = this.time.delayedCall(15000, () => {
      this.spawnSlime();
      this.spawnSlime();
      console.log('💚 2 slimes spawned for healing!');
    });
    this.spawnTimers.push(timer4);

    // Wave 4: 4 skeletons at 18 seconds
    const timer5 = this.time.delayedCall(18000, () => {
      this.spawnSkeletonWave(4, 'corners');
      console.log('💀 Wave 4: 4 skeletons spawned!');
    });
    this.spawnTimers.push(timer5);

    // Start continuous spawning at 22 seconds
    const timer6 = this.time.delayedCall(22000, () => {
      this.startContinuousSpawning();
      console.log('⚔️ Continuous spawning started!');
    });
    this.spawnTimers.push(timer6);
  }

  spawnSkeletonWave(count: number, pattern: string) {
    // Don't spawn if main monster is dead
    if (this.isMainMonsterDead) {
      console.log('Main monster dead - skipping skeleton spawn');
      return;
    }

    const { width, height } = this.cameras.main;
    const positions: { x: number; y: number }[] = [];

    switch (pattern) {
      case 'corners':
        positions.push(
          { x: 100, y: 100 },
          { x: width - 100, y: 100 },
          { x: 100, y: height - 100 },
          { x: width - 100, y: height - 100 }
        );
        break;

      case 'sides':
        for (let i = 0; i < count; i++) {
          const side = Phaser.Math.Between(0, 3);
          switch (side) {
            case 0: // top
              positions.push({
                x: Phaser.Math.Between(100, width - 100),
                y: 50,
              });
              break;
            case 1: // right
              positions.push({
                x: width - 50,
                y: Phaser.Math.Between(100, height - 100),
              });
              break;
            case 2: // bottom
              positions.push({
                x: Phaser.Math.Between(100, width - 100),
                y: height - 50,
              });
              break;
            case 3: // left
              positions.push({
                x: 50,
                y: Phaser.Math.Between(100, height - 100),
              });
              break;
          }
        }
        break;

      case 'circle':
        const centerX = this.player.x;
        const centerY = this.player.y;
        const radius = 250;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          positions.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
          });
        }
        break;
    }

    // Spawn skeletons at calculated positions with varied AI
    positions.slice(0, count).forEach((pos, index) => {
      this.time.delayedCall(index * 100, () => {
        if (this.skeletons.getLength() < 10 && !this.isMainMonsterDead) {
          const skeleton = new SkeletonEnemy(this, pos.x, pos.y, this.player);

          // Assign varied behaviors based on wave and position
          const behaviors: (
            | 'aggressive'
            | 'cautious'
            | 'opportunist'
            | 'flanker'
          )[] = [
            'aggressive',
            'aggressive',
            'cautious',
            'flanker',
            'opportunist',
          ];
          skeleton.behavior = Phaser.Math.RND.pick(behaviors);

          // Assign skeleton types (70% normal, 15% fast, 10% tank, 5% elite)
          const typeRoll = Math.random();
          if (typeRoll < 0.15) {
            skeleton.skeletonType = 'fast';
          } else if (typeRoll < 0.25) {
            skeleton.skeletonType = 'tank';
          } else if (typeRoll < 0.3) {
            skeleton.skeletonType = 'elite';
          }
          // else stays 'normal'

          // Apply type properties after setting type
          skeleton.applySkeletonType();

          // Make first skeleton in wave more likely to be flanker
          if (index === 0 && Math.random() < 0.5) {
            skeleton.behavior = 'flanker';
          }

          this.skeletons.add(skeleton);
        }
      });
    });
  }

  spawnSlime() {
    // Don't spawn if main monster is dead
    if (this.isMainMonsterDead) {
      console.log('Main monster dead - skipping slime spawn');
      return;
    }

    if (this.slimes.getLength() < 3) {
      const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
      const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
      const slime = new SlimeEnemy(this, x, y);
      this.slimes.add(slime);
    }
  }

  startContinuousSpawning() {
    // Don't start if main monster is already dead
    if (this.isMainMonsterDead) {
      console.log('Main monster dead - not starting continuous spawn');
      return;
    }

    // Base spawn rate
    let skeletonSpawnRate = 4000; // Every 4 seconds
    let slimeSpawnRate = 10000; // Every 12 seconds

    // Adjust based on boss health
    const updateSpawnRate = () => {
      if (this.isMainMonsterDead) return false; // Stop if boss dead

      const healthPercent = this.monsterHealth / this.monsterMaxHealth;
      if (healthPercent <= 0.25) {
        skeletonSpawnRate = 3000; // CHAOS MODE!
        slimeSpawnRate = 8000;
      } else if (healthPercent <= 0.5) {
        skeletonSpawnRate = 4000;
        slimeSpawnRate = 10000;
      } else if (healthPercent <= 0.75) {
        skeletonSpawnRate = 5000;
        slimeSpawnRate = 11000;
      }
      return true; // Continue spawning
    };

    // Skeleton spawning
    this.continuousSpawnTimer = this.time.addEvent({
      delay: skeletonSpawnRate,
      callback: () => {
        if (!updateSpawnRate()) {
          this.continuousSpawnTimer?.destroy();
          return;
        }

        const healthPercent = this.monsterHealth / this.monsterMaxHealth;
        const count =
          healthPercent <= 0.25
            ? Phaser.Math.Between(5, 6)
            : healthPercent <= 0.5
            ? Phaser.Math.Between(4, 5)
            : Phaser.Math.Between(3, 4);
        this.spawnSkeletonWave(
          count,
          Phaser.Math.RND.pick(['corners', 'sides', 'circle'])
        );

        // Note: Timer delays cannot be modified in Phaser 3
        // To change spawn rate, would need to destroy and recreate timer
      },
      loop: true,
    });

    // Slime spawning
    this.time.addEvent({
      delay: slimeSpawnRate,
      callback: () => {
        if (this.isMainMonsterDead) return;

        const healthPercent = this.monsterHealth / this.monsterMaxHealth;
        const count = healthPercent <= 0.5 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          this.time.delayedCall(i * 500, () => this.spawnSlime());
        }
      },
      loop: true,
    });
  }

  stopAllSpawning() {
    console.log('🛑 Stopping all enemy spawning - boss defeated!');

    // Clear all spawn timers
    this.spawnTimers.forEach((timer) => timer?.destroy());
    this.spawnTimers = [];

    // Stop continuous spawning
    if (this.continuousSpawnTimer) {
      this.continuousSpawnTimer.destroy();
      this.continuousSpawnTimer = undefined;
    }

    // Show message to player
    const remainingEnemies =
      this.skeletons.getLength() + this.slimes.getLength();
    if (remainingEnemies > 0) {
      const text = this.add.text(
        this.cameras.main.centerX,
        100,
        `Boss Defeated! ${remainingEnemies} enemies remaining...`,
        {
          fontSize: '24px',
          color: '#ffff00',
          stroke: '#000000',
          strokeThickness: 4,
        }
      );
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      text.setDepth(100);

      // Update text as enemies are killed
      const updateText = () => {
        const remaining = this.skeletons.getLength() + this.slimes.getLength();
        if (remaining > 0) {
          text.setText(`Boss Defeated! ${remaining} enemies remaining...`);
        } else {
          text.setText('All enemies defeated! Victory!');
          this.time.delayedCall(2000, () => text.destroy());
        }
      };

      // Listen for enemy deaths
      this.time.addEvent({
        delay: 500,
        callback: updateText,
        loop: true,
      });
    }
  }

  setupEnemyCollisions() {
    // Skeleton attacks hurt player
    this.physics.add.overlap(
      this.player,
      this.skeletons,
      undefined,
      (player, skeleton) => {
        // Collision detection only, attacks handled by skeleton's attack method
        return false;
      },
      this
    );

    // Player can walk through slimes but with collision
    this.physics.add.collider(this.player, this.slimes);

    // Spears vs Skeletons
    this.physics.add.overlap(
      this.spears,
      this.skeletons,
      (spear: any, skeleton: any) => {
        if (skeleton instanceof SkeletonEnemy && skeleton.active) {
          // Get arrow properties
          const arrowType = spear.getData('arrowType') || 'yellow';
          const damageMultiplier = spear.getData('damageMultiplier') || 1.0;
          const baseDamage = 17; // Base damage - Heavy arrows will one-shot skeletons
          const damage = Math.floor(baseDamage * damageMultiplier);

          const killed = skeleton.takeDamage(damage);

          // If skeleton died, trigger revenge boost for nearby allies
          if (killed) {
            this.triggerRevengeBoost(skeleton.x, skeleton.y);

            // Check if all enemies are defeated after skeleton dies
            this.time.delayedCall(600, () => {
              if (this.isMainMonsterDead && !this.isGameOver) {
                const remainingSkeletons = this.skeletons
                  ? this.skeletons.getLength()
                  : 0;
                if (remainingSkeletons === 0) {
                  this.gameOver(true);
                }
              }
            });
          }

          // Handle special arrow effects
          if (arrowType === 'red') {
            // Explosive damage to nearby enemies
            this.createExplosion(skeleton.x, skeleton.y);
            this.damageNearbyEnemies(skeleton.x, skeleton.y, damage * 0.5, 80);
          }

          // Destroy arrow after hit
          spear.destroy();
        }
      }
    );

    // Spears vs Slimes
    this.physics.add.overlap(
      this.spears,
      this.slimes,
      (spear: any, slime: any) => {
        if (slime instanceof SlimeEnemy && slime.active) {
          // Get arrow properties
          const arrowType = spear.getData('arrowType') || 'yellow';
          const damageMultiplier = spear.getData('damageMultiplier') || 1.0;
          const baseDamage = 17; // Base damage - Heavy arrows will one-shot skeletons
          const damage = Math.floor(baseDamage * damageMultiplier);

          slime.takeDamage(damage);

          // Handle special arrow effects
          if (arrowType === 'red') {
            // Explosive damage to nearby enemies
            this.createExplosion(slime.x, slime.y);
            this.damageNearbyEnemies(slime.x, slime.y, damage * 0.5, 80);
          }

          // Destroy arrow after hit
          spear.destroy();
        }
      }
    );

    // Prevent enemy stacking
    this.physics.add.collider(this.skeletons, this.skeletons);
    this.physics.add.collider(this.skeletons, this.slimes);
    this.physics.add.collider(this.slimes, this.slimes);

    // Skeletons collide with monster
    this.physics.add.collider(this.skeletons, this.monster);
  }

  handleSkeletonAttack(data: { damage: number; source: SkeletonEnemy }) {
    // Apply damage to player
    if (!this.isGameOver && this.playerHealth > 0) {
      let damage = data.damage;
      
      // Apply shield reduction if active
      if (this.shieldStacks > 0) {
        damage = Math.floor(damage * 0.2); // 80% damage reduction
        this.shieldStacks--;
        
        // Visual feedback for shield block
        const shieldText = this.add.text(
          this.player.x,
          this.player.y - 40,
          '🛡️ BLOCKED!',
          {
            fontSize: '16px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
          }
        ).setOrigin(0.5);
        
        this.tweens.add({
          targets: shieldText,
          y: shieldText.y - 20,
          alpha: 0,
          duration: 800,
          onComplete: () => shieldText.destroy()
        });
      }
      
      this.playerHealth -= damage;

      // Show damage effect
      this.cameras.main.shake(100, 0.005);
      this.player.setTint(0xff0000);
      this.time.delayedCall(100, () => {
        if (!this.isGameOver) {
          this.player.clearTint();
        }
      });

      // Play hurt animation if it exists
      if (this.anims.exists('soldier_hurt')) {
        this.player.play('soldier_hurt');
        this.player.once('animationcomplete', () => {
          if (!this.isGameOver) {
            this.player.play('soldier_idle');
          }
        });
      }

      // Update game state
      this.emitGameState();

      // Check for player death
      if (this.playerHealth <= 0 && !this.isGameOver) {
        this.gameOver(false);
      }
    }
  }

  handleBonusDrop(data: { type: string; x: number; y: number }) {
    // Create visual bonus pickup
    const colors: { [key: string]: number } = {
      damage: 0xff0000,
      speed: 0x0099ff,
      shield: 0xffff00,
      spear: 0xff00ff,
    };

    const icons: { [key: string]: string } = {
      damage: '⚔',
      speed: '💨',
      shield: '🛡',
      spear: '🎯',
    };

    // Create bonus orb
    const orb = this.add.circle(data.x, data.y, 15, colors[data.type], 0.8);
    orb.setDepth(10);
    
    // Make sure orb is active and visible
    orb.setActive(true);
    orb.setVisible(true);

    const icon = this.add.text(data.x, data.y, icons[data.type], {
      fontSize: '20px',
    });
    icon.setOrigin(0.5);
    icon.setDepth(11);
    icon.setActive(true);
    icon.setVisible(true);

    // Float animation
    this.tweens.add({
      targets: [orb, icon],
      y: data.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Pulse effect
    this.tweens.add({
      targets: orb,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Set up physics for collection
    this.physics.add.existing(orb);
    const orbBody = orb.body as Phaser.Physics.Arcade.Body;
    orbBody.setCircle(15);

    // Check for player collection
    const checkCollection = this.physics.add.overlap(this.player, orb, () => {
      // Apply bonus effect
      this.applyBonus(data.type);

      // Collection animation
      this.tweens.add({
        targets: [orb, icon],
        scale: 1.5,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          orb.destroy();
          icon.destroy();
        },
      });

      // Remove collision check
      this.physics.world.removeCollider(checkCollection);
    });

    // Auto-destroy after 15 seconds
    this.time.delayedCall(15000, () => {
      if (orb.active) {
        this.tweens.add({
          targets: [orb, icon],
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            orb.destroy();
            icon.destroy();
          },
        });
      }
    });
  }

  applyBonus(type: string) {
    switch (type) {
      case 'damage':
        // +20% damage for 8 seconds
        // This would need to be implemented in the damage calculation
        console.log('💪 Damage boost activated!');
        this.showBonusText('DAMAGE +20%', 0xff0000);
        break;

      case 'speed':
        // +30% speed for 8 seconds
        this.normalSpeed *= 1.3;
        console.log('⚡ Speed boost activated!');
        this.showBonusText('SPEED +30%', 0x0099ff);

        // Reset after duration
        this.time.delayedCall(8000, () => {
          this.normalSpeed /= 1.3;
        });
        break;

      case 'shield':
        // Next 2 hits deal 80% less damage (max 2 stacks)
        const previousStacks = this.shieldStacks;
        this.shieldStacks = Math.min(2, this.shieldStacks + 2); // Cap at 2 stacks
        console.log('🛡️ Shield activated! Stacks:', this.shieldStacks);
        this.showBonusText('SHIELD ACTIVE', 0xffff00);
        
        // Only create new orbs if we don't have them already
        if (previousStacks === 0) {
          this.createShieldOrbs();
        }
        break;

      case 'spear':
        // Instant spear refill
        this.currentSpears = this.maxSpears;
        console.log('🎯 Spears refilled!');
        this.showBonusText('SPEARS FULL', 0xff00ff);
        this.emitGameState();
        break;
    }
  }

  createShieldOrbs() {
    // Clean up any existing orbs
    this.destroyShieldOrbs();
    
    const orbitRadius = 35;
    let orbitAngle = 0;
    
    // Create 2 orbs
    for (let i = 0; i < 2; i++) {
      const orb = this.add.graphics();
      orb.setDepth(15);
      this.shieldOrbs.push(orb);
    }
    
    // Create update timer
    this.shieldTimer = this.time.addEvent({
      delay: 16, // ~60fps
      callback: () => {
        orbitAngle += 0.03; // Rotation speed
        
        // Update each orb
        this.shieldOrbs.forEach((orb, index) => {
          orb.clear();
          
          // Only show orbs for remaining stacks
          if (index < this.shieldStacks) {
            // Calculate orbit position with proper spacing
            const activeOrbs = Math.min(this.shieldStacks, 2);
            const angleOffset = (Math.PI * 2 / activeOrbs) * index;
            const x = this.player.x + Math.cos(orbitAngle + angleOffset) * orbitRadius;
            const y = this.player.y + Math.sin(orbitAngle + angleOffset) * orbitRadius;
            
            // Draw orb with glow effect
            orb.fillStyle(0xffff00, 0.3);
            orb.fillCircle(x, y, 8); // Outer glow
            orb.fillStyle(0xffff00, 0.6);
            orb.fillCircle(x, y, 5); // Middle glow
            orb.fillStyle(0xffffaa, 0.9);
            orb.fillCircle(x, y, 3); // Inner bright core
            
            orb.setVisible(true);
          } else {
            orb.setVisible(false);
          }
        });
        
        // Clean up when no stacks left
        if (this.shieldStacks <= 0) {
          this.destroyShieldOrbs();
        }
      },
      loop: true
    });
  }
  
  destroyShieldOrbs() {
    this.shieldOrbs.forEach(orb => orb.destroy());
    this.shieldOrbs = [];
    if (this.shieldTimer) {
      this.shieldTimer.destroy();
      this.shieldTimer = undefined;
    }
  }
  
  showBonusText(text: string, color: number) {
    // Convert integer color to hex string
    const hexColor = '#' + color.toString(16).padStart(6, '0');

    const bonusText = this.add.text(this.player.x, this.player.y - 60, text, {
      fontSize: '20px',
      color: hexColor,
      stroke: '#000000',
      strokeThickness: 3,
    });
    bonusText.setOrigin(0.5);
    bonusText.setDepth(100);

    this.tweens.add({
      targets: bonusText,
      y: bonusText.y - 30,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => bonusText.destroy(),
    });
  }

  handleHealingOrbDrop(data: { x: number; y: number; healAmount: number }) {
    // Create healing orb
    const orb = this.add.circle(data.x, data.y, 20, 0x00ff00, 0.6);
    orb.setDepth(10);

    const glow = this.add.circle(data.x, data.y, 25, 0x00ff00, 0.3);
    glow.setDepth(9);

    // Pulse animation
    this.tweens.add({
      targets: [orb, glow],
      scale: 1.2,
      alpha: 0.8,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Set up physics
    this.physics.add.existing(orb);
    const orbBody = orb.body as Phaser.Physics.Arcade.Body;
    orbBody.setCircle(20);

    // Magnetic attraction when player is near
    const attractionUpdate = () => {
      if (!orb.active) return;

      const distance = Phaser.Math.Distance.Between(
        orb.x,
        orb.y,
        this.player.x,
        this.player.y
      );

      if (distance < 100) {
        const angle = Phaser.Math.Angle.Between(
          orb.x,
          orb.y,
          this.player.x,
          this.player.y
        );

        const pullStrength = (100 - distance) * 2;
        orb.x += Math.cos(angle) * pullStrength * 0.01;
        orb.y += Math.sin(angle) * pullStrength * 0.01;
        glow.x = orb.x;
        glow.y = orb.y;
      }
    };

    // Add to update loop
    const updateEvent = this.time.addEvent({
      delay: 16,
      callback: attractionUpdate,
      loop: true,
    });

    // Check for collection
    const checkCollection = this.physics.add.overlap(this.player, orb, () => {
      // Heal player
      const oldHealth = this.playerHealth;
      this.playerHealth = Math.min(
        this.playerMaxHealth,
        this.playerHealth + data.healAmount
      );
      const actualHeal = this.playerHealth - oldHealth;

      if (actualHeal > 0) {
        // Show healing effect
        this.showBonusText(`+${actualHeal} HP`, 0x00ff00);

        // Flash green
        this.player.setTint(0x00ff00);
        this.time.delayedCall(200, () => {
          if (!this.isGameOver) {
            this.player.clearTint();
          }
        });
      }

      // Update game state
      this.emitGameState();

      // Collection animation
      this.tweens.add({
        targets: [orb, glow],
        scale: 2,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          orb.destroy();
          glow.destroy();
          updateEvent.destroy();
        },
      });

      // Remove collision check
      this.physics.world.removeCollider(checkCollection);
    });

    // Auto-destroy after 10 seconds
    this.time.delayedCall(10000, () => {
      if (orb.active) {
        this.tweens.add({
          targets: [orb, glow],
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            orb.destroy();
            glow.destroy();
            updateEvent.destroy();
          },
        });
      }
    });
  }

  // ========== COMBO SYSTEM ==========

  showComboCounter() {
    // Remove existing combo text if any
    if (this.comboText) {
      this.comboText.destroy();
    }

    // Create combo text
    this.comboText = this.add.text(
      this.player.x,
      this.player.y - 80,
      `COMBO x${this.comboCount}!`,
      {
        fontSize: '24px',
        color: this.comboCount >= 3 ? '#ff00ff' : '#ffff00',
        stroke: '#000000',
        strokeThickness: 4,
        fontStyle: 'bold',
      }
    );
    this.comboText.setOrigin(0.5);
    this.comboText.setDepth(101);

    // Animate combo text
    this.tweens.add({
      targets: this.comboText,
      y: this.comboText.y - 20,
      scale: 1.2,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        if (this.comboText) {
          this.comboText.destroy();
          this.comboText = undefined;
        }
      },
    });
  }

  performSpinAttack() {
    console.log('⚔️ SPIN ATTACK!');

    // Show special effect text
    const spinText = this.add.text(
      this.player.x,
      this.player.y - 100,
      'SPINNING STRIKE!',
      {
        fontSize: '28px',
        color: '#ff00ff',
        stroke: '#000000',
        strokeThickness: 5,
        fontStyle: 'bold',
      }
    );
    spinText.setOrigin(0.5);
    spinText.setDepth(102);

    // Animate text
    this.tweens.add({
      targets: spinText,
      scale: 1.5,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => spinText.destroy(),
    });

    // Play attack animation
    this.player.play('soldier_attack02');

    // Spin the player sprite
    this.tweens.add({
      targets: this.player,
      angle: 360,
      duration: 400,
      ease: 'Power1',
      onComplete: () => {
        this.player.angle = 0;
      },
    });

    // Create expanding shockwave effect
    const shockwave = this.add.circle(
      this.player.x,
      this.player.y,
      10,
      0xffff00,
      0.8
    );
    shockwave.setDepth(15);

    this.tweens.add({
      targets: shockwave,
      radius: this.meleeRange * 2,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => shockwave.destroy(),
    });

    // Damage all enemies in extended range
    const spinDamage = 40; // High damage for spin attack
    const spinRange = this.meleeRange * 1.8; // Larger range

    // Check all enemies
    const allEnemies: any[] = [];

    // Main monster
    if (this.monsterHealth > 0) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.monster.x,
        this.monster.y
      );
      if (dist <= spinRange) {
        allEnemies.push({ target: this.monster, type: 'monster' });
      }
    }

    // Skeletons
    this.skeletons.getChildren().forEach((skeleton: any) => {
      if (skeleton.active) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          skeleton.x,
          skeleton.y
        );
        if (dist <= spinRange) {
          allEnemies.push({ target: skeleton, type: 'skeleton' });
        }
      }
    });

    // Slimes
    this.slimes.getChildren().forEach((slime: any) => {
      if (slime.active) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          slime.x,
          slime.y
        );
        if (dist <= spinRange) {
          allEnemies.push({ target: slime, type: 'slime' });
        }
      }
    });

    // Deal damage and knockback to all enemies
    allEnemies.forEach((enemy, index) => {
      this.time.delayedCall(index * 50, () => {
        if (enemy.type === 'monster') {
          // Check for werewolf evolution at 10% health
          if (this.canDamageMonster()) {
            const prevHealth = this.monsterHealth;

            // Check if this is a werewolf that should evolve
            if (
              this.monsterData.tier?.name === 'Werewolf' &&
              !this.isEvolved &&
              !this.isEvolving
            ) {
              const evolutionThreshold = Math.floor(
                this.monsterMaxHealth * 0.1
              );
              if (this.monsterHealth - spinDamage <= evolutionThreshold) {
                // Cap damage to exactly reach threshold
                const cappedDamage = this.monsterHealth - evolutionThreshold;
                this.monsterHealth = evolutionThreshold;
                this.showDamageNumber(
                  enemy.target.x,
                  enemy.target.y - 40,
                  cappedDamage,
                  0xff00ff,
                  true
                );
                this.emitGameState();
                console.log(
                  'Werewolf evolution triggered at 10% health (spin attack)'
                );
                this.evolveToWerebear();
                return; // Exit early
              }
            }

            // Apply normal damage if not evolving
            this.monsterHealth = Math.max(0, this.monsterHealth - spinDamage);
            this.showDamageNumber(
              enemy.target.x,
              enemy.target.y - 40,
              spinDamage,
              0xff00ff,
              true
            );
            this.emitGameState();

            // Check for monster death
            if (this.monsterHealth <= 0) {
              this.checkGameOver();
            }
          }
        } else if (
          enemy.type === 'skeleton' &&
          enemy.target instanceof SkeletonEnemy
        ) {
          enemy.target.takeDamage(spinDamage);
          this.showDamageNumber(
            enemy.target.x,
            enemy.target.y - 40,
            spinDamage,
            0xff00ff,
            true
          );

          // Knockback (check if body exists)
          if (enemy.target.body) {
            const angle = Phaser.Math.Angle.Between(
              this.player.x,
              this.player.y,
              enemy.target.x,
              enemy.target.y
            );
            const body = enemy.target.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
          }
        } else if (
          enemy.type === 'slime' &&
          enemy.target instanceof SlimeEnemy
        ) {
          enemy.target.takeDamage(spinDamage);
          this.showDamageNumber(
            enemy.target.x,
            enemy.target.y - 40,
            spinDamage,
            0xff00ff,
            true
          );
        }
      });
    });

    // Camera shake for impact
    this.cameras.main.shake(200, 0.01);
  }

  // ========== CROWD CONTROL ABILITIES ==========

  performGroundSlam() {
    if (this.slamCooldown > 0) return;

    console.log('💥 GROUND SLAM!');
    this.slamCooldown = this.slamCooldownMax;

    // Animation
    this.player.play('soldier_attack01');

    // Crouch effect
    this.tweens.add({
      targets: this.player,
      scaleY: 1.5,
      duration: 100,
      yoyo: true,
      ease: 'Power1',
    });

    // Screen shake
    this.cameras.main.shake(300, 0.02);

    // Create expanding shockwave
    const shockwave = this.add.circle(
      this.player.x,
      this.player.y,
      10,
      0xffffff,
      0.8
    );
    shockwave.setDepth(15);

    this.tweens.add({
      targets: shockwave,
      radius: 200,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => shockwave.destroy(),
    });

    // Ground crack effect
    const cracks = this.add.graphics();
    cracks.lineStyle(2, 0x666666, 0.8);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      cracks.moveTo(this.player.x, this.player.y);
      cracks.lineTo(
        this.player.x + Math.cos(angle) * 150,
        this.player.y + Math.sin(angle) * 150
      );
    }
    cracks.strokePath();
    cracks.setDepth(2);

    this.tweens.add({
      targets: cracks,
      alpha: 0,
      duration: 1000,
      onComplete: () => cracks.destroy(),
    });

    // Damage and knockback all enemies in radius
    const slamRadius = 200;
    const allEnemies: any[] = [];

    // Check all enemy types
    if (this.monsterHealth > 0) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.monster.x,
        this.monster.y
      );
      if (dist <= slamRadius) {
        allEnemies.push({
          target: this.monster,
          type: 'monster',
          distance: dist,
        });
      }
    }

    this.skeletons.getChildren().forEach((skeleton: any) => {
      if (skeleton.active) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          skeleton.x,
          skeleton.y
        );
        if (dist <= slamRadius) {
          allEnemies.push({
            target: skeleton,
            type: 'skeleton',
            distance: dist,
          });
        }
      }
    });

    this.slimes.getChildren().forEach((slime: any) => {
      if (slime.active) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          slime.x,
          slime.y
        );
        if (dist <= slamRadius) {
          allEnemies.push({ target: slime, type: 'slime', distance: dist });
        }
      }
    });

    // Apply damage and knockback
    allEnemies.forEach((enemy) => {
      // Damage based on distance (closer = more damage)
      const damage = Math.floor(40 * (1 - enemy.distance / slamRadius));

      if (enemy.type === 'skeleton' && enemy.target instanceof SkeletonEnemy) {
        enemy.target.takeDamage(damage);

        // Strong knockback (check if body exists)
        if (enemy.target.body) {
          const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            enemy.target.x,
            enemy.target.y
          );
          const force = 400 * (1 - enemy.distance / slamRadius);
          const body = enemy.target.body as Phaser.Physics.Arcade.Body;
          body.setVelocity(Math.cos(angle) * force, Math.sin(angle) * force);
        }
      } else if (enemy.type === 'slime' && enemy.target instanceof SlimeEnemy) {
        enemy.target.takeDamage(damage);
      } else if (enemy.type === 'monster') {
        // Check for werewolf evolution at 10% health
        if (this.canDamageMonster()) {
          // Check if this is a werewolf that should evolve
          if (
            this.monsterData.tier?.name === 'Werewolf' &&
            !this.isEvolved &&
            !this.isEvolving
          ) {
            const evolutionThreshold = Math.floor(this.monsterMaxHealth * 0.1);
            if (this.monsterHealth - damage <= evolutionThreshold) {
              // Cap damage to exactly reach threshold
              const cappedDamage = this.monsterHealth - evolutionThreshold;
              this.monsterHealth = evolutionThreshold;
              this.showDamageNumber(
                enemy.target.x,
                enemy.target.y - 40,
                cappedDamage,
                0xffffff,
                false
              );
              this.emitGameState();
              console.log(
                'Werewolf evolution triggered at 10% health (slam attack)'
              );
              this.evolveToWerebear();
              return; // Exit early
            }
          }

          // Apply normal damage if not evolving
          this.monsterHealth = Math.max(0, this.monsterHealth - damage);
          this.showDamageNumber(
            enemy.target.x,
            enemy.target.y - 40,
            damage,
            0xffffff,
            false
          );
          this.emitGameState();
        } else {
          // Still show damage number even if can't damage
          this.showDamageNumber(
            enemy.target.x,
            enemy.target.y - 40,
            damage,
            0xffffff,
            false
          );
        }
      } else {
        // Show damage for other enemy types
        this.showDamageNumber(
          enemy.target.x,
          enemy.target.y - 40,
          damage,
          0xffffff,
          false
        );
      }
    });

    // Show cooldown indicator
    this.showBonusText('SLAM READY IN 5s', 0xffffff);
  }

  performDash(direction: { x: number; y: number }) {
    if (this.dashCooldown > 0 || this.isDashing) return;

    console.log('💨 DASH!');
    this.isDashing = true;
    this.isInvincible = true; // Enable invincibility
    this.dashCooldown = 2000; // 2 second cooldown

    // Calculate target position
    const targetX = this.player.x + direction.x * this.dashDistance;
    const targetY = this.player.y + direction.y * this.dashDistance;

    // Get world bounds
    const { width, height } = this.cameras.main;
    const margin = 40; // Account for border width

    // Clamp to world bounds
    const finalX = Phaser.Math.Clamp(targetX, margin, width - margin);
    const finalY = Phaser.Math.Clamp(targetY, margin, height - margin);

    // Store original position for trail effect
    const startX = this.player.x;
    const startY = this.player.y;

    // Instant teleport to new position
    this.player.setPosition(finalX, finalY);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0); // Stop any existing velocity

    // Visual feedback - make player semi-transparent during invincibility
    this.player.setAlpha(0.6);
    this.player.setTint(0x00ffff); // Cyan tint for invincibility

    // Create trail effect from start to end position
    const trailSteps = 5;
    for (let i = 0; i < trailSteps; i++) {
      const ratio = i / trailSteps;
      const trailX = startX + (finalX - startX) * ratio;
      const trailY = startY + (finalY - startY) * ratio;

      const afterimage = this.add.sprite(trailX, trailY, 'soldier_idle');
      afterimage.setScale(this.player.scale);
      afterimage.setAlpha(0.4 - i * 0.08);
      afterimage.setTint(0x0099ff);
      afterimage.setDepth(this.player.depth - 1);
      afterimage.setFlipX(this.player.flipX);

      this.tweens.add({
        targets: afterimage,
        alpha: 0,
        duration: 400,
        delay: i * 20,
        onComplete: () => afterimage.destroy(),
      });
    }

    // Camera shake for impact
    this.cameras.main.shake(100, 0.003);

    // End dash and invincibility after duration
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.isInvincible = false;

      // Remove invincibility visual effects
      this.player.setAlpha(1);
      this.player.clearTint();
    });
  }

  handleDoubleTapDash(direction: string) {
    const currentTime = this.time.now;

    if (
      this.lastDashDirection === direction &&
      currentTime - this.lastDashTime < this.doubleTapTime
    ) {
      // Double tap detected!
      let dashDir = { x: 0, y: 0 };

      switch (direction) {
        case 'left':
          dashDir = { x: -1, y: 0 };
          break;
        case 'right':
          dashDir = { x: 1, y: 0 };
          break;
        case 'up':
          dashDir = { x: 0, y: -1 };
          break;
        case 'down':
          dashDir = { x: 0, y: 1 };
          break;
      }

      this.performDash(dashDir);

      // Reset to prevent triple tap
      this.lastDashDirection = '';
      this.lastDashTime = 0;
    } else {
      // First tap
      this.lastDashDirection = direction;
      this.lastDashTime = currentTime;
    }
  }
}
