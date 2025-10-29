/**
 * Cryptographic utilities for Vorld Auth integration
 * Uses Web Crypto API for SHA-256 hashing
 */

/**
 * Hash a password using SHA-256
 * CRITICAL: Vorld Auth requires passwords to be hashed before transmission
 *
 * @param password - Plain text password
 * @returns Hex-encoded SHA-256 hash
 */
export async function sha256(password: string): Promise<string> {
  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Hash using Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Example usage:
 *
 * const hashedPassword = await sha256('mySecretPassword123');
 * // Returns: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
 *
 * // Use in API call:
 * await fetch('/api/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     email: 'user@example.com',
 *     password: hashedPassword // Never send plain text!
 *   })
 * });
 */
