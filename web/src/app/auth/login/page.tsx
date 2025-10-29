'use client';

/**
 * Vorld Auth Login Page
 * Optional authentication for enabling viewer interaction features
 *
 * Flow:
 * 1. Email + Password → Login
 * 2. If OTP required → Show OTP input
 * 3. Verify OTP → Redirect to profile/game
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVorldAuth } from '@/contexts/VorldAuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyOTP, isAuthenticated } = useVorldAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // UI state
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/profile');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        if (result.data?.requiresOTP) {
          // OTP required - show OTP input
          setShowOtp(true);
        } else {
          // Login successful - redirect to profile
          router.push('/profile');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP(email, otp);

      if (result.success) {
        // OTP verified - redirect to profile
        router.push('/profile');
      } else {
        setError(result.error || 'OTP verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎮 PrimalBet
          </h1>
          <p className="text-gray-300">
            {showOtp ? 'Verify Your Email' : 'Login to Enable Streaming Mode'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Optional - Login to allow viewers to interact with your game
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        {!showOtp ? (
          <form
            onSubmit={handleLogin}
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg border border-gray-700 shadow-2xl"
          >
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none transition"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none transition"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Password is encrypted with SHA-256 before transmission
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login with Email'
              )}
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-white text-sm transition"
              >
                ← Skip and Play as Guest
              </button>
            </div>
          </form>
        ) : (
          /* OTP Verification Form */
          <form
            onSubmit={handleOtpVerification}
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg border border-gray-700 shadow-2xl"
          >
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium text-center">
                Enter 6-Digit Code
              </label>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Check your email ({email}) for the verification code
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                className="w-full p-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none transition text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setOtp('');
                  setError('');
                }}
                className="text-gray-400 hover:text-white text-sm transition"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
          <p className="text-blue-200 text-sm">
            <strong>ℹ️ Why Login?</strong>
            <br />
            Logging in with Vorld Auth allows viewers watching your stream to
            send you items, boosts, and interact with your gameplay in real-time
            using Arena Coins.
          </p>
        </div>
      </div>
    </div>
  );
}
