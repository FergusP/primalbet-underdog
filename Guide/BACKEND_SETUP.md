# Backend Setup Guide for Aurelius Colosseum

## Initial Setup for New Developers

### Prerequisites
- Node.js v16+ installed
- Solana CLI installed
- Access to Solana devnet

### Step 1: Clone and Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the backend directory with the following configuration:

```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z

# Backend Wallet Private Key (IMPORTANT: Get this from team lead)
BACKEND_WALLET_PRIVATE_KEY=[YOUR_BACKEND_WALLET_PRIVATE_KEY_ARRAY]

# ProofNetwork API (for VRF)
PROOFNETWORK_API_KEY=YOUR_API_KEY
PROOFNETWORK_API_URL=https://proofnetwork.lol/api/vrf

# Helius API (Optional - for WebSocket monitoring)
HELIUS_API_KEY=YOUR_HELIUS_KEY

# Fixed Addresses (DO NOT CHANGE)
TREASURY_WALLET=EsRy4vmaHbnj3kfj2X9rpRRgbKcA6a9DtdXrBddnNoVi
BACKEND_SIGNER=2pde6PGeMLbXhFkLWzEhpSGFqkhU9eica8RjbrEkwvb5
```

### Step 3: Backend Wallet Setup

The backend needs a funded wallet to pay for VRF requests and claim prizes for winners.

#### Option A: Use Existing Backend Wallet (Recommended)
Get the private key array from your team lead and add it to `BACKEND_WALLET_PRIVATE_KEY` in `.env`

#### Option B: Create New Backend Wallet
```bash
# Generate new keypair
solana-keygen new -o backend-wallet.json

# Get the public key
solana address -k backend-wallet.json

# Convert to array format for .env
node -e "console.log(JSON.stringify(Array.from(require('fs').readFileSync('backend-wallet.json'))))"
```

**IMPORTANT**: If using a new wallet, you must update the smart contract's `BACKEND_SIGNER` constant and redeploy!

### Step 4: Fund the Backend Wallet

The backend wallet needs SOL to:
- Pay for VRF API requests (tiny amount)
- Pay transaction fees when claiming prizes for winners

```bash
# Airdrop SOL on devnet
solana airdrop 1 YOUR_BACKEND_WALLET_ADDRESS --url devnet

# Check balance
solana balance YOUR_BACKEND_WALLET_ADDRESS --url devnet
```

### Step 5: ProofNetwork API Setup

1. Sign up at [ProofNetwork](https://proofnetwork.lol)
2. Get your API key
3. Add it to `PROOFNETWORK_API_KEY` in `.env`

### Step 6: Build and Run

```bash
# Build TypeScript
npm run build

# Run development server
npm run dev

# Or production
npm start
```

### Step 7: Verify Setup

```bash
# Check backend status
curl http://localhost:3001/backend/status

# Expected response:
{
  "balance": 0.95,
  "address": "2pde6PGeMLbXhFkLWzEhpSGFqkhU9eica8RjbrEkwvb5",
  "status": "healthy",
  "programId": "J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z",
  "features": [
    "hybrid_payments",
    "pda_deposits", 
    "gasless_gameplay",
    "smart_prize_routing"
  ]
}
```

## Understanding the Backend Architecture

### What the Backend Does:
1. **Reads Game State** - Fetches current pot, monster, and player data from Solana
2. **Provides VRF** - Uses ProofNetwork for random vault crack attempts
3. **Claims Prizes** - Backend wallet claims prizes for winners on-chain
4. **Tracks Players** - Returns player statistics and payment options

### What the Backend Does NOT Do:
- Does NOT validate combat (frontend handles this)
- Does NOT store game data (everything is on-chain)
- Does NOT handle entry fees (players pay directly on-chain)

## Common Issues

### "Unauthorized backend signer"
- Your backend wallet doesn't match the one hardcoded in the smart contract
- Solution: Use the correct wallet or redeploy contract with your wallet

### "Insufficient funds for transaction"
- Backend wallet needs more SOL
- Solution: Airdrop more SOL to the backend wallet

### "VRF API error"
- Check your ProofNetwork API key is valid
- Ensure the key is correctly set in `.env`

### "Cannot find module" errors
- Run `npm install` again
- Make sure to run `npm run build` before starting

### Port 3001 already in use
- Another process is using port 3001
- Solution: Kill the process or change PORT in `.env`

## API Endpoints Overview

The backend provides these endpoints:
- `GET /health` - Health check
- `GET /state` - Current game state
- `POST /vault/attempt` - Attempt to crack vault (uses VRF)
- `GET /player/:wallet` - Get player stats
- `GET /player/:wallet/payment-options` - Get payment options
- `GET /backend/status` - Backend wallet status

## Monitoring

Keep an eye on:
1. **Backend wallet balance** - Should maintain at least 0.1 SOL
2. **API logs** - Check for any VRF failures
3. **Transaction confirmations** - Prize claims should succeed

## Security Notes

1. **NEVER commit the `.env` file** - It contains private keys
2. **Keep backend wallet private key secure** - It can claim prizes
3. **Monitor backend wallet** - It should only decrease slightly from fees
4. **Use devnet for testing** - Never test with real SOL

## Testing the Backend

```bash
# Test game state endpoint
curl http://localhost:3001/state

# Test player endpoint
curl http://localhost:3001/player/YOUR_WALLET_ADDRESS

# Test backend status
curl http://localhost:3001/backend/status

# Test health check
curl http://localhost:3001/health
```

## Production Deployment

For production:
1. Use environment variables instead of `.env` file
2. Use mainnet RPC URL
3. Ensure backend wallet is well-funded
4. Set up monitoring for wallet balance
5. Use proper API rate limiting
6. Enable CORS only for your frontend domain
7. Use HTTPS for all endpoints
8. Set up proper logging and error tracking

## Folder Structure

```
backend/
├── src/
│   ├── api/
│   │   └── routes.ts         # All API endpoints
│   ├── config/
│   │   ├── config.ts         # Environment config
│   │   └── monsters.ts       # Monster tier configuration
│   ├── services/
│   │   ├── solana-service.ts # Solana interactions
│   │   └── vrf-service.ts    # VRF/ProofNetwork integration
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── index.ts              # Server entry point
├── package.json
├── tsconfig.json
└── .env                      # Your environment variables (DO NOT COMMIT)
```

## Quick Start Commands

```bash
# Full setup from scratch
npm install
npm run build
npm run dev

# Check if everything is working
curl http://localhost:3001/health
curl http://localhost:3001/state
curl http://localhost:3001/backend/status
```