# Proof Network

Next generation 🎮 platform with verifiable randomness and smart contracts.

## Introduction

ProofNetwork is a comprehensive blockchain platform that combines verifiable random functions (VRF), JavaScript-based smart contracts, and Solana integration to provide a powerful development environment for decentralized applications.

### Core Features

- Cryptographically secure VRF with verifiable proofs
- JavaScript smart contracts with sandboxed execution
- Blackbox security for storing private keys and secrets
- Native Solana wallet integration and transaction building
- Built-in rate limiting and composability controls
- Comprehensive developer tools and documentation

### Quick Start Example

```javascript
// Deploy your first smart contract
const state = {
  counter: 0,
  lastCaller: null,
};

async function increment(inputs) {
  state.counter++;
  state.lastCaller = inputs.from;

  // Use VRF for random bonus
  const bonus = await vrfApi.selectNumber(1, 10);
  state.counter += bonus.result;

  return {
    newCount: state.counter,
    bonus: bonus.result,
  };
}
```

---

# What is VRF?

Verifiable Random Function (VRF) provides cryptographically secure random number generation with verifiable proofs, ensuring fairness and transparency in applications.

## How VRF Works

1. Each request generates a unique seed and nonce
2. The seed and data are hashed together using SHA-256
3. Random bytes are extracted from the hash
4. Results include reproduction steps for independent verification
5. Anyone can verify the result by following the steps

## VRF Types

### Single Wallet

Validate if a wallet address wins
`POST /api/vrf/single`

### Number Range

Select random number in range
`POST /api/vrf/range`

### Array Selection

Select from wallets, numbers, or strings
`POST /api/vrf/array`

### Performance

- Up to 20,000 items
- 500 requests/second
- <5ms for small arrays

## VRF API Example

```javascript
// Using VRF in smart contracts
async function selectWinner(inputs) {
  const participants = state.lottery.participants;

  // Select random winner from array
  const result = await vrfApi.selectFromArray(participants, 1);
  const winner = result.result[0];

  // Select random prize amount
  const prizeResult = await vrfApi.selectNumber(100, 1000);
  const prize = prizeResult.result;

  state.lottery.winner = winner;
  state.lottery.prize = prize;

  return { winner, prize };
}
```

---

# Smart Contracts

Write powerful smart contracts in JavaScript with access to VRF, blackbox security, and Solana blockchain integration.

## Contract Structure

### State Management

Contracts maintain persistent state between function calls. State is automatically saved to the blockchain after each successful execution.

```javascript
const state = {
  users: {},
  totalSupply: 0,
  metadata: {
    name: 'My Token',
    symbol: 'MTK',
  },
};
```

### Function Definitions

Define functions that can be called externally. Functions receive inputs and must return a result object.

```javascript
function transfer(inputs) {
  if (!inputs.to || !inputs.amount) {
    throw new Error('Missing required parameters');
  }

  if (state.users[inputs.from] < inputs.amount) {
    throw new Error('Insufficient balance');
  }

  state.users[inputs.from] -= inputs.amount;
  state.users[inputs.to] = (state.users[inputs.to] || 0) + inputs.amount;

  return {
    success: true,
    from: inputs.from,
    to: inputs.to,
    amount: inputs.amount,
  };
}
```

## Available APIs

### VRF API

```javascript
// Select random number in range
const result = await vrfApi.selectNumber(1, 100);
const number = result.result;

// Select from array (any type)
const winners = await vrfApi.selectFromArray(participants, 3);
const selected = winners.result;

// Select from range object
const value = await vrfApi.selectFromRange({ start: 0, end: 10 });
```

### Blackbox API

```javascript
// Generate Solana keypair
const keypair = blackbox.generateSolanaKeypair();
blackbox.storeSecret('wallet1', keypair.privateKey);

// Sign message
const signature = blackbox.signMessage('wallet1', 'Hello World');

// Sign transaction
const signedTx = blackbox.signTransaction('wallet1', base64Tx);

// Store API keys
blackbox.storeSecret('apiKey', 'sk_live_abc123');
const key = blackbox.getSecret('apiKey');
```

### Contract API

```javascript
// Call another contract
const result = await contract.call('0xABC123...', 'transfer', {
  to: 'alice',
  amount: 100,
});

// Get contract info
const info = await contract.getContract('0xABC123...');

// Set composability rules
contract.setComposabilityRules({
  allowedCallers: ['0xDEF456...'],
  blockedFunctions: ['withdraw'],
});
```

