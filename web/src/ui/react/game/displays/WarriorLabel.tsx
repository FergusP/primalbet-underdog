import React from 'react';

interface Props {
  position: { x: number; y: number };
}

export const WarriorLabel: React.FC<Props> = ({ position }) => {
  // Position the label below the warrior formation
  const style = {
    left: `${position.x}px`,
    top: `${position.y + 60}px`, // Offset below warriors
    transform: 'translateX(-50%)',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
  };

  return (
    <div 
      className="absolute pointer-events-none text-gray-400 italic text-base"
      style={style}
    >
      forest warriors
    </div>
  );
};