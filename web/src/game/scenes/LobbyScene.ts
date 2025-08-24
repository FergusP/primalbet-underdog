// Main Lobby Scene - core gameplay hub with HTML UI overlay
import { BaseScene } from './BaseScene';
import { ForestArenaState, Monster, CombatSummary } from '../../types';

export class LobbyScene extends BaseScene {
  private walletAddress!: string;
  private forestArenaState!: ForestArenaState;
  private monsterSprite!: Phaser.GameObjects.Sprite;
  private updateTimer!: Phaser.Time.TimerEvent;
  private bgImage!: Phaser.GameObjects.Image;
  
  preload() {
    // Everything should be loaded from PreloadScene
    // Just verify orc texture exists
  }
  private warriorGroup: Phaser.GameObjects.Sprite[] = [];
  private spearTimer?: Phaser.Time.TimerEvent;
  private minWarriors: number = 15; // Fixed at 15 warriors
  private incomingWarriors: Phaser.GameObjects.Sprite[] = []; // Track walking warriors
  private currentWarrior?: Phaser.GameObjects.Sprite; // Center warrior
  private warriorHealth: number = 2; // Health for center warrior

  constructor() {
    super({ key: 'LobbyScene' });
  }
  
  private checkAndSpawnWarriors() {
    // Count active warriors (not including incoming ones)
    const activeWarriors = this.warriorGroup.filter(g => g && g.active).length;
    const totalWarriors = activeWarriors + this.incomingWarriors.length;
    
    // Spawn new warriors if below minimum
    if (totalWarriors < this.minWarriors) {
      const toSpawn = this.minWarriors - totalWarriors;
      
      for (let i = 0; i < toSpawn; i++) {
        // Stagger the spawns
        this.time.delayedCall(i * 800, () => {
          this.spawnWalkingWarrior();
        });
      }
    }
  }
  
