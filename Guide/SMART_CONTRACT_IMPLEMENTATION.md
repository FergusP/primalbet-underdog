# **AURELIUS COLOSSEUM SMART CONTRACT IMPLEMENTATION**
*Anchor Framework for Monster Combat Jackpot System*

<!-- MVP:SUMMARY -->
## **🚀 MVP Smart Contract Features (MONSTER COMBAT)**
For the 2-3 day MVP, implement:
- **Player Profile**: Track combat wins, vault cracks, total earnings
- **Colosseum State**: Global jackpot pool tracking
- **Combat Result**: Store VRF combat outcomes
- **Core Instructions**: create_player, enter_colosseum, submit_combat_result, attempt_vault_crack
- **Prize Pool**: Accumulates from failed attempts, pays out on vault crack

Skip for MVP: XP system, achievements, seasonal events
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
    pub game_server: Pubkey,         // Authorized backend server
    pub fee_percentage: u8,          // Platform fee (10%)
    pub is_paused: bool,             // Emergency pause
    pub total_jackpots_won: u64,     // Lifetime jackpots cracked
    pub total_volume: u64,           // Total SOL processed
}

impl ProgramConfig {
    pub const SIZE: usize = 8 +     // discriminator
        32 +                         // authority
        32 +                         // treasury
        32 +                         // game_server
        1 +                          // fee_percentage
        1 +                          // is_paused
        8 +                          // total_jackpots_won
        8;                           // total_volume
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
    pub total_combats: u32,          // Total monster fights
    pub monsters_defeated: u32,      // Successful kills
    pub vault_attempts: u32,         // Times tried to crack vault
    pub vaults_cracked: u32,         // Successful vault cracks
    pub total_winnings: u64,         // Total SOL won from jackpots
    pub total_spent: u64,            // Total SOL spent on entry fees
    pub last_combat: i64,            // Timestamp of last fight
}

