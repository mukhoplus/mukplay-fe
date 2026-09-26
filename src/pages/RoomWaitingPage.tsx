import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export interface Participant {
  userId: number;
  nickname: string;
}

export interface RoomDetail {
  roomId: string;
  name: string;
  hostId: number;
  currentPlayers: number;
  maxPlayers: number;
  state: 'WAITING' | 'PLAYING' | 'FINISHED';
  participants: Participant[];
}

const parseJwt = (token: string | null) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const RoomWaitingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 유저 정보가 없는데 토큰이 있으면 /api/users/me로 프로필 복구
  useEffect(() => {
    if (token && !user) {
      fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setAuth(token, {
              id: data.data.id,
              nickname: data.data.nickname,
              level: data.data.level,
              exp: data.data.exp,
            });
          }
        })
        .catch((e) => console.error('내 프로필 복구 실패', e));
    }
  }, [token, user, setAuth]);

  // 현재 사용자 ID 결정 (user 상태 또는 JWT 토큰 디코딩)
  const currentUserId = user?.id ?? (token ? Number(parseJwt(token)?.sub) : null);

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setRoom(data.data);
        if (data.data.state === 'PLAYING') {
          navigate(`/game/${roomId}`);
        }
      } else {
        setErrorMsg(data.message || '방 정보를 불러올 수 없습니다.');
      }
    } catch (e: any) {
      console.error('방 상세 조회 실패', e);
    } finally {
      setLoading(false);
    }
  }, [roomId, token, navigate]);

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 2000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // 방장 여부 판정 (hostId와 비교하거나, 첫 번째 참가자인지 확인)
  const isCurrentUserHost = room && currentUserId
    ? Number(room.hostId) === Number(currentUserId) || (room.participants.length > 0 && Number(room.participants[0].userId) === Number(currentUserId))
    : false;

  const handleAddBot = async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}/bot`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setRoom(data.data);
      } else {
        alert(data.message || '봇 추가에 실패했습니다.');
      }
    } catch (e: any) {
      alert(e.message || '봇 추가 중 오류 발생');
    }
  };

  const handleStartGame = async () => {
    if (!roomId) return;
    if ((room?.currentPlayers ?? 0) < 2) {
      alert('게임을 시작하려면 최소 2명 이상의 참가자가 필요합니다. [연습봇 추가]를 눌러 봇과 함께 테스트해보세요!');
      return;
    }

    try {
      const res = await fetch(`/api/rooms/${roomId}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || '게임 시작에 실패했습니다.');
        return;
      }

      navigate(`/game/${roomId}`);
    } catch (e: any) {
      alert(e.message || '게임 시작 요청 중 오류가 발생했습니다.');
    }
  };

  const handleLeaveRoom = async () => {
    if (roomId && token) {
      try {
        await fetch(`/api/rooms/${roomId}/leave`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error(e);
      }
    }
    navigate('/lobby');
  };

  if (loading && !room) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>대기실 정보를 불러오는 중...</div>;
  }

  if (errorMsg && !room) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: '#ef4444' }}>{errorMsg}</p>
        <button onClick={() => navigate('/lobby')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          로비로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>방 제목: {room?.name}</h2>
          <p style={{ margin: '0.3rem 0 0 0', color: '#6b7280' }}>
            방 코드: <strong>{room?.roomId}</strong> | 인원: {room?.currentPlayers} / {room?.maxPlayers}명 | 내 ID: {currentUserId ?? '확인불가'} {isCurrentUserHost ? '(방장 👑)' : '(참가자)'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleAddBot}
            style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            title="최소 2인 인원을 채우기 위해 가상 봇을 추가합니다"
          >
            + 연습봇 추가
          </button>
          <button
            onClick={handleLeaveRoom}
            style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            방 나가기
          </button>
        </div>
      </header>

      {/* Participant List */}
      <div style={{ margin: '2rem 0' }}>
        <h3 style={{ marginBottom: '1rem' }}>참가자 명단</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {room?.participants.map((p, index) => {
            const isHost = Number(p.userId) === Number(room.hostId) || index === 0;
            const isMe = currentUserId ? Number(p.userId) === Number(currentUserId) : false;

            return (
              <div
                key={p.userId}
                style={{
                  border: isMe ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isHost ? '#f0fdf4' : '#ffffff',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {p.nickname} {isMe && '(나)'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    ID: {p.userId}
                  </div>
                </div>
                {isHost && (
                  <span style={{ fontSize: '0.75rem', background: '#22c55e', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                    방장 👑
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '2rem' }}>
        {isCurrentUserHost ? (
          <>
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
            {(room?.currentPlayers ?? 0) < 2 && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444' }}>
                * 최소 2명 이상이어야 합니다. [연습봇 추가]를 눌러 봇과 함께 테스트해보세요!
              </p>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#6b7280', fontStyle: 'italic', marginBottom: '0.5rem' }}>
              방장(ID: {room?.hostId})이 게임을 시작하기를 기다리고 있습니다...
            </div>
            {/* 방장 판단이 어긋난 경우를 위한 강제 시작 옵션 제공 */}
            <button
              onClick={handleStartGame}
              style={{
                padding: '0.6rem 1.5rem',
                background: '#9ca3af',
                color: 'white',
                fontSize: '0.9rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              (테스트) 게임 시작 강제 요청
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
