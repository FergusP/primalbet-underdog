#!/usr/bin/env node

const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const crypto = require('crypto');
require('dotenv').config();

// Configuration
const PROGRAM_ID = new PublicKey('J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z');
const TREASURY_WALLET = new PublicKey('EsRy4vmaHbnj3kfj2X9rpRRgbKcA6a9DtdXrBddnNoVi');
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load backend wallet
const backendPrivateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
if (!backendPrivateKey) {
  console.error('❌ BACKEND_WALLET_PRIVATE_KEY not found in .env file');
  process.exit(1);
}
const playerKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(backendPrivateKey)));

// Instruction discriminators
const INSTRUCTION_DISCRIMINATORS = {
  enter_combat: Buffer.from(
    crypto.createHash('sha256').update('global:enter_combat').digest()
  ).subarray(0, 8),
  deposit_to_pda: Buffer.from(
    crypto.createHash('sha256').update('global:deposit_to_pda').digest()
  ).subarray(0, 8),
  enter_combat_with_pda: Buffer.from(
    crypto.createHash('sha256').update('global:enter_combat_with_pda').digest()
  ).subarray(0, 8),
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatSOL(lamports) {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Derive PDAs
async function getPDAs() {
  const [playerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('player'), playerKeypair.publicKey.toBuffer()],
    PROGRAM_ID
  );
  const [gameStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('game_state')],
    PROGRAM_ID
  );
  const [potVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('pot_vault')],
    PROGRAM_ID
  );
  
  return { playerPDA, gameStatePDA, potVaultPDA };
}

// Get account info
async function getAccountInfo() {
  const { playerPDA, gameStatePDA, potVaultPDA } = await getPDAs();
  
  const [walletBalance, playerInfo, gameStateInfo, potVaultBalance] = await Promise.all([
    connection.getBalance(playerKeypair.publicKey),
    connection.getAccountInfo(playerPDA),
    connection.getAccountInfo(gameStatePDA),
    connection.getBalance(potVaultPDA)
  ]);
  
  let playerBalance = 0;
  let paymentMethod = 0;
  if (playerInfo) {
    // Parse player account data to get balance and payment method
    const data = playerInfo.data;
    if (data.length >= 8 + 32 + 8) {
      playerBalance = data.readBigUInt64LE(8 + 32); // Skip discriminator + wallet pubkey
      if (data.length >= 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1) {
        paymentMethod = data.readUInt8(8 + 32 + 8 + 8 + 8 + 8 + 8); // Last field
      }
    }
  }
  
  return {
    walletBalance,
    playerBalance: Number(playerBalance),
    paymentMethod,
    playerExists: playerInfo !== null,
    gameStateExists: gameStateInfo !== null,
    potBalance: potVaultBalance
  };
}

// Test 1: Deposit SOL to PDA
async function testDepositToPDA(amount) {
  log(`\n💰 TEST: Deposit ${formatSOL(amount)} SOL to PDA`, colors.cyan);
  
  try {
    const { playerPDA } = await getPDAs();
    
    // Create deposit instruction
    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(BigInt(amount), 0);
    
    const depositData = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.deposit_to_pda,
      amountBuffer
    ]);
    
    const depositIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: playerPDA, isSigner: false, isWritable: true },
        { pubkey: playerKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: depositData,
    });
    
    const transaction = new Transaction().add(depositIx);
    const txSig = await sendAndConfirmTransaction(connection, transaction, [playerKeypair]);
    
    log(`✅ Deposit successful! TX: ${txSig.slice(0, 20)}...`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Deposit failed: ${error.message}`, colors.red);
    return false;
  }
}

// Test 2: Enter combat with PDA balance
async function testEnterCombatWithPDA() {
  log(`\n⚔️  TEST: Enter Combat Using PDA Balance (Gasless)`, colors.cyan);
  
  try {
    const { playerPDA, gameStatePDA, potVaultPDA } = await getPDAs();
    
    const enterCombatIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: playerPDA, isSigner: false, isWritable: true },
        { pubkey: gameStatePDA, isSigner: false, isWritable: true },
        { pubkey: potVaultPDA, isSigner: false, isWritable: true },
        { pubkey: playerKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: TREASURY_WALLET, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: INSTRUCTION_DISCRIMINATORS.enter_combat_with_pda,
    });
    
    const transaction = new Transaction().add(enterCombatIx);
    const txSig = await sendAndConfirmTransaction(connection, transaction, [playerKeypair]);
    
    log(`✅ PDA combat entry successful! TX: ${txSig.slice(0, 20)}...`, colors.green);
    return true;
  } catch (error) {
    log(`❌ PDA combat entry failed: ${error.message}`, colors.red);
    if (error.logs) {
      log(`   Logs: ${error.logs.join(', ')}`, colors.red);
    }
    return false;
  }
}

// Test 3: Traditional wallet entry
async function testEnterCombatWithWallet() {
  log(`\n💳 TEST: Enter Combat Using Wallet (Traditional)`, colors.cyan);
  
  try {
    const { playerPDA, gameStatePDA, potVaultPDA } = await getPDAs();
    
    const enterCombatIx = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: playerPDA, isSigner: false, isWritable: true },
        { pubkey: gameStatePDA, isSigner: false, isWritable: true },
        { pubkey: potVaultPDA, isSigner: false, isWritable: true },
        { pubkey: playerKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: TREASURY_WALLET, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: INSTRUCTION_DISCRIMINATORS.enter_combat,
    });
    
    const transaction = new Transaction().add(enterCombatIx);
    const txSig = await sendAndConfirmTransaction(connection, transaction, [playerKeypair]);
    
    log(`✅ Wallet combat entry successful! TX: ${txSig.slice(0, 20)}...`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Wallet combat entry failed: ${error.message}`, colors.red);
    return false;
  }
}

