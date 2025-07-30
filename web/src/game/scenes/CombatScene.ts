// Action Combat Scene - Real-time combat with movement
import { BaseScene } from './BaseScene';
import { Monster } from '../../types';
import { SpearRechargeIndicatorHTML } from '../ui/SpearRechargeIndicatorHTML';

export class CombatScene extends BaseScene {
  private player!: Phaser.GameObjects.Sprite;
  private monster!: Phaser.GameObjects.Sprite;
  private vault!: Phaser.GameObjects.Sprite;

  // Game objects
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;

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
  private monsterAttackCooldown: number = 1500; // Base cooldown, adjusted per monster
  private lastMonsterAttackTime: number = 0;

  // Range indicators (for development)
  private meleeRangeIndicator!: Phaser.GameObjects.Graphics;
  private meleeRange: number = 150; // Good melee range for better UX
  private debugGraphics!: Phaser.GameObjects.Graphics;
  private debugMode: boolean = true; // Toggle for debug visualization
  private attackRangeIndicator!: Phaser.GameObjects.Graphics; // Shows where player can attack

  // Movement penalty system
  private isSlowed: boolean = false;
  private slowedUntil: number = 0;
  private normalSpeed: number = 150;
  private slowedSpeed: number = 60;

  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data: { monster: Monster; combatId: string; walletAddress?: string }) {
    console.log('CombatScene init data:', data);

    if (!data || !data.monster) {
      console.error('No monster data provided to CombatScene');
      // Return to colosseum if no monster data
      this.scene.start('ColosseumScene');
      return;
    }

    this.monsterData = data.monster;
    console.log('CombatScene received monster data:', this.monsterData);
    this.monsterHealth = this.monsterData.baseHealth;
    this.monsterMaxHealth = this.monsterData.baseHealth;

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
      this.scene.start('ColosseumScene');
      return;
    }

    const { width, height } = this.cameras.main;

    // Create arena background
    const bgRect = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x2a2a3a
    );
    this.registerUIElement('bg', bgRect);

    // Add arena borders
    this.add.rectangle(width / 2, 20, width - 40, 40, 0x444444);
    this.add.rectangle(width / 2, height - 20, width - 40, 40, 0x444444);
    this.add.rectangle(20, height / 2, 40, height - 40, 0x444444);
    this.add.rectangle(width - 20, height / 2, 40, height - 40, 0x444444);

    // Create player (blue circle for now)
    this.player = this.add.sprite(
      width * 0.2,
      height * 0.5,
      'gladiator-placeholder'
    );
    this.player.setTint(0x4444ff);
    this.player.setScale(2);

    // Create monster using tier's sprite
    const spriteKey = this.monsterData.tier.sprite;
    this.monster = this.add.sprite(
      width * 0.7,
      height * 0.5,
      spriteKey
    );
    
    // Set appropriate tint based on monster type
    const tints: Record<string, number> = {
      'skeleton-placeholder': 0xff4444,  // Red
      'goblin-placeholder': 0x44ff44,    // Green
      'orc-placeholder': 0xff8844,       // Orange
      'minotaur-placeholder': 0x8844ff,  // Purple
      'cyclops-placeholder': 0x880000    // Dark Red
    };
    this.monster.setTint(tints[spriteKey] || 0xff4444);
    
    // Scale based on difficulty
    const scales: Record<string, number> = {
      'skeleton-placeholder': 2.5,
      'goblin-placeholder': 2.5,
      'orc-placeholder': 3.0,
      'minotaur-placeholder': 3.5,
      'cyclops-placeholder': 4.0
    };
    this.monster.setScale(scales[spriteKey] || 2.5);
    this.monster.setAlpha(1); // Ensure fully visible
    this.monster.setVisible(true);
    this.monster.setDepth(5); // Ensure proper rendering order

    // Create vault (gold rectangle at the back)
    this.vault = this.add.sprite(
      width * 0.9,
      height * 0.5,
      'vault-placeholder'
    );
    this.vault.setTint(0xffd700);
    this.vault.setScale(1.5);

    // Enable physics
    this.physics.add.existing(this.player);
    this.physics.add.existing(this.monster);
    this.physics.add.existing(this.vault);

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

    // Create spear group for projectiles - NO collision detection
    this.spears = this.physics.add.group();

    // Create range indicator (for development)
    this.createRangeIndicator();

    // Create debug graphics
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(100); // On top of everything

    // Create spear texture once
    this.createSpearTexture();
    
    // Delay creation of HTML spear recharge indicator to ensure DOM is ready
    this.time.delayedCall(500, () => {
      // Create HTML spear recharge indicator
      this.spearRechargeIndicator = new SpearRechargeIndicatorHTML(this, {
        containerId: 'spear-recharge-canvas',
        rechargeDuration: this.spearRegenTime
      });
      
      // Remove any existing listener first to prevent duplicates
      this.events.off('spear-recharged', this.onSpearRecharged, this);
      
      // Set up spear recharge event listener
      this.events.on('spear-recharged', this.onSpearRecharged, this);
      
      console.log('SpearRechargeIndicatorHTML created after delay');
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
      '🏹  E/Right Click to throw spears (Limited: 2 max, slows movement)'
    );
    console.log('🏛️  Defeat monster to access vault!');

    // Emit initial state for UI
    this.emitCombatState();
    this.emitMonsterInfo();

    // Emit instructions
    window.dispatchEvent(
      new CustomEvent('combat-instructions', {
        detail: {
          text: 'WASD: Move • SPACE/Click: Melee • E/Right-Click: Spear (Limited) • Defeat monster!',
          visible: true,
        },
      })
    );
  }

  emitGameState() {
    // Safety clamp spears to never exceed max
    this.currentSpears = Math.min(this.currentSpears, this.maxSpears);
    
    console.log(`EMITTING GAME STATE: currentSpears=${this.currentSpears}, maxSpears=${this.maxSpears}`);
    
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
    console.log('Emitting monster info:', this.monsterData);
    window.dispatchEvent(
      new CustomEvent('monster-info', {
        detail: {
          type: this.monsterData?.type || 'UNKNOWN MONSTER',
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

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    this.handlePlayerMovement();
    this.handleMonsterAI();
    this.handleInputAttacks(time);
    this.regenerateSpears(time); // RE-ENABLED: Limited spear system
    this.updateRangeIndicator();
    this.checkSpearCollisions(); // RE-ENABLED: Fixed spear collision
    this.checkGameOver();
    this.emitSpritePositions();
  }

  updateRangeIndicator() {
    // Update position to follow player
    this.meleeRangeIndicator.setPosition(this.player.x, this.player.y);

    // Check distance to monster
    const distance = Phaser.Math.Distance.Between(
      this.monster.x,
      this.monster.y,
      this.player.x,
      this.player.y
    );
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
        // IN RANGE: Show bright green circle pulsing
        const pulse = Math.sin(this.time.now * 0.005) * 0.3 + 0.7;
        this.meleeRangeIndicator.lineStyle(4, 0x00ff00, pulse);
        this.meleeRangeIndicator.strokeCircle(0, 0, 50); // Your attack indicator

        // Show attack zone
        this.meleeRangeIndicator.fillStyle(0x00ff00, 0.1);
        this.meleeRangeIndicator.fillCircle(0, 0, 50);
      } else if (monsterDistance > this.monsterAttackRange) {
        // OUT OF RANGE: Show distance to get in range
        this.meleeRangeIndicator.lineStyle(2, 0xff0000, 0.5);

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
      this.player.setTint(0x4444ff); // Reset to normal blue tint
      // Emit updated game state when slowdown ends
      this.emitGameState();
    }

    // Determine current speed based on slowdown status
    const speed = this.isSlowed ? this.slowedSpeed : this.normalSpeed;

    // Reset velocity
    playerBody.setVelocity(0);

    // Handle input
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      playerBody.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      playerBody.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      playerBody.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      playerBody.setVelocityY(speed);
    }
  }

  handleMonsterAI() {
    // Stop if no body
    if (!this.monster.body) return;

    const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;

    // If dead, ensure monster stops moving
    if (this.monsterHealth <= 0) {
      monsterBody.setVelocity(0, 0);
      monsterBody.enable = false; // Disable physics completely when dead
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.monster.x,
      this.monster.y,
      this.player.x,
      this.player.y
    );

    // Check if monster can attack
    if (distance <= this.monsterAttackRange && this.playerHealth > 0) {
      // Stop moving when in attack range
      monsterBody.setVelocity(0);

      // Try to attack if cooldown is over
      const currentTime = this.time.now;
      // Adjust cooldown based on monster difficulty (harder monsters attack faster)
      const cooldownMultiplier = this.monsterData.tier.defenseMultiplier;
      const adjustedCooldown = this.monsterAttackCooldown * cooldownMultiplier;
      
      if (
        currentTime >
        this.lastMonsterAttackTime + adjustedCooldown
      ) {
        console.log(
          'Monster in range! Distance:',
          distance,
          'Attack range:',
          this.monsterAttackRange
        );
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
      // Adjust speed based on monster tier (harder monsters are faster)
      const baseSpeed = 80;
      const speedMultiplier = 1.5 - this.monsterData.tier.defenseMultiplier; // Inverse relationship
      const speed = baseSpeed * (1 + speedMultiplier);
      monsterBody.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  handleInputAttacks(time: number) {
    // Check for keyboard attacks
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.attemptMeleeAttack();
    }

    // Spear throwing with E key
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
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
    if (
      time < this.lastMeleeTime + this.meleeCooldown ||
      this.monsterHealth <= 0
    )
      return;

    const distance = Phaser.Math.Distance.Between(
      this.monster.x,
      this.monster.y,
      this.player.x,
      this.player.y
    );

    // Must be close for melee
    if (distance < this.meleeRange) {
      this.performMeleeAttack();
      this.lastMeleeTime = time;
    } else {
      // Emit feedback event
      window.dispatchEvent(
        new CustomEvent('combat-feedback', {
          detail: {
            type: 'too-far',
            x: this.player.x,
            y: this.player.y,
            text: 'Too far!',
          },
        })
      );
    }
  }

  performMeleeAttack() {
    // Don't attack if monster is already dead
    if (this.monsterHealth <= 0) {
      // Emit feedback event
      window.dispatchEvent(
        new CustomEvent('combat-feedback', {
          detail: {
            type: 'already-defeated',
            x: this.monster.x,
            y: this.monster.y,
            text: 'Already defeated!',
          },
        })
      );
      return;
    }

    // Calculate attack angle
    const angleToMonster = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.monster.x,
      this.monster.y
    );

    // Create sword swing effect
    const swingGraphics = this.add.graphics();
    swingGraphics.setPosition(this.player.x, this.player.y);
    swingGraphics.setDepth(10);

    // Draw sword arc
    const arcAngle = Phaser.Math.DegToRad(90); // 90 degree swing
    swingGraphics.lineStyle(4, 0xffffff, 0.8);
    swingGraphics.beginPath();
    swingGraphics.arc(
      0,
      0,
      this.meleeRange * 0.8,
      angleToMonster - arcAngle / 2,
      angleToMonster + arcAngle / 2,
      false
    );
    swingGraphics.strokePath();

    // Animate the swing
    this.tweens.add({
      targets: swingGraphics,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
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

    // Player attacks monster
    const damage = Math.floor(Math.random() * 25) + 15; // 15-40 damage
    this.monsterHealth = Math.max(0, this.monsterHealth - damage);

    // Visual feedback
    this.showDamageNumber(
      this.monster.x,
      this.monster.y - 40,
      damage,
      0xff4444
    );

    // Emit updated game state
    this.emitGameState();

    // Flash effect on hit
    this.monster.setTint(0xffffff);
    this.time.delayedCall(100, () => {
      if (this.monsterHealth > 0) {
        this.monster.setTint(0xff4444);
      } else {
        this.monster.setTint(0x666666); // Grey when dead
      }
    });

    // If monster just died, stop it immediately
    if (this.monsterHealth <= 0 && this.monster.body) {
      const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;
      monsterBody.setVelocity(0, 0);
      monsterBody.enable = false;
    }
  }

  performMonsterAttack() {
    console.log('Monster attacking! Player health before:', this.playerHealth);

    // Monster attack animation
    this.tweens.add({
      targets: this.monster,
      scaleX: 3,
      scaleY: 3,
      duration: 150,
      yoyo: true,
      ease: 'Power1',
    });

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
    const baseDamage = this.monsterData.tier.attackPower;
    const damage = Math.floor(Math.random() * baseDamage) + Math.floor(baseDamage / 2);
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

    // Flash player red
    this.player.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      this.player.setTint(0x4444ff);
    });
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

    try {
      // Check if spear texture exists
      if (!this.textures.exists('spear-texture')) {
        console.error('Spear texture does not exist! Creating fallback...');
        this.createSpearTexture();
      }

      // Create a simple spear sprite
      const spear = this.spears.create(
        this.player.x,
        this.player.y,
        'spear-texture'
      );

      if (!spear) {
        console.error('Failed to create spear sprite!');
        return;
      }

      spear.rotation = angle;

      // Set spear velocity
      const speed = 400;
      spear.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      // Update spear count
      const beforeCount = this.currentSpears;
      this.currentSpears--;
      this.lastSpearTime = time;

      console.log(`SPEAR THROWN: ${beforeCount} -> ${this.currentSpears}`);
      
      // Start recharge animation if we have spears to regenerate
      if (this.currentSpears < this.maxSpears) {
        if (!this.spearRechargeIndicator) {
          console.warn('Spear recharge indicator not yet created!');
        } else if (this.spearRechargeIndicator.getIsActive()) {
          console.log('Spear recharge already active');
        } else {
          console.log('Starting spear recharge for next spear');
          this.spearRechargeIndicator.startRecharge();
        }
      }

      // Emit updated game state
      this.emitGameState();

      console.log('Spear thrown! Remaining:', this.currentSpears);

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
    // Apply 800ms movement slowdown after throwing spear
    this.isSlowed = true;
    this.slowedUntil = this.time.now + 800;

    // Visual feedback: tint player orange to show slowdown
    this.player.setTint(0xffa500);

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
        console.log(
          'COLLISION! Distance:',
          distance,
          'Monster HP:',
          this.monsterHealth
        );

        // Only damage if monster is alive and still exists
        if (this.monsterHealth > 0 && this.monster && this.monster.active) {
          // Deal significantly reduced damage for ranged attack (8-12 instead of 15-40 for melee)
          const damage = Math.floor(Math.random() * 5) + 8; // 8-12 damage
          this.monsterHealth = Math.max(0, this.monsterHealth - damage);

          console.log(
            'Spear damage dealt:',
            damage,
            'New HP:',
            this.monsterHealth
          );

          // Show damage number with spear color
          this.showDamageNumber(
            this.monster.x,
            this.monster.y - 40,
            damage,
            0xffaa00
          );

          // Emit updated game state
          this.emitGameState();

          // Flash effect on monster (ensure monster still exists)
          if (this.monster && this.monster.active) {
            this.monster.setTint(0xffffaa);
            this.time.delayedCall(100, () => {
              if (this.monster && this.monster.active) {
                this.monster.setTint(
                  this.monsterHealth > 0 ? 0xff4444 : 0x666666
                );
              }
            });
          }

          // If monster just died, stop it immediately
          if (this.monsterHealth <= 0 && this.monster.body) {
            const monsterBody = this.monster.body as Phaser.Physics.Arcade.Body;
            monsterBody.setVelocity(0, 0);
            monsterBody.enable = false;
          }
        }

        // Safely destroy the spear after processing
        if (spear && spear.active) {
          spear.destroy();
        }
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
    console.log(`SPEAR REGENERATED: ${this.currentSpears}/${this.maxSpears}`);
    
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
    const vaultScreenPos = camera.getWorldPoint(this.vault.x, this.vault.y);

    window.dispatchEvent(
      new CustomEvent('sprite-positions', {
        detail: {
          player: { x: playerScreenPos.x, y: playerScreenPos.y },
          monster: {
            x: monsterScreenPos.x,
            y: monsterScreenPos.y,
            alive: this.monsterHealth > 0,
          },
          vault: { x: vaultScreenPos.x, y: vaultScreenPos.y },
        },
      })
    );
  }

  showDamageNumber(x: number, y: number, damage: number, color: number) {
    // Emit damage number event for UI to display
    window.dispatchEvent(
      new CustomEvent('damage-number', {
        detail: {
          x: x,
          y: y,
          damage: damage,
          color: Phaser.Display.Color.IntegerToColor(color).rgba,
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
    } else if (this.monsterHealth <= 0) {
      this.gameOver(true); // Player won
    }
  }

  gameOver(victory: boolean) {
    this.isGameOver = true;
    const { width, height } = this.cameras.main;

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
        // Phase 2: Animate vault to center (500-1500ms)
        this.animateVaultToCenter(width, height, backgroundOverlay);
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

  animateVaultToCenter(
    width: number,
    height: number,
    backgroundOverlay: Phaser.GameObjects.Rectangle
  ) {
    const centerX = width / 2;
    const centerY = height / 2;

    // Remove golden glow - keep only the vault sprite for consistency

    // Ensure vault is above everything else
    this.vault.setDepth(100);

    // Animate vault movement and scaling
    this.tweens.add({
      targets: this.vault,
      x: centerX,
      y: height * 0.52, // Moved higher to avoid button overlap
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0.85, // Higher opacity to draw attention
      duration: 1000,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Phase 3: Add particle explosion (1500-2000ms)
        this.createParticleExplosion(centerX, centerY);
        // Phase 4: Show victory text (2000ms+)
        this.showVictoryText(centerX, centerY);
      },
    });

    // Add golden tint to vault
    this.vault.setTint(0xffffff);
    this.vault.setAlpha(1); // Ensure vault is fully visible
    this.tweens.add({
      targets: this.vault,
      duration: 1000,
      onComplete: () => {
        this.vault.setTint(0xffd700);
      },
    });
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
    // Keep vault visible - don't hide it

    // Emit victory UI event
    window.dispatchEvent(
      new CustomEvent('victory-ui', {
        detail: {
          centerX: centerX,
          centerY: centerY - 150,
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

  // Remove handleVaultChoice and enableVaultInteraction methods as they're no longer needed

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

    this.input.once('pointerdown', () => {
      this.scene.start('ColosseumScene', {
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

    // Update arena borders
    // Top border
    this.add.rectangle(width / 2, 20, width - 40, 40, 0x444444);
    // Bottom border
    this.add.rectangle(width / 2, height - 20, width - 40, 40, 0x444444);
    // Left border
    this.add.rectangle(20, height / 2, 40, height - 40, 0x444444);
    // Right border
    this.add.rectangle(width - 20, height / 2, 40, height - 40, 0x444444);

    // Reposition player, monster and vault
    if (this.player) {
      this.player.setPosition(width * 0.2, height * 0.5);
    }
    if (this.monster) {
      this.monster.setPosition(width * 0.7, height * 0.5);
    }
    if (this.vault) {
      this.vault.setPosition(width * 0.9, height * 0.5);
    }

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
}
