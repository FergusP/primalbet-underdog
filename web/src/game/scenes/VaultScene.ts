// Vault Scene - Attempt to crack the treasure vault
import { BaseScene } from './BaseScene';

export class VaultScene extends BaseScene {
  private victory: boolean = false;
  private monsterDefeated: string = '';
  private walletAddress: string = '';
  private vrfSuccess: boolean = false;
  private prizeAmount: number = 0;
  private bgRect!: Phaser.GameObjects.Rectangle;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private vault!: Phaser.GameObjects.Sprite;
  private vaults: Phaser.GameObjects.Container[] = [];
  private selectedVault?: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'VaultScene' });
  }
  
  create() {
    // Clean up any existing vaults before creating new ones
    this.cleanupVaults();
    
    // Call parent create
    super.create();
  }
  
  private cleanupVaults() {
    // Clean up existing vaults if any
    if (this.vaults && this.vaults.length > 0) {
      this.vaults.forEach(vault => {
        if (vault && vault.active) {
          vault.destroy();
        }
      });
      this.vaults = [];
    }
    this.selectedVault = undefined;
  }

  init(data: { 
    victory: boolean;
    walletAddress: string;
    monsterDefeated: string;
    vrfSuccess?: boolean;
    prizeAmount?: number;
  }) {
    this.victory = data.victory;
    this.walletAddress = data.walletAddress;
    this.monsterDefeated = data.monsterDefeated;
    this.vrfSuccess = data.vrfSuccess || false;
    this.prizeAmount = data.prizeAmount || 0;
    
    // Reset vaults array
    this.vaults = [];
    this.selectedVault = undefined;
  }

  protected createScene() {
    const { width, height } = this.cameras.main;
    
    // Emit scene change event
    window.dispatchEvent(new CustomEvent('sceneChanged', { 
      detail: { sceneName: 'VaultScene' } 
    }));

    // Roman victory chamber background - marble/gold tone
    this.bgRect = this.add.rectangle(width/2, height/2, width, height, 0x2a2520);
    this.registerUIElement('bg', this.bgRect);
    
    // Add subtle gradient overlay for depth
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.0, 0.3, 0.0, 0.0);
    gradient.fillRect(0, 0, width, height);
    gradient.setDepth(1);
    
    // Add golden particles falling like Roman coins
    this.particles = this.add.particles(0, 0, 'spark-placeholder', {
      x: { min: 0, max: width },
      y: 0,
      lifespan: 4000,
      speed: { min: 30, max: 80 },
      scale: { start: 0.8, end: 0.3 },
      blendMode: 'ADD',
      tint: [0xffd700, 0xffaa00, 0xffcc00],
      quantity: 1,
      frequency: 500
    });
    this.registerUIElement('particles', this.particles);
    this.particles.setDepth(2);

    // Hide the single vault sprite (we'll show 3 vaults instead)
    this.vault = this.add.sprite(0, 0, 'vault-placeholder');
    this.vault.setVisible(false);
    this.registerUIElement('vault', this.vault);

    // Title is now handled by HTML overlay

    // Position elements
    this.positionElements(width, height);
    
    // Emit initial state for UI
    window.dispatchEvent(new CustomEvent('vaultStateUpdate', {
      detail: {
        victory: this.victory,
        monsterDefeated: this.monsterDefeated,
        walletAddress: this.walletAddress
      }
    }));

    // Show the 3 vaults for selection
    this.time.delayedCall(1000, () => this.createVaultSelection());
    
    // Listen for continue button from UI
    window.addEventListener('continue-from-vault-ui', this.handleContinue);
  }

  private createVaultSelection() {
    const { width, height } = this.cameras.main;
    
    // Clean up any existing vaults first
    this.cleanupVaults();
    
    // Emit vault selection state for UI
    window.dispatchEvent(new CustomEvent('vault-selection-ready'));
    
    // Create 3 vaults with more spacing
    const spacing = 300; // Increased from 200
    const vaultY = height * 0.7; // Moved down from 0.6
    
    for (let i = 0; i < 3; i++) {
      const vaultX = width * 0.5 + (i - 1) * spacing;
      const vaultContainer = this.add.container(vaultX, vaultY);
      
      // Vault background - larger
      const vaultBg = this.add.rectangle(0, 0, 180, 180, 0x4a4a4a);
      vaultBg.setStrokeStyle(4, 0xffd700);
      
      // Vault sprite
      const vaultSprite = this.add.sprite(0, 0, 'vault-placeholder');
      vaultSprite.setScale(2.5);
      vaultSprite.setTint(0xffd700);
      
      // Mystery text
      const mysteryText = this.add.text(0, -90, '?', {
        fontSize: '36px',
        color: '#ffd700',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      vaultContainer.add([vaultBg, vaultSprite, mysteryText]);
      vaultContainer.setScale(0);
      vaultContainer.setInteractive(new Phaser.Geom.Rectangle(-90, -90, 180, 180), Phaser.Geom.Rectangle.Contains);
      
      // Store vault data
      vaultContainer.setData('index', i);
      this.vaults.push(vaultContainer);
      
      // Animate vault appearance
      this.tweens.add({
        targets: vaultContainer,
        scale: 1,
        duration: 500,
        delay: i * 200,
        ease: 'Back.easeOut'
      });
      
      // Hover effects
      vaultContainer.on('pointerover', () => {
        vaultBg.setFillStyle(0x5a5a5a);
        vaultContainer.setScale(1.1);
      });
      
      vaultContainer.on('pointerout', () => {
        vaultBg.setFillStyle(0x4a4a4a);
        vaultContainer.setScale(1);
      });
      
      // Click handler
      vaultContainer.on('pointerdown', () => {
        this.handleVaultSelection(vaultContainer);
      });
      
      // Floating animation
      this.tweens.add({
        targets: vaultContainer,
        y: vaultY - 10,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 300
      });
    }
  }
  
  private handleVaultSelection(selectedVault: Phaser.GameObjects.Container) {
    // Disable all vaults
    if (this.vaults && Array.isArray(this.vaults)) {
      this.vaults.forEach(vault => {
        if (vault && vault.input) {
          vault.removeInteractive();
        }
      });
    }
    
    this.selectedVault = selectedVault;
    
    // Note: VRF result was already determined in CombatScene
    // All vaults lead to the same predetermined outcome
    
    // Fade out other vaults
    this.vaults.forEach(vault => {
      if (vault !== selectedVault) {
        this.tweens.add({
          targets: vault,
          alpha: 0.3,
          scale: 0.8,
          duration: 500
        });
      }
    });
    
    // Highlight selected vault
    this.tweens.add({
      targets: selectedVault,
      scale: 1.2,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Show vault opening animation
        this.showVaultResult();
      }
    });
  }
  
  private async showVaultResult() {
    const { width, height } = this.cameras.main;

    // Emit vault opening event for UI
    window.dispatchEvent(new CustomEvent('vaultOpening', {
      detail: { 
        vrfSuccess: this.vrfSuccess,
        prizeAmount: this.prizeAmount 
      }
    }));
    
    // Opening animation is handled by UI overlay

    // Shake the camera
    this.cameras.main.shake(1000, 0.02);
    
    // Add dramatic effects to selected vault
    if (this.selectedVault && this.selectedVault.active) {
      this.tweens.add({
        targets: this.selectedVault,
        scaleX: 1.5,
        scaleY: 1.5,
        angle: { from: -5, to: 5 },
        duration: 100,
        repeat: 10,
        yoyo: true,
        ease: 'Power1'
      });
    }

    // Wait for dramatic effect
    await this.delay(2000);

    // Show result based on VRF
    if (this.vrfSuccess) {
      this.vaultSuccess();
    } else {
      this.vaultEmpty();
    }
  }

  private async vaultSuccess() {
    const { width, height } = this.cameras.main;

    // Golden flash effect
    this.cameras.main.flash(500, 255, 215, 0);
    
    // Vault opens but stays visible
    if (this.selectedVault) {
      // Make vault glow golden
      const vaultSprite = this.selectedVault.list[1]; // Get the vault sprite
      if (vaultSprite) {
        this.tweens.add({
          targets: vaultSprite,
          tint: { from: 0xffd700, to: 0xffff00 },
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }
      
      // Scale up slightly
      this.tweens.add({
        targets: this.selectedVault,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 500,
        ease: 'Back.easeOut'
      });
      
      // Create treasure effects
      this.createTreasureEffects();
    }

    // Emit success event for UI
    const jackpotAmount = (Math.random() * 10 + 5).toFixed(2);
    window.dispatchEvent(new CustomEvent('vault-result-display', {
      detail: { 
        success: true,
        jackpotAmount 
      }
    }));
  }
  
  private createTreasureEffects() {
    if (!this.selectedVault) return;
    
    const vaultX = this.selectedVault.x;
    const vaultY = this.selectedVault.y;
    
    // Create gold coins spilling out
    for (let i = 0; i < 15; i++) {
      const coin = this.add.circle(
        vaultX, 
        vaultY - 30,
        8,
        0xffd700
      );
      coin.setDepth(10);
      
      // Animate coins falling and bouncing
      this.tweens.add({
        targets: coin,
        x: vaultX + Phaser.Math.Between(-100, 100),
        y: vaultY + Phaser.Math.Between(50, 100),
        scale: { from: 0, to: 1.2 },
        alpha: { from: 1, to: 0.8 },
        duration: 800 + Math.random() * 400,
        delay: i * 50,
        ease: 'Bounce.easeOut'
      });
      
      // Add sparkle effect to coins
      this.tweens.add({
        targets: coin,
        tint: { from: 0xffd700, to: 0xffff00 },
        duration: 300,
        yoyo: true,
        repeat: -1,
        delay: i * 50
      });
    }
    
    // Create sparkle particles
    const sparkles = this.add.particles(vaultX, vaultY - 30, 'spark-placeholder', {
      speed: { min: 100, max: 300 },
      scale: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      quantity: 3,
      frequency: 100,
      x: { min: -30, max: 30 },
      y: { min: -30, max: 30 },
      tint: [0xffd700, 0xffff00, 0xffaa00]
    });
    
    // Store sparkles reference to stop when leaving scene
    this.registerUIElement('sparkles', sparkles);
  }

  private async vaultEmpty() {
    const { width, height } = this.cameras.main;

    // Vault opens to reveal emptiness
    if (this.selectedVault) {
      this.tweens.add({
        targets: this.selectedVault,
        scaleX: 2,
        scaleY: 2,
        alpha: 0.3,
        duration: 1000,
        ease: 'Power2'
      });
    }

    // Flash effect
    this.cameras.main.flash(300, 100, 100, 100);

    // Emit failure event for UI
    window.dispatchEvent(new CustomEvent('vault-result-display', {
      detail: { 
        success: false 
      }
    }));
  }

  // Continue button is now handled by HTML overlay

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }

  protected repositionUI(width: number, height: number) {
    // Update background
    if (this.bgRect) {
      this.bgRect.setSize(width, height);
      this.bgRect.setPosition(this.centerX(width), this.centerY(height));
    }

    // Update particles
    if (this.particles) {
      this.particles.setEmitZone({
        source: new Phaser.Geom.Rectangle(0, 0, width, 0),
        quantity: 1
      } as any);
    }

    // Reposition elements
    this.positionElements(width, height);

    // Text elements are now handled by HTML overlay
  }

  private positionElements(width: number, height: number) {
    // Vault sprite positioning - kept for initial placement
    if (this.vault) {
      this.vault.setPosition(this.centerX(width), this.centerY(height));
      this.vault.setScale(this.scaleValue(5, width));
    }
    
    // All other UI elements are handled by HTML overlay
  }
  
  shutdown() {
    // Clean up vaults when scene shuts down
    this.cleanupVaults();
    
    // Remove event listeners
    window.removeEventListener('continue-from-vault-ui', this.handleContinue);
    
    // Parent class handles shutdown automatically
  }
  
  private handleContinue = () => {
    // Clean up before transitioning
    this.cleanupVaults();
    
    // Small delay to ensure cleanup completes
    this.time.delayedCall(100, () => {
      this.scene.start('ColosseumScene', {
        walletAddress: this.walletAddress
      });
    });
  }
}