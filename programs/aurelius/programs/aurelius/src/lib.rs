use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;

declare_id!("J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z");

// Hardcoded constants - no initialization required
const ENTRY_FEE: u64 = 10_000_000; // 0.01 SOL
const TREASURY_FEE_BPS: u16 = 500; // 5% (500 basis points)
const POOL_FEE_BPS: u16 = 9500; // 95%

// Hardcoded wallet addresses
const TREASURY_WALLET: &str = "EsRy4vmaHbnj3kfj2X9rpRRgbKcA6a9DtdXrBddnNoVi";
const BACKEND_SIGNER: &str = "2pde6PGeMLbXhFkLWzEhpSGFqkhU9eica8RjbrEkwvb5";

#[program]
pub mod aurelius {
    use super::*;

    // Enter combat - pay entry fee and add to pot
    // This now auto-creates player account if needed!
    pub fn enter_combat(ctx: Context<EnterCombat>) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;
        let game_state = &mut ctx.accounts.game_state;
        
        // Initialize player account if just created
        if player_account.wallet == Pubkey::default() {
            player_account.wallet = ctx.accounts.player.key();
            player_account.balance = 0; // Initialize with zero PDA balance
            player_account.total_combats = 0;
            player_account.victories = 0;
            player_account.total_winnings = 0;
            player_account.last_combat = 0;
            player_account.last_payment_method = 0; // Initialize as wallet payment
            msg!("New player account created for: {}", ctx.accounts.player.key());
        }
        
        // Calculate fee split
        let treasury_fee = ENTRY_FEE * TREASURY_FEE_BPS as u64 / 10000;
        let pool_fee = ENTRY_FEE - treasury_fee;
        
