import { useEffect, useRef } from 'react';
import { MoveDirection } from '../stores/stompStore';

export type Direction = MoveDirection;

interface UseKeyboardControllerProps {
  onMove: (direction: MoveDirection) => void;
  enabled?: boolean;
}

export const useKeyboardController = ({ onMove, enabled = true }: UseKeyboardControllerProps) => {
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  useEffect(() => {
    if (!enabled) return;

    const pressedKeys = new Set<string>();

    const calculateDirection = (): MoveDirection | null => {
      const up = pressedKeys.has('ArrowUp') || pressedKeys.has('w') || pressedKeys.has('W');
      const down = pressedKeys.has('ArrowDown') || pressedKeys.has('s') || pressedKeys.has('S');
      const left = pressedKeys.has('ArrowLeft') || pressedKeys.has('a') || pressedKeys.has('A');
      const right = pressedKeys.has('ArrowRight') || pressedKeys.has('d') || pressedKeys.has('D');

      // 대각선 4방향 판정
      if (up && left) return 'UP_LEFT';
      if (up && right) return 'UP_RIGHT';
      if (down && left) return 'DOWN_LEFT';
      if (down && right) return 'DOWN_RIGHT';

      // 상하좌우 4방향 판정
      if (up) return 'UP';
      if (down) return 'DOWN';
      if (left) return 'LEFT';
      if (right) return 'RIGHT';

      return null;
    };

    // 60ms마다 눌린 키를 계산해 전송 (초당 약 16회 -> 백엔드 초당 20회 제한을 초과하지 않고 씹힘 없는 부드러운 이동)
    const intervalId = setInterval(() => {
      if (pressedKeys.size > 0) {
        const dir = calculateDirection();
        if (dir) {
          onMoveRef.current(dir);
        }
      }
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const isControlKey =
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'].includes(key);

      if (isControlKey) {
        e.preventDefault();
        const wasEmpty = pressedKeys.size === 0;
        pressedKeys.add(key);

        // 첫 키 입력 즉시 1회 반응
        if (wasEmpty) {
          const dir = calculateDirection();
          if (dir) {
            onMoveRef.current(dir);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key);
    };

    const handleBlur = () => {
      pressedKeys.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled]);
};
