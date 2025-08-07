// DEPRECATED: This file is no longer needed as all monster data comes from the backend
// Keeping it temporarily commented out for reference and to avoid breaking the mock API endpoint

/*
import { MonsterTier } from '../types';

// Monster data matching backend exactly (5 monsters only)
export const MONSTER_TIERS: Record<string, MonsterTier> = {
  ORC: {
    name: 'Orc',
    sprite: 'orc', // Match backend sprite key
    poolRange: [0, 0.02], // Match backend: 0 to 0.02 SOL
    baseHealth: 80,
    attackPower: 15,
    defenseMultiplier: 0.9,
    vaultCrackChance: 10, // Match backend: 10
    entryFee: 10000000, // 0.01 SOL
    animations: {
      idle: 'orc_idle',
      attack: 'orc_attack',
      hurt: 'orc_hurt',
      death: 'orc_death'
    }
  },
  
  ARMORED_ORC: {
    name: 'Armored Orc',
    sprite: 'armored_orc',
    poolRange: [0.02, 0.04], // Match backend: 0.02 to 0.04 SOL
    baseHealth: 100,
    attackPower: 18,
    defenseMultiplier: 0.9,
    vaultCrackChance: 90, // Match backend: 90
    entryFee: 10000000, // 0.01 SOL
    animations: {
      idle: 'armored_orc_idle',
      attack: 'armored_orc_attack',
      hurt: 'armored_orc_hurt',
      death: 'armored_orc_death'
    }
  },
  
  ELITE_ORC: {
    name: 'Elite Orc',
    sprite: 'elite_orc',
    poolRange: [0.04, 0.06], // Match backend: 0.04 to 0.06 SOL
    baseHealth: 130,
    attackPower: 28,
    defenseMultiplier: 0.8,
    vaultCrackChance: 20, // Match backend: 20
    entryFee: 10000000, // 0.01 SOL
    animations: {
      idle: 'elite_orc_idle',
      attack: 'elite_orc_attack', 
      hurt: 'elite_orc_hurt',
      death: 'elite_orc_death'
    }
  },
  
  ORC_RIDER: {
    name: 'Orc Rider',
    sprite: 'orc_rider',
    poolRange: [0.06, 0.08], // Match backend: 0.06 to 0.08 SOL
    baseHealth: 170,
    attackPower: 35,
    defenseMultiplier: 0.75,
    vaultCrackChance: 70, // Match backend: 70
    entryFee: 10000000, // 0.01 SOL
    animations: {
      idle: 'orc_rider_idle',
      attack: 'orc_rider_attack',
      hurt: 'orc_rider_hurt',
      death: 'orc_rider_death'
    }
  },
  
  WEREWOLF: {
    name: 'Werewolf',
    sprite: 'werewolf',
    poolRange: [0.08, Infinity], // Match backend: 0.08 to Infinity
    baseHealth: 200,
    attackPower: 45,
    defenseMultiplier: 0.7,
    vaultCrackChance: 0, // Match backend: Cannot crack vault - must evolve
    entryFee: 10000000, // 0.01 SOL
    animations: {
      idle: 'werewolf_idle',
      attack: 'werewolf_attack',
      hurt: 'werewolf_hurt',
      death: 'werewolf_death'
    }
  },
  
  WEREBEAR: {
    name: 'Werebear',
    sprite: 'werebear',
    poolRange: [Infinity, Infinity], // Never spawns naturally - evolution only
    baseHealth: 250,
    attackPower: 55,
    defenseMultiplier: 0.65,
    vaultCrackChance: 95, // Match backend: Very high chance for defeating both phases
    entryFee: 0, // No entry fee, part of werewolf fight
    animations: {
      idle: 'werebear_idle',
      attack: 'werebear_attack',
      hurt: 'werebear_hurt',
      death: 'werebear_death'
    }
  }
};

// Helper function to get monster tier by key
export function getMonsterTier(key: string): MonsterTier {
  return MONSTER_TIERS[key] || MONSTER_TIERS.ORC;
}

// Get all monster keys for dev mode selection
export function getAllMonsterKeys(): string[] {
  return Object.keys(MONSTER_TIERS);
}

// Convert key to display name
export function getMonsterDisplayName(key: string): string {
  return MONSTER_TIERS[key]?.name || 'Unknown Monster';
}
*/

// Temporary exports to avoid breaking the mock API endpoint
export const MONSTER_TIERS = {};
export function getMonsterTier(key: string) { return null; }
export function getAllMonsterKeys(): string[] { return []; }
export function getMonsterDisplayName(key: string): string { return 'Unknown Monster'; }