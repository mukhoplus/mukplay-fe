import { Routes, Route, Link } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

function Home() {
  const { user } = useAuthStore();
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#38bdf8' }}>🎮 Mukplay OX</h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>실시간 멀티플레이어 서바이벌 OX 퀴즈</p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/lobby" style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
          로비 입장
        </Link>
      </div>

      {user && (
        <div style={{ marginTop: '2rem', color: '#cbd5e1' }}>
          환영합니다, {user.nickname}님! (Lv.{user.level})
        </div>
      )}
    </div>
  );
}

function LobbyPlaceholder() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>대기 로비</h2>
      <p style={{ color: '#94a3b8', margin: '1rem 0' }}>P7-02에서 상세 방 목록 및 생성이 연결됩니다.</p>
      <Link to="/" style={{ color: '#38bdf8' }}>홈으로 돌아가기</Link>
    </div>
  );
}

export default function App() {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<LobbyPlaceholder />} />
      </Routes>
    </main>
  );
}
