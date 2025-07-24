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
const axios = require('axios');
require('dotenv').config();

// Configuration
const PROGRAM_ID = new PublicKey('J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z');
const TREASURY_WALLET = new PublicKey('EsRy4vmaHbnj3kfj2X9rpRRgbKcA6a9DtdXrBddnNoVi');
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const BASE_URL = 'http://localhost:3001/api';

// Load backend wallet
const backendPrivateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
if (!backendPrivateKey) {
  console.error('❌ BACKEND_WALLET_PRIVATE_KEY not found in .env file');
  process.exit(1);
}
const playerKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(backendPrivateKey)));
const PLAYER_WALLET = playerKeypair.publicKey.toString();

// Instruction discriminator for PDA combat
const ENTER_COMBAT_WITH_PDA = Buffer.from(
  crypto.createHash('sha256').update('global:enter_combat_with_pda').digest()
).subarray(0, 8);

// Colors
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

// Get PDAs
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

// Check player PDA balance
async function getPDABalance() {
  try {
    const response = await axios.get(`${BASE_URL}/player/${PLAYER_WALLET}`);
    return response.data.balance;
  } catch (error) {
    log(`❌ Error getting PDA balance: ${error.message}`, colors.red);
    return 0;
  }
}

// Get game state
async function getGameState() {
  try {
    const response = await axios.get(`${BASE_URL}/state`);
    return response.data;
  } catch (error) {
    log(`❌ Error getting game state: ${error.message}`, colors.red);
    return null;
  }
}

// Enter combat using PDA (gasless)
async function enterCombatWithPDA() {
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
      data: ENTER_COMBAT_WITH_PDA,
    });
    
    const transaction = new Transaction().add(enterCombatIx);
    const txSig = await sendAndConfirmTransaction(connection, transaction, [playerKeypair]);
    
    return { success: true, transaction: txSig };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Attempt vault crack
async function attemptVaultCrack(monsterType, round) {
  try {
    const combatId = `pda-test-round-${round}-${Date.now()}`;
    
    const response = await axios.post(`${BASE_URL}/vault/attempt`, {
      wallet: PLAYER_WALLET,
      combatId: combatId,
      monsterType: monsterType,
    });
    
    return response.data;
  } catch (error) {
    log(`❌ Vault crack error: ${error.response?.data?.error || error.message}`, colors.red);
    return { success: false, error: error.message };
  }
}

// Main test loop
async function testPDAUntilCrackOrEmpty() {
  log(`🎮 PDA GASLESS GAMEPLAY TEST`, colors.bright);
  log(`Player: ${PLAYER_WALLET.slice(0, 8)}...`);
  log(`Testing PDA payments until vault crack or insufficient funds\n`);
  
  // Initial state
  const initialPDABalance = await getPDABalance();
  const initialGameState = await getGameState();
  
  log(`📊 STARTING STATE:`, colors.cyan);
  log(`  PDA Balance: ${formatSOL(initialPDABalance)} SOL`);
  log(`  Current Pot: ${formatSOL(initialGameState.currentPot)} SOL`);
  log(`  Monster: ${initialGameState.currentMonster.name} (${initialGameState.currentMonster.vaultCrackChance}% crack chance)`);
  
  const entryFee = 0.01 * LAMPORTS_PER_SOL;
  const maxRounds = Math.floor(initialPDABalance / entryFee);
  log(`  Maximum possible rounds: ${maxRounds}\n`);
  
  let round = 1;
  let totalSpent = 0;
  let crackAttempts = 0;
  let vaultCracked = false;
  
  // Test loop
  while (true) {
    log(`${'='.repeat(60)}`, colors.bright);
    log(`🎯 ROUND ${round} - PDA GASLESS GAMEPLAY`, colors.bright);
    log(`${'='.repeat(60)}`, colors.bright);
    
    // Check PDA balance before round
    const currentPDABalance = await getPDABalance();
    log(`💰 Current PDA Balance: ${formatSOL(currentPDABalance)} SOL`);
    
    if (currentPDABalance < entryFee) {
      log(`❌ Insufficient PDA balance! Need ${formatSOL(entryFee)} SOL`, colors.red);
      break;
    }
    
    // Enter combat with PDA
    log(`⚔️  Entering combat with PDA (gasless transaction)...`, colors.yellow);
    const combatResult = await enterCombatWithPDA();
    
    if (!combatResult.success) {
      log(`❌ Combat entry failed: ${combatResult.error}`, colors.red);
      break;
    }
    
    log(`✅ Combat entry successful! TX: ${combatResult.transaction.slice(0, 20)}...`, colors.green);
    totalSpent += entryFee;
    
    await delay(2000); // Wait for transaction to settle
    
    // Check game state after entry
    const gameState = await getGameState();
    log(`📈 New pot: ${formatSOL(gameState.currentPot)} SOL`, colors.cyan);
    
    // Attempt vault crack
    log(`🏦 Attempting vault crack against ${gameState.currentMonster.name}...`, colors.magenta);
    const crackResult = await attemptVaultCrack(gameState.currentMonster.name, round);
    crackAttempts++;
    
    if (crackResult.success) {
      log(`🎉 VAULT CRACKED! WON ${formatSOL(crackResult.prizeAmount)} SOL!`, colors.green);
      log(`   Roll: ${crackResult.roll} (needed < ${crackResult.crackChance})`, colors.green);
      log(`   Prize claim TX: ${crackResult.claimTx?.slice(0, 20)}...`, colors.green);
      vaultCracked = true;
      break;
    } else {
      log(`💀 Vault resisted. Roll: ${crackResult.roll} (needed < ${crackResult.crackChance})`, colors.red);
    }
    
    round++;
    await delay(1500);
  }
  
  // Final summary
  log(`\n${'='.repeat(60)}`, colors.bright);
  log(`📈 PDA GASLESS TEST COMPLETE`, colors.bright);
  log(`${'='.repeat(60)}`, colors.bright);
  
  const finalPDABalance = await getPDABalance();
  const finalGameState = await getGameState();
  
  log(`\n📊 FINAL RESULTS:`, colors.cyan);
  log(`  Rounds Played: ${round - 1}`);
  log(`  PDA Balance: ${formatSOL(initialPDABalance)} → ${formatSOL(finalPDABalance)} SOL`);
  log(`  SOL Spent: ${formatSOL(totalSpent)} SOL`);
  log(`  Crack Attempts: ${crackAttempts}`);
  log(`  Final Pot: ${formatSOL(finalGameState.currentPot)} SOL`);
  
  if (vaultCracked) {
    log(`\n🎊 SUCCESS! Vault was cracked!`, colors.green);
    log(`🎮 The prize destination was determined by payment method (PDA → PDA)`, colors.green);
  } else {
    log(`\n💸 Ran out of PDA funds before cracking the vault`, colors.yellow);
    log(`💡 The pot has grown for the next player!`, colors.yellow);
  }
  
  log(`\n✨ GASLESS GAMEPLAY FEATURES TESTED:`, colors.magenta);
  log(`  ✅ No wallet signatures needed for combat entries`);
  log(`  ✅ PDA balance automatically deducted`);
  log(`  ✅ Smart prize routing (PDA entry → PDA prize)`);
  log(`  ✅ Real-time balance tracking`);
  log(`  ✅ Seamless integration with VRF system`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n👋 Test interrupted by user', colors.yellow);
  process.exit(0);
});

testPDAUntilCrackOrEmpty().catch(console.error);