        // Transfer treasury fee
        let treasury_transfer_ix = system_instruction::transfer(
            &ctx.accounts.player.key(),
            &ctx.accounts.treasury.key(),
            treasury_fee,
        );
        anchor_lang::solana_program::program::invoke(
            &treasury_transfer_ix,
            &[
                ctx.accounts.player.to_account_info(),
                ctx.accounts.treasury.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        
        // Transfer pool fee to pot vault
        let pool_transfer_ix = system_instruction::transfer(
            &ctx.accounts.player.key(),
            &ctx.accounts.pot_vault.key(),
            pool_fee,
        );
        anchor_lang::solana_program::program::invoke(
            &pool_transfer_ix,
            &[
                ctx.accounts.player.to_account_info(),
                ctx.accounts.pot_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        
        // Update game state
        game_state.current_pot += pool_fee;
        game_state.total_entries += 1;
        
        // Update player stats
        player_account.total_combats += 1;
        player_account.last_combat = Clock::get()?.unix_timestamp;
        player_account.last_payment_method = 0; // Wallet payment
        
        msg!("Player entered via wallet! New pot: {} lamports", game_state.current_pot);
        Ok(())
    }

    // Backend claims prize for winner
    pub fn claim_prize_backend(
        ctx: Context<ClaimPrizeBackend>,
        winner_wallet: Pubkey,
        vrf_proof: String,
    ) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;
        
        // Verify backend signer
        require_keys_eq!(
            ctx.accounts.backend_signer.key(),
            Pubkey::try_from(BACKEND_SIGNER).unwrap(),
            ErrorCode::UnauthorizedBackend
        );
        
        // Get prize amount (entire pot)
        let prize_amount = game_state.current_pot;
        require!(prize_amount > 0, ErrorCode::EmptyPot);
        
        // Smart prize destination: match payment method used
        if ctx.accounts.winner_player.wallet != Pubkey::default() && 
           ctx.accounts.winner_player.last_payment_method == 1 {
            // Player used PDA to enter → Prize goes to PDA for gasless gameplay
            
            // Transfer from pot vault to player PDA using system program
            let transfer_ix = system_instruction::transfer(
                &ctx.accounts.pot_vault.key(),
                &ctx.accounts.winner_player.key(),
                prize_amount,
            );
            anchor_lang::solana_program::program::invoke_signed(
                &transfer_ix,
                &[
                    ctx.accounts.pot_vault.to_account_info(),
                    ctx.accounts.winner_player.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[&[b"pot_vault", &[ctx.bumps.pot_vault]]],
            )?;
            
            // Update PDA balance tracking
            ctx.accounts.winner_player.balance += prize_amount;
            msg!("Prize sent to PDA for gasless play: {} lamports", prize_amount);
        } else {
            // Player used wallet to enter OR new player → Prize goes to main wallet
            
            // Transfer from pot vault to winner wallet using system program
            let transfer_ix = system_instruction::transfer(
                &ctx.accounts.pot_vault.key(),
                &ctx.accounts.winner.key(),
                prize_amount,
            );
            anchor_lang::solana_program::program::invoke_signed(
                &transfer_ix,
                &[
                    ctx.accounts.pot_vault.to_account_info(),
                    ctx.accounts.winner.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[&[b"pot_vault", &[ctx.bumps.pot_vault]]],
            )?;
            
            msg!("Prize sent to main wallet: {} lamports", prize_amount);
        }
        
        // Update winner stats if they have a player account
        if ctx.accounts.winner_player.wallet != Pubkey::default() {
            ctx.accounts.winner_player.victories += 1;
            ctx.accounts.winner_player.total_winnings += prize_amount;
        }
        
        // Update game state
        game_state.last_winner = Some(LastWinner {
            wallet: winner_wallet,
            amount: prize_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        game_state.current_pot = 0;
        
        msg!("Prize claimed: {} lamports to {}! VRF: {}", prize_amount, winner_wallet, vrf_proof);
        Ok(())
    }

    // Deposit SOL into player PDA for gasless gameplay
    pub fn deposit_to_pda(ctx: Context<DepositToPDA>, amount: u64) -> Result<()> {
        // Transfer SOL from player wallet to player PDA
        let transfer_ix = system_instruction::transfer(
            &ctx.accounts.player.key(),
            &ctx.accounts.player_account.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.player.to_account_info(),
                ctx.accounts.player_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        
        // Update PDA balance tracking
        let player_account = &mut ctx.accounts.player_account;
        player_account.balance += amount;
        
        msg!("Deposited {} lamports to PDA. New balance: {}", amount, player_account.balance);
        Ok(())
    }
    
    // Enter combat using PDA balance (gasless after initial deposit)
    pub fn enter_combat_with_pda(ctx: Context<EnterCombatWithPDA>) -> Result<()> {
        // Check PDA has sufficient balance
        require!(ctx.accounts.player_account.balance >= ENTRY_FEE, ErrorCode::InsufficientPDABalance);
        
        // Calculate fee split
        let treasury_fee = ENTRY_FEE * TREASURY_FEE_BPS as u64 / 10000;
        let pool_fee = ENTRY_FEE - treasury_fee;
        
        // Transfer treasury fee from PDA to treasury
        **ctx.accounts.player_account.to_account_info().try_borrow_mut_lamports()? -= treasury_fee;
        **ctx.accounts.treasury.try_borrow_mut_lamports()? += treasury_fee;
        
        // Transfer pool fee from PDA to pot vault
        **ctx.accounts.player_account.to_account_info().try_borrow_mut_lamports()? -= pool_fee;
        **ctx.accounts.pot_vault.try_borrow_mut_lamports()? += pool_fee;
        
        let player_account = &mut ctx.accounts.player_account;
        let game_state = &mut ctx.accounts.game_state;
        
        // Deduct from PDA balance
        player_account.balance -= ENTRY_FEE;
        
        // Update game state
        game_state.current_pot += pool_fee;
        game_state.total_entries += 1;
        
        // Update player stats
        player_account.total_combats += 1;
        player_account.last_combat = Clock::get()?.unix_timestamp;
        player_account.last_payment_method = 1; // PDA payment
        
        msg!("Player entered via PDA! New pot: {} lamports, PDA balance: {}", 
             game_state.current_pot, player_account.balance);
        Ok(())
    }

    // Withdraw SOL from player PDA back to wallet
    pub fn withdraw_from_pda(ctx: Context<WithdrawFromPDA>, amount: u64) -> Result<()> {
        // Check PDA has sufficient balance
        require!(ctx.accounts.player_account.balance >= amount, ErrorCode::InsufficientPDABalance);
        
        // Transfer SOL from PDA to player wallet
        **ctx.accounts.player_account.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.player.try_borrow_mut_lamports()? += amount;
        
        // Update PDA balance tracking
        let player_account = &mut ctx.accounts.player_account;
        player_account.balance -= amount;
        
        msg!("Withdrew {} lamports from PDA. New balance: {}", amount, player_account.balance);
        Ok(())
    }

    // Backend submits combat entry for player (true gasless)
    pub fn enter_combat_for_player(
        ctx: Context<EnterCombatForPlayer>,
        player_wallet: Pubkey,
    ) -> Result<()> {
        // Verify backend signer
        require_keys_eq!(
            ctx.accounts.backend_signer.key(),
            Pubkey::try_from(BACKEND_SIGNER).unwrap(),
            ErrorCode::UnauthorizedBackend
        );
        
        // Check PDA has sufficient balance
        require!(ctx.accounts.player_account.balance >= ENTRY_FEE, ErrorCode::InsufficientPDABalance);
        
        // Calculate fee split
        let treasury_fee = ENTRY_FEE * TREASURY_FEE_BPS as u64 / 10000;
        let pool_fee = ENTRY_FEE - treasury_fee;
        
        // Transfer treasury fee from PDA to treasury
        **ctx.accounts.player_account.to_account_info().try_borrow_mut_lamports()? -= treasury_fee;
        **ctx.accounts.treasury.try_borrow_mut_lamports()? += treasury_fee;
        
        // Transfer pool fee from PDA to pot vault
        **ctx.accounts.player_account.to_account_info().try_borrow_mut_lamports()? -= pool_fee;
        **ctx.accounts.pot_vault.try_borrow_mut_lamports()? += pool_fee;
        
        let player_account = &mut ctx.accounts.player_account;
        let game_state = &mut ctx.accounts.game_state;
        
        // Deduct from PDA balance
        player_account.balance -= ENTRY_FEE;
        
        // Update game state
        game_state.current_pot += pool_fee;
        game_state.total_entries += 1;
        
        // Update player stats
        player_account.total_combats += 1;
        player_account.last_combat = Clock::get()?.unix_timestamp;
        player_account.last_payment_method = 1; // PDA payment
        
        msg!("Player {} entered via PDA (gasless)! New pot: {} lamports, PDA balance: {}", 
             player_wallet, game_state.current_pot, player_account.balance);
        Ok(())
    }

    // Get current game state (view function)
    pub fn get_game_state(ctx: Context<GetGameState>) -> Result<()> {
        let game_state = &ctx.accounts.game_state;
        msg!("Current pot: {} lamports", game_state.current_pot);
        msg!("Total entries: {}", game_state.total_entries);
        if let Some(last_winner) = &game_state.last_winner {
            msg!("Last winner: {} won {} lamports", last_winner.wallet, last_winner.amount);
        }
        Ok(())
    }
}

// Account structures
#[account]
pub struct GameState {
    pub current_pot: u64,
    pub total_entries: u64,
    pub last_winner: Option<LastWinner>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct LastWinner {
    pub wallet: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[account]
pub struct PlayerAccount {
    pub wallet: Pubkey,
    pub balance: u64, // SOL balance stored in PDA for gasless gameplay
    pub total_combats: u64,
    pub victories: u64,
    pub total_winnings: u64,
    pub last_combat: i64,
    pub last_payment_method: u8, // 0 = wallet, 1 = PDA
}

// Context structs - NO MORE CreatePlayerAccount needed!
#[derive(Accounts)]
pub struct EnterCombat<'info> {
    #[account(
        init_if_needed,
        payer = player,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1, // Added balance (8) + payment_method (1)
        seeds = [b"player", player.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    
    #[account(
        init_if_needed,
        payer = player,
        space = 8 + 8 + 8 + 33 + 8 + 8,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(
        mut,
        seeds = [b"pot_vault"],
        bump
    )]
    /// CHECK: This is a PDA that holds SOL
    pub pot_vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        mut,
        constraint = treasury.key() == Pubkey::try_from(TREASURY_WALLET).unwrap()
    )]
    /// CHECK: Treasury wallet receives fees
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimPrizeBackend<'info> {
    #[account(
        mut,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(
        mut,
        seeds = [b"pot_vault"],
        bump
    )]
    /// CHECK: This is a PDA that holds SOL
    pub pot_vault: AccountInfo<'info>,
    
    #[account(
        init_if_needed,
        payer = backend_signer,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1, // Added balance (8) + payment_method (1)
        seeds = [b"player", winner.key().as_ref()],
        bump
    )]
    pub winner_player: Account<'info, PlayerAccount>,
    
    #[account(mut)]
    /// CHECK: Winner wallet to receive prize
    pub winner: AccountInfo<'info>,
    
    #[account(mut)]
    pub backend_signer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositToPDA<'info> {
    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump,
        constraint = player_account.wallet == player.key()
    )]
    pub player_account: Account<'info, PlayerAccount>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EnterCombatWithPDA<'info> {
    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump,
        constraint = player_account.wallet == player.key()
    )]
    pub player_account: Account<'info, PlayerAccount>,
    
