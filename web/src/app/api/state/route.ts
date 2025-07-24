// Mock colosseum state endpoint for frontend development
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { ColosseumState } from '../../../types';
import { MONSTER_TIERS } from '../../../data/monsters';

export async function GET(request: NextRequest) {
  // Get selected monster from query params (for dev mode)
  const searchParams = request.nextUrl.searchParams;
  const selectedMonster = searchParams.get('monster') || 'SKELETON_WARRIOR';
  
  // Get monster tier data
  const monsterTier = MONSTER_TIERS[selectedMonster] || MONSTER_TIERS.SKELETON_WARRIOR;
  
  // Mock colosseum state matching INTERFACE_CONTRACT.md v6.0
  const mockState: ColosseumState = {
    currentMonster: {
      id: 'monster_001',
      type: selectedMonster,
      tier: monsterTier,
      baseHealth: monsterTier.baseHealth,
      currentHealth: monsterTier.baseHealth,
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