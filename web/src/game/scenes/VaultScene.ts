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
  
  // Spinner properties
  private spinnerContainer!: Phaser.GameObjects.Container;
  private spinnerSlots: Phaser.GameObjects.Container[] = [];
  private isSpinning: boolean = false;
  private visibleSlots: number = 0;
  private targetSlotPosition: number = 0; // Store the predetermined target position
  private inFinaleMode: boolean = false;
  private lastTickedSlot: string | null = null;
  private tickedSlots: Set<string> = new Set();
  private nearMissOffset: number = 0; // Stores near miss direction for offset bias
  private initialMovement?: Phaser.Tweens.Tween;
  
  // Near-miss configuration
  private readonly NEAR_MISS_CHANCE = 0.95; // 95% chance of near miss on loss - VERY HIGH!
  private readonly STOP_OFFSET_RANGE = { min: -20, max: 20 }; // Pixel offset range
  private readonly NEAR_MISS_DISTANCE = { min: 1, max: 2 }; // Slots away from center
  
  constructor() {
    super({ key: 'VaultScene' });
  }
  
  create() {
    // Clean up any existing spinner before creating new one
    this.cleanupSpinner();
    
    // Call parent create
    super.create();
  }
  
  private cleanupSpinner() {
    // Clean up existing spinner if any
    if (this.spinnerSlots && this.spinnerSlots.length > 0) {
      this.spinnerSlots.forEach(slot => {
        if (slot && slot.active) {
          slot.destroy();
        }
      });
      this.spinnerSlots = [];
    }
    if (this.spinnerContainer && this.spinnerContainer.active) {
      this.spinnerContainer.destroy();
    }
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
    
    // Reset spinner state
    this.spinnerSlots = [];
    this.isSpinning = false;
    this.targetSlotPosition = 0;
    this.inFinaleMode = false;
    this.lastTickedSlot = null;
    this.tickedSlots = new Set();
    this.nearMissOffset = 0;
  }

  protected createScene() {
    const { width, height } = this.cameras.main;
    
    console.log('VaultScene createScene called, dimensions:', width, height);
    
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

    // Show the spinner after a short delay
    this.time.delayedCall(1000, () => this.createSpinner());
    
    // Listen for continue button from UI
    window.addEventListener('continue-from-vault-ui', this.handleContinue);
  }

  private createSpinner() {
    const { width, height } = this.cameras.main;
    
    console.log('Creating spinner, screen dimensions:', width, height);
    
    // Emit spinner ready state for UI
    window.dispatchEvent(new CustomEvent('spinner-ready'));
    
    // Create spinner container
    const spinnerY = height * 0.5;
    this.spinnerContainer = this.add.container(width * 0.5, spinnerY);
    console.log('Spinner container created at:', width * 0.5, spinnerY);
    
    // Create wider spinner background
    const spinnerWidth = width * 0.9; // Use 90% of screen width
    const spinnerBg = this.add.rectangle(0, 0, spinnerWidth, 200, 0x0a0a0a);
    spinnerBg.setStrokeStyle(4, 0xffd700);
    spinnerBg.setDepth(1);
    this.spinnerContainer.add(spinnerBg);
    
    // Create slots container that will move
    const slotsContainer = this.add.container(0, 0);
    
    // Create slot items
    const symbols = this.generateSpinnerSymbols();
    console.log('Generated symbols:', symbols.length, symbols); // Debug log
    const slotWidth = 120;
    const slotSpacing = 125; // Reduced from 140 - boxes closer together!
    
    // Calculate visible slots based on spinner width
    this.visibleSlots = Math.ceil(spinnerWidth / slotSpacing) + 2; // Add extra for smooth edges
    
    // Create initial slots
    symbols.forEach((symbol, index) => {
      const slotX = index * slotSpacing;
      const slot = this.createSlot(symbol, slotX, 0);
      slot.setData('originalIndex', index); // Store original index
      slot.setData('uniqueId', `slot_${index}`); // Unique ID for tracking
      slotsContainer.add(slot);
      this.spinnerSlots.push(slot);
    });
    
    // Create wrap-around slots for circular effect
    // Add copies of the first few slots at the end
    for (let i = 0; i < this.visibleSlots; i++) {
      const symbol = symbols[i];
      const slotX = (symbols.length + i) * slotSpacing;
      const slot = this.createSlot(symbol, slotX, 0);
      slot.setData('uniqueId', `slot_end_${i}`); // Unique ID for wrap-around
      slotsContainer.add(slot);
      this.spinnerSlots.push(slot);
    }
    
    // Also add copies of the last few slots at the beginning for seamless wrap
    for (let i = 0; i < this.visibleSlots; i++) {
      const symbolIndex = symbols.length - this.visibleSlots + i;
      const symbol = symbols[symbolIndex];
      const slotX = (i - this.visibleSlots) * slotSpacing;
      const slot = this.createSlot(symbol, slotX, 0);
      slot.setData('uniqueId', `slot_start_${i}`); // Unique ID for wrap-around
      slotsContainer.add(slot);
      this.spinnerSlots.unshift(slot); // Add to beginning of array
    }
    
    // Verify WIN placement
    if (this.vrfSuccess) {
      console.log('WIN placed at original position:', this.targetSlotPosition);
      // Find the slot with this original index
      const winSlot = this.spinnerSlots.find(s => s.getData('originalIndex') === this.targetSlotPosition);
      if (winSlot) {
        console.log('WIN slot found at X:', winSlot.x);
        console.log('WIN symbol:', winSlot.getData('symbol'));
      }
    }
    
    console.log('Created slots:', this.spinnerSlots.length); // Debug log
    console.log('Visible slots needed:', this.visibleSlots);
    
    // Start with middle position visible (offset the container)
    const middleOffset = -Math.floor(symbols.length / 2) * slotSpacing;
    slotsContainer.x = middleOffset;
    
    // Store the initial offset for spin calculations
    // middleOffset is available via slotsContainer.x if needed
    
    this.spinnerContainer.add(slotsContainer);
    this.registerUIElement('slotsContainer', slotsContainer);
    
    // Create gradient masks on edges for fade effect
    const edgeFadeWidth = 150;
    
    // Left edge fade
    const leftFade = this.add.graphics();
    leftFade.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x0a0a0a, 0x0a0a0a, 1, 0, 1, 0);
    leftFade.fillRect(-spinnerWidth/2, -100, edgeFadeWidth, 200);
    leftFade.setDepth(50);
    this.spinnerContainer.add(leftFade);
    
    // Right edge fade
    const rightFade = this.add.graphics();
    rightFade.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x0a0a0a, 0x0a0a0a, 0, 1, 0, 1);
    rightFade.fillRect(spinnerWidth/2 - edgeFadeWidth, -100, edgeFadeWidth, 200);
    rightFade.setDepth(50);
    this.spinnerContainer.add(rightFade);
    
    // Create highlight frame for center position - AFTER slots
    const highlightFrame = this.add.rectangle(0, 0, 130, 170, 0x000000, 0);
    highlightFrame.setStrokeStyle(6, 0xffff00);
    highlightFrame.setDepth(100);
    this.spinnerContainer.add(highlightFrame);
    
    // Add arrows pointing to center
    const arrowUp = this.add.text(0, -110, '▼', {
      fontSize: '32px',
      color: '#ffff00'
    }).setOrigin(0.5);
    const arrowDown = this.add.text(0, 110, '▲', {
      fontSize: '32px', 
      color: '#ffff00'
    }).setOrigin(0.5);
    this.spinnerContainer.add([arrowUp, arrowDown]);
    
    // Remove "DESTINY AWAITS..." text - it's handled by HTML overlay
    
    // Set spinner container depth and ensure it's visible
    this.spinnerContainer.setDepth(10);
    this.registerUIElement('spinnerContainer', this.spinnerContainer);
    
    // Add subtle initial movement to show it's interactive - continuous right movement
    this.initialMovement = this.tweens.add({
      targets: slotsContainer,
      x: slotsContainer.x - (slotSpacing * 3), // Move 3 slots slowly
      duration: 6000,
      ease: 'Linear',
      repeat: -1, // Repeat indefinitely
      yoyo: true // Smooth back and forth instead of reset
    });
    
    // Store reference to stop it when actual spin starts
    
    // Start spinning automatically after a short delay
    this.time.delayedCall(2500, () => this.startSpin());
  }
  
  private generateSpinnerSymbols(): string[] {
    // Create a long sequence of symbols for continuous scrolling
    // Only use miss and win symbols (no fortune)
    const basePattern = ['miss', 'miss', 'win', 'miss', 'miss', 'miss', 'win', 'miss'];
    const symbols: string[] = [];
    
    // Repeat pattern many times for wider spinner and longer scroll
    for (let i = 0; i < 15; i++) {
      symbols.push(...basePattern);
    }
    
    // Randomize position within safe range (40-70% of array) for variety
    const randomFactor = 0.4 + (Math.random() * 0.3);
    const targetPosition = Math.floor(symbols.length * randomFactor);
    
    // IMPORTANT: Store this position so startSpin knows where to stop
    this.targetSlotPosition = targetPosition;
    
    console.log('VRF Result:', this.vrfSuccess ? 'WIN' : 'LOSE');
    console.log('Target slot position:', targetPosition);
    
    if (this.vrfSuccess) {
      // SUCCESS - win symbol MUST land in center
      symbols[targetPosition] = 'win';
      symbols[targetPosition - 1] = 'miss';
      symbols[targetPosition + 1] = 'miss';
      console.log('Placed WIN at position:', targetPosition);
    } else {
      // LOSS - Enhanced near-miss logic
      const isNearMiss = Math.random() < this.NEAR_MISS_CHANCE;
      
      if (isNearMiss) {
        // Place win 1-2 slots away
        const distance = Phaser.Math.Between(this.NEAR_MISS_DISTANCE.min, this.NEAR_MISS_DISTANCE.max);
        const before = Math.random() < 0.5;
        const nearMissPosition = before ? targetPosition - distance : targetPosition + distance;
        
        // Ensure valid position
        if (nearMissPosition >= 0 && nearMissPosition < symbols.length) {
          symbols[nearMissPosition] = 'win';
          // Store for offset calculation (positive = win is before, negative = win is after)
          this.nearMissOffset = before ? distance : -distance;
          console.log(`Created NEAR MISS: win at ${nearMissPosition}, target at ${targetPosition}, offset: ${this.nearMissOffset}`);
        } else {
          // Fallback if position is invalid
          this.nearMissOffset = 0;
        }
      } else {
        // Complete miss - no win nearby
        this.nearMissOffset = 0;
        console.log('Created COMPLETE MISS pattern');
      }
      
      // Ensure target position and surrounding slots are misses
      symbols[targetPosition] = 'miss';
      if (targetPosition - 1 >= 0 && symbols[targetPosition - 1] !== 'win') {
        symbols[targetPosition - 1] = 'miss';
      }
      if (targetPosition + 1 < symbols.length && symbols[targetPosition + 1] !== 'win') {
        symbols[targetPosition + 1] = 'miss';
      }
    }
    
    return symbols;
  }
  
  private calculateBetterNearMissOffset(): number {
    let offset = 0;
    const pattern = Math.random();
    
    if (this.nearMissOffset !== 0) {
      // We have a win symbol nearby
      const winDirection = this.nearMissOffset > 0 ? 1 : -1;
      
      // With 125px spacing and 120px boxes, optimal positions are:
      // - Just before: -62.5px (exactly one slot before)
      // - Just after: +62.5px (exactly one slot after)
      // Add small variation for realism
      
      if (pattern < 0.5) {
        // Pattern 1 (50%): Win box just before center - precisely positioned
        offset = -62.5 + Phaser.Math.Between(-5, 5); // -67.5 to -57.5
        console.log('Near-miss: Win PRECISELY before center');
      } else if (pattern < 0.85) {
        // Pattern 2 (35%): Win box just after center - precisely positioned
        offset = 62.5 + Phaser.Math.Between(-5, 5); // 57.5 to 67.5
        console.log('Near-miss: Win PRECISELY after center');
      } else {
        // Pattern 3 (15%): Very close (edge of winning box visible)
        const edgeOffset = Phaser.Math.Between(0, 1) ? -35 : 35; // Just at the edge
        offset = edgeOffset + Phaser.Math.Between(-5, 5);
        console.log('Near-miss: Win edge barely visible');
      }
      
      // Adjust based on win position for realism
      if (winDirection < 0 && offset < 0) {
        // If win is before and we're undershooting, enhance the effect
        offset *= 0.9;
      } else if (winDirection > 0 && offset > 0) {
        // If win is after and we're overshooting, enhance the effect
        offset *= 0.9;
      }
    } else {
      // No win nearby - standard small offset
      offset = Phaser.Math.Between(-20, 20);
    }
    
    // Safety check: ensure we don't land in the gap between slots
    const maxSafeOffset = 55; // Maximum safe offset to ensure we land on a slot
    if (Math.abs(offset) > maxSafeOffset) {
      offset = offset > 0 ? maxSafeOffset : -maxSafeOffset;
    }
    
    return offset;
  }
  
  private createSlot(symbol: string, x: number, y: number): Phaser.GameObjects.Container {
    const slot = this.add.container(x, y);
    
    // Slot background - darker for better contrast
    const slotBg = this.add.rectangle(0, 0, 120, 160, 0x1a1a1a);
    slotBg.setStrokeStyle(2, 0x666666);
    slot.add(slotBg);
    
    // Create visual representations for each outcome
    switch (symbol) {
      case 'win':
        // Golden star for WIN
        const star = this.add.graphics();
        star.fillStyle(0xffd700, 1);
        star.lineStyle(2, 0xffff00);
        
        // Draw star shape
        const points = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? 35 : 15;
          points.push(new Phaser.Math.Vector2(
            Math.cos(angle - Math.PI / 2) * radius,
            Math.sin(angle - Math.PI / 2) * radius
          ));
        }
        star.fillPoints(points);
        star.strokePoints(points);
        slot.add(star);
        
        // Add WIN text
        const winText = this.add.text(0, 50, 'WIN', {
          fontSize: '18px',
          color: '#ffd700',
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        slot.add(winText);
        break;
        
      case 'miss':
        // Red X for MISS
        const missBg = this.add.circle(0, 0, 30, 0x440000);
        missBg.setStrokeStyle(3, 0xff0000);
        slot.add(missBg);
        
        // Add X symbol
        const missX = this.add.text(0, 0, '✕', {
          fontSize: '40px',
          color: '#ff0000',
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        slot.add(missX);
        
        // Add text label
        const missText = this.add.text(0, 50, 'MISS', {
          fontSize: '16px',
          color: '#ff6666',
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        slot.add(missText);
        break;
    }
    
    slot.setData('symbol', symbol);
    
    return slot;
  }
  
  private startSpin() {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    const slotsContainer = this.getUIElement('slotsContainer') as Phaser.GameObjects.Container;
    
    // Stop the initial movement animation
    if (this.initialMovement) {
      this.initialMovement.stop();
    }
    
    // Emit spinning started event
    window.dispatchEvent(new CustomEvent('spinner-started'));
    
    // Calculate target position based on result
    const slotSpacing = 125; // Must match the spacing used in createSpinner
    const currentX = slotsContainer.x;
    
    // Use the predetermined target position from generateSpinnerSymbols
    const targetSlotInBaseSymbols = this.targetSlotPosition;
    
    // The target position is simply the slot position times spacing
    let targetPosition = -targetSlotInBaseSymbols * slotSpacing;
    
    // Add pixel offset for more realistic positioning
    let pixelOffset = 0;
    if (!this.vrfSuccess) {
      // Use improved near-miss calculation for losses
      pixelOffset = this.calculateBetterNearMissOffset();
    } else {
      // WIN: Add larger variation so it's not always perfectly centered
      pixelOffset = Phaser.Math.Between(-25, 25);
      console.log('WIN offset for realism:', pixelOffset);
    }
    targetPosition += pixelOffset;
    
    console.log('VRF Result:', this.vrfSuccess ? 'WIN' : 'LOSE');
    console.log('Target slot position:', targetSlotInBaseSymbols);
    console.log('Target X position:', targetPosition);
    console.log('Pixel offset:', pixelOffset);
    console.log('Near miss offset:', this.nearMissOffset);
    
    // Ensure we don't go past the last valid slot
    const maxLeftPosition = -(this.spinnerSlots.length - this.visibleSlots - 2) * slotSpacing;
    targetPosition = Math.max(targetPosition, maxLeftPosition);
    
    // Single continuous animation
    const spinSlots = 80 + Math.floor(Math.random() * 20); // Total slots to spin
    const totalDistance = spinSlots * slotSpacing;
    const duration = 5000; // 5 seconds total
    
    // Position container to the right so it scrolls left
    const startPosition = targetPosition + totalDistance;
    slotsContainer.x = startPosition;
    
    console.log('Smooth Spin Setup:', {
      startPosition,
      targetPosition,
      totalDistance,
      duration
    });
    
    // Store initial position for velocity calculation
    let lastX = startPosition;
    let lastTime = 0;
    let zoomStarted = false;
    
    // Reset finale tracking
    this.inFinaleMode = false;
    this.lastTickedSlot = null;
    this.tickedSlots.clear();
    
    // Single continuous tween with smooth easing
    this.tweens.add({
      targets: slotsContainer,
      x: targetPosition,
      duration: duration,
      ease: 'Expo.easeOut', // Natural deceleration
      
      onUpdate: (tween) => {
        const progress = tween.progress;
        const currentTime = tween.elapsed;
        const currentX = slotsContainer.x;
        
        // Calculate velocity (pixels per millisecond)
        const deltaTime = currentTime - lastTime;
        const deltaX = Math.abs(currentX - lastX);
        const velocity = deltaTime > 0 ? deltaX / deltaTime : 0;
        
        // Normalize velocity (0-1 range)
        const normalizedVelocity = Math.min(velocity / 2, 1);
        
        // Motion blur based on velocity
        const alpha = Math.max(0.6, 1 - normalizedVelocity * 0.4);
        slotsContainer.setAlpha(alpha);
        
        // Calculate time remaining for zoom effect
        const timeRemaining = (duration - currentTime) / 1000;
        
        // Start zoom on spinner container when 1.8 seconds remain
        if (!zoomStarted && timeRemaining <= 1.8 && timeRemaining > 0) {
          zoomStarted = true;
          console.log('Starting spinner zoom, time remaining:', timeRemaining);
          
          // Zoom the spinner container only
          this.tweens.add({
            targets: this.spinnerContainer,
            scale: { from: 1, to: 1.12 },
            duration: timeRemaining * 1000,
            ease: 'Sine.easeInOut'
          });
        }
        
        // Check for finale mode
        const remainingDistance = Math.abs(currentX - targetPosition);
        const slotsTillEnd = remainingDistance / slotSpacing;
        
        if (slotsTillEnd <= 8 && !this.inFinaleMode) {
          this.inFinaleMode = true;
          console.log('Entering dramatic finale mode!');
        }
        
        // Update slot effects based on velocity
        this.updateSlotEffects(slotsContainer, normalizedVelocity, slotsTillEnd);
        
        // Store for next frame
        lastX = currentX;
        lastTime = currentTime;
      },
      
      onComplete: () => {
        // Reset alpha and effects
        slotsContainer.setAlpha(1);
        this.spinnerSlots.forEach(slot => slot.setScale(1));
        
        // Final landing
        this.finalLanding(slotsContainer, targetPosition);
      }
    });
  }
  
  private updateSlotEffects(slotsContainer: Phaser.GameObjects.Container, velocity: number, slotsTillEnd: number = 999) {
    const centerX = this.cameras.main.width * 0.5;
    const slotSpacing = 125; // Updated to match new spacing
    
    // Find the slot closest to center
    let closestSlot: Phaser.GameObjects.Container | null = null;
    let minDistance = Infinity;
    
    this.spinnerSlots.forEach(slot => {
      const slotWorldX = this.spinnerContainer.x + slotsContainer.x + slot.x;
      const distFromCenter = Math.abs(slotWorldX - centerX);
      
      // Reset scale for all slots first
      slot.setScale(1);
      
      // Track closest slot
      if (distFromCenter < minDistance) {
        minDistance = distFromCenter;
        closestSlot = slot;
      }
    });
    
    // Apply effects only to the closest slot if it's within threshold
    if (closestSlot && minDistance < slotSpacing * 0.5) {
      const slot: Phaser.GameObjects.Container = closestSlot; // Type assertion helper
      // Check for dramatic finale mode
      if (this.inFinaleMode) {
        const slotId = slot.getData('uniqueId');
        const symbol = slot.getData('symbol');
        
        // Check if this is a new slot entering center
        if (slotId !== this.lastTickedSlot && minDistance < 30 && !this.tickedSlots.has(slotId)) {
          this.lastTickedSlot = slotId;
          this.tickedSlots.add(slotId);
          
          // Calculate intensity (0-1) based on proximity to end
          const intensity = Math.max(0, 1 - (slotsTillEnd / 8));
          
          this.handleFinaleTick(slot, intensity);
          
          // Special effects for win symbols passing
          if (symbol === 'win' && !slot.getData('hasTriggeredNearMiss')) {
            slot.setData('hasTriggeredNearMiss', true);
            this.handleNearMissPass(slot, velocity);
          }
          
          // Final slot gets special treatment
          if (slotsTillEnd < 1) {
            this.handleFinalSlotApproach(slot, slotsContainer);
          }
        }
      } else {
        // Normal mode - subtle scale effect based on velocity
        const scale = 1 + (0.1 * (1 - velocity));
        slot.setScale(scale);
        
        // Add subtle glow effect for the closest slot at low speeds
        if (velocity < 0.3 && !slot.getData('hasGlow')) {
          slot.setData('hasGlow', true);
          const glowEffect = this.add.rectangle(slot.x, slot.y, 130, 170, 0xffffff, 0.1);
          slotsContainer.add(glowEffect);
          
          this.tweens.add({
            targets: glowEffect,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              glowEffect.destroy();
              slot.setData('hasGlow', false);
            }
          });
        }
      }
    }
  }
  
  private handleFinaleTick(slot: Phaser.GameObjects.Container, intensity: number) {
    // 1. Sound effect placeholder - would play tick sound here
    // this.sound.play('tick', { volume: 0.3 + intensity * 0.7 });
    
    // 2. Scale pop animation
    this.tweens.add({
      targets: slot,
      scale: { from: 1, to: 1.2 + (intensity * 0.1) },
      duration: 150,
      yoyo: true,
      ease: 'Power2.easeOut'
    });
    
    // 3. Glow/outline effect
    const glowColor = intensity > 0.8 ? 0xffd700 : 0xffffff;
    const glow = this.add.graphics();
    glow.lineStyle(4, glowColor, 0.8);
    glow.strokeRect(-65, -85, 130, 170);
    slot.add(glow);
    
    // Pulsing glow animation
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.8, to: 0 },
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 1.1 },
      duration: 300,
      onComplete: () => glow.destroy()
    });
    
    // 4. Camera micro-shake for impact
    if (intensity > 0.5) {
      this.cameras.main.shake(50, 0.002 * intensity);
    }
    
    // 5. Flash effect for high intensity
    if (intensity > 0.8) {
      const flash = this.add.rectangle(0, 0, 140, 180, 0xffffff, 0.3);
      slot.add(flash);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 1.5,
        duration: 200,
        onComplete: () => flash.destroy()
      });
    }
  }
  
  private handleNearMissPass(winSlot: Phaser.GameObjects.Container, velocity: number) {
    // Golden shimmer effect
    const shimmer = this.add.graphics();
    shimmer.fillStyle(0xffd700, 0.6);
    shimmer.fillRect(-70, -90, 140, 180);
    winSlot.add(shimmer);
    
    // Pulsing animation
    this.tweens.add({
      targets: shimmer,
      alpha: { from: 0.6, to: 0 },
      scaleX: { from: 1, to: 1.2 },
      scaleY: { from: 1, to: 1.2 },
      duration: 500,
      ease: 'Power2.easeOut',
      onComplete: () => shimmer.destroy()
    });
    
    // Slight slowdown effect at low velocity
    if (velocity < 0.3) {
      const currentTween = this.tweens.getTweensOf(this.getUIElement('slotsContainer') as Phaser.GameObjects.Container)[0];
      if (currentTween && currentTween.timeScale) {
        // Temporary slowdown
        currentTween.timeScale = 0.8;
        this.time.delayedCall(200, () => {
          if (currentTween.isPlaying()) {
            currentTween.timeScale = 1;
          }
        });
      }
    }
    
    // Camera micro-bounce
    this.cameras.main.shake(100, 0.003);
    
    // Extra glow ring
    const ring = this.add.graphics();
    ring.lineStyle(3, 0xffd700, 1);
    ring.strokeCircle(0, 0, 50);
    winSlot.add(ring);
    
    this.tweens.add({
      targets: ring,
      scale: { from: 0.5, to: 2 },
      alpha: { from: 1, to: 0 },
      duration: 600,
      ease: 'Power2.easeOut',
      onComplete: () => ring.destroy()
    });
  }
  
  private handleFinalSlotApproach(finalSlot: Phaser.GameObjects.Container, slotsContainer: Phaser.GameObjects.Container) {
    // Slow the final approach even more
    const currentTween = this.tweens.getTweensOf(slotsContainer)[0];
    if (currentTween && currentTween.timeScale) {
      currentTween.timeScale = 0.5; // Half speed for drama
    }
    
    // Epic scale and glow
    this.tweens.add({
      targets: finalSlot,
      scale: 1.3,
      duration: 800,
      ease: 'Power2.easeInOut'
    });
    
    // Camera effects
    this.cameras.main.shake(200, 0.005);
    this.cameras.main.zoomTo(1.05, 500);
  }
  
  private finalLanding(slotsContainer: Phaser.GameObjects.Container, targetPosition: number) {
    // Ensure exact position
    slotsContainer.x = targetPosition;
    
    // Reset all slot scales
    this.spinnerSlots.forEach(slot => slot.setScale(1));
    this.isSpinning = false;
    
    // Reset finale mode
    this.inFinaleMode = false;
    this.cameras.main.zoomTo(1, 300);
    
    // Reset spinner scale from zoom
    this.tweens.add({
      targets: this.spinnerContainer,
      scale: 1,
      duration: 200,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // Landing bounce effect after scale reset
        this.tweens.add({
          targets: this.spinnerContainer,
          scale: { from: 1, to: 1.05 },
          duration: 150,
          yoyo: true,
          ease: 'Power2.easeInOut'
        });
      }
    });
    
    // Camera shake
    this.cameras.main.shake(150, 0.01);
    
    // Epic impact flash
    const impactFlash = this.add.rectangle(0, 0, 140, 180, 0xffffff, 0.8);
    this.spinnerContainer.add(impactFlash);
    
    this.tweens.add({
      targets: impactFlash,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      ease: 'Power2.easeOut',
      onComplete: () => impactFlash.destroy()
    });
    
    // Win effects
    if (this.vrfSuccess) {
      // Confetti burst effect
      this.createConfettiBurst();
      
      // Strong camera shake
      this.cameras.main.shake(300, 0.02);
      
      // Victory flash
      this.cameras.main.flash(300, 255, 215, 0, true);
      
      // Golden glow pulse
      const winGlow = this.add.rectangle(0, 0, 130, 170, 0xffd700, 0);
      this.spinnerContainer.add(winGlow);
      
      this.tweens.add({
        targets: winGlow,
        alpha: { from: 0, to: 0.6 },
        scale: { from: 1, to: 1.1 },
        duration: 400,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
        onComplete: () => winGlow.destroy()
      });
    }
    
    // Debug output
    const finalX = slotsContainer.x;
    let centerSymbol = 'unknown';
    const screenCenterX = this.cameras.main.width * 0.5;
    
    // Find which slot is at screen center
    this.spinnerSlots.forEach(slot => {
      const slotScreenX = this.spinnerContainer.x + finalX + slot.x;
      if (Math.abs(slotScreenX - screenCenterX) < 70) {
        centerSymbol = slot.getData('symbol');
      }
    });
    
    console.log('=== SPIN COMPLETE ===');
    console.log('Expected:', this.vrfSuccess ? 'WIN' : 'MISS');
    console.log('Showing:', centerSymbol);
    console.log('==================');
    
    // Check for visible near misses on final landing
    if (!this.vrfSuccess) {
      this.highlightNearMisses(slotsContainer);
    }
    
    this.showSpinResult();
  }
  
  private highlightNearMisses(slotsContainer: Phaser.GameObjects.Container) {
    const centerX = this.cameras.main.width * 0.5;
    const slotSpacing = 140;
    
    this.spinnerSlots.forEach(slot => {
      const slotWorldX = this.spinnerContainer.x + slotsContainer.x + slot.x;
      const distFromCenter = Math.abs(slotWorldX - centerX);
      
      // Check if this is a win symbol visible near the center
      if (slot.getData('symbol') === 'win' && distFromCenter < slotSpacing * 2 && distFromCenter > slotSpacing * 0.5) {
        // Subtle red glow on the "missed" win
        const missedGlow = this.add.rectangle(0, 0, 130, 170, 0xff6666, 0);
        missedGlow.setStrokeStyle(3, 0xff6666, 0.5);
        slot.add(missedGlow);
        
        // Pulsing animation
        this.tweens.add({
          targets: missedGlow,
          alpha: { from: 0.3, to: 0 },
          scaleX: { from: 1, to: 1.05 },
          scaleY: { from: 1, to: 1.05 },
          duration: 1000,
          yoyo: true,
          repeat: 2,
          ease: 'Sine.easeInOut',
          onComplete: () => missedGlow.destroy()
        });
        
        // Subtle shake on the missed win slot
        this.tweens.add({
          targets: slot,
          x: slot.x + Phaser.Math.Between(-2, 2),
          y: slot.y + Phaser.Math.Between(-2, 2),
          duration: 100,
          repeat: 3,
          yoyo: true,
          ease: 'Linear'
        });
      }
    });
  }
  
  private showSpinResult() {
    // Camera shake for impact
    this.cameras.main.shake(300, 0.01);
    
    // Flash effect
    if (this.vrfSuccess) {
      this.cameras.main.flash(500, 255, 215, 0);
    }
    
    // Emit result event
    window.dispatchEvent(new CustomEvent('spinner-result', {
      detail: {
        success: this.vrfSuccess,
        prizeAmount: this.prizeAmount
      }
    }));
    
    // Show result after delay
    this.time.delayedCall(1000, () => {
      if (this.vrfSuccess) {
        this.vaultSuccess();
      } else {
        this.vaultEmpty();
      }
    });
  }
  

  private async vaultSuccess() {
    const { width, height } = this.cameras.main;

    // Golden flash effect
    this.cameras.main.flash(500, 255, 215, 0);
    
    // Make spinner glow golden
    if (this.spinnerContainer) {
      this.tweens.add({
        targets: this.spinnerContainer,
        alpha: { from: 1, to: 0.8 },
        duration: 500,
        yoyo: true,
        repeat: 3
      });
      
      // Create treasure effects at spinner location
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
  
  private createConfettiBurst() {
    const centerX = this.cameras.main.width * 0.5;
    const centerY = this.cameras.main.height * 0.5;
    
    // Create multiple confetti particles
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 200 + Math.random() * 300;
      const color = Phaser.Utils.Array.GetRandom([0xffd700, 0xffaa00, 0xff6600, 0xffffff]);
      
      const confetti = this.add.rectangle(centerX, centerY, 8, 12, color);
      confetti.setDepth(200);
      
      // Random rotation
      confetti.rotation = Math.random() * Math.PI * 2;
      
      // Burst animation
      this.tweens.add({
        targets: confetti,
        x: centerX + Math.cos(angle) * speed,
        y: centerY + Math.sin(angle) * speed + (Math.random() * 100),
        rotation: confetti.rotation + (Math.random() * 10),
        alpha: { from: 1, to: 0 },
        scale: { from: 1, to: 0.5 },
        duration: 1000 + Math.random() * 500,
        ease: 'Power2.easeOut',
        onComplete: () => confetti.destroy()
      });
    }
  }
  
  private createTreasureEffects() {
    if (!this.spinnerContainer) return;
    
    const vaultX = this.spinnerContainer.x;
    const vaultY = this.spinnerContainer.y;
    
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

    // Spinner fades away in defeat
    if (this.spinnerContainer) {
      this.tweens.add({
        targets: this.spinnerContainer,
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
    // Clean up spinner when scene shuts down
    this.cleanupSpinner();
    
    // Remove event listeners
    window.removeEventListener('continue-from-vault-ui', this.handleContinue);
    
    // Parent class handles shutdown automatically
  }
  
  private handleContinue = () => {
    // Clean up before transitioning
    this.cleanupSpinner();
    
    // Small delay to ensure cleanup completes
    this.time.delayedCall(100, () => {
      this.scene.start('ColosseumScene', {
        walletAddress: this.walletAddress
      });
    });
  }
}