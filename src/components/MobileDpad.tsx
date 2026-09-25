import React from 'react';
import { Direction } from '../hooks/useKeyboardController';

interface MobileDpadProps {
  onMove: (direction: Direction) => void;
  disabled?: boolean;
}

/**
 * Mobile Discrete Tap Controller
 * Strictly enforces: 1 Tap = 1 Move (No swipe, no continuous move on hold)
 */
export const MobileDpad: React.FC<MobileDpadProps> = ({ onMove, disabled = false }) => {
  const handleTap = (dir: Direction, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    onMove(dir);
  };

  const buttonStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    background: '#374151',
    color: 'white',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation',
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        margin: '1.5rem auto 0 auto',
        width: '200px',
      }}
    >
      {/* UP */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => handleTap('UP', e)}
        style={buttonStyle}
      >
        ▲
      </button>

      {/* LEFT / CENTER / RIGHT */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => handleTap('LEFT', e)}
          style={buttonStyle}
        >
          ◀
        </button>
        <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold' }}>DPAD</span>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => handleTap('RIGHT', e)}
          style={buttonStyle}
        >
          ▶
        </button>
      </div>

      {/* DOWN */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => handleTap('DOWN', e)}
        style={buttonStyle}
      >
        ▼
      </button>
    </div>
  );
};
