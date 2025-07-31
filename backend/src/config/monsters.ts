import { MonsterTier } from '../types';

export const MONSTER_TIERS: Record<number, MonsterTier> = {
  1: {
    tier: 1,
    name: 'Skeleton Warrior',
    minPot: 0,
    maxPot: 0.02,
    hp: 80,
    attackPower: 15,
    defenseMultiplier: 0.9,
    vaultCrackChance: 10, // 30% chance
    sprite: 'skeleton-placeholder',
  },
  2: {
    tier: 2,
    name: 'Goblin Archer',
    minPot: 0.02,
    maxPot: 0.04,
    hp: 100,
    attackPower: 20,
    defenseMultiplier: 0.85,
    vaultCrackChance: 90, // 25% chance
    sprite: 'goblin-placeholder',
  },
  3: {
    tier: 3,
    name: 'Orc Gladiator',
    minPot: 0.04,
    maxPot: 0.06,
    hp: 130,
    attackPower: 25,
    defenseMultiplier: 0.8,
    vaultCrackChance: 20, // 20% chance
    sprite: 'orc-placeholder',
  },
  4: {
    tier: 4,
    name: 'Minotaur Champion',
    minPot: 0.06,
    maxPot: 0.08,
    hp: 170,
    attackPower: 35,
    defenseMultiplier: 0.75,
    vaultCrackChance: 70, // 70% chance
    sprite: 'minotaur-placeholder',
  },
  5: {
    tier: 5,
    name: 'Cyclops Titan',
    minPot: 0.08,
    maxPot: Infinity, // Cyclops Titan is now the highest tier
    hp: 200,
    attackPower: 45,
    defenseMultiplier: 0.7,
    vaultCrackChance: 90, // 80% chance - hardest to crack
    sprite: 'cyclops-placeholder',
  },
};

export function getMonsterByPotSize(potInSol: number): MonsterTier {
  for (const tier of Object.values(MONSTER_TIERS)) {
    if (potInSol >= tier.minPot && potInSol < tier.maxPot) {
      return tier;
    }
  }
  return MONSTER_TIERS[5]; // Default to Cyclops Titan (highest tier)
}
