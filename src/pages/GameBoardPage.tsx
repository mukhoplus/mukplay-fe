import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const GameBoardPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem' }}>
      <h2>OX 게임 보드: {roomId}</h2>
      <div style={{ display: 'flex', width: '100%', height: '300px', border: '2px solid #ccc', margin: '1rem 0' }}>
        <div style={{ flex: 1, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: '#ef4444' }}>
          O
        </div>
        <div style={{ width: '40px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          |
        </div>
        <div style={{ flex: 1, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: '#3b82f6' }}>
          X
        </div>
      </div>
      <button
        onClick={() => navigate(`/result/${roomId}`)}
        style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        게임 종료 (결과 보기)
      </button>
    </div>
  );
};
