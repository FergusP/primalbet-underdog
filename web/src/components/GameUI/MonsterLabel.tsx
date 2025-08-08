import React from 'react';

interface Props {
  name: string;
  position: { x: number; y: number };
}

export const MonsterLabel: React.FC<Props> = ({ name, position }) => {
  // Position the label below the platform
  const style = {
    left: '80%', // Same horizontal position as monster
    top: '38%', // Below the platform in mist area
    transform: 'translateX(-50%)',
    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)'
  };

  return (
    <div 
      className="absolute pointer-events-none text-white font-bold text-2xl"
      style={style}
    >
      {name}
    </div>
  );
};