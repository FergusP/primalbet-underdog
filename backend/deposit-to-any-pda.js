const { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL, Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function depositToAnyPDA(keypairPath, amountInSol) {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z');
  
  // Load wallet from keypair file
  let wallet;
  if (keypairPath === 'backend') {
    // Use backend wallet from .env
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    const privateKey = JSON.parse(process.env.BACKEND_WALLET_PRIVATE_KEY);
    wallet = Keypair.fromSecretKey(Uint8Array.from(privateKey));
  } else {
    // Load from file path
    const privateKey = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    wallet = Keypair.fromSecretKey(Uint8Array.from(privateKey));
  }
  
  console.log('Depositing from wallet:', wallet.publicKey.toString());
  
  // Derive PDA for this wallet
  const [playerPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('player'), wallet.publicKey.toBuffer()],
    programId
  );
  
  console.log('Player PDA:', playerPDA.toString());
  
  // Check current balance
  const accountInfo = await connection.getAccountInfo(playerPDA);
  if (accountInfo && accountInfo.data.length >= 48) {
    const currentBalance = accountInfo.data.readBigUInt64LE(40);
    console.log('Current PDA balance:', Number(currentBalance) / LAMPORTS_PER_SOL, 'SOL');
  } else {
    console.log('No existing PDA account found - will be created on first game entry');
  }
  
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
  
  try {
    const signature = await connection.sendTransaction(transaction, [wallet]);
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log('✅ Deposit successful!');
    console.log('Transaction:', signature);
    console.log(`View: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    // Check new balance
    const newAccountInfo = await connection.getAccountInfo(playerPDA);
    if (newAccountInfo && newAccountInfo.data.length >= 48) {
      const balance = newAccountInfo.data.readBigUInt64LE(40);
      console.log('\nNew PDA tracked balance:', Number(balance) / LAMPORTS_PER_SOL, 'SOL');
    }
  } catch (error) {
    console.error('❌ Deposit failed:', error.message);
    if (error.logs) {
      console.error('Logs:', error.logs);
    }
  }
}

// Usage: node deposit-to-any-pda.js <keypair-path> <amount>
// Examples:
//   node deposit-to-any-pda.js backend 0.1
//   node deposit-to-any-pda.js /path/to/keypair.json 0.05
//   node deposit-to-any-pda.js ~/.config/solana/id.json 0.02

const keypairPath = process.argv[2] || 'backend';
const amount = parseFloat(process.argv[3]) || 0.1;

if (!keypairPath) {
  console.log('Usage: node deposit-to-any-pda.js <keypair-path|"backend"> <amount>');
  process.exit(1);
}

depositToAnyPDA(keypairPath, amount).catch(console.error);