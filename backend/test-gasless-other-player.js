const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testGaslessForOtherPlayer() {
  try {
    // Use a DIFFERENT wallet - not the backend wallet
    // This is the wallet from earlier tests that has PDA balance
    const playerWallet = '4xfczJg85qScHniJY8L8vKzP4GhRJCNdMGL4NmNqGci';
    
    console.log('🎮 Testing Gasless Combat for OTHER Player');
    console.log('Player wallet:', playerWallet);
    console.log('(This is NOT the backend wallet!)\n');
    
    // Check if this player has a PDA with balance
    const optionsRes = await axios.get(`${API_URL}/api/player/${playerWallet}/payment-options`);
    console.log('💰 Payment Options:');
    console.log('- Has account:', optionsRes.data.hasAccount || false);
    console.log('- PDA balance:', optionsRes.data.pdaBalance / 1e9, 'SOL');
    console.log('- Can use PDA:', optionsRes.data.canPayFromPDA);
    
    if (!optionsRes.data.canPayFromPDA) {
      console.log('\n❌ This player needs to deposit to PDA first');
      console.log('But if they had balance, backend could submit for them!');
      return;
    }
    
    // Try gasless entry for this other player
    console.log('\n🚀 Backend submitting transaction for OTHER player...');
    const combatRes = await axios.post(`${API_URL}/api/combat/enter-gasless`, {
      playerWallet
    });
    
    if (combatRes.data.success) {
      console.log('✅ Success! Backend paid gas for another player!');
      console.log('Transaction:', combatRes.data.txSignature);
      console.log('\nThis proves backend can submit for ANY player with PDA balance!');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testGaslessForOtherPlayer();