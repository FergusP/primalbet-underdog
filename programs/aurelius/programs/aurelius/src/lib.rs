use anchor_lang::prelude::*;

declare_id!("J18DRpsrSncmgAqbjVXdfF5qUdBpXJZZYPqRWY3pyV8z");

#[program]
pub mod aurelius {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
