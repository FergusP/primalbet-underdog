// Vault Scene Implementation Example

import { BaseScene } from './BaseScene';
import { GameService } from '../services/GameService';

export class VaultScene extends BaseScene {
  private vaults: Phaser.GameObjects.Sprite[] = [];
  private selectedVault: number | null = null;
  private isProcessing: boolean = false;

  protected createScene() {
    // Background
    this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      'vault-background'
    );

    // Create three vault doors
    const vaultPositions = [
      { x: this.scale.width * 0.25, y: this.scale.height * 0.5 },
      { x: this.scale.width * 0.5, y: this.scale.height * 0.5 },
      { x: this.scale.width * 0.75, y: this.scale.height * 0.5 },
    ];

    vaultPositions.forEach((pos, index) => {
      const vault = this.add
        .sprite(pos.x, pos.y, 'vault-door')
        .setInteractive({ useHandCursor: true })
        .setScale(0.8);

      // Add hover effects
      vault.on('pointerover', () => {
        if (!this.isProcessing) {
          vault.setTint(0xffff00);
          this.tweens.add({
            targets: vault,
            scale: 0.85,
            duration: 200,
            ease: 'Power2',
          });
        }
      });

      vault.on('pointerout', () => {
        if (!this.isProcessing) {
          vault.clearTint();
          this.tweens.add({
            targets: vault,
            scale: 0.8,
            duration: 200,
            ease: 'Power2',
          });
        }
      });

      // Click handler
      vault.on('pointerdown', () => this.handleVaultClick(index));

      this.vaults.push(vault);
    });

    // Instructions text
    this.add
      .text(
        this.scale.width / 2,
        this.scale.height * 0.2,
        'Choose a vault to crack!',
        {
          fontSize: '32px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5);

    // Emit scene ready event
    window.dispatchEvent(new CustomEvent('vaultSceneReady'));
  }

  private async handleVaultClick(vaultIndex: number) {
    if (this.isProcessing || this.selectedVault !== null) return;

    this.selectedVault = vaultIndex;
    this.isProcessing = true;

    // Disable all vaults
    this.vaults.forEach((vault) => vault.disableInteractive());

    // Visual feedback
    const selectedVault = this.vaults[vaultIndex];
    this.add
      .text(selectedVault.x, selectedVault.y - 100, 'Attempting...', {
        fontSize: '24px',
        color: '#ffff00',
      })
      .setOrigin(0.5);

    // Play vault selection animation
    this.tweens.add({
      targets: selectedVault,
      scale: 0.9,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.attemptVaultCrack(vaultIndex);
      },
    });
  }

  private async attemptVaultCrack(vaultIndex: number) {
    try {
      // Get stored combat data
      const wallet = this.registry.get('walletAddress');
      const combatId = this.registry.get('currentCombatId');
      const monsterType = this.registry.get('defeatedMonster');

      // Call backend API
      const result = await GameService.attemptVaultCrack(
        wallet,
        combatId,
        monsterType
      );

      // Show result
      if (result.success) {
        this.showVaultSuccess(vaultIndex, result.prizeAmount);
      } else {
        this.showVaultFailure(vaultIndex, result.rollResult, result.threshold);
      }

      // Emit result event for React UI
      window.dispatchEvent(
        new CustomEvent('vault-result', {
          detail: {
            vaultIndex,
            success: result.success,
            roll: result.rollResult,
            threshold: result.threshold,
            prizeAmount: result.prizeAmount,
          },
        })
      );
    } catch (error) {
      console.error('Vault crack attempt failed:', error);
      this.showError();
    }
  }

  private showVaultSuccess(vaultIndex: number, prizeAmount: number) {
    const vault = this.vaults[vaultIndex];

    // Open vault animation
    vault.play('vault-open-animation');

    // Show prize
    const prizeInSol = prizeAmount / 1e9;
    const prizeText = this.add
      .text(vault.x, vault.y, `🎉 ${prizeInSol.toFixed(4)} SOL! 🎉`, {
        fontSize: '36px',
        color: '#00ff00',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Particle effects
    const particles = this.add.particles(vault.x, vault.y, 'gold-particle', {
      speed: { min: 200, max: 400 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      quantity: 50,
    });

    // Transition after delay
    this.time.delayedCall(3000, () => {
      this.scene.start('ColosseumScene');
    });
  }

  private showVaultFailure(
    vaultIndex: number,
    roll: number,
    threshold: number
  ) {
    const vault = this.vaults[vaultIndex];

    // Shake vault
    this.cameras.main.shake(300, 0.02);

    // Show failure message
    const failText = this.add
      .text(
        vault.x,
        vault.y - 50,
        `Failed! Roll: ${roll} (needed < ${threshold})`,
        {
          fontSize: '24px',
          color: '#ff0000',
          stroke: '#000000',
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5);

    // Red flash on vault
    vault.setTint(0xff0000);
    this.time.delayedCall(300, () => vault.clearTint());

    // Return to colosseum after delay
    this.time.delayedCall(2500, () => {
      this.scene.start('ColosseumScene');
    });
  }

  private showError() {
    this.add
      .text(
        this.scale.width / 2,
        this.scale.height * 0.7,
        'Error occurred. Please try again.',
        {
          fontSize: '24px',
          color: '#ff0000',
        }
      )
      .setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start('ColosseumScene');
    });
  }
}

// React UI Integration for Vault Scene
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface VaultResult {
  vaultIndex: number;
  success: boolean;
  roll: number;
  threshold: number;
  prizeAmount?: number;
}

export const VaultSceneUI: React.FC = () => {
  const [result, setResult] = useState<VaultResult | null>(null);
  const [monsterInfo, setMonsterInfo] = useState<any>(null);
  const { publicKey } = useWallet();

  useEffect(() => {
    // Get monster info from Phaser registry
    const handleSceneReady = () => {
      const game = (window as any).game;
      if (game) {
        const monster = game.registry.get('defeatedMonster');
        const monsterData = game.registry.get('monsterData');
        setMonsterInfo({
          name: monster,
          crackChance: monsterData?.vaultCrackChance || 0,
        });
      }
    };

    // Listen for vault result
    const handleVaultResult = (event: CustomEvent) => {
      setResult(event.detail);
    };

    window.addEventListener('vaultSceneReady', handleSceneReady);
    window.addEventListener('vault-result', handleVaultResult as EventListener);

    return () => {
      window.removeEventListener('vaultSceneReady', handleSceneReady);
      window.removeEventListener(
        'vault-result',
        handleVaultResult as EventListener
      );
    };
  }, []);

  return (
    <div className="vault-scene-ui">
      {/* Monster Info */}
      {monsterInfo && (
        <div className="monster-info-panel">
          <h3>Defeated: {monsterInfo.name}</h3>
          <p>Vault Crack Chance: {monsterInfo.crackChance}%</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div
          className={`vault-result ${result.success ? 'success' : 'failure'}`}
        >
          {result.success ? (
            <>
              <h2>🎉 Vault Cracked! 🎉</h2>
              <p className="prize-amount">
                Won: {(result.prizeAmount! / 1e9).toFixed(4)} SOL
              </p>
            </>
          ) : (
            <>
              <h2>Vault Resisted</h2>
              <p>Your roll: {result.roll}</p>
              <p>Needed: Less than {result.threshold}</p>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      {!result && (
        <div className="vault-instructions">
          <p>Click any vault to attempt cracking!</p>
          <p>All vaults have the same {monsterInfo?.crackChance}% chance</p>
        </div>
      )}
    </div>
  );
};