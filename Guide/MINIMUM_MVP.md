# **AURELIUS MINIMUM MVP**
*Ship in 3-5 Days, Expand Forever*

## **🎯 MVP Philosophy**
Build the smallest playable game that proves the concept, generates revenue, and creates FOMO. Everything else comes later.

---

## **✅ MVP FEATURES ONLY (3-5 Days)**

### **1. Single Game Mode**
- **Arena Blitz ONLY** - 90 second battles
- Max 10 players (expand to 20 later)
- Fixed entry: 0.002 SOL
- Winner takes 95%

### **2. Simplified Combat**
- Fixed damage: 6 HP per hit
- No VRF initially (use timestamp-based random)
- Attack range: Adjacent cells only
- No veteran bonuses or modifiers

### **3. Basic Power-Ups**
Just 2 types:
- **Health Potion**: +25 HP (green orb)
- **Rage Mode**: 2x damage for 10s (red orb)

### **4. Minimal Smart Contracts**
```rust
// MVP accounts only:
PlayerProfile {
    authority: Pubkey,
    total_games: u32,
    total_wins: u32,
    total_earnings: u64,
}

GameEscrow {
    game_id: [u8; 16],
    total_pot: u64,
    player_count: u8,
    is_active: bool,
    winner: Option<Pubkey>,
}
```

### **5. Basic Game Server**
- Simple Node.js + Socket.io
- Single Redis instance (no cluster)
- Basic movement validation
- No anti-cheat initially

### **6. Minimal UI**
- Basic arena (circular, no zones)
- Simple warrior sprites (1 type)
- Health bars only
- Basic kill feed
- Desktop only (no mobile)

---

## **❌ NOT IN MVP (Add Later)**

### **Phase 2 (Week 2)**
- ✅ ProofNetwork VRF integration
- ✅ XP & Progression system
- ✅ 2 more power-ups (Speed, Shield)
- ✅ Increase to 20 players
- ✅ Basic anti-cheat

### **Phase 3 (Week 3)**
- ✅ Glory Siege mode
- ✅ Multi-warrior entry
- ✅ Late entry penalties
- ✅ Territory control
- ✅ Mobile support

### **Phase 4 (Week 4)**
- ✅ Underdog mechanics
- ✅ Special events (Godslayer, etc)
- ✅ Dynamic modifiers
- ✅ Arena themes
- ✅ Sound & music

---

## **📁 MVP File Structure**

```
aurelius/
├── contracts/          # Just 2 instructions
│   └── programs/
│       └── aurelius/
│           └── src/
│               ├── lib.rs
│               └── state/
│                   ├── player.rs    # Simple profile
│                   └── game.rs      # Basic escrow
├── server/            # Minimal server
│   └── src/
│       ├── index.ts
│       ├── game.ts    # Core loop only
│       └── websocket.ts
└── app/               # Basic UI
    └── src/
        ├── pages/
        │   └── index.tsx  # Single page
        └── game/
            └── Arena.ts   # Phaser scene
```

---

## **🚀 MVP Development Timeline**

### **Day 1: Smart Contracts**
Morning:
- [ ] Basic Anchor setup
- [ ] PlayerProfile PDA
- [ ] Create player instruction

Afternoon:
- [ ] GameEscrow account
- [ ] Join game instruction
- [ ] End game instruction

### **Day 2: Game Server**
Morning:
- [ ] Node.js + Socket.io setup
- [ ] Basic game state
- [ ] Movement handling

Afternoon:
- [ ] Combat calculations
- [ ] Power-up spawning
- [ ] Winner detection

### **Day 3: Frontend Foundation**
Morning:
- [ ] Next.js setup
- [ ] Wallet connection
- [ ] Join game flow

Afternoon:
- [ ] Phaser arena scene
- [ ] Warrior sprites
- [ ] Basic movement

### **Day 4: Integration**
Morning:
- [ ] Connect frontend to server
- [ ] Test full game flow
- [ ] Fix critical bugs

Afternoon:
- [ ] Basic UI polish
- [ ] Deploy to devnet
- [ ] Internal testing

### **Day 5: Launch Prep**
Morning:
- [ ] Final bug fixes
- [ ] Basic landing page
- [ ] Deploy to mainnet

Afternoon:
- [ ] Launch! 🎉
- [ ] Monitor and hotfix

---

## **💻 MVP Code Examples**

### **Simplified Game Loop**
```typescript
// Just the essentials
class GameServer {
  games: Map<string, Game> = new Map();
  
  createGame() {
    const game = {
      id: uuid(),
      players: [],
      warriors: [],
      powerUps: [],
      startTime: null,
      pot: 0
    };
    this.games.set(game.id, game);
    return game;
  }
  
  joinGame(gameId: string, player: string) {
    const game = this.games.get(gameId);
    if (game.players.length >= 10) throw new Error('Game full');
    
    game.players.push(player);
    game.pot += 0.002 * LAMPORTS_PER_SOL;
    
    // Spawn warrior at random position
    const warrior = {
      id: player,
      hp: 100,
      position: this.randomPosition(),
      effects: []
    };
    game.warriors.push(warrior);
  }
  
  // Run every 50ms
  updateGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game.startTime) return;
    
    // Simple combat
    this.processAttacks(game);
    
    // Check winner
    const alive = game.warriors.filter(w => w.hp > 0);
    if (alive.length === 1) {
      this.endGame(gameId, alive[0].id);
    }
    
    // Time limit
    if (Date.now() - game.startTime > 90000) {
      const winner = alive.sort((a, b) => b.hp - a.hp)[0];
      this.endGame(gameId, winner.id);
    }
  }
}
```

### **Minimal Smart Contract**
```rust
pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
    let game = &mut ctx.accounts.game_escrow;
    
    require!(game.is_active, ErrorCode::GameNotActive);
    require!(game.player_count < 10, ErrorCode::GameFull);
    
    // Transfer entry fee
    let fee = 2_000_000; // 0.002 SOL
    transfer(/* ... */, fee)?;
    
    game.total_pot += fee;
    game.player_count += 1;
    
    Ok(())
}
```

---

## **📊 Success Metrics for MVP**

Week 1 Goals:
- 100 unique players
- 500 games played
- 1 SOL in daily volume
- <100ms game latency
- Zero fund loss bugs

If you hit these, you've validated the concept and can start adding features!

---

## **🔥 Post-MVP Expansion**

Once MVP is live and stable:

1. **Listen to players** - What do they want most?
2. **Fix critical issues** - Bugs before features
3. **Add one feature at a time** - Test each thoroughly
4. **Keep shipping daily** - Momentum is everything

The full game design is your North Star, but player feedback is your compass.

---

*Remember: It's better to have 10 players loving a simple game than 0 players waiting for a complex one.*