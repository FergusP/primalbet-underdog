import { Router, Request, Response } from 'express';
import { SolanaService } from '../services/solana-service';
import { vrfService } from '../services/vrf-service';
import { getMonsterByPotSize, MONSTER_TIERS } from '../config/monsters';
import { VaultAttemptRequest, VaultAttemptResponse } from '../types';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function createRouter(solanaService: SolanaService): Router {
  const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get current game state
router.get('/state', async (req: Request, res: Response) => {
  try {
    const gameState = await solanaService.getGameState();
    const potInSol = gameState.currentPot / LAMPORTS_PER_SOL;
    const currentMonster = getMonsterByPotSize(potInSol);

    res.json({
      currentPot: gameState.currentPot,
      currentMonster,
      totalEntries: gameState.totalEntries,
      lastWinner: gameState.lastWinner,
      recentCombats: [] // Can be implemented later
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).json({ error: 'Failed to fetch game state' });
  }
});

// Vault attempt endpoint - VRF and claim in one go
router.post('/vault/attempt', async (req: Request, res: Response) => {
  try {
    const { wallet, combatId, monsterType } = req.body as VaultAttemptRequest;

    // Basic validation
    if (!wallet || !combatId || !monsterType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get current pot amount BEFORE any claim
    const currentPot = await solanaService.getCurrentPot();
    
    // Find the monster that the player actually fought
    const foughtMonster = Object.values(MONSTER_TIERS).find(m => m.name === monsterType);
    
    if (!foughtMonster) {
      return res.status(400).json({ error: 'Invalid monster type' });
    }
    
    // Use the crack chance of the monster they ACTUALLY FOUGHT
    // This ensures fairness - if you fought a Skeleton, you get Skeleton's 10% chance
    // even if the pot has grown and current monster is now a Dragon Lord
    const crackChance = foughtMonster.vaultCrackChance;

    console.log(`Player ${wallet} attempting vault crack:`, {
      foughtMonster: monsterType,
      crackChance: `${crackChance}%`,
      currentPot: `${(currentPot / LAMPORTS_PER_SOL).toFixed(4)} SOL`
    });

    // Call ProofNetwork VRF
    const vrfResult = await vrfService.rollVaultCrack(crackChance, wallet, combatId);

    if (vrfResult.success) {
      try {
        // DIRECTLY CLAIM THE PRIZE - entire current pot!
        const claimTx = await solanaService.claimPrizeForWinner(
          wallet,
          JSON.stringify(vrfResult.proof)
        );

        const response: VaultAttemptResponse = {
          success: true,
          roll: vrfResult.roll,
          crackChance,
          prizeAmount: currentPot,
          claimTx,
          message: `Vault cracked! ${(currentPot / LAMPORTS_PER_SOL).toFixed(4)} SOL transferred!`,
          vrfProof: vrfResult.proof
        };

        res.json(response);
      } catch (claimError) {
        console.error('Claim failed:', claimError);
        // Even if claim fails, return the VRF result
        res.json({
          success: true,
          roll: vrfResult.roll,
          crackChance,
          message: 'Vault cracked but claim failed. Please contact support.',
          vrfProof: vrfResult.proof,
          error: 'Claim transaction failed'
        });
      }
    } else {
      // Failed to crack vault
      const response: VaultAttemptResponse = {
        success: false,
        roll: vrfResult.roll,
        crackChance,
        message: `Vault resisted! You rolled ${vrfResult.roll}, needed less than ${crackChance}`,
        vrfProof: vrfResult.proof
      };

      res.json(response);
    }
  } catch (error) {
    console.error('Vault attempt error:', error);
    res.status(500).json({ error: 'Failed to process vault attempt' });
  }
});

// Get player profile
router.get('/player/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const playerAccount = await solanaService.getPlayerAccount(wallet);
    
    if (!playerAccount) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(playerAccount);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Failed to fetch player data' });
  }
});

// Get payment options for a player (hybrid payment system)
router.get('/player/:wallet/payment-options', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const paymentOptions = await solanaService.getPaymentOptions(wallet);
    
    res.json(paymentOptions);
  } catch (error) {
    console.error('Error getting payment options:', error);
    res.status(500).json({ error: 'Failed to get payment options' });
  }
});

// Gasless combat entry - backend submits transaction for player
router.post('/combat/enter-gasless', async (req: Request, res: Response) => {
  try {
    const { playerWallet } = req.body;
    
    if (!playerWallet) {
      return res.status(400).json({ error: 'Player wallet required' });
    }

    // Check player has sufficient PDA balance
    const paymentOptions = await solanaService.getPaymentOptions(playerWallet);
    if (!paymentOptions.canPayFromPDA) {
      return res.status(402).json({ error: 'Insufficient PDA balance' });
    }

    // Backend submits the transaction
    const txSignature = await solanaService.enterCombatGasless(playerWallet);

    res.json({
      success: true,
      txSignature,
      message: 'Entered combat using PDA balance (gasless)'
    });
  } catch (error: any) {
    console.error('Gasless entry error:', error);
    res.status(500).json({ 
      error: 'Failed to enter combat', 
      details: error.message 
    });
  }
});

// Backend wallet status (for monitoring)
router.get('/backend/status', async (req: Request, res: Response) => {
  try {
    const balance = await solanaService.ensureBackendBalance();
    res.json({
      balance: balance / LAMPORTS_PER_SOL,
      address: process.env.BACKEND_SIGNER,
      status: balance > 0.01 * LAMPORTS_PER_SOL ? 'healthy' : 'low_balance',
      programId: process.env.PROGRAM_ID,
      features: ['hybrid_payments', 'pda_deposits', 'gasless_gameplay', 'smart_prize_routing']
    });
  } catch (error) {
    console.error('Error checking backend status:', error);
    res.status(500).json({ error: 'Failed to check backend status' });
  }
});

  return router;
}

export default createRouter;