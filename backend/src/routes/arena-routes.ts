/**
 * Arena Routes (Backend)
 * Handles arena-related API endpoints
 */

import { Router, Request, Response } from 'express';
import { arenaService } from '../services/arena-service';
import { EVENTS } from '../config/arena-config';

const router = Router();

/**
 * Initialize arena for authenticated player
 * POST /api/arena/init
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    const { playerWallet, userToken, streamUrl } = req.body;

    if (!playerWallet || !userToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: playerWallet, userToken',
      });
    }

    // Check if already has active session
    if (arenaService.hasActiveSession(playerWallet)) {
      const session = arenaService.getSession(playerWallet);
      return res.json({
        success: true,
        message: 'Arena session already active',
        gameId: session?.gameId,
      });
    }

    // Initialize new arena session
    const result = await arenaService.initializePlayerArena(
      playerWallet,
      userToken,
      streamUrl
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Arena initialized successfully',
        gameId: result.gameId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('[Arena Routes] Init error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize arena',
    });
  }
});

/**
 * Get arena status for player
 * GET /api/arena/status/:playerWallet
 */
router.get('/status/:playerWallet', (req: Request, res: Response) => {
  try {
    const { playerWallet } = req.params;

    const session = arenaService.getSession(playerWallet);

    if (!session) {
      return res.json({
        success: true,
        active: false,
      });
    }

    res.json({
      success: true,
      active: true,
      gameId: session.gameId,
      expiresAt: session.expiresAt,
      connected: session.socket?.connected || false,
    });
  } catch (error: any) {
    console.error('[Arena Routes] Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Emit game event to TheVorld
 * POST /api/arena/event
 */
router.post('/event', async (req: Request, res: Response) => {
  try {
    const { playerWallet, eventId, eventData } = req.body;

    if (!playerWallet || !eventId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: playerWallet, eventId',
      });
    }

    const result = await arenaService.emitGameEvent(
      playerWallet,
      eventId,
      eventData
    );

    res.json(result);
  } catch (error: any) {
    console.error('[Arena Routes] Event emit error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Simulate viewer package purchase (for testing)
 * POST /api/arena/package
 */
router.post('/package', (req: Request, res: Response) => {
  try {
    const { playerWallet, packageId, packageName } = req.body;

    if (!playerWallet || !packageId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: playerWallet, packageId',
      });
    }

    console.log(`[Arena Routes] Package received: ${packageName} (${packageId}) for ${playerWallet}`);

    // Broadcast package event to frontend
    const packageEvent = {
      playerWallet,
      itemId: packageId,
      itemName: packageName || 'Unknown Package',
      timestamp: Date.now(),
    };

    // This will be picked up by the WebSocket broadcaster in index.ts
    arenaService.broadcastPackage(packageEvent);

    res.json({
      success: true,
      message: `Package ${packageName} delivered to player`,
    });
  } catch (error: any) {
    console.error('[Arena Routes] Package delivery error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Cleanup arena session
 * POST /api/arena/cleanup
 */
router.post('/cleanup', (req: Request, res: Response) => {
  try {
    const { playerWallet } = req.body;

    if (!playerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Missing playerWallet',
      });
    }

    arenaService.cleanupSession(playerWallet);

    res.json({
      success: true,
      message: 'Arena session cleaned up',
    });
  } catch (error: any) {
    console.error('[Arena Routes] Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
