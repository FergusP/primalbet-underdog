const { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL, Keypair } = require('@solana/web3.js');
const path = require('path');

async function withdrawFromPDA(amountInSol) {
  // Load wallet from .env
  const envPath = path.join(__dirname, '.env');
  require('dotenv').config({ path: envPath });
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z');
  
  // Load backend wallet
  const privateKey = JSON.parse(process.env.BACKEND_WALLET_PRIVATE_KEY);
  const wallet = Keypair.fromSecretKey(Uint8Array.from(privateKey));
  
  console.log('Withdrawing to wallet:', wallet.publicKey.toString());
  
  // Derive PDA
  const [playerPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('player'), wallet.publicKey.toBuffer()],
    programId
  );
  
  // Check current balance
  const accountInfo = await connection.getAccountInfo(playerPDA);
  if (accountInfo && accountInfo.data.length >= 48) {
    const currentBalance = accountInfo.data.readBigUInt64LE(40);
    console.log('Current PDA balance:', Number(currentBalance) / LAMPORTS_PER_SOL, 'SOL');
  }
  
  // Create withdraw instruction
  const withdrawAmount = amountInSol * LAMPORTS_PER_SOL;
  
  // Manual instruction data: discriminator (8 bytes) + amount (8 bytes)
  const discriminator = Buffer.from([176, 181, 251, 79, 48, 70, 9, 74]); // withdraw_from_pda
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(withdrawAmount), 0);
  
  const data = Buffer.concat([discriminator, amountBuffer]);
  
  const instruction = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: playerPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
  
  const transaction = new Transaction().add(instruction);
  
  console.log(`\nWithdrawing ${amountInSol} SOL from PDA...`);
  
  const signature = await connection.sendTransaction(transaction, [wallet]);
  await connection.confirmTransaction(signature, 'confirmed');
  
  console.log('✅ Withdrawal successful!');
  console.log('Transaction:', signature);
  console.log(`View: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  
  // Check new balance
  const newAccountInfo = await connection.getAccountInfo(playerPDA);
  if (newAccountInfo && newAccountInfo.data.length >= 48) {
    const newBalance = newAccountInfo.data.readBigUInt64LE(40);
    console.log('\nNew PDA tracked balance:', Number(newBalance) / LAMPORTS_PER_SOL, 'SOL');
  }
  
  // Check wallet balance
  const walletBalance = await connection.getBalance(wallet.publicKey);
  console.log('Wallet balance:', walletBalance / LAMPORTS_PER_SOL, 'SOL');
}

// Withdraw amount from command line or default to 0.05 SOL
const amount = process.argv[2] ? parseFloat(process.argv[2]) : 0.05;
withdrawFromPDA(amount).catch(console.error);