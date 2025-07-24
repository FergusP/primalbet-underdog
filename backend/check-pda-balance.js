const { Connection, PublicKey } = require('@solana/web3.js');

async function checkPDABalance() {
  const connection = new Connection(
    'https://api.devnet.solana.com',
    'confirmed'
  );
  const programId = new PublicKey(
    'J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z'
  );

  // Your wallet from the screenshot
  const playerWallet = new PublicKey(
    '2pde6PGeMLbXhFkLWzEhpSGFqkhU9eica8RjbrEkwvb5'
  );

  // Derive PDA
  const [playerPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('player'), playerWallet.toBuffer()],
    programId
  );

  console.log('Player Wallet:', playerWallet.toString());
  console.log('Player PDA:', playerPDA.toString());

  // Get actual SOL balance
  const actualBalance = await connection.getBalance(playerPDA);
  console.log('\nActual SOL in PDA:', actualBalance / 1e9, 'SOL');

  // Get tracked balance from account data
  try {
    const accountInfo = await connection.getAccountInfo(playerPDA);
    if (accountInfo && accountInfo.data.length >= 73) {
      const balance = accountInfo.data.readBigUInt64LE(40); // After wallet (32) + discriminator (8)
      console.log('Tracked balance in account:', Number(balance) / 1e9, 'SOL');

      const lastPaymentMethod = accountInfo.data[72];
      console.log(
        'Last payment method:',
        lastPaymentMethod === 0 ? 'Wallet' : 'PDA'
      );
    }
  } catch (error) {
    console.log('Error reading account data:', error);
  }
}

checkPDABalance().catch(console.error);
