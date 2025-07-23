// Mock colosseum state endpoint for frontend development
import { NextResponse } from 'next/server';
import { ColosseumState } from '../../../types';

export async function GET() {
  // Mock colosseum state matching INTERFACE_CONTRACT.md v6.0
  const mockState: ColosseumState = {
    currentMonster: {
      id: 'monster_001',
      type: 'Skeleton Warrior',
      tier: {
        name: 'Skeleton Warrior',
        sprite: 'skeleton-placeholder',
        poolRange: [1, 10] as [number, number],
        baseHealth: 80,
        attackPower: 15,
        defenseMultiplier: 0.9,
        vaultCrackChance: 0.1,
        entryFee: 100000000, // 0.1 SOL in lamports
        animations: {
          idle: 'skeleton-idle',
          attack: 'skeleton-attack',
          hurt: 'skeleton-hurt',
          death: 'skeleton-death'
        }
      },
      baseHealth: 80,
      currentHealth: 80,
      spawnedAt: Date.now() - 300000, // 5 minutes ago
      defeatedBy: null,
      totalCombats: 3,
      victories: 1
    },
    currentJackpot: 2450000000, // 2.45 SOL in lamports
    lastWinner: null,
    totalEntries: 127,
    recentCombats: [
      {
        gladiator: '7xKX...9pqM',
        monster: 'Goblin Shaman',
        victory: true,
        vaultAttempted: true,
        vaultCracked: false,
        timestamp: Date.now() - 30000
      },
      {
        gladiator: '4mN2...8kL7',
        monster: 'Skeleton Warrior',
        victory: false,
        vaultAttempted: false,
        vaultCracked: false,
        timestamp: Date.now() - 120000
      },
      {
        gladiator: '9qR5...3vW6',
        monster: 'Skeleton Warrior',
        victory: true,
        vaultAttempted: true,
        vaultCracked: true,
        timestamp: Date.now() - 180000
      }
    ]
  };

  return NextResponse.json(mockState);
}