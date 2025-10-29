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
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const PROGRAM_ID = new PublicKey(
  'J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z'
);
const TREASURY_WALLET = new PublicKey(
  'EsRy4vmaHbnj3kfj2X9rpRRgbKcA6a9DtdXrBddnNoVi'
);
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Instruction discriminators
const INSTRUCTION_DISCRIMINATORS = {
  create_player_account: Buffer.from(
    crypto.createHash('sha256').update('global:create_player_account').digest()
  ).subarray(0, 8),
  enter_combat: Buffer.from(
    crypto.createHash('sha256').update('global:enter_combat').digest()
  ).subarray(0, 8),
};

// Load env variables
require('dotenv').config();

async function beFirstPlayer() {
  console.log('🎮 PrimalBet First Player Initialization Script\n');

  // Use backend wallet from env
  const backendPrivateKey = process.env.BACKEND_WALLET_PRIVATE_KEY;
  if (!backendPrivateKey) {
    console.error('❌ BACKEND_WALLET_PRIVATE_KEY not found in .env file');
    return;
  }

  // Convert base58 private key to Keypair
  const backendKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(backendPrivateKey))
  );

  console.log('👤 Using backend wallet:', backendKeypair.publicKey.toString());

  // Verify it matches expected address
  const expectedBackend = '2pde6PGeMLbXhFkLWzEhpSGFqkhU9eica8RjbrEkwvb5';
  if (backendKeypair.publicKey.toString() !== expectedBackend) {
    console.log('⚠️  Warning: Backend wallet does not match expected address');
    console.log('Expected:', expectedBackend);
    console.log('Got:', backendKeypair.publicKey.toString());
  }

  const playerKeypair = backendKeypair;

  // Check balance
  const balance = await connection.getBalance(playerKeypair.publicKey);
  console.log('💰 Balance:', balance / LAMPORTS_PER_SOL, 'SOL');

  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    console.log('❌ Insufficient balance! Need at least 0.1 SOL');
    return;
  }

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

  console.log('\n📍 PDAs:');
  console.log('Player PDA:', playerPDA.toString());
  console.log('Game State PDA:', gameStatePDA.toString());
  console.log('Pot Vault PDA:', potVaultPDA.toString());

  // Check if game state already exists
  const gameStateInfo = await connection.getAccountInfo(gameStatePDA);
  if (gameStateInfo) {
    console.log('\n⚠️  Game state already exists! Someone beat you to it.');
    console.log('But you can still play the game!');
  } else {
    console.log('\n✅ Game state does not exist yet - you will be the first!');
  }

  try {
    // Step 1: Check if player account exists
    console.log('\n1️⃣ Checking player account...');
    const playerAccountInfo = await connection.getAccountInfo(playerPDA);

    if (!playerAccountInfo) {
      console.log(
        '✅ Player account does not exist yet - will be auto-created!'
      );
      console.log(
        '📝 The new contract auto-creates player accounts on first play.'
      );
      console.log(
        'You will pay entry fee (0.01 SOL) + account rent (~0.002 SOL)'
      );
    } else {
      console.log('✅ Player account exists!');
    }

    // Step 2: Enter combat (this will create game_state if needed)
    console.log(
      '\n2️⃣ Entering combat (this will initialize game_state if needed)...'
    );

    const enterCombatData = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.enter_combat,
    ]);

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
      data: enterCombatData,
    });

    const transaction = new Transaction().add(enterCombatIx);

    console.log('📤 Sending transaction...');
    console.log('Entry fee: 0.01 SOL');
    console.log('Treasury fee: 0.0005 SOL (5%)');
    console.log('Pot contribution: 0.0095 SOL (95%)');

    if (!gameStateInfo) {
      console.log(
        '🎉 Plus ~0.00203928 SOL for creating game_state (one-time cost)'
      );
    }

    const txSig = await sendAndConfirmTransaction(connection, transaction, [
      playerKeypair,
    ]);

    console.log('\n✅ Transaction successful!');
    console.log('🎯 Transaction signature:', txSig);

    if (!gameStateInfo) {
      console.log('\n🎉 Congratulations! You initialized the PrimalBet game!');
      console.log(
        'The game will now run forever without needing initialization.'
      );
    }

    // Check the new game state
    const newGameState = await connection.getAccountInfo(gameStatePDA);
    const potBalance = await connection.getBalance(potVaultPDA);

    console.log('\n📊 Game State:');
    console.log('Current pot:', potBalance / LAMPORTS_PER_SOL, 'SOL');
    console.log('Game is now live and ready for all players!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('AccountNotInitialized')) {
      console.log('\n📝 The player account needs to be created first.');
      console.log(
        'In production, the treasury wallet would create player accounts.'
      );
    } else if (error.message.includes('custom program error')) {
      console.log('\n📝 Program error details:', error.logs);
    }
  }
}

// Run the script
beFirstPlayer().catch(console.error);
