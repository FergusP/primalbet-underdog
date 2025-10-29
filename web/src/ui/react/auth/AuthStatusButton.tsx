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
      style={{
        fontFamily: 'inherit',
        fontSize: '0.9rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        padding: '8px 20px',
        background: 'linear-gradient(135deg, #4a5d23 0%, #50c878 100%)',
        border: '2px solid #d4af37',
        borderRadius: '8px',
        color: '#f5f5dc',
        cursor: 'pointer',
        textTransform: 'uppercase',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 10px rgba(80, 200, 120, 0.3)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.4), 0 0 20px rgba(80, 200, 120, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 10px rgba(80, 200, 120, 0.3)';
      }}
    >
      🔐 Login (Optional)
    </button>
  );
}
