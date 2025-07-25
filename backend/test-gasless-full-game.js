const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Simulate frontend combat
function simulateCombat(monster) {
  console.log(`\n⚔️  Fighting ${monster.name}...`);
  
  // Simulate combat with 70% win rate
  const victory = Math.random() < 0.7;
  
  if (victory) {
    console.log('✅ Victory! Monster defeated!');
  } else {
    console.log('💀 Defeated by the monster!');
  }
  
  return {
    victory,
    duration: Math.floor(Math.random() * 60) + 20,
    damageDealt: victory ? monster.hp : Math.floor(monster.hp * 0.8),
    damageTaken: victory ? 20 : 100
  };
}

async function playFullGame() {
  try {
    const playerWallet = '2pde6PGeMLbXhFkLWzEhpSGFqkhU9eica8RjbrEkwvb5';
    console.log('🎮 FULL GASLESS GAME SIMULATION');
    console.log('Player:', playerWallet);
    
    // Step 1: Check if player can play gasless
    const optionsRes = await axios.get(`${API_URL}/api/player/${playerWallet}/payment-options`);
    console.log('\n💰 Payment Options:');
    console.log('- PDA Balance:', optionsRes.data.pdaBalance / 1e9, 'SOL');
    console.log('- Can use PDA:', optionsRes.data.canPayFromPDA);
    
    if (!optionsRes.data.canPayFromPDA) {
      console.error('❌ Insufficient PDA balance!');
      return;
    }
    
    // Step 2: Get current game state and monster
    const stateRes = await axios.get(`${API_URL}/api/state`);
    const currentMonster = stateRes.data.currentMonster;
    console.log('\n🎯 Current Game State:');
    console.log('- Pot:', stateRes.data.currentPot / 1e9, 'SOL');
    console.log('- Monster:', currentMonster.name);
    console.log('- HP:', currentMonster.hp);
    console.log('- Vault Crack Chance:', currentMonster.vaultCrackChance + '%');
    
    // Step 3: Enter combat (gasless)
    console.log('\n💳 Entering combat (gasless - no wallet popup!)...');
    const entryRes = await axios.post(`${API_URL}/api/combat/enter-gasless`, {
      playerWallet
    });
    
    if (!entryRes.data.success) {
      console.error('❌ Failed to enter combat:', entryRes.data);
      return;
    }
    
    console.log('✅ Entry successful! TX:', entryRes.data.txSignature);
    
    // Step 4: Simulate combat (this happens on frontend)
    const combatResult = simulateCombat(currentMonster);
    
    // Step 5: If victory, attempt vault crack
    if (combatResult.victory) {
      console.log('\n🎰 Attempting to crack the vault...');
      
      const vaultRes = await axios.post(`${API_URL}/api/vault/attempt`, {
        wallet: playerWallet,
        combatId: Date.now().toString(),
        monsterType: currentMonster.name
      });
      
      console.log(`\n📊 Vault Attempt Result:`);
      console.log('- Roll:', vaultRes.data.rollResult);
      console.log('- Needed:', `< ${vaultRes.data.threshold}`);
      
      if (vaultRes.data.success) {
        console.log(`\n🎉 VAULT CRACKED! Won ${vaultRes.data.prizeAmount / 1e9} SOL!`);
        console.log('Prize TX:', vaultRes.data.txSignature);
      } else {
        console.log('\n💔 Vault resisted! Pot continues to grow...');
      }
    }
    
    // Step 6: Check final state
    const finalStateRes = await axios.get(`${API_URL}/api/state`);
    const finalOptionsRes = await axios.get(`${API_URL}/api/player/${playerWallet}/payment-options`);
    
    console.log('\n📈 Final State:');
    console.log('- New Pot:', finalStateRes.data.currentPot / 1e9, 'SOL');
    console.log('- New PDA Balance:', finalOptionsRes.data.pdaBalance / 1e9, 'SOL');
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

// Run the full game simulation
console.log('Starting full game simulation...\n');
playFullGame();