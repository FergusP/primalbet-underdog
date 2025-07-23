#!/usr/bin/env node

const axios = require('axios');
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

const BASE_URL = 'http://localhost:3001/api';

// Solana configuration
const PROGRAM_ID = new PublicKey(
  'J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z'
);
const TREASURY_WALLET = new PublicKey(
  'EsRy4vmaHbnj3kfj2X9rpRRgbKcA6a9DtdXrBddnNoVi'
);
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load backend wallet
const backendPrivateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
if (!backendPrivateKey) {
  console.error('❌ BACKEND_WALLET_PRIVATE_KEY not found in .env file');
  process.exit(1);
}
const playerKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(backendPrivateKey))
);
const PLAYER_WALLET = playerKeypair.publicKey.toString();

// Instruction discriminator
const ENTER_COMBAT_DISCRIMINATOR = Buffer.from(
  crypto.createHash('sha256').update('global:enter_combat').digest()
).subarray(0, 8);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatSOL(lamports) {
  return (lamports / 1000000000).toFixed(4);
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGameState() {
  try {
    const response = await axios.get(`${BASE_URL}/state`);
    const data = response.data;

    log(`\n📊 GAME STATE:`, colors.cyan);
    log(`   Current Pot: ${formatSOL(data.currentPot)} SOL`);
    log(
      `   Monster: ${data.currentMonster.name} (Tier ${data.currentMonster.tier})`
    );
    log(`   Crack Chance: ${data.currentMonster.vaultCrackChance}%`);
    log(`   Total Entries: ${data.totalEntries}`);

    if (data.lastWinner) {
      log(
        `   Last Winner: ${data.lastWinner.wallet.slice(
          0,
          8
        )}... won ${formatSOL(data.lastWinner.amount)} SOL`
      );
    }

    return data;
  } catch (error) {
    log(`❌ Error checking game state: ${error.message}`, colors.red);
    return null;
  }
}

async function enterCombat() {
  try {
    log(`\n⚔️  ENTERING COMBAT...`, colors.yellow);
    log(`   Player: ${PLAYER_WALLET.slice(0, 8)}...`);
    log(`   Entry fee: 0.01 SOL`);

    // Derive PDAs
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

    // Create enter combat instruction
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
      data: ENTER_COMBAT_DISCRIMINATOR,
    });

    const transaction = new Transaction().add(enterCombatIx);

    const txSig = await sendAndConfirmTransaction(connection, transaction, [
      playerKeypair,
    ]);

    log(`✅ Combat entered successfully!`, colors.green);
    log(`   Transaction: ${txSig.slice(0, 20)}...`);

    return { transaction: txSig };
  } catch (error) {
    log(`❌ Error entering combat: ${error.message}`, colors.red);
    if (error.logs) {
      log(`   Program logs: ${error.logs.join(', ')}`, colors.red);
    }
    return null;
  }
}

async function attemptVaultCrack(monsterType, combatId) {
  try {
    log(`\n🏦 ATTEMPTING VAULT CRACK...`, colors.magenta);
    log(`   Monster: ${monsterType}`);
    log(`   Combat ID: ${combatId}`);

    const response = await axios.post(`${BASE_URL}/vault/attempt`, {
      wallet: PLAYER_WALLET,
      combatId: combatId,
      monsterType: monsterType,
    });

    const data = response.data;

    if (data.success) {
      log(
        `🎉 VAULT CRACKED! WON ${formatSOL(data.prizeAmount)} SOL!`,
        colors.green
      );
      log(`   Roll: ${data.roll} (needed < ${data.crackChance})`, colors.green);
      log(`   Prize transferred!`, colors.green);
      if (data.claimTx) {
        log(`   Claim TX: ${data.claimTx.slice(0, 20)}...`, colors.green);
      }
    } else {
      log(
        `💀 Vault resisted. Roll: ${data.roll} (needed < ${data.crackChance})`,
        colors.red
      );
    }

    return data;
  } catch (error) {
    log(
      `❌ Error attempting vault crack: ${
        error.response?.data?.error || error.message
      }`,
      colors.red
    );
    return null;
  }
}

async function getPlayerStats() {
  try {
    const response = await axios.get(`${BASE_URL}/player/${PLAYER_WALLET}`);
    const data = response.data;

    log(`\n👤 PLAYER STATS:`, colors.blue);
    log(`   Total Combats: ${data.totalCombats}`);
    log(`   Victories: ${data.victories}`);
    log(`   Total Winnings: ${formatSOL(data.totalWinnings)} SOL`);
    log(
      `   Win Rate: ${
        data.totalCombats > 0
          ? ((data.victories / data.totalCombats) * 100).toFixed(1)
          : 0
      }%`
    );

    return data;
  } catch (error) {
    log(
      `❌ Error getting player stats: ${
        error.response?.data?.error || error.message
      }`,
      colors.red
    );
    return null;
  }
}

