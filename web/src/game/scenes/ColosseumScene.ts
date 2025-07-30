// Main Colosseum Scene - core gameplay hub with HTML UI overlay
import { BaseScene } from './BaseScene';
import { ColosseumState, Monster, CombatSummary } from '../../types';

export class ColosseumScene extends BaseScene {
  private walletAddress!: string;
  private colosseumState!: ColosseumState;
  private monsterSprite!: Phaser.GameObjects.Sprite;
  private updateTimer!: Phaser.Time.TimerEvent;
  private bgImage!: Phaser.GameObjects.Image;
  private gladiatorGroup: Phaser.GameObjects.Rectangle[] = [];
  private spearTimer?: Phaser.Time.TimerEvent;
  private minGladiators: number = 15; // Fixed at 15 gladiators
  private incomingGladiators: Phaser.GameObjects.Rectangle[] = []; // Track walking gladiators
  private currentGladiator?: Phaser.GameObjects.Rectangle; // Center gladiator
  private gladiatorHealth: number = 2; // Health for center gladiator
  private selectedMonster: string = 'SKELETON_WARRIOR'; // Dev mode selected monster

  constructor() {
    super({ key: 'ColosseumScene' });
  }
  
  private checkAndSpawnGladiators() {
    // Count active gladiators (not including incoming ones)
    const activeGladiators = this.gladiatorGroup.filter(g => g && g.active).length;
    const totalGladiators = activeGladiators + this.incomingGladiators.length;
    
    // Spawn new gladiators if below minimum
    if (totalGladiators < this.minGladiators) {
      const toSpawn = this.minGladiators - totalGladiators;
      
      for (let i = 0; i < toSpawn; i++) {
        // Stagger the spawns
        this.time.delayedCall(i * 800, () => {
          this.spawnWalkingGladiator();
        });
      }
    }
  }
  
  private spawnWalkingGladiator() {
    const { centerX, centerY, width, height } = this.cameras.main;
    const centerOffsetX = this.scaleValue(100, width);
    const spreadX = this.scaleValue(250, width);
    const spreadY = this.scaleValue(200, height);
    
    // Define entry points
    const entryPoints = [
      { x: Phaser.Math.Between(centerX - 150, centerX + 150), y: -50 },
      { x: Phaser.Math.Between(centerX - 150, centerX + 150), y: height + 50 },
      { x: width + 50, y: Phaser.Math.Between(100, height - 100) },
    ];
    
    const entry = Phaser.Utils.Array.GetRandom(entryPoints);
    
    // Find final position with proper spacing
    const minDistance = this.scaleValue(60, width); // Original spacing that worked
    let validPosition = false;
    let attempts = 0;
    let finalX = 0, finalY = 0;
    
    while (!validPosition && attempts < 200) { // More attempts for better placement
      finalX = centerX + centerOffsetX + Phaser.Math.Between(-spreadX/2, spreadX/2);
      finalY = centerY + Phaser.Math.Between(-spreadY/2, spreadY/2);
      
      if (finalX < centerX - this.scaleValue(50, width)) {
        attempts++;
        continue;
      }
      
      validPosition = true;
      // Check distance from all gladiators (existing and incoming)
      const allGladiators = [...this.gladiatorGroup, ...this.incomingGladiators];
      for (const glad of allGladiators) {
        if (glad && glad.active) {
          const distance = Phaser.Math.Distance.Between(finalX, finalY, glad.x, glad.y);
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
      }
      attempts++;
    }
    
    // Create gladiator at entry point
    const boxSize = this.scaleValue(25, width);
    const gladiator = this.add.rectangle(entry.x, entry.y, boxSize, boxSize);
    
    // Store the actual box size for collision detection
    gladiator.setData('boxSize', boxSize);
    
    gladiator.setFillStyle(0x8b7355);
    gladiator.setStrokeStyle(2, 0xcd853f);
    gladiator.setAlpha(0);
    gladiator.setDepth(3);
    
    // Track as incoming
    this.incomingGladiators.push(gladiator);
    
    // Store position data
    gladiator.setData('originalX', finalX - centerX);
    gladiator.setData('originalY', finalY - centerY);
    
    // Fade in while moving
    this.tweens.add({
      targets: gladiator,
      alpha: 0.9,
      duration: 500
    });
    
    // Walk to position
    this.tweens.add({
      targets: gladiator,
      x: finalX,
      y: finalY,
      duration: 2500,
      ease: 'Power2',
      onComplete: () => {
        // Remove from incoming list
        const index = this.incomingGladiators.indexOf(gladiator);
        if (index > -1) {
          this.incomingGladiators.splice(index, 1);
        }
        
        // Add to main group
        this.gladiatorGroup.push(gladiator);
      }
    });
  }
  
  private killSupportingGladiator(gladiator: Phaser.GameObjects.Rectangle) {
    // Remove from group
    const index = this.gladiatorGroup.indexOf(gladiator);
    if (index > -1) {
      this.gladiatorGroup.splice(index, 1);
    }
    
    // Death animation - fade and fall
    this.tweens.add({
      targets: gladiator,
      alpha: 0,
      y: gladiator.y + 30,
      scaleX: 0.7,
      scaleY: 0.7,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        gladiator.destroy();
        
        // Don't spawn immediately - let checkAndSpawnGladiators handle it
      }
    });
  }
  
