// MenuScene for wallet connection and game entry
import { BaseScene } from './BaseScene';

export class MenuScene extends BaseScene {
  private bgImage!: Phaser.GameObjects.Image;
  private walletConnected: boolean = false;
  private walletAddress: string = '';
  private enterArenaButton?: Phaser.GameObjects.Image;
  private enterArenaText?: Phaser.GameObjects.Text;

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

    // Add the landing page background - zoom in to fill and hide AI logo
    this.bgImage = this.add.image(width * 0.5, height * 0.5, 'landing-bg');
    
    // Calculate scale to cover the entire screen while maintaining aspect ratio
    const bgTexture = this.textures.get('landing-bg').getSourceImage();
    const bgAspectRatio = bgTexture.width / bgTexture.height;
    const screenAspectRatio = width / height;
    
    let scale = 1;
    if (screenAspectRatio > bgAspectRatio) {
      // Screen is wider - scale based on width
      scale = width / bgTexture.width;
    } else {
      // Screen is taller - scale based on height  
      scale = height / bgTexture.height;
    }
    
    // Zoom in more to crop out the AI logo at bottom right
    scale *= 1.15; // Zoom in by 15% to crop edges
    
    this.bgImage.setScale(scale);
    // Shift slightly up and left to better crop the AI logo
    this.bgImage.setPosition(width * 0.48, height * 0.48);
    this.registerUIElement('bg', this.bgImage);
    
    // Add dark overlay for better text visibility
    const darkOverlay = this.add.rectangle(width/2, height/2, width, height, 0x000000);
    darkOverlay.setAlpha(0.5); // 50% black overlay
    this.registerUIElement('darkOverlay', darkOverlay);
    
    // Add subtle vignette effect
    const vignette = this.add.graphics();
    
    // Create very subtle vignette with gradient effect
    // Outer edges with very light shadow
    vignette.fillStyle(0x000000, 0.1);
    vignette.fillRect(0, 0, width, height * 0.05); // Top
    vignette.fillRect(0, height * 0.95, width, height * 0.05); // Bottom
    vignette.fillRect(0, 0, width * 0.05, height); // Left
    vignette.fillRect(width * 0.95, 0, width * 0.05, height); // Right
    
    // Very subtle corner shadows
    vignette.fillStyle(0x000000, 0.08);
    vignette.fillRect(0, 0, width * 0.1, height * 0.1); // Top-left
    vignette.fillRect(width * 0.9, 0, width * 0.1, height * 0.1); // Top-right
    vignette.fillRect(0, height * 0.9, width * 0.1, height * 0.1); // Bottom-left
    vignette.fillRect(width * 0.9, height * 0.9, width * 0.1, height * 0.1); // Bottom-right
    
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

    // Add main title with cartoon styling - COMMENTED OUT (using React UI instead)
    // const titleText = this.add.text(width / 2, height * 0.15, 'BETBEAST', {
    //   fontSize: '72px',
    //   fontFamily: '"Fredoka One", "Luckiest Guy", "Bungee", "MedievalSharp", serif',
    //   color: '#FFD700',
    //   stroke: '#2C1810',
    //   strokeThickness: 8,
    //   shadow: {
    //     offsetX: 4,
    //     offsetY: 4,
    //     color: '#000000',
    //     blur: 8,
    //     fill: true
    //   }
    // });
    // titleText.setOrigin(0.5);
    // this.registerUIElement('titleText', titleText);

    // const subtitleText = this.add.text(width / 2, height * 0.23, 'ARENA', {
    //   fontSize: '48px',
    //   fontFamily: '"Fredoka One", "Luckiest Guy", "Bungee", "MedievalSharp", serif',
    //   color: '#FFA500',
    //   stroke: '#2C1810',
    //   strokeThickness: 6,
    //   shadow: {
    //     offsetX: 3,
    //     offsetY: 3,
    //     color: '#000000',
    //     blur: 6,
    //     fill: true
    //   }
    // });
    // subtitleText.setOrigin(0.5);
    // this.registerUIElement('subtitleText', subtitleText);

    // Add tagline - COMMENTED OUT (using React UI instead)
    // const taglineText = this.add.text(width / 2, height * 0.32, 'HUNT • FIGHT • CLAIM THE FOMO POOL', {
    //   fontSize: '20px',
    //   fontFamily: '"Merriweather", serif',
    //   color: '#DAA520',
    //   stroke: '#1C1C1C',
    //   strokeThickness: 2
    // });
    // taglineText.setOrigin(0.5);
    // this.registerUIElement('taglineText', taglineText);

