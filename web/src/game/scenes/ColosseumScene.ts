// Main Colosseum Scene - core gameplay hub
import { Scene } from 'phaser';
import { ColosseumState, Monster, CombatSummary } from '../../types';

export class ColosseumScene extends Scene {
  private walletAddress!: string;
  private colosseumState!: ColosseumState;
  private jackpotText!: Phaser.GameObjects.Text;
  private monsterSprite!: Phaser.GameObjects.Sprite;
  private monsterNameText!: Phaser.GameObjects.Text;
  private monsterHealthBar!: Phaser.GameObjects.Graphics;
  private fightButton!: Phaser.GameObjects.Container;
  private recentCombatsFeed!: Phaser.GameObjects.Text[];
  private updateTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'ColosseumScene' });
  }

  init(data: { walletAddress?: string }) {
    this.walletAddress = data?.walletAddress || 'test-wallet';
    this.recentCombatsFeed = [];
  }

  create() {
    const { width, height } = this.cameras.main;

    // Clean up any existing timers
    if (this.updateTimer) {
      this.updateTimer.destroy();
    }
    
    // Listen for scene events
    this.events.on('wake', this.handleSceneWake, this);
    this.events.on('resume', this.handleSceneResume, this);
    
    // Background
    const bg = this.add.image(width * 0.5, height * 0.5, 'arena-bg-placeholder');
    bg.setDisplaySize(width, height);

    // Add arena atmosphere
    this.add.text(width * 0.5, 30, '🏛️ THE AURELIUS COLOSSEUM 🏛️', {
      fontSize: '32px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Create UI sections
    this.createJackpotDisplay();
    this.createMonsterDisplay();
    this.createFightButton();
    this.createRecentActivity();
    this.createPlayerStats();

    // Load initial game state
    this.loadGameState();

    // Set up polling for real-time updates (every 2 seconds as per guide)
    this.updateTimer = this.time.addEvent({
      delay: 2000,
      callback: this.loadGameState,
      callbackScope: this,
      loop: true
    });

    // Play ambient music if available
    if (this.sound.get('combat_music')) {
      this.sound.play('combat_music', { loop: true, volume: 0.3 });
    }
  }

  private createJackpotDisplay() {
    const { width } = this.cameras.main;

    // Jackpot panel background
    const jackpotBg = this.add.graphics();
    jackpotBg.fillStyle(0x2a2a3a);
    jackpotBg.fillRoundedRect(50, 80, 300, 100, 15);
    jackpotBg.lineStyle(3, 0xffd700);
    jackpotBg.strokeRoundedRect(50, 80, 300, 100, 15);

    // Jackpot label
    this.add.text(200, 100, '💰 CURRENT JACKPOT 💰', {
      fontSize: '20px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Jackpot amount (will be updated dynamically)
    this.jackpotText = this.add.text(200, 150, '0.000 SOL', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createMonsterDisplay() {
    const { width, height } = this.cameras.main;

    // Monster area background
    const monsterBg = this.add.graphics();
    monsterBg.fillStyle(0x3a2a2a);
    monsterBg.fillRoundedRect(width * 0.5 - 200, 200, 400, 300, 20);
    monsterBg.lineStyle(3, 0xff4444);
    monsterBg.strokeRoundedRect(width * 0.5 - 200, 200, 400, 300, 20);

    // "Current Guardian" label
    this.add.text(width * 0.5, 230, '👹 CURRENT GUARDIAN 👹', {
      fontSize: '24px',
      color: '#ff4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Monster sprite placeholder
    this.monsterSprite = this.add.sprite(width * 0.5, 350, 'skeleton');
    this.monsterSprite.setScale(2);
    this.monsterSprite.play('skeleton_idle');

    // Monster name
    this.monsterNameText = this.add.text(width * 0.5, 450, 'Skeleton Warrior', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Monster health bar background
    this.monsterHealthBar = this.add.graphics();
    this.updateMonsterHealthBar(100, 100); // Start at full health
  }

  private createFightButton() {
    const { width, height } = this.cameras.main;

    // Fight button background
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0xff4444);
    buttonBg.fillRoundedRect(0, 0, 300, 80, 20);
    buttonBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 80), Phaser.Geom.Rectangle.Contains);

    // Fight button text
    const buttonText = this.add.text(150, 40, '⚔️ FIGHT FOR 0.01 SOL ⚔️', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Create container
    this.fightButton = this.add.container(width * 0.5 - 150, height - 120);
    this.fightButton.add([buttonBg, buttonText]);
    
    // Ensure button is enabled
    this.fightButton.setAlpha(1);

    // Button interactions
    buttonBg.on('pointerover', () => {
      console.log('Fight button hover');
      buttonBg.clear();
      buttonBg.fillStyle(0xff5555);
      buttonBg.fillRoundedRect(0, 0, 300, 80, 20);
      this.fightButton.setScale(1.05);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0xff4444);
      buttonBg.fillRoundedRect(0, 0, 300, 80, 20);
      this.fightButton.setScale(1.0);
    });

    buttonBg.on('pointerdown', () => {
      console.log('Fight button clicked');
      this.startCombat();
    });

    // Add pulsing effect
    this.tweens.add({
      targets: this.fightButton,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createRecentActivity() {
    const { width } = this.cameras.main;

    // Activity feed background
    const activityBg = this.add.graphics();
    activityBg.fillStyle(0x2a2a3a);
    activityBg.fillRoundedRect(width - 350, 80, 280, 400, 15);
    activityBg.lineStyle(2, 0x666666);
    activityBg.strokeRoundedRect(width - 350, 80, 280, 400, 15);

    // Activity feed title
    this.add.text(width - 210, 110, '📜 RECENT BATTLES', {
      fontSize: '18px',
      color: '#cccccc',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Activity feed content will be populated dynamically
  }

  private createPlayerStats() {
    // Player stats panel (top right)
    const { width } = this.cameras.main;
    
    const statsBg = this.add.graphics();
    statsBg.fillStyle(0x2a3a2a);
    statsBg.fillRoundedRect(width - 350, 500, 280, 150, 15);
    statsBg.lineStyle(2, 0x66ff66);
    statsBg.strokeRoundedRect(width - 350, 500, 280, 150, 15);

    this.add.text(width - 210, 520, '🛡️ YOUR STATS', {
      fontSize: '18px',
      color: '#66ff66',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Will be populated with actual stats
    this.add.text(width - 340, 550, 'Combats: -', {
      fontSize: '14px',
      color: '#ffffff'
    });

    this.add.text(width - 340, 570, 'Victories: -', {
      fontSize: '14px',
      color: '#ffffff'
    });

    this.add.text(width - 340, 590, 'Vaults Cracked: -', {
      fontSize: '14px',
      color: '#ffffff'
    });

    this.add.text(width - 340, 610, 'Total Winnings: - SOL', {
      fontSize: '14px',
      color: '#ffffff'
    });
  }

  private async loadGameState() {
    try {
      // Call backend API as specified in guide
      const response = await fetch('/api/state');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      this.colosseumState = await response.json();
      
      // Update UI with new state
      this.updateJackpotDisplay();
      this.updateMonsterDisplay();
      this.updateRecentActivity();
      
    } catch (error) {
      console.error('Failed to load game state:', error);
      // Show offline state or retry
      this.showOfflineState();
    }
  }

  private updateJackpotDisplay() {
    if (!this.colosseumState) return;

    const solAmount = this.colosseumState.currentJackpot / 1e9; // Convert lamports to SOL
    this.jackpotText.setText(`${solAmount.toFixed(3)} SOL`);

    // Add growing animation when jackpot increases
    this.tweens.add({
      targets: this.jackpotText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }

  private updateMonsterDisplay() {
    if (!this.colosseumState?.currentMonster) return;

    const monster = this.colosseumState.currentMonster;
    
    // Update monster sprite
    const spriteKey = monster.type.toLowerCase().replace(' ', '');
    if (this.textures.exists(spriteKey)) {
      this.monsterSprite.setTexture(spriteKey);
      this.monsterSprite.play(`${spriteKey}_idle`);
    }

    // Update monster name
    this.monsterNameText.setText(monster.type);

    // Update health bar
    const healthPercent = (monster.currentHealth / monster.baseHealth) * 100;
    this.updateMonsterHealthBar(monster.currentHealth, monster.baseHealth);

    // Update fight button (entry fee logic temporarily disabled)
    const buttonText = this.fightButton.list[1] as Phaser.GameObjects.Text;
    buttonText.setText(`⚔️ FIGHT MONSTER ⚔️`);
  }

  private updateMonsterHealthBar(currentHealth: number, maxHealth: number) {
    this.monsterHealthBar.clear();
    
    const barWidth = 300;
    const barHeight = 20;
    const x = this.cameras.main.width * 0.5 - barWidth * 0.5;
    const y = 480;

    // Background
    this.monsterHealthBar.fillStyle(0x333333);
    this.monsterHealthBar.fillRoundedRect(x, y, barWidth, barHeight, 5);

    // Health bar
    const healthPercent = currentHealth / maxHealth;
    const color = healthPercent > 0.6 ? 0x00ff00 : healthPercent > 0.3 ? 0xffff00 : 0xff0000;
    
    this.monsterHealthBar.fillStyle(color);
    this.monsterHealthBar.fillRoundedRect(x + 2, y + 2, (barWidth - 4) * healthPercent, barHeight - 4, 3);

    // Border
    this.monsterHealthBar.lineStyle(2, 0xffffff);
    this.monsterHealthBar.strokeRoundedRect(x, y, barWidth, barHeight, 5);
  }

  private updateRecentActivity() {
    if (!this.colosseumState?.recentCombats) return;

    // Clear existing activity text
    this.recentCombatsFeed.forEach(text => text.destroy());
    this.recentCombatsFeed = [];

    const startY = 140;
    const lineHeight = 35;

    this.colosseumState.recentCombats.slice(0, 10).forEach((combat, index) => {
      const shortAddress = combat.gladiator.slice(0, 4) + '...' + combat.gladiator.slice(-4);
      let message = '';
      let color = '#ffffff';

      if (combat.vaultCracked) {
        message = `🏆 ${shortAddress} CRACKED THE VAULT!`;
        color = '#ffd700';
      } else if (combat.victory && combat.vaultAttempted) {
        message = `💪 ${shortAddress} defeated ${combat.monster}, vault failed`;
        color = '#66ff66';
      } else if (combat.victory) {
        message = `⚔️ ${shortAddress} defeated ${combat.monster}`;
        color = '#66ff66';
      } else {
        message = `💀 ${shortAddress} died to ${combat.monster}`;
        color = '#ff6666';
      }

      const text = this.add.text(this.cameras.main.width - 340, startY + (index * lineHeight), message, {
        fontSize: '12px',
        color: color,
        wordWrap: { width: 260 }
      });

      this.recentCombatsFeed.push(text);
    });
  }

  private async startCombat() {
    console.log('Starting combat...', this.colosseumState);
    
    if (!this.colosseumState?.currentMonster) {
      console.error('No monster data available');
      return;
    }

    // Disable fight button during combat
    this.fightButton.setAlpha(0.5);
    const buttonBg = this.fightButton.list[0] as Phaser.GameObjects.Graphics;
    buttonBg.removeInteractive();

    try {
      // Generate combat ID
      const combatId = `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Transitioning to CombatScene with:', {
        monster: this.colosseumState.currentMonster,
        combatId: combatId,
        walletAddress: this.walletAddress
      });
      
      // First, player needs to send payment transaction
      // This will be handled by the React wallet adapter
      // Start action combat scene
      this.scene.start('CombatScene', {
        monster: this.colosseumState.currentMonster,
        combatId: combatId,
        walletAddress: this.walletAddress
      });

    } catch (error) {
      console.error('Failed to start combat:', error);
      // Re-enable fight button
      this.fightButton.setAlpha(1);
      buttonBg.setInteractive();
    }
  }

  private showOfflineState() {
    // Show offline indicator
    this.add.text(this.cameras.main.width * 0.5, 50, '⚠️ CONNECTION LOST - RETRYING...', {
      fontSize: '18px',
      color: '#ffaa00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  // Called from React when combat transaction is confirmed
  public async processCombat(txSignature: string, combatId: string) {
    try {
      // Send combat request to backend
      const response = await fetch('/api/combat/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: this.walletAddress,
          txSignature: txSignature,
          combatId: combatId,
          attemptVault: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const combatResponse = await response.json();

      // Start combat scene with results
      this.scene.start('CombatScene', {
        combatResult: combatResponse.combatResult,
        vaultResult: combatResponse.vaultResult,
        newMonster: combatResponse.newMonster,
        walletAddress: this.walletAddress
      });

    } catch (error) {
      console.error('Combat processing failed:', error);
      // Show error message and re-enable button
      this.fightButton.setAlpha(1);
      const buttonBg = this.fightButton.list[0] as Phaser.GameObjects.Graphics;
      buttonBg.setInteractive();
    }
  }

  private handleSceneWake() {
    console.log('Scene waking up');
    // Scene is waking up from sleep - reload game state
    this.loadGameState();
    
    // Re-enable fight button
    if (this.fightButton) {
      this.fightButton.setAlpha(1);
      const buttonBg = this.fightButton.list[0] as Phaser.GameObjects.Graphics;
      buttonBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 80), Phaser.Geom.Rectangle.Contains);
    }
  }
  
  private handleSceneResume() {
    console.log('Scene resuming');
    // Scene is resuming - reload game state
    this.loadGameState();
    
    // Re-enable fight button
    if (this.fightButton) {
      this.fightButton.setAlpha(1);
      const buttonBg = this.fightButton.list[0] as Phaser.GameObjects.Graphics;
      buttonBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 300, 80), Phaser.Geom.Rectangle.Contains);
    }
  }

  destroy() {
    if (this.updateTimer) {
      this.updateTimer.destroy();
    }
    
    // Clean up event listeners
    this.events.off('wake', this.handleSceneWake, this);
    this.events.off('resume', this.handleSceneResume, this);
    
    // Clean up scene resources - Phaser handles scene cleanup automatically
  }
}