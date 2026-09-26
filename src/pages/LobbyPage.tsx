import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export interface RoomItem {
  roomId: string;
  name: string;
  hostId: number;
  currentPlayers: number;
  maxPlayers: number;
  state: 'WAITING' | 'PLAYING' | 'FINISHED';
  participants: Array<{ userId: number; nickname: string }>;
}

export const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [errorMsg] = useState('');

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setRooms(data.data);
      }
    } catch (e) {
      console.error('방 목록 조회 실패', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTitle.trim(),
          maxPlayers: maxParticipants,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || '방 생성에 실패했습니다.');
        return;
      }

      setShowModal(false);
      setNewTitle('');
      navigate(`/room/${data.data.roomId}`);
    } catch (err: any) {
      alert(err.message || '방 생성 중 오류가 발생했습니다.');
    }
  };

  const handleJoinRoom = async (roomId: string, state: string, current: number, max: number) => {
    if (state !== 'WAITING') {
      alert('이미 진행 중이거나 종료된 방입니다.');
      return;
    }
    if (current >= max) {
      alert('방 정원이 가득 찼습니다.');
      return;
    }

    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        // 이미 참여 중인 경우에도 대기실로 이동 허용
        if (data.code === 'R003') {
          navigate(`/room/${roomId}`);
          return;
        }
        alert(data.message || '방 입장에 실패했습니다.');
        return;
      }

      navigate(`/room/${roomId}`);
    } catch (e: any) {
      alert(e.message || '방 입장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Mukplay 로비</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
            환영합니다, <strong>{user?.nickname ?? '플레이어'}</strong>님 (ID: {user?.id})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchRooms}
            style={{ padding: '0.75rem 1rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            새로고침
          </button>
          <button
            onClick={() => setShowModal(true)}
            style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            + 방 만들기
          </button>
        </div>
      </header>

      {/* Room List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>방 목록을 불러오는 중...</div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>현재 대기 중인 방이 없습니다.</h3>
          <p style={{ margin: 0, color: '#9ca3af' }}>새로운 방을 생성하여 OX 퀴즈 게임을 시작해보세요!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {rooms.map((room) => {
            const isFull = room.currentPlayers >= room.maxPlayers;
            const isWaiting = room.state === 'WAITING';

            return (
              <div
                key={room.roomId}
                className="room-card"
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: isWaiting ? '#dcfce7' : '#fee2e2',
                        color: isWaiting ? '#166534' : '#991b1b',
                        fontWeight: 'bold',
                      }}
                    >
                      {room.state}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {room.currentPlayers}/{room.maxPlayers}명
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{room.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>방 코드: {room.roomId}</p>
                </div>

                <button
                  disabled={!isWaiting || isFull}
                  onClick={() => handleJoinRoom(room.roomId, room.state, room.currentPlayers, room.maxPlayers)}
                  style={{
                    marginTop: '1.25rem',
                    padding: '0.6rem',
                    background: !isWaiting || isFull ? '#e5e7eb' : '#10b981',
                    color: !isWaiting || isFull ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: !isWaiting || isFull ? 'not-allowed' : 'pointer',
                  }}
                >
                  {!isWaiting ? '진행 중' : isFull ? '정원 초과' : '입장하기'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Room Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '360px' }}>
            <h2 style={{ marginTop: 0 }}>새로운 방 만들기</h2>
            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>방 제목</label>
                <input
                  type="text"
                  required
                  placeholder="예: 재미있는 OX 퀴즈"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>최대 인원 (2~50명)</label>
                <select
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  {[2, 4, 6, 8, 10, 20].map((num) => (
                    <option key={num} value={num}>
                      {num}명
                    </option>
                  ))}
                </select>
              </div>
              {errorMsg && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errorMsg}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
