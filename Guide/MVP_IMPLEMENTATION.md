# **AURELIUS COLOSSEUM MVP IMPLEMENTATION**
*Ship Monster Combat Jackpot Game in 2-3 Days*

## **🎯 MVP Philosophy**
Build the simplest monster combat jackpot game with skill-based gameplay. Focus on core loop: Pay → Real-time Combat → Win/Lose → VRF Vault Chance. Frontend handles combat, backend validates. Ship fast with engaging skill-based battles.

---

## **✅ MVP FEATURES ONLY (2-3 Days)**

### **1. Core Game Features**
- **Fixed 0.01 SOL entry** for all players
- Frontend skill-based combat (WASD + Space)
- Backend session validation (3s min, damage check)
- VRF for vault attempts only (not combat)
- Blockchain-first pot tracking

### **2. Smart Contracts (Day 1)**
```rust
// Minimal on-chain state:
PotState {
    current_pot: u64,
    authority: Pubkey,
    treasury: Pubkey,
    total_entries: u64,
    last_winner: Option<Pubkey>,
}

// Core instructions only:
- initialize_pot
- pay_entry (0.01 SOL)  
- process_win (authority only)

// NO player profiles for MVP
// NO combat results stored
// Just pot accumulation and payouts
```

### **3. Backend Service (Day 1-2)**
```typescript
// Session-based validation:
- POST /api/combat/start
  - Verify 0.01 SOL payment
  - Create session (5 min expiry)
  - Return monster based on pot
  
- POST /api/combat/complete
  - Validate duration (>3s)
  - Validate damage (~monster HP)
  - Mark session complete
  
- POST /api/vault/crack (if validated victory)
  - VRF roll for vault chance
  - Trigger blockchain payout if won
  
- GET /api/state
  - Current pot from blockchain
  - Monster tier calculation
```

### **4. Frontend Combat (Day 2-3)**
```typescript
// Phaser.js real-time combat:
1. MainScene
   - Current pot display (from blockchain)
   - Monster preview (based on pot)
   - "ENTER ARENA" button (0.01 SOL)
   
2. CombatScene  
   - Player-controlled gladiator (WASD)
   - Monster AI with attack patterns
   - Real health tracking
   - Attack timing (Space bar)
   - Victory: Player skill determines outcome
   
3. VaultScene (on victory)
   - Backend VRF vault attempt
   - Success: Jackpot animation
   - Failure: Return to main
```

### **5. Visual Assets (Minimal)**
- 1 gladiator sprite (idle, attack, death)
- 1 skeleton sprite (idle, attack, death)
- Arena background
- Vault sprite (closed, glowing, open)
- Basic particle effects
- UI buttons and panels

---

## **📁 MVP Project Structure**

```
aurelius-colosseum/
├── programs/          # Anchor smart contracts
│   └── aurelius/
│       └── src/
│           ├── lib.rs
│           └── state/
│               ├── colosseum.rs
│               └── player.rs
├── backend/           # Game server
│   └── src/
│       ├── index.ts
│       ├── combat/
│       │   └── resolver.ts
│       └── api/
│           └── routes.ts
└── web/               # Frontend
    └── src/
        ├── pages/
        │   └── index.tsx
        └── game/
            ├── Game.ts
            └── scenes/
                ├── MainScene.ts
                ├── CombatScene.ts
                └── VaultScene.ts
```

---

## **🚀 Development Timeline**

### **Day 1: Smart Contracts & Backend Core**

**Morning (4 hours):**
- [ ] Set up Anchor project
- [ ] Create PotState account (minimal)
- [ ] Implement pay_entry instruction
- [ ] Implement process_win instruction
- [ ] Deploy to devnet

**Afternoon (4 hours):**
- [ ] Set up Node.js backend
- [ ] Implement session management
- [ ] Create combat validation logic
- [ ] Mock VRF for vault attempts
- [ ] Test payment flow

### **Day 2: Backend Complete & Frontend Start**

**Morning (4 hours):**
- [ ] Complete session validation
- [ ] Implement vault VRF logic  
- [ ] Monster tier calculation
- [ ] Test validation rules
- [ ] Deploy backend to Railway

**Afternoon (4 hours):**
- [ ] Set up Next.js + Phaser
- [ ] Basic player movement (WASD)
- [ ] Monster AI skeleton
- [ ] Wallet connection
- [ ] Pot display from blockchain

### **Day 3: Frontend Combat & Launch**

**Morning (4 hours):**
- [ ] Complete combat mechanics
- [ ] Attack animations & damage
- [ ] Monster AI patterns
- [ ] Victory/defeat conditions
- [ ] Session tracking

**Afternoon (2 hours):**
- [ ] Vault attempt integration
- [ ] End-to-end testing
- [ ] Deploy to Vercel
- [ ] Launch on devnet!

---

## **💻 Quick Start Commands**

```bash
# Setup
git init aurelius-colosseum
cd aurelius-colosseum

# Smart contracts
mkdir -p programs/aurelius && cd programs/aurelius
anchor init . --name aurelius
cd ../..

# Backend
mkdir backend && cd backend
npm init -y
npm install express cors dotenv @solana/web3.js
cd ..

# Frontend
npx create-next-app@latest web --typescript --tailwind --app
cd web
npm install phaser @solana/wallet-adapter-react
cd ..
```

