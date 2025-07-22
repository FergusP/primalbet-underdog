# **⚔️ AURELIUS COLOSSEUM: MONSTER COMBAT SYSTEM**
*Technical Implementation Guide for Combat Mechanics*

## **🎯 Combat Overview**

The combat system is the heart of Aurelius Colosseum. It determines whether a gladiator defeats the current monster and gets a chance at the treasure vault. All combat uses **ProofNetwork VRF** for verifiable randomness.

## **👹 Monster System**

### **Monster Spawning Logic**

```typescript
class MonsterManager {
  private currentMonster: Monster | null = null;
  
  // Spawn monster based on current prize pool
  spawnMonster(prizePoolAmount: number): Monster {
    const tier = this.getMonsterTier(prizePoolAmount);
    
    return {
      id: generateId(),
      type: tier.name,
      baseHealth: tier.baseHealth,
      currentHealth: tier.baseHealth,
      tier: tier,
      spawnedAt: Date.now(),
      defeatedBy: null
    };
  }
  
  private getMonsterTier(poolAmount: number): MonsterTier {
    // Find appropriate tier based on pool size
    for (const tier of MONSTER_TIERS) {
      if (poolAmount >= tier.poolRange[0] && poolAmount < tier.poolRange[1]) {
        return tier;
      }
    }
    return MONSTER_TIERS[MONSTER_TIERS.length - 1]; // Highest tier
  }
}
```

### **Monster Tier Configuration**

```typescript
interface MonsterTier {
  name: string;
  sprite: string;              // Phaser sprite key
  poolRange: [number, number]; // Min/max SOL for spawn
  baseHealth: number;          // Starting HP
  attackPower: number;         // For visual combat
  defenseMultiplier: number;   // Affects combat difficulty
  vaultCrackChance: number;    // % chance after defeat
  entryFee: number;           // SOL to fight
  animations: {
    idle: string;
    attack: string;
    hurt: string;
    death: string;
  };
}

// Configurable monster progression
const MONSTER_TIERS: MonsterTier[] = [
  {
    name: "Skeleton Warrior",
    sprite: "skeleton",
    poolRange: [0, 1],
    baseHealth: 100,
    attackPower: 10,
    defenseMultiplier: 1.0,
    vaultCrackChance: 10,
    entryFee: 0.01,
    animations: {
      idle: "skeleton_idle",
      attack: "skeleton_attack", 
      hurt: "skeleton_hurt",
      death: "skeleton_death"
    }
  },
  {
    name: "Goblin Berserker",
    sprite: "goblin",
    poolRange: [1, 3],
    baseHealth: 200,
    attackPower: 15,
    defenseMultiplier: 1.2,
    vaultCrackChance: 20,
    entryFee: 0.02,
    animations: {
      idle: "goblin_idle",
      attack: "goblin_attack",
      hurt: "goblin_hurt", 
      death: "goblin_death"
    }
  },
  {
    name: "Minotaur Guardian",
    sprite: "minotaur",
    poolRange: [3, 10],
    baseHealth: 400,
    attackPower: 25,
    defenseMultiplier: 1.5,
    vaultCrackChance: 35,
    entryFee: 0.05,
    animations: {
      idle: "minotaur_idle",
      attack: "minotaur_attack",
      hurt: "minotaur_hurt",
      death: "minotaur_death"
    }
  },
  {
    name: "Hydra",
    sprite: "hydra",
    poolRange: [10, 25],
    baseHealth: 800,
    attackPower: 40,
    defenseMultiplier: 1.8,
    vaultCrackChance: 50,
    entryFee: 0.1,
    animations: {
      idle: "hydra_idle",
      attack: "hydra_attack",
      hurt: "hydra_hurt",
      death: "hydra_death"
    }
  },
  {
    name: "Ancient Dragon", 
    sprite: "dragon",
    poolRange: [25, 100],
    baseHealth: 1500,
    attackPower: 60,
    defenseMultiplier: 2.2,
    vaultCrackChance: 70,
    entryFee: 0.25,
    animations: {
      idle: "dragon_idle",
      attack: "dragon_attack",
      hurt: "dragon_hurt",
      death: "dragon_death"
    }
  },
  {
    name: "Titan of Sol",
    sprite: "titan",
    poolRange: [100, Infinity],
    baseHealth: 3000,
    attackPower: 100,
    defenseMultiplier: 3.0,
    vaultCrackChance: 90,
    entryFee: 0.5,
    animations: {
      idle: "titan_idle",
      attack: "titan_attack",
      hurt: "titan_hurt",
      death: "titan_death"
    }
  }
];
```

