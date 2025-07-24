# Monster System Implementation

## Overview

Aurelius Colosseum features a 5-tier monster system with progressively difficult enemies. Each monster has unique characteristics, entry fees, and vault crack chances. The system is designed to scale with the jackpot size.

## Monster Tiers

### Tier 1: Skeleton Warrior
- **Entry Fee**: 0.01 SOL
- **Health**: 100
- **Vault Crack Chance**: 10%
- **Jackpot Range**: 0-1 SOL
- **Visual**: White skeletal warrior with basic sword

### Tier 2: Goblin Chieftain
- **Entry Fee**: 0.02 SOL
- **Health**: 200
- **Vault Crack Chance**: 20%
- **Jackpot Range**: 1-3 SOL
- **Visual**: Green goblin with club

### Tier 3: Minotaur Guardian
- **Entry Fee**: 0.05 SOL
- **Health**: 400
- **Vault Crack Chance**: 35%
- **Jackpot Range**: 3-10 SOL
- **Visual**: Brown bull-headed warrior with axe

### Tier 4: Hydra
- **Entry Fee**: 0.1 SOL
- **Health**: 800
- **Vault Crack Chance**: 50%
- **Jackpot Range**: 10-25 SOL
- **Visual**: Purple multi-headed serpent

### Tier 5: Ancient Dragon
- **Entry Fee**: 0.25 SOL
- **Health**: 1500
- **Vault Crack Chance**: 70%
- **Jackpot Range**: 25-100 SOL
- **Visual**: Red dragon with fire breath

## Data Configuration

```typescript
// data/monsters.ts
export type MonsterType = 
  | 'SKELETON_WARRIOR'
  | 'GOBLIN_CHIEFTAIN'
  | 'MINOTAUR_GUARDIAN'
  | 'HYDRA'
  | 'ANCIENT_DRAGON';

export interface MonsterData {
  key: MonsterType;
  name: string;
  health: number;
  defense: number;
  attack: number;
  entryFee: number; // in lamports
  crackChance: number; // percentage
  minJackpot: number; // in SOL
  maxJackpot: number; // in SOL
  color: number; // Phaser color for placeholder
  size: number; // Sprite size
  description: string;
}

export const MONSTERS: Record<MonsterType, MonsterData> = {
  SKELETON_WARRIOR: {
    key: 'SKELETON_WARRIOR',
    name: 'Skeleton Warrior',
    health: 100,
    defense: 10,
    attack: 15,
    entryFee: 0.01 * 1e9, // 0.01 SOL in lamports
    crackChance: 10,
    minJackpot: 0,
    maxJackpot: 1,
    color: 0xFFFFFF, // White
    size: 80,
    description: 'A basic undead warrior. Easy to defeat but low vault chance.'
  },
  GOBLIN_CHIEFTAIN: {
    key: 'GOBLIN_CHIEFTAIN',
    name: 'Goblin Chieftain',
    health: 200,
    defense: 20,
    attack: 25,
    entryFee: 0.02 * 1e9,
    crackChance: 20,
    minJackpot: 1,
    maxJackpot: 3,
    color: 0x00FF00, // Green
    size: 90,
    description: 'A cunning goblin leader. Moderate challenge and rewards.'
  },
  MINOTAUR_GUARDIAN: {
    key: 'MINOTAUR_GUARDIAN',
    name: 'Minotaur Guardian',
    health: 400,
    defense: 40,
    attack: 50,
    entryFee: 0.05 * 1e9,
    crackChance: 35,
    minJackpot: 3,
    maxJackpot: 10,
    color: 0x8B4513, // Brown
    size: 120,
    description: 'A powerful maze guardian. Good balance of risk and reward.'
  },
  HYDRA: {
    key: 'HYDRA',
    name: 'Hydra',
    health: 800,
    defense: 60,
    attack: 80,
    entryFee: 0.1 * 1e9,
    crackChance: 50,
    minJackpot: 10,
    maxJackpot: 25,
    color: 0x800080, // Purple
    size: 140,
    description: 'Multi-headed serpent. High risk, high reward.'
  },
  ANCIENT_DRAGON: {
    key: 'ANCIENT_DRAGON',
    name: 'Ancient Dragon',
    health: 1500,
    defense: 100,
    attack: 150,
    entryFee: 0.25 * 1e9,
    crackChance: 70,
    minJackpot: 25,
    maxJackpot: 100,
    color: 0xFF0000, // Red
    size: 160,
    description: 'The ultimate challenge. Maximum vault crack chance.'
  }
};
```

