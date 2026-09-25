import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const GameResultPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>게임 결과</h2>
      <p>게임 ID: {gameId}</p>
      <div style={{ margin: '2rem 0', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px' }}>
        <h3>최종 순위: 1위 🏆</h3>
        <p>획득 경험치: +120 EXP</p>
      </div>
      <button
        onClick={() => navigate('/lobby')}
        style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        로비로 돌아가기
      </button>
    </div>
  );
};