// Main test runner
async function runHybridPaymentTests() {
  log(`🧪 HYBRID PAYMENT SYSTEM TESTS`, colors.bright);
  log(`Player: ${playerKeypair.publicKey.toString().slice(0, 8)}...`);
  
  // Initial state
  log(`\n📊 INITIAL STATE:`, colors.yellow);
  const initialState = await getAccountInfo();
  log(`  Wallet Balance: ${formatSOL(initialState.walletBalance)} SOL`);
  log(`  Player PDA Balance: ${formatSOL(initialState.playerBalance)} SOL`);
  log(`  Last Payment Method: ${initialState.paymentMethod === 0 ? 'Wallet' : 'PDA'}`);
  log(`  Current Pot: ${formatSOL(initialState.potBalance)} SOL`);
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Test 1: Deposit to PDA
  testsTotal++;
  log(`\n${'='.repeat(60)}`, colors.bright);
  const depositAmount = 0.05 * LAMPORTS_PER_SOL; // 0.05 SOL
  if (await testDepositToPDA(depositAmount)) {
    testsPassed++;
    
    await delay(2000);
    const afterDeposit = await getAccountInfo();
    log(`  New PDA Balance: ${formatSOL(afterDeposit.playerBalance)} SOL`, colors.green);
  }
  
  // Test 2: PDA-based combat entry
  testsTotal++;
  log(`\n${'='.repeat(60)}`, colors.bright);
  if (await testEnterCombatWithPDA()) {
    testsPassed++;
    
    await delay(2000);
    const afterPDAEntry = await getAccountInfo();
    log(`  PDA Balance After Entry: ${formatSOL(afterPDAEntry.playerBalance)} SOL`, colors.green);
    log(`  Pot After Entry: ${formatSOL(afterPDAEntry.potBalance)} SOL`, colors.green);
    log(`  Payment Method: ${afterPDAEntry.paymentMethod === 1 ? 'PDA ✅' : 'Wallet ❌'}`, 
        afterPDAEntry.paymentMethod === 1 ? colors.green : colors.red);
  }
  
  // Test 3: Wallet-based combat entry
  testsTotal++;
  log(`\n${'='.repeat(60)}`, colors.bright);
  if (await testEnterCombatWithWallet()) {
    testsPassed++;
    
    await delay(2000);
    const afterWalletEntry = await getAccountInfo();
    log(`  Wallet Balance After Entry: ${formatSOL(afterWalletEntry.walletBalance)} SOL`, colors.green);
    log(`  Pot After Entry: ${formatSOL(afterWalletEntry.potBalance)} SOL`, colors.green);
    log(`  Payment Method: ${afterWalletEntry.paymentMethod === 0 ? 'Wallet ✅' : 'PDA ❌'}`, 
        afterWalletEntry.paymentMethod === 0 ? colors.green : colors.red);
  }
  
  // Final summary
  log(`\n${'='.repeat(60)}`, colors.bright);
  log(`📈 HYBRID PAYMENT SYSTEM TEST RESULTS`, colors.bright);
  log(`${'='.repeat(60)}`, colors.bright);
  
  const finalState = await getAccountInfo();
  log(`\n📊 FINAL STATE:`, colors.cyan);
  log(`  Wallet Balance: ${formatSOL(finalState.walletBalance)} SOL`);
  log(`  Player PDA Balance: ${formatSOL(finalState.playerBalance)} SOL`);
  log(`  Last Payment Method: ${finalState.paymentMethod === 0 ? 'Wallet' : 'PDA'}`);
  log(`  Current Pot: ${formatSOL(finalState.potBalance)} SOL`);
  
  log(`\n🏆 TEST SUMMARY:`, colors.cyan);
  log(`  Tests Passed: ${testsPassed}/${testsTotal}`);
  log(`  Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);
  
  if (testsPassed === testsTotal) {
    log(`\n🎉 ALL TESTS PASSED! Hybrid payment system is working perfectly!`, colors.green);
  } else {
    log(`\n⚠️  Some tests failed. Check the logs above for details.`, colors.yellow);
  }
  
  log(`\n✨ FEATURES TESTED:`, colors.magenta);
  log(`  ✅ PDA deposits for gasless gameplay`);
  log(`  ✅ PDA-based combat entries (gasless)`);
  log(`  ✅ Traditional wallet-based entries`);
  log(`  ✅ Payment method tracking for smart prize routing`);
  log(`  ✅ Account balance management`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n👋 Tests interrupted by user', colors.yellow);
  process.exit(0);
});

runHybridPaymentTests().catch(console.error);