### Rate Limiting

```javascript
// Initialize rate limits
rateLimit.initRateLimit({
  global: { limit: 1000, window: 60 },
  functions: {
    transfer: { limit: 100, window: 60 },
    mint: { limit: 10, window: 3600 },
  },
});

// Check if allowed
if (!rateLimit.checkRateLimit(address, 'transfer')) {
  throw new Error('Rate limit exceeded');
}

// Consume a slot
rateLimit.consumeRateLimit(address, 'transfer');
```

---

# Blackbox Security

Store private keys, API secrets, and sensitive data securely without exposing them through view functions or transaction logs.

## How Blackbox Works

### Isolated Storage

Blackbox data is stored separately from contract state and is never included in view function responses or transaction logs.

### Execution-Only Access

Secrets can only be accessed during contract execution, ensuring they remain private even from contract viewers.

### Automatic Redaction

Any sensitive data that appears in transaction inputs or outputs is automatically redacted as "[REDACTED]" in logs.

## Secure Wallet Example

```javascript
// Secure wallet management
const state = {
  wallets: {},
  transactions: [],
};

function createWallet(inputs) {
  const keypair = blackbox.generateSolanaKeypair();
  const walletId = inputs.walletId || Date.now().toString();

  // Store private key securely
  blackbox.storeSecret(walletId, keypair.privateKey);

  // Only store public key in visible state
  state.wallets[walletId] = {
    publicKey: keypair.publicKey,
    created: Date.now(),
  };

  return {
    walletId,
    publicKey: keypair.publicKey,
  };
}

async function signTransaction(inputs) {
  if (!state.wallets[inputs.walletId]) {
    throw new Error('Wallet not found');
  }

  // Sign transaction with stored private key
  const signedTx = await blackbox.signTransaction(
    inputs.walletId,
    inputs.transaction
  );

  state.transactions.push({
    walletId: inputs.walletId,
    timestamp: Date.now(),
  });

  return { signedTransaction: signedTx };
}
```

---

# Signature Security

Comprehensive cryptographic signature verification for secure wallet authentication and contract interactions using Ed25519 signatures.

## Security Features

### Multi-Format Support

- Base58 encoded signatures (Phantom wallet)
- Hex encoded signatures (64 bytes)
- Automatic format detection
- Fallback handling for compatibility

### Challenge-Based Auth

- Time-limited challenges (5-30 min)
- Cryptographically secure nonces
- One-time use prevents replay attacks
- Wallet address binding

### Verification Methods

- Contract challenges (most secure)
- Timestamped verification
- Basic message verification
- Multiple signature batch verification

### Attack Prevention

- Replay attack protection
- Clock skew protection (1 min tolerance)
- Cross-wallet attack prevention
- Signature malleability resistance

## Contract Challenge Verification (Recommended)

Most secure method using one-time challenges with cryptographic nonces. Perfect for sensitive operations like token transfers, NFT minting, and contract interactions.

```javascript
// 1. Generate challenge for any action
const challenge = generateContractChallenge(
  walletAddress,
  'transfer_tokens', // Can be any action: "mint_nft", "vote", "claim_reward", etc.
  5 // Expiry in minutes
);

// 2. User signs the challenge message with their wallet
// 3. Verify signature and execute action
const result = verifyContractChallenge(challengeId, signature, walletAddress);
if (result.success) {
  // Proceed with the action
  console.log('Verified action:', result.action);
  console.log('Wallet:', result.walletAddress);
} else {
  console.error('Verification failed:', result.error);
}
```

## Smart Contract Integration

```javascript
// Smart contract with signature verification
const state = {
  owner: null,
  treasury: 0,
  nonce: 0,
};

function initialize(inputs) {
  if (state.owner) throw new Error('Already initialized');
  state.owner = inputs.ownerWallet;
  return { success: true, owner: state.owner };
}

// Secure withdrawal with signature verification
async function withdraw(inputs) {
  // Create message with nonce to prevent replay attacks
  const message = `Withdraw:${inputs.amount}:Nonce:${state.nonce}`;

  // Verify owner signature
  const isValid = await verify.verifyMessageSignature(
    message,
    inputs.signature,
    state.owner
  );

  if (!isValid) {
    throw new Error('Invalid owner signature');
  }

  if (inputs.amount > state.treasury) {
    throw new Error('Insufficient funds');
  }

  // Process withdrawal
  state.treasury -= inputs.amount;
  state.nonce++; // Increment nonce to prevent replay

  return {
    success: true,
    withdrawn: inputs.amount,
    remaining: state.treasury,
    to: inputs.to,
  };
}
```

