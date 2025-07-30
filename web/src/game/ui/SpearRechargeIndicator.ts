// SpearRechargeIndicator.ts - Phaser 3 Circular Spear Recharge UI Component
// Roman-themed circular progress indicator for divine spear regeneration

export class SpearRechargeIndicator extends Phaser.GameObjects.Container {
  private radius: number;
  private strokeWidth: number;
  private rechargeDuration: number;
  
  private backgroundCircle!: Phaser.GameObjects.Graphics;
  private progressCircle!: Phaser.GameObjects.Graphics;
  private shimmerEffect!: Phaser.GameObjects.Graphics;
  
  private isActive: boolean = false;
  private progress: number = 0;
  private rechargeTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, options: {
    radius?: number;
    strokeWidth?: number;
    rechargeDuration?: number;
  } = {}) {
    super(scene, x, y);
    
    this.radius = options.radius || 20;
    this.strokeWidth = options.strokeWidth || 4;
    this.rechargeDuration = options.rechargeDuration || 3500; // 3.5 seconds
    
    this.createElements();
    scene.add.existing(this);
    
    // Initially hidden
    this.visible = false;
  }

  private createElements(): void {
    // Background circle (bronze Roman frame)
    this.backgroundCircle = this.scene.add.graphics();
    this.backgroundCircle.lineStyle(this.strokeWidth, 0x8B4513, 0.6); // Bronze
    this.backgroundCircle.strokeCircle(0, 0, this.radius);
    this.add(this.backgroundCircle);
    
    // Progress circle (divine golden fill)
    this.progressCircle = this.scene.add.graphics();
    this.add(this.progressCircle);
    
    // Completion shimmer effect
    this.shimmerEffect = this.scene.add.graphics();
    this.shimmerEffect.visible = false;
    this.add(this.shimmerEffect);
    
    // Roman rune marks at cardinal directions
    this.createRuneMarks();
  }

  private createRuneMarks(): void {
    const runePositions = [
      { angle: 0, symbol: 'I' },        // 12 o'clock
      { angle: Math.PI/2, symbol: 'II' },   // 3 o'clock
      { angle: Math.PI, symbol: 'III' },     // 6 o'clock
      { angle: 3*Math.PI/2, symbol: 'IV' }  // 9 o'clock
    ];
    
    runePositions.forEach(({ angle, symbol }) => {
      const x = Math.cos(angle - Math.PI/2) * (this.radius + 10);
      const y = Math.sin(angle - Math.PI/2) * (this.radius + 10);
      
      const rune = this.scene.add.text(x, y, symbol, {
        fontFamily: 'serif',
        fontSize: '10px',
        color: '#CD853F', // Bronze color
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.add(rune);
    });
  }

  private updateProgress(progress: number): void {
    this.progress = Math.max(0, Math.min(1, progress));
    
    // Clear previous progress drawing
    this.progressCircle.clear();
    
    if (this.progress > 0) {
      // Calculate arc angle (clockwise from top)
      const angle = this.progress * 2 * Math.PI;
      
      // Divine golden color with intensity based on progress
      const baseIntensity = 0.8;
      const intensity = baseIntensity + (this.progress * 0.2);
      
      // Golden divine glow color
      const goldValue = Math.floor(215 + (this.progress * 40)); // 215-255
      const glowColor = Phaser.Display.Color.GetColor(255, goldValue, 0);
      
      // Main progress arc
      this.progressCircle.lineStyle(this.strokeWidth, glowColor, intensity);
      this.progressCircle.beginPath();
      this.progressCircle.arc(0, 0, this.radius, -Math.PI/2, -Math.PI/2 + angle, false);
      this.progressCircle.strokePath();
      
      // Add outer glow effect when near completion (80%+)
      if (this.progress > 0.8) {
        this.progressCircle.lineStyle(this.strokeWidth + 2, glowColor, 0.3);
        this.progressCircle.beginPath();
        this.progressCircle.arc(0, 0, this.radius + 1, -Math.PI/2, -Math.PI/2 + angle, false);
        this.progressCircle.strokePath();
      }
    }
  }

  public startRecharge(): void {
    console.log('Starting spear recharge animation');
    
    this.isActive = true;
    this.progress = 0;
    this.visible = true;
    
    // Clean up any existing tween
    if (this.rechargeTween) {
      this.rechargeTween.remove();
    }
    
    // Smooth tween-based animation
    this.rechargeTween = this.scene.tweens.add({
      targets: this,
      progress: 1,
      duration: this.rechargeDuration,
      ease: 'Linear',
      onUpdate: () => {
        this.updateProgress(this.progress);
      },
      onComplete: () => {
        this.onRechargeComplete();
      }
    });
  }

  private onRechargeComplete(): void {
    console.log('Spear recharge completed');
    
    this.isActive = false;
    
    // Keep circle visible and fully filled (no blinking)
    this.updateProgress(1);
    
    // Show completion shimmer effect
    this.showCompletionShimmer();
    
    // Emit completion event to parent scene
    this.scene.events.emit('spear-recharged');
  }

  private showCompletionShimmer(): void {
    this.shimmerEffect.visible = true;
    this.shimmerEffect.clear();
    
    // Bright golden shimmer ring
    this.shimmerEffect.lineStyle(2, 0xFFFFFF, 0.9);
    this.shimmerEffect.strokeCircle(0, 0, this.radius + 4);
    
    // Fade out shimmer effect
    this.scene.tweens.add({
      targets: this.shimmerEffect,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.shimmerEffect.visible = false;
        this.shimmerEffect.alpha = 1;
      }
    });
  }

  public reset(): void {
    // Clean up tween
    if (this.rechargeTween) {
      this.rechargeTween.remove();
      this.rechargeTween = undefined;
    }
    
    this.isActive = false;
    this.progress = 0;
    this.visible = false;
    this.updateProgress(0);
    
    // Reset shimmer effect
    this.shimmerEffect.visible = false;
    this.shimmerEffect.alpha = 1;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public destroy(): void {
    // Clean up tween before destroying
    if (this.rechargeTween) {
      this.rechargeTween.remove();
    }
    
    super.destroy();
  }
}