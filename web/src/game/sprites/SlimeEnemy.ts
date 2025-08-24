import * as Phaser from 'phaser';

export class SlimeEnemy extends Phaser.Physics.Arcade.Sprite {
  public health: number = 15;
  public maxHealth: number = 15;
  private moveSpeed: number = 40;
  private isDead: boolean = false;
  private wanderDirection: number = 0;
  private wanderTimer: number = 0;
  private healthBar!: Phaser.GameObjects.Graphics;
  private glowEffect!: Phaser.GameObjects.Graphics;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'slime_idle');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(1.8);
    this.setDepth(4);
    this.setTint(0x88ff88); // Green tint for healing slime
    
    // Physics setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(50, 40);
    body.setOffset(25, 30);
    body.setBounce(0.3); // Bouncy slime
    body.setCollideWorldBounds(true);
    
    // Create glow effect
    this.createGlowEffect();
    
    // Create health bar
    this.createHealthBar();
    
    // Start animation
    this.play('slime_idle');
    
    // Initialize wander
    this.changeWanderDirection();
    
    // Spawn animation
    this.spawnAnimation();
  }
  
  private createGlowEffect() {
    this.glowEffect = this.scene.add.graphics();
    this.glowEffect.setDepth(3);
    this.updateGlowEffect();
  }
  
  private updateGlowEffect() {
    if (this.isDead) {
      this.glowEffect.clear();
      return;
    }
    
    this.glowEffect.clear();
    
    // Create healing glow
    const glowRadius = 30 + Math.sin(this.scene.time.now * 0.003) * 5;
    this.glowEffect.fillStyle(0x00ff00, 0.2);
    this.glowEffect.fillCircle(this.x, this.y, glowRadius);
    
    // Inner glow
    this.glowEffect.fillStyle(0x88ff88, 0.3);
    this.glowEffect.fillCircle(this.x, this.y, glowRadius * 0.7);
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
      const barWidth = 30;
      const barHeight = 3;
      const x = this.x - barWidth / 2;
      const y = this.y - 35;
      
      // Background
      this.healthBar.fillStyle(0x000000, 0.5);
      this.healthBar.fillRect(x, y, barWidth, barHeight);
      
      // Health fill (green for slime)
      const healthPercent = this.health / this.maxHealth;
      this.healthBar.fillStyle(0x00ff00, 1);
      this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
  }
  
  spawnAnimation() {
    // Bubble up from ground
    this.setScale(0.5, 0.5);
    this.setAlpha(0);
    
    // Particle effect for spawn
    const particles = this.scene.add.particles(this.x, this.y, 'spark-placeholder', {
      color: [0x00ff00, 0x88ff88],
      scale: { start: 0.3, end: 0 },
      speed: { min: 20, max: 50 },
      quantity: 8,
      lifespan: 600,
      blendMode: 'ADD'
    });
    
    this.scene.tweens.add({
      targets: this,
      scale: 1.8,
      alpha: 1,
      duration: 600,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        particles.destroy();
      }
    });
  }
  
  update(time: number) {
    if (this.isDead) {
      this.glowEffect.clear();
      this.healthBar.setPosition(this.x, this.y);
      return;
    }
    
    // Change direction periodically
    if (time > this.wanderTimer) {
      this.changeWanderDirection();
      this.wanderTimer = time + Phaser.Math.Between(2000, 4000);
    }
    
    // Move in current direction
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(
      Math.cos(this.wanderDirection) * this.moveSpeed,
      Math.sin(this.wanderDirection) * this.moveSpeed
    );
    
    // Play walk animation
    if (this.anims.currentAnim?.key !== 'slime_walk') {
      this.play('slime_walk');
    }
    
    // Bounce effect
    this.scaleY = 1.8 + Math.sin(time * 0.005) * 0.15;
    
    // Update visual effects
    this.updateGlowEffect();
    this.updateHealthBar();
  }
  
  changeWanderDirection() {
    this.wanderDirection = Phaser.Math.FloatBetween(0, Math.PI * 2);
    
    // Face direction of movement
    const moveRight = Math.cos(this.wanderDirection) > 0;
    this.setFlipX(!moveRight);
  }
  
  takeDamage(amount: number): boolean {
    if (this.isDead) return false;
    
    this.health -= amount;
    
    // Update health bar
    this.updateHealthBar();
    
    // Play hurt animation
    this.play('slime_hurt');
    
    // Flash white
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) this.setTint(0x88ff88);
    });
    
    // Bounce back slightly
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(
      Phaser.Math.Between(-100, 100),
      Phaser.Math.Between(-100, 100)
    );
    
    if (this.health <= 0) {
      this.die();
      return true; // Slime died
    }
    
    return false;
  }
  
  die() {
    if (this.isDead) return; // Prevent multiple death calls
    
    this.isDead = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    
    // Clear visual effects
    this.healthBar.clear();
    this.glowEffect.clear();
    
    // Play death animation
    this.play('slime_death');
    
    // Drop healing orb
    this.dropHealingOrb();
    
    // Splat particles
    const particles = this.scene.add.particles(this.x, this.y, 'spark-placeholder', {
      color: [0x00ff00, 0x88ff88, 0xaaffaa],
      scale: { start: 0.8, end: 0 },
      speed: { min: 100, max: 200 },
      quantity: 20,
      lifespan: 800,
      blendMode: 'ADD'
    });
    
    // Splat effect - flatten and expand
    this.scene.tweens.add({
      targets: this,
      scaleX: 2.5,
      scaleY: 0.5,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        particles.destroy();
        this.healthBar.destroy();
        this.glowEffect.destroy();
        this.destroy();
      }
    });
  }
  
  dropHealingOrb() {
    // Emit healing orb event
    this.scene.events.emit('healing-orb-dropped', {
      x: this.x,
      y: this.y,
      healAmount: Phaser.Math.Between(25, 30)
    });
  }
  
  // Clean up when destroyed
  destroy(fromScene?: boolean) {
    if (this.healthBar) {
      this.healthBar.destroy();
    }
    if (this.glowEffect) {
      this.glowEffect.destroy();
    }
    super.destroy(fromScene);
  }
}