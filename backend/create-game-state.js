const {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');

// Configuration
const PROGRAM_ID = new PublicKey(
  'J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z'
);
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function checkGameState() {
  console.log('🎮 Checking Aurelius Game State\n');

  // Derive PDAs
  const [gameStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('game_state')],
    PROGRAM_ID
  );
  const [potVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('pot_vault')],
    PROGRAM_ID
  );

  console.log('📍 PDAs:');
  console.log('Game State:', gameStatePDA.toString());
  console.log('Pot Vault:', potVaultPDA.toString());

  // Check if accounts exist
  const gameStateInfo = await connection.getAccountInfo(gameStatePDA);
  const potVaultInfo = await connection.getAccountInfo(potVaultPDA);

  console.log('\n📊 Account Status:');
  console.log('Game State exists:', gameStateInfo !== null);
  console.log('Pot Vault exists:', potVaultInfo !== null);

  if (gameStateInfo) {
    console.log('Game State owner:', gameStateInfo.owner.toString());
    console.log('Game State size:', gameStateInfo.data.length, 'bytes');
  }

  if (potVaultInfo) {
    console.log(
      'Pot Vault balance:',
      potVaultInfo.lamports / LAMPORTS_PER_SOL,
      'SOL'
    );
  }

  console.log('\n✅ Current Setup:');
  if (!gameStateInfo) {
    console.log('- Game State will be created when first player enters combat');
    console.log('- The init_if_needed constraint handles this automatically');
    console.log('- First player pays ~0.002 SOL extra for account rent');
  } else {
    console.log('- Game is ready to play!');
    console.log('- No initialization needed');
  }
}

checkGameState().catch(console.error);
