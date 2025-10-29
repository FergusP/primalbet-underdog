/**
 * Arena Integration Service
 * Handles arena initialization and communication with backend
 */

import { VorldAuthService } from './vorld-auth';

export class ArenaIntegrationService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  /**
   * Initialize arena for logged-in player entering combat
   * Called automatically when combat starts and user is authenticated
   */
  static async initializeArena(
    playerWallet: string,
    streamUrl: string = 'https://primalbet.vercel.app'
  ): Promise<{ success: boolean; gameId?: string; error?: string }> {
    try {
      // Check if user is logged in
      if (!VorldAuthService.isAuthenticated()) {
        console.log('[Arena] User not logged in, skipping arena initialization');
        return { success: false, error: 'Not authenticated' };
      }

      // Get access token from authenticated session
      const profileResponse = await VorldAuthService.getProfile();
      if (!profileResponse.success || !profileResponse.user) {
        console.log('[Arena] Failed to get profile, skipping arena initialization');
        return { success: false, error: 'Not authenticated' };
      }

      // For now, we'll fetch the token from localStorage or cookies directly
      // This is a workaround since VorldAuthService doesn't expose getAccessToken
      const accessToken = this.getStoredAccessToken();

      if (!accessToken) {
        console.log('[Arena] User not logged in, skipping arena initialization');
        return { success: false, error: 'Not authenticated' };
      }

      console.log('[Arena] Initializing arena for player:', playerWallet);

      const response = await fetch(`${this.API_URL}/arena/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerWallet,
          userToken: accessToken,
          streamUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[Arena] Init failed:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to initialize arena',
        };
      }

      console.log('[Arena] Initialized successfully:', result.gameId);

      return {
        success: true,
        gameId: result.gameId,
      };
    } catch (error: any) {
      console.error('[Arena] Init error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * Emit game event to TheVorld
   */
  static async emitGameEvent(
    playerWallet: string,
    eventId: string,
    eventData?: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.API_URL}/arena/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerWallet,
          eventId,
          eventData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to emit event',
        };
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  /**
   * Cleanup arena session
   */
  static async cleanupArena(playerWallet: string): Promise<void> {
    try {
      await fetch(`${this.API_URL}/arena/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerWallet }),
      });
    } catch (error) {
      console.error('[Arena] Cleanup error:', error);
    }
  }

  /**
   * Get stored access token from cookies
   * This is a workaround to access the token without exposing it from VorldAuthService
   */
  private static getStoredAccessToken(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'vorld_access_token') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }
}
