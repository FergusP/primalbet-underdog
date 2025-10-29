'use client';

/**
 * Vorld User Profile Page
 * Displays user information, connected accounts, and developer status
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVorldAuth } from '@/contexts/VorldAuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout, refreshProfile } = useVorldAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Refresh profile on mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    }
  }, [isAuthenticated, refreshProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {user.username}
            </h1>
            <p className="text-gray-400">Vorld Profile</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-medium"
          >
            ← Back to Game
          </button>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Info */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-2">👤</span> Basic Information
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400">Username</div>
                <div className="text-white font-medium">{user.username}</div>
              </div>
              {user.email && (
                <div>
                  <div className="text-sm text-gray-400">Email</div>
                  <div className="text-white font-medium">{user.email}</div>
                </div>
              )}
              {user.id && (
                <div>
                  <div className="text-sm text-gray-400">User ID</div>
                  <div className="text-gray-300 font-mono text-sm">{user.id}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-400">Status</div>
                <div>
                  {user.verified ? (
                    <span className="inline-flex items-center px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-900/50 text-yellow-300 rounded-full text-sm">
                      ⚠ Not Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🔗</span> Connected Accounts
            </h2>
            <div className="space-y-3">
              {user.totalConnectedAccounts !== undefined && (
                <div>
                  <div className="text-sm text-gray-400">Total Accounts</div>
                  <div className="text-2xl font-bold text-white">
                    {user.totalConnectedAccounts}
                  </div>
                </div>
              )}
              {user.authMethods && user.authMethods.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-2">Auth Methods</div>
                  <div className="flex flex-wrap gap-2">
                    {user.authMethods.map((method) => (
                      <span
                        key={method}
                        className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm font-medium uppercase"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(!user.authMethods || user.authMethods.length === 0) && !user.totalConnectedAccounts && (
                <p className="text-gray-400 text-sm">
                  Logged in with email authentication
                </p>
              )}
            </div>
          </div>

          {/* Developer Status */}
          {user.states && (
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">⚙️</span> Developer Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Developer Mode</span>
                  {user.states.developer === 'enabled' ? (
                    <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">
                      Enabled
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-sm">
                      Disabled
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Game Developer</span>
                  {user.states.gameDeveloper === 'enabled' ? (
                    <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">
                      Enabled
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-sm">
                      Disabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Wallets */}
          {user.wallets && user.wallets.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">💰</span> Connected Wallets
              </h2>
              <div className="space-y-3">
                {user.wallets.map((wallet, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-700/50 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400 uppercase">
                        {wallet.type}
                      </span>
                      {wallet.isDefault && (
                        <span className="text-xs text-purple-400">Default</span>
                      )}
                    </div>
                    <div className="text-white font-mono text-sm break-all">
                      {wallet.address}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-700">
          <h3 className="text-lg font-bold text-white mb-3">Streaming Mode</h3>
          <p className="text-gray-300 mb-4">
            Your Vorld account is connected! When you enter combat, viewers can
            send you items and boosts using Arena Coins to help or hinder your
            gameplay.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-bold"
            >
              🎮 Start Playing
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-900/50 hover:bg-red-900/70 text-red-300 rounded-lg transition font-medium border border-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
