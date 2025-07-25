import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  SystemProgram,
  AccountMeta,
} from '@solana/web3.js';
import crypto from 'crypto';

// Instruction discriminators (8-byte hashes of instruction names)
const INSTRUCTION_DISCRIMINATORS = {
  create_player_account: Buffer.from(crypto.createHash('sha256').update('global:create_player_account').digest()).subarray(0, 8),
  enter_combat: Buffer.from(crypto.createHash('sha256').update('global:enter_combat').digest()).subarray(0, 8),
  deposit_to_pda: Buffer.from(crypto.createHash('sha256').update('global:deposit_to_pda').digest()).subarray(0, 8),
  enter_combat_with_pda: Buffer.from(crypto.createHash('sha256').update('global:enter_combat_with_pda').digest()).subarray(0, 8),
  claim_prize_backend: Buffer.from(crypto.createHash('sha256').update('global:claim_prize_backend').digest()).subarray(0, 8),
  get_game_state: Buffer.from(crypto.createHash('sha256').update('global:get_game_state').digest()).subarray(0, 8),
};

class SolanaService {
  private connection: Connection;
  private backendKeypair: Keypair;
  private programId: PublicKey;
  private gameStatePDA: PublicKey;
  private potVaultPDA: PublicKey;

  constructor() {
    // Initialize connection
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Load backend keypair
    const privateKey = JSON.parse(process.env.BACKEND_WALLET_PRIVATE_KEY || '[]');
    console.log('Private key length:', privateKey.length);
    
    if (privateKey.length !== 64) {
      throw new Error(`Invalid private key length: ${privateKey.length}, expected 64`);
    }
    
    this.backendKeypair = Keypair.fromSecretKey(Uint8Array.from(privateKey));

    // Program ID
    this.programId = new PublicKey(process.env.PROGRAM_ID!);

    // Derive PDAs
    const [gameStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('game_state')],
      this.programId
    );
    this.gameStatePDA = gameStatePDA;

