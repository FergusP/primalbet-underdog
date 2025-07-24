import { MonsterTier } from '../types';

export const MONSTER_TIERS: Record<number, MonsterTier> = {
  1: {
    tier: 1,
    name: 'Skeleton',
    minPot: 0,
    maxPot: 0.02,
    hp: 80,
    attackPower: 10,
    defenseMultiplier: 1.0,
    vaultCrackChance: 1, // 5% chance - very low for testing
    sprite: 'skeleton',
  },
  2: {
    tier: 2,
    name: 'Goblin',
    minPot: 0.02,
    maxPot: 0.04,
    hp: 100,
    attackPower: 15,
    defenseMultiplier: 1.2,
    vaultCrackChance: 1, // 5% chance - very low for testing
    sprite: 'goblin',
  },
  3: {
    tier: 3,
    name: 'Shadow Assassin',
    minPot: 0.04,
    maxPot: 0.06,
    hp: 130,
    attackPower: 20,
    defenseMultiplier: 1.5,
    vaultCrackChance: 1, // 5% chance - very low for testing
    sprite: 'shadow_assassin',
  },
  4: {
    tier: 4,
    name: 'Demon Knight',
    minPot: 0.06,
    maxPot: 0.08,
    hp: 170,
    attackPower: 25,
    defenseMultiplier: 1.8,
    vaultCrackChance: 1, // 5% chance - very low for testing
    sprite: 'demon_knight',
  },
  5: {
    tier: 5,
    name: 'Dragon Lord',
    minPot: 0.08,
    maxPot: 0.1,
    hp: 220,
    attackPower: 30,
    defenseMultiplier: 2.0,
    vaultCrackChance: 1, // 5% chance - very low for testing
    sprite: 'dragon_lord',
  },
  6: {
    tier: 6,
    name: 'Ancient Titan',
    minPot: 0.1,
    maxPot: Infinity,
    hp: 280,
    attackPower: 35,
    defenseMultiplier: 2.5,
    vaultCrackChance: 80, // 80% chance - high chance to crack and reset
    sprite: 'ancient_titan',
  },
};

export function getMonsterByPotSize(potInSol: number): MonsterTier {
  for (const tier of Object.values(MONSTER_TIERS)) {
    if (potInSol >= tier.minPot && potInSol < tier.maxPot) {
      return tier;
    }
  }
  return MONSTER_TIERS[6]; // Default to highest tier
}
