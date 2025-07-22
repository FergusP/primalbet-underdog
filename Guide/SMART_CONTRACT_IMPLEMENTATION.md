# **AURELIUS COLOSSEUM SMART CONTRACT IMPLEMENTATION**
*Anchor Framework for Monster Combat Jackpot System*

<!-- MVP:SUMMARY -->
## **🚀 MVP Smart Contract Features (SIMPLIFIED)**
For the 2-3 day MVP, implement:
- **Pot State**: Global jackpot tracking only
- **Core Instructions**: pay_entry, process_win
- **Prize Pool**: 0.01 SOL entries accumulate
- **Winner Payout**: 90% to winner, 10% platform
- **Minimal Storage**: Just pot amount and last winner

Skip for MVP: Player profiles, combat results, XP system
<!-- MVP:END -->

## **📁 Contract Structure**

```
contracts/
├── programs/aurelius/
│   ├── src/
│   │   ├── lib.rs              # Main program entry
│   │   ├── state/              # Account structures
│   │   │   ├── mod.rs
│   │   │   ├── player.rs       # Player PDA
│   │   │   ├── game.rs         # Game escrow
│   │   │   └── config.rs       # Program config
│   │   ├── instructions/       # Program instructions
│   │   │   ├── mod.rs
│   │   │   ├── initialize.rs   # Setup
│   │   │   ├── player.rs       # Player management
│   │   │   ├── game.rs         # Game flow
│   │   │   └── admin.rs        # Admin functions
│   │   ├── errors.rs           # Custom errors
│   │   ├── constants.rs        # Program constants
│   │   └── utils.rs            # Helper functions
│   └── Cargo.toml
├── tests/
├── migrations/
└── Anchor.toml
```

---

## **🔑 Core Accounts**

<!-- MVP:START -->
### **1. Pot State (Singleton) - SIMPLIFIED MVP**

```rust
// state/pot.rs
use anchor_lang::prelude::*;

#[account]
pub struct PotState {
    pub current_pot: u64,            // Current jackpot amount
    pub authority: Pubkey,           // Admin wallet
    pub treasury: Pubkey,            // Platform fee collection
    pub total_entries: u64,          // Lifetime entries
    pub total_payouts: u64,          // Lifetime payouts
    pub last_winner: Option<Pubkey>, // Last jackpot winner
    pub last_win_amount: u64,        // Last win amount
    pub last_win_time: i64,          // Last win timestamp
}

impl PotState {
    pub const SIZE: usize = 8 +      // discriminator
        8 +                          // current_pot
        32 +                         // authority
        32 +                         // treasury  
        8 +                          // total_entries
        8 +                          // total_payouts
        33 +                         // last_winner (Option<Pubkey>)
        8 +                          // last_win_amount
        8;                           // last_win_time
        
    pub const SEED_PREFIX: &'static [u8] = b"pot";
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
```rust
// Additional fields for full version:
pub game_server: Pubkey,         // Authorized server
pub total_games: u64,            // Lifetime counter
pub total_volume: u64,           // Total SOL processed
```
<!-- POST-MVP:END -->

<!-- POST-MVP:PHASE2 -->
### **2. Player Profile PDA (Future)**

```rust
// state/player.rs - NOT IN MVP
// Future implementation for tracking player stats
#[account]
pub struct PlayerProfile {
    pub authority: Pubkey,
    pub total_entries: u64,
    pub total_wins: u64,
    pub total_winnings: u64,
    pub total_spent: u64,
    pub last_play: i64,
}
```
<!-- POST-MVP:END -->

<!-- POST-MVP:PHASE2 -->
### **3. Combat Session (Future)**

```rust
// state/session.rs - NOT IN MVP
// Future implementation for session validation
#[account]
pub struct CombatSession {
    pub session_id: [u8; 16],
    pub player: Pubkey,
    pub created_at: i64,
    pub expires_at: i64,
    pub completed: bool,
}
```
<!-- POST-MVP:END -->

<!-- POST-MVP:PHASE2 -->
```rust
// Full version with both modes
#[account]
pub struct GameEscrow {
    pub game_id: [u8; 16],           // UUID as bytes
    pub game_mode: GameMode,         // Blitz or Siege
    pub total_pot: u64,              // Total prize pool
    pub entry_fee: u64,              // Base entry fee
    pub player_count: u8,            // Current players
    pub max_players: u8,             // Mode-specific max
    pub state: GameState,            // Current state
    pub server_authority: Pubkey,    // Game server key
    pub created_at: i64,
    pub started_at: Option<i64>,
    pub ended_at: Option<i64>,
    pub timeout_at: i64,             // Auto-refund time
    pub modifiers: u16,              // Bit flags for events
}

