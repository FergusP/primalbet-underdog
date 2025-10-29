/**
 * Arena Arcade Game Configuration
 * Contains all IDs and settings from TheVorld platform setup
 */

// Game Information
export const ARENA_CONFIG = {
  gameName: 'PrimalBetGame',
  arcadeGameId: 'arcade_mh7pk0i6_7902139d',
  vorldAppId: 'app_mh7hl0zg_94e1fec1',
} as const;

// Actor IDs (game participants who can receive packages)
export const ACTORS = {
  PLAYER: {
    id: '68ff4186eb39e74d32d2e759',
    name: 'Player',
    description: 'The warrior fighting the monster',
  },
  MONSTER: {
    id: '68ff418beb39e74d32d2e75f',
    name: 'Monster',
    description: 'The boss monster being fought',
  },
  SKELETONS: {
    id: '68ff45fceb39e74d32d2e7c7',
    name: 'Skeletons',
    description: 'Additional enemies (not used yet)',
  },
} as const;

// Event IDs (custom game events)
export const EVENTS = {
  COMBAT_STARTED: {
    id: '68ff41d6eb39e74d32d2e766',
    name: 'Combat Started',
    description: 'Player enters combat arena',
  },
  MONSTER_DEFEATED: {
    id: '68ff41e6eb39e74d32d2e773',
    name: 'Monster Defeated',
    description: 'Player wins combat',
  },
  PLAYER_DIED: {
    id: '68ff41edeb39e74d32d2e782',
    name: 'Player Died',
    description: 'Player loses combat',
  },
  VAULT_CRACKED: {
    id: '68ff4feeb39e74d32d2e793',
    name: 'Vault Cracked',
    description: 'Player wins jackpot (VRF success)',
  },
  VAULT_FAILED_ATTEMPT: {
    id: '68ff4208eb39e74d32d2e7a6',
    name: 'Vault Failed Attempt',
    description: 'Player fails vault crack (VRF fail)',
  },
} as const;

// Package IDs (immediate packages viewers can purchase)
export const PACKAGES = {
  HEALTH_POTION: {
    id: '69008ee1eb39e74d32d2fb08',
    name: 'Health Potion',
    targetActor: ACTORS.PLAYER.id,
    effect: 'heal',
    value: 20,
    cost: 50,
    description: 'Restores 20 HP to the player',
    icon: '🧪',
  },
  DAMAGE_BOOST: {
    id: '69008f47eb39e74d32d2fce8',
    name: 'Damage Boost',
    targetActor: ACTORS.PLAYER.id,
    effect: 'damage_multiplier',
    value: 2,
    cost: 50,
    description: 'Doubles player damage output',
    icon: '🔥',
  },
  MONSTER_HEAL: {
    id: '69008fb8eb39e74d32d2fd14',
    name: 'Monster Heal',
    targetActor: ACTORS.MONSTER.id,
    effect: 'monster_heal',
    value: 50,
    cost: 25,
    description: 'Heals the monster (troll mode)',
    icon: '💚',
  },
} as const;

// Package metadata for easy lookup
export const PACKAGE_BY_ID = {
  [PACKAGES.HEALTH_POTION.id]: PACKAGES.HEALTH_POTION,
  [PACKAGES.DAMAGE_BOOST.id]: PACKAGES.DAMAGE_BOOST,
  [PACKAGES.MONSTER_HEAL.id]: PACKAGES.MONSTER_HEAL,
} as const;

// Helper functions
export function getPackageById(packageId: string) {
  return PACKAGE_BY_ID[packageId as keyof typeof PACKAGE_BY_ID];
}

export function getActorById(actorId: string) {
  return Object.values(ACTORS).find((actor) => actor.id === actorId);
}

export function getEventById(eventId: string) {
  return Object.values(EVENTS).find((event) => event.id === eventId);
}

// API URLs
export const ARENA_API = {
  baseUrl: process.env.NEXT_PUBLIC_GAME_API_URL || 'https://airdrop-arcade.onrender.com/api',
  wsUrl: process.env.NEXT_PUBLIC_ARENA_SERVER_URL || 'wss://airdrop-arcade.onrender.com',
} as const;
