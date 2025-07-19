# **AURELIUS SMART CONTRACT IMPLEMENTATION GUIDE**
*Anchor Framework Architecture for Partner A*

<!-- MVP:SUMMARY -->
## **🚀 MVP Smart Contract Features**
For the 3-5 day MVP, only implement:
- **Basic Player Profile**: Just wins/earnings tracking
- **Simple Game Escrow**: Single mode (Blitz), fixed 0.002 SOL entry
- **Core Instructions**: create_player, join_game, end_game
- **Single Winner**: No multi-winner or XP system
- **10 Players Max**: Simplified for quick testing

Skip for MVP: Multi-warrior, late entry, XP system, Siege mode, VRF integration
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
### **1. Program Config (Singleton) - MVP VERSION**

```rust
// state/config.rs
use anchor_lang::prelude::*;

#[account]
pub struct ProgramConfig {
    pub authority: Pubkey,           // Admin wallet
    pub treasury: Pubkey,            // Fee collection
    pub fee_percentage: u8,          // Platform fee (3%)
    pub is_paused: bool,             // Emergency pause
}

impl ProgramConfig {
    pub const SIZE: usize = 8 +     // discriminator
        32 +                         // authority
        32 +                         // treasury
        1 +                          // fee_percentage
        1;                           // is_paused
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

### **2. Player Profile PDA**

<!-- MVP:START -->
```rust
// state/player.rs - MVP VERSION
#[account]
pub struct PlayerProfile {
    pub authority: Pubkey,           // Player wallet
    pub total_games: u32,              
    pub games_won: u32,              
    pub total_earnings: u64,         // Keep u64 for precision
}

impl PlayerProfile {
    pub const SIZE: usize = 8 +      // discriminator
        32 +                         // authority
        4 +                          // total_games
        4 +                          // games_won
        8;                           // total_earnings
        
    pub const SEED_PREFIX: &'static [u8] = b"player";
}
```
<!-- MVP:END -->

<!-- POST-MVP:PHASE2 -->
```rust
// Additional fields for full version:
pub total_wagered: u64,
pub last_game: i64,              // Timestamp
pub highest_streak: u16,
pub current_streak: u16,
pub join_date: i64,
pub xp: u64,                     // Total XP earned
pub level: u8,                   // Current level (0-255)
pub xp_multiplier: u16,          // Base 100 = 1x (for events)

pub fn calculate_level(xp: u64) -> u8 {
    // Level = floor(sqrt(XP / 100))
    let level = ((xp / 100) as f64).sqrt().floor() as u8;
    level.min(255) // Cap at 255
}
```
<!-- POST-MVP:END -->

### **3. Game Escrow Account**

<!-- MVP:START -->
```rust
// state/game.rs - MVP VERSION (Blitz only, simplified)
#[account]
pub struct GameEscrow {
    pub game_id: [u8; 16],           // UUID as bytes
    pub total_pot: u64,              // Total prize pool
    pub player_count: u8,            // Current players
    pub state: GameState,            // Current state
    pub created_at: i64,
    pub ended_at: Option<i64>,
    pub timeout_at: i64,             // Auto-refund time
}
```
<!-- MVP:END -->

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

<!-- POST-MVP:PHASE3 -->
### **4. Warrior Entry (Temporary)**

```rust
// state/game.rs - NOT NEEDED FOR MVP (single warrior per player)
#[account]
pub struct WarriorEntry {
    pub game_id: [u8; 16],
    pub player: Pubkey,
    pub warrior_index: u8,           // For multi-warrior
    pub entry_time: i64,
    pub entry_fee_paid: u64,         // Actual fee (with scaling)
    pub is_late_entry: bool,
}