impl PlayerProfile {
    pub const SIZE: usize = 8 +      // discriminator
        32 +                         // authority
        4 +                          // total_combats
        4 +                          // monsters_defeated
        4 +                          // vault_attempts
        4 +                          // vaults_cracked
        8 +                          // total_winnings
        8 +                          // total_spent
        8;                           // last_combat
        
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

### **3. Colosseum State (Global Jackpot)**

<!-- MVP:START -->
```rust
// state/colosseum.rs - MVP VERSION
#[account]
pub struct ColosseumState {
    pub current_jackpot: u64,        // Current prize pool
    pub current_monster: MonsterType, // Active monster type
    pub monster_health: u32,         // For tracking damage (visual)
    pub total_entries: u64,          // Lifetime combat entries
    pub last_winner: Option<Pubkey>, // Last vault cracker
    pub last_win_amount: u64,        // Last jackpot amount
    pub last_win_time: i64,          // When last won
}

impl ColosseumState {
    pub const SIZE: usize = 8 +      // discriminator
        8 +                          // current_jackpot
        1 +                          // current_monster (enum)
        4 +                          // monster_health
        8 +                          // total_entries
        33 +                         // last_winner (Option<Pubkey>)
        8 +                          // last_win_amount
        8;                           // last_win_time
        
    pub const SEED_PREFIX: &'static [u8] = b"colosseum";
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum MonsterType {
    Skeleton,
    Goblin,
    Minotaur,
    Hydra,
    Dragon,
    Titan,
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
### **1. Initialize Program**

```rust
// instructions/initialize.rs - MVP VERSION
pub fn initialize(
    ctx: Context<Initialize>,
    treasury: Pubkey,
    game_server: Pubkey,
) -> Result<()> {
    let program_config = &mut ctx.accounts.program_config;
    
    program_config.authority = ctx.accounts.authority.key();
    program_config.treasury = treasury;
    program_config.game_server = game_server;
    program_config.fee_percentage = 10; // 10% platform fee
    program_config.is_paused = false;
    program_config.total_jackpots_won = 0;
    program_config.total_volume = 0;
    
    // Initialize colosseum state
    let colosseum = &mut ctx.accounts.colosseum_state;
    colosseum.current_jackpot = 0;
    colosseum.current_monster = MonsterType::Skeleton; // Start with easiest
    colosseum.monster_health = 100;
    colosseum.total_entries = 0;
    colosseum.last_winner = None;
    colosseum.last_win_amount = 0;
    colosseum.last_win_time = 0;
    
    emit!(ProgramInitialized {
        authority: program_config.authority,
        treasury: program_config.treasury,
        game_server: program_config.game_server,
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
    
    #[account(
        init,
        payer = authority,
        space = ColosseumState::SIZE,
        seeds = [ColosseumState::SEED_PREFIX],
        bump
    )]
    pub colosseum_state: Account<'info, ColosseumState>,
    
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
### **3. Enter Colosseum**

```rust
// instructions/combat.rs - MVP VERSION
pub fn enter_colosseum(
    ctx: Context<EnterColosseum>,
    combat_id: [u8; 16],
) -> Result<()> {
    let config = &ctx.accounts.program_config;
    require!(!config.is_paused, ErrorCode::ProgramPaused);
    
    let colosseum = &mut ctx.accounts.colosseum_state;
    let player_profile = &mut ctx.accounts.player_profile;
    let clock = Clock::get()?;
    
    // Get entry fee based on current monster
    let entry_fee = get_monster_entry_fee(&colosseum.current_monster);
    
    // Transfer entry fee to colosseum PDA
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.player.to_account_info(),
            to: ctx.accounts.colosseum_state.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, entry_fee)?;
    
    // Update colosseum state
    colosseum.current_jackpot += entry_fee;
    colosseum.total_entries += 1;
    
    // Update player stats
    player_profile.total_combats += 1;
    player_profile.total_spent += entry_fee;
    player_profile.last_combat = clock.unix_timestamp;
    
    // Update program stats
    let config = &mut ctx.accounts.program_config;
    config.total_volume += entry_fee;
    
    emit!(GladiatorEntered {
        combat_id,
        gladiator: ctx.accounts.player.key(),
        monster: colosseum.current_monster.clone(),
        entry_fee,
        current_jackpot: colosseum.current_jackpot,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

fn get_monster_entry_fee(monster: &MonsterType) -> u64 {
    match monster {
        MonsterType::Skeleton => 10_000_000,     // 0.01 SOL
        MonsterType::Goblin => 20_000_000,       // 0.02 SOL
        MonsterType::Minotaur => 50_000_000,     // 0.05 SOL
        MonsterType::Hydra => 100_000_000,       // 0.1 SOL
        MonsterType::Dragon => 250_000_000,      // 0.25 SOL
        MonsterType::Titan => 500_000_000,       // 0.5 SOL
    }
}

#[derive(Accounts)]
#[instruction(combat_id: [u8; 16])]
pub struct EnterColosseum<'info> {
    #[account(mut)]
    pub colosseum_state: Account<'info, ColosseumState>,
    
    #[account(
        mut,
        seeds = [PlayerProfile::SEED_PREFIX, player.key().as_ref()],
        bump
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    
    #[account(mut)]
    pub program_config: Account<'info, ProgramConfig>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
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
### **4. Submit Combat Result**

```rust
// instructions/combat.rs - MVP VERSION
pub fn submit_combat_result(
    ctx: Context<SubmitCombatResult>,
    combat_id: [u8; 16],
    gladiator_power: u64,
    gladiator_score: u64,
    monster_score: u64,
    victory: bool,
    vrf_proof: [u8; 64],
) -> Result<()> {
    // Verify server authority
    require!(
        ctx.accounts.server.key() == ctx.accounts.program_config.game_server,
        ErrorCode::UnauthorizedServer
    );
    
    let combat_result = &mut ctx.accounts.combat_result;
    let player_profile = &mut ctx.accounts.player_profile;
    let colosseum = &ctx.accounts.colosseum_state;
    let clock = Clock::get()?;
    
    // Store combat result
    combat_result.combat_id = combat_id;
    combat_result.gladiator = ctx.accounts.gladiator.key();
    combat_result.monster = colosseum.current_monster.clone();
    combat_result.entry_fee = get_monster_entry_fee(&colosseum.current_monster);
    combat_result.gladiator_power = gladiator_power;
    combat_result.gladiator_score = gladiator_score;
    combat_result.monster_score = monster_score;
    combat_result.victory = victory;
    combat_result.vrf_proof = vrf_proof;
    combat_result.timestamp = clock.unix_timestamp;
    combat_result.vault_attempted = false;
    combat_result.vault_cracked = false;
    
    // Update player stats
    if victory {
        player_profile.monsters_defeated += 1;
    }
    
    emit!(CombatResolved {
        combat_id,
        gladiator: ctx.accounts.gladiator.key(),
        monster: colosseum.current_monster.clone(),
        victory,
        gladiator_score,
        monster_score,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(combat_id: [u8; 16])]
pub struct SubmitCombatResult<'info> {
    #[account(
        init,
        payer = server,
        space = CombatResult::SIZE,
        seeds = [CombatResult::SEED_PREFIX, combat_id.as_ref()],
        bump
    )]
    pub combat_result: Account<'info, CombatResult>,
    
    #[account(
        mut,
        seeds = [PlayerProfile::SEED_PREFIX, gladiator.key().as_ref()],
        bump
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    
    pub colosseum_state: Account<'info, ColosseumState>,
    pub program_config: Account<'info, ProgramConfig>,
    
    /// CHECK: The gladiator wallet
    pub gladiator: AccountInfo<'info>,
    
    #[account(mut)]
    pub server: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
```

### **5. Attempt Vault Crack**

```rust
// instructions/combat.rs - MVP VERSION
pub fn attempt_vault_crack(
    ctx: Context<AttemptVaultCrack>,
    vrf_roll: u8, // 0-99 from VRF
    vrf_proof: [u8; 64],
) -> Result<()> {
    // Verify server authority
    require!(
        ctx.accounts.server.key() == ctx.accounts.program_config.game_server,
        ErrorCode::UnauthorizedServer
    );
    
    let combat_result = &mut ctx.accounts.combat_result;
    let colosseum = &mut ctx.accounts.colosseum_state;
    let player_profile = &mut ctx.accounts.player_profile;
    
    // Verify victory and not already attempted
    require!(combat_result.victory, ErrorCode::MustWinFirst);
    require!(!combat_result.vault_attempted, ErrorCode::AlreadyAttempted);
    
    // Mark as attempted
    combat_result.vault_attempted = true;
    player_profile.vault_attempts += 1;
    
    // Get crack chance based on monster
    let crack_chance = get_monster_crack_chance(&combat_result.monster);
    let success = vrf_roll < crack_chance;
    
    if success {
        // Success! Pay out jackpot
        combat_result.vault_cracked = true;
        player_profile.vaults_cracked += 1;
        
        let jackpot = colosseum.current_jackpot;
        let platform_fee = (jackpot * ctx.accounts.program_config.fee_percentage as u64) / 100;
        let prize = jackpot - platform_fee;
        
        // Transfer prize to winner
        **colosseum.to_account_info().try_borrow_mut_lamports()? -= prize;
        **ctx.accounts.gladiator.try_borrow_mut_lamports()? += prize;
        
        // Transfer platform fee
        **colosseum.to_account_info().try_borrow_mut_lamports()? -= platform_fee;
        **ctx.accounts.treasury.try_borrow_mut_lamports()? += platform_fee;
        
        // Update player and program stats
        player_profile.total_winnings += prize;
        let config = &mut ctx.accounts.program_config;
        config.total_jackpots_won += 1;
        
        // Reset colosseum state
        colosseum.current_jackpot = 0;
        colosseum.current_monster = MonsterType::Skeleton; // Back to weakest
        colosseum.monster_health = 100;
        colosseum.last_winner = Some(ctx.accounts.gladiator.key());
        colosseum.last_win_amount = jackpot;
        colosseum.last_win_time = Clock::get()?.unix_timestamp;
        
        emit!(JackpotWon {
            winner: ctx.accounts.gladiator.key(),
            monster: combat_result.monster.clone(),
            jackpot_amount: jackpot,
            prize_after_fee: prize,
            vrf_roll,
            crack_chance,
            timestamp: Clock::get()?.unix_timestamp,
        });
    } else {
        // Failed - jackpot continues to grow
        emit!(VaultCrackFailed {
            gladiator: ctx.accounts.gladiator.key(),
            monster: combat_result.monster.clone(),
            vrf_roll,
            crack_chance,
            current_jackpot: colosseum.current_jackpot,
        });
    }
    
    Ok(())
}

fn get_monster_crack_chance(monster: &MonsterType) -> u8 {
    match monster {
        MonsterType::Skeleton => 10,    // 10% chance
        MonsterType::Goblin => 20,      // 20% chance
        MonsterType::Minotaur => 35,    // 35% chance
        MonsterType::Hydra => 50,       // 50% chance
        MonsterType::Dragon => 70,      // 70% chance
        MonsterType::Titan => 90,       // 90% chance
    }
}

#[derive(Accounts)]
pub struct AttemptVaultCrack<'info> {
    #[account(
        mut,
        seeds = [CombatResult::SEED_PREFIX, combat_result.combat_id.as_ref()],
        bump,
        has_one = gladiator
    )]
    pub combat_result: Account<'info, CombatResult>,
    
    #[account(mut)]
    pub colosseum_state: Account<'info, ColosseumState>,
    
    #[account(
        mut,
        seeds = [PlayerProfile::SEED_PREFIX, gladiator.key().as_ref()],
        bump
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    
    #[account(mut)]
    pub program_config: Account<'info, ProgramConfig>,
    
    /// CHECK: The gladiator wallet
    #[account(mut)]
    pub gladiator: AccountInfo<'info>,
    
    /// CHECK: Treasury wallet
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    
    #[account(mut)]
    pub server: Signer<'info>,
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

