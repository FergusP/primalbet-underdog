'use client';

/**
 * Vorld Auth Context
 * Provides global authentication state and methods to the app
 *
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useVorldAuth();
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VorldAuthService } from '../services/vorld-auth';
import type {
  AuthContextValue,
  VorldUser,
  LoginResponse,
  OTPVerificationResponse,
} from '../types/vorld-auth';

const VorldAuthContext = createContext<AuthContextValue | undefined>(undefined);

export function VorldAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<VorldUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check authentication status on mount
   * Fetches user profile if token exists
   */
  useEffect(() => {
    const checkAuth = async () => {
      if (VorldAuthService.isAuthenticated()) {
        const result = await VorldAuthService.getProfile();

        if (result.success && result.data) {
          setUser(result.data.profile);
        } else {
          // Token exists but is invalid/expired
          setUser(null);
          setError(result.error || null);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      setLoading(true);
      setError(null);

      const result = await VorldAuthService.loginWithEmail(email, password);

      if (result.success && result.data) {
        // If no OTP required, set user immediately
        if (!result.data.requiresOTP && result.data.user) {
          setUser(result.data.user);
        }
      } else {
        setError(result.error || 'Login failed');
      }

      setLoading(false);
      return result;
    },
    []
  );

  /**
   * Verify OTP code
   */
  const verifyOTP = useCallback(
    async (email: string, otp: string): Promise<OTPVerificationResponse> => {
      setLoading(true);
      setError(null);

      const result = await VorldAuthService.verifyOTP(email, otp);

      if (result.success && result.data) {
        setUser(result.data.user);
      } else {
        setError(result.error || 'OTP verification failed');
      }

      setLoading(false);
      return result;
    },
    []
  );

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    VorldAuthService.logout();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Refresh user profile data
   */
  const refreshProfile = useCallback(async () => {
    if (!VorldAuthService.isAuthenticated()) {
      return;
    }

    const result = await VorldAuthService.getProfile();

    if (result.success && result.data) {
      setUser(result.data.profile);
    } else {
      // If profile fetch fails, assume session expired
      logout();
    }
  }, [logout]);

  const value: AuthContextValue = {
    isAuthenticated: user !== null,
    user,
    loading,
    error,
    login,
    verifyOTP,
    logout,
    refreshProfile,
  };

  return (
    <VorldAuthContext.Provider value={value}>
      {children}
    </VorldAuthContext.Provider>
  );
}

/**
 * Hook to use Vorld Auth context
 * Throws error if used outside of VorldAuthProvider
 */
export function useVorldAuth(): AuthContextValue {
  const context = useContext(VorldAuthContext);

  if (context === undefined) {
    throw new Error('useVorldAuth must be used within VorldAuthProvider');
  }

  return context;
}