---

# Content API

Comprehensive content management system for large game data, assets, and text content outside of database storage limitations.

## Overview

The Content API provides a file-based content management system for handling large amounts of game data, assets, and text content. This eliminates database bloat and state storage limitations while providing fast access through in-memory caching.

### Benefits

- No database storage limits
- Fast in-memory caching
- Modular content loading
- Version control ready
- Easy JSON editing

### Use Cases

- Game dialogue systems
- Asset management
- Lore and story content
- Character data
- Quest information

## Content Structure

All content is stored as JSON files in the `/content` directory with a standardized structure for assets, text, and data.

```json
{
  "id": "example-rpg-game",
  "name": "Example RPG Game",
  "description": "A demonstration RPG game",
  "assets": {
    "images": {
      "hero_portrait": "https://proofnet.space/hero_portrait.png",
      "castle_background": "https://proofnet.space/castle_background.png"
    },
    "audio": {
      "battle_music": "https://example.com/battle.mp3"
    }
  },
  "text": {
    "dialogue": {
      "wizard_gandolf": [
        "Welcome, brave adventurer!",
        "The realm is in great peril..."
      ]
    },
    "descriptions": {
      "royal_castle": "A magnificent castle with towering spires..."
    }
  },
  "data": {
    "quest_rewards": {
      "save_princess": {
        "experience": 1000,
        "gold": 500,
        "item": "magic_sword"
      }
    }
  }
}
```

## API Endpoints

### GET /api/content

List all available game content

### GET /api/content/:gameId

Get full content for a specific game

### GET /api/content/:gameId/dialogue/:characterId?

Get dialogue for specific character or all dialogue

### GET /api/content/:gameId/path

Get partial content using dot notation path - perfect for optimized access to specific JSON subsets

### POST /api/content/:gameId

Save or update game content (requires authentication and ownership for updates)

### DELETE /api/content/:gameId

Delete game content (requires authentication and ownership)

## Smart Contract Integration

Smart contracts can access the Content API through the `content` global object, providing seamless integration with external content management.

```javascript
// Content-Aware RPG Contract Example
const state = {
  gameId: 'example-rpg-game',
  players: {},
  currentLocation: 'royal_castle',
};

// Get character dialogue - OPTIMIZED with partial path access
async function getDialogue(inputs) {
  const { player, characterId } = inputs;

  // Get ONLY the specific dialogue using path access (much faster!)
  const dialogue = await content.getContentByPath(
    state.gameId,
    `text.dialogue.${characterId}`
  );

  if (!dialogue) {
    return { success: false, error: 'Character not found' };
  }

  return {
    success: true,
    character: characterId,
    dialogue: dialogue,
  };
}
```

---

# Solana Integration

Full Solana blockchain integration with wallet authentication, transaction building, and the Solana Agent Kit for advanced operations.

## Wallet Authentication

ProofNetworkChain uses Solana wallet message signing for secure authentication. Users sign a message with their wallet to prove ownership and receive a session token.

### Authentication Flow

1. Request authentication challenge from /api/auth/challenge
2. Sign the challenge message with Phantom or other Solana wallet
3. Submit signature to /api/auth/verify
4. Receive 24-hour session token

## Transaction Builder

### SOL Transfers

Single or multi-recipient SOL transfers with Web3.js or Umi
`POST /api/tx-builder/sol`

### Token Transfers

SPL token transfers with automatic ATA creation
`POST /api/tx-builder/token`

## Solana Agent Example

```javascript
// Using Solana Agent Kit in contracts
const state = {
  treasury: null,
  tokens: {},
};

async function initialize(inputs) {
  // Create treasury wallet
  const keypair = blackbox.generateSolanaKeypair();
  blackbox.storeSecret('treasury', keypair.privateKey);

  state.treasury = keypair.publicKey;

  // Initialize Solana agent
  await solanaAgent.initialize(keypair.privateKey);

  return {
    treasuryAddress: state.treasury,
  };
}

async function deployToken(inputs) {
  if (!inputs.name || !inputs.symbol || !inputs.supply) {
    throw new Error('Missing token parameters');
  }

  // Deploy new SPL token
  const token = await solanaAgent.deployToken(
    inputs.name,
    inputs.symbol,
    inputs.supply,
    9 // decimals
  );

  state.tokens[inputs.symbol] = {
    mint: token.mint,
    decimals: token.decimals,
    supply: inputs.supply,
  };

  return {
    tokenMint: token.mint,
    transactionSignature: token.signature,
  };
}
```

