import { useEffect } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface UseKeyboardControllerProps {
  onMove: (direction: Direction) => void;
  enabled?: boolean;
}

export const useKeyboardController = ({ onMove, enabled = true }: UseKeyboardControllerProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling on arrow keys
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onMove('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onMove('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onMove('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onMove('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onMove, enabled]);
};
