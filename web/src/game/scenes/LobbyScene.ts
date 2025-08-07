// Main Lobby Scene - core gameplay hub with HTML UI overlay
import { BaseScene } from './BaseScene';
import { ColosseumState, Monster, CombatSummary } from '../../types';

export class LobbyScene extends BaseScene {
  private walletAddress!: string;
  private colosseumState!: ColosseumState;
  private monsterSprite!: Phaser.GameObjects.Sprite;
  private updateTimer!: Phaser.Time.TimerEvent;
  private bgImage!: Phaser.GameObjects.Image;
  
  preload() {
    // Everything should be loaded from PreloadScene
    // Just verify orc texture exists
    console.log('LobbyScene preload - orc exists?', this.textures.exists('orc_idle'));
  }
  private gladiatorGroup: Phaser.GameObjects.Sprite[] = [];
  private spearTimer?: Phaser.Time.TimerEvent;
  private minGladiators: number = 15; // Fixed at 15 gladiators
  private incomingGladiators: Phaser.GameObjects.Sprite[] = []; // Track walking gladiators
  private currentGladiator?: Phaser.GameObjects.Sprite; // Center gladiator
  private gladiatorHealth: number = 2; // Health for center gladiator

  constructor() {
    super({ key: 'LobbyScene' });
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
    
    // Create gladiator sprite at entry point
    const gladiator = this.add.sprite(entry.x, entry.y, 'soldier_idle', 0);
    gladiator.setOrigin(0.5, 0.5);
    gladiator.setScale(2.0);
    gladiator.setFlipX(false); // Don't flip - face right toward monster
    gladiator.setAlpha(0);
    gladiator.setDepth(3);
    
    // Add color tint variation
    const colorVariation = Phaser.Math.Between(0, 2);
    const tints = [0xffffff, 0xffdddd, 0xddffdd];
    gladiator.setTint(tints[colorVariation]);
    
    // Play idle animation
    gladiator.play('soldier_idle');
    
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
      onStart: () => {
        // Play walking animation
        gladiator.play('soldier_walk');
      },
      onComplete: () => {
        // Remove from incoming list
        const index = this.incomingGladiators.indexOf(gladiator);
        if (index > -1) {
          this.incomingGladiators.splice(index, 1);
        }
        
        // Add to main group
        this.gladiatorGroup.push(gladiator);
        
        // Return to idle animation
        gladiator.play('soldier_idle');
        
        // Mark as not moving (ready to attack)
        gladiator.setData('isMoving', false);
      }
    });
  }
  
  private killSupportingGladiator(gladiator: Phaser.GameObjects.Sprite) {
    // Remove from group
    const index = this.gladiatorGroup.indexOf(gladiator);
    if (index > -1) {
      this.gladiatorGroup.splice(index, 1);
    }
    
    // Play death animation
    gladiator.play('soldier_death');
    
    // Death animation - fade and fall after death animation plays
    gladiator.once('animationcomplete', () => {
      this.tweens.add({
        targets: gladiator,
        alpha: 0,
        y: gladiator.y + 30,
        scaleX: 0.7,
        scaleY: 0.7,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          gladiator.destroy();
          
          // Don't spawn immediately - let checkAndSpawnGladiators handle it
        }
      });
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
      angle = Phaser.Math.Between(90, 270);
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
    
    // Create gladiator sprite at entry point
    const gladiator = this.add.sprite(entry.x, entry.y, 'soldier_idle', 0);
    gladiator.setOrigin(0.5, 0.5);
    gladiator.setScale(2.0);
    gladiator.setFlipX(false); // Don't flip - face right toward monster
    gladiator.setAlpha(0);
    gladiator.setDepth(3);
    
    // Add color tint variation
    const colorVariation = Phaser.Math.Between(0, 2);
    const tints = [0xffffff, 0xffdddd, 0xddffdd];
    gladiator.setTint(tints[colorVariation]);
    
    // Play idle animation
    gladiator.play('soldier_idle');
    
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
    
    // Play death animation
    this.currentGladiator.play('soldier_death');
    
    // Death animation - fade and fall after death animation plays
    this.currentGladiator.once('animationcomplete', () => {
      this.tweens.add({
        targets: this.currentGladiator,
        alpha: 0,
        y: this.currentGladiator.y + 50,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 600,
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
    
    // Create new current gladiator sprite at entry point
    this.currentGladiator = this.add.sprite(entryPoint.x, entryPoint.y, 'soldier_idle', 0);
    this.currentGladiator.setOrigin(0.5, 0.5);
    this.currentGladiator.setScale(2.5);
    this.currentGladiator.setFlipX(true); // Flip to face correct direction
    this.currentGladiator.setAlpha(0);
    this.currentGladiator.setDepth(4);
    this.currentGladiator.setTint(0xff8888); // Red tint for current gladiator
    
    // Start with idle animation
    this.currentGladiator.play('soldier_idle');
    
    // Mark as moving since they're walking to center
    this.currentGladiator.setData('isMoving', true);
    
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
      onStart: () => {
        // Play walking animation
        if (this.currentGladiator) {
          this.currentGladiator.play('soldier_walk');
        }
      },
      onComplete: () => {
        // Return to idle animation
        if (this.currentGladiator) {
          this.currentGladiator.play('soldier_idle');
          // Mark as not moving (ready to be attacked)
          this.currentGladiator.setData('isMoving', false);
        }
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
        // Filter out gladiators that are still moving
        const availableGladiators = this.gladiatorGroup.filter(g => 
          g && g.active && !g.getData('isMoving')
        );
        
        // If not enough gladiators are ready, skip this attack round
        if (availableGladiators.length < 2) return;
        
        // Randomly select 2-3 gladiators to throw arrows
        const throwers = Phaser.Utils.Array.Shuffle([...availableGladiators]).slice(0, Phaser.Math.Between(2, Math.min(3, availableGladiators.length)));
        
        throwers.forEach((gladiator, i) => {
          if (!gladiator || !gladiator.active) return;
          
          // Use static frames for attack instead of animation to avoid movement
          if (gladiator && gladiator.active) {
            // Store original position and check facing
            const originalX = gladiator.x;
            const isFacingBackwards = gladiator.flipX === true; // True means facing left (backwards from target)
            
            // Only animate and shoot if facing forward (toward monster)
            if (!isFacingBackwards) {
              // Switch to attack03 texture and set to bow drawn frame
              gladiator.setTexture('soldier_attack03');
              gladiator.setFrame(3); // Start at frame 3 (beginning of draw)
              gladiator.x = originalX + 4; // Small forward adjustment to counter backward lean
              
              // Progress through animation frames
              this.time.delayedCall(100, () => {
                if (gladiator && gladiator.active) {
                  gladiator.setFrame(4); // Drawing bow
                }
              });
              
              this.time.delayedCall(200, () => {
                if (gladiator && gladiator.active) {
                  gladiator.setFrame(5); // Bow fully drawn
                }
              });
              
              // Release arrow at frame 6
              this.time.delayedCall(300, () => {
                if (gladiator && gladiator.active) {
                  gladiator.setFrame(6); // Arrow release
                  
                  // Create arrow sprite at release
                  const arrow = this.add.sprite(
                    gladiator.x + 10, // Slightly forward from gladiator
                    gladiator.y - 10, // Start at bow height
                    'soldier_arrow'
                  );
                  
                  arrow.setScale(0.8); // Larger arrow for better visibility
                  arrow.setDepth(2);
                  
                  // Calculate angle to monster and rotate arrow
                  const angle = Phaser.Math.Angle.Between(
                    gladiator.x, gladiator.y,
                    this.monsterSprite.x, this.monsterSprite.y
                  );
                  arrow.setRotation(angle);
                  
                  // Animate arrow flying toward monster - faster than spear
                  this.tweens.add({
                    targets: arrow,
                    x: this.monsterSprite.x + Phaser.Math.Between(-30, 30),
                    y: this.monsterSprite.y + Phaser.Math.Between(-30, 30),
                    duration: 600, // Faster for arrow
                    ease: 'Cubic.easeOut',
                    onComplete: () => {
                  // Create small impact effect
                  this.tweens.add({
                    targets: arrow,
                    alpha: 0,
                    scaleX: 0.5,
                    scaleY: 0.5,
                    duration: 300,
                    onComplete: () => arrow.destroy()
                  });
              
              // Play hurt animation and effect
              if (this.monsterSprite) {
                // Play hurt animation
                const monsterName = this.colosseumState.currentMonster?.tier.name.toLowerCase() || '';
                let spriteKey = 'orc';
                
                if (monsterName.includes('werebear')) spriteKey = 'werebear';
                else if (monsterName.includes('werewolf')) spriteKey = 'werewolf';
                else if (monsterName.includes('orc rider')) spriteKey = 'orc_rider';
                else if (monsterName.includes('elite orc')) spriteKey = 'elite_orc';
                else if (monsterName.includes('armored orc')) spriteKey = 'armored_orc';
                else if (monsterName.includes('orc')) spriteKey = 'orc';
                
                const hurtKey = `${spriteKey}_hurt`;
                if (this.anims.exists(hurtKey)) {
                  // Only play hurt if not already playing it
                  if (!this.monsterSprite.anims.isPlaying || this.monsterSprite.anims.currentAnim?.key !== hurtKey) {
                    this.monsterSprite.play(hurtKey);
                    
                    // Return to idle after hurt animation
                    this.monsterSprite.once('animationcomplete', () => {
                      const idleKey = `${spriteKey}_idle`;
                      if (this.anims.exists(idleKey)) {
                        this.monsterSprite.play(idleKey);
                      }
                    });
                  }
                }
                
                // Flash red tint
                this.monsterSprite.setTint(0xff0000);
                this.time.delayedCall(200, () => {
                  this.monsterSprite.clearTint();
                });
              }
            }
          });
              
              // Add slight arc to arrow trajectory
              this.tweens.add({
                targets: arrow,
                y: arrow.y - 15,
                duration: 400,
                yoyo: true,
                ease: 'Sine.easeOut'
              });
                }
              });
              
              // Return to idle after attack completes
              this.time.delayedCall(500, () => {
                if (gladiator && gladiator.active) {
                  // Return to idle texture and frame
                  gladiator.setTexture('soldier_idle');
                  gladiator.setFrame(0);
                  gladiator.x = originalX; // Restore original position
                }
              });
            } else {
              // Facing backwards - shoot arrow that misses
              gladiator.setTexture('soldier_attack03');
              gladiator.setFrame(6); // Just show release frame
              
              // Create arrow that shoots backwards/sideways and misses
              const arrow = this.add.sprite(
                gladiator.x - 10, // Behind gladiator
                gladiator.y - 10,
                'soldier_arrow'
              );
              
              arrow.setScale(0.8); // Larger arrow for better visibility
              arrow.setDepth(2);
              arrow.setRotation(Math.PI); // Point backwards
              
              // Arrow flies backwards and disappears
              this.tweens.add({
                targets: arrow,
                x: gladiator.x - 200, // Fly backwards
                y: gladiator.y + Phaser.Math.Between(-50, 50),
                duration: 600,
                ease: 'Cubic.easeOut',
                onComplete: () => arrow.destroy()
              });
              
              // Return to idle quickly since attack failed
              this.time.delayedCall(300, () => {
                if (gladiator && gladiator.active) {
                  gladiator.setTexture('soldier_idle');
                  gladiator.setFrame(0);
                }
              });
            }
          }
        });
      },
      loop: true
    });
  }

  init(data: { walletAddress?: string; preloadedState?: any }) {
    this.walletAddress = data?.walletAddress || 'test-wallet';
    // If we have preloaded state, use it immediately
    if (data?.preloadedState) {
      this.colosseumState = data.preloadedState;
      console.log('Using preloaded game state:', this.colosseumState);
    }
  }

  protected createScene() {
    const { width, height } = this.cameras.main;

    // Emit scene change event
    window.dispatchEvent(new CustomEvent('sceneChanged', { 
      detail: { sceneName: 'LobbyScene' } 
    }));

    // Clean up any existing timers
    if (this.updateTimer) {
      this.updateTimer.destroy();
    }
    
    // Listen for scene events
    this.events.on('wake', this.handleSceneWake, this);
    this.events.on('resume', this.handleSceneResume, this);
    
    // Background - dark base layer to prevent white gaps
    const bgRect = this.add.rectangle(width/2, height/2, width * 1.2, height * 1.2, 0x0a0a0a);
    bgRect.setDepth(-1);
    this.registerUIElement('bgRect', bgRect);
    
    // Load the colosseum background image
    this.bgImage = this.add.image(width * 0.5, height * 0.5, 'colosseum-bg');
    
    // Calculate aspect ratio to cover the screen properly with extra margin
    const scaleX = (width * 1.1) / this.bgImage.width;
    const scaleY = (height * 1.1) / this.bgImage.height;
    const scale = Math.max(scaleX, scaleY); // Use max to ensure it covers the entire screen
    
    this.bgImage.setScale(scale);
    this.bgImage.setAlpha(0.35); // Much more transparent to focus on sprites
    this.bgImage.setDepth(0); // Ensure it's behind everything
    
    // Add a subtle dark overlay to further dim the background
    const overlay = this.add.rectangle(width/2, height/2, width * 1.2, height * 1.2, 0x000000);
    overlay.setAlpha(0.3);
    overlay.setDepth(1);
    this.registerUIElement('overlay', overlay);
    
    this.registerUIElement('bg', this.bgImage);

    // Create game elements only (UI is handled by HTML overlay)
    // Delay monster display creation to ensure textures are loaded
    this.time.delayedCall(100, () => {
      this.createMonsterDisplay();
    });
    this.setupFightButtonListener();

    // If we have preloaded state, emit it immediately
    if (this.colosseumState) {
      // Store current monster type for combat scene
      if (this.colosseumState.currentMonster?.tier?.name) {
        window.localStorage.setItem('currentMonsterType', this.colosseumState.currentMonster.tier.name);
      }
      
      // Emit the preloaded state to update UI
      // Send properly formatted game state to UI
      this.updateGameStateForUI();
      
      // Update monster display with preloaded data
      if (this.colosseumState.currentMonster) {
        this.updateMonsterDisplay();
      }
    } else {
      // Fallback: Load initial game state if not preloaded
      this.time.delayedCall(100, () => {
        this.loadGameState();
      });
    }

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
    const monster = this.colosseumState?.currentMonster;

    if (monster) {
      // Determine actual sprite based on monster name
      const monsterName = monster.tier.name.toLowerCase();
      let actualSpriteKey: string | null = null;
      
      if (monsterName.includes('werebear')) {
        actualSpriteKey = 'werebear';
      } else if (monsterName.includes('werewolf')) {
        actualSpriteKey = 'werewolf';
      } else if (monsterName.includes('orc rider')) {
        actualSpriteKey = 'orc_rider';
      } else if (monsterName.includes('elite orc')) {
        actualSpriteKey = 'elite_orc';
      } else if (monsterName.includes('armored orc')) {
        actualSpriteKey = 'armored_orc';
      } else if (monsterName.includes('orc')) {
        actualSpriteKey = 'orc';
      }
      
      // Debug logging
      console.log('Monster name:', monsterName);
      console.log('Actual sprite key:', actualSpriteKey);
      console.log('Texture exists in scene?', actualSpriteKey ? this.textures.exists(actualSpriteKey) : false);
      console.log('Available textures:', this.textures.getTextureKeys());
      
      // Create monster with Orc sprite
      if (actualSpriteKey) {
        // Position monster to the left, further from soldiers
        const monsterX = this.getRelativePosition(0.80, width);  // Further right
        const monsterY = this.getRelativePosition(0.45, height);
        
        // Create the monster sprite using the correct texture
        const idleTexture = `${actualSpriteKey}_idle`;
        this.monsterSprite = this.add.sprite(monsterX, monsterY, idleTexture, 0);
        this.monsterSprite.setFlipX(true); // Flip to face left toward soldiers
        
        // Scale based on monster tier - 2-3x bigger for better visibility without blur
        const scales: Record<string, number> = {
          'orc': 8.0,
          'armored_orc': 8.5,
          'elite_orc': 9.0,
          'orc_rider': 10.0,
          'werewolf': 11.0,
          'werebear': 12.0
        };
        
        this.monsterSprite.setScale(this.scaleValue(scales[actualSpriteKey] || 6.0, width));
        this.monsterSprite.setOrigin(0.5, 0.5);
        this.monsterSprite.setDepth(5);
        
        // Start with idle animation
        const idleKey = `${actualSpriteKey}_idle`;
        if (this.anims.exists(idleKey)) {
          try {
            const anim = this.anims.get(idleKey);
            if (anim && anim.frames && anim.frames.length > 0) {
              this.monsterSprite.play(idleKey);
            }
          } catch (e) {
            console.warn(`Could not play animation ${idleKey}:`, e);
          }
        }
        
        this.registerUIElement('monsterSprite', this.monsterSprite);
      }
    }
    // else: No monster data - don't create anything
    
    // Removed shadow and aura effects completely

    // Create small gladiator indicators
    this.createDefeatedGladiators(width, height);
    
    // Position elements
    this.positionMonsterDisplay(width, height);
    
    // Emit initial positions for HTML overlay
    this.time.delayedCall(100, () => {
      this.emitSpritePositions();
    });
    
    // Re-emit after a longer delay to ensure positioning is complete
    this.time.delayedCall(500, () => {
      this.emitSpritePositions();
    });
    
    // Add periodic attack animation
    this.time.addEvent({
      delay: 4000, // Attack every 4 seconds
      loop: true,
      callback: () => {
        if (this.monsterSprite && this.monsterSprite.active) {
          // Play random attack animation (Attack01 or Attack02)
          const monsterName = this.colosseumState.currentMonster?.tier.name.toLowerCase() || '';
          let spriteKey = 'orc';
          
          if (monsterName.includes('werebear')) spriteKey = 'werebear';
          else if (monsterName.includes('werewolf')) spriteKey = 'werewolf';
          else if (monsterName.includes('orc rider')) spriteKey = 'orc_rider';
          else if (monsterName.includes('elite orc')) spriteKey = 'elite_orc';
          else if (monsterName.includes('armored orc')) spriteKey = 'armored_orc';
          else if (monsterName.includes('orc')) spriteKey = 'orc';
          
          // Randomly choose between attack01 and attack02
          const attackAnim = Phaser.Math.Between(1, 2) === 1 ? 
            `${spriteKey}_attack01` : `${spriteKey}_attack02`;
          
          if (this.anims.exists(attackAnim)) {
            // Only play if not already playing an animation
            if (!this.monsterSprite.anims.isPlaying || this.monsterSprite.anims.currentAnim?.key === `${spriteKey}_idle`) {
              console.log('Monster attack triggered, current position:', this.monsterSprite.x);
              this.monsterSprite.play(attackAnim);
              
              // Return to idle after attack animation
              this.monsterSprite.once('animationcomplete', () => {
                const idleKey = `${spriteKey}_idle`;
                if (this.anims.exists(idleKey)) {
                  this.monsterSprite.play(idleKey);
                }
              });
              
              // Add lunge animation for visual effect
              const originalX = this.monsterSprite.x;
              this.tweens.add({
                targets: this.monsterSprite,
                x: originalX - 30,  // Lunge left toward soldiers
                duration: 300,
                yoyo: true,
                ease: 'Power2',
                onComplete: () => {
                  // Ensure sprite returns to exact original position
                  this.monsterSprite.x = originalX;
                }
              });
              
              // ONLY show attack indicators when animation actually plays
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
                const attackLineTarget = this.getUIElement('attackLine') as Phaser.GameObjects.Graphics;
                if (attackLineTarget && target) {
                  attackLineTarget.clear();
                  attackLineTarget.lineStyle(4, 0xff0000, 0.8);
                  attackLineTarget.beginPath();
                  attackLineTarget.moveTo(this.monsterSprite.x + this.scaleValue(50, this.cameras.main.width), this.monsterSprite.y);
                  attackLineTarget.lineTo(target.x, target.y);
                  attackLineTarget.strokePath();
                }
                
                // Flash red on hit - delay to sync with animation
                this.time.delayedCall(150, () => {
                  // Flash red tint on hit and play hurt animation
                  if (target && target.play) {
                    // Play hurt animation
                    target.play('soldier_hurt');
                    
                    // Flash red tint
                    target.setTint(0xff0000);
                    this.time.delayedCall(200, () => {
                      // Return to original tint
                      target.clearTint();
                    });
                  }
                  
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
                });
              }
            }
          }
        }
      }
    });
    
    // Add separate roar animation with screen shake
    this.time.addEvent({
      delay: 9000, // Roar every 9 seconds (avoids sync with 4s attacks)
      loop: true,
      callback: () => {
        if (this.monsterSprite && this.monsterSprite.active) {
          // Roar effect - scale up with screen shake (smaller multiplier for huge sprite)
          this.tweens.add({
            targets: this.monsterSprite,
            scaleX: this.monsterSprite.scaleX * 1.1,  // Reduced from 1.4 for huge sprite
            scaleY: this.monsterSprite.scaleY * 1.1,
            duration: 600,
            yoyo: true,
            ease: 'Power2'
          });
          
          // Enhanced screen shake for roar
          this.cameras.main.shake(800, 0.02);
          
          // Play roar sound if available
          if (this.sound.get('monster_roar')) {
            this.sound.play('monster_roar', { volume: 0.7 });
          }
        }
      }
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
        // Random angle for each gladiator, on left side facing right (toward monster)
        const angle = Phaser.Math.Between(90, 270);
        const radian = (angle * Math.PI) / 180;
        
        // Random distance from center
        const radius = Phaser.Math.Between(this.scaleValue(120, width), this.scaleValue(200, width));
        
        gladX = centerX + radius * Math.cos(radian) + Phaser.Math.Between(-20, 20);
        gladY = centerY + radius * Math.sin(radian) + Phaser.Math.Between(-20, 20);
        
        // Skip if too far right (monster side now)
        if (gladX > centerX + this.scaleValue(50, width)) {
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
      
      // Create gladiator sprite
      const gladiator = this.add.sprite(gladX, gladY, 'soldier_idle', 0);
      gladiator.setOrigin(0.5, 0.5);
      gladiator.setScale(2.0);
      gladiator.setFlipX(false); // Don't flip - face right toward monster
      gladiator.setAlpha(0.9);
      gladiator.setDepth(3);
      
      // Add color tint variation
      const colorVariation = Phaser.Math.Between(0, 2);
      const tints = [0xffffff, 0xffdddd, 0xddffdd];
      gladiator.setTint(tints[colorVariation]);
      
      // Play idle animation
      gladiator.play('soldier_idle');
      
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
    
    window.addEventListener('fightButtonClicked', handleFightClick as EventListener);
    window.addEventListener('combatStarted', handleCombatStarted as EventListener);
    window.addEventListener('combatError', handleCombatError as EventListener);
    
    // Clean up listener when scene is destroyed
    this.events.once('shutdown', () => {
      window.removeEventListener('fightButtonClicked', handleFightClick as EventListener);
      window.removeEventListener('combatStarted', handleCombatStarted as EventListener);
      window.removeEventListener('combatError', handleCombatError as EventListener);
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
      
      const stateData = await response.json();
      console.log('Raw API response:', stateData);
      console.log('currentPot in response:', stateData.currentPot);
      this.colosseumState = stateData;
      console.log('After assignment - currentPot:', (this.colosseumState as any)['currentPot']);
      
      // Store current monster type for combat scene
      if (this.colosseumState.currentMonster?.tier?.name) {
        window.localStorage.setItem('currentMonsterType', this.colosseumState.currentMonster.tier.name);
      }
      
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

    console.log('LobbyScene raw state:', this.colosseumState);
    // Use bracket notation to access currentPot from backend without TypeScript errors
    const jackpotValue = (this.colosseumState as any)['currentPot'] || this.colosseumState.currentJackpot || 0;
    console.log('Sending jackpot value:', jackpotValue);

    // Emit event with game state for HTML UI
    window.dispatchEvent(new CustomEvent('gameStateUpdate', {
      detail: {
        jackpot: jackpotValue,
        monsterName: this.colosseumState.currentMonster?.tier?.name || 'SKELETON WARRIOR',
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
    if (!this.monsterSprite || !this.scene.isActive()) return;

    // Since we now create the correct sprite in createMonsterDisplay,
    // this method only needs to handle updates when the monster changes
    // (e.g., when a new monster is loaded from the backend)
    
    // For now, just emit the position for HTML overlay
    // In the future, if we need to change monsters dynamically,
    // we can destroy and recreate the sprite here

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
    // Update background rect
    const bgRect = this.getUIElement('bgRect');
    if (bgRect && 'setPosition' in bgRect) {
      bgRect.setPosition(this.centerX(width), this.centerY(height));
      if ('setSize' in bgRect) {
        (bgRect as any).setSize(width * 1.2, height * 1.2);
      }
    }
    
    // Update background image
    if (this.bgImage) {
      this.bgImage.setPosition(this.centerX(width), this.centerY(height));
      
      // Recalculate scale to maintain aspect ratio and cover the screen with margin
      const scaleX = (width * 1.1) / this.bgImage.width;
      const scaleY = (height * 1.1) / this.bgImage.height;
      const scale = Math.max(scaleX, scaleY);
      this.bgImage.setScale(scale);
    }
    
    // Update overlay
    const overlay = this.getUIElement('overlay');
    if (overlay && 'setPosition' in overlay) {
      overlay.setPosition(this.centerX(width), this.centerY(height));
      if ('setSize' in overlay) {
        (overlay as any).setSize(width * 1.2, height * 1.2);
      }
    }

    // Reposition game elements
    this.positionMonsterDisplay(width, height);
    
    // Emit new positions for HTML overlay
    this.emitSpritePositions();
  }

  private positionMonsterDisplay(width: number, height: number) {
    if (!this.monsterSprite) return;
    
    // Monster positioned below the text label, centered horizontally
    const monsterX = this.getRelativePosition(0.80, width);
    const monsterY = this.getRelativePosition(0.45, height);

    // Position monster sprite - LARGER and more prominent
    this.monsterSprite.setPosition(monsterX, monsterY);
    // Rectangles don't have texture property, so skip the texture check
    this.monsterSprite.setDepth(5);
    
    // Removed shadow and aura positioning

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