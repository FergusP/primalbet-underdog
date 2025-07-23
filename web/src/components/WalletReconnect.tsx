'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export function WalletReconnect() {
  const { wallet, connect, connected, connecting } = useWallet();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if we have a stored wallet preference
    const storedWallet = localStorage.getItem('aurelius-wallet');
    
    // If we have a stored wallet and we're not connected/connecting, try to reconnect
    if (storedWallet && wallet && !connected && !connecting) {
      // Small delay to ensure wallet adapter is ready
      const timeoutId = setTimeout(() => {
        if (wallet.readyState === 'Installed' || wallet.readyState === 'Loadable') {
          console.log('Attempting to reconnect to', wallet.adapter.name);
          connect().catch(err => {
            console.error('Failed to reconnect wallet:', err);
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [wallet, connect, connected, connecting]);

  // This component doesn't render anything
  return null;
}