## **⚔️ Combat Resolution**

### **Core Combat Logic**

```typescript
interface CombatParams {
  gladiatorWallet: PublicKey;
  entryAmount: number;
  monster: Monster;
  vrfSeed: string;
}

class CombatResolver {
  constructor(private vrfClient: ProofNetworkClient) {}
  
  async resolveCombat(params: CombatParams): Promise<CombatResult> {
    // 1. Calculate gladiator power
    const gladiatorPower = this.calculateGladiatorPower(params.entryAmount);
    
    // 2. Get VRF random values
    const vrfResult = await this.vrfClient.requestRandomness({
      seed: params.vrfSeed,
      numValues: 2 // One for gladiator, one for monster
    });
    
    // 3. Calculate combat scores
    const gladiatorRoll = vrfResult.values[0] % 100; // 0-99
    const monsterRoll = vrfResult.values[1] % 100;   // 0-99
    
    const gladiatorScore = gladiatorPower * (50 + gladiatorRoll) / 100;
    const monsterScore = params.monster.baseHealth * 
                        params.monster.tier.defenseMultiplier * 
                        (50 + monsterRoll) / 100;
    
    // 4. Determine outcome
    const victory = gladiatorScore > monsterScore;
    
    return {
      gladiator: params.gladiatorWallet,
      monster: params.monster,
      gladiatorPower,
      gladiatorRoll,
      gladiatorScore,
      monsterRoll, 
      monsterScore,
      victory,
      vrfProof: vrfResult.proof,
      timestamp: Date.now()
    };
  }
  
  private calculateGladiatorPower(entryAmount: number): number {
    // Base power = entry amount * multiplier
    // Ensures linear scaling (no whale advantage)
    const BASE_POWER_MULTIPLIER = 1000;
    return entryAmount * BASE_POWER_MULTIPLIER;
  }
}
```

### **Combat Result Structure**

```typescript
interface CombatResult {
  // Participants
  gladiator: PublicKey;
  monster: Monster;
  
  // Combat stats
  gladiatorPower: number;
  gladiatorRoll: number;
  gladiatorScore: number;
  monsterRoll: number;
  monsterScore: number;
  
  // Outcome
  victory: boolean;
  vrfProof: string; // For verification
  timestamp: number;
  
  // Visual data for frontend
  combatLog?: CombatLogEntry[];
}

interface CombatLogEntry {
  action: 'attack' | 'defend' | 'special';
  source: 'gladiator' | 'monster';
  damage?: number;
  effect?: string;
  timestamp: number;
}
```

## **🎰 Vault Crack System**

### **Vault Crack Attempt**

```typescript
class VaultCrackResolver {
  constructor(private vrfClient: ProofNetworkClient) {}
  
  async attemptVaultCrack(
    combatResult: CombatResult,
    prizePool: number
  ): Promise<VaultCrackResult> {
    // Only victorious gladiators can attempt
    if (!combatResult.victory) {
      throw new Error("Must defeat monster first!");
    }
    
    // Get crack chance from monster tier
    const crackChance = combatResult.monster.tier.vaultCrackChance;
    
    // Request VRF for vault crack
    const vrfResult = await this.vrfClient.requestRandomness({
      seed: `vault_${combatResult.gladiator}_${Date.now()}`,
      numValues: 1
    });
    
    const roll = vrfResult.values[0] % 100; // 0-99
    const success = roll < crackChance;
    
    return {
      gladiator: combatResult.gladiator,
      monster: combatResult.monster.type,
      crackChance,
      roll,
      success,
      prizeWon: success ? prizePool : 0,
      vrfProof: vrfResult.proof,
      timestamp: Date.now()
    };
  }
}

interface VaultCrackResult {
  gladiator: PublicKey;
  monster: string;
  crackChance: number;
  roll: number;
  success: boolean;
  prizeWon: number;
  vrfProof: string;
  timestamp: number;
}
```

