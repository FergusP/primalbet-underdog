/**
 * Type definitions for Vorld Auth integration
 * Based on official integrateVorldAuth.md documentation
 */

/**
 * User profile from Vorld Auth
 * Some fields are optional as they may not be included in all API responses
 */
export interface VorldUser {
  id?: string;
  email?: string;
  username: string;
  verified: boolean;
  authMethods?: string[]; // e.g., ['email', 'discord', 'google']
  totalConnectedAccounts?: number;
  states?: {
    developer: 'enabled' | 'disabled';
    gameDeveloper: 'enabled' | 'disabled';
  };
  wallets?: Array<{
    address: string;
    type: 'solana' | 'ethereum';
    isDefault: boolean;
  }>;
}

/**
 * Login response from Vorld Auth
 */
export interface LoginResponse {
  success: boolean;
  data?: {
    user?: VorldUser;
    accessToken?: string;
    refreshToken?: string;
    requiresOTP?: boolean;
    message?: string;
  };
  error?: string;
}

/**
 * OTP verification response
 */
export interface OTPVerificationResponse {
  success: boolean;
  data?: {
    user: VorldUser;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

/**
 * Profile fetch response
 */
export interface ProfileResponse {
  success: boolean;
  data?: {
    profile: VorldUser;
  };
  error?: string;
}

/**
 * Auth state for context
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: VorldUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Auth context value
 */
export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<LoginResponse>;
  verifyOTP: (email: string, otp: string) => Promise<OTPVerificationResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}
