import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const LoginPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginId || !password) {
      setErrorMsg('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    if (isSignup && !nickname) {
      setErrorMsg('닉네임을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignup
        ? { loginId, password, nickname }
        : { loginId, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '인증 처리에 실패했습니다.');
      }

      const tokenData = result.data; // { accessToken, tokenType, userId, nickname }

      // 유저 정보 저장 및 로비로 이동
      setAuth(tokenData.accessToken, {
        id: tokenData.userId,
        nickname: tokenData.nickname,
        level: 1,
        exp: 0,
      });

      navigate('/lobby');
    } catch (err: any) {
      setErrorMsg(err.message || '요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h1>Mukplay OX Quiz</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => { setIsSignup(false); setErrorMsg(''); }}
          style={{
            padding: '0.5rem 1rem',
            background: !isSignup ? '#3b82f6' : '#e5e7eb',
            color: !isSignup ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => { setIsSignup(true); setErrorMsg(''); }}
          style={{
            padding: '0.5rem 1rem',
            background: isSignup ? '#3b82f6' : '#e5e7eb',
            color: isSignup ? 'white' : '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}>
        <input
          type="text"
          placeholder="아이디 (4~20자)"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
        />
        <input
          type="password"
          placeholder={isSignup ? "비밀번호 (영문+숫자 8자 이상)" : "비밀번호"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
        />
        {isSignup && (
          <input
            type="text"
            placeholder="닉네임 (2~15자)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
        )}

        {errorMsg && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          {loading ? '처리 중...' : isSignup ? '회원가입 및 시작하기' : '로그인'}
        </button>
      </form>
    </div>
  );
};