## **🎮 Combat Visualization (Phaser)**

### **Combat Animation Sequence**

```typescript
class CombatScene extends Phaser.Scene {
  private gladiator: Phaser.GameObjects.Sprite;
  private monster: Phaser.GameObjects.Sprite;
  private combatResult: CombatResult;
  
  async playCombatSequence(result: CombatResult) {
    this.combatResult = result;
    
    // 1. Entry animation
    await this.animateGladiatorEntry();
    
    // 2. Combat clash (visual only, outcome predetermined)
    await this.animateCombatClash();
    
    // 3. Result animation
    if (result.victory) {
      await this.animateVictory();
      await this.showVaultCrackUI();
    } else {
      await this.animateDeath();
      await this.showDefeatUI();
    }
  }
  
  private async animateCombatClash() {
    // Multiple attack exchanges for drama
    const exchanges = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < exchanges; i++) {
      // Gladiator attacks
      this.gladiator.play('gladiator_attack');
      await this.tweenAttack(this.gladiator, this.monster);
      this.showDamageNumber(this.monster, this.getVisualDamage());
      
      // Monster counter-attacks
      this.monster.play(`${this.monster.texture.key}_attack`);
      await this.tweenAttack(this.monster, this.gladiator);
      this.showDamageNumber(this.gladiator, this.getVisualDamage());
      
      // Pause between exchanges
      await this.delay(500);
    }
  }
  
  private getVisualDamage(): number {
    // Fake damage numbers for visual appeal
    // Actual outcome already determined by VRF
    return 10 + Math.floor(Math.random() * 50);
  }
}
```

## **📊 Combat Statistics**

### **Tracking Combat Stats**

```typescript
interface PlayerCombatStats {
  wallet: PublicKey;
  totalFights: number;
  victories: number;
  defeats: number;
  winRate: number;
  
  // Per monster stats
  monsterStats: Map<string, {
    encounters: number;
    victories: number;
    fastestKill?: number; // Time in ms
  }>;
  
  // Vault stats
  vaultAttempts: number;
  vaultsCracked: number;
  totalWinnings: number;
  
  // Streaks
  currentWinStreak: number;
  bestWinStreak: number;
  
  // Achievements
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

## **🔧 Backend Integration**

### **Combat Flow Handler**

```typescript
class CombatHandler {
  constructor(
    private combatResolver: CombatResolver,
    private vaultResolver: VaultCrackResolver,
    private monsterManager: MonsterManager,
    private blockchain: SolanaClient
  ) {}
  