  private addNewSupportingGladiator() {
    const { centerX, centerY, width, height } = this.cameras.main;
    
    // Define entry points for new gladiators
    const entryPoints = [
      { x: Phaser.Math.Between(centerX - 150, centerX + 150), y: -50 }, // Top
      { x: Phaser.Math.Between(centerX - 150, centerX + 150), y: height + 50 }, // Bottom
      { x: width + 50, y: Phaser.Math.Between(100, height - 100) }, // Right
    ];
    
    const entry = Phaser.Utils.Array.GetRandom(entryPoints);
    
    // Find final position in the circle with proper spacing
    const minDistance = this.scaleValue(60, width);
    let validPosition = false;
    let attempts = 0;
    let finalX = 0, finalY = 0, angle = 0, radius = 0;
    
    while (!validPosition && attempts < 50) {
      angle = Phaser.Math.Between(-90, 90);
      const radian = (angle * Math.PI) / 180;
      radius = Phaser.Math.Between(this.scaleValue(120, width), this.scaleValue(200, width));
      
      finalX = centerX + radius * Math.cos(radian);
      finalY = centerY + radius * Math.sin(radian);
      
      // Check distance from existing gladiators
      validPosition = true;
      for (const glad of this.gladiatorGroup) {
        if (glad && glad.active) {
          const distance = Phaser.Math.Distance.Between(finalX, finalY, glad.x, glad.y);
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
      }
      attempts++;
    }
    
    // Create gladiator at entry point
    const boxSize = this.scaleValue(30, width);
    const gladiator = this.add.rectangle(entry.x, entry.y, boxSize, boxSize);
    
    const colorVariation = Phaser.Math.Between(0, 2);
    const colors = [0x8b7355, 0x9b8365, 0x7b6345];
    gladiator.setFillStyle(colors[colorVariation]);
    gladiator.setStrokeStyle(3, 0xcd853f);
    gladiator.setAlpha(0);
    gladiator.setDepth(3);
    
    // Store position data
    gladiator.setData('originalAngle', angle);
    gladiator.setData('originalRadius', radius);
    
    // Fade in while moving to position
    this.tweens.add({
      targets: gladiator,
      alpha: Phaser.Math.FloatBetween(0.8, 1.0),
      duration: 300
    });
    
    // Move from entry point to final position
    this.tweens.add({
      targets: gladiator,
      x: finalX,
      y: finalY,
      duration: 1500,
      ease: 'Power2'
    });
    
    this.gladiatorGroup.push(gladiator);
  }
  
  private killCurrentGladiator() {
    if (!this.currentGladiator) return;
    
    // Death animation - fade and fall
    this.tweens.add({
      targets: this.currentGladiator,
      alpha: 0,
      y: this.currentGladiator.y + 50,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        // Destroy the dead gladiator
        if (this.currentGladiator) {
          this.currentGladiator.destroy();
        }
        
        // Bring in next gladiator from queue
        this.bringNextGladiator();
      }
    });
    
    // Create death particles
    const particles = this.add.particles(this.currentGladiator.x, this.currentGladiator.y, 'spark-placeholder', {
      lifespan: 1000,
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      blendMode: 'NORMAL',
      tint: [0x8b0000, 0x555555],
      quantity: 20,
      gravityY: 200
    });
    
    this.time.delayedCall(1200, () => {
      particles.destroy();
    });
  }
  