async function checkBackendStatus() {
  try {
    const response = await axios.get(`${BASE_URL}/backend/status`);
    const data = response.data;

    log(`\n🔧 BACKEND STATUS:`, colors.cyan);
    log(`   Balance: ${data.balance.toFixed(4)} SOL`);
    log(`   Status: ${data.status}`);

    return data;
  } catch (error) {
    log(`❌ Error checking backend status: ${error.message}`, colors.red);
    return null;
  }
}

async function runGameSimulation(rounds = 5) {
  log(`🎮 AURELIUS GAME SIMULATION STARTING...`, colors.bright);
  log(`   Player: ${PLAYER_WALLET.slice(0, 8)}...`);
  log(`   Rounds: ${rounds}`);
  log(`   All monsters have 50% crack chance for testing`);

  // Check player balance first
  const balance = await connection.getBalance(playerKeypair.publicKey);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  log(`   Player Balance: ${balanceSOL.toFixed(4)} SOL`);

  const requiredSOL = rounds * 0.01; // Each round costs 0.01 SOL
  if (balanceSOL < requiredSOL + 0.01) {
    // Extra 0.01 for transaction fees
    log(
      `❌ Insufficient balance! Need at least ${(requiredSOL + 0.01).toFixed(
        2
      )} SOL for ${rounds} rounds`,
      colors.red
    );
    return;
  }

  // Initial state check
  await checkGameState();
  await getPlayerStats();
  await checkBackendStatus();

  let totalWon = 0;
  let cracksAttempted = 0;
  let cracksSuccessful = 0;

  for (let round = 1; round <= rounds; round++) {
    log(`\n${'='.repeat(50)}`, colors.bright);
    log(`🎯 ROUND ${round}/${rounds}`, colors.bright);
    log(`${'='.repeat(50)}`, colors.bright);

    // 1. Check current state
    const gameState = await checkGameState();
    if (!gameState) continue;

    // 2. Enter combat (add to pot)
    const combatResult = await enterCombat();
    if (!combatResult) continue;

    await delay(1000); // Wait a bit for transaction to settle

    // 3. Check new state after entry
    const newGameState = await checkGameState();
    if (!newGameState) continue;

    // 4. Attempt vault crack
    const combatId = `simulation-round-${round}-${Date.now()}`;
    const crackResult = await attemptVaultCrack(
      newGameState.currentMonster.name,
      combatId
    );

    cracksAttempted++;
    if (crackResult && crackResult.success) {
      cracksSuccessful++;
      totalWon += crackResult.prizeAmount || 0;

      log(`\n🎊 ROUND ${round} WINNER! 🎊`, colors.green);
      await delay(2000); // Wait for pot to reset
    } else {
      log(`\n💔 Round ${round} failed. Pot grows...`, colors.yellow);
    }

    await delay(1500); // Pause between rounds
  }

  // Final summary
  log(`\n${'='.repeat(60)}`, colors.bright);
  log(`📈 SIMULATION COMPLETE - FINAL RESULTS`, colors.bright);
  log(`${'='.repeat(60)}`, colors.bright);

  await checkGameState();
  await getPlayerStats();

  log(`\n🏆 SIMULATION STATS:`, colors.cyan);
  log(`   Rounds Played: ${rounds}`);
  log(`   Vault Cracks Attempted: ${cracksAttempted}`);
  log(`   Successful Cracks: ${cracksSuccessful}`);
  log(
    `   Success Rate: ${
      cracksAttempted > 0
        ? ((cracksSuccessful / cracksAttempted) * 100).toFixed(1)
        : 0
    }%`
  );
  log(`   Total Won: ${formatSOL(totalWon)} SOL`);
  log(`   Expected Success Rate: ~50% (with 50% crack chances)`);

  if (cracksSuccessful > 0) {
    log(
      `\n🎉 Congratulations! You won ${cracksSuccessful} time(s)!`,
      colors.green
    );
  } else {
    log(
      `\n😅 No wins this time, but the pot is growing for the next player!`,
      colors.yellow
    );
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const rounds = args[0] ? parseInt(args[0]) : 5;

  if (isNaN(rounds) || rounds < 1) {
    log(
      'Usage: node game-simulation-test.js [number_of_rounds]',
      colors.yellow
    );
    log('Example: node game-simulation-test.js 10', colors.yellow);
    return;
  }

  try {
    await runGameSimulation(rounds);
  } catch (error) {
    log(`❌ Simulation failed: ${error.message}`, colors.red);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n👋 Simulation interrupted by user', colors.yellow);
  process.exit(0);
});

main().catch(console.error);