## Monster Selection Logic

```typescript
// utils/monsterSelection.ts
export function selectMonsterForJackpot(jackpotAmount: number): MonsterType {
  const jackpotInSol = jackpotAmount / 1e9;
  
  // Find appropriate monster based on jackpot range
  for (const [key, monster] of Object.entries(MONSTERS)) {
    if (jackpotInSol >= monster.minJackpot && jackpotInSol < monster.maxJackpot) {
      return key as MonsterType;
    }
  }
  
  // Default to highest tier if jackpot exceeds all ranges
  return 'ANCIENT_DRAGON';
}

export function getAllMonsterKeys(): MonsterType[] {
  return Object.keys(MONSTERS) as MonsterType[];
}

export function getMonsterDisplayName(key: MonsterType): string {
  return MONSTERS[key].name;
}

export function getMonsterData(key: MonsterType): MonsterData {
  return MONSTERS[key];
}
```

## Visual Implementation

### Placeholder Sprites
During development, monsters use colored circle placeholders generated dynamically:

```typescript
// game/scenes/PreloadScene.ts
private createPlaceholderSprites(): void {
  Object.values(MONSTERS).forEach((monster) => {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    
    // Outer glow
    graphics.fillStyle(monster.color, 0.3);
    graphics.fillCircle(monster.size / 2, monster.size / 2, monster.size / 2 + 5);
    
    // Main body
    graphics.fillStyle(monster.color, 1);
    graphics.fillCircle(monster.size / 2, monster.size / 2, monster.size / 2);
    
    // Inner highlight
    graphics.fillStyle(0xFFFFFF, 0.3);
    graphics.fillCircle(monster.size / 3, monster.size / 3, monster.size / 4);
    
    // Generate texture
    graphics.generateTexture(monster.key.toLowerCase(), monster.size + 10, monster.size + 10);
    graphics.destroy();
  });
}
```

### Monster Game Objects
```typescript
// game/objects/Monster.ts
export class Monster extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private healthBar: HealthBar;
  private monsterData: MonsterData;
  
  constructor(scene: Phaser.Scene, x: number, y: number, type: MonsterType) {
    super(scene, x, y);
    
    this.monsterData = getMonsterData(type);
    
    // Create sprite
    this.sprite = scene.add.sprite(0, 0, type.toLowerCase());
    this.add(this.sprite);
    
    // Create health bar
    this.healthBar = new HealthBar(scene, 0, -this.monsterData.size / 2 - 20, 
      this.monsterData.size, 10, this.monsterData.health);
    this.add(this.healthBar);
    
    // Add name label
    const nameText = scene.add.text(0, this.monsterData.size / 2 + 10, 
      this.monsterData.name, {
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
    this.add(nameText);
    
    // Add idle animation
    this.createIdleAnimation();
    
    scene.add.existing(this);
  }
  
  private createIdleAnimation(): void {
    // Breathing effect
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.05,
      scaleY: 0.95,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  async attack(target: Phaser.GameObjects.Container): Promise<void> {
    // Move towards target
    await this.scene.tweens.add({
      targets: this,
      x: target.x - 100,
      duration: 300,
      ease: 'Power2'
    }).on('complete', () => {
      // Attack effect
      this.scene.cameras.main.shake(100, 0.01);
    });
    
    // Return to position
    await this.scene.tweens.add({
      targets: this,
      x: this.x + 100,
      duration: 300,
      ease: 'Power2'
    });
  }
  
  takeDamage(amount: number): void {
    this.healthBar.decrease(amount);
    
    // Flash red
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });
    
    // Shake
    this.scene.tweens.add({
      targets: this,
      x: this.x + Phaser.Math.Between(-5, 5),
      y: this.y + Phaser.Math.Between(-5, 5),
      duration: 50,
      repeat: 3,
      yoyo: true
    });
  }
  
  async die(): Promise<void> {
    // Death animation
    await this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0,
      angle: 180,
      duration: 1000,
      ease: 'Power2'
    });
    
    this.destroy();
  }
}
```

## Dev Mode Integration

