import { MonsterTier } from '../types';

export const MONSTER_TIERS: Record<number, MonsterTier> = {
  1: {
    tier: 1,
    name: 'Orc',
    minPot: 0,
    maxPot: 0.01,
    hp: 80,
    attackPower: 15,
    defenseMultiplier: 0.9,
    vaultCrackChance: 1, // 10% chance
    sprite: 'orc',
  },
  2: {
    tier: 2,
    name: 'Armored Orc',
    minPot: 0.01,
    maxPot: 0.02,
    hp: 100,
    attackPower: 18,
    defenseMultiplier: 0.9,
    vaultCrackChance: 11, // 90% chance
    sprite: 'armored_orc',
  },
  3: {
    tier: 3,
    name: 'Elite Orc',
    minPot: 0.02,
    maxPot: 0.03,
    hp: 130,
    attackPower: 28,
    defenseMultiplier: 0.8,
    vaultCrackChance: 1, // 20% chance
    sprite: 'elite_orc',
  },
  4: {
    tier: 4,
    name: 'Orc Rider',
    minPot: 0.03,
    maxPot: 0.04,
    hp: 170,
    attackPower: 35,
    defenseMultiplier: 0.75,
    vaultCrackChance: 1, // 70% chance
    sprite: 'orc_rider',
  },
  5: {
    tier: 5,
    name: 'Werewolf',
    minPot: 0.04,
    maxPot: Infinity, // Werewolf is now the highest tier
    hp: 100,
    attackPower: 45,
    defenseMultiplier: 0.7,
    vaultCrackChance: 0, // Cannot crack vault - must evolve to Werebear
    sprite: 'werewolf',
  },
  6: {
    tier: 6,
    name: 'Werebear',
    minPot: Infinity, // Never spawns naturally - evolution only
    maxPot: Infinity, // Evolution only
    hp: 100,
    attackPower: 55,
    defenseMultiplier: 0.65,
    vaultCrackChance: 95, // Very high chance for defeating both phases
    sprite: 'werebear',
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
