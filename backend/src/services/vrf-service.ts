import axios from 'axios';

export class VRFService {
  private contractAddress: string;
  private baseUrl: string;
  private backendWallet: string;

  constructor() {
    this.contractAddress = '0x7CoBpP-YQJBYKf8M'; // Simple VRF ProofNetwork contract
    this.baseUrl = 'https://proofnetwork.lol/api/blockchain/contracts';
    this.backendWallet = process.env.BACKEND_WALLET_ADDRESS || '2pde6PGeMLbXhFkLWzEhpSGFqkhU9eica8RjbrEkwvb5';
  }

  async rollVaultCrack(crackChance: number, playerWallet: string, combatId: string): Promise<{
    roll: number;
    success: boolean;
    proof: any;
  }> {
    try {
      // Use simple getRandomNumber for VRF
      const response = await axios.post(
        `${this.baseUrl}/call`,
        {
          from: this.backendWallet,
          contractAddress: this.contractAddress,
          functionName: 'getRandomNumber',
          inputs: {
            min: 0,
            max: 99
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Contract call failed');
      }

      // Extract the random number from outputs
      const outputs = response.data.transaction?.outputs;
      const roll = outputs?.result;
      
      if (roll === undefined || roll === null) {
        throw new Error('Failed to get random number from contract');
      }

      const success = roll < crackChance;
      console.log(`VRF Roll: ${roll}, Crack Chance: ${crackChance}%, Success: ${success}`);

      return {
        roll,
        success,
        proof: outputs?.proof || {
          txHash: response.data.transaction?.hash,
          timestamp: response.data.transaction?.timestamp,
          vrfSeed: response.data.transaction?.vrfSeed,
          contractAddress: this.contractAddress,
          playerWallet,
          combatId
        }
      };
    } catch (error: any) {
      console.error('ProofNetwork Contract Error:', error.response?.data || error.message);
      throw new Error('Failed to generate random number for vault crack');
    }
  }

  async selectRandomNumber(min: number, max: number): Promise<number> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/call`,
        {
          from: this.backendWallet,
          contractAddress: this.contractAddress,
          functionName: 'getRandomNumber',
          inputs: {
            min,
            max
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Contract call failed');
      }

      // Extract from transaction outputs
      const result = response.data.transaction?.outputs?.result;
      if (result === undefined || result === null) {
        throw new Error('Failed to get random number from contract');
      }

      return result;
    } catch (error: any) {
      console.error('ProofNetwork Contract Error:', error.response?.data || error.message);
      throw new Error('Failed to generate random number');
    }
  }
}

// Singleton instance
export const vrfService = new VRFService();