  async handleCombatRequest(request: CombatRequest): Promise<CombatResponse> {
    // 1. Validate entry payment
    const payment = await this.blockchain.validatePayment(
      request.wallet,
      request.txSignature,
      this.monsterManager.currentMonster.tier.entryFee
    );
    
    // 2. Resolve combat
    const combatResult = await this.combatResolver.resolveCombat({
      gladiatorWallet: request.wallet,
      entryAmount: payment.amount,
      monster: this.monsterManager.currentMonster,
      vrfSeed: `combat_${request.wallet}_${Date.now()}`
    });
    
    // 3. Handle victory
    if (combatResult.victory) {
      // Attempt vault crack
      const vaultResult = await this.vaultResolver.attemptVaultCrack(
        combatResult,
        await this.blockchain.getPrizePool()
      );
      
      if (vaultResult.success) {
        // Process jackpot win
        await this.processJackpotWin(vaultResult);
      }
      
      // Update monster state
      this.monsterManager.currentMonster.defeatedBy = request.wallet;
      
      // Spawn next monster if vault cracked
      if (vaultResult.success) {
        const newPool = 0; // Reset after jackpot
        this.monsterManager.currentMonster = this.monsterManager.spawnMonster(newPool);
      }
    }
    
    // 4. Update stats
    await this.updatePlayerStats(request.wallet, combatResult);
    
    // 5. Return response
    return {
      combatResult,
      vaultResult: combatResult.victory ? vaultResult : null,
      newMonster: this.monsterManager.currentMonster,
      prizePool: await this.blockchain.getPrizePool()
    };
  }
}
```

## **📈 XP & Points System**

### **Experience Points (XP) Calculation**

```typescript
interface XPRewards {
  // Base XP for actions
  COMBAT_ATTEMPT: 10;           // Just for trying
  MONSTER_DEFEATED: 50;         // Base victory XP
  MONSTER_TIER_MULTIPLIER: 1.5; // Multiplied per tier above skeleton
  VAULT_ATTEMPT: 25;            // Attempting to crack vault
  VAULT_CRACKED: 500;           // Successfully cracking vault
  
  // Bonus XP
  FIRST_BLOOD: 100;             // First to defeat a new monster spawn
  SPEED_BONUS: 50;              // Defeat monster in <30s of spawn
  UNDERDOG_BONUS: 200;          // Defeat monster with min entry fee
  STREAK_BONUS: 25;             // Per consecutive victory
}

class XPCalculator {
  calculateCombatXP(result: CombatResult, monster: Monster): number {
    let totalXP = XP_REWARDS.COMBAT_ATTEMPT;
    
    if (result.victory) {
      // Base victory XP
      totalXP += XP_REWARDS.MONSTER_DEFEATED;
      
      // Tier multiplier (skeleton = tier 0, goblin = tier 1, etc)
      const tierIndex = MONSTER_TIERS.findIndex(t => t.name === monster.type);
      const tierMultiplier = Math.pow(XP_REWARDS.MONSTER_TIER_MULTIPLIER, tierIndex);
      totalXP *= tierMultiplier;
      
      // First blood bonus
      if (!monster.defeatedBy) {
        totalXP += XP_REWARDS.FIRST_BLOOD;
      }
      
      // Speed bonus
      const combatTime = Date.now() - monster.spawnedAt;
      if (combatTime < 30000) { // 30 seconds
        totalXP += XP_REWARDS.SPEED_BONUS;
      }
      
      // Underdog bonus (used minimum entry fee)
      if (result.entryAmount === monster.tier.entryFee) {
        totalXP += XP_REWARDS.UNDERDOG_BONUS;
      }
    }
    
    return Math.floor(totalXP);
  }
  
  calculateVaultXP(result: VaultCrackResult): number {
    let xp = XP_REWARDS.VAULT_ATTEMPT;
    
    if (result.success) {
      xp += XP_REWARDS.VAULT_CRACKED;
      
      // Bonus XP based on prize pool size
      const poolBonus = Math.floor(result.prizeWon * 10); // 10 XP per SOL won
      xp += poolBonus;
    }
    
    return xp;
  }
}
```

### **Points System (Leaderboard)**

```typescript
interface PointsRewards {
  // Combat points
  MONSTER_DEFEATED_BASE: 100;
  MONSTER_HP_FACTOR: 0.1;       // Points per HP of monster
  OVERKILL_BONUS: 1.5;          // Multiplier for high damage
  
  // Vault points
  VAULT_CRACK_BASE: 1000;
  VAULT_SIZE_FACTOR: 10;        // Points per SOL in vault
  
  // Efficiency points
  ENTRY_EFFICIENCY: 2.0;        // Multiplier for using exact entry fee
  DAMAGE_EFFICIENCY: 1.5;       // Multiplier for close fights
}

