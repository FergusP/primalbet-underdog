/**
 * Arena Arcade Game Configuration (Backend)
 * Contains all IDs and settings from TheVorld platform setup
 */

// Game Information
export const ARENA_CONFIG = {
  gameName: 'PrimalBetGame',
  arcadeGameId: process.env.ARENA_GAME_ID || 'arcade_mh7pk0i6_7902139d',
  vorldAppId: process.env.VORLD_APP_ID || 'app_mh7hl0zg_94e1fec1',
} as const;

// Actor IDs (game participants who can receive packages)
export const ACTORS = {
  PLAYER: {
    id: '68ff4186eb39e74d32d2e759',
    name: 'Player',
  },
  MONSTER: {
    id: '68ff418beb39e74d32d2e75f',
    name: 'Monster',
  },
  SKELETONS: {
    id: '68ff45fceb39e74d32d2e7c7',
    name: 'Skeletons',
  },
} as const;

// Event IDs
export const EVENTS = {
  COMBAT_STARTED: '68ff41d6eb39e74d32d2e766',
  MONSTER_DEFEATED: '68ff41e6eb39e74d32d2e773',
  PLAYER_DIED: '68ff41edeb39e74d32d2e782',
  VAULT_CRACKED: '68ff4feeb39e74d32d2e793',
  VAULT_FAILED_ATTEMPT: '68ff4208eb39e74d32d2e7a6',
} as const;

// Package IDs
export const PACKAGES = {
  HEALTH_POTION: '69008ee1eb39e74d32d2fb08',
  DAMAGE_BOOST: '69008f47eb39e74d32d2fce8',
  MONSTER_HEAL: '69008fb8eb39e74d32d2fd14',
} as const;

// API URLs
export const ARENA_API = {
  baseUrl: process.env.ARENA_API_URL || 'https://airdrop-arcade.onrender.com/api',
  wsUrl: process.env.ARENA_WS_URL || 'wss://airdrop-arcade.onrender.com',
} as const;
