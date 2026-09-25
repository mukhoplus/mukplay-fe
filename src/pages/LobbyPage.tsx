import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export interface RoomItem {
  roomId: string;
  title: string;
  hostNickname: string;
  currentParticipants: number;
  maxParticipants: number;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
}

const INITIAL_ROOMS: RoomItem[] = [
  {
    roomId: 'room-101',
    title: '초보자 환영 OX 퀴즈방',
    hostNickname: '방장먹호',
    currentParticipants: 3,
    maxParticipants: 8,
    status: 'WAITING',
  },
  {
    roomId: 'room-102',
    title: '상식 퀴즈 마스터전',
    hostNickname: '퀴즈왕',
    currentParticipants: 8,
    maxParticipants: 8,
    status: 'WAITING',
  },
  {
    roomId: 'room-103',
    title: '스피드 퀴즈 한판',
    hostNickname: '스피드스타',
    currentParticipants: 5,
    maxParticipants: 10,
    status: 'PLAYING',
  },
];

export const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [rooms, setRooms] = useState<RoomItem[]>(INITIAL_ROOMS);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(8);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRoom: RoomItem = {
      roomId: `room-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      hostNickname: user?.nickname ?? '호스트',
      currentParticipants: 1,
      maxParticipants,
      status: 'WAITING',
    };

    setRooms([newRoom, ...rooms]);
    setShowModal(false);
    setNewTitle('');
    navigate(`/room/${newRoom.roomId}`);
  };

  const handleJoinRoom = (roomId: string, status: string, current: number, max: number) => {
    if (status !== 'WAITING') {
      alert('이미 진행 중이거나 종료된 방입니다.');
      return;
    }
    if (current >= max) {
      alert('방 정원이 가득 찼습니다.');
      return;
    }
    navigate(`/room/${roomId}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Mukplay 로비</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
            환영합니다, <strong>{user?.nickname ?? '게스트'}</strong>님 (Lv.{user?.level ?? 1})
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          + 방 만들기
        </button>
      </header>

      {/* Room List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {rooms.map((room) => {
          const isFull = room.currentParticipants >= room.maxParticipants;
          const isWaiting = room.status === 'WAITING';

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
                    {room.status}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {room.currentParticipants}/{room.maxParticipants}명
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{room.title}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>방장: {room.hostNickname}</p>
              </div>

              <button
                disabled={!isWaiting || isFull}
                onClick={() => handleJoinRoom(room.roomId, room.status, room.currentParticipants, room.maxParticipants)}
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
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>최대 인원 (2~10명)</label>
                <select
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  {[2, 4, 6, 8, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}명
                    </option>
                  ))}
                </select>
              </div>
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
