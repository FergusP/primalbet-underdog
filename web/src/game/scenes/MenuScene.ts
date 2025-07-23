// MenuScene for wallet connection and game entry
import { Scene } from 'phaser';

export class MenuScene extends Scene {
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private connectButton!: Phaser.GameObjects.Container;
  private enterButton!: Phaser.GameObjects.Container;
  private walletConnected: boolean = false;
  private walletAddress: string = '';

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Check if wallet is already connected via localStorage
    const storedWallet = localStorage.getItem('aurelius-wallet');
    if (storedWallet) {
      // Give wallet adapter time to auto-reconnect
      this.time.delayedCall(500, () => {
        // Check if wallet connected event hasn't been received yet
        if (!this.walletConnected) {
          // Assume wallet will reconnect and update UI accordingly
          this.walletConnected = true;
          this.updateWalletUI();
        }
      });
    }

    // Background
    const bg = this.add.image(width * 0.5, height * 0.5, 'arena-bg-placeholder');
    bg.setDisplaySize(width, height);

    // Title
    this.titleText = this.add.text(width * 0.5, height * 0.25, '⚔️ AURELIUS COLOSSEUM ⚔️', {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // Subtitle
    this.subtitleText = this.add.text(width * 0.5, height * 0.35, 'Fight Monsters • Crack the Vault • Claim the Jackpot', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Lore text
    this.add.text(width * 0.5, height * 0.45, '"The road to the Vault of Sol is littered with beasts.\nOnly those who survive the bloodsport may attempt to claim its riches."', {
      fontSize: '18px',
      color: '#cccccc',
      align: 'center',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Create wallet connection button
    this.createConnectButton();

    // Create enter game button (initially hidden)
    this.createEnterButton();

    // Listen for wallet connection events from React
    this.setupWalletListeners();
    
    // If returning from another scene with wallet already connected, update UI
    if (this.walletConnected) {
      this.updateWalletUI();
      if (this.walletAddress) {
        const shortAddress = this.walletAddress.slice(0, 4) + '...' + this.walletAddress.slice(-4);
        this.subtitleText.setText(`Connected: ${shortAddress}`);
      }
    }
  }

  private createConnectButton() {
    const { width, height } = this.cameras.main;

    // Button background
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x444444);
    buttonBg.fillRoundedRect(0, 0, 200, 60, 10);
    buttonBg.setInteractive({ 
      hitArea: new Phaser.Geom.Rectangle(0, 0, 200, 60), 
      hitAreaCallback: Phaser.Geom.Rectangle.Contains 
    });

    // Button text
    const buttonText = this.add.text(100, 30, 'Connect Wallet', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Create container
    this.connectButton = this.add.container(width * 0.5 - 100, height * 0.65);
    this.connectButton.add([buttonBg, buttonText]);

    // Button interactions
    buttonBg.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x555555);
      buttonBg.fillRoundedRect(0, 0, 200, 60, 10);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x444444);
      buttonBg.fillRoundedRect(0, 0, 200, 60, 10);
    });

    buttonBg.on('pointerdown', () => {
      // Emit event to React app to trigger wallet connection
      window.dispatchEvent(new CustomEvent('connectWallet'));
    });
  }

  private createEnterButton() {
    const { width, height } = this.cameras.main;

    // Button background
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0xff4444);
    buttonBg.fillRoundedRect(0, 0, 250, 70, 15);
    buttonBg.setInteractive({ 
      hitArea: new Phaser.Geom.Rectangle(0, 0, 250, 70), 
      hitAreaCallback: Phaser.Geom.Rectangle.Contains 
    });

    // Button text
    const buttonText = this.add.text(125, 35, '⚔️ ENTER COLOSSEUM ⚔️', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Create container
    this.enterButton = this.add.container(width * 0.5 - 125, height * 0.75);
    this.enterButton.add([buttonBg, buttonText]);
    this.enterButton.setVisible(false); // Hidden until wallet connected

    // Button interactions
    buttonBg.on('pointerover', () => {
      if (this.walletConnected) {
        buttonBg.clear();
        buttonBg.fillStyle(0xff5555);
        buttonBg.fillRoundedRect(0, 0, 250, 70, 15);
        this.enterButton.setScale(1.05);
      }
    });

    buttonBg.on('pointerout', () => {
      if (this.walletConnected) {
        buttonBg.clear();
        buttonBg.fillStyle(0xff4444);
        buttonBg.fillRoundedRect(0, 0, 250, 70, 15);
        this.enterButton.setScale(1.0);
      }
    });

    buttonBg.on('pointerdown', () => {
      if (this.walletConnected) {
        // Proceed to Colosseum scene
        this.scene.start('ColosseumScene', { walletAddress: this.walletAddress });
      }
    });
  }

  private updateWalletUI() {
    // Hide connect button, show enter button
    this.connectButton.setVisible(false);
    this.enterButton.setVisible(true);

    // Update subtitle to show connected status
    this.subtitleText.setText('Wallet Connected - Awaiting verification...');

    // Add glow effect to enter button
    this.tweens.add({
      targets: this.enterButton,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private setupWalletListeners() {
    // Listen for wallet connection success from React
    window.addEventListener('walletConnected', ((event: CustomEvent) => {
      this.walletConnected = true;
      this.walletAddress = event.detail.address;
      
      // Hide connect button, show enter button
      this.connectButton.setVisible(false);
      this.enterButton.setVisible(true);

      // Update subtitle to show wallet address
      const shortAddress = this.walletAddress.slice(0, 4) + '...' + this.walletAddress.slice(-4);
      this.subtitleText.setText(`Connected: ${shortAddress}`);

      // Add glow effect to enter button
      this.tweens.add({
        targets: this.enterButton,
        alpha: 0.8,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }) as EventListener);

    // Listen for wallet disconnection
    window.addEventListener('walletDisconnected', (() => {
      this.walletConnected = false;
      this.walletAddress = '';
      
      // Show connect button, hide enter button
      this.connectButton.setVisible(true);
      this.enterButton.setVisible(false);
      
      // Restore subtitle
      this.subtitleText.setText('Fight Monsters • Crack the Vault • Claim the Jackpot');
    }) as EventListener);
  }
}