impl GameEscrow {
    pub const SIZE: usize = 8 +      // discriminator
        16 +                         // game_id
        1 +                          // game_mode
        8 +                          // total_pot
        8 +                          // entry_fee
        1 +                          // player_count
        1 +                          // max_players
        1 +                          // state
        32 +                         // server_authority
        8 +                          // created_at
        9 +                          // started_at (Option)
        9 +                          // ended_at (Option)
        8 +                          // timeout_at
        2 +                          // modifiers
        64;                          // padding for future
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum GameMode {
    Blitz,
    Siege,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum GameState {
    Waiting,
    Active,
    Ended,
    Cancelled,
}
```

### **4. Combat Result (VRF Verified)**

```rust
// state/combat.rs - MVP VERSION
#[account]
pub struct CombatResult {
    pub combat_id: [u8; 16],         // Unique combat ID
    pub gladiator: Pubkey,           // Player wallet
    pub monster: MonsterType,        // Monster fought
    pub entry_fee: u64,              // Amount paid to enter
    pub gladiator_power: u64,        // Calculated power
    pub gladiator_score: u64,        // Final combat score
    pub monster_score: u64,          // Monster's score
    pub victory: bool,               // Combat outcome
    pub vrf_proof: [u8; 64],         // ProofNetwork proof
    pub timestamp: i64,              // When combat occurred
    pub vault_attempted: bool,       // If they tried vault
    pub vault_cracked: bool,         // If they succeeded
}

impl CombatResult {
    pub const SIZE: usize = 8 +      // discriminator
        16 +                         // combat_id
        32 +                         // gladiator
        1 +                          // monster (enum)
        8 +                          // entry_fee
        8 +                          // gladiator_power
        8 +                          // gladiator_score
        8 +                          // monster_score
        1 +                          // victory
        64 +                         // vrf_proof
        8 +                          // timestamp
        1 +                          // vault_attempted
        1;                           // vault_cracked
        
    pub const SEED_PREFIX: &'static [u8] = b"combat";
}
```

---

## **📝 Core Instructions**

<!-- MVP:START -->
### **1. Initialize Pot**

```rust
// instructions/initialize.rs - SIMPLIFIED MVP
pub fn initialize(
    ctx: Context<Initialize>,
    treasury: Pubkey,
) -> Result<()> {
    let pot = &mut ctx.accounts.pot_state;
    
    pot.current_pot = 0;
    pot.authority = ctx.accounts.authority.key();
    pot.treasury = treasury;
    pot.total_entries = 0;
    pot.total_payouts = 0;
    pot.last_winner = None;
    pot.last_win_amount = 0;
    pot.last_win_time = 0;
    
    emit!(PotInitialized {
        authority: pot.authority,
        treasury: pot.treasury,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = PotState::SIZE,
        seeds = [PotState::SEED_PREFIX],
        bump
    )]
    pub pot_state: Account<'info, PotState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
```rust
// Full version with server authority and stats
pub fn initialize(
    ctx: Context<Initialize>,
    config: ProgramConfigInput,
) -> Result<()> {
    let program_config = &mut ctx.accounts.program_config;
    
    program_config.authority = ctx.accounts.authority.key();
    program_config.treasury = ctx.accounts.treasury.key();
    program_config.game_server = config.game_server;
    program_config.fee_percentage = 3; // 3%
    program_config.is_paused = false;
    program_config.total_games = 0;
    program_config.total_volume = 0;
    
    emit!(ProgramInitialized {
        authority: program_config.authority,
        treasury: program_config.treasury,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = ProgramConfig::SIZE,
        seeds = [b"config"],
        bump
    )]
    pub program_config: Account<'info, ProgramConfig>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: Treasury wallet
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}
```

<!-- MVP:START -->
### **2. Pay Entry**

```rust
// instructions/entry.rs - SIMPLIFIED MVP
pub fn pay_entry(ctx: Context<PayEntry>) -> Result<()> {
    let pot = &mut ctx.accounts.pot_state;
    let clock = Clock::get()?;
    
    // Fixed 0.01 SOL entry
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
    
    // Update pot state
    pot.current_pot += ENTRY_FEE;
    pot.total_entries += 1;
    
    emit!(EntryPaid {
        player: ctx.accounts.player.key(),
        amount: ENTRY_FEE,
        new_pot: pot.current_pot,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct PayEntry<'info> {
    #[account(mut)]
    pub pot_state: Account<'info, PotState>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
```rust
// Full version with all stats
pub fn create_player_profile(ctx: Context<CreatePlayer>) -> Result<()> {
    let player = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;
    
    player.authority = ctx.accounts.player.key();
    player.total_games = 0;
    player.games_won = 0;
    player.total_earnings = 0;
    player.total_wagered = 0;
    player.last_game = 0;
    player.highest_streak = 0;
    player.current_streak = 0;
    player.join_date = clock.unix_timestamp;
    player.xp = 0;
    player.level = 0;
    player.xp_multiplier = 100; // 1x multiplier
    
    emit!(PlayerCreated {
        player: player.authority,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct CreatePlayer<'info> {
    #[account(
        init,
        payer = player,
        space = PlayerProfile::SIZE,
        seeds = [PlayerProfile::SEED_PREFIX, player.key().as_ref()],
        bump
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
```

<!-- MVP:START -->
### **3. Process Win**

```rust
// instructions/win.rs - SIMPLIFIED MVP
pub fn process_win(
    ctx: Context<ProcessWin>,
    winner: Pubkey,
) -> Result<()> {
    // Only authority can process wins
    require!(
        ctx.accounts.authority.key() == ctx.accounts.pot_state.authority,
        ErrorCode::Unauthorized
    );
    
    let pot = &mut ctx.accounts.pot_state;
    let clock = Clock::get()?;
    
    // Calculate payout (90% to winner, 10% platform)
    let total_pot = pot.current_pot;
    let platform_fee = total_pot / 10; // 10%
    let prize = total_pot - platform_fee;
    
    // Transfer prize to winner
    **pot.to_account_info().try_borrow_mut_lamports()? -= prize;
    **ctx.accounts.winner.try_borrow_mut_lamports()? += prize;
    
    // Transfer platform fee
    **pot.to_account_info().try_borrow_mut_lamports()? -= platform_fee;
    **ctx.accounts.treasury.try_borrow_mut_lamports()? += platform_fee;
    
    // Update pot state
    pot.last_winner = Some(winner);
    pot.last_win_amount = total_pot;
    pot.last_win_time = clock.unix_timestamp;
    pot.total_payouts += total_pot;
    pot.current_pot = 0; // Reset pot
    
    emit!(JackpotWon {
        winner,
        total_pot,
        prize,
        platform_fee,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct ProcessWin<'info> {
    #[account(mut)]
    pub pot_state: Account<'info, PotState>,
    
    /// CHECK: Winner wallet
    #[account(mut)]
    pub winner: AccountInfo<'info>,
    
    /// CHECK: Treasury wallet
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    
    pub authority: Signer<'info>,
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
```rust
// Full version with mode selection
pub fn create_game(
    ctx: Context<CreateGame>,
    game_id: [u8; 16],
    game_mode: GameMode,
) -> Result<()> {
    let config = &ctx.accounts.program_config;
    require!(!config.is_paused, ErrorCode::ProgramPaused);
    
    let game = &mut ctx.accounts.game_escrow;
    let clock = Clock::get()?;
    
    game.game_id = game_id;
    game.game_mode = game_mode.clone();
    game.total_pot = 0;
    game.entry_fee = match game_mode {
        GameMode::Blitz => BLITZ_ENTRY_FEE,
        GameMode::Siege => SIEGE_ENTRY_FEE,
    };
    game.player_count = 0;
    game.max_players = match game_mode {
        GameMode::Blitz => 20,
        GameMode::Siege => 100,
    };
    game.state = GameState::Waiting;
    game.server_authority = config.game_server;
    game.created_at = clock.unix_timestamp;
    game.started_at = None;
    game.ended_at = None;
    game.timeout_at = clock.unix_timestamp + GAME_TIMEOUT;
    game.modifiers = 0;
    
    emit!(GameCreated {
        game_id,
        game_mode,
        created_at: clock.unix_timestamp,
    });
    
    Ok(())
}
```
<!-- POST-MVP:END -->

<!-- MVP:START -->
<!-- POST-MVP:PHASE2 -->
### **4. Future Instructions**

```rust
// Future instructions for post-MVP:
// - create_player_profile
// - submit_session_result  
// - claim_rewards
// - update_monster_tier
```
<!-- POST-MVP:END -->
<!-- MVP:END -->

<!-- POST-MVP:PHASE3 -->
### **4. Join Game (with Multi-Warrior Support)**

```rust
// Full version with multi-warrior and dynamic fees
pub fn join_game(
    ctx: Context<JoinGame>,
    warrior_count: u8,
) -> Result<()> {
    require!(warrior_count > 0 && warrior_count <= 5, ErrorCode::InvalidWarriorCount);
    
    let game = &mut ctx.accounts.game_escrow;
    let player_profile = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;
    
    // Check game state
    require!(game.state == GameState::Waiting, ErrorCode::GameNotJoinable);
    require!(game.player_count + warrior_count <= game.max_players, ErrorCode::GameFull);
    
    // Calculate total fee with scaling
    let total_fee = calculate_entry_fee(game, warrior_count, clock.unix_timestamp);
    
    // Transfer fees to escrow
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.player.to_account_info(),
            to: ctx.accounts.game_escrow.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, total_fee)?;
    
    // Update game state
    game.total_pot += total_fee;
    game.player_count += warrior_count;
    
    // Update player stats
    player_profile.total_games += warrior_count as u32;
    player_profile.total_wagered += total_fee;
    player_profile.last_game = clock.unix_timestamp;
    
    // Create warrior entries
    for i in 0..warrior_count {
        emit!(WarriorJoined {
            game_id: game.game_id,
            player: ctx.accounts.player.key(),
            warrior_index: i,
            entry_fee: total_fee / warrior_count as u64,
            timestamp: clock.unix_timestamp,
        });
    }
    
    Ok(())
}

fn calculate_entry_fee(game: &GameEscrow, warrior_count: u8, current_time: i64) -> u64 {
    let base_fee = game.entry_fee;
    let mut total = 0u64;
    
    // Multi-warrior scaling
    for i in 0..warrior_count {
        let multiplier = match i {
            0 => 100,  // 1.00x
            1 => 105,  // 1.05x
            2 => 110,  // 1.10x
            3 => 115,  // 1.15x
            _ => 120,  // 1.20x
        };
        total += (base_fee * multiplier) / 100;
    }
    
    // Late entry penalty
    if let Some(started_at) = game.started_at {
        let game_duration = current_time - started_at;
        let game_progress = game_duration as f64 / GAME_DURATION as f64;
        
        let late_multiplier = if game_progress < 0.25 {
            100  // No penalty
        } else if game_progress < 0.50 {
            150  // 1.5x
        } else if game_progress < 0.75 {
            200  // 2.0x
        } else {
            300  // 3.0x
        };
        
        total = (total * late_multiplier) / 100;
    }
    
    total
}
```
<!-- POST-MVP:END -->


<!-- POST-MVP:PHASE2 -->
### **5. End Game (Multi-Winner Support)**

```rust
// Full version with multi-winner and VRF proof
pub fn end_game(
    ctx: Context<EndGame>,
    winners: Vec<WinnerInfo>,
    vrf_proof: Option<String>,
) -> Result<()> {
    let game = &mut ctx.accounts.game_escrow;
    let config = &ctx.accounts.program_config;
    let clock = Clock::get()?;
    
    // Verify server authority
    require!(
        ctx.accounts.server.key() == game.server_authority,
        ErrorCode::UnauthorizedServer
    );
    
    // Verify game state
    require!(game.state == GameState::Active, ErrorCode::GameNotActive);
    
    // Verify winner count
    match game.game_mode {
        GameMode::Blitz => require!(winners.len() == 1, ErrorCode::InvalidWinnerCount),
        GameMode::Siege => require!(winners.len() <= 3, ErrorCode::InvalidWinnerCount),
    }
    
    // Calculate distributions
    let total_pot = game.total_pot;
    let treasury_fee = (total_pot * config.fee_percentage as u64) / 100;
    let prize_pool = total_pot - treasury_fee;
    
    // Transfer treasury fee
    **game.to_account_info().try_borrow_mut_lamports()? -= treasury_fee;
    **ctx.accounts.treasury.try_borrow_mut_lamports()? += treasury_fee;
    
    // Distribute prizes
    for winner in &winners {
        let prize = (prize_pool * winner.share_percentage as u64) / 100;
        
        **game.to_account_info().try_borrow_mut_lamports()? -= prize;
        **winner.wallet.try_borrow_mut_lamports()? += prize;
        
        emit!(PrizeClaimed {
            game_id: game.game_id,
            winner: winner.wallet.key(),
            amount: prize,
            placement: winner.placement,
        });
    }
    
    // Update game state
    game.state = GameState::Ended;
    game.ended_at = Some(clock.unix_timestamp);
    
    // Update config stats
    let config = &mut ctx.accounts.program_config;
    config.total_games += 1;
    config.total_volume += total_pot;
    
    emit!(GameEnded {
        game_id: game.game_id,
        winners: winners.iter().map(|w| w.wallet.key()).collect(),
        total_pot,
        vrf_proof,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct WinnerInfo {
    pub wallet: Pubkey,
    pub placement: u8,
    pub share_percentage: u8, // e.g., 60 for 60%
}
```
<!-- POST-MVP:END -->

<!-- POST-MVP:PHASE2 -->
### **6. Update Player XP (Called After Game Ends)**

```rust
// instructions/player.rs - NOT IN MVP
pub fn update_player_xp(
    ctx: Context<UpdatePlayerXP>,
    xp_earned: u64,
) -> Result<()> {
    let player = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;
    
    // Apply multiplier (for events)
    let final_xp = (xp_earned * player.xp_multiplier as u64) / 100;
    
    // Update XP and level
    player.xp = player.xp.checked_add(final_xp).unwrap();
    let new_level = PlayerProfile::calculate_level(player.xp);
    
    // Check for level up
    if new_level > player.level {
        emit!(PlayerLevelUp {
            player: player.authority,
            old_level: player.level,
            new_level,
            total_xp: player.xp,
        });
        player.level = new_level;
    }
    
    emit!(XPGained {
        player: player.authority,
        xp_earned: final_xp,
        total_xp: player.xp,
        level: player.level,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct UpdatePlayerXP<'info> {
    #[account(
        mut,
        seeds = [PlayerProfile::SEED_PREFIX, player.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    
    pub player: Signer<'info>,
    
    /// CHECK: Game server authority
    #[account(
        constraint = server.key() == ctx.accounts.program_config.game_server
    )]
    pub server: Signer<'info>,
    
    pub program_config: Account<'info, ProgramConfig>,
}
```
<!-- POST-MVP:END -->

---

## **⚠️ Error Handling**

```rust
// errors.rs - SIMPLIFIED MVP
use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Insufficient funds")]
    InsufficientFunds,
    
    #[msg("Invalid winner")]
    InvalidWinner,
    
    #[msg("Pot is empty")]
    EmptyPot,
}
```

---

## **🔒 Security Patterns**

### **1. PDA Validation**

```rust
// Always validate PDA derivation
pub fn validate_player_pda(
    player: &Pubkey,
    player_profile: &Pubkey,
    bump: u8,
) -> Result<()> {
    let expected = Pubkey::create_program_address(
        &[PlayerProfile::SEED_PREFIX, player.as_ref(), &[bump]],
        &crate::ID,
    )?;
    
    require!(expected == *player_profile, ErrorCode::InvalidPDA);
    Ok(())
}
```

### **2. Timeout Protection**

```rust
pub fn claim_timeout_refund(ctx: Context<TimeoutRefund>) -> Result<()> {
    let game = &ctx.accounts.game_escrow;
    let clock = Clock::get()?;
    
    // Check if game has timed out
    require!(clock.unix_timestamp > game.timeout_at, ErrorCode::GameNotTimeout);
    require!(game.state != GameState::Ended, ErrorCode::GameAlreadyEnded);
    
    // Refund all players proportionally
    // Implementation depends on how you track individual entries
    
    Ok(())
}
```

### **3. Reentrancy Protection**

```rust
// Use account state to prevent reentrancy
pub fn sensitive_operation(ctx: Context<SensitiveOp>) -> Result<()> {
    let account = &mut ctx.accounts.some_account;
    
    // Check and set flag atomically
    require!(!account.is_processing, ErrorCode::Reentrancy);
    account.is_processing = true;
    
    // Do operation...
    
    // Clear flag
    account.is_processing = false;
    Ok(())
}
```

---

## **🧪 Testing Strategy**

```rust
// tests/aurelius_colosseum.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AureliusColosseum } from "../target/types/aurelius_colosseum";
import { expect } from "chai";

describe("aurelius-colosseum", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.AureliusColosseum as Program<AureliusColosseum>;
  
  it("Initializes pot", async () => {
    const treasury = anchor.web3.Keypair.generate();
    
    await program.methods
      .initialize(treasury.publicKey)
      .accounts({
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    // Verify pot state
    const [potPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pot")],
      program.programId
    );
    
    const pot = await program.account.potState.fetch(potPDA);
    expect(pot.currentPot.toNumber()).to.equal(0);
    expect(pot.totalEntries.toNumber()).to.equal(0);
  });
  
  it("Player pays entry and wins jackpot", async () => {
    const player = anchor.web3.Keypair.generate();
    
    // Airdrop SOL
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player.publicKey, 1 * LAMPORTS_PER_SOL)
    );
    
    // Pay entry (3 times to build pot)
    for (let i = 0; i < 3; i++) {
      await program.methods
        .payEntry()
        .accounts({
          player: player.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([player])
        .rpc();
    }
    
    // Verify pot has 0.03 SOL
    let pot = await program.account.potState.fetch(potPDA);
    expect(pot.currentPot.toNumber()).to.equal(30_000_000);
    
    // Process win
    await program.methods
      .processWin(player.publicKey)
      .accounts({
        winner: player.publicKey,
        treasury: treasury.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();
    
    // Verify pot reset and winner recorded
    pot = await program.account.potState.fetch(potPDA);
    expect(pot.currentPot.toNumber()).to.equal(0);
    expect(pot.lastWinner.toBase58()).to.equal(player.publicKey.toBase58());
    expect(pot.lastWinAmount.toNumber()).to.equal(30_000_000);
  });
});
```

---

## **📊 Gas Optimization Tips**

1. **Use smaller integer types** - u32 instead of u64 where possible
2. **Pack struct fields** - Order by size descending
3. **Batch operations** - Multiple warriors in one transaction
4. **Minimal storage** - Only store what's absolutely necessary
5. **Close temporary accounts** - Return rent after game ends

---

## **🚀 Deployment Checklist**

<!-- MVP:START -->
### **MVP Deployment**
- [ ] Pot initialization tested
- [ ] Entry payment tested
- [ ] Win processing tested
- [ ] Treasury wallet secured  
- [ ] Deploy to devnet first
- [ ] Verify rent exemption
<!-- MVP:END -->

<!-- POST-MVP:PHASE4 -->
### **Full Production Deployment**
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Upgrade authority set to multisig
- [ ] Treasury wallet secured
- [ ] Game server key in Blackbox
- [ ] Emergency pause tested
- [ ] Timeout refunds tested
- [ ] Gas costs optimized
- [ ] Program frozen (no upgrades)
<!-- POST-MVP:END -->

---

*This implementation provides a secure, verifiable monster combat jackpot system for Aurelius Colosseum on Solana.*