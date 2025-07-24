import { MonsterTier } from '../types';

// Roman-themed monsters with increasing difficulty
export const MONSTER_TIERS: Record<string, MonsterTier> = {
  SKELETON_WARRIOR: {
    name: 'Skeleton Warrior',
    sprite: 'skeleton-placeholder',
    poolRange: [1, 10],
    baseHealth: 80,
    attackPower: 15,
    defenseMultiplier: 0.9,
    vaultCrackChance: 0.3, // 30% - Easy
    entryFee: 10000000, // 0.01 SOL - flat fee for all monsters
    animations: {
      idle: 'skeleton-idle',
      attack: 'skeleton-attack',
      hurt: 'skeleton-hurt',
      death: 'skeleton-death'
    }
  },
  
  GOBLIN_ARCHER: {
    name: 'Goblin Archer',
    sprite: 'goblin-placeholder',
    poolRange: [5, 20],
    baseHealth: 100,
    attackPower: 20,
    defenseMultiplier: 0.85,
    vaultCrackChance: 0.25, // 25%
    entryFee: 100000000, // 0.1 SOL
    animations: {
      idle: 'goblin-idle',
      attack: 'goblin-attack',
      hurt: 'goblin-hurt',
      death: 'goblin-death'
    }
  },
  
  ORC_GLADIATOR: {
    name: 'Orc Gladiator',
    sprite: 'orc-placeholder',
    poolRange: [10, 50],
    baseHealth: 130,
    attackPower: 25,
    defenseMultiplier: 0.8,
    vaultCrackChance: 0.2, // 20%
    entryFee: 10000000, // 0.01 SOL - flat fee for all monsters
    animations: {
      idle: 'orc-idle',
      attack: 'orc-attack', 
      hurt: 'orc-hurt',
      death: 'orc-death'
    }
  },
  
  MINOTAUR_CHAMPION: {
    name: 'Minotaur Champion',
    sprite: 'minotaur-placeholder',
    poolRange: [25, 100],
    baseHealth: 170,
    attackPower: 35,
    defenseMultiplier: 0.75,
    vaultCrackChance: 0.15, // 15%
    entryFee: 10000000, // 0.01 SOL - flat fee for all monsters
    animations: {
      idle: 'minotaur-idle',
      attack: 'minotaur-attack',
      hurt: 'minotaur-hurt',
      death: 'minotaur-death'
    }
  },
  
  CYCLOPS_TITAN: {
    name: 'Cyclops Titan',
    sprite: 'cyclops-placeholder',
    poolRange: [50, 200],
    baseHealth: 200,
    attackPower: 45,
    defenseMultiplier: 0.7,
    vaultCrackChance: 0.1, // 10% - Hardest
    entryFee: 10000000, // 0.01 SOL - flat fee for all monsters
    animations: {
      idle: 'cyclops-idle',
      attack: 'cyclops-attack',
      hurt: 'cyclops-hurt',
      death: 'cyclops-death'
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