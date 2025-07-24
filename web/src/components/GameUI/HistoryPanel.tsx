import React from 'react';

interface Combat {
  gladiator: string;
  monster: string;
  victory: boolean;
  vaultCracked?: boolean;
  vaultAttempted?: boolean;
}

interface Props {
  combats: Combat[];
}

export const HistoryPanel: React.FC<Props> = ({ combats }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getCombatMessage = (combat: Combat) => {
    const shortAddress = formatAddress(combat.gladiator);
    
    if (combat.vaultCracked) {
      return { text: `🏆 ${shortAddress} CRACKED THE VAULT!`, color: 'text-yellow-400' };
    } else if (combat.victory && combat.vaultAttempted) {
      return { text: `💪 ${shortAddress} defeated ${combat.monster}, vault failed`, color: 'text-green-400' };
    } else if (combat.victory) {
      return { text: `⚔️ ${shortAddress} defeated ${combat.monster}`, color: 'text-green-400' };
    } else {
      return { text: `💀 ${shortAddress} died to ${combat.monster}`, color: 'text-red-400' };
    }
  };

  return (
    <div className="w-64 h-80 border border-gray-600 rounded-lg p-4 bg-black bg-opacity-30">
      <h3 className="text-gray-400 text-center mb-3">history</h3>
      <div className="space-y-2 overflow-y-auto h-64 custom-scrollbar">
        {combats.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">No battles yet...</p>
        ) : (
          combats.slice(0, 10).map((combat, index) => {
            const { text, color } = getCombatMessage(combat);
            return (
              <p key={index} className={`text-xs ${color} break-words`}>
                {text}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
};