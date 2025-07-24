# Frontend Integration Guide for Aurelius Colosseum

## Architecture Overview

Aurelius uses a hybrid architecture:
- **Frontend**: Runs the combat simulation (player experience)
- **Backend**: Provides game state and handles vault crack attempts via VRF
- **Smart Contract**: Manages entry fees, pot tracking, and prize distribution

## Game Flow

```
1. Player pays entry fee (on-chain) → Pot grows
2. Frontend runs combat simulation (local)
3. If player wins → Backend checks vault crack (VRF)
4. If vault cracks → Backend claims prize for winner (on-chain)
```

## Environment Setup

```env
# Frontend .env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_PROGRAM_ID=J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z
REACT_APP_SOLANA_RPC=https://api.devnet.solana.com
```

## Backend API Endpoints

### 1. Get Game State
```javascript
GET /state

Response:
{
  "currentPot": 85500000,        // lamports
  "currentMonster": {
    "tier": 2,
    "name": "Goblin",
    "hp": 100,
    "attackPower": 15,
    "defenseMultiplier": 1.2,
    "vaultCrackChance": 1,      // 1% chance
    "sprite": "goblin"
  },
  "totalEntries": 9,
  "lastWinner": "4xfc...",
  "recentCombats": []
}
```

### 2. Attempt Vault Crack (After Combat Victory)
```javascript
POST /vault/attempt
Body: {
  "wallet": "player_wallet_address",
  "combatId": "unique_combat_id",
  "monsterType": "Goblin"        // The monster player actually fought
}

Response (Success):
{
  "success": true,
  "message": "Vault cracked! Prize claimed: 0.0855 SOL",
  "rollResult": 0,
  "threshold": 1,
  "prizeAmount": 85500000,
  "txSignature": "5xy..."
}

Response (Failed):
{
  "success": false,
  "message": "Vault resisted. Roll: 45 (needed < 1)",
  "rollResult": 45,
  "threshold": 1
}
```

### 3. Get Player Stats
```javascript
GET /player/:walletAddress

Response:
{
  "wallet": "4xfc...",
  "balance": 105000000,          // PDA balance for gasless play
  "totalCombats": 15,
  "victories": 8,
  "totalWinnings": 125000000,
  "lastCombat": 1234567890,
  "lastPaymentMethod": 1         // 0=wallet, 1=PDA
}
```

### 4. Get Payment Options
```javascript
GET /player/:walletAddress/payment-options

Response:
{
  "hasAccount": true,
  "pdaBalance": 0.105,           // SOL
  "canUseWallet": true,
  "canUsePDA": true,             // If balance >= 0.01 SOL
  "lastPaymentMethod": "pda"
}
```

### 5. Check Health
```javascript
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-07-24T10:00:00Z"
}
```

### 6. Backend Status
```javascript
GET /backend/status

Response:
{
  "balance": 0.95,
  "address": "2pde6PGeMLbXhFkLWzEhpSGFqkhU9eica8RjbrEkwvb5",
  "status": "healthy",
  "programId": "J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z",
  "features": ["hybrid_payments", "pda_deposits", "gasless_gameplay", "smart_prize_routing"]
}
```

## Smart Contract Integration

### 1. Enter Combat (Wallet Payment)
```javascript
import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z');

async function enterCombat(wallet, connection) {
  // Derive PDAs
  const [playerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('player'), wallet.publicKey.toBuffer()],
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
  
  const treasury = new PublicKey('EsRy4vmaHbnj3kfj2X9rpRRgbKcA6a9DtdXrBddnNoVi');
  
  // Discriminator for enter_combat instruction
  const discriminator = Buffer.from([240, 85, 218, 223, 147, 234, 5, 27]);
  
  const instruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: playerPDA, isSigner: false, isWritable: true },
      { pubkey: gameStatePDA, isSigner: false, isWritable: true },
      { pubkey: potVaultPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: treasury, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: discriminator,
  });
  
  const transaction = new Transaction().add(instruction);
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature);
  
  return signature;
}
```

### 2. Enter Combat (PDA Payment - Gasless)
For gasless gameplay, the backend handles the transaction. Frontend just needs to call the API.

### 3. Deposit to PDA (For Gasless Gameplay)
```javascript
async function depositToPDA(wallet, connection, amountInSol) {
  const [playerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('player'), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );
  
  // Discriminator for deposit_to_pda
  const discriminator = Buffer.from([15, 100, 42, 57, 235, 206, 59, 185]);
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(amountInSol * LAMPORTS_PER_SOL), 0);
  
  const instruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: playerPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([discriminator, amountBuffer]),
  });
  
  const transaction = new Transaction().add(instruction);
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature);
  
  return signature;
}
```

