# **⚔️ COMBAT VALIDATION SYSTEM**
*Simple and Effective Anti-Cheat for Frontend Combat*

## **Overview**

Since combat is handled on the frontend for better player experience, we need simple validation to prevent obvious cheating while keeping the system lightweight and cost-effective.

## **Core Principles**

1. **Cheating doesn't break the economy** - They still pay 0.01 SOL
2. **VRF protects the vault** - Can't cheat the jackpot
3. **Simple checks suffice** - No need for complex validation
4. **Session-based security** - Prevent replay attacks

## **Validation Rules**

### **1. Combat Duration Check**

```typescript
const MINIMUM_COMBAT_DURATION = 3000; // 3 seconds

function validateDuration(duration: number): boolean {
  return duration >= MINIMUM_COMBAT_DURATION;
}
```

**Why 3 seconds?**
- Prevents instant-win exploits
- Reasonable for skilled players
- Maintains game immersion

### **2. Damage Validation**

```typescript
const DAMAGE_TOLERANCE_PERCENT = 20; // ±20% of expected

function validateDamage(
  damageDealt: number, 
  monsterHealth: number
): boolean {
  const minDamage = monsterHealth * 0.8;
  const maxDamage = monsterHealth * 1.2;
  
  return damageDealt >= minDamage && damageDealt <= maxDamage;
}
```

**Why ±20% tolerance?**
- Accounts for overkill on final hit
- Allows for rounding differences
- Prevents impossible damage values

## **Session Management**

### **Session Flow**

```typescript
interface CombatSession {
  sessionId: string;        // UUID v4
  wallet: string;           // Player wallet
  monster: Monster;         // Current monster
  startTime: number;        // Unix timestamp
  expiryTime: number;       // startTime + 5 minutes
  completed: boolean;       // Prevents reuse
  validated: boolean;       // Validation result
}
```

### **Session Security**

1. **Unique IDs** - Prevent session replay
2. **5-minute expiry** - Limit session lifetime
3. **Single use** - Can't complete twice
4. **Payment linked** - Must pay to create

## **API Implementation**

### **1. Start Combat**

```typescript
POST /api/combat/start
Request: {
  wallet: string,
  txSignature: string  // Proof of 0.01 SOL payment
}

Response: {
  sessionId: string,
  currentMonster: Monster,
  sessionExpiry: number
}

Validation:
- Verify payment transaction
- Check wallet matches signer
- Create new session
```

### **2. Complete Combat**

```typescript
POST /api/combat/complete
Request: {
  wallet: string,
  sessionId: string,
  victory: boolean,
  combatStats: {
    duration: number,
    totalDamageDealt: number
  }
}

Response: {
  validated: boolean,
  canAttemptVault: boolean,
  validationErrors?: string[]
}

Validation:
- Session exists and not expired
- Session not already used
- Duration >= 3 seconds
- Damage within ±20% of monster HP
```

### **3. Vault Attempt**

```typescript
POST /api/vault/crack
Request: {
  wallet: string,
  sessionId: string
}

Response: {
  success: boolean,
  prizeWon: number,
  vrfProof: string
}

Validation:
- Session validated successfully
- Combat was victorious
- VRF determines outcome
```

## **Database Schema**

```sql
-- Minimal session tracking
CREATE TABLE combat_sessions (
  session_id UUID PRIMARY KEY,
  wallet VARCHAR(44) NOT NULL,
  monster_tier INTEGER NOT NULL,
  monster_health INTEGER NOT NULL,
  start_time TIMESTAMP NOT NULL,
  expiry_time TIMESTAMP NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  validated BOOLEAN DEFAULT FALSE,
  victory BOOLEAN DEFAULT FALSE,
  duration INTEGER,
  damage_dealt INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cleanup old sessions daily
CREATE INDEX idx_expiry ON combat_sessions(expiry_time);
```

## **Error Handling**

### **Common Validation Failures**

```typescript
enum ValidationError {
  SESSION_NOT_FOUND = "Session not found",
  SESSION_EXPIRED = "Session expired",
  SESSION_ALREADY_USED = "Session already completed",
  COMBAT_TOO_SHORT = "Combat duration too short",
  INVALID_DAMAGE = "Damage amount invalid",
  PAYMENT_NOT_VERIFIED = "Payment not verified"
}
```

### **Client Response Examples**

```typescript
// Success
{
  validated: true,
  canAttemptVault: true
}

// Failure
{
  validated: false,
  canAttemptVault: false,
  validationErrors: ["Combat duration too short"]
}
```

## **Why This Approach Works**

### **For Players**
- Smooth gameplay experience
- No intrusive anti-cheat
- Clear rules and feedback
- Fair chance at jackpot

### **For Developers**
- Simple to implement
- Low computational cost
- Easy to maintain
- Scales efficiently

### **For Security**
- Prevents obvious exploits
- Protects jackpot integrity
- Session replay protection
- Payment verification

## **Implementation Checklist**

- [ ] Session ID generation (UUID v4)
- [ ] Payment verification endpoint
- [ ] Duration validation (>= 3s)
- [ ] Damage validation (±20%)
- [ ] Session expiry (5 minutes)
- [ ] Database cleanup job
- [ ] Error response format
- [ ] Logging for analysis

## **Monitoring & Analytics**

Track these metrics for balancing:

```typescript
interface CombatMetrics {
  avgDuration: number;        // Should be 30-60s
  avgDamageAccuracy: number;  // Should be near 100%
  validationFailureRate: number; // Should be < 5%
  suspiciousPatterns: {
    alwaysMinDuration: string[]; // Wallets to watch
    alwaysExactDamage: string[]; // Potential bots
  };
}
```

## **Future Enhancements**

1. **Statistical Analysis** - Flag anomalous patterns
2. **Reputation System** - Trust scores for players
3. **Progressive Penalties** - Warnings before bans
4. **Community Reporting** - Player-driven moderation

---

*Remember: The goal is to maintain game integrity while keeping the system simple and player-friendly. Perfect security isn't needed when the economic incentives are properly aligned.*