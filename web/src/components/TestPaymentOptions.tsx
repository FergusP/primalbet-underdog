'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { GameService } from '@/services/GameService';
import { PaymentOptions } from '@/types';

export const TestPaymentOptions: React.FC = () => {
  const { publicKey } = useWallet();
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      fetchPaymentOptions();
    }
  }, [publicKey]);

  const fetchPaymentOptions = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setError(null);
      const options = await GameService.getPaymentOptions(publicKey.toString());
      setPaymentOptions(options);
      console.log('Payment options:', options);
    } catch (err) {
      console.error('Failed to fetch payment options:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return <div className="p-4 bg-gray-800 rounded">Please connect your wallet first</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded space-y-4">
      <h3 className="text-xl font-bold">Payment Options Test</h3>
      
      {loading && <p>Loading payment options...</p>}
      
      {error && (
        <div className="bg-red-900 p-3 rounded">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}
      
      {paymentOptions && (
        <div className="space-y-2">
          <p>Has Account: {paymentOptions.hasAccount ? '✅ Yes' : '❌ No'}</p>
          <p>PDA Balance: {(paymentOptions.pdaBalance / 1e9).toFixed(4)} SOL</p>
          <p>Can Use Wallet: {paymentOptions.canUseWallet ? '✅ Yes' : '❌ No'}</p>
          <p>Can Use PDA: {paymentOptions.canUsePDA ? '✅ Yes' : '❌ No'}</p>
          <p>Last Payment Method: {paymentOptions.lastPaymentMethod || 'None'}</p>
        </div>
      )}
      
      <button 
        onClick={fetchPaymentOptions}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        disabled={loading}
      >
        Refresh
      </button>
    </div>
  );
};