'use client';

/**
 * Auth Status Button Component
 * Shows login button when not authenticated, user info when authenticated
 * Place in top-right corner of game UI
 */

import { useRouter } from 'next/navigation';
import { useVorldAuth } from '@/contexts/VorldAuthContext';

export function AuthStatusButton() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useVorldAuth();

  if (loading) {
    return (
      <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 animate-pulse">
        <div className="h-4 w-20 bg-gray-700 rounded" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <button
        onClick={() => router.push('/profile')}
        className="px-4 py-2 bg-purple-900/50 hover:bg-purple-900/70 rounded-lg border border-purple-600 transition flex items-center gap-2"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white font-medium">{user.username}</span>
        <span className="text-purple-300 text-sm">Streaming Mode</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push('/auth/login')}
      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition flex items-center gap-2"
    >
      <span className="text-gray-300">Login</span>
      <span className="text-xs text-gray-500">(Optional)</span>
    </button>
  );
}
