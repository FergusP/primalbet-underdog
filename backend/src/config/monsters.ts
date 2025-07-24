import { MonsterTier } from '../types';

export const MONSTER_TIERS: Record<number, MonsterTier> = {
  1: {
    tier: 1,
    name: 'Skeleton',
    minPot: 0,
    maxPot: 0.3,
    hp: 80,
    attackPower: 10,
    defenseMultiplier: 1.0,
    vaultCrackChance: 30, // 30% chance
    sprite: 'skeleton',
  },
  2: {
    tier: 2,
    name: 'Goblin',
    minPot: 0.3,
    maxPot: 0.8,
    hp: 100,
    attackPower: 15,
    defenseMultiplier: 1.2,
    vaultCrackChance: 50, // 50% chance
    sprite: 'goblin',
  },
  3: {
    tier: 3,
    name: 'Shadow Assassin',
    minPot: 0.8,
    maxPot: 1.5,
    hp: 130,
    attackPower: 20,
    defenseMultiplier: 1.5,
    vaultCrackChance: 50, // 50% chance
    sprite: 'shadow_assassin',
  },
  4: {
    tier: 4,
    name: 'Demon Knight',
    minPot: 1.5,
    maxPot: 2.3,
    hp: 170,
    attackPower: 25,
    defenseMultiplier: 1.8,
    vaultCrackChance: 50, // 50% chance
    sprite: 'demon_knight',
  },
  5: {
    tier: 5,
    name: 'Dragon Lord',
    minPot: 2.3,
    maxPot: 3.0,
    hp: 220,
    attackPower: 30,
    defenseMultiplier: 2.0,
    vaultCrackChance: 50, // 50% chance
    sprite: 'dragon_lord',
  },
  6: {
    tier: 6,
    name: 'Ancient Titan',
    minPot: 3.0,
    maxPot: Infinity,
    hp: 280,
    attackPower: 35,
    defenseMultiplier: 2.5,
    vaultCrackChance: 50, // 50% chance
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
