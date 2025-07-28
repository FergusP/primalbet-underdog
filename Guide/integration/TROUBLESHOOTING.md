# Aurelius Arena Troubleshooting Guide

## Common Integration Issues

### 1. CORS Errors

**Problem:** 
```
Access to fetch at 'http://localhost:3001/api/state' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
Ensure backend CORS middleware is properly configured:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2. Connection Refused

**Problem:**
```
FetchError: request to http://localhost:3001/api/state failed, reason: connect ECONNREFUSED 127.0.0.1:3001
```

**Solution:**
1. Verify backend is running: `npm run dev` in backend directory
2. Check port configuration in `.env`: `PORT=3001`
3. Ensure no other process is using port 3001: `lsof -i :3001`
4. Check frontend env: `NEXT_PUBLIC_API_URL=http://localhost:3001`

### 3. Wallet Connection Issues

**Problem:** Wallet not connecting or transactions failing

**Solutions:**

#### Wrong Network
```typescript
// Ensure using correct network
const network = WalletAdapterNetwork.Devnet; // or Mainnet
const endpoint = clusterApiUrl(network);
```

#### Program ID Mismatch
```bash
# Verify program ID in both frontend and backend
grep -r "PROGRAM_ID" .
```

#### Wallet Adapter Not Installed
```
Error: Wallet not found
```
Direct users to install Phantom, Solflare, or other Solana wallets.

### 4. Transaction Failures

**Problem:** Transactions fail with various errors

**Common Errors and Solutions:**

#### Insufficient Funds
```
Error: Attempt to debit an account but found no record of a prior credit
```
- Ensure wallet has enough SOL for transaction + fees
- For devnet: Use [Solana Faucet](https://faucet.solana.com)

#### Invalid Account
```
Error: AccountNotFound
```
- Player account might not be initialized
- Call initialization instruction first

#### Custom Program Error
```
Error: Custom program error: 0x1
```
- Check program error codes in IDL
- Common: Insufficient PDA balance for gasless entry

### 5. State Synchronization Issues

**Problem:** Frontend state doesn't match blockchain

**Solutions:**

1. **Increase polling interval during testing:**
```typescript
const POLLING_INTERVAL = process.env.NODE_ENV === 'development' ? 1000 : 2000;
```

2. **Add retry logic:**
```typescript
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

3. **Invalidate cache after transactions:**
```typescript
// After successful transaction
await queryClient.invalidateQueries(['gameState']);
```

### 6. Monster Display Issues

**Problem:** Monster sprite not showing or wrong monster appearing

**Solutions:**

1. **Check sprite loading:**
```typescript
// Add debug logging in Preloader
this.load.on('filecomplete', (key: string) => {
  console.log('Loaded:', key);
});

this.load.on('loaderror', (file: any) => {
  console.error('Failed to load:', file.key);
});
```

2. **Verify sprite keys match:**
```typescript
// Backend monster config
const MONSTERS = {
  SKELETON_WARRIOR: {
    tier: { sprite: 'skeleton_warrior' } // Must match frontend
  }
};

// Frontend preloader
this.load.image('skeleton_warrior', 'assets/sprites/skeleton_warrior.png');
```

3. **Add sprite existence check:**
```typescript
const spriteKey = monster.tier.sprite;
if (!this.textures.exists(spriteKey)) {
  console.error(`Sprite not found: ${spriteKey}`);
  // Use fallback
}
```

### 7. Build & Deployment Issues

**Problem:** Production build fails or behaves differently

**Solutions:**

1. **Environment variables not loaded:**
```bash
# Next.js requires NEXT_PUBLIC_ prefix for client-side env vars
NEXT_PUBLIC_API_URL=https://api.aurelius-arena.com
NEXT_PUBLIC_PROGRAM_ID=J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z
```

2. **Hydration mismatch:**
```typescript
// Use mounted state for client-only content
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
```

3. **HTTPS required for wallet:**
Production deployments require HTTPS for wallet connections to work.

## Debugging Tools

### 1. Browser DevTools

```javascript
// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).debugGame = {
    getState: () => gameInstanceRef.current?.registry.getAll(),
    getScene: () => gameInstanceRef.current?.scene.getScenes(true),
    triggerCombat: () => window.dispatchEvent(new CustomEvent('startCombat'))
  };
}
```

### 2. Solana Explorer

Check transactions on Solana Explorer:
- Devnet: https://explorer.solana.com/?cluster=devnet
- Mainnet: https://explorer.solana.com/

### 3. Network Tab

Monitor API calls:
1. Open DevTools → Network tab
2. Filter by XHR/Fetch
3. Check request/response payloads
4. Look for failed requests (red)

### 4. Console Logging

Add strategic logging:
```typescript
// Log all custom events
['gameStateUpdate', 'combatStarted', 'vaultResult'].forEach(eventName => {
  window.addEventListener(eventName, (e: any) => {
    console.log(`Event: ${eventName}`, e.detail);
  });
});
```

## Performance Issues

### 1. High CPU Usage

**Problem:** Game uses too much CPU

**Solutions:**
- Reduce particle effects
- Limit animation frame rate
- Disable unused Phaser systems

```typescript
// In game config
const config = {
  fps: {
    target: 30, // Reduce from 60
    forceSetTimeOut: true
  },
  render: {
    powerPreference: 'low-power'
  }
};
```

### 2. Memory Leaks

**Problem:** Memory usage increases over time

**Solutions:**
- Clean up event listeners
- Destroy Phaser objects properly
- Clear intervals/timeouts

```typescript
// Always clean up
useEffect(() => {
  const handler = () => {};
  window.addEventListener('event', handler);
  
  return () => {
    window.removeEventListener('event', handler);
  };
}, []);
```

## Getting Help

1. **Check logs:**
   - Browser console
   - Backend terminal output
   - Blockchain explorer

2. **Minimal reproduction:**
   - Isolate the issue
   - Create minimal test case
   - Share relevant code snippets

3. **Community resources:**
   - Solana Stack Exchange
   - Anchor Discord
   - Phaser Forums

## Quick Fixes Checklist

- [ ] Backend is running
- [ ] Correct network (devnet/mainnet)
- [ ] Environment variables set
- [ ] Wallet has SOL
- [ ] Program ID matches
- [ ] CORS configured
- [ ] All assets loaded
- [ ] No console errors