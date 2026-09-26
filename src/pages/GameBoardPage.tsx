import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameBoard } from '../components/GameBoard';
import { MobileDpad } from '../components/MobileDpad';
import { RoundTimerBar } from '../components/RoundTimerBar';
import { useAuthStore } from '../stores/authStore';
import { useStompStore } from '../stores/stompStore';
import { useKeyboardController } from '../hooks/useKeyboardController';

interface RoundResultInfo {
  round: number;
  answer: string;
  isEliminated: boolean;
  aliveCount: number;
}

export const GameBoardPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const { connect, disconnect, positions, gameState, lastEvent, sendMove, setInitialGameState } = useStompStore();

  const [roundResult, setRoundResult] = useState<RoundResultInfo | null>(null);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  // Check if current user is alive
  const myPlayer = positions.find((p) => p.userId === user?.id);
  const isMyPlayerAlive = myPlayer ? myPlayer.alive : true;

  // Controller is enabled only when game is playing and user is alive and not in intermission
  const isPlaying = gameState?.state === 'PLAYING' && !roundResult && !gameFinished && isMyPlayerAlive;

  useKeyboardController({
    onMove: (direction) => {
      if (roomId && isPlaying) {
        sendMove(roomId, direction);
      }
    },
    enabled: isPlaying,
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

  // 3. 서버 이벤트 수신 처리 (ROUND_ENDED, ROUND_STARTED, GAME_FINISHED)
  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.eventType === 'ROUND_ENDED') {
      const data = lastEvent.data as {
        round?: number;
        answer?: string;
        eliminatedUserIds?: number[];
        aliveCount?: number;
      };
      const eliminatedIds = data?.eliminatedUserIds ?? [];
      const isEliminated = user?.id ? eliminatedIds.includes(user.id) : false;

      setRoundResult({
        round: data?.round ?? gameState?.currentRound ?? 1,
        answer: data?.answer ?? '?',
        isEliminated,
        aliveCount: data?.aliveCount ?? gameState?.alivePlayerCount ?? 0,
      });
    } else if (lastEvent.eventType === 'ROUND_STARTED') {
      setRoundResult(null);
    } else if (lastEvent.eventType === 'GAME_FINISHED') {
      setRoundResult(null);
      setGameFinished(true);

      const navTimer = setTimeout(() => {
        if (roomId) {
          navigate(`/result/${roomId}`);
        }
      }, 3000);
      return () => clearTimeout(navTimer);
    }
  }, [lastEvent, user?.id, roomId, gameState?.currentRound, gameState?.alivePlayerCount, navigate]);

  // Demo fallback positions if not yet connected
  const displayPositions = positions.length > 0 ? positions : [
    { userId: user?.id ?? 1, x: 25.0, y: 50.0, alive: true },
    { userId: 2, x: 75.0, y: 50.0, alive: true },
    { userId: 3, x: 50.0, y: 50.0, alive: false },
  ];

  const roundDurationMs = gameState?.startedAt && gameState?.endsAt
    ? Math.max(1000, new Date(gameState.endsAt).getTime() - new Date(gameState.startedAt).getTime())
    : 15000;

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
          <RoundTimerBar endsAt={gameState?.endsAt ?? null} totalDurationMs={roundDurationMs} />
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>생존자</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>
            {gameState?.alivePlayerCount ?? displayPositions.filter((p) => p.alive).length}명
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
          {isPlaying
            ? '키보드 [W, A, S, D] 또는 [방향키]를 눌러 O 또는 X 구역으로 이동하세요!'
            : !isMyPlayerAlive
            ? '💀 탈락하셨습니다. 다른 플레이어들의 경기를 관전하세요.'
            : roundResult
            ? '정답 확인 및 라운드 결산 중입니다.'
            : '대기 중...'}
        </div>
      </div>

      {/* Main Game Board Container with Overlays */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <GameBoard positions={displayPositions} currentUserId={user?.id ?? 1} />

        {/* Round Result Overlay */}
        {roundResult && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(17, 24, 39, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              borderRadius: '12px',
              zIndex: 50,
              backdropFilter: 'blur(4px)',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.1rem', color: '#9ca3af', fontWeight: 600 }}>
              라운드 {roundResult.round} 종료
            </div>
            <div style={{ fontSize: '1.3rem', marginTop: '0.5rem', color: '#f3f4f6' }}>
              정답은
            </div>
            <div
              style={{
                fontSize: '5rem',
                fontWeight: 900,
                lineHeight: 1,
                margin: '0.5rem 0',
                color: roundResult.answer === 'O' ? '#ef4444' : '#3b82f6',
                textShadow: '0 4px 16px rgba(0,0,0,0.6)',
              }}
            >
              {roundResult.answer}
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 'bold',
                padding: '0.6rem 1.4rem',
                borderRadius: '9999px',
                background: roundResult.isEliminated ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)',
                border: roundResult.isEliminated ? '2px solid #ef4444' : '2px solid #22c55e',
                color: roundResult.isEliminated ? '#fca5a5' : '#86efac',
                marginBottom: '1rem',
              }}
            >
              {roundResult.isEliminated ? '💀 이번 라운드에서 탈락하셨습니다!' : '🎉 생존 성공! 다음 라운드로 진출합니다.'}
            </div>
            <div style={{ fontSize: '0.95rem', color: '#d1d5db' }}>
              남은 생존자: <strong style={{ color: '#4ade80' }}>{roundResult.aliveCount}명</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.75rem' }}>
              다음 라운드 준비 중... (4초)
            </div>
          </div>
        )}

        {/* Game Finished Overlay */}
        {gameFinished && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(17, 24, 39, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              borderRadius: '12px',
              zIndex: 60,
              backdropFilter: 'blur(6px)',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🏆</div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#fbbf24' }}>
              게임 종료!
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#d1d5db', marginBottom: '1.5rem' }}>
              {isMyPlayerAlive ? '축하합니다! 최후까지 생존하셨습니다! 🎉' : '모든 라운드가 종료되었습니다.'}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
              잠시 후 결과창으로 이동합니다...
            </p>
          </div>
        )}
      </div>

      {/* Mobile Discrete Tap D-pad */}
      <MobileDpad
        onMove={(direction) => {
          if (roomId && isPlaying) {
            sendMove(roomId, direction);
          }
        }}
        disabled={!isPlaying}
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

