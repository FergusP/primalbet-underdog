import { useEffect, useState } from 'react';

interface GameSize {
  width: number;
  height: number;
}

export const useGameResize = () => {
  const [gameSize, setGameSize] = useState<GameSize>({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = (event: CustomEvent) => {
      const { width, height } = event.detail;
      setGameSize({ width, height });
    };

    // Also listen for window resize as backup
    const handleWindowResize = () => {
      setGameSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('gameResize', handleResize as EventListener);
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('gameResize', handleResize as EventListener);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return gameSize;
};