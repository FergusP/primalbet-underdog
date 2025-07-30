// SpearRechargeIndicatorHTML.ts - HTML/Canvas-based Spear Recharge Indicator
// Renders to a DOM element for better positioning alongside UI elements

export class SpearRechargeIndicatorHTML {
  private scene: Phaser.Scene;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement | null = null;
  
  private radius: number = 22;
  private strokeWidth: number = 6; // Thicker for better visibility
  private rechargeDuration: number;
  
  private isActive: boolean = false;
  private progress: number = 0;
  private rechargeTween?: Phaser.Tweens.Tween;
  
  constructor(scene: Phaser.Scene, options: {
    containerId?: string;
    rechargeDuration?: number;
  } = {}) {
    this.scene = scene;
    this.rechargeDuration = options.rechargeDuration || 3500;
    
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = 50;
    this.canvas.height = 50;
    this.canvas.style.position = 'relative';
    this.canvas.style.display = 'block';
    this.canvas.style.pointerEvents = 'none';
    
    this.ctx = this.canvas.getContext('2d')!;
    
    // Find container and append canvas
    const containerId = options.containerId || 'spear-recharge-canvas';
    this.container = document.getElementById(containerId);
    
    if (this.container) {
      this.container.appendChild(this.canvas);
      console.log('Spear recharge canvas appended to container');
    } else {
      console.error(`Container element with id '${containerId}' not found`);
      // Try to find it after a delay
      setTimeout(() => {
        this.container = document.getElementById(containerId);
        if (this.container) {
          this.container.appendChild(this.canvas);
          console.log('Spear recharge canvas appended to container (delayed)');
        } else {
          console.error(`Container element with id '${containerId}' still not found after delay`);
        }
      }, 1000);
    }
    
    // Initially hidden
    this.setVisible(false);
  }
  
  private drawBackground(): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Background circle (bronze/dark gold)
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)'; // Dark bronze
    this.ctx.lineWidth = this.strokeWidth;
    this.ctx.stroke();
    
    // Inner guide circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.radius - 4, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }
  
  private drawProgress(): void {
    if (this.progress <= 0) return;
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Calculate angle (clockwise from top)
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (this.progress * Math.PI * 2);
    
    // Golden divine glow color
    const intensity = Math.floor(215 + (this.progress * 40));
    const glowColor = `rgb(255, ${intensity}, 0)`;
    
    // Main progress arc
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.radius, startAngle, endAngle);
    this.ctx.strokeStyle = glowColor;
    this.ctx.lineWidth = this.strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
    
    // Add glow effect when near completion
    if (this.progress > 0.8) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, this.radius + 2, startAngle, endAngle);
      this.ctx.strokeStyle = `rgba(255, ${intensity}, 0, 0.3)`;
      this.ctx.lineWidth = this.strokeWidth + 4;
      this.ctx.stroke();
    }
    
    // Draw Roman numerals at cardinal points
    this.ctx.font = 'bold 10px serif';
    this.ctx.fillStyle = '#CD853F';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // XII (top)
    this.ctx.fillText('XII', centerX, centerY - this.radius - 10);
    // III (right)
    this.ctx.fillText('III', centerX + this.radius + 10, centerY);
    // VI (bottom)
    this.ctx.fillText('VI', centerX, centerY + this.radius + 10);
    // IX (left)
    this.ctx.fillText('IX', centerX - this.radius - 10, centerY);
  }
  
  private updateCanvas(): void {
    this.drawBackground();
    this.drawProgress();
  }
  
  public startRecharge(): void {
    console.log('Starting HTML spear recharge animation');
    console.log('Canvas element:', this.canvas);
    console.log('Container element:', this.container);
    console.log('Canvas parent:', this.canvas.parentElement);
    
    this.isActive = true;
    this.progress = 0;
    this.setVisible(true);
    
    // Clean up any existing tween
    if (this.rechargeTween) {
      this.rechargeTween.remove();
    }
    
    // Create tween for smooth animation
    this.rechargeTween = this.scene.tweens.add({
      targets: this,
      progress: 1,
      duration: this.rechargeDuration,
      ease: 'Linear',
      onUpdate: () => {
        this.updateCanvas();
      },
      onComplete: () => {
        this.onRechargeComplete();
      }
    });
    
    // Initial draw
    this.updateCanvas();
  }
  
  private onRechargeComplete(): void {
    console.log('HTML spear recharge completed');
    
    this.isActive = false;
    
    // Show completion flash effect
    this.showCompletionFlash();
    
    // Emit completion event
    this.scene.events.emit('spear-recharged');
  }
  
  private showCompletionFlash(): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Create flash overlay
    let flashAlpha = 0.9;
    const flashDuration = 800;
    const startTime = Date.now();
    
    const flashAnimation = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < flashDuration) {
        // Fade out the flash
        flashAlpha = 0.9 * (1 - elapsed / flashDuration);
        
        // Redraw base
        this.updateCanvas();
        
        // Draw flash overlay
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.radius + 6, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        requestAnimationFrame(flashAnimation);
      } else {
        // Final redraw without flash
        this.updateCanvas();
      }
    };
    
    flashAnimation();
  }
  
  public reset(): void {
    if (this.rechargeTween) {
      this.rechargeTween.remove();
      this.rechargeTween = undefined;
    }
    
    this.isActive = false;
    this.progress = 0;
    this.setVisible(false);
  }
  
  public setVisible(visible: boolean): void {
    if (this.canvas) {
      this.canvas.style.display = visible ? 'block' : 'none';
    }
  }
  
  public getIsActive(): boolean {
    return this.isActive;
  }
  
  public destroy(): void {
    if (this.rechargeTween) {
      this.rechargeTween.remove();
    }
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    this.container = null;
  }
}