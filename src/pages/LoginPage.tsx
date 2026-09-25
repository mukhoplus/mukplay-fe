import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const LoginPage: React.FC = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) return;

    // Simulate login for view mount / UI test
    setAuth('mock-jwt-token', {
      id: 1,
      nickname: loginId,
      level: 1,
      exp: 0,
    });
    navigate('/lobby');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h1>Mukplay OX Quiz</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
        <input
          type="text"
          placeholder="아이디"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          style={{ padding: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.75rem', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>
          로그인
        </button>
      </form>
    </div>
  );
};