```typescript
// components/GameUIOverlay.tsx - Dev Mode Panel
{devMode && (
  <div className="absolute left-4 top-40 pointer-events-auto">
    <div className="bg-purple-900/80 p-4 rounded-lg border border-purple-400 space-y-3">
      <label className="flex items-center gap-2 text-white text-sm">
        <input
          type="checkbox"
          checked={devMode}
          onChange={(e) => setDevMode(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="font-mono">DEV MODE</span>
      </label>
      
      {devMode && (
        <div className="space-y-2">
          <div className="text-purple-200 text-xs font-mono">SELECT MONSTER:</div>
          <select
            value={selectedMonster}
            onChange={(e) => {
              setSelectedMonster(e.target.value);
              window.dispatchEvent(new CustomEvent('devMonsterSelect', { 
                detail: { monster: e.target.value } 
              }));
            }}
            className="bg-purple-800 text-white border border-purple-600 rounded px-2 py-1 text-sm w-full"
          >
            {getAllMonsterKeys().map(key => (
              <option key={key} value={key}>
                {getMonsterDisplayName(key)} ({MONSTERS[key].entryFee / 1e9} SOL)
              </option>
            ))}
          </select>
          <div className="text-purple-300 text-xs space-y-1">
            <div>Health: {MONSTERS[selectedMonster as MonsterType].health}</div>
            <div>Crack Chance: {MONSTERS[selectedMonster as MonsterType].crackChance}%</div>
            <div>Entry Fee: {MONSTERS[selectedMonster as MonsterType].entryFee / 1e9} SOL</div>
          </div>
        </div>
      )}
    </div>
  </div>
)}
```

## Combat Calculation

```typescript
// utils/combatCalculation.ts
export interface CombatResult {
  victory: boolean;
  gladiatorDamageDealt: number;
  monsterDamageDealt: number;
  rounds: number;
  criticalHits: number;
}

// Note: Actual combat is determined by backend VRF
// This is only for visual representation
export function generateVisualCombat(
  monster: MonsterData, 
  predetermined: boolean
): CombatResult {
  const gladiatorPower = 100; // Base power
  const rounds = 5 + Math.floor(Math.random() * 5);
  
  return {
    victory: predetermined,
    gladiatorDamageDealt: monster.health * (predetermined ? 1.1 : 0.8),
    monsterDamageDealt: gladiatorPower * (predetermined ? 0.7 : 1.2),
    rounds,
    criticalHits: Math.floor(Math.random() * 3)
  };
}
```

## Monster AI Patterns

```typescript
// game/ai/MonsterAI.ts
export class MonsterAI {
  static getAttackPattern(type: MonsterType): AttackPattern {
    switch (type) {
      case 'SKELETON_WARRIOR':
        return {
          attacks: ['slash', 'thrust'],
          timing: 2000,
          pattern: 'sequential'
        };
        
      case 'GOBLIN_CHIEFTAIN':
        return {
          attacks: ['club_swing', 'throw_rock'],
          timing: 1500,
          pattern: 'random'
        };
        
      case 'MINOTAUR_GUARDIAN':
        return {
          attacks: ['charge', 'axe_sweep', 'stomp'],
          timing: 2500,
          pattern: 'combo'
        };
        
      case 'HYDRA':
        return {
          attacks: ['multi_bite', 'poison_spit', 'tail_sweep'],
          timing: 2000,
          pattern: 'adaptive'
        };
        
      case 'ANCIENT_DRAGON':
        return {
          attacks: ['fire_breath', 'claw_slash', 'wing_buffet', 'tail_whip'],
          timing: 3000,
          pattern: 'phase_based'
        };
        
      default:
        return {
          attacks: ['basic_attack'],
          timing: 2000,
          pattern: 'sequential'
        };
    }
  }
}
```

## Monster Spawn Effects

```typescript
// game/effects/MonsterEffects.ts
export class MonsterSpawnEffect {
  static create(scene: Phaser.Scene, x: number, y: number, type: MonsterType): void {
    const data = getMonsterData(type);
    
    // Portal effect
    const portal = scene.add.circle(x, y, 10, data.color, 0.5);
    
    scene.tweens.add({
      targets: portal,
      radius: data.size,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => portal.destroy()
    });
    
    // Particle burst
    const particles = scene.add.particles(x, y, 'spark', {
      speed: { min: 100, max: 300 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      quantity: 20,
      tint: data.color
    });
    
    scene.time.delayedCall(1000, () => particles.destroy());
  }
}
```

## Future Enhancements

### Planned Features
1. **Animated Sprites**: Replace placeholders with animated sprite sheets
2. **Unique Abilities**: Special attacks for each monster type
3. **Environmental Effects**: Monster-specific arena modifications
4. **Boss Mechanics**: Multi-phase battles for higher tier monsters
5. **Monster Variants**: Rare versions with modified stats

### Art Requirements
- 64x64 sprite sheets for smaller monsters
- 128x128 sprite sheets for larger monsters
- Attack effect sprites
- Death animations
- Environmental decorations per monster theme