## UMI Transaction Builder

The Metaplex UMI framework provides a powerful way to build complex Solana transactions with multi-step operations, automatic fee handling, and transaction chaining.

### UMI API Reference

#### Core Functions

- `umi.createUmi(rpcUrl?)` - Create UMI instance with optional custom RPC
- `umi.generateSigner(umiInstance)` - Generate new keypair signer
- `umi.createSignerFromPrivateKey(umi, privateKey)` - Create signer from base58 private key
- `umi.createNoopSigner(publicKey)` - Create no-op signer for fee payer

#### Transaction Building

- `umi.transactionBuilder()` - Create new transaction builder
- `umi.buildAndSerialize(umi, builder)` - Build and serialize transaction to base64
- `umi.buildSignAndSerialize(umi, builder, signer)` - Build, sign and serialize transaction

#### Token Operations

- `umi.transferSol(umi, options)` - Transfer SOL between accounts
- `umi.createMint(umi, options)` - Create new SPL token mint
- `umi.mintTokensTo(umi, options)` - Mint tokens to an account
- `umi.transferTokens(umi, options)` - Transfer SPL tokens

#### Utility Functions

- `umi.publicKey(address)` - Convert string address to UMI PublicKey type
- `umi.sol(amount)` - Convert SOL amount to lamports
- `umi.applyFee(amount, feePercent)` - Calculate fee and return object with newAmount and feeAmount

---

# API Reference

Complete API documentation for all ProofNetworkChain endpoints with fetch and curl examples.

## VRF Endpoints

### POST /api/vrf/single

Single wallet validation - returns true/false for whether a wallet is selected

### POST /api/vrf/range

Number range selection - returns random number(s) within specified range

### POST /api/vrf/array

Array selection - returns random item(s) from provided array (wallets, numbers, or strings)

## Smart Contract Endpoints

### POST /api/blockchain/contracts/deploy

Deploy a new smart contract to the blockchain

### POST /api/blockchain/contracts/call

Execute a function on a deployed smart contract

### GET /api/blockchain/contracts/:address

Retrieve contract information and state

### GET /api/blockchain/contracts

List all deployed contracts with pagination

## Authentication Endpoints

### POST /api/auth/challenge

Request authentication challenge for wallet signing

### POST /api/auth/verify

Verify wallet signature and receive session token

### GET /api/auth/session

Check current session status

## TX Builder Endpoints

### POST /api/tx-builder/build

Build Solana transactions for SOL and SPL token transfers

## Statistics Endpoints

### GET /api/vrf/stats

Get VRF usage statistics and performance metrics

### GET /api/blockchain/stats

Get blockchain statistics including contracts and transactions

## Rate Limits & Error Handling

### Rate Limits

- VRF API: 500/second
- Contract Calls: 100/minute
- General API: 450k/15min

### Error Codes

- 400: Bad Request
- 401: Unauthorized
- 429: Rate Limited
- 500: Server Error

---

# TX Builder Service API

The TX Builder Service provides a powerful API for creating Solana transactions programmatically. It supports SOL transfers, SPL token transfers, and multi-recipient transactions using both Web3.js and Umi (Metaplex) frameworks.

## Endpoint

`POST /api/tx-builder/build`

## Request Format

```typescript
interface TxBuilderRequest {
  framework: 'web3js' | 'umi';
  transactions: Transaction[];
}

interface Transaction {
  type: 'sol' | 'token';
  from: string; // Sender's wallet address
  to?: string; // Recipient address (single transfer)
  amount?: number; // Amount (single transfer)
  recipients?: {
    // Multi-recipient transfers
    address: string;
    amount: number;
  }[];
  tokenMint?: string; // SPL token mint (for token transfers)
  decimals?: number; // Token decimals (default: 9)
}
```

## Examples

### SOL Transfer

```javascript
fetch('/api/tx-builder/build', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_TOKEN',
  },
  body: JSON.stringify({
    framework: 'web3js',
    transactions: [
      {
        type: 'sol',
        from: 'BwZthB7QVbTKoPCEkgQ7UBV7ejtKWyWAvPabEigjWFof',
        to: '6AF3suy7QWvKaAPkZzZbJkJ9zSKzNC8Cieray5MXoXJj',
        amount: 0.1,
      },
    ],
  }),
});
```

### Multi-Recipient Token Transfer

