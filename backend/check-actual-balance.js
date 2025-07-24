const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function checkActualBalance() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const programId = new PublicKey('J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z');
  const wallet = new PublicKey('2pde6PGeMLbXhFkLWzEhpSGFqkhU9eica8RjbrEkwvb5');
  
  // Derive PDA
  const [playerPDA] = await PublicKey.findProgramAddress(
    [Buffer.from('player'), wallet.toBuffer()],
    programId
  );
  
  console.log('PDA Address:', playerPDA.toString());
  
  // Get actual SOL balance (what's really in the account)
  const actualBalance = await connection.getBalance(playerPDA);
  console.log('\nActual SOL in PDA:', actualBalance / LAMPORTS_PER_SOL, 'SOL');
  
  // Get tracked balance from account data
  const accountInfo = await connection.getAccountInfo(playerPDA);
  if (accountInfo && accountInfo.data.length >= 48) {
    const trackedBalance = accountInfo.data.readBigUInt64LE(40);
    console.log('Tracked balance:', Number(trackedBalance) / LAMPORTS_PER_SOL, 'SOL');
    
    const difference = actualBalance - Number(trackedBalance);
    console.log('\nUntracked SOL (from direct transfers):', difference / LAMPORTS_PER_SOL, 'SOL');
    
    // Calculate rent-exempt minimum
    const rentExempt = await connection.getMinimumBalanceForRentExemption(accountInfo.data.length);
    console.log('Rent-exempt minimum:', rentExempt / LAMPORTS_PER_SOL, 'SOL');
    
    const withdrawable = actualBalance - rentExempt;
    console.log('Maximum withdrawable:', withdrawable / LAMPORTS_PER_SOL, 'SOL');
  }
}

checkActualBalance().catch(console.error);