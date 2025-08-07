import { MonsterTier } from '../types';

// Monster data matching backend exactly (5 monsters only)
export const MONSTER_TIERS: Record<string, MonsterTier> = {
  SKELETON_WARRIOR: {
    name: 'Skeleton Warrior',
    sprite: 'skeleton-placeholder', // Match backend sprite key
    poolRange: [0, 0.02], // Match backend: 0 to 0.02 SOL
    baseHealth: 80,
    attackPower: 15,
    defenseMultiplier: 0.9,
    vaultCrackChance: 10, // Match backend: 10 (not 0.3)
    entryFee: 10000000, // 0.01 SOL
    animations: {
      idle: 'skeleton_idle',
      attack: 'skeleton_attack',
      hurt: 'skeleton_hurt',
      death: 'skeleton_death'
    }
  },
  
  GOBLIN_ARCHER: {
    name: 'Goblin Archer',
    sprite: 'goblin-placeholder',
    poolRange: [0.02, 0.04], // Match backend: 0.02 to 0.04 SOL
    baseHealth: 100,
    attackPower: 20,
    defenseMultiplier: 0.85,
    vaultCrackChance: 90, // Match backend: 90 (not 0.25)
    entryFee: 10000000, // 0.01 SOL
    animations: {
      idle: 'goblin_idle',
      attack: 'goblin_attack',
      hurt: 'goblin_hurt',
      death: 'goblin_death'
    }
  },
  
  ORC_GLADIATOR: {
    name: 'Orc Gladiator',
    sprite: 'orc-placeholder',
    poolRange: [0.04, 0.06], // Match backend: 0.04 to 0.06 SOL
    baseHealth: 130,
    attackPower: 25,
    defenseMultiplier: 0.8,
    vaultCrackChance: 20, // Match backend: 20 (not 0.2)
    entryFee: 10000000, // 0.01 SOL
    animations: {
      idle: 'orc_idle',
      attack: 'orc_attack', 
      hurt: 'orc_hurt',
      death: 'orc_death'
    }
  },
  
  MINOTAUR_CHAMPION: {
    name: 'Minotaur Champion',
    sprite: 'minotaur-placeholder',
    poolRange: [0.06, 0.08], // Match backend: 0.06 to 0.08 SOL
    baseHealth: 170,
    attackPower: 35,
    defenseMultiplier: 0.75,
    vaultCrackChance: 70, // Match backend: 70 (not 0.15)
    entryFee: 10000000, // 0.01 SOL
    animations: {
      idle: 'minotaur_idle',
      attack: 'minotaur_attack',
      hurt: 'minotaur_hurt',
      death: 'minotaur_death'
    }
  },
  
  CYCLOPS_TITAN: {
    name: 'Cyclops Titan',
    sprite: 'cyclops-placeholder',
    poolRange: [0.08, Infinity], // Match backend: 0.08 to Infinity
    baseHealth: 200,
    attackPower: 45,
    defenseMultiplier: 0.7,
    vaultCrackChance: 90, // Match backend: 90 (not 0.1)
    entryFee: 10000000, // 0.01 SOL
    animations: {
      idle: 'cyclops_idle',
      attack: 'cyclops_attack',
      hurt: 'cyclops_hurt',
      death: 'cyclops_death'
    }
  }
};

// Helper function to get monster tier by key
export function getMonsterTier(key: string): MonsterTier {
  return MONSTER_TIERS[key] || MONSTER_TIERS.SKELETON_WARRIOR;
}

// Get all monster keys for dev mode selection
export function getAllMonsterKeys(): string[] {
  return Object.keys(MONSTER_TIERS);
}

// Convert key to display name
export function getMonsterDisplayName(key: string): string {
  return MONSTER_TIERS[key]?.name || 'Unknown Monster';
}