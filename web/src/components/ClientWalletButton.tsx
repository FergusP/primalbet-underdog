'use client';

import { useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function ClientWalletButton({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render on client side to avoid hydration mismatch
  if (!mounted) {
    return (
      <button className={className}>
        Select Wallet
      </button>
    );
  }

  return <WalletMultiButton className={className} />;
}