```javascript
fetch('/api/tx-builder/build', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_TOKEN',
  },
  body: JSON.stringify({
    framework: 'umi',
    transactions: [
      {
        type: 'token',
        from: 'BwZthB7QVbTKoPCEkgQ7UBV7ejtKWyWAvPabEigjWFof',
        tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        decimals: 6,
        recipients: [
          {
            address: '6AF3suy7QWvKaAPkZzZbJkJ9zSKzNC8Cieray5MXoXJj',
            amount: 100,
          },
          {
            address: 'Dhma1HhR1rUEuUwnSHXWroqB5Hrj1W5n3oqrhcPDF1np',
            amount: 50,
          },
        ],
      },
    ],
  }),
});
```

## Response Format

```json
{
  "success": true,
  "transaction": "Base64EncodedTransaction",
  "message": "Transaction created successfully",
  "isVersioned": boolean
}
```

## Using in Smart Contracts

```javascript
// Example: Generate payment transaction in smart contract
async function generatePayment(inputs) {
  const txRequest = {
    framework: 'web3js',
    transactions: [
      {
        type: 'sol',
        from: inputs.payer,
        to: state.treasuryWallet,
        amount: inputs.amount,
      },
    ],
  };

  // Call TX Builder API
  const response = await apiRequest('POST', '/api/tx-builder/build', txRequest);

  return {
    success: true,
    base64Transaction: response.transaction,
    message: 'Payment transaction ready for signing',
  };
}
```

## Rate Limits & Error Handling

### Rate Limits

- TX Builder: 30 requests/minute
- Authentication: Required for all requests
- Rate Reset: Every 60 seconds
- Burst Limit: 5 concurrent requests

### Important Notes

- Transactions are created but not signed - user's wallet must sign
- Uses Helius RPC API for reliable transaction building
- Automatically handles token account creation if needed
- Returns base64 encoded transactions ready for wallet execution
- Supports both legacy and versioned transaction formats

---

# API Integration

Integrate with ProofNetworkChain APIs using authentication and proper rate limiting.

## Authentication

API requests require authentication via Solana wallet signature.

`Authorization: Bearer YOUR_SESSION_TOKEN`

## Rate Limits

- **VRF API**: 500 requests/second
- **Contract Calls**: 100 requests/minute per contract
- **General API**: 450,000 requests/15 minutes

## Example: Calling a Contract

```bash
curl -X POST "https://proofnetwork.lol/api/blockchain/contracts/call" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "from": "your_wallet_address",
    "contractAddress": "0xCONTRACT_ADDRESS",
    "functionName": "transfer",
    "inputs": {
      "to": "recipient_address",
      "amount": 100
    }
  }'
```

---

# Ecosystem Support

ProofNetworkChain integrates with popular tools and frameworks to provide a comprehensive development experience.

## Integrated Tools

### Phantom Wallet

Native integration for authentication and transaction signing

### Helius RPC

High-performance Solana RPC for reliable blockchain access

### Jupiter DEX

Token swaps and DeFi operations through Solana Agent Kit

### Metaplex

NFT creation and management with Umi framework support

---

# Frequently Asked Questions

Common questions and answers about ProofNetworkChain development.

## Q: How do I handle errors in smart contracts?

A: Always use throw statements for errors. This ensures transactions are marked as failed and state changes are rolled back.

```javascript
if (!inputs.amount || inputs.amount <= 0) {
  throw new Error('Invalid amount');
}
```

## Q: Can I use external npm packages in contracts?

A: No, contracts run in a sandboxed environment without access to npm packages. Use the built-in APIs (VRF, blackbox, contract, verify, solanaAgent) instead.

## Q: How do I store sensitive data like API keys?

A: Use the blackbox API to store secrets that won't be exposed in logs or view functions:

```javascript
blackbox.storeSecret('apiKey', 'sk_live_abc123');
const key = blackbox.getSecret('apiKey'); // Only works during execution
```

## Q: What's the gas limit for contract execution?

A: Default gas limit is 50,000. For complex operations, you can specify up to 100,000 gas in the contract call. Optimize your code to stay within limits.

## Q: How do I test my contracts locally?

A: Use the Developers tab in the web interface. You can deploy contracts, call functions, and see results in real-time. Guest accounts are created automatically for testing without wallet connection.

## Q: Can contracts call other contracts?

A: Yes! Use the contract API for composability:

```javascript
const result = await contract.call('0xOtherContract', 'functionName', {
  param1: 'value',
});
```