  private bringNextGladiator() {
    const { centerX, centerY, width, height } = this.cameras.main;
    const boxSize = this.scaleValue(40, width);
    
    // Define possible entry points with more variation
    const entryPoints = [
      { x: Phaser.Math.Between(centerX - 100, centerX + 100), y: -50, name: 'top' },
      { x: Phaser.Math.Between(centerX - 100, centerX + 100), y: height + 50, name: 'bottom' },
      { x: width + 50, y: Phaser.Math.Between(50, height - 50), name: 'right' },
      { x: Phaser.Math.Between(centerX + 50, width - 50), y: -50, name: 'topRight' },
      { x: Phaser.Math.Between(centerX + 50, width - 50), y: height + 50, name: 'bottomRight' },
    ];
    
    // Randomly select entry point
    const entryPoint = entryPoints[Math.floor(Math.random() * entryPoints.length)];
    
    // Create new current gladiator at entry point
    this.currentGladiator = this.add.rectangle(
      entryPoint.x,
      entryPoint.y,
      boxSize,
      boxSize
    );
    
    this.currentGladiator.setFillStyle(0x8b0000);
    this.currentGladiator.setStrokeStyle(4, 0xff0000);
    this.currentGladiator.setAlpha(0);
    this.currentGladiator.setDepth(4);
    
    // Fade in as gladiator enters
    this.tweens.add({
      targets: this.currentGladiator,
      alpha: 1,
      duration: 500
    });
    
    // Animate gladiator walking to center
    this.tweens.add({
      targets: this.currentGladiator,
      x: centerX,
      y: centerY,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        // No breathing animation - keep gladiator static
      }
    });
    
    // Reset health for new gladiator
    this.gladiatorHealth = 2;
    
