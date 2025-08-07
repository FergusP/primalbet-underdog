// MenuScene for wallet connection and game entry
import { BaseScene } from './BaseScene';

export class MenuScene extends BaseScene {
  private bgImage!: Phaser.GameObjects.Image;
  private walletConnected: boolean = false;
  private walletAddress: string = '';

  constructor() {
    super({ key: 'MenuScene' });
  }

  protected createScene() {
    const { width, height } = this.cameras.main;

    // Emit scene change event
    window.dispatchEvent(new CustomEvent('sceneChanged', { 
      detail: { sceneName: 'MenuScene' } 
    }));

    // Check if wallet is already connected via localStorage
    const storedWallet = localStorage.getItem('walletAddress');
    if (storedWallet) {
      // Give wallet adapter time to auto-reconnect
      this.time.delayedCall(500, () => {
        // Check if wallet connected event hasn't been received yet
        if (!this.walletConnected) {
          // Wait for proper wallet connection event from React
          console.log('Wallet address found in storage, waiting for reconnection...');
        }
      });
    }

    // Create lighter stone background
    const bgRect = this.add.rectangle(width/2, height/2, width, height, 0x3d2f23);
    this.registerUIElement('bgRect', bgRect);
    
    // Add stone texture overlay
    this.bgImage = this.add.image(width * 0.5, height * 0.5, 'arena-bg-placeholder');
    this.bgImage.setDisplaySize(width, height);
    this.bgImage.setAlpha(0.5);
    this.bgImage.setTint(0xb8a090);
    this.registerUIElement('bg', this.bgImage);
    
    // Add vignette effect
    const vignette = this.add.graphics();
    
    // Create lighter vignette with multiple overlapping rectangles for gradient effect
    // Outer edges darker
    vignette.fillStyle(0x000000, 0.2);
    vignette.fillRect(0, 0, width, height * 0.08); // Top
    vignette.fillRect(0, height * 0.92, width, height * 0.08); // Bottom
    vignette.fillRect(0, 0, width * 0.08, height); // Left
    vignette.fillRect(width * 0.92, 0, width * 0.08, height); // Right
    
    // Corner shadows
    vignette.fillStyle(0x000000, 0.15);
    vignette.fillRect(0, 0, width * 0.15, height * 0.15); // Top-left
    vignette.fillRect(width * 0.85, 0, width * 0.15, height * 0.15); // Top-right
    vignette.fillRect(0, height * 0.85, width * 0.15, height * 0.15); // Bottom-left
    vignette.fillRect(width * 0.85, height * 0.85, width * 0.15, height * 0.15); // Bottom-right
    
    this.registerUIElement('vignette', vignette);
    
    // Add dust particles
    const particles = this.add.particles(0, 0, 'spark-placeholder', {
      x: { min: 0, max: width },
      y: { min: -50, max: height },
      lifespan: 8000,
      speed: { min: 20, max: 50 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      tint: [0xffd700, 0xdaa520, 0xcd853f],
      quantity: 1,
      frequency: 500
    });
    this.registerUIElement('particles', particles);

    // UI elements now handled by React component
    // Keep background and particle effects in Phaser
    
    // Add torch effects on sides
    this.createTorchEffects(width, height);

    // Listen for wallet connection events from React
    this.setupWalletListeners();
    
    // Listen for enter arena event from React UI
    this.setupEnterArenaListener();
  }

  private setupEnterArenaListener() {
    window.addEventListener('enterArena', async () => {
      // Check both the walletConnected flag and localStorage
      const storedWallet = localStorage.getItem('walletAddress');
      if (this.walletConnected || storedWallet) {
        // Use the connected wallet address or the stored one
        const walletAddress = this.walletAddress || storedWallet || '';
        console.log('Entering arena with wallet:', walletAddress);
        
        // Show loading screen
        window.dispatchEvent(new CustomEvent('loadingStarted'));
        
        // Simulate loading progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 20;
          if (progress <= 80) {
            window.dispatchEvent(new CustomEvent('loadingProgress', {
              detail: { progress }
            }));
          }
        }, 200);
        
        try {
          // Fetch game state from API
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          const response = await fetch(`${backendUrl}/state`);
          
          if (!response.ok) {
            throw new Error(`Failed to connect to game server (${response.status})`);
          }
          
          const gameState = await response.json();
          console.log('Fetched game state:', gameState);
          
          // Clear progress interval
          clearInterval(progressInterval);
          
          // Complete the progress
          window.dispatchEvent(new CustomEvent('loadingProgress', {
            detail: { progress: 100 }
          }));
          
          // Small delay to show 100% before transitioning
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Proceed to Lobby scene with pre-loaded data
          // Don't hide loading here - let the UI component hide it when ready
          this.scene.start('LobbyScene', { 
            walletAddress,
            preloadedState: gameState 
          });
        } catch (error) {
          console.error('Failed to load game state:', error);
          // Clear progress interval
          clearInterval(progressInterval);
          
          // Dispatch error event to show error on loading screen
          window.dispatchEvent(new CustomEvent('loadingError', {
            detail: { 
              message: 'Failed to connect to game server. Please try again.',
              canRetry: true,
              scene: 'menu'
            }
          }));
        }
      }
    });
  }

  private setupWalletListeners() {
    // Listen for wallet connection success from React
    window.addEventListener('walletConnected', ((event: CustomEvent) => {
      this.walletConnected = true;
      this.walletAddress = event.detail.address;
    }) as EventListener);

    // Listen for wallet disconnection
    window.addEventListener('walletDisconnected', (() => {
      this.walletConnected = false;
      this.walletAddress = '';
    }) as EventListener);
  }

  // Decorative elements and text animations moved to React component

  private createTorchEffects(width: number, height: number) {
    // Left torch
    const leftTorchX = this.scaleValue(100, width);
    const torchY = this.getRelativePosition(0.25, height);
    
    // Torch holder graphics
    const leftTorchHolder = this.add.graphics();
    leftTorchHolder.fillStyle(0x4a3c2a);
    leftTorchHolder.fillRect(leftTorchX - 30, torchY, 60, 150);
    leftTorchHolder.fillStyle(0x8b4513);
    leftTorchHolder.fillTriangle(
      leftTorchX - 40, torchY,
      leftTorchX + 40, torchY,
      leftTorchX, torchY - 30
    );
    this.registerUIElement('leftTorchHolder', leftTorchHolder);
    
    // Left flame particles
    const leftFlame = this.add.particles(leftTorchX, torchY - 30, 'spark-placeholder', {
      x: { min: -10, max: 10 },
      y: { min: -50, max: -20 },
      lifespan: 800,
      speed: { min: 50, max: 100 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      tint: [0xff6600, 0xffaa00, 0xffdd00],
      quantity: 2,
      frequency: 50,
      gravityY: -100
    });
    this.registerUIElement('leftFlame', leftFlame);
    
    // Right torch
    const rightTorchX = width - this.scaleValue(100, width);
    
    const rightTorchHolder = this.add.graphics();
    rightTorchHolder.fillStyle(0x4a3c2a);
    rightTorchHolder.fillRect(rightTorchX - 30, torchY, 60, 150);
    rightTorchHolder.fillStyle(0x8b4513);
    rightTorchHolder.fillTriangle(
      rightTorchX - 40, torchY,
      rightTorchX + 40, torchY,
      rightTorchX, torchY - 30
    );
    this.registerUIElement('rightTorchHolder', rightTorchHolder);
    
    // Right flame particles
    const rightFlame = this.add.particles(rightTorchX, torchY - 30, 'spark-placeholder', {
      x: { min: -10, max: 10 },
      y: { min: -50, max: -20 },
      lifespan: 800,
      speed: { min: 50, max: 100 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      tint: [0xff6600, 0xffaa00, 0xffdd00],
      quantity: 2,
      frequency: 50,
      gravityY: -100
    });
    this.registerUIElement('rightFlame', rightFlame);
    
    // Add flickering light effect
    this.tweens.add({
      targets: [leftFlame, rightFlame],
      alpha: 0.7,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  protected repositionUI(width: number, height: number) {
    // Update background
    this.bgImage.setPosition(this.centerX(width), this.centerY(height));
    this.bgImage.setDisplaySize(width, height);

    // Reposition torch effects
    const leftTorchX = this.scaleValue(100, width);
    const rightTorchX = width - this.scaleValue(100, width);
    const torchY = this.getRelativePosition(0.25, height);
    
    const leftTorchHolder = this.getUIElement('leftTorchHolder') as Phaser.GameObjects.Graphics;
    const rightTorchHolder = this.getUIElement('rightTorchHolder') as Phaser.GameObjects.Graphics;
    const leftFlame = this.getUIElement('leftFlame') as Phaser.GameObjects.Particles.ParticleEmitter;
    const rightFlame = this.getUIElement('rightFlame') as Phaser.GameObjects.Particles.ParticleEmitter;
    
    if (leftTorchHolder) {
      leftTorchHolder.clear();
      leftTorchHolder.fillStyle(0x4a3c2a);
      leftTorchHolder.fillRect(leftTorchX - 30, torchY, 60, 150);
      leftTorchHolder.fillStyle(0x8b4513);
      leftTorchHolder.fillTriangle(
        leftTorchX - 40, torchY,
        leftTorchX + 40, torchY,
        leftTorchX, torchY - 30
      );
    }
    
    if (rightTorchHolder) {
      rightTorchHolder.clear();
      rightTorchHolder.fillStyle(0x4a3c2a);
      rightTorchHolder.fillRect(rightTorchX - 30, torchY, 60, 150);
      rightTorchHolder.fillStyle(0x8b4513);
      rightTorchHolder.fillTriangle(
        rightTorchX - 40, torchY,
        rightTorchX + 40, torchY,
        rightTorchX, torchY - 30
      );
    }
    
    if (leftFlame) {
      leftFlame.setPosition(leftTorchX, torchY - 30);
    }
    
    if (rightFlame) {
      rightFlame.setPosition(rightTorchX, torchY - 30);
    }
  }
}