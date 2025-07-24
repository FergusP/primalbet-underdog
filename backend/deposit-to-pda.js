const { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL, Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function depositToPDA(amountInSol) {
  // Load wallet from .env
  const envPath = path.join(__dirname, '.env');
  require('dotenv').config({ path: envPath });
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z');
  
  // Load backend wallet
  const privateKey = JSON.parse(process.env.BACKEND_WALLET_PRIVATE_KEY);
  const wallet = Keypair.fromSecretKey(Uint8Array.from(privateKey));
  
  console.log('Depositing from wallet:', wallet.publicKey.toString());
  
  // Derive PDA
  const [playerPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('player'), wallet.publicKey.toBuffer()],
    programId
  );
  
  // Create deposit instruction
  const depositAmount = amountInSol * LAMPORTS_PER_SOL;
  
  // Manual instruction data: discriminator (8 bytes) + amount (8 bytes)
  const discriminator = Buffer.from([15, 100, 42, 57, 235, 206, 59, 185]);
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(depositAmount), 0);
  
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
  
  console.log(`\nDepositing ${amountInSol} SOL to PDA...`);
  
  const signature = await connection.sendTransaction(transaction, [wallet]);
  await connection.confirmTransaction(signature, 'confirmed');
  
  console.log('✅ Deposit successful!');
  console.log('Transaction:', signature);
  console.log(`View: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  
  // Check new balance
  const accountInfo = await connection.getAccountInfo(playerPDA);
  if (accountInfo && accountInfo.data.length >= 48) {
    const balance = accountInfo.data.readBigUInt64LE(40);
    console.log('\nNew PDA tracked balance:', Number(balance) / LAMPORTS_PER_SOL, 'SOL');
  }
}

// Deposit 0.1 SOL (enough for 10 games)
depositToPDA(0.1).catch(console.error);