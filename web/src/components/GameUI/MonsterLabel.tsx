import React from 'react';

interface Props {
  name: string;
  position: { x: number; y: number };
}

export const MonsterLabel: React.FC<Props> = ({ name, position }) => {
  // Position the label above the monster sprite
  const style = {
    left: `${position.x}px`,
    top: `${position.y - 120}px`, // Offset above monster
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