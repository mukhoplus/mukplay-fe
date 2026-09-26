import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameBoard } from '../components/GameBoard';
import { MobileDpad } from '../components/MobileDpad';
import { RoundTimerBar } from '../components/RoundTimerBar';
import { useAuthStore } from '../stores/authStore';
import { useStompStore } from '../stores/stompStore';
import { useKeyboardController } from '../hooks/useKeyboardController';

export const GameBoardPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const { connect, disconnect, positions, gameState, sendMove, setInitialGameState } = useStompStore();

  useKeyboardController({
    onMove: (direction) => {
      if (roomId) {
        sendMove(roomId, direction);
      }
    },
    enabled: true,
  });

  // 1. 마운트 시 현재 활성 게임 상태 및 문제를 즉시 REST로 조회 (소켓 연결 딜레이 대비 즉시 표시)
  useEffect(() => {
    if (!roomId) return;
    fetch(`/api/rooms/${roomId}/game`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          const g = resData.data;
          setInitialGameState(
            {
              roomId: g.roomId,
              state: g.state,
              currentRound: g.currentRound,
              maxRounds: g.maxRounds,
              questionId: g.questionId,
              questionContent: g.questionContent,
              startedAt: g.startedAt,
              endsAt: g.endsAt,
              alivePlayerCount: g.alivePlayerCount,
            },
            g.positions ?? []
          );
        }
      })
      .catch((err) => console.error('초기 게임 상태 조회 실패', err));
  }, [roomId, token, setInitialGameState]);

  // 2. 실시간 웹소켓 연결
  useEffect(() => {
    if (roomId && token) {
      connect(roomId, token);
    }
    return () => {
      disconnect();
    };
  }, [roomId, token, connect, disconnect]);

  // Demo fallback positions if not yet connected
  const displayPositions = positions.length > 0 ? positions : [
    { userId: user?.id ?? 1, x: 25.0, y: 50.0, alive: true },
    { userId: 2, x: 75.0, y: 50.0, alive: true },
    { userId: 3, x: 50.0, y: 50.0, alive: false },
  ];

  return (
    <div style={{ padding: '1rem', maxWidth: '850px', margin: '0 auto' }}>
      {/* Top HUD */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          background: '#1f2937',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>방 번호: {roomId}</span>
          <h3 style={{ margin: '0.2rem 0 0 0' }}>라운드 {gameState?.currentRound ?? 1} / {gameState?.maxRounds ?? 5}</h3>
        </div>
        <div style={{ textAlign: 'center', minWidth: '180px' }}>
          <RoundTimerBar endsAt={gameState?.endsAt ?? null} />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>생존자</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>
            {gameState?.alivePlayerCount ?? 2}명
          </div>
        </div>
      </div>

      {/* Question HUD */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.25rem',
          textAlign: 'center',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>Q. OX 퀴즈</span>
        <h2 style={{ margin: '0.5rem 0', fontSize: '1.35rem', color: '#111827' }}>
          {gameState?.questionContent ?? '문제를 불러오는 중입니다...'}
        </h2>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.3rem' }}>
          키보드 [W, A, S, D] 또는 [방향키]를 눌러 O 또는 X 구역으로 이동하세요!
        </div>
      </div>

      {/* Main Game Board */}
      <GameBoard positions={displayPositions} currentUserId={user?.id ?? 1} />

      {/* Mobile Discrete Tap D-pad */}
      <MobileDpad
        onMove={(direction) => {
          if (roomId) {
            sendMove(roomId, direction);
          }
        }}
        disabled={false}
      />

      {/* Footer controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button
          onClick={() => navigate(`/result/${roomId}`)}
          style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          결과창으로 이동 (테스트)
        </button>
      </div>
    </div>
  );
};