### 4. Withdraw from PDA
```javascript
async function withdrawFromPDA(wallet, connection, amountInSol) {
  const [playerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('player'), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );
  
  // Discriminator for withdraw_from_pda
  const discriminator = Buffer.from([176, 181, 251, 79, 48, 70, 9, 74]);
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64LE(BigInt(amountInSol * LAMPORTS_PER_SOL), 0);
  
  const instruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: playerPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([discriminator, amountBuffer]),
  });
  
  const transaction = new Transaction().add(instruction);
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature);
  
  return signature;
}
```

## Complete Game Flow Example

```javascript
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

const GameComponent = () => {
  const wallet = useWallet();
  const [gameState, setGameState] = useState(null);
  const [inCombat, setInCombat] = useState(false);
  
  // 1. Fetch game state
  const fetchGameState = async () => {
    const response = await axios.get(`${API_URL}/state`);
    setGameState(response.data);
  };
  
  // 2. Start game flow
  const playGame = async () => {
    try {
      // Step 1: Pay entry fee on-chain
      const txSignature = await enterCombat(wallet, connection);
      console.log('Entry fee paid:', txSignature);
      
      // Step 2: Get current monster (from game state)
      await fetchGameState();
      const monster = gameState.currentMonster;
      
      // Step 3: Run combat simulation on frontend
      setInCombat(true);
      const combatResult = await runLocalCombatSimulation(monster);
      
      // Step 4: If player won, attempt vault crack
      if (combatResult.victory) {
        const vaultResponse = await axios.post(`${API_URL}/vault/attempt`, {
          wallet: wallet.publicKey.toString(),
          combatId: generateCombatId(),
          monsterType: monster.name
        });
        
        if (vaultResponse.data.success) {
          alert(`🎉 VAULT CRACKED! You won ${vaultResponse.data.prizeAmount / LAMPORTS_PER_SOL} SOL!`);
        } else {
          alert(`Victory! But vault resisted. Roll: ${vaultResponse.data.rollResult}`);
        }
      } else {
        alert('Defeated! Try again!');
      }
      
      setInCombat(false);
      fetchGameState(); // Refresh game state
      
    } catch (error) {
      console.error('Game error:', error);
      setInCombat(false);
    }
  };
  
  // Local combat simulation (runs entirely on frontend)
  const runLocalCombatSimulation = async (monster) => {
    // Your combat game logic here
    // This is where Phaser or any game engine runs the actual combat
    
    // Simulated result:
    return {
      victory: Math.random() > 0.5, // 50% win rate for demo
      duration: 45,
      damageDealt: 100
    };
  };
  
  return (
    <div>
      <h1>Current Pot: {gameState ? gameState.currentPot / LAMPORTS_PER_SOL : 0} SOL</h1>
      <h2>Monster: {gameState?.currentMonster.name}</h2>
      <button onClick={playGame} disabled={inCombat || !wallet.connected}>
        Enter Combat (0.01 SOL)
      </button>
    </div>
  );
};
```

## Important Notes

1. **Combat is 100% Frontend** - The backend doesn't validate combat, it only handles vault crack RNG
2. **Monster Type Matters** - The vault crack chance uses the monster the player actually fought, not the current monster
3. **Entry Fee Split** - 5% goes to treasury, 95% goes to pot
4. **Gasless Gameplay** - Players can deposit to PDA and play without signing each transaction
5. **Smart Prize Routing** - If player used PDA to enter, prize goes to PDA. If wallet, prize goes to wallet.

## Testing Configuration

Current monster tiers (for testing):
- Skeleton: 0-0.02 SOL (1% crack chance)
- Goblin: 0.02-0.04 SOL (1% crack chance)  
- Shadow Assassin: 0.04-0.06 SOL (1% crack chance)
- Demon Knight: 0.06-0.08 SOL (1% crack chance)
- Dragon Lord: 0.08-0.10 SOL (1% crack chance)
- Ancient Titan: 0.10+ SOL (80% crack chance)

## Error Handling

```javascript
// Handle transaction errors
try {
  await enterCombat(wallet, connection);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    alert('Not enough SOL for entry fee + gas');
  } else if (error.message.includes('User rejected')) {
    alert('Transaction cancelled');
  }
}

// Handle API errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 400) {
      alert(error.response.data.error);
    }
    return Promise.reject(error);
  }
);
```

## All Instruction Discriminators

For reference, here are all the instruction discriminators:
- `enter_combat`: [240, 85, 218, 223, 147, 234, 5, 27]
- `enter_combat_with_pda`: [69, 19, 98, 250, 166, 202, 208, 172]
- `deposit_to_pda`: [15, 100, 42, 57, 235, 206, 59, 185]
- `withdraw_from_pda`: [176, 181, 251, 79, 48, 70, 9, 74]
- `claim_prize_backend`: [61, 80, 125, 1, 120, 178, 186, 184]
- `get_game_state`: [212, 50, 57, 136, 86, 124, 54, 32]