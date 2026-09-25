import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>대기 로비</h2>
      <p>환영합니다, {user?.nickname ?? '게스트'}님 (Lv.{user?.level ?? 1})</p>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => navigate('/room/room-demo-1')}
          style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          방 만들기 / 입장
        </button>
      </div>
    </div>
  );
};