---

## **🔧 MVP Code Examples**

### **Smart Contract Core**

```rust
// programs/aurelius/src/lib.rs
use anchor_lang::prelude::*;

#[program]
pub mod aurelius_colosseum {
    use super::*;
    
    pub fn pay_entry(ctx: Context<PayEntry>) -> Result<()> {
        let pot = &mut ctx.accounts.pot_state;
        const ENTRY_FEE: u64 = 10_000_000; // 0.01 SOL
        
        // Transfer to pot
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.pot_state.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, ENTRY_FEE)?;
        
        // Update pot
        pot.current_pot += ENTRY_FEE;
        pot.total_entries += 1;
        
        emit!(EntryPaid {
            player: ctx.accounts.player.key(),
            new_pot: pot.current_pot,
        });
        
        Ok(())
    }
}
```

### **Backend Session Validation**

```typescript
// backend/src/validation/combat.ts
export function validateCombat(
  session: CombatSession,
  stats: { duration: number; damageDealt: number }
): boolean {
  // Check minimum duration
  if (stats.duration < 3000) {
    return false; // Too fast
  }
  
  // Check damage is reasonable
  const expectedDamage = session.monster.baseHealth;
  const tolerance = expectedDamage * 0.2; // ±20%
  
  if (Math.abs(stats.damageDealt - expectedDamage) > tolerance) {
    return false; // Suspicious damage
  }
  
  // Session not expired
  if (Date.now() > session.expiryTime) {
    return false;
  }
  
  return true;
}

// Vault attempt (VRF only)
export async function attemptVault(session: CombatSession) {
  const roll = Math.random() * 100; // Mock VRF
  const crackChance = session.monster.vaultCrackChance;
  return roll < crackChance;
}
```

### **Frontend Real-Time Combat**

```typescript
// web/src/game/scenes/CombatScene.ts
export class CombatScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private monster!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerHP = 100;
  private monsterHP: number;
  private sessionId: string;
  private startTime: number;
  private damageDealt = 0;
  
  create(data: { session: any }) {
    this.sessionId = data.session.sessionId;
    this.monsterHP = data.session.monster.baseHealth;
    this.startTime = Date.now();
    
    // Player-controlled gladiator
    this.player = this.physics.add.sprite(200, 400, 'gladiator');
    this.monster = this.physics.add.sprite(600, 400, data.session.monster.sprite);
    
    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.playerAttack());
    
    // Collision
    this.physics.add.overlap(
      this.player, 
      this.monster, 
      () => this.handleMeleeHit()
    );
  }
  
  update() {
    // Player movement
    const speed = 160;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
    
    // Check victory/defeat
    if (this.monsterHP <= 0) {
      this.endCombat(true);
    } else if (this.playerHP <= 0) {
      this.endCombat(false);
    }
  }
  
  private playerAttack() {
    // Attack animation and damage
    const damage = Phaser.Math.Between(15, 25);
    this.monsterHP -= damage;
    this.damageDealt += damage;
    // Show damage number
  }
  
  private async endCombat(victory: boolean) {
    const duration = Date.now() - this.startTime;
    
    // Send to backend for validation
    const response = await fetch('/api/combat/complete', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: this.sessionId,
        victory,
        combatStats: { duration, totalDamageDealt: this.damageDealt }
      })
    });
    
    const result = await response.json();
    if (result.validated && victory) {
      this.scene.start('VaultScene', { sessionId: this.sessionId });
    } else {
      this.scene.start('MainScene');
    }
  }
}
```

---

## **🎮 Post-MVP Roadmap**

### **Week 2: Monster Progression**
- Dynamic monster tiers based on pot
- Monster AI improvements
- Real ProofNetwork VRF integration
- Player profiles & stats

### **Week 3: Polish**
- Better animations
- More sound effects
- Leaderboards
- Combat history

### **Week 4: Features**
- Achievement system
- Special event monsters
- Tournament mode
- Social features

---

## **✅ MVP Success Metrics**

**Day 3 Launch Goals:**
- Smart contracts deployed ✓
- Backend handling combat ✓
- Frontend playable ✓
- Jackpot accumulating ✓
- Winners can claim ✓

**Week 1 Targets:**
- 100 combat entries
- 5+ jackpots won
- 1+ SOL total volume
- Zero security issues
- <2s combat resolution

---

## **🚨 Common Pitfalls to Avoid**

1. **Don't store combat on-chain** - Just pot and winners
2. **Don't use VRF for combat** - Only for vault attempts
3. **Don't make complex validation** - Simple duration/damage checks
4. **Don't add player profiles yet** - Just pot tracking
5. **Keep combat simple** - Basic movement and attacks

---

## **🏁 Pre-Launch Checklist**

- [ ] Contracts handle all edge cases
- [ ] Backend validates all inputs
- [ ] Frontend shows clear feedback
- [ ] Wallet connection works
- [ ] Jackpot pays out correctly
- [ ] Mobile browser tested
- [ ] Error messages are helpful
- [ ] Loading states implemented

---

*Remember: Players just want to fight monsters and win jackpots. Everything else can wait.*