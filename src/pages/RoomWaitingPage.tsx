import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export interface Participant {
  userId: number;
  nickname: string;
  isHost: boolean;
  level: number;
}

export const RoomWaitingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [participants] = useState<Participant[]>([
    {
      userId: user?.id ?? 1,
      nickname: user?.nickname ?? '나 (호스트)',
      isHost: true,
      level: user?.level ?? 1,
    },
    {
      userId: 2,
      nickname: '게임친구A',
      isHost: false,
      level: 3,
    },
    {
      userId: 3,
      nickname: '퀴즈고수B',
      isHost: false,
      level: 5,
    },
  ]);

  const isCurrentUserHost = participants.find((p) => p.userId === (user?.id ?? 1))?.isHost ?? true;

  const handleStartGame = () => {
    if (participants.length < 2) {
      alert('게임을 시작하려면 최소 2명 이상의 참가자가 필요합니다.');
      return;
    }
    navigate(`/game/${roomId}`);
  };

  const handleLeaveRoom = () => {
    navigate('/lobby');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>대기실: {roomId}</h2>
          <p style={{ margin: '0.3rem 0 0 0', color: '#6b7280' }}>
            참가자 {participants.length} / 8 명
          </p>
        </div>
        <button
          onClick={handleLeaveRoom}
          style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          나가기
        </button>
      </header>

      {/* Participant List */}
      <div style={{ margin: '2rem 0' }}>
        <h3 style={{ marginBottom: '1rem' }}>참가자 명단</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {participants.map((p) => (
            <div
              key={p.userId}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: p.isHost ? '#f0fdf4' : '#ffffff',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                  {p.nickname}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Lv.{p.level}
                </div>
              </div>
              {p.isHost && (
                <span style={{ fontSize: '0.75rem', background: '#22c55e', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                  방장 👑
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        {isCurrentUserHost ? (
          <button
            onClick={handleStartGame}
            style={{
              padding: '1rem 3rem',
              background: '#3b82f6',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
            }}
          >
            게임 시작하기
          </button>
        ) : (
          <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
            방장이 게임을 시작하기를 기다리고 있습니다...
          </div>
        )}
      </div>
    </div>
  );
};