    // Register the new gladiator
    this.registerUIElement('currentGladiator', this.currentGladiator);
  }
  
  private startSpearThrowing() {
    // Clean up existing timer
    if (this.spearTimer) {
      this.spearTimer.destroy();
    }
    
    // Create spear throwing effect with varied timing
    this.spearTimer = this.time.addEvent({
      delay: Phaser.Math.Between(1200, 2000), // Random intervals
      callback: () => {
        // Randomly select 2-3 gladiators to throw spears
        const throwers = Phaser.Utils.Array.Shuffle([...this.gladiatorGroup]).slice(0, Phaser.Math.Between(2, 3));
        
        throwers.forEach((gladiator, i) => {
          if (!gladiator || !gladiator.active) return;
          
          // Create spear projectile
          const spear = this.add.rectangle(
            gladiator.x,
            gladiator.y,
            this.scaleValue(20, this.cameras.main.width),
            this.scaleValue(3, this.cameras.main.height)
          );
          
          spear.setFillStyle(0x8b7355);
          spear.setAlpha(0.8);
          spear.setDepth(2);
          
          // Calculate angle to monster
          const angle = Phaser.Math.Angle.Between(
            gladiator.x, gladiator.y,
            this.monsterSprite.x, this.monsterSprite.y
          );
          spear.setRotation(angle);
          
          // Animate spear flying toward monster - slower and more realistic
          this.tweens.add({
            targets: spear,
            x: this.monsterSprite.x + Phaser.Math.Between(-30, 30),
            y: this.monsterSprite.y + Phaser.Math.Between(-30, 30),
            duration: 1200, // Slower travel time
            delay: i * 150,
            ease: 'Cubic.easeOut', // More realistic arc
            onComplete: () => {
              // Create small impact effect
              this.tweens.add({
                targets: spear,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 300,
                onComplete: () => spear.destroy()
              });
            }
          });
          
          // Add slight arc to spear trajectory
          this.tweens.add({
            targets: spear,
            y: spear.y - 20,
            duration: 600,
            yoyo: true,
            ease: 'Sine.easeOut'
          });
        });
      },
      loop: true
    });
  }

  init(data: { walletAddress?: string }) {
    this.walletAddress = data?.walletAddress || 'test-wallet';
  }

  protected createScene() {
    const { width, height } = this.cameras.main;

    // Emit scene change event
    window.dispatchEvent(new CustomEvent('sceneChanged', { 
      detail: { sceneName: 'ColosseumScene' } 
    }));

    // Clean up any existing timers
    if (this.updateTimer) {
      this.updateTimer.destroy();
    }
    
    // Listen for scene events
    this.events.on('wake', this.handleSceneWake, this);
    this.events.on('resume', this.handleSceneResume, this);
    
    // Background - darker and more subtle
    const bgRect = this.add.rectangle(width/2, height/2, width, height, 0x1a1a1a);
    this.registerUIElement('bgRect', bgRect);
    
    this.bgImage = this.add.image(width * 0.5, height * 0.5, 'arena-bg-placeholder');
    this.bgImage.setDisplaySize(width, height);
    this.bgImage.setAlpha(0.3);
    this.registerUIElement('bg', this.bgImage);

    // Create game elements only (UI is handled by HTML overlay)
    this.createMonsterDisplay();
    this.setupFightButtonListener();

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

  private createMonsterDisplay() {
    const { width, height } = this.cameras.main;

    // Monster sprite - larger and more imposing
    this.monsterSprite = this.add.sprite(0, 0, 'skeleton');
    this.monsterSprite.setScale(this.scaleValue(5, width));
    this.monsterSprite.play('skeleton_idle');
    this.monsterSprite.setFlipX(true); // Face left towards gladiator
    this.monsterSprite.setDepth(5); // Ensure it appears above background
    this.registerUIElement('monsterSprite', this.monsterSprite);
    
    // Add shadow under monster
    const monsterShadow = this.add.ellipse(0, 0, 
      this.scaleValue(150, width), 
      this.scaleValue(40, height), 
      0x000000, 0.5
    );
    monsterShadow.setDepth(4);
    this.registerUIElement('monsterShadow', monsterShadow);
    
    // Add red aura effect around monster
    const auraGlow = this.add.graphics();
    auraGlow.setDepth(3);
    this.registerUIElement('auraGlow', auraGlow);
    
    // Add pulsing aura animation
    this.tweens.add({
      targets: { radius: 100 },
      radius: 120,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const radius = tween.getValue();
        if (typeof radius === 'number') {
          auraGlow.clear();
          auraGlow.setAlpha(0.5);
          for (let i = 3; i > 0; i--) {
            auraGlow.fillStyle(0xff0000, 0.1 * i);
            auraGlow.fillCircle(0, 0, radius / i);
          }
        }
      }
    });

    // Create small gladiator indicators
    this.createDefeatedGladiators(width, height);
    
    // Position elements
    this.positionMonsterDisplay(width, height);
    
    // Emit initial positions for HTML overlay
    this.time.delayedCall(100, () => {
      this.emitSpritePositions();
    });
    
    // Add periodic attack animation
    this.time.addEvent({
      delay: 4000, // Attack every 4 seconds
      callback: () => {
        if (this.monsterSprite && this.monsterSprite.active) {
          const spriteKey = this.monsterSprite.texture.key;
          
          // Play attack animation
          if (this.anims.exists(`${spriteKey}_attack`)) {
            this.monsterSprite.play(`${spriteKey}_attack`);
            
            this.monsterSprite.once('animationcomplete', () => {
              this.monsterSprite.play(`${spriteKey}_idle`);
            });
          } else {
            // Fallback attack animation - lunge forward
            this.tweens.add({
              targets: this.monsterSprite,
              x: this.monsterSprite.x + 50,
              duration: 200,
              yoyo: true,
              ease: 'Power2'
            });
          }
          
          // Show attack line
          const attackLine = this.getUIElement('attackLine') as Phaser.GameObjects.Graphics;
          if (attackLine && 'setAlpha' in attackLine) {
            attackLine.setAlpha(1);
            this.tweens.add({
              targets: attackLine,
              alpha: 0,
              duration: 600,
              ease: 'Power2'
            });
          }
          
          // Hit a random gladiator from the group
          const allGladiators = this.gladiatorGroup.filter(g => g && g.active);
          
          if (allGladiators.length > 0) {
            // Pick random target
            const target = Phaser.Utils.Array.GetRandom(allGladiators);
            
            // Update attack line to point to target
            const attackLine = this.getUIElement('attackLine') as Phaser.GameObjects.Graphics;
            if (attackLine && target) {
              attackLine.clear();
              attackLine.lineStyle(4, 0xff0000, 0.8);
              attackLine.beginPath();
              attackLine.moveTo(this.monsterSprite.x + this.scaleValue(50, this.cameras.main.width), this.monsterSprite.y);
              attackLine.lineTo(target.x, target.y);
              attackLine.strokePath();
            }
            
            // Flash red on hit
            this.tweens.add({
              targets: target,
              fillColor: 0xff0000,
              duration: 200,
              yoyo: true,
              onComplete: () => {
                target.setFillStyle(0x8b7355);
              }
            });
            
            // Create impact particles
            const particles = this.add.particles(target.x, target.y, 'spark-placeholder', {
              lifespan: 500,
              speed: { min: 100, max: 200 },
              scale: { start: 0.5, end: 0 },
              blendMode: 'ADD',
              tint: [0xff0000, 0xff6600, 0xffaa00],
              quantity: 10
            });
            
            this.time.delayedCall(600, () => {
              particles.destroy();
            });
            
            // Each gladiator has a chance to die when hit
            if (Phaser.Math.Between(1, 2) === 1) { // 50% chance to die
              this.killSupportingGladiator(target);
              
              // Check if we need to spawn new gladiators
              this.checkAndSpawnGladiators();
            }
          }
        }
      },
      loop: true
    });
    
    // Add separate roar animation with screen shake
    this.time.addEvent({
      delay: 9000, // Roar every 9 seconds (avoids sync with 4s attacks)
      callback: () => {
        if (this.monsterSprite && this.monsterSprite.active) {
          const spriteKey = this.monsterSprite.texture.key;
          
          // Play roar animation
          if (this.anims.exists(`${spriteKey}_roar`)) {
            this.monsterSprite.play(`${spriteKey}_roar`);
            
            // Enhanced screen shake for roar - more intense
            this.cameras.main.shake(800, 0.02);
            
            // Play roar sound if available
            if (this.sound.get('monster_roar')) {
              this.sound.play('monster_roar', { volume: 0.7 });
            }
            
            this.monsterSprite.once('animationcomplete', () => {
              this.monsterSprite.play(`${spriteKey}_idle`);
            });
          } else {
            // Fallback roar effect - scale up with screen shake
            this.tweens.add({
              targets: this.monsterSprite,
              scaleX: this.monsterSprite.scaleX * 1.4,
              scaleY: this.monsterSprite.scaleY * 1.4,
              duration: 600,
              yoyo: true,
              ease: 'Power2'
            });
            
            // Enhanced screen shake for fallback roar - more intense
            this.cameras.main.shake(800, 0.02);
          }
        }
      },
      loop: true
    });
  }
  
  private createDefeatedGladiators(width: number, height: number) {
    const { centerX, centerY } = this.cameras.main;
    
    // Create gladiator group spread out like scattered dots
    const gladiatorCount = 15; // Fixed at 15 gladiators
    const centerOffsetX = this.scaleValue(100, width); // Shift group to the right
    const spreadX = this.scaleValue(300, width); // Horizontal spread
    const spreadY = this.scaleValue(250, height); // Vertical spread
    const minDistance = this.scaleValue(60, width); // Original spacing that worked
    
    const positions: { x: number, y: number, angle: number, radius: number }[] = [];
    
    for (let i = 0; i < gladiatorCount; i++) {
      let validPosition = false;
      let attempts = 0;
      let gladX = 0, gladY = 0, angle = 0, radius = 0;
      
      // Try to find a position that's not too close to existing gladiators
      while (!validPosition && attempts < 100) {
        // Random angle for each gladiator, avoiding left side (monster side)
        const angle = Phaser.Math.Between(-90, 90);
        const radian = (angle * Math.PI) / 180;
        
        // Random distance from center
        const radius = Phaser.Math.Between(this.scaleValue(120, width), this.scaleValue(200, width));
        
        gladX = centerX + radius * Math.cos(radian) + Phaser.Math.Between(-20, 20);
        gladY = centerY + radius * Math.sin(radian) + Phaser.Math.Between(-20, 20);
        
        // Skip if too far left (monster side)
        if (gladX < centerX - this.scaleValue(50, width)) {
          attempts++;
          continue;
        }
        
        // Check distance from other gladiators
        validPosition = true;
        for (const pos of positions) {
          const distance = Phaser.Math.Distance.Between(gladX, gladY, pos.x, pos.y);
          // Simple distance check
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
        attempts++;
      }
      
      // Only create gladiator if we found a valid position
      if (!validPosition) {
        console.warn('Could not find position for gladiator', i);
        continue;
      }
      
      positions.push({ x: gladX, y: gladY, angle: 0, radius: 0 });
      
      const boxSize = this.scaleValue(25, width); // Slightly smaller
      const gladiator = this.add.rectangle(gladX, gladY, boxSize, boxSize);
      
      // Store the actual box size for collision detection
      gladiator.setData('boxSize', boxSize);
      
      // All gladiators same bronze color since no center focus
      gladiator.setFillStyle(0x8b7355);
      gladiator.setStrokeStyle(2, 0xcd853f);
      gladiator.setAlpha(0.9);
      gladiator.setDepth(3);
      
      // Store original position for repositioning
      gladiator.setData('originalX', gladX - centerX);
      gladiator.setData('originalY', gladY - centerY);
      
      this.gladiatorGroup.push(gladiator);
      this.registerUIElement(`gladiatorGroup${i}`, gladiator);
    }
    
    // No center gladiator anymore since attacks are random
    
    // Create attack effect line
    const attackLine = this.add.graphics();
    attackLine.setAlpha(0);
    attackLine.setDepth(5);
    this.registerUIElement('attackLine', attackLine);
    
    // Start spear throwing animation
    this.startSpearThrowing();
    
    // Initial check for gladiator count
    this.checkAndSpawnGladiators();
    
    // No health tracking needed for random attacks
  }

  private setupFightButtonListener() {
    // Listen for fight button clicks from HTML overlay
    const handleFightClick = (event: CustomEvent) => {
      console.log('Fight button clicked from HTML overlay', event.detail);
      // Don't start combat immediately - payment will be handled first
      // Store pending combat data
      if (this.colosseumState?.currentMonster) {
        const combatId = `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.registry.set('pendingCombat', {
          monster: this.colosseumState.currentMonster,
          combatId: combatId,
          walletAddress: this.walletAddress
        });
        console.log('Combat pending payment:', combatId);
      }
    };
    
    // Listen for successful payment confirmation
    const handleCombatStarted = (event: CustomEvent) => {
      console.log('Payment successful, starting combat', event.detail);
      const pendingCombat = this.registry.get('pendingCombat');
      if (pendingCombat && pendingCombat.monster) {
        // Clear pending combat
        this.registry.remove('pendingCombat');
        
        // Start combat with the stored monster data
        this.scene.start('CombatScene', {
          monster: pendingCombat.monster,
          combatId: pendingCombat.combatId,
          walletAddress: pendingCombat.walletAddress
        });
      }
    };
    
    // Listen for payment errors
    const handleCombatError = (event: CustomEvent) => {
      console.error('Payment failed:', event.detail.error);
      // Clear pending combat on error
      this.registry.remove('pendingCombat');
      // Could show error message in UI
    };
    
    // Listen for dev monster selection
    const handleMonsterSelect = (event: CustomEvent) => {
      this.selectedMonster = event.detail.monster;
      console.log('Dev: Selected monster:', this.selectedMonster);
      // Reload state with new monster
      this.loadGameState();
    };

    window.addEventListener('fightButtonClicked', handleFightClick as EventListener);
    window.addEventListener('combatStarted', handleCombatStarted as EventListener);
    window.addEventListener('combatError', handleCombatError as EventListener);
    window.addEventListener('devMonsterSelect', handleMonsterSelect as EventListener);
    
    // Clean up listener when scene is destroyed
    this.events.once('shutdown', () => {
      window.removeEventListener('fightButtonClicked', handleFightClick as EventListener);
      window.removeEventListener('combatStarted', handleCombatStarted as EventListener);
      window.removeEventListener('combatError', handleCombatError as EventListener);
      window.removeEventListener('devMonsterSelect', handleMonsterSelect as EventListener);
    });
  }

  private async loadGameState() {
    try {
      // Call real backend API
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${backendUrl}/state`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      this.colosseumState = await response.json();
      
      // Update UI via events to HTML overlay
      this.updateGameStateForUI();
      this.updateMonsterDisplay();
      
    } catch (error) {
      console.error('Failed to load game state:', error);
      // Show offline state or retry
      this.showOfflineState();
    }
  }

  private updateGameStateForUI() {
    if (!this.colosseumState) return;

    console.log('ColosseumScene raw state:', this.colosseumState);
    const jackpotValue = this.colosseumState.currentJackpot || 0;
    console.log('Sending jackpot value:', jackpotValue);

    // Emit event with game state for HTML UI
    window.dispatchEvent(new CustomEvent('gameStateUpdate', {
      detail: {
        jackpot: jackpotValue,
        monsterName: this.colosseumState.currentMonster?.type || 'SKELETON WARRIOR',
        recentCombats: this.colosseumState.recentCombats || [],
        playerStats: {
          combats: 0, // TODO: Get from player state
          victories: 0,
          vaultsCracked: 0,
          totalWinnings: 0
        }
      }
    }));
  }

  private updateMonsterDisplay() {
    if (!this.colosseumState?.currentMonster) return;

    const monster = this.colosseumState.currentMonster;
    
    // Update monster sprite using tier's sprite key
    const spriteKey = monster.tier.sprite;
    if (this.textures.exists(spriteKey)) {
      this.monsterSprite.setTexture(spriteKey);
      
      // Set appropriate tint based on monster type
      const tints: Record<string, number> = {
        'skeleton-placeholder': 0xff4444,  // Red
        'goblin-placeholder': 0x44ff44,    // Green
        'orc-placeholder': 0xff8844,       // Orange
        'minotaur-placeholder': 0x8844ff,  // Purple
        'cyclops-placeholder': 0x880000    // Dark Red
      };
      this.monsterSprite.setTint(tints[spriteKey] || 0xff4444);
      
      // Scale based on difficulty
      const scales: Record<string, number> = {
        'skeleton-placeholder': 2.5,
        'goblin-placeholder': 2.5,
        'orc-placeholder': 3.0,
        'minotaur-placeholder': 3.5,
        'cyclops-placeholder': 4.0
      };
      this.monsterSprite.setScale(scales[spriteKey] || 2.5);
    }
    
    // Ensure monster faces left towards gladiator
    this.monsterSprite.setFlipX(true);

    // Emit monster position for HTML label
    this.emitSpritePositions();
  }

  private emitSpritePositions() {
    // Emit monster position for HTML overlay
    if (this.monsterSprite) {
      window.dispatchEvent(new CustomEvent('monsterPositionUpdate', {
        detail: {
          x: this.monsterSprite.x,
          y: this.monsterSprite.y
        }
      }));
    }

    // Emit gladiator group center position
    window.dispatchEvent(new CustomEvent('gladiatorPositionUpdate', {
      detail: {
        x: this.getRelativePosition(0.6, this.cameras.main.width),
        y: this.getRelativePosition(0.5, this.cameras.main.height)
      }
    }));
  }

  private async startCombat() {
    console.log('Starting combat...', this.colosseumState);
    
    if (!this.colosseumState?.currentMonster) {
      console.error('No monster data available');
      return;
    }

    try {
      // This method is no longer used - combat starts after payment confirmation
      console.warn('startCombat called directly - this should not happen');
    } catch (error) {
      console.error('Failed to start combat:', error);
    }
  }

  private showOfflineState() {
    // Emit offline state to HTML UI
    window.dispatchEvent(new CustomEvent('gameOffline'));
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
    }
  }

  private handleSceneWake() {
    console.log('Scene waking up');
    // Scene is waking up from sleep - reload game state
    this.loadGameState();
  }
  
  private handleSceneResume() {
    console.log('Scene resuming');
    // Scene is resuming - reload game state
    this.loadGameState();
  }

  destroy() {
    if (this.updateTimer) {
      this.updateTimer.destroy();
    }
    
    if (this.spearTimer) {
      this.spearTimer.destroy();
    }
    
    // Clean up event listeners
    this.events.off('wake', this.handleSceneWake, this);
    this.events.off('resume', this.handleSceneResume, this);
    
    // Clean up scene resources - Phaser handles scene cleanup automatically
  }

  protected repositionUI(width: number, height: number) {
    // Update background
    if (this.bgImage) {
      this.bgImage.setPosition(this.centerX(width), this.centerY(height));
      this.bgImage.setDisplaySize(width, height);
    }

    // Reposition game elements
    this.positionMonsterDisplay(width, height);
    
    // Emit new positions for HTML overlay
    this.emitSpritePositions();
  }

  private positionMonsterDisplay(width: number, height: number) {
    if (!this.monsterSprite) return;
    
    // Monster positioned left side - more centered vertically
    const monsterX = this.getRelativePosition(0.22, width);
    const monsterY = this.getRelativePosition(0.48, height);

    // Position monster sprite - LARGER and more prominent
    this.monsterSprite.setPosition(monsterX, monsterY);
    this.monsterSprite.setScale(this.scaleValue(5, width)); // Increased from 3.5 to 5
    this.monsterSprite.setDepth(5);
    
    // Position shadow under monster - larger shadow
    const monsterShadow = this.getUIElement('monsterShadow') as Phaser.GameObjects.Ellipse;
    if (monsterShadow && 'setPosition' in monsterShadow) {
      monsterShadow.setPosition(monsterX, monsterY + this.scaleValue(100, height));
      if ('setScale' in monsterShadow) monsterShadow.setScale(1.5, 0.5);
      if ('setAlpha' in monsterShadow) monsterShadow.setAlpha(0.6);
    }
    
    // Position aura around monster
    const auraGlow = this.getUIElement('auraGlow') as Phaser.GameObjects.Graphics;
    if (auraGlow && 'setPosition' in auraGlow) {
      auraGlow.setPosition(monsterX, monsterY);
    }

    // No center gladiator to position anymore
    
    // Reposition gladiator group maintaining their scattered positions
    const centerX = this.getRelativePosition(0.5, width);
    const centerY = this.getRelativePosition(0.5, height);
    
    // Reposition both active and incoming gladiators
    const allGladiators = [...this.gladiatorGroup, ...this.incomingGladiators];
    allGladiators.forEach((glad) => {
      if (glad && glad.active) {
        const offsetX = glad.getData('originalX');
        const offsetY = glad.getData('originalY');
        
        if (offsetX !== undefined && offsetY !== undefined) {
          // Only reposition if not currently animating
          if (!this.tweens.isTweening(glad)) {
            glad.setPosition(
              centerX + offsetX,
              centerY + offsetY
            );
          }
        }
      }
    });
    
    // Attack line is drawn dynamically during attacks
  }
}