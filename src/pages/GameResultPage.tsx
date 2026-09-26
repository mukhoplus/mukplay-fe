import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface PlayerResultItem {
  userId: number;
  nickname: string;
  rank: number;
  correctCount: number;
  wrongCount: number;
  survivedRounds: number;
  earnedExp: number;
  currentLevel: number;
  currentExp: number;
  nextLevelExp: number;
  expProgressPercent: number;
  isWinner: boolean;
}

interface GameResultData {
  roomId: string;
  participantCount: number;
  myResult: PlayerResultItem;
  rankings: PlayerResultItem[];
}

export const GameResultPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [loading, setLoading] = useState<boolean>(true);
  const [resultData, setResultData] = useState<GameResultData | null>(null);
  const [expProgress, setExpProgress] = useState<number>(0);

  useEffect(() => {
    if (!gameId) return;

    fetch(`/api/rooms/${gameId}/result`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          const data: GameResultData = resData.data;
          setResultData(data);

          if (data.myResult) {
            updateUser({
              level: data.myResult.currentLevel,
              exp: data.myResult.currentExp,
            });

            setTimeout(() => {
              setExpProgress(data.myResult.expProgressPercent);
            }, 300);
          }
        }
      })
      .catch((err) => {
        console.error('게임 결과 조회 실패', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [gameId, token, updateUser]);

  // Fallback if not loaded yet
  const myResult: PlayerResultItem = resultData?.myResult ?? {
    userId: user?.id ?? 1,
    nickname: user?.nickname ?? '나',
    rank: 1,
    correctCount: 0,
    wrongCount: 0,
    survivedRounds: 0,
    earnedExp: 0,
    currentLevel: user?.level ?? 1,
    currentExp: user?.exp ?? 0,
    nextLevelExp: (user?.level ?? 1) * 100,
    expProgressPercent: user?.exp ? user.exp % 100 : 0,
    isWinner: false,
  };

  const rankings: PlayerResultItem[] = resultData?.rankings && resultData.rankings.length > 0
    ? resultData.rankings
    : [myResult];

  const remainingExpForNextLevel = 100 - (myResult.currentExp % 100);

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '680px', margin: '0 auto', color: '#1f2937' }}>
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
          {myResult.rank === 1 ? '🏆' : myResult.rank === 2 ? '🥈' : myResult.rank === 3 ? '🥉' : '🎖️'}
        </span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#0f172a' }}>
          게임 결과 정산
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          방 번호: {gameId} {loading && '(결과 집계 중...)'}
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
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.25rem' }}>
            {myResult.rank === 1 ? '👑 1위 우승!' : `내 최종 결과: ${myResult.rank}위`}
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e40af', marginBottom: '1rem' }}>
            +{myResult.earnedExp} EXP
          </div>

          {/* Player Answer & Survival Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '0.75rem 0.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>맞춘 문제</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
                ⭕ {myResult.correctCount}개
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '0.75rem 0.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>틀린 문제</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>
                ❌ {myResult.wrongCount}개
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '0.75rem 0.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>생존 라운드</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                🚩 {myResult.survivedRounds}R
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div style={{ textAlign: 'left', background: 'rgba(255, 255, 255, 0.6)', padding: '1rem', borderRadius: '8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '0.35rem',
              }}
            >
              <span>현재 Lv. {myResult.currentLevel} ({user?.nickname ?? myResult.nickname})</span>
              <span>다음 Lv. {myResult.currentLevel + 1}</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '12px',
                background: '#cbd5e1',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${expProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#64748b',
                marginTop: '0.35rem',
              }}
            >
              <span>보유 EXP: {myResult.currentExp}</span>
              <span>다음 레벨까지 <strong>{remainingExpForNextLevel} EXP</strong> 남음</span>
            </div>
          </div>
        </div>

        {/* Full Player Ranking List */}
        <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
            참가자 전체 순위 및 성적
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rankings.map((res) => {
              const isMe = res.userId === user?.id;
              return (
                <div
                  key={res.userId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: isMe ? '#f0fdf4' : '#f8fafc',
                    border: isMe ? '2px solid #22c55e' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        fontWeight: 800,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: res.rank === 1 ? '#fef08a' : res.rank === 2 ? '#e2e8f0' : res.rank === 3 ? '#fed7aa' : '#f1f5f9',
                        color: '#0f172a',
                        fontSize: '0.85rem',
                      }}
                    >
                      {res.rank}
                    </span>
                    <div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>
                        {res.nickname} {isMe && '(나)'}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        Lv.{res.currentLevel} • ⭕ {res.correctCount} / ❌ {res.wrongCount}
                      </div>
                    </div>
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
              );
            })}
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