class PointsCalculator {
  calculateCombatPoints(result: CombatResult, monster: Monster): number {
    if (!result.victory) return 0;
    
    let points = POINTS_REWARDS.MONSTER_DEFEATED_BASE;
    
    // Points based on monster HP
    points += monster.baseHealth * POINTS_REWARDS.MONSTER_HP_FACTOR;
    
    // Overkill bonus (high gladiator score vs monster score)
    const overkillRatio = result.gladiatorScore / result.monsterScore;
    if (overkillRatio > 1.5) {
      points *= POINTS_REWARDS.OVERKILL_BONUS;
    }
    
    // Efficiency bonus
    if (result.entryAmount === monster.tier.entryFee) {
      points *= POINTS_REWARDS.ENTRY_EFFICIENCY;
    }
    
    // Close fight bonus (barely won)
    if (overkillRatio < 1.1) {
      points *= POINTS_REWARDS.DAMAGE_EFFICIENCY;
    }
    
    return Math.floor(points);
  }
  
  calculateVaultPoints(result: VaultCrackResult): number {
    if (!result.success) return 0;
    
    let points = POINTS_REWARDS.VAULT_CRACK_BASE;
    points += result.prizeWon * POINTS_REWARDS.VAULT_SIZE_FACTOR;
    
    return Math.floor(points);
  }
}
```

### **Player Progression Tracking**

```typescript
interface PlayerProgression {
  wallet: PublicKey;
  
  // XP & Level
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  
  // Points (for leaderboard)
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  
  // Detailed tracking
  combatStats: {
    attempts: number;
    victories: number;
    defeats: number;
    totalXPEarned: number;
    totalPointsEarned: number;
  };
  
  vaultStats: {
    attempts: number;
    successes: number;
    totalPrizeWon: number;
    totalXPEarned: number;
    totalPointsEarned: number;
  };
  
  // Achievements based on XP/Points
  unlockedTitles: Title[];
  nextMilestone: Milestone;
}

interface Title {
  id: string;
  name: string;
  requirement: 'xp' | 'points' | 'special';
  threshold: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const TITLES: Title[] = [
  // XP-based titles
  { id: 'novice', name: 'Novice Gladiator', requirement: 'xp', threshold: 100, rarity: 'common' },
  { id: 'warrior', name: 'Seasoned Warrior', requirement: 'xp', threshold: 1000, rarity: 'common' },
  { id: 'veteran', name: 'Veteran Fighter', requirement: 'xp', threshold: 5000, rarity: 'rare' },
  { id: 'champion', name: 'Arena Champion', requirement: 'xp', threshold: 25000, rarity: 'epic' },
  { id: 'legend', name: 'Living Legend', requirement: 'xp', threshold: 100000, rarity: 'legendary' },
  
  // Points-based titles
  { id: 'scorer', name: 'Point Scorer', requirement: 'points', threshold: 1000, rarity: 'common' },
  { id: 'ace', name: 'Combat Ace', requirement: 'points', threshold: 10000, rarity: 'rare' },
  { id: 'master', name: 'Master Tactician', requirement: 'points', threshold: 50000, rarity: 'epic' },
  
  // Special titles
  { id: 'dragonslayer', name: 'Dragonslayer', requirement: 'special', threshold: 1, rarity: 'epic' },
  { id: 'vaultbreaker', name: 'Vault Breaker', requirement: 'special', threshold: 10, rarity: 'legendary' },
];

// Level calculation
function calculateLevel(totalXP: number): number {
  // Simple sqrt curve: Level = floor(sqrt(XP / 100))
  return Math.floor(Math.sqrt(totalXP / 100));
}

function getXPForLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}
```

### **Progression Integration**

```typescript
class ProgressionManager {
  async updatePlayerProgression(
    wallet: PublicKey,
    combatResult: CombatResult,
    vaultResult: VaultCrackResult | null
  ): Promise<ProgressionUpdate> {
    const player = await this.getPlayerProgression(wallet);
    
    // Calculate XP
    const combatXP = this.xpCalculator.calculateCombatXP(combatResult, combatResult.monster);
    const vaultXP = vaultResult ? this.xpCalculator.calculateVaultXP(vaultResult) : 0;
    const totalXPGained = combatXP + vaultXP;
    
    // Calculate Points
    const combatPoints = this.pointsCalculator.calculateCombatPoints(combatResult, combatResult.monster);
    const vaultPoints = vaultResult ? this.pointsCalculator.calculateVaultPoints(vaultResult) : 0;
    const totalPointsGained = combatPoints + vaultPoints;
    
    // Update player stats
    const oldLevel = player.currentLevel;
    player.totalXP += totalXPGained;
    player.totalPoints += totalPointsGained;
    player.weeklyPoints += totalPointsGained;
    player.monthlyPoints += totalPointsGained;
    player.currentLevel = calculateLevel(player.totalXP);
    player.xpToNextLevel = getXPForLevel(player.currentLevel + 1) - player.totalXP;
    
    // Check for level up
    const leveledUp = player.currentLevel > oldLevel;
    
    // Check for new titles
    const newTitles = this.checkNewTitles(player);
    
    // Update combat/vault stats
    this.updateDetailedStats(player, combatResult, vaultResult);
    
    // Save and return update
    await this.savePlayerProgression(player);
    
    return {
      xpGained: totalXPGained,
      pointsGained: totalPointsGained,
      leveledUp,
      newLevel: leveledUp ? player.currentLevel : null,
      newTitles,
      totalXP: player.totalXP,
      totalPoints: player.totalPoints,
      rank: await this.getPlayerRank(wallet)
    };
  }
}

