# **AURELIUS SMART CONTRACT IMPLEMENTATION GUIDE**
*Anchor Framework Architecture for Partner A*

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

### **1. Program Config (Singleton)**

```rust
// state/config.rs
use anchor_lang::prelude::*;

#[account]
pub struct ProgramConfig {
    pub authority: Pubkey,           // Admin wallet
    pub treasury: Pubkey,            // Fee collection
    pub game_server: Pubkey,         // Authorized server
    pub fee_percentage: u8,          // Platform fee (3%)
    pub is_paused: bool,             // Emergency pause
    pub total_games: u64,            // Lifetime counter
    pub total_volume: u64,           // Total SOL processed
}

impl ProgramConfig {
    pub const SIZE: usize = 8 +     // discriminator
        32 +                         // authority
        32 +                         // treasury
        32 +                         // game_server
        1 +                          // fee_percentage
        1 +                          // is_paused
        8 +                          // total_games
        8;                           // total_volume
}
```

### **2. Player Profile PDA**

```rust
// state/player.rs
#[account]
pub struct PlayerProfile {
    pub authority: Pubkey,           // Player wallet
    pub total_games: u32,            // Reduce from u64 to save space
    pub games_won: u32,              
    pub total_earnings: u64,         // Keep u64 for precision
    pub total_wagered: u64,
    pub last_game: i64,              // Timestamp
    pub highest_streak: u16,
    pub current_streak: u16,
    pub join_date: i64,
}

impl PlayerProfile {
    pub const SIZE: usize = 8 +      // discriminator
        32 +                         // authority
        4 +                          // total_games
        4 +                          // games_won
        8 +                          // total_earnings
        8 +                          // total_wagered
        8 +                          // last_game
        2 +                          // highest_streak
        2 +                          // current_streak
        8;                           // join_date
        
    pub const SEED_PREFIX: &'static [u8] = b"player";
}
```

### **3. Game Escrow Account**

```rust
// state/game.rs
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

### **4. Warrior Entry (Temporary)**

```rust
// state/game.rs
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

---

## **📝 Core Instructions**

### **1. Initialize Program**

```rust
// instructions/initialize.rs
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

### **2. Create Player Profile**

```rust
// instructions/player.rs
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

### **3. Create Game**

```rust
// instructions/game.rs
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

### **4. Join Game (with Multi-Warrior Support)**

```rust
// instructions/game.rs
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

### **5. End Game (Multi-Winner Support)**

```rust
// instructions/game.rs
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

- [ ] All tests passing
- [ ] Security audit complete
- [ ] Upgrade authority set to multisig
- [ ] Treasury wallet secured
- [ ] Game server key in Blackbox
- [ ] Emergency pause tested
- [ ] Timeout refunds tested
- [ ] Gas costs optimized
- [ ] Program frozen (no upgrades)

---

*This implementation provides a secure, efficient foundation for Aurelius on Solana.*