    const [potVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('pot_vault')],
      this.programId
    );
    this.potVaultPDA = potVaultPDA;
  }

  async getCurrentPot(): Promise<number> {
    try {
      const accountInfo = await this.connection.getAccountInfo(this.gameStatePDA);
      if (!accountInfo) {
        console.log('Game state not initialized yet');
        return 0;
      }

      // Parse account data manually
      // Skip 8-byte discriminator
      const data = accountInfo.data.subarray(8);
      
      // Read current_pot (u64 - 8 bytes)
      const currentPot = data.readBigUInt64LE(0);
      
      return Number(currentPot);
    } catch (error) {
      console.error('Error fetching game state:', error);
      return 0;
    }
  }

  async getGameState() {
    try {
      const accountInfo = await this.connection.getAccountInfo(this.gameStatePDA);
      if (!accountInfo) {
        console.log('Game state not initialized yet');
        return {
          currentPot: 0,
          totalEntries: 0,
          lastWinner: null
        };
      }

      // Parse account data manually
      // Skip 8-byte discriminator
      const data = accountInfo.data.subarray(8);
      
      // Read fields:
      // current_pot: u64 (8 bytes)
      // total_entries: u64 (8 bytes)
      // last_winner: Option<LastWinner> (1 byte + optional data)
      
      const currentPot = data.readBigUInt64LE(0);
      const totalEntries = data.readBigUInt64LE(8);
      
      // Check if last_winner exists (Option discriminator)
      const hasLastWinner = data[16] === 1;
      let lastWinner = null;
      
      if (hasLastWinner) {
        // LastWinner struct:
        // wallet: Pubkey (32 bytes)
        // amount: u64 (8 bytes)
        // timestamp: i64 (8 bytes)
        const wallet = new PublicKey(data.subarray(17, 49));
        const amount = data.readBigUInt64LE(49);
        const timestamp = data.readBigInt64LE(57);
        
        lastWinner = {
          wallet: wallet.toString(),
          amount: Number(amount),
          timestamp: Number(timestamp)
        };
      }

      return {
        currentPot: Number(currentPot),
        totalEntries: Number(totalEntries),
        lastWinner
      };
    } catch (error) {
      console.error('Error fetching game state:', error);
      return {
        currentPot: 0,
        totalEntries: 0,
        lastWinner: null
      };
    }
  }

  async claimPrizeForWinner(winnerWallet: string, vrfProof: string): Promise<string> {
    try {
      const winner = new PublicKey(winnerWallet);
      
      // Derive winner's player PDA
      const [winnerPlayerPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('player'), winner.toBuffer()],
        this.programId
      );

      // Build instruction data manually
      // Format: [discriminator(8)] + [winner_pubkey(32)] + [vrf_proof_string_length(4)] + [vrf_proof_bytes]
      const vrfProofBytes = Buffer.from(vrfProof, 'utf8');
      const instructionData = Buffer.concat([
        INSTRUCTION_DISCRIMINATORS.claim_prize_backend,
        winner.toBuffer(),
        Buffer.from(new Uint32Array([vrfProofBytes.length]).buffer),
        vrfProofBytes
      ]);

      // Build instruction with all required accounts
      const instruction = new TransactionInstruction({
        programId: this.programId,
        keys: [
          { pubkey: this.gameStatePDA, isSigner: false, isWritable: true },
          { pubkey: this.potVaultPDA, isSigner: false, isWritable: true },
          { pubkey: winnerPlayerPDA, isSigner: false, isWritable: true },
          { pubkey: winner, isSigner: false, isWritable: true },
          { pubkey: this.backendKeypair.publicKey, isSigner: true, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: instructionData
      });

      // Create and send transaction
      const transaction = new Transaction().add(instruction);
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.backendKeypair],
        { commitment: 'confirmed' }
      );

      console.log('Prize claimed successfully. Transaction:', signature);
      return signature;
    } catch (error) {
      console.error('Error claiming prize:', error);
      throw error;
    }
  }

  async getPlayerAccount(wallet: string) {
    try {
      const playerPubkey = new PublicKey(wallet);
      const [playerPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('player'), playerPubkey.toBuffer()],
        this.programId
      );

      const accountInfo = await this.connection.getAccountInfo(playerPDA);
      if (!accountInfo) {
        console.log('Player account not found');
        return null;
      }

      // Parse player account data manually
      // Skip 8-byte discriminator
      const data = accountInfo.data.subarray(8);
      
      // Updated fields for hybrid payment system:
      // wallet: Pubkey (32 bytes)
      // balance: u64 (8 bytes) - NEW: PDA balance for gasless gameplay
      // total_combats: u64 (8 bytes)
      // victories: u64 (8 bytes)
      // total_winnings: u64 (8 bytes)
      // last_combat: i64 (8 bytes)
      // last_payment_method: u8 (1 byte) - NEW: 0=wallet, 1=PDA
      
      const walletPubkey = new PublicKey(data.subarray(0, 32));
      const balance = data.readBigUInt64LE(32);
      const totalCombats = data.readBigUInt64LE(40);
      const victories = data.readBigUInt64LE(48);
      const totalWinnings = data.readBigUInt64LE(56);
      const lastCombat = data.readBigInt64LE(64);
      const lastPaymentMethod = data.length >= 73 ? data[72] : 0; // Default to wallet if missing

      return {
        wallet: walletPubkey.toString(),
        balance: Number(balance),
        totalCombats: Number(totalCombats),
        victories: Number(victories),
        totalWinnings: Number(totalWinnings),
        lastCombat: Number(lastCombat),
        lastPaymentMethod: lastPaymentMethod, // 0 = wallet, 1 = PDA
        paymentMethodName: lastPaymentMethod === 0 ? 'wallet' : 'PDA'
      };
    } catch (error) {
      console.error('Error fetching player account:', error);
      return null;
    }
  }

  async ensureBackendBalance() {
    const balance = await this.connection.getBalance(this.backendKeypair.publicKey);
    const minBalance = 0.01 * LAMPORTS_PER_SOL;
    
    if (balance < minBalance) {
      console.warn(`Backend wallet low on SOL! Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
      console.warn(`Backend wallet address: ${this.backendKeypair.publicKey.toString()}`);
    }
    
    return balance;
  }

  // New method: Deposit SOL to player PDA for gasless gameplay
  async depositToPDA(playerWallet: string, amount: number): Promise<string> {
    try {
      const player = new PublicKey(playerWallet);
      
      // Derive player PDA
      const [playerPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('player'), player.toBuffer()],
        this.programId
      );

      // Build instruction data: [discriminator(8)] + [amount(8)]
      const amountBuffer = Buffer.alloc(8);
      amountBuffer.writeBigUInt64LE(BigInt(amount), 0);
      
      const instructionData = Buffer.concat([
        INSTRUCTION_DISCRIMINATORS.deposit_to_pda,
        amountBuffer
      ]);

      // Note: This would create a deposit instruction for frontend use
      // The instruction would require the player's signature, not backend
      return "deposit_instruction_helper_ready";
    } catch (error) {
      console.error('Error creating deposit instruction:', error);
      throw error;
    }
  }

  // New method: Get payment options for a player
  async getPaymentOptions(playerWallet: string) {
    try {
      const player = await this.getPlayerAccount(playerWallet);
      const walletBalance = await this.connection.getBalance(new PublicKey(playerWallet));
      
      const entryFee = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL
      
      return {
        canPayFromWallet: walletBalance >= entryFee,
        canPayFromPDA: player ? player.balance >= entryFee : false,
        walletBalance: walletBalance,
        pdaBalance: player ? player.balance : 0,
        lastPaymentMethod: player ? player.paymentMethodName : 'wallet',
        recommendedMethod: player && player.balance >= entryFee ? 'PDA (gasless)' : 'wallet'
      };
    } catch (error) {
      console.error('Error getting payment options:', error);
      return {
        canPayFromWallet: false,
        canPayFromPDA: false,
        walletBalance: 0,
        pdaBalance: 0,
        lastPaymentMethod: 'wallet',
        recommendedMethod: 'wallet'
      };
    }
  }

  // Backend submits combat entry for player (true gasless)
  async enterCombatGasless(playerWallet: string): Promise<string> {
    const playerPubkey = new PublicKey(playerWallet);
    
    // Derive PDAs
    const [playerPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('player'), playerPubkey.toBuffer()],
      this.programId
    );
    
    const [gameStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('game_state')],
      this.programId
    );
    
    const [potVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('pot_vault')],
      this.programId
    );
    
    const treasury = new PublicKey(process.env.TREASURY_WALLET!);
    
    // Discriminator for enter_combat_for_player
    const discriminator = Buffer.from([186, 129, 109, 164, 53, 167, 230, 172]);
    
    // Player wallet as argument (32 bytes)
    const data = Buffer.concat([
      discriminator,
      playerPubkey.toBuffer()
    ]);
    
    const instruction = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: playerPDA, isSigner: false, isWritable: true },
        { pubkey: gameStatePDA, isSigner: false, isWritable: true },
        { pubkey: potVaultPDA, isSigner: false, isWritable: true },
        { pubkey: this.backendKeypair.publicKey, isSigner: true, isWritable: true }, // Backend signer
        { pubkey: treasury, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });
    
    const transaction = new Transaction().add(instruction);
    
    const signature = await this.connection.sendTransaction(transaction, [this.backendKeypair]);
    await this.connection.confirmTransaction(signature);
    
    console.log('✅ Gasless combat entry successful:', signature);
    return signature;
  }

  subscribeToProgram(callback: (logs: string[]) => void) {
    const programId = new PublicKey(process.env.PROGRAM_ID!);
    
    this.connection.onLogs(
      programId,
      (logs) => {
        console.log('🎮 Real-time Program Activity:', {
          signature: logs.signature,
          logs: logs.logs,
          timestamp: new Date().toISOString()
        });
        callback(logs.logs);
      },
      'confirmed'
    );
    
    console.log('📡 Subscribed to real-time program logs for:', programId.toString());
  }
}

// Export the class, create instance where needed
export { SolanaService };