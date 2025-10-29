/**
 * Cookie management utilities for auth token storage
 * Handles access tokens and refresh tokens from Vorld Auth
 */

interface CookieOptions {
  maxAge?: number; // seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with options
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  const {
    maxAge = 7 * 24 * 60 * 60, // 7 days default
    path = '/',
    secure = true,
    sameSite = 'lax',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  cookieString += `; path=${path}`;
  cookieString += `; max-age=${maxAge}`;

  if (secure) {
    cookieString += '; secure';
  }

  cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      const value = cookie.substring(nameEQ.length);
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path: string = '/'): void {
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0`;
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

// Cookie names used by Vorld Auth
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'vorld_access_token',
  REFRESH_TOKEN: 'vorld_refresh_token',
  USER_ID: 'vorld_user_id',
} as const;

/**
 * Helper functions for auth tokens
 */
export const authCookies = {
  setTokens(accessToken: string, refreshToken: string): void {
    setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      maxAge: 60 * 60, // 1 hour
      secure: true,
    });
    setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      secure: true,
    });
  },

  getAccessToken(): string | null {
    return getCookie(COOKIE_NAMES.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return getCookie(COOKIE_NAMES.REFRESH_TOKEN);
  },

  clearTokens(): void {
    deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
    deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
    deleteCookie(COOKIE_NAMES.USER_ID);
  },

  hasAuth(): boolean {
    return hasCookie(COOKIE_NAMES.ACCESS_TOKEN);
  },
};