    // Create wooden button for wallet connection or arena entry
    this.createWoodenButton(width, height);

    // Add flavor text below button - COMMENTED OUT (using React UI instead)
    // const flavorText1 = this.add.text(width / 2, height * 0.72, '"In the dark depths of the haunted forest,', {
    //   fontSize: '16px',
    //   fontFamily: '"Merriweather", serif',
    //   color: '#B8860B',
    //   fontStyle: 'italic'
    // });
    // flavorText1.setOrigin(0.5);
    // this.registerUIElement('flavorText1', flavorText1);

    // const flavorText2 = this.add.text(width / 2, height * 0.76, 'only the bravest warriors may claim the Beast\'s treasure."', {
    //   fontSize: '16px',
    //   fontFamily: '"Merriweather", serif',
    //   color: '#B8860B',
    //   fontStyle: 'italic'
    // });
    // flavorText2.setOrigin(0.5);
    // this.registerUIElement('flavorText2', flavorText2);

    // Add bouncing animation to title - COMMENTED OUT
    // this.tweens.add({
    //   targets: titleText,
    //   scaleX: 1.05,
    //   scaleY: 1.05,
    //   duration: 2000,
    //   ease: 'Sine.easeInOut',
    //   yoyo: true,
    //   repeat: -1
    // });

    // Add glow effect to subtitle - COMMENTED OUT
    // this.tweens.add({
    //   targets: subtitleText,
    //   alpha: 0.8,
    //   duration: 1500,
    //   ease: 'Sine.easeInOut',
    //   yoyo: true,
    //   repeat: -1
    // });

    // UI elements now handled by React component
    // Keep background and particle effects in Phaser
    
    // Add torch effects on sides
    this.createTorchEffects(width, height);

    // Listen for wallet connection events from React
    this.setupWalletListeners();
    
