/**
 * Vorld Authentication Service
 * Handles all API communication with Vorld Auth backend
 *
 * Based on official integrateVorldAuth.md documentation
 * CRITICAL: Passwords must be SHA-256 hashed before transmission
 */

import { sha256 } from '../lib/crypto';
import { authCookies } from '../lib/cookies';
import type {
  LoginResponse,
  OTPVerificationResponse,
  ProfileResponse,
} from '../types/vorld-auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'https://vorld-auth.onrender.com/api';
const VORLD_APP_ID = process.env.NEXT_PUBLIC_VORLD_APP_ID || '';

/**
 * Vorld Auth Service
 * All methods return typed responses with success/error structure
 */
export class VorldAuthService {
  /**
   * Login with email and password
   * Password is automatically hashed with SHA-256 before sending
   *
   * @param email - User email address
   * @param password - Plain text password (will be hashed)
   * @returns LoginResponse with user data or requiresOTP flag
   */
  static async loginWithEmail(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    try {
      // CRITICAL: Hash password with SHA-256 before sending
      const hashedPassword = await sha256(password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vorld-app-id': VORLD_APP_ID,
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          email,
          password: hashedPassword, // Send hashed, never plain text!
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      // API returns { success: true, data: { accessToken, refreshToken, user } }
      const { data } = result;

      // If login successful and no OTP required, store tokens
      if (data.accessToken && data.refreshToken) {
        authCookies.setTokens(data.accessToken, data.refreshToken);
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('[VorldAuth] Login error:', error);
      return {
        success: false,
        error: error.message || 'Network error during login',
      };
    }
  }

  /**
   * Verify OTP code sent to email
   *
   * @param email - User email address
   * @param otp - 6-digit OTP code
   * @returns OTPVerificationResponse with user data and tokens
   */
  static async verifyOTP(
    email: string,
    otp: string
  ): Promise<OTPVerificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vorld-app-id': VORLD_APP_ID,
        },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      // API returns { success: true, data: { accessToken, refreshToken, user } }
      const { data } = result;

      // Store tokens after successful OTP verification
      if (data.accessToken && data.refreshToken) {
        authCookies.setTokens(data.accessToken, data.refreshToken);
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('[VorldAuth] OTP verification error:', error);
      return {
        success: false,
        error: error.message || 'Network error during OTP verification',
      };
    }
  }

  /**
   * Get user profile
   * Requires valid access token in cookies
   *
   * @returns ProfileResponse with user profile data
   */
  static async getProfile(): Promise<ProfileResponse> {
    try {
      const accessToken = authCookies.getAccessToken();

      if (!accessToken) {
        return {
          success: false,
          error: 'No access token found - please login',
        };
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'x-vorld-app-id': VORLD_APP_ID,
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        // Token might be expired
        if (response.status === 401) {
          authCookies.clearTokens();
          return {
            success: false,
            error: 'Session expired - please login again',
          };
        }

        return {
          success: false,
          error: result.message || `HTTP ${response.status}`,
        };
      }

      // API returns { success: true, data: { profile: {...} } }
      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      console.error('[VorldAuth] Get profile error:', error);
      return {
        success: false,
        error: error.message || 'Network error fetching profile',
      };
    }
  }

  /**
   * Logout user
   * Clears all auth cookies and tokens
   */
  static logout(): void {
    authCookies.clearTokens();
    console.log('[VorldAuth] User logged out');
  }

  /**
   * Check if user is authenticated
   * Simply checks if access token exists (doesn't validate)
   */
  static isAuthenticated(): boolean {
    return authCookies.hasAuth();
  }
}