interface ProgressionUpdate {
  xpGained: number;
  pointsGained: number;
  leveledUp: boolean;
  newLevel: number | null;
  newTitles: Title[];
  totalXP: number;
  totalPoints: number;
  rank: number; // Leaderboard position
}
```

### **Future Development Ideas**

```typescript
// XP/Points modifiers for special events
interface EventModifiers {
  doubleXPWeekend: boolean;
  happyHour: { active: boolean; multiplier: number };
  specialMonsterBonus: { monsterId: string; xpMultiplier: number };
}

// Prestige system after max level
interface PrestigeSystem {
  maxLevel: 100;
  prestigeLevel: number; // How many times maxed
  prestigeBonus: number; // % bonus to all XP/points
  specialRewards: string[]; // Exclusive titles, cosmetics
}

// Seasonal leaderboards
interface SeasonalProgression {
  seasonId: string;
  startDate: number;
  endDate: number;
  seasonalPoints: number;
  seasonalRank: number;
  rewards: SeasonReward[];
}
```

## **🛡️ Security Considerations**

### **Anti-Cheat Measures**

1. **All randomness via ProofNetwork VRF**
   - No client-side RNG
   - Verifiable proofs stored on-chain

2. **Entry validation**
   - Verify payment before combat
   - Check for duplicate entries
   - Rate limiting per wallet

3. **Combat determinism**
   - Outcome determined server-side
   - Client only displays results
   - No ability to manipulate combat

### **Fair Play Guarantees**

```typescript
// Linear power scaling prevents whale dominance
gladiatorPower = entryAmount * CONSTANT;

// Monster difficulty scales with pool
// Bigger pools = harder monsters = more skill required

// VRF ensures true randomness
// No prediction or manipulation possible
```

## **🎯 Balancing Considerations**

1. **Entry Fee vs Monster Difficulty**
   - Higher fees for tougher monsters
   - Prevents spam on large pools
   - Creates meaningful risk decisions

2. **Vault Crack Chances**
   - Low for easy monsters (keeps pools growing)
   - High for hard monsters (rewards skill/risk)
   - Never 100% (maintains excitement)

3. **Power Scaling**
   - Linear with entry amount
   - No exponential advantages
   - Skill/luck > wallet size

---

*The combat system creates exciting moments while maintaining fairness through verifiable randomness and balanced progression.*