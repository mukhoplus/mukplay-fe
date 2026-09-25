import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const RoomWaitingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem' }}>
      <h2>대기실: {roomId}</h2>
      <p>다른 참가자를 기다리고 있습니다...</p>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => navigate(`/game/${roomId}`)}
          style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          게임 시작하기
        </button>
        <button
          onClick={() => navigate('/lobby')}
          style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          로비로 나가기
        </button>
      </div>
    </div>
  );
};
