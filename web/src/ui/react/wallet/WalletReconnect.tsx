'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export function WalletReconnect() {
  const { connected } = useWallet();

  useEffect(() => {
    // The wallet adapter handles reconnection automatically with autoConnect
    // We just need to let the UI know when connection state changes
    console.log('Wallet connected:', connected);
  }, [connected]);

  // This component doesn't render anything
  return null;
}