    #[account(
        mut,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(
        mut,
        seeds = [b"pot_vault"],
        bump
    )]
    /// CHECK: This is a PDA that holds SOL
    pub pot_vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        mut,
        constraint = treasury.key() == Pubkey::try_from(TREASURY_WALLET).unwrap()
    )]
    /// CHECK: Treasury wallet receives fees
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawFromPDA<'info> {
    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump,
        constraint = player_account.wallet == player.key()
    )]
    pub player_account: Account<'info, PlayerAccount>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(player_wallet: Pubkey)]
pub struct EnterCombatForPlayer<'info> {
    #[account(
        mut,
        seeds = [b"player", player_wallet.as_ref()],
        bump,
        constraint = player_account.wallet == player_wallet
    )]
    pub player_account: Account<'info, PlayerAccount>,
    
    #[account(
        mut,
        seeds = [b"game_state"],
        bump
    )]
    pub game_state: Account<'info, GameState>,
    
    #[account(
        mut,
        seeds = [b"pot_vault"],
        bump
    )]
    /// CHECK: This is a PDA that holds SOL
    pub pot_vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub backend_signer: Signer<'info>,
    
    #[account(
        mut,
        constraint = treasury.key() == Pubkey::try_from(TREASURY_WALLET).unwrap()
    )]
    /// CHECK: Treasury wallet receives fees
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetGameState<'info> {
    pub game_state: Account<'info, GameState>,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized backend signer")]
    UnauthorizedBackend,
    #[msg("Pot is empty")]
    EmptyPot,
    #[msg("Insufficient balance in player PDA")]
    InsufficientPDABalance,
}