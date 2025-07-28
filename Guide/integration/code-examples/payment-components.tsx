// Payment Method Toggle Component
import React from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface PaymentMethodToggleProps {
  selectedMethod: 'wallet' | 'pda';
  onMethodChange: (method: 'wallet' | 'pda') => void;
  pdaBalance: number;
  entryFee: number;
}

export const PaymentMethodToggle: React.FC<PaymentMethodToggleProps> = ({
  selectedMethod,
  onMethodChange,
  pdaBalance,
  entryFee,
}) => {
  const canUsePDA = pdaBalance >= entryFee;

  return (
    <div className="payment-toggle-container">
      <div className="toggle-switch">
        <button
          className={`toggle-option ${
            selectedMethod === 'wallet' ? 'active' : ''
          }`}
          onClick={() => onMethodChange('wallet')}
        >
          <span>💳 Wallet Entry</span>
          <span className="subtitle">Pay from wallet</span>
        </button>
        <button
          className={`toggle-option ${
            selectedMethod === 'pda' ? 'active' : ''
          }`}
          onClick={() => onMethodChange('pda')}
          disabled={!canUsePDA}
        >
          <span>⚡ Gasless Entry</span>
          <span className="subtitle">Use PDA balance</span>
        </button>
      </div>
    </div>
  );
};

// PDA Balance Indicator Component
interface PDABalanceIndicatorProps {
  pdaBalance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
}

export const PDABalanceIndicator: React.FC<PDABalanceIndicatorProps> = ({
  pdaBalance,
  onDeposit,
  onWithdraw,
}) => {
  const balanceInSol = pdaBalance / LAMPORTS_PER_SOL;

  return (
    <div className="pda-balance-indicator">
      <div className="balance-display">
        <span className="label">PDA Balance:</span>
        <span className="amount">{balanceInSol.toFixed(4)} SOL</span>
      </div>
      <div className="balance-actions">
        <button className="deposit-btn" onClick={onDeposit}>
          + Deposit
        </button>
        <button
          className="withdraw-btn"
          onClick={onWithdraw}
          disabled={pdaBalance === 0}
        >
          - Withdraw
        </button>
      </div>
    </div>
  );
};

// PDA Deposit Modal Component
import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  Transaction,
  SystemProgram,
  PublicKey,
} from '@solana/web3.js';

interface PDADepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PDADepositModal: React.FC<PDADepositModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('0.1');
  const [loading, setLoading] = useState(false);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const handleDeposit = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);

      // Build deposit instruction
      const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
      const [playerPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('player'), publicKey.toBuffer()],
        programId
      );

      const depositIx = {
        programId,
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: playerPDA, isSigner: false, isWritable: true },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: Buffer.concat([
          Buffer.from([15, 100, 42, 57, 235, 206, 59, 185]), // deposit_to_pda discriminator
          Buffer.from(
            new BigUint64Array([BigInt(Number(amount) * LAMPORTS_PER_SOL)])
              .buffer
          ),
        ]),
      };

      const transaction = new Transaction().add(depositIx);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Deposit to PDA</h2>
        <p>Deposit SOL for gasless gameplay</p>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          placeholder="Amount in SOL"
        />

        <div className="modal-actions">
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button onClick={handleDeposit} disabled={loading || !amount}>
            {loading ? 'Depositing...' : 'Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
};