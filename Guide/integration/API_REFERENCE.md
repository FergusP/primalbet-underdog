# Aurelius Arena API Reference

## Base URL

Development: `http://localhost:3001`
Production: `https://api.aurelius-arena.com`

## Authentication

Currently, the API is open. Future versions will implement JWT or API key authentication.

## Endpoints

### 1. Game State

Get the current game state including pot amount and current monster.

```
GET /state
```

**Response:**
```json
{
  "currentPot": 450000000000,          // in lamports
  "currentMonster": {
    "id": "monster_1234567890",
    "type": "Skeleton Warrior",
    "tier": {
      "tier": 1,
      "name": "Skeleton Warrior",
      "minPot": 0,
      "maxPot": 0.02,
      "hp": 80,
      "attackPower": 15,
      "defenseMultiplier": 0.9,
      "vaultCrackChance": 90,
      "sprite": "skeleton-placeholder"
    },
    "baseHealth": 80,
    "currentHealth": 80,
    "spawnedAt": 1704067200000,
    "defeatedBy": null,
    "totalCombats": 0,
    "victories": 0
  },
  "totalEntries": 234,
  "lastWinner": "FtR7...8nYq",
  "recentCombats": []
}
```

### 2. Player Profile

Get player statistics and account information.

```
GET /player/:walletAddress
```

**Parameters:**
- `walletAddress` (string): Solana wallet address

**Response:**
```json
{
  "wallet": "FtR7e8Nw3HYDrNMTFAVg3utQ8YWXjDPJKgmBBBa8nYq",
  "balance": 100000000,          // PDA balance in lamports
  "totalCombats": 45,
  "victories": 23,
  "totalWinnings": 2500000000,
  "lastCombat": 1704067200000,
  "lastPaymentMethod": 1         // 0=wallet, 1=pda
}
```

### 3. Payment Options

Get available payment methods for a player.

```
GET /player/:walletAddress/payment-options
```

**Parameters:**
- `walletAddress` (string): Solana wallet address

**Response:**
```json
{
  "hasAccount": true,
  "pdaBalance": 100000000,       // in lamports
  "canUseWallet": true,
  "canUsePDA": true,
  "lastPaymentMethod": "pda"
}
```

### 4. Vault Crack Attempt

Attempt to crack a vault after combat victory.

```
POST /vault/attempt
```

**Request Body:**
```json
{
  "wallet": "FtR7e8Nw3HYDrNMTFAVg3utQ8YWXjDPJKgmBBBa8nYq",
  "combatId": "combat_1234567890_abc123",
  "monsterType": "Skeleton Warrior"
}
```

**Response (Success):**
```json
{
  "success": true,
  "roll": 15,
  "crackChance": 90,
  "prizeAmount": 450000000000,   // in lamports
  "claimTx": "5eykt...nXmb",
  "message": "Vault cracked! 450.0 SOL transferred!",
  "vrfProof": {
    "roll": 15,
    "timestamp": 1704067200000,
    "signature": "proof_signature_here"
  }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "roll": 95,
  "crackChance": 90,
  "message": "Vault resisted! You rolled 95, needed less than 90",
  "vrfProof": {
    "roll": 95,
    "timestamp": 1704067200000,
    "signature": "proof_signature_here"
  }
}
```

### 5. Enter Combat (Gasless)

Enter combat using PDA balance (no wallet popup).

```
POST /combat/enter-gasless
```

**Request Body:**
```json
{
  "playerWallet": "FtR7e8Nw3HYDrNMTFAVg3utQ8YWXjDPJKgmBBBa8nYq"
}
```

**Response:**
```json
{
  "success": true,
  "txSignature": "5eykt...nXmb",
  "message": "Combat entry successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Insufficient PDA balance"
}
```

### 6. Health Check

Check if the backend is running and responsive.

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 404 Not Found
```json
{
  "error": "Player not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

Currently no rate limiting is implemented. Future versions will include:
- 100 requests per minute per IP
- 10 vault attempts per minute per wallet

## WebSocket Events (Future)

Planned WebSocket events for real-time updates:
- `potUpdate`: When pot amount changes
- `combatResult`: When any player completes combat
- `vaultCracked`: When someone cracks the vault
- `monsterChange`: When monster tier changes

## Example Usage

### Using Fetch API

```typescript
// Get game state
const response = await fetch('http://localhost:3001/state');
const gameState = await response.json();

// Attempt vault crack
const vaultResponse = await fetch('http://localhost:3001/vault/attempt', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    wallet: 'FtR7e8Nw3HYDrNMTFAVg3utQ8YWXjDPJKgmBBBa8nYq',
    combatId: 'combat_1234567890_abc123',
    monsterType: 'Skeleton Warrior'
  })
});
const result = await vaultResponse.json();
```

### Using cURL

```bash
# Get game state
curl http://localhost:3001/state

# Check player profile
curl http://localhost:3001/player/FtR7e8Nw3HYDrNMTFAVg3utQ8YWXjDPJKgmBBBa8nYq

# Attempt vault crack
curl -X POST http://localhost:3001/vault/attempt \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "FtR7e8Nw3HYDrNMTFAVg3utQ8YWXjDPJKgmBBBa8nYq",
    "combatId": "combat_1234567890_abc123",
    "monsterType": "Cyclops Titan"
  }'
```

## Notes

- All amounts are in lamports (1 SOL = 1,000,000,000 lamports)
- Wallet addresses should be base58 encoded Solana public keys
- Combat IDs are generated client-side using the pattern: `combat_{timestamp}_{random}`
- Monster types must match the backend's monster configuration:
  - "Skeleton Warrior" (90% crack chance)
  - "Goblin Archer" (25% crack chance)
  - "Orc Gladiator" (20% crack chance)
  - "Minotaur Champion" (70% crack chance)
  - "Cyclops Titan" (80% crack chance)