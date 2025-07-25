import React from 'react';

interface Stats {
  combats: number;
  victories: number;
  vaultsCracked: number;
  totalWinnings: number;
}

interface Props {
  stats: Stats;
}

export const StatsPanel: React.FC<Props> = ({ stats }) => {
  return (
    <div className="w-64 border border-gray-600 rounded-lg p-4 bg-black bg-opacity-30">
      <h3 className="text-gray-400 text-center mb-3">your stats</h3>
      <div className="space-y-2 text-white text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Combats:</span>
          <span>{stats.combats || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Victories:</span>
          <span>{stats.victories || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Vaults Cracked:</span>
          <span>{stats.vaultsCracked || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Winnings:</span>
          <span>{stats.totalWinnings ? `${(stats.totalWinnings / 1e9).toFixed(3)} SOL` : '- SOL'}</span>
        </div>
      </div>
    </div>
  );
};