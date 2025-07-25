const axios = require('axios');
const { PublicKey } = require('@solana/web3.js');

const API_URL = 'http://localhost:3001';

async function testGaslessCombat() {
  try {
    // Use the backend wallet for testing
    const playerWallet = '2pde6PGeMLbXhFkLWzEhpSGFqkhU9eica8RjbrEkwvb5';
    
    console.log('🎮 Testing Gasless Combat Entry');
    console.log('Player wallet:', playerWallet);
    
    // Check payment options first
    const optionsRes = await axios.get(`${API_URL}/api/player/${playerWallet}/payment-options`);
    console.log('\n💰 Payment Options:');
    console.log('- Can pay from wallet:', optionsRes.data.canPayFromWallet);
    console.log('- Can pay from PDA:', optionsRes.data.canPayFromPDA);
    console.log('- PDA balance:', optionsRes.data.pdaBalance, 'SOL');
    
    if (!optionsRes.data.canPayFromPDA) {
      console.error('❌ Insufficient PDA balance! Deposit first.');
      return;
    }
    
    // Get current game state
    const stateRes = await axios.get(`${API_URL}/api/state`);
    console.log('\n🎯 Current Game State:');
    console.log('- Pot:', stateRes.data.currentPot / 1e9, 'SOL');
    console.log('- Monster:', stateRes.data.currentMonster.name);
    
    // Enter combat using gasless method
    console.log('\n🚀 Entering combat (gasless)...');
    const combatRes = await axios.post(`${API_URL}/api/combat/enter-gasless`, {
      playerWallet
    });
    
    if (combatRes.data.success) {
      console.log('✅ Success! No wallet popup required!');
      console.log('Transaction:', combatRes.data.txSignature);
      console.log(`View: https://explorer.solana.com/tx/${combatRes.data.txSignature}?cluster=devnet`);
      
      // Check new state
      const newStateRes = await axios.get(`${API_URL}/api/state`);
      console.log('\n📊 New pot size:', newStateRes.data.currentPot / 1e9, 'SOL');
      
      // Check updated PDA balance
      const newOptionsRes = await axios.get(`${API_URL}/api/player/${playerWallet}/payment-options`);
      console.log('New PDA balance:', newOptionsRes.data.pdaBalance, 'SOL');
    } else {
      console.error('❌ Failed:', combatRes.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Make sure backend is running first
console.log('Make sure backend is running on port 3001!');
console.log('Starting test in 2 seconds...\n');

setTimeout(testGaslessCombat, 2000);