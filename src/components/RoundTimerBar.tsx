import React, { useEffect, useState } from 'react';

interface RoundTimerBarProps {
  endsAt: string | null;
  totalDurationMs?: number;
}

/**
 * Server-authoritative Round Timer Bar
 * Calculates exact remaining milliseconds using Date.now() against server endsAt timestamp.
 */
export const RoundTimerBar: React.FC<RoundTimerBarProps> = ({
  endsAt,
  totalDurationMs = 10000,
}) => {
  const [remainingMs, setRemainingMs] = useState<number>(totalDurationMs);

  useEffect(() => {
    if (!endsAt) {
      setRemainingMs(totalDurationMs);
      return;
    }

    const targetTime = new Date(endsAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);
      setRemainingMs(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 50);

    return () => clearInterval(interval);
  }, [endsAt, totalDurationMs]);

  const percentage = Math.max(0, Math.min(100, (remainingMs / totalDurationMs) * 100));
  const remainingSeconds = (remainingMs / 1000).toFixed(1);
  const isUrgent = remainingMs <= 3000;

  return (
    <div style={{ width: '100%', margin: '0.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', color: '#4b5563' }}>
        <span>남은 시간</span>
        <strong style={{ color: isUrgent ? '#ef4444' : '#1f2937' }}>{remainingSeconds}초</strong>
      </div>
      <div
        style={{
          width: '100%',
          height: '10px',
          background: '#e5e7eb',
          borderRadius: '5px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: isUrgent ? '#ef4444' : '#3b82f6',
            transition: 'width 0.05s linear, background 0.3s ease',
            borderRadius: '5px',
          }}
        />
      </div>
    </div>
  );
};