  private spawnWalkingWarrior() {
    const { centerX, centerY, width, height } = this.cameras.main;
    
    // Define left platform box (lower platform) - moved more to the left
    const leftPlatform = {
      minX: width * 0.08,  // Moved further left
      maxX: width * 0.30,  // Moved further left
      minY: height * 0.56,
      maxY: height * 0.62
    };
    
    // Soldiers drop from top of the left platform box
    const entryX = Phaser.Math.Between(leftPlatform.minX, leftPlatform.maxX);
    const entry = { x: entryX, y: -50 };
    
    // Find final position within left platform box
    const minDistance = this.scaleValue(50, width); // Spacing between soldiers
    let validPosition = false;
    let attempts = 0;
    let finalX = 0, finalY = 0;
    
    while (!validPosition && attempts < 100) {
      // Random position within the left platform box
      finalX = Phaser.Math.Between(leftPlatform.minX, leftPlatform.maxX);
      finalY = Phaser.Math.Between(leftPlatform.minY, leftPlatform.maxY);
      
      validPosition = true;
      // Check distance from all warriors (existing and incoming)
      const allWarriors = [...this.warriorGroup, ...this.incomingWarriors];
      for (const glad of allWarriors) {
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
    
    // Create warrior sprite at entry point
    const warrior = this.add.sprite(entry.x, entry.y, 'soldier_idle', 0);
    warrior.setOrigin(0.5, 0.5);
    warrior.setScale(2.0);
    warrior.setFlipX(false); // Don't flip - face right toward monster
    warrior.setAlpha(0);
    warrior.setDepth(3);
    
    // Add color tint variation
    const colorVariation = Phaser.Math.Between(0, 2);
    const tints = [0xffffff, 0xffdddd, 0xddffdd];
    warrior.setTint(tints[colorVariation]);
    
    // Play idle animation
    warrior.play('soldier_idle');
    
    // Track as incoming
    this.incomingWarriors.push(warrior);
    
    // Store position data
    warrior.setData('originalX', finalX - centerX);
    warrior.setData('originalY', finalY - centerY);
    
    // Fade in while moving
    this.tweens.add({
      targets: warrior,
      alpha: 0.9,
      duration: 500
    });
    
    // Walk to position
    this.tweens.add({
      targets: warrior,
      x: finalX,
      y: finalY,
      duration: 2500,
      ease: 'Power2',
      onStart: () => {
        // Play walking animation
        warrior.play('soldier_walk');
      },
      onComplete: () => {
        // Remove from incoming list
        const index = this.incomingWarriors.indexOf(warrior);
        if (index > -1) {
          this.incomingWarriors.splice(index, 1);
        }
        
        // Add to main group
        this.warriorGroup.push(warrior);
        
        // Return to idle animation
        warrior.play('soldier_idle');
        
        // Mark as not moving (ready to attack)
        warrior.setData('isMoving', false);
      }
    });
  }
  
  private killSupportingWarrior(warrior: Phaser.GameObjects.Sprite) {
    // Remove from group
    const index = this.warriorGroup.indexOf(warrior);
    if (index > -1) {
      this.warriorGroup.splice(index, 1);
    }
    
    // Play death animation
    warrior.play('soldier_death');
    
    // Death animation - fade and fall after death animation plays
    warrior.once('animationcomplete', () => {
      this.tweens.add({
        targets: warrior,
        alpha: 0,
        y: warrior.y + 30,
        scaleX: 0.7,
        scaleY: 0.7,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          warrior.destroy();
          
          // Don't spawn immediately - let checkAndSpawnWarriors handle it
        }
      });
    });
  }
  
  private addNewSupportingWarrior() {
    const { centerX, centerY, width, height } = this.cameras.main;
    
    // Define left platform box (lower platform) - moved more to the left
    const leftPlatform = {
      minX: width * 0.08,  // Moved further left
      maxX: width * 0.30,  // Moved further left
      minY: height * 0.56,
      maxY: height * 0.62
    };
    
    // Entry from top of left platform box
    const entryX = Phaser.Math.Between(leftPlatform.minX, leftPlatform.maxX);
    const entry = { x: entryX, y: -50 };
    
    // Find final position within left platform box
    const minDistance = this.scaleValue(50, width);
    let validPosition = false;
    let attempts = 0;
    let finalX = 0, finalY = 0;
    
    while (!validPosition && attempts < 50) {
      // Random position within the left platform box
      finalX = Phaser.Math.Between(leftPlatform.minX, leftPlatform.maxX);
      finalY = Phaser.Math.Between(leftPlatform.minY, leftPlatform.maxY);
      
      // Check distance from existing warriors
      validPosition = true;
      for (const glad of this.warriorGroup) {
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
    
    // Create warrior sprite at entry point
    const warrior = this.add.sprite(entry.x, entry.y, 'soldier_idle', 0);
    warrior.setOrigin(0.5, 0.5);
    warrior.setScale(2.0);
    warrior.setFlipX(false); // Don't flip - face right toward monster
    warrior.setAlpha(0);
    warrior.setDepth(3);
    
    // Add color tint variation
    const colorVariation = Phaser.Math.Between(0, 2);
    const tints = [0xffffff, 0xffdddd, 0xddffdd];
    warrior.setTint(tints[colorVariation]);
    
    // Play idle animation
    warrior.play('soldier_idle');
    
    // Store final position data
    warrior.setData('finalX', finalX);
    warrior.setData('finalY', finalY);
    
    // Fade in while moving to position
    this.tweens.add({
      targets: warrior,
      alpha: Phaser.Math.FloatBetween(0.8, 1.0),
      duration: 300
    });
    
    // Move from entry point to final position
    this.tweens.add({
      targets: warrior,
      x: finalX,
      y: finalY,
      duration: 1500,
      ease: 'Power2'
    });
    
    this.warriorGroup.push(warrior);
  }
  
  private killCurrentWarrior() {
    if (!this.currentWarrior) return;
    
    // Play death animation
    this.currentWarrior.play('soldier_death');
    
    // Death animation - fade and fall after death animation plays
    this.currentWarrior.once('animationcomplete', () => {
      if (this.currentWarrior) {
        this.tweens.add({
          targets: this.currentWarrior,
          alpha: 0,
          y: this.currentWarrior.y + 50,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 600,
          ease: 'Power2',
          onComplete: () => {
            // Destroy the dead warrior
            if (this.currentWarrior) {
              this.currentWarrior.destroy();
            }
            
            // Bring in next warrior from queue
            this.bringNextWarrior();
          }
        });
      }
    });
    
    // Create death particles
    const particles = this.add.particles(this.currentWarrior.x, this.currentWarrior.y, 'spark-placeholder', {
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
  
  private bringNextWarrior() {
    const { width, height } = this.cameras.main;
    
    // Define left platform box (lower platform) - moved more to the left
    const leftPlatform = {
      minX: width * 0.08,  // Moved further left
      maxX: width * 0.30,  // Moved further left
      minY: height * 0.56,
      maxY: height * 0.62
    };
    
    // Entry from top of left platform box
    const entryX = Phaser.Math.Between(leftPlatform.minX, leftPlatform.maxX);
    const entryPoint = { x: entryX, y: -50, name: 'top' };
    
    // Create new current warrior sprite at entry point
    this.currentWarrior = this.add.sprite(entryPoint.x, entryPoint.y, 'soldier_idle', 0);
    this.currentWarrior.setOrigin(0.5, 0.5);
    this.currentWarrior.setScale(2.5);
    this.currentWarrior.setFlipX(true); // Flip to face correct direction
    this.currentWarrior.setAlpha(0);
    this.currentWarrior.setDepth(4);
    this.currentWarrior.setTint(0xff8888); // Red tint for current warrior
    
    // Start with idle animation
    this.currentWarrior.play('soldier_idle');
    
    // Mark as moving since they're walking to center
    this.currentWarrior.setData('isMoving', true);
    
    // Fade in as warrior enters
    this.tweens.add({
      targets: this.currentWarrior,
      alpha: 1,
      duration: 500
    });
    
    // Animate warrior dropping to platform
    const targetX = Phaser.Math.Between(leftPlatform.minX, leftPlatform.maxX);
    const targetY = Phaser.Math.Between(leftPlatform.minY, leftPlatform.maxY);
    
    this.tweens.add({
      targets: this.currentWarrior,
      x: targetX,
      y: targetY,
      duration: 1500,
      ease: 'Power2',
      onStart: () => {
        // Play walking animation
        if (this.currentWarrior) {
          this.currentWarrior.play('soldier_walk');
        }
      },
      onComplete: () => {
        // Return to idle animation
        if (this.currentWarrior) {
          this.currentWarrior.play('soldier_idle');
          // Mark as not moving (ready to be attacked)
          this.currentWarrior.setData('isMoving', false);
        }
      }
    });
    
    // Reset health for new warrior
    this.warriorHealth = 2;
    
    // Register the new warrior
    this.registerUIElement('currentWarrior', this.currentWarrior);
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
        // Filter out warriors that are still moving
        const availableWarriors = this.warriorGroup.filter(g => 
          g && g.active && !g.getData('isMoving')
        );
        
        // If not enough warriors are ready, skip this attack round
        if (availableWarriors.length < 2) return;
        
        // Randomly select 2-3 warriors to throw arrows
        const throwers = Phaser.Utils.Array.Shuffle([...availableWarriors]).slice(0, Phaser.Math.Between(2, Math.min(3, availableWarriors.length)));
        
        throwers.forEach((warrior, i) => {
          if (!warrior || !warrior.active) return;
          
          // Use static frames for attack instead of animation to avoid movement
          if (warrior && warrior.active) {
            // Store original position and check facing
            const originalX = warrior.x;
            const isFacingBackwards = warrior.flipX === true; // True means facing left (backwards from target)
            
            // Only animate and shoot if facing forward (toward monster)
            if (!isFacingBackwards) {
              // Switch to attack03 texture and set to bow drawn frame
              warrior.setTexture('soldier_attack03');
              warrior.setFrame(3); // Start at frame 3 (beginning of draw)
              warrior.x = originalX + 4; // Small forward adjustment to counter backward lean
              
              // Progress through animation frames
              this.time.delayedCall(100, () => {
                if (warrior && warrior.active) {
                  warrior.setFrame(4); // Drawing bow
                }
              });
              
              this.time.delayedCall(200, () => {
                if (warrior && warrior.active) {
                  warrior.setFrame(5); // Bow fully drawn
                }
              });
              
              // Release arrow at frame 6
              this.time.delayedCall(300, () => {
                if (warrior && warrior.active) {
                  warrior.setFrame(6); // Arrow release
                  
                  // Create physics arrow sprite at release
                  const arrow = this.physics.add.sprite(
                    warrior.x + 10, // Slightly forward from warrior
                    warrior.y - 10, // Start at bow height
                    'soldier_arrow'
                  );
                  
                  arrow.setScale(0.8); // Larger arrow for better visibility
                  arrow.setDepth(2);
                  
                  // Use actual monster sprite position
                  const actualMonsterX = this.monsterSprite.x;
                  const actualMonsterY = this.monsterSprite.y;
                  
                  // Calculate distance and time to target
                  const dx = actualMonsterX - arrow.x;
                  const dy = actualMonsterY - arrow.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  const flightTime = distance / 600; // Adjust speed as needed
                  
                  // Calculate velocity needed to reach target with gravity
                  const gravity = 800; // Gravity strength
                  const velocityX = dx / flightTime;
                  const velocityY = (dy / flightTime) - (0.5 * gravity * flightTime);
                  
                  // Set arrow physics properties
                  arrow.body.setGravityY(gravity);
                  arrow.setVelocity(velocityX, velocityY);
                  
                  // Update arrow rotation during flight
                  let rotationTimer = this.time.addEvent({
                    delay: 16, // Update every frame (~60fps)
                    loop: true,
                    callback: () => {
                      if (arrow && arrow.active) {
                        // Point arrow in direction of movement
                        const vx = arrow.body.velocity.x;
                        const vy = arrow.body.velocity.y;
                        arrow.setRotation(Math.atan2(vy, vx));
                      }
                    }
                  });
                  
                  // Destroy arrow after flight time
                  this.time.delayedCall(flightTime * 1000, () => {
                    if (rotationTimer) rotationTimer.destroy();
                    if (arrow && arrow.active) {
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
                // Only allow monster to be hurt if it's not jumping (check if tweening)
                if (!this.tweens.isTweening(this.monsterSprite)) {
                  // Play hurt animation
                  const monsterName = this.forestArenaState.currentMonster?.tier.name.toLowerCase() || '';
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
                      
                      // Flash red tint during hurt
                      this.monsterSprite.setTint(0xff0000);
                      this.time.delayedCall(200, () => {
                        this.monsterSprite.clearTint();
                      });
                      
                      // After hurt, randomly decide to roar and/or counter-attack
                      this.monsterSprite.once('animationcomplete', () => {
                        // 50% chance to roar before counter-attack
                        const shouldRoar = Phaser.Math.Between(1, 2) === 1;
                        
                        if (shouldRoar) {
                          
                          // Store original scale
                          const origScaleX = this.monsterSprite.scaleX;
                          const origScaleY = this.monsterSprite.scaleY;
                          
                          // Stay in idle animation during roar
                          const idleKey = `${spriteKey}_idle`;
                          if (this.anims.exists(idleKey)) {
                            this.monsterSprite.play(idleKey);
                          }
                          
                          // Roar effect: scale up with screen shake
                          this.tweens.add({
                            targets: this.monsterSprite,
                            scaleX: origScaleX * 1.3,
                            scaleY: origScaleY * 1.3,
                            duration: 400,
                            yoyo: true,
                            ease: 'Power2',
                            onStart: () => {
                              // Screen shake during roar
                              this.cameras.main.shake(600, 0.015);
                            },
                            onComplete: () => {
                              
                              // Ensure scale is restored
                              this.monsterSprite.setScale(origScaleX, origScaleY);
                              
                              // Small delay before counter-attack for better visibility
                              this.time.delayedCall(300, () => {
                                // Trigger counter-attack jump
                                this.triggerMonsterCounterAttack(spriteKey);
                              });
                            }
                          });
                        } else {
                          // No roar, just go to idle then counter-attack
                          const idleKey = `${spriteKey}_idle`;
                          if (this.anims.exists(idleKey)) {
                            this.monsterSprite.play(idleKey);
                          }
                          
                          // Small delay before counter-attack
                          this.time.delayedCall(500, () => {
                            // Trigger counter-attack jump
                            this.triggerMonsterCounterAttack(spriteKey);
                          });
                        }
                      });
                    }
                  }
                }
              }
            }
          });
                }
              });
              
              // Return to idle after attack completes
              this.time.delayedCall(500, () => {
                if (warrior && warrior.active) {
                  // Return to idle texture and frame
                  warrior.setTexture('soldier_idle');
                  warrior.setFrame(0);
                  warrior.x = originalX; // Restore original position
                }
              });
            } else {
              // Facing backwards - shoot arrow that misses
              warrior.setTexture('soldier_attack03');
              warrior.setFrame(6); // Just show release frame
              
              // Create arrow that shoots backwards/sideways and misses
              const arrow = this.add.sprite(
                warrior.x - 10, // Behind warrior
                warrior.y - 10,
                'soldier_arrow'
              );
              
              arrow.setScale(0.8); // Larger arrow for better visibility
              arrow.setDepth(2);
              arrow.setRotation(Math.PI); // Point backwards
              
              // Arrow flies backwards and disappears
              this.tweens.add({
                targets: arrow,
                x: warrior.x - 200, // Fly backwards
                y: warrior.y + Phaser.Math.Between(-50, 50),
                duration: 600,
                ease: 'Cubic.easeOut',
                onComplete: () => arrow.destroy()
              });
              
              // Return to idle quickly since attack failed
              this.time.delayedCall(300, () => {
                if (warrior && warrior.active) {
                  warrior.setTexture('soldier_idle');
                  warrior.setFrame(0);
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
      this.forestArenaState = data.preloadedState;
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
    
    // Load the jungle platforms background image
    this.bgImage = this.add.image(width * 0.5, height * 0.65, 'forest-bg');
    
    // Calculate aspect ratio to properly fit the platforms
    const scaleX = width / this.bgImage.width;
    const scaleY = height / this.bgImage.height;
    const scale = Math.max(scaleX, scaleY); // Ensure full coverage
    
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
    if (this.forestArenaState) {
      // Store current monster type for combat scene
      if (this.forestArenaState.currentMonster?.tier?.name) {
        window.localStorage.setItem('currentMonsterType', this.forestArenaState.currentMonster.tier.name);
      }
      
      // Emit the preloaded state to update UI
      // Send properly formatted game state to UI
      this.updateGameStateForUI();
      
      // Update monster display with preloaded data
      if (this.forestArenaState.currentMonster) {
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
    const monster = this.forestArenaState?.currentMonster;

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
      
      // Create monster with Orc sprite
      if (actualSpriteKey) {
        // Position monster to the left, further from soldiers
        const monsterX = this.getRelativePosition(0.80, width);  // Match text X position
        const monsterY = this.getRelativePosition(0.35, height);  // Moved down to prevent cutoff
        
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
        this.monsterSprite.setAlpha(1.0); // Ensure full opacity
        this.monsterSprite.setBlendMode(Phaser.BlendModes.NORMAL); // Ensure normal blend mode
        this.monsterSprite.clearTint(); // Clear any tint
        
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

    // Create small warrior indicators
    this.createDefeatedWarriors(width, height);
    
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
    
    // Create the in-game guide display
    this.createGuideDisplay(width, height);
    
    // Monster now only attacks as counter-attack after being hit
  }
  
  private createGuideDisplay(width: number, height: number) {
    // Create guide container at center of screen
    const guideContainer = this.add.container(width/2, height/2);
    guideContainer.setDepth(1000); // Much higher depth to be above everything
    
    // Create fullscreen dark overlay that covers entire screen
    const overlay = this.add.rectangle(0, 0, width * 3, height * 3, 0x000000, 0.85);
    overlay.setInteractive(); // Block clicks behind it
    guideContainer.add(overlay);
    
    // Create guide popup panel
    const panelWidth = 400;
    const panelHeight = 500;
    
    // Main panel background
    const bgPanel = this.add.graphics();
    bgPanel.fillStyle(0x1a1a1a, 0.95);
    bgPanel.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 15);
    bgPanel.lineStyle(3, 0xffd700, 1);
    bgPanel.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 15);
    guideContainer.add(bgPanel);
    
    // Title
    const title = this.add.text(0, -panelHeight/2 + 30, '⚔️ COMBAT CONTROLS ⚔️', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center'
    });
    title.setOrigin(0.5);
    guideContainer.add(title);
    
    // Movement Section
    let yOffset = -panelHeight/2 + 80;
    const movementTitle = this.add.text(0, yOffset, '— MOVEMENT —', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffaa00',
      fontStyle: 'bold'
    });
    movementTitle.setOrigin(0.5);
    guideContainer.add(movementTitle);
    
    // Movement controls
    const movements = [
      { key: 'WASD / Arrows', desc: 'Move in all directions' },
      { key: 'SHIFT + Direction', desc: 'Dash (invincibility frames)' }
    ];
    
    yOffset += 30;
    movements.forEach(control => {
      const text = this.add.text(-panelWidth/2 + 40, yOffset, 
        `[${control.key}]  ${control.desc}`, {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff'
      });
      guideContainer.add(text);
      yOffset += 25;
    });
    
    // Combat Section
    yOffset += 20;
    const combatTitle = this.add.text(0, yOffset, '— COMBAT —', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffaa00',
      fontStyle: 'bold'
    });
    combatTitle.setOrigin(0.5);
    guideContainer.add(combatTitle);
    
    yOffset += 30;
    const combat = [
      { key: 'SPACE / Click', desc: 'Melee attack (combos!)' },
      { key: 'E / Right Click', desc: 'Shoot arrows' },
      { key: 'Q', desc: 'Switch arrow types' }
    ];
    
    combat.forEach(control => {
      const text = this.add.text(-panelWidth/2 + 40, yOffset,
        `[${control.key}]  ${control.desc}`, {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff'
      });
      guideContainer.add(text);
      yOffset += 25;
    });
    
    // Arrow Types Section
    yOffset += 20;
    const arrowTitle = this.add.text(0, yOffset, '— ARROW TYPES —', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffaa00',
      fontStyle: 'bold'
    });
    arrowTitle.setOrigin(0.5);
    guideContainer.add(arrowTitle);
    
    yOffset += 30;
    const arrows = [
      { color: '#ffff00', name: 'Yellow:', desc: 'Standard damage' },
      { color: '#00aaff', name: 'Blue:', desc: 'Frost (slows monster)' },
      { color: '#ff4444', name: 'Red:', desc: 'Explosive (area damage)' }
    ];
    
    arrows.forEach(arrow => {
      const nameText = this.add.text(-panelWidth/2 + 40, yOffset, arrow.name, {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        color: arrow.color,
        fontStyle: 'bold'
      });
      guideContainer.add(nameText);
      
      const descText = this.add.text(-panelWidth/2 + 100, yOffset, arrow.desc, {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff'
      });
      guideContainer.add(descText);
      yOffset += 25;
    });
    
    // Tips Section
    yOffset += 20;
    const tipsTitle = this.add.text(0, yOffset, '— TIPS —', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffaa00',
      fontStyle: 'bold'
    });
    tipsTitle.setOrigin(0.5);
    guideContainer.add(tipsTitle);
    
    yOffset += 30;
    const tips = [
      '• 3-hit combo triggers spin attack',
      '• Red arrows one-shot skeletons',
      '• Shield powerup blocks 2 hits (80% reduction)'
    ];
    
    tips.forEach(tip => {
      const text = this.add.text(-panelWidth/2 + 40, yOffset, tip, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#aaffaa'
      });
      guideContainer.add(text);
      yOffset += 20;
    });
    
    // Close instruction
    const closeHint = this.add.text(0, panelHeight/2 - 30, 
      'Press [G] or [ESC] to close', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      align: 'center'
    });
    closeHint.setOrigin(0.5);
    guideContainer.add(closeHint);
    
    // Start hidden
    guideContainer.visible = false;
    
    // Toggle guide visibility with G key
    const gKey = this.input.keyboard?.addKey('G');
    const escKey = this.input.keyboard?.addKey('ESC');
    
    if (gKey) {
      gKey.on('down', () => {
        guideContainer.visible = !guideContainer.visible;
        // Notify React to hide/show UI elements when guide toggles
        window.dispatchEvent(new CustomEvent('guideToggled', { 
          detail: { isVisible: guideContainer.visible } 
        }));
      });
    }
    
    if (escKey) {
      escKey.on('down', () => {
        if (guideContainer.visible) {
          guideContainer.visible = false;
          // Notify React to show UI elements again
          window.dispatchEvent(new CustomEvent('guideToggled', { 
            detail: { isVisible: false } 
          }));
        }
      });
    }
    
    // Create a separate toggle hint below the center bottom (where battle button is)
    const toggleHintText = this.add.text(width/2, height - 60, 
      'Press [G] for controls guide', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      align: 'center'
    });
    toggleHintText.setOrigin(0.5);
    toggleHintText.setDepth(99); // Just below the guide
    
    // Add shadow for better visibility
    toggleHintText.setShadow(2, 2, '#000000', 2, true, true);
    
    // Store reference but not in guide container so it stays visible
    this.registerUIElement('toggleHint', toggleHintText);
    
    // Store reference
    this.registerUIElement('guideDisplay', guideContainer);
  }
  
  private triggerMonsterCounterAttack(spriteKey: string) {
    // Check if monster is not already attacking (not in a tween)
    if (!this.tweens.isTweening(this.monsterSprite)) {
      
      // Store original position and scale for return jump
      const originalX = this.monsterSprite.x;
      const originalY = this.monsterSprite.y;
      const originalScaleX = this.monsterSprite.scaleX;
      const originalScaleY = this.monsterSprite.scaleY;
              
              // Pick a target before jumping
              const allWarriors = this.warriorGroup.filter(g => g && g.active);
              if (allWarriors.length === 0) return; // No targets
              
              const target = Phaser.Utils.Array.GetRandom(allWarriors);
              
              // Calculate landing position near the target
              const landingX = target.x + 50; // Land slightly to the right of target
              const landingY = target.y; // Same height as target
              
              // Jump to soldier platform with arc
              this.tweens.chain({
                targets: this.monsterSprite,
                tweens: [
                  {
                    // Jump up and forward
                    x: landingX,
                    y: landingY - 100, // Arc peak
                    scaleX: originalScaleX * 1.2,
                    scaleY: originalScaleY * 1.2,
                    duration: 400,
                    ease: 'Sine.easeOut'
                  },
                  {
                    // Land at target
                    y: landingY,
                    scaleX: originalScaleX,
                    scaleY: originalScaleY,
                    duration: 200,
                    ease: 'Sine.easeIn',
                    onComplete: () => {
                      // Now on platform - play a random attack animation
                      const attackNum = Phaser.Math.Between(1, 3);
                      const meleeAnim = `${spriteKey}_attack0${attackNum}`;
                      
                      // Try the selected animation, fallback to attack01, then idle
                      let animToPlay = meleeAnim;
                      if (!this.anims.exists(meleeAnim)) {
                        console.warn(`Animation ${meleeAnim} doesn't exist, trying attack01`);
                        animToPlay = `${spriteKey}_attack01`;
                        if (!this.anims.exists(animToPlay)) {
                          console.warn(`Attack01 doesn't exist either, using idle`);
                          animToPlay = `${spriteKey}_idle`;
                        }
                      }
                      
                      if (this.anims.exists(animToPlay)) {
                        this.monsterSprite.play(animToPlay);
                        
                        // Sync hurt effect with attack animation hit frame
                        this.time.delayedCall(300, () => {
                          // Only apply hurt if monster is still near the target (on platform)
                          const distanceToTarget = Phaser.Math.Distance.Between(
                            this.monsterSprite.x, this.monsterSprite.y,
                            target.x, target.y
                          );
                          
                          if (target && target.active && distanceToTarget < 100) {
                            // Play hurt animation on target
                            target.play('soldier_hurt');
                            target.setTint(0xff0000);
                            this.time.delayedCall(200, () => {
                              target.clearTint();
                            });
                            
                            // Damage particles at impact point
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
                            
                            // Chance to kill the target
                            if (Phaser.Math.Between(1, 2) === 1) {
                              this.killSupportingWarrior(target);
                              this.checkAndSpawnWarriors();
                            }
                          }
                        });
                        
                        // Wait for attack animation to complete before moving on
                        this.monsterSprite.once('animationcomplete', () => {
                          // Return to idle after attack
                          const idleKey = `${spriteKey}_idle`;
                          if (this.anims.exists(idleKey)) {
                            this.monsterSprite.play(idleKey);
                          }
                        });
                      } else {
                        console.error('No valid animation found for monster attack!', spriteKey);
                      }
                    }
                  },
                  {
                    // Pause to let attack animation complete
                    x: landingX,
                    y: landingY,
                    duration: 1000, // Wait for attack to finish
                    ease: 'Linear'
                  },
                  {
                    // Jump back - first leap up
                    x: (originalX + landingX) / 2, // Midpoint
                    y: Math.min(originalY, landingY) - 100, // Same arc height as forward jump
                    scaleX: originalScaleX * 1.1,
                    scaleY: originalScaleY * 1.1,
                    duration: 400,
                    ease: 'Sine.easeOut',
                    onStart: () => {
                      // Return to idle animation when jumping back
                      const idleKey = `${spriteKey}_idle`;
                      if (this.anims.exists(idleKey)) {
                        this.monsterSprite.play(idleKey);
                      }
                    }
                  },
                  {
                    // Land back at original position
                    x: originalX,
                    y: originalY,
                    scaleX: originalScaleX,
                    scaleY: originalScaleY,
                    duration: 300,
                    ease: 'Sine.easeIn',
                    onComplete: () => {
                      // Ensure exact original position and scale
                      this.monsterSprite.x = originalX;
                      this.monsterSprite.y = originalY;
                      this.monsterSprite.setScale(originalScaleX, originalScaleY);
                      
                      // Ensure monster returns to idle state for next attack
                      const idleKey = `${spriteKey}_idle`;
                      if (this.anims.exists(idleKey) && this.monsterSprite.anims.currentAnim?.key !== idleKey) {
                        this.monsterSprite.play(idleKey);
                      }
                    }
                  }
                ]
              });
              
              // Remove attack line since monster jumps to melee range
    }
  }
  
  private createDefeatedWarriors(width: number, height: number) {
    const { centerX, centerY } = this.cameras.main;
    
    // Define left platform box (lower platform) - moved more to the left
    const leftPlatform = {
      minX: width * 0.08,  // Moved further left
      maxX: width * 0.30,  // Moved further left
      minY: height * 0.56,
      maxY: height * 0.62
    };
    
    // Create warrior group within left platform
    const warriorCount = 15; // Fixed at 15 warriors
    const minDistance = this.scaleValue(40, width); // Tighter spacing for platform
    
    const positions: { x: number, y: number, angle: number, radius: number }[] = [];
    
    for (let i = 0; i < warriorCount; i++) {
      let validPosition = false;
      let attempts = 0;
      let gladX = 0, gladY = 0, angle = 0, radius = 0;
      
      // Try to find a position that's not too close to existing warriors
      while (!validPosition && attempts < 100) {
        // Random position within the left platform box
        gladX = Phaser.Math.Between(leftPlatform.minX, leftPlatform.maxX);
        gladY = Phaser.Math.Between(leftPlatform.minY, leftPlatform.maxY);
        
        // For tracking (not used in positioning anymore)
        angle = 0;
        radius = 0;
        
        // Check distance from other warriors
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
      
      // Only create warrior if we found a valid position
      if (!validPosition) {
        console.warn('Could not find position for warrior', i);
        continue;
      }
      
      positions.push({ x: gladX, y: gladY, angle: 0, radius: 0 });
      
      // Create warrior sprite
      const warrior = this.add.sprite(gladX, gladY, 'soldier_idle', 0);
      warrior.setOrigin(0.5, 0.5);
      warrior.setScale(2.0);
      warrior.setFlipX(false); // Don't flip - face right toward monster
      warrior.setAlpha(0.9);
      warrior.setDepth(3);
      
      // Add color tint variation
      const colorVariation = Phaser.Math.Between(0, 2);
      const tints = [0xffffff, 0xffdddd, 0xddffdd];
      warrior.setTint(tints[colorVariation]);
      
      // Play idle animation
      warrior.play('soldier_idle');
      
      // Store original position for repositioning
      warrior.setData('originalX', gladX - centerX);
      warrior.setData('originalY', gladY - centerY);
      
      this.warriorGroup.push(warrior);
      this.registerUIElement(`warriorGroup${i}`, warrior);
    }
    
    // No center warrior anymore since attacks are random
    
    // Create attack effect line
    const attackLine = this.add.graphics();
    attackLine.setAlpha(0);
    attackLine.setDepth(5);
    this.registerUIElement('attackLine', attackLine);
    
    // Start spear throwing animation
    this.startSpearThrowing();
    
    // Initial check for warrior count
    this.checkAndSpawnWarriors();
    
    // No health tracking needed for random attacks
  }

  private setupFightButtonListener() {
    // Listen for fight button clicks from HTML overlay
    const handleFightClick = (event: CustomEvent) => {
      // Don't start combat immediately - payment will be handled first
      // Store pending combat data
      if (this.forestArenaState?.currentMonster) {
        const combatId = `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.registry.set('pendingCombat', {
          monster: this.forestArenaState.currentMonster,
          combatId: combatId,
          walletAddress: this.walletAddress
        });
      }
    };
    
    // Listen for successful payment confirmation
    const handleCombatStarted = (event: CustomEvent) => {
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
      this.forestArenaState = stateData;
      
      // Store current monster type for combat scene
      if (this.forestArenaState.currentMonster?.tier?.name) {
        window.localStorage.setItem('currentMonsterType', this.forestArenaState.currentMonster.tier.name);
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
    if (!this.forestArenaState) return;

    // Use bracket notation to access currentPot from backend without TypeScript errors
    const jackpotValue = (this.forestArenaState as any)['currentPot'] || this.forestArenaState.currentJackpot || 0;

    // Emit event with game state for HTML UI
    window.dispatchEvent(new CustomEvent('gameStateUpdate', {
      detail: {
        jackpot: jackpotValue,
        monsterName: this.forestArenaState.currentMonster?.tier?.name || 'SKELETON WARRIOR',
        recentCombats: this.forestArenaState.recentCombats || [],
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
    if (!this.forestArenaState?.currentMonster) return;
    if (!this.monsterSprite || !this.scene || !this.scene.isActive()) return;

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

    // Emit warrior group center position
    window.dispatchEvent(new CustomEvent('warriorPositionUpdate', {
      detail: {
        x: this.getRelativePosition(0.6, this.cameras.main.width),
        y: this.getRelativePosition(0.5, this.cameras.main.height)
      }
    }));
  }

  private async startCombat() {
    
    if (!this.forestArenaState?.currentMonster) {
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
    // Scene is waking up from sleep - reload game state
    this.loadGameState();
  }
  
  private handleSceneResume() {
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
      (bgRect as any).setPosition(this.centerX(width), this.centerY(height));
      if ('setSize' in bgRect) {
        (bgRect as any).setSize(width * 1.2, height * 1.2);
      }
    }
    
    // Update background image
    if (this.bgImage) {
      this.bgImage.setPosition(this.centerX(width), height * 0.65);
      
      // Recalculate scale to maintain aspect ratio and cover the screen with margin
      const scaleX = (width * 1.1) / this.bgImage.width;
      const scaleY = (height * 1.1) / this.bgImage.height;
      const scale = Math.max(scaleX, scaleY); // Ensure full coverage
      this.bgImage.setScale(scale);
    }
    
    // Update overlay
    const overlay = this.getUIElement('overlay');
    if (overlay && 'setPosition' in overlay) {
      (overlay as any).setPosition(this.centerX(width), this.centerY(height));
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
    
    // Monster positioned on the elevated right platform
    const monsterX = this.getRelativePosition(0.80, width);
    const monsterY = this.getRelativePosition(0.35, height);

    // Position monster sprite - LARGER and more prominent
    this.monsterSprite.setPosition(monsterX, monsterY);
    // Rectangles don't have texture property, so skip the texture check
    this.monsterSprite.setDepth(5);
    
    // Removed shadow and aura positioning

    // No center warrior to position anymore
    
    // Reposition warrior group maintaining their scattered positions
    const centerX = this.getRelativePosition(0.5, width);
    const centerY = this.getRelativePosition(0.5, height);
    
    // Reposition both active and incoming warriors
    const allWarriors = [...this.warriorGroup, ...this.incomingWarriors];
    allWarriors.forEach((glad) => {
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