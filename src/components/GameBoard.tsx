import React, { useEffect, useRef } from 'react';
import { PlayerPosition } from '../stores/stompStore';

interface GameBoardProps {
  positions: PlayerPosition[];
  currentUserId?: number;
}

/**
 * High-performance RAF Position Renderer:
 * Uses requestAnimationFrame and direct DOM transform `translate3d(calc(...))`
 * to bypass heavy React virtual DOM reconciliation during high-frequency position ticks.
 */
export const GameBoard: React.FC<GameBoardProps> = ({ positions, currentUserId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerNodesRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const positionsRef = useRef<PlayerPosition[]>(positions);

  positionsRef.current = positions;

  useEffect(() => {
    let animFrameId: number;

    const renderTick = () => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        positionsRef.current.forEach((p) => {
          const node = playerNodesRef.current.get(p.userId);
          if (node) {
            // Convert normalized coordinates (0~100) to pixel offset
            const px = (p.x / 100) * width;
            const py = (p.y / 100) * height;

            // Hardware-accelerated GPU translate3d without React state re-rendering
            node.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
            node.style.opacity = p.alive ? '1' : '0.3';
          }
        });
      }
      animFrameId = requestAnimationFrame(renderTick);
    };

    animFrameId = requestAnimationFrame(renderTick);
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        aspectRatio: '1 / 1',
        margin: '0 auto',
        border: '3px solid #1f2937',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#f9fafb',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      }}
    >
      {/* O Zone (Left 0% ~ 45%) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '45%',
          height: '100%',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '2px dashed #f87171',
        }}
      >
        <span style={{ fontSize: '6rem', fontWeight: 900, color: 'rgba(239, 68, 68, 0.4)' }}>
          O
        </span>
      </div>

      {/* Neutral Center Zone (45% ~ 55%) */}
      <div
        style={{
          position: 'absolute',
          left: '45%',
          top: 0,
          width: '10%',
          height: '100%',
          background: 'rgba(156, 163, 175, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
      >
        <span>중</span>
        <span>립</span>
        <span>구</span>
        <span>역</span>
      </div>

      {/* X Zone (Right 55% ~ 100%) */}
      <div
        style={{
          position: 'absolute',
          left: '55%',
          top: 0,
          width: '45%',
          height: '100%',
          background: 'rgba(59, 130, 246, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderLeft: '2px dashed #60a5fa',
        }}
      >
        <span style={{ fontSize: '6rem', fontWeight: 900, color: 'rgba(59, 130, 246, 0.4)' }}>
          X
        </span>
      </div>

      {/* Player Avatars Rendered and Smoothly Updated via RAF */}
      {positions.map((p) => {
        const isMe = p.userId === currentUserId;
        return (
          <div
            key={p.userId}
            ref={(el) => {
              if (el) {
                playerNodesRef.current.set(p.userId, el);
              } else {
                playerNodesRef.current.delete(p.userId);
              }
            }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `translate3d(${p.x}%, ${p.y}%, 0) translate(-50%, -50%)`,
              willChange: 'transform',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: isMe ? 20 : 10,
              opacity: p.alive ? 1 : 0.3,
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: isMe ? '#fbbf24' : '#6366f1',
                border: isMe ? '3px solid #b45309' : '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              {p.alive ? (isMe ? '나' : `P${p.userId}`) : '💀'}
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: isMe ? 'bold' : 'normal',
                color: '#1f2937',
                marginTop: '2px',
                background: 'rgba(255,255,255,0.8)',
                padding: '1px 4px',
                borderRadius: '4px',
              }}
            >
              {isMe ? '나' : `플레이어 ${p.userId}`}
            </span>
          </div>
        );
      })}
    </div>
  );
};