    // Listen for enter arena event from React UI
    this.setupEnterArenaListener();
  }

  private async handleEnterArena() {
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
    } else {
      // Show wallet connection prompt
      console.log('Wallet not connected. Please connect wallet first.');
      // You can dispatch an event here to show a wallet connection modal
      window.dispatchEvent(new CustomEvent('showWalletPrompt'));
    }
  }

  private setupEnterArenaListener() {
    // Keep the React UI listener for backward compatibility
    window.addEventListener('enterArena', async () => {
      await this.handleEnterArena();
    });
  }

  private setupWalletListeners() {
    // Listen for wallet connection success from React
    window.addEventListener('walletConnected', ((event: CustomEvent) => {
      this.walletConnected = true;
      this.walletAddress = event.detail.address;
      // Update button text when wallet connects
      this.updateWoodenButtonState();
    }) as EventListener);

    // Listen for wallet disconnection
    window.addEventListener('walletDisconnected', (() => {
      this.walletConnected = false;
      this.walletAddress = '';
      // Update button text when wallet disconnects
      this.updateWoodenButtonState();
    }) as EventListener);
  }

  private createWoodenButton(width: number, height: number) {
    // Default position
    let buttonY = height * 0.5;
    
    // Wait a bit for DOM to be ready, then position based on placeholder center
    this.time.delayedCall(100, () => {
      const placeholder = document.getElementById('menu-button-placeholder');
      if (placeholder) {
        // Get the game canvas element
        const canvas = this.game.canvas;
        if (canvas) {
          const placeholderRect = placeholder.getBoundingClientRect();
          const canvasRect = canvas.getBoundingClientRect();
          
          // Calculate center of placeholder relative to viewport
          const placeholderCenterX = placeholderRect.left + (placeholderRect.width / 2);
          const placeholderCenterY = placeholderRect.top + (placeholderRect.height / 2);
          
          // Calculate relative position on canvas
          const relativeX = placeholderCenterX - canvasRect.left;
          const relativeY = placeholderCenterY - canvasRect.top;
          
          // Scale to game coordinates (account for Phaser's internal scaling)
          const buttonX = (relativeX / canvasRect.width) * width;
          buttonY = (relativeY / canvasRect.height) * height;
          
          // Update button position to placeholder's exact center
          if (this.enterArenaButton && this.enterArenaText) {
            this.enterArenaButton.setPosition(buttonX, buttonY);
            this.enterArenaText.setPosition(buttonX, buttonY);
          }
        }
      }
    });
    
    this.enterArenaButton = this.add.image(width / 2, buttonY, 'wooden-button');
    this.enterArenaButton.setScale(1.2, 1.0); // Wider on X-axis to fit the swords
    
    // Use Phaser's default hit detection with pixel perfect option
    this.enterArenaButton.setInteractive({ 
      useHandCursor: true,
      pixelPerfect: true,  // This will only detect non-transparent pixels
      alphaTolerance: 1    // Pixels with alpha > 1 will be interactive
    });
    this.enterArenaButton.setDepth(10);
    this.registerUIElement('enterArenaButton', this.enterArenaButton);
    
    // Check localStorage for existing wallet connection on reload
    const storedWallet = localStorage.getItem('walletAddress');
    const isConnected = this.walletConnected || storedWallet;
    
    // Add text on top of button
    const buttonText = isConnected ? '⚔️ ENTER THE ARENA ⚔️' : 'CONNECT WALLET';
    this.enterArenaText = this.add.text(width / 2, buttonY, buttonText, {
      fontSize: '28px',
      fontFamily: '"Fredoka One", "Luckiest Guy", "Bungee", "MedievalSharp", serif',
      color: '#FFD700',
      stroke: '#2C1810',
      strokeThickness: 6,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 6,
        fill: true
      }
    });
    this.enterArenaText.setOrigin(0.5);
    this.enterArenaText.setDepth(11);
    this.registerUIElement('enterArenaText', this.enterArenaText);
    
    // Add hover effects (maintaining wider aspect ratio)
    this.enterArenaButton.on('pointerover', () => {
      this.enterArenaButton?.setScale(1.26, 1.05); // Slightly bigger, keep aspect ratio
      this.enterArenaText?.setScale(1.05);
    });
    
    this.enterArenaButton.on('pointerout', () => {
      this.enterArenaButton?.setScale(1.2, 1.0); // Back to normal wide size
      this.enterArenaText?.setScale(1);
    });
    
    // Add click handler
    this.enterArenaButton.on('pointerdown', () => {
      this.enterArenaButton?.setScale(1.14, 0.95); // Pressed state, keep aspect ratio
      this.enterArenaText?.setScale(0.95);
    });
    
    this.enterArenaButton.on('pointerup', () => {
      this.enterArenaButton?.setScale(1.26, 1.05); // Back to hover state
      this.enterArenaText?.setScale(1.05);
      // Handle click based on wallet state
      const storedWallet = localStorage.getItem('walletAddress');
      if (this.walletConnected || storedWallet) {
        this.handleEnterArena();
      } else {
        window.dispatchEvent(new CustomEvent('connectWallet'));
      }
    });
  }
  
  private updateWoodenButtonState() {
    if (this.enterArenaText) {
      // Update button text based on wallet connection state
      const storedWallet = localStorage.getItem('walletAddress');
      const isConnected = this.walletConnected || storedWallet;
      const buttonText = isConnected ? '⚔️ ENTER THE ARENA ⚔️' : 'CONNECT WALLET';
      this.enterArenaText.setText(buttonText);
    }
  }


  // Decorative elements and text animations moved to React component

  private createTorchEffects(width: number, height: number) {
    // Left torch
    const leftTorchX = this.scaleValue(120, width);
    const torchY = this.getRelativePosition(0.3, height);
    
    // Create left torch image
    const leftTorch = this.add.image(leftTorchX, torchY, 'torch');
    leftTorch.setScale(0.5); // Scale down to fit scene
    leftTorch.setDepth(5);
    this.registerUIElement('leftTorch', leftTorch);
    
    // Left animated flame particles (positioned to completely cover the static flame)
    const leftFlameY = torchY - leftTorch.displayHeight * 0.25; // Much lower to cover the actual flame
    
    // Create a simple gradient circle for fire particles
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('fireParticle', 16, 16);
    graphics.destroy();
    
    // Dense particles to completely cover the static flame
    const leftFlame = this.add.particles(leftTorchX, leftFlameY, 'fireParticle', {
      x: { min: -20, max: 20 },
      y: { min: -30, max: 10 }, // Cover full flame area
      lifespan: { min: 400, max: 800 },
      speed: { min: 40, max: 100 },
      scale: { start: 2.0, end: 0.5 }, // Bigger particles to cover more area
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      tint: [0xff2200, 0xff4400, 0xff6600, 0xffaa00, 0xffdd00],
      quantity: 8, // More particles for full coverage
      frequency: 20, // More frequent emission
      gravityY: -200,
      angle: { min: -30, max: 30 }
    });
    leftFlame.setDepth(6);
    this.registerUIElement('leftFlame', leftFlame);
    
    // Add inner core flame for more depth
    const leftFlameCore = this.add.particles(leftTorchX, leftFlameY, 'fireParticle', {
      x: { min: -5, max: 5 },
      y: { min: -15, max: -5 },
      lifespan: { min: 300, max: 500 },
      speed: { min: 40, max: 80 },
      scale: { start: 0.8, end: 0.3 },
      alpha: { start: 1, end: 0.2 },
      blendMode: 'ADD',
      tint: [0xffffff, 0xffffaa, 0xffff66],
      quantity: 2,
      frequency: 40,
      gravityY: -200
    });
    leftFlameCore.setDepth(7);
    this.registerUIElement('leftFlameCore', leftFlameCore);
    
    // Add embers that float up
    const leftEmbers = this.add.particles(leftTorchX, leftFlameY, 'fireParticle', {
      x: { min: -20, max: 20 },
      y: 0,
      lifespan: 3000,
      speed: { min: 20, max: 60 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      tint: [0xff6600, 0xff9900],
      quantity: 1,
      frequency: 500,
      gravityY: -80,
      accelerationX: { min: -10, max: 10 }
    });
    leftEmbers.setDepth(8);
    this.registerUIElement('leftEmbers', leftEmbers);
    
    // Animate the flame base position for flickering
    this.tweens.add({
      targets: leftFlame,
      x: leftTorchX + Phaser.Math.Between(-3, 3),
      duration: 200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      onUpdate: () => {
        // Randomly adjust particle emission for natural flickering
        if (Math.random() > 0.7) {
          leftFlame.quantity = Phaser.Math.Between(3, 6);
        }
      }
    });
    
    // Add smoke effect for realism
    const leftSmoke = this.add.particles(leftTorchX, leftFlameY - 10, 'fireParticle', {
      x: { min: -8, max: 8 },
      y: { min: -40, max: -30 },
      lifespan: 2000,
      speed: { min: 20, max: 40 },
      scale: { start: 0.3, end: 0.8 },
      alpha: { start: 0.3, end: 0 },
      tint: 0x333333,
      quantity: 1,
      frequency: 200,
      gravityY: -50
    });
    leftSmoke.setDepth(4);
    this.registerUIElement('leftSmoke', leftSmoke);
    
    // Right torch
    const rightTorchX = width - this.scaleValue(120, width);
    
    // Create right torch image
    const rightTorch = this.add.image(rightTorchX, torchY, 'torch');
    rightTorch.setScale(0.5);
    rightTorch.setDepth(5);
    this.registerUIElement('rightTorch', rightTorch);
    
    // Right animated flame particles (positioned to completely cover the static flame)
    const rightFlameY = torchY - rightTorch.displayHeight * 0.25; // Much lower to cover the actual flame
    const rightFlame = this.add.particles(rightTorchX, rightFlameY, 'fireParticle', {
      x: { min: -20, max: 20 },
      y: { min: -30, max: 10 }, // Cover full flame area
      lifespan: { min: 400, max: 800 },
      speed: { min: 40, max: 100 },
      scale: { start: 2.0, end: 0.5 }, // Bigger particles to cover more area
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      tint: [0xff2200, 0xff4400, 0xff6600, 0xffaa00, 0xffdd00],
      quantity: 8, // More particles for full coverage
      frequency: 20, // More frequent emission
      gravityY: -200,
      angle: { min: -30, max: 30 }
    });
    rightFlame.setDepth(6);
    this.registerUIElement('rightFlame', rightFlame);
    
    // Add inner core flame
    const rightFlameCore = this.add.particles(rightTorchX, rightFlameY, 'fireParticle', {
      x: { min: -5, max: 5 },
      y: { min: -15, max: -5 },
      lifespan: { min: 300, max: 500 },
      speed: { min: 40, max: 80 },
      scale: { start: 0.8, end: 0.3 },
      alpha: { start: 1, end: 0.2 },
      blendMode: 'ADD',
      tint: [0xffffff, 0xffffaa, 0xffff66],
      quantity: 2,
      frequency: 40,
      gravityY: -200
    });
    rightFlameCore.setDepth(7);
    this.registerUIElement('rightFlameCore', rightFlameCore);
    
    // Add embers
    const rightEmbers = this.add.particles(rightTorchX, rightFlameY, 'fireParticle', {
      x: { min: -20, max: 20 },
      y: 0,
      lifespan: 3000,
      speed: { min: 20, max: 60 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      tint: [0xff6600, 0xff9900],
      quantity: 1,
      frequency: 500,
      gravityY: -80,
      accelerationX: { min: -10, max: 10 }
    });
    rightEmbers.setDepth(8);
    this.registerUIElement('rightEmbers', rightEmbers);
    
    // Animate flame flickering
    this.tweens.add({
      targets: rightFlame,
      x: rightTorchX + Phaser.Math.Between(-3, 3),
      duration: 200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: 100, // Slight delay so torches flicker differently
      onUpdate: () => {
        if (Math.random() > 0.7) {
          rightFlame.quantity = Phaser.Math.Between(3, 6);
        }
      }
    });
    
    // Add smoke effect
    const rightSmoke = this.add.particles(rightTorchX, rightFlameY - 10, 'fireParticle', {
      x: { min: -8, max: 8 },
      y: { min: -40, max: -30 },
      lifespan: 2000,
      speed: { min: 20, max: 40 },
      scale: { start: 0.3, end: 0.8 },
      alpha: { start: 0.3, end: 0 },
      tint: 0x333333,
      quantity: 1,
      frequency: 200,
      gravityY: -50
    });
    rightSmoke.setDepth(4);
    this.registerUIElement('rightSmoke', rightSmoke);
    
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
    // Update background with zoom to hide AI logo
    const bgTexture = this.textures.get('landing-bg').getSourceImage();
    const bgAspectRatio = bgTexture.width / bgTexture.height;
    const screenAspectRatio = width / height;
    
    let scale = 1;
    if (screenAspectRatio > bgAspectRatio) {
      scale = width / bgTexture.width;
    } else {
      scale = height / bgTexture.height;
    }
    
    // Zoom in to crop edges
    scale *= 1.15;
    
    this.bgImage.setScale(scale);
    this.bgImage.setPosition(width * 0.48, height * 0.48);
    
    // Update dark overlay
    const darkOverlay = this.getUIElement('darkOverlay') as Phaser.GameObjects.Rectangle;
    if (darkOverlay) {
      darkOverlay.setSize(width, height);
      darkOverlay.setPosition(width/2, height/2);
    }

    // Reposition torch effects
    const leftTorchX = this.scaleValue(120, width);
    const rightTorchX = width - this.scaleValue(120, width);
    const torchY = this.getRelativePosition(0.3, height);
    
    const leftTorch = this.getUIElement('leftTorch') as Phaser.GameObjects.Image;
    const rightTorch = this.getUIElement('rightTorch') as Phaser.GameObjects.Image;
    const leftFlame = this.getUIElement('leftFlame') as Phaser.GameObjects.Particles.ParticleEmitter;
    const rightFlame = this.getUIElement('rightFlame') as Phaser.GameObjects.Particles.ParticleEmitter;
    const leftSmoke = this.getUIElement('leftSmoke') as Phaser.GameObjects.Particles.ParticleEmitter;
    const rightSmoke = this.getUIElement('rightSmoke') as Phaser.GameObjects.Particles.ParticleEmitter;
    
    if (leftTorch) {
      leftTorch.setPosition(leftTorchX, torchY);
      const leftFlameY = torchY - leftTorch.displayHeight * 0.25; // Match the new position
      if (leftFlame) {
        leftFlame.setPosition(leftTorchX, leftFlameY);
      }
      if (leftSmoke) {
        leftSmoke.setPosition(leftTorchX, leftFlameY - 10);
      }
    }
    
    if (rightTorch) {
      rightTorch.setPosition(rightTorchX, torchY);
      const rightFlameY = torchY - rightTorch.displayHeight * 0.25; // Match the new position
      if (rightFlame) {
        rightFlame.setPosition(rightTorchX, rightFlameY);
      }
      if (rightSmoke) {
        rightSmoke.setPosition(rightTorchX, rightFlameY - 10);
      }
    }
  }
}