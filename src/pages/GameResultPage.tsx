import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ResultItem {
  userId: number;
  nickname: string;
  rank: number;
  earnedExp: number;
  survivedRounds: number;
}

export const GameResultPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [results] = useState<ResultItem[]>([
    {
      userId: user?.id ?? 1,
      nickname: user?.nickname ?? '나',
      rank: 1,
      earnedExp: 150,
      survivedRounds: 5,
    },
    {
      userId: 2,
      nickname: '브레인마스터',
      rank: 2,
      earnedExp: 80,
      survivedRounds: 4,
    },
    {
      userId: 3,
      nickname: '초보탈출',
      rank: 3,
      earnedExp: 30,
      survivedRounds: 2,
    },
  ]);

  const [expProgress, setExpProgress] = useState(0);

  useEffect(() => {
    // Animate EXP progress bar on mount
    const timer = setTimeout(() => {
      setExpProgress(75);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const myResult = results.find((r) => r.userId === user?.id) || results[0];

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '640px', margin: '0 auto', color: '#1f2937' }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.5rem' }}>
          {myResult.rank === 1 ? '🏆' : myResult.rank === 2 ? '🥈' : '🥉'}
        </span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
          게임 결과 정산
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          게임 세션 ID: {gameId || '세션 완료'}
        </p>

        {/* My Highlight Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '0.5rem' }}>
            내 최종 결과: {myResult.rank}위
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.5rem' }}>
            +{myResult.earnedExp} EXP
          </div>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
            생존 라운드: {myResult.survivedRounds} 라운드 돌파
          </p>

          {/* Level Progress Bar */}
          <div style={{ textAlign: 'left', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              <span>Lv. {user?.level ?? 1}</span>
              <span>Lv. {(user?.level ?? 1) + 1}</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '10px',
                background: '#cbd5e1',
                borderRadius: '5px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${expProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '5px',
                }}
              />
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              다음 레벨까지 25 EXP 남음
            </div>
          </div>
        </div>

        {/* Full Player Ranking List */}
        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
            참가자 전체 순위
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {results.map((res) => (
              <div
                key={res.userId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: res.userId === user?.id ? '#f1f5f9' : '#f8fafc',
                  border: res.userId === user?.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, width: '24px', textAlign: 'center', color: '#64748b' }}>
                    {res.rank}
                  </span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    {res.nickname} {res.userId === user?.id && '(나)'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {res.survivedRounds}R 생존
                  </span>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>
                    +{res.earnedExp} EXP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/lobby')}
            style={{
              flex: 1,
              padding: '0.875rem 1.5rem',
              cursor: 'pointer',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
            }}
          >
            로비로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
