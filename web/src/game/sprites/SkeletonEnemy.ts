import * as Phaser from 'phaser';

export class SkeletonEnemy extends Phaser.Physics.Arcade.Sprite {
  public health: number = 25;
  public maxHealth: number = 25;
  public damage: number = 7;
  public moveSpeed: number = 120;
  public attackRange: number = 60;
  public attackCooldown: number = 1000;
  private lastAttackTime: number = 0;
  private isAttacking: boolean = false;
  private isDead: boolean = false;
  private player: Phaser.GameObjects.Sprite;
  private healthBar!: Phaser.GameObjects.Graphics;
  
  // Advanced AI properties
  public behavior: 'aggressive' | 'cautious' | 'opportunist' | 'flanker' = 'aggressive';
  public skeletonType: 'normal' | 'fast' | 'tank' | 'elite' = 'normal';
  private circleAngle: number = 0;
  private zigzagPhase: number = 0;
  private targetBehindPlayer: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, player: Phaser.GameObjects.Sprite) {
    super(scene, x, y, 'skeleton_idle');
    this.player = player;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(1.8); // Smaller than boss for clear differentiation
    this.setDepth(5);
    
    // Physics setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(40, 60);
    body.setOffset(30, 20);
    body.setCollideWorldBounds(true);
    
    // Create health bar
    this.createHealthBar();
    
    // Apply skeleton type properties
    this.applySkeletonType();
    
    // Start with spawn animation
    this.spawnAnimation();
  }
  
  private createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.healthBar.setDepth(6);
    this.updateHealthBar();
  }
  
  private updateHealthBar() {
    this.healthBar.clear();
    
    // Only show health bar if damaged
    if (this.health < this.maxHealth && !this.isDead) {
      const barWidth = 40;
      const barHeight = 4;
      const x = this.x - barWidth / 2;
      const y = this.y - 40;
      
      // Background
      this.healthBar.fillStyle(0x000000, 0.5);
      this.healthBar.fillRect(x, y, barWidth, barHeight);
      
      // Health fill
      const healthPercent = this.health / this.maxHealth;
      this.healthBar.fillStyle(0xff0000, 1);
      this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
  }
  
  applySkeletonType() {
    switch(this.skeletonType) {
      case 'fast':
        this.moveSpeed = 180;
        this.health = 15;
        this.maxHealth = 15;
        this.setTint(0xff6666); // Red tint
        this.attackCooldown = 800;
        break;
      case 'tank':
        this.moveSpeed = 80;
        this.health = 40;
        this.maxHealth = 40;
        this.setTint(0x6666ff); // Blue tint
        this.damage = 10;
        break;
      case 'elite':
        this.moveSpeed = 120;
        this.health = 30;
        this.maxHealth = 30;
        this.setTint(0xffff66); // Yellow tint
        this.damage = 9;
        this.attackCooldown = 900;
        break;
      default:
        // Normal skeleton, no changes
        break;
    }
  }
  
  spawnAnimation() {
    // Rise from ground effect
    this.setAlpha(0);
    this.y += 50;
    
    // Particle effect for spawn
    const particles = this.scene.add.particles(this.x, this.y, 'spark-placeholder', {
      color: [0x666666, 0x999999],
      scale: { start: 0.5, end: 0 },
      speed: { min: 50, max: 100 },
      quantity: 10,
      lifespan: 500,
      blendMode: 'ADD'
    });
    
    this.scene.tweens.add({
      targets: this,
      y: this.y - 50,
      alpha: 0.9, // Slight transparency for visual clarity
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.play('skeleton_idle');
        particles.destroy();
      }
    });
  }
  
  update(time: number) {
    if (this.isDead) {
      this.healthBar.setPosition(this.x, this.y);
      return;
    }
    
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.player.x, this.player.y
    );
    
    if (distance <= this.attackRange && time - this.lastAttackTime > this.attackCooldown) {
      this.attack(time);
    } else if (distance > this.attackRange && !this.isAttacking) {
      this.moveTowardsPlayer();
    } else if (!this.isAttacking) {
      // Stop and idle if in range but on cooldown
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      if (this.anims.currentAnim?.key !== 'skeleton_idle') {
        this.play('skeleton_idle');
      }
    }
    
    // Update health bar position
    this.updateHealthBar();
  }
  
  moveTowardsPlayer() {
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.player.x, this.player.y
    );
    
    let targetX = this.player.x;
    let targetY = this.player.y;
    let actualSpeed = this.moveSpeed;
    
    switch(this.behavior) {
      case 'aggressive':
        // Direct approach (current behavior)
        break;
        
      case 'cautious':
        // Circle at medium range, dart in occasionally
        if (distance > 150) {
          // Move closer
          actualSpeed = this.moveSpeed * 0.8;
        } else if (distance < 100) {
          // Circle around player
          this.circleAngle += 0.05;
          const circleRadius = 120;
          targetX = this.player.x + Math.cos(this.circleAngle) * circleRadius;
          targetY = this.player.y + Math.sin(this.circleAngle) * circleRadius;
        }
        break;
        
      case 'flanker':
        // Try to get behind player
        if (!this.targetBehindPlayer) {
          const playerFacing = (this.player as any).flipX ? -1 : 1;
          targetX = this.player.x - (playerFacing * 100);
          targetY = this.player.y + Phaser.Math.Between(-50, 50);
          
          // If close to target position, switch to normal attack
          if (distance < 80) {
            this.targetBehindPlayer = true;
          }
        }
        break;
        
      case 'opportunist':
        // Wait at medium range, attack when player is busy
        if (distance > 200) {
          actualSpeed = this.moveSpeed * 0.6;
        } else if (distance > 120) {
          // Maintain distance
          actualSpeed = 0;
          const body = this.body as Phaser.Physics.Arcade.Body;
          body.setVelocity(0, 0);
        }
        // Rush in when player attacks (detected by listening to attack events)
        break;
    }
    
    // Add zigzag when player is aiming
    const isPlayerAiming = (this.scene as any).isPlayerAiming;
    if (isPlayerAiming && distance > 100) {
      this.zigzagPhase += 0.15;
      const perpAngle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY) + Math.PI/2;
      targetX += Math.cos(perpAngle) * Math.sin(this.zigzagPhase) * 30;
      targetY += Math.sin(perpAngle) * Math.sin(this.zigzagPhase) * 30;
    }
    
    // Calculate angle to target
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      targetX, targetY
    );
    
    // Set velocity
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (actualSpeed > 0) {
      body.setVelocity(
        Math.cos(angle) * actualSpeed,
        Math.sin(angle) * actualSpeed
      );
      
      // Play walk animation
      if (this.anims.currentAnim?.key !== 'skeleton_walk') {
        this.play('skeleton_walk');
      }
    }
    
    // Face the player
    this.setFlipX(this.player.x < this.x);
  }
  
  attack(time: number) {
    this.lastAttackTime = time;
    this.isAttacking = true;
    
    // Stop movement
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    
    // Play attack animation (randomly choose between attack01 and attack02)
    const attackAnim = Phaser.Math.Between(1, 2) === 1 ? 'skeleton_attack01' : 'skeleton_attack02';
    this.play(attackAnim);
    
    // Face the player
    this.setFlipX(this.player.x < this.x);
    
    // Deal damage after animation hits
    this.scene.time.delayedCall(400, () => {
      // Check if still in range
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        this.player.x, this.player.y
      );
      
      if (distance <= this.attackRange * 1.2 && !this.isDead) {
        // Emit damage event
        this.scene.events.emit('skeleton-attack', {
          damage: Phaser.Math.Between(5, 8),
          source: this
        });
      }
      
      this.isAttacking = false;
    });
  }
  
  takeDamage(amount: number): boolean {
    if (this.isDead) return false;
    
    this.health -= amount;
    
    // Update health bar
    this.updateHealthBar();
    
    // Play hurt animation
    this.play('skeleton_hurt');
    
    // Flash red
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) this.clearTint();
    });
    
    // Small knockback
    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      this.x, this.y
    );
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(
      Math.cos(angle) * 150,
      Math.sin(angle) * 150
    );
    
    // Stop knockback after short time
    this.scene.time.delayedCall(200, () => {
      if (!this.isDead && body) {
        body.setVelocity(0, 0);
      }
    });
    
    if (this.health <= 0) {
      this.die();
      return true; // Enemy died
    }
    
    return false;
  }
  
  die() {
    if (this.isDead) return; // Prevent multiple death calls
    
    this.isDead = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    
    // Clear health bar
    this.healthBar.clear();
    
    // Play death animation
    this.play('skeleton_death');
    
    // Drop bonus
    this.dropBonus();
    
    // Death particles
    const particles = this.scene.add.particles(this.x, this.y, 'spark-placeholder', {
      color: [0xcccccc, 0x666666],
      scale: { start: 0.5, end: 0 },
      speed: { min: 50, max: 150 },
      quantity: 15,
      lifespan: 600,
      blendMode: 'ADD'
    });
    
    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      delay: 300,
      onComplete: () => {
        particles.destroy();
        this.healthBar.destroy();
        this.destroy();
      }
    });
  }
  
  dropBonus() {
    const bonusTypes = ['damage', 'speed', 'shield', 'spear'];
    const selectedBonus = Phaser.Math.RND.pick(bonusTypes);
    
    // Emit bonus drop event
    this.scene.events.emit('bonus-dropped', {
      type: selectedBonus,
      x: this.x,
      y: this.y
    });
  }
  
  // React to player ground slam
  scatterFromSlam(slamX: number, slamY: number) {
    if (this.isDead) return;
    
    const angle = Phaser.Math.Angle.Between(
      slamX, slamY,
      this.x, this.y
    );
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    const scatterForce = 250;
    
    // Scatter away from slam
    body.setVelocity(
      Math.cos(angle) * scatterForce,
      Math.sin(angle) * scatterForce
    );
    
    // Play hurt animation
    this.play('skeleton_hurt');
    
    // Resume normal behavior after scatter
    this.scene.time.delayedCall(500, () => {
      if (!this.isDead) {
        body.setVelocity(0, 0);
      }
    });
  }
  
  // Get speed boost when ally dies nearby
  applyRevengeBoost() {
    if (this.isDead) return;
    
    // Temporary speed and damage boost
    const originalSpeed = this.moveSpeed;
    const originalDamage = this.damage;
    
    this.moveSpeed *= 1.5;
    this.damage *= 1.3;
    
    // Visual indicator - red flash
    this.setTint(0xff0000);
    
    // Create anger particles
    const particles = this.scene.add.particles(this.x, this.y - 20, 'spark-placeholder', {
      color: [0xff0000, 0xaa0000],
      scale: { start: 0.3, end: 0 },
      speed: { min: 20, max: 50 },
      quantity: 3,
      lifespan: 500,
      frequency: 100,
      duration: 2000
    });
    
    // Reset after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      if (!this.isDead) {
        this.moveSpeed = originalSpeed;
        this.damage = originalDamage;
        this.clearTint();
        if (this.skeletonType === 'fast') this.setTint(0xff6666);
        if (this.skeletonType === 'tank') this.setTint(0x6666ff);
        if (this.skeletonType === 'elite') this.setTint(0xffff66);
      }
      particles.destroy();
    });
  }
  
  // Clean up when destroyed
  destroy(fromScene?: boolean) {
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    super.destroy(fromScene);
  }
}