impl WarriorEntry {
    pub const SIZE: usize = 8 +      // discriminator
        16 +                         // game_id
        32 +                         // player
        1 +                          // warrior_index
        8 +                          // entry_time
        8 +                          // entry_fee_paid
        1;                           // is_late_entry
}
```
<!-- POST-MVP:END -->

---

## **📝 Core Instructions**

<!-- MVP:START -->
### **1. Initialize Program**

```rust
// instructions/initialize.rs - MVP VERSION
pub fn initialize(
    ctx: Context<Initialize>,
    treasury: Pubkey,
) -> Result<()> {
    let program_config = &mut ctx.accounts.program_config;
    
    program_config.authority = ctx.accounts.authority.key();
    program_config.treasury = treasury;
    program_config.fee_percentage = 3; // 3%
    program_config.is_paused = false;
    
    emit!(ProgramInitialized {
        authority: program_config.authority,
        treasury: program_config.treasury,
    });
    
    Ok(())
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
### **2. Create Player Profile**

```rust
// instructions/player.rs - MVP VERSION
pub fn create_player_profile(ctx: Context<CreatePlayer>) -> Result<()> {
    let player = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;
    
    player.authority = ctx.accounts.player.key();
    player.total_games = 0;
    player.games_won = 0;
    player.total_earnings = 0;
    
    emit!(PlayerCreated {
        player: player.authority,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
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
### **3. Create Game**

```rust
// instructions/game.rs - MVP VERSION (Blitz only)
pub fn create_game(
    ctx: Context<CreateGame>,
    game_id: [u8; 16],
) -> Result<()> {
    let config = &ctx.accounts.program_config;
    require!(!config.is_paused, ErrorCode::ProgramPaused);
    
    let game = &mut ctx.accounts.game_escrow;
    let clock = Clock::get()?;
    
    game.game_id = game_id;
    game.total_pot = 0;
    game.player_count = 0;
    game.state = GameState::Waiting;
    game.created_at = clock.unix_timestamp;
    game.ended_at = None;
    game.timeout_at = clock.unix_timestamp + 600; // 10 min timeout
    
    emit!(GameCreated {
        game_id,
        created_at: clock.unix_timestamp,
    });
    
    Ok(())
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
### **4. Join Game**

```rust
// instructions/game.rs - MVP VERSION (single warrior, fixed fee)
pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
    let game = &mut ctx.accounts.game_escrow;
    let player_profile = &mut ctx.accounts.player_profile;
    
    // Check game state
    require!(game.state == GameState::Waiting, ErrorCode::GameNotJoinable);
    require!(game.player_count < 10, ErrorCode::GameFull); // MVP: 10 players max
    
    // Fixed entry fee for MVP
    let entry_fee = 2_000_000; // 0.002 SOL
    
    // Transfer fee to escrow
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.player.to_account_info(),
            to: ctx.accounts.game_escrow.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, entry_fee)?;
    
    // Update game state
    game.total_pot += entry_fee;
    game.player_count += 1;
    
    // Update player stats
    player_profile.total_games += 1;
    
    emit!(PlayerJoined {
        game_id: game.game_id,
        player: ctx.accounts.player.key(),
        entry_fee,
    });
    
    Ok(())
}
```
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

<!-- MVP:START -->
### **5. End Game**

```rust
// instructions/game.rs - MVP VERSION (single winner)
pub fn end_game(
    ctx: Context<EndGame>,
    winner: Pubkey,
) -> Result<()> {
    let game = &mut ctx.accounts.game_escrow;
    let config = &ctx.accounts.program_config;
    let clock = Clock::get()?;
    
    // Verify game state
    require!(game.state == GameState::Active, ErrorCode::GameNotActive);
    
    // Calculate distributions
    let total_pot = game.total_pot;
    let treasury_fee = (total_pot * config.fee_percentage as u64) / 100;
    let prize = total_pot - treasury_fee;
    
    // Transfer treasury fee
    **game.to_account_info().try_borrow_mut_lamports()? -= treasury_fee;
    **ctx.accounts.treasury.try_borrow_mut_lamports()? += treasury_fee;
    
    // Transfer prize to winner
    **game.to_account_info().try_borrow_mut_lamports()? -= prize;
    **ctx.accounts.winner.try_borrow_mut_lamports()? += prize;
    
    // Update winner stats
    let winner_profile = &mut ctx.accounts.winner_profile;
    winner_profile.games_won += 1;
    winner_profile.total_earnings += prize;
    
    // Update game state
    game.state = GameState::Ended;
    game.ended_at = Some(clock.unix_timestamp);
    
    emit!(GameEnded {
        game_id: game.game_id,
        winner,
        prize,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}
```
<!-- MVP:END -->

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
// errors.rs
use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Program is currently paused")]
    ProgramPaused,
    
    #[msg("Game is not in joinable state")]
    GameNotJoinable,
    
    #[msg("Game is full")]
    GameFull,
    
    #[msg("Invalid warrior count (1-5)")]
    InvalidWarriorCount,
    
    #[msg("Game is not active")]
    GameNotActive,
    
    #[msg("Unauthorized server")]
    UnauthorizedServer,
    
    #[msg("Invalid winner count for game mode")]
    InvalidWinnerCount,
    
    #[msg("Game has timed out")]
    GameTimeout,
    
    #[msg("Insufficient funds")]
    InsufficientFunds,
    
    #[msg("Player not found")]
    PlayerNotFound,
    
    #[msg("Invalid game mode")]
    InvalidGameMode,
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
// tests/aurelius.ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Aurelius } from "../target/types/aurelius";
import { expect } from "chai";

describe("aurelius", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.Aurelius as Program<Aurelius>;
  
  it("Creates player profile", async () => {
    const player = anchor.web3.Keypair.generate();
    
    // Airdrop SOL for testing
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player.publicKey, 10 * LAMPORTS_PER_SOL)
    );
    
    // Derive PDA
    const [playerPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player.publicKey.toBuffer()],
      program.programId
    );
    
    // Create profile
    await program.methods
      .createPlayerProfile()
      .accounts({
        playerProfile: playerPDA,
        player: player.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player])
      .rpc();
    
    // Verify
    const account = await program.account.playerProfile.fetch(playerPDA);
    expect(account.authority.toBase58()).to.equal(player.publicKey.toBase58());
    expect(account.totalGames).to.equal(0);
  });
  
  // Add more tests...
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
- [ ] Basic tests passing (create player, join game, end game)
- [ ] Treasury wallet secured
- [ ] Emergency pause tested
- [ ] Basic timeout mechanism tested
- [ ] Deploy to devnet first
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

*This implementation provides a secure, efficient foundation for Aurelius on Solana.*