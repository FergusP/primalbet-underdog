// Vault Scene - Attempt to crack the treasure vault
import { Scene } from 'phaser';

export class VaultScene extends Scene {
  private victory: boolean = false;
  private monsterDefeated: string = '';
  private walletAddress: string = '';
  
  constructor() {
    super({ key: 'VaultScene' });
  }

  init(data: { 
    victory: boolean;
    walletAddress: string;
    monsterDefeated: string;
  }) {
    this.victory = data.victory;
    this.walletAddress = data.walletAddress;
    this.monsterDefeated = data.monsterDefeated;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Mysterious vault chamber background
    this.add.rectangle(width/2, height/2, width, height, 0x221122);
    
    // Add mystical particles
    const particles = this.add.particles(0, 0, 'spark-placeholder', {
      x: { min: 0, max: width },
      y: 0,
      lifespan: 3000,
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      tint: 0xffff00
    });

    // Create giant vault door
    const vault = this.add.sprite(width * 0.5, height * 0.5, 'vault-placeholder');
    vault.setScale(5);
    vault.setTint(0xffd700);

    // Title
    this.add.text(width * 0.5, 100, '🏛️ THE TREASURE VAULT 🏛️', {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Show monster defeated
    this.add.text(width * 0.5, 180, `You defeated the ${this.monsterDefeated}!`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // Start vault sequence
    this.time.delayedCall(1000, () => this.startVaultSequence(vault));
  }

  private async startVaultSequence(vault: Phaser.GameObjects.Sprite) {
    const { width, height } = this.cameras.main;

    // Simulate vault crack chance based on monster tier
    const crackChance = 10; // 10% base chance for now
    
    // Show crack chance
    const chanceText = this.add.text(width * 0.5, height * 0.3, 
      `💎 Vault Crack Chance: ${crackChance}% 💎`, {
      fontSize: '28px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add dramatic pause
    await this.delay(2000);

    // Create crack button
    const crackButton = this.add.container(width * 0.5, height * 0.7);
    
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0xffd700);
    buttonBg.fillRoundedRect(-150, -40, 300, 80, 20);
    
    const buttonText = this.add.text(0, 0, '🔨 CRACK THE VAULT! 🔨', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    crackButton.add([buttonBg, buttonText]);
    crackButton.setInteractive(new Phaser.Geom.Rectangle(-150, -40, 300, 80), Phaser.Geom.Rectangle.Contains);

    // Button hover effect
    crackButton.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0xffff00);
      buttonBg.fillRoundedRect(-150, -40, 300, 80, 20);
      crackButton.setScale(1.05);
    });

    crackButton.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0xffd700);
      buttonBg.fillRoundedRect(-150, -40, 300, 80, 20);
      crackButton.setScale(1.0);
    });

    crackButton.on('pointerdown', () => {
      crackButton.destroy();
      chanceText.destroy();
      this.attemptVaultCrack(vault, crackChance);
    });
  }

  private async attemptVaultCrack(vault: Phaser.GameObjects.Sprite, crackChance: number) {
    const { width, height } = this.cameras.main;

    // Show attempting text
    const attemptText = this.add.text(width * 0.5, height * 0.3, 
      '⚡ ATTEMPTING TO CRACK VAULT... ⚡', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Shake the vault
    this.cameras.main.shake(1000, 0.02);
    
    // Add dramatic effects
    this.tweens.add({
      targets: vault,
      scaleX: 5.2,
      scaleY: 5.2,
      angle: { from: -5, to: 5 },
      duration: 100,
      repeat: 10,
      yoyo: true,
      ease: 'Power1'
    });

    // Wait for dramatic effect
    await this.delay(2000);

    // Determine result (random for now)
    const roll = Math.random() * 100;
    const success = roll < crackChance;

    attemptText.destroy();

    if (success) {
      this.vaultSuccess(vault);
    } else {
      this.vaultFailure(vault);
    }
  }

  private async vaultSuccess(vault: Phaser.GameObjects.Sprite) {
    const { width, height } = this.cameras.main;

    // Explosion effect
    this.cameras.main.flash(500, 255, 215, 0);
    
    // Vault opens
    this.tweens.add({
      targets: vault,
      scaleX: 8,
      scaleY: 8,
      alpha: 0,
      duration: 1000,
      ease: 'Power2'
    });

    // Success text
    const successText = this.add.text(width * 0.5, height * 0.4, 
      '🎉 VAULT CRACKED! 🎉', {
      fontSize: '64px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: successText,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Show jackpot amount (mock for now)
    await this.delay(1000);
    
    const jackpotAmount = (Math.random() * 10 + 5).toFixed(2);
    this.add.text(width * 0.5, height * 0.55, 
      `💰 YOU WON ${jackpotAmount} SOL! 💰`, {
      fontSize: '36px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Continue button
    await this.delay(2000);
    this.createContinueButton();
  }

  private async vaultFailure(vault: Phaser.GameObjects.Sprite) {
    const { width, height } = this.cameras.main;

    // Vault remains closed
    this.tweens.add({
      targets: vault,
      tint: 0xff0000,
      duration: 200,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        vault.setTint(0xffd700);
      }
    });

    // Failure text
    this.add.text(width * 0.5, height * 0.4, 
      '❌ VAULT RESISTED! ❌', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width * 0.5, height * 0.5, 
      'The treasure remains locked...', {
      fontSize: '24px',
      color: '#ffaaaa'
    }).setOrigin(0.5);

    // Show contribution to jackpot
    await this.delay(1000);
    
    this.add.text(width * 0.5, height * 0.6, 
      '📈 Your SOL has been added to the jackpot!', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // Continue button
    await this.delay(2000);
    this.createContinueButton();
  }

  private createContinueButton() {
    const { width, height } = this.cameras.main;

    const button = this.add.container(width * 0.5, height * 0.8);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x4444ff);
    bg.fillRoundedRect(-100, -30, 200, 60, 15);
    
    const text = this.add.text(0, 0, 'CONTINUE', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.add([bg, text]);
    button.setInteractive(new Phaser.Geom.Rectangle(-100, -30, 200, 60), Phaser.Geom.Rectangle.Contains);

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x6666ff);
      bg.fillRoundedRect(-100, -30, 200, 60, 15);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4444ff);
      bg.fillRoundedRect(-100, -30, 200, 60, 15);
    });

    button.on('pointerdown', () => {
      // Pass wallet address back to maintain state
      this.scene.start('ColosseumScene', {
        walletAddress: this.walletAddress
      });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.time.delayedCall(ms, resolve);
    });
  }
}