### **6. Update Monster (After Failed Attempts)**

```rust
// instructions/admin.rs - MVP VERSION
pub fn update_monster(
    ctx: Context<UpdateMonster>,
    new_monster: MonsterType,
    new_health: u32,
) -> Result<()> {
    // Verify server authority
    require!(
        ctx.accounts.server.key() == ctx.accounts.program_config.game_server,
        ErrorCode::UnauthorizedServer
    );
    
    let colosseum = &mut ctx.accounts.colosseum_state;
    let clock = Clock::get()?;
    
    // Update monster based on current jackpot size
    colosseum.current_monster = new_monster.clone();
    colosseum.monster_health = new_health;
    
    emit!(MonsterSpawned {
        monster_type: new_monster,
        health: new_health,
        jackpot_size: colosseum.current_jackpot,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateMonster<'info> {
    #[account(mut)]
    pub colosseum_state: Account<'info, ColosseumState>,
    
    pub program_config: Account<'info, ProgramConfig>,
    
    #[account(mut)]
    pub server: Signer<'info>,
}
```

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
    
    #[msg("Must defeat monster before attempting vault")]
    MustWinFirst,
    
    #[msg("Vault crack already attempted for this combat")]
    AlreadyAttempted,
    
    #[msg("Unauthorized server")]
    UnauthorizedServer,
    
    #[msg("Invalid monster type")]
    InvalidMonster,
    
    #[msg("Insufficient funds for entry")]
    InsufficientFunds,
    
    #[msg("Player profile not found")]
    PlayerNotFound,
    
    #[msg("Combat result not found")]
    CombatNotFound,
    
    #[msg("Invalid VRF proof")]
    InvalidVRFProof,
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
  const gameServer = anchor.web3.Keypair.generate();
  
  it("Initializes colosseum", async () => {
    const treasury = anchor.web3.Keypair.generate();
    
    await program.methods
      .initialize(treasury.publicKey, gameServer.publicKey)
      .accounts({
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    // Verify colosseum state
    const [colosseumPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("colosseum")],
      program.programId
    );
    
    const colosseum = await program.account.colosseumState.fetch(colosseumPDA);
    expect(colosseum.currentJackpot.toNumber()).to.equal(0);
    expect(colosseum.currentMonster).to.deep.equal({ skeleton: {} });
  });
  
  it("Player enters colosseum and fights monster", async () => {
    const player = anchor.web3.Keypair.generate();
    const combatId = [...Buffer.from("test-combat-001")];
    
    // Airdrop SOL
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player.publicKey, 10 * LAMPORTS_PER_SOL)
    );
    
    // Create player profile
    const [playerPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player.publicKey.toBuffer()],
      program.programId
    );
    
    await program.methods
      .createPlayerProfile()
      .accounts({
        playerProfile: playerPDA,
        player: player.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player])
      .rpc();
    
    // Enter colosseum
    await program.methods
      .enterColosseum(combatId)
      .accounts({
        player: player.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player])
      .rpc();
    
    // Simulate combat result (victory)
    const vrfProof = [...Buffer.alloc(64).fill(1)];
    await program.methods
      .submitCombatResult(
        combatId,
        new anchor.BN(10000), // gladiator power
        new anchor.BN(150),   // gladiator score
        new anchor.BN(100),   // monster score
        true,                 // victory
        vrfProof
      )
      .accounts({
        gladiator: player.publicKey,
        server: gameServer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([gameServer])
      .rpc();
    
    // Attempt vault crack
    await program.methods
      .attemptVaultCrack(
        5,  // roll < 10% chance for skeleton
        vrfProof
      )
      .accounts({
        gladiator: player.publicKey,
        server: gameServer.publicKey,
      })
      .signers([gameServer])
      .rpc();
    
    // Verify jackpot was won
    const colosseum = await program.account.colosseumState.fetch(colosseumPDA);
    expect(colosseum.lastWinner.toBase58()).to.equal(player.publicKey.toBase58());
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
- [ ] All combat tests passing
- [ ] Treasury wallet secured  
- [ ] Game server key protected
- [ ] VRF integration tested
- [ ] Jackpot payout verified
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

*This implementation provides a secure, verifiable monster combat jackpot system for Aurelius Colosseum on Solana.*