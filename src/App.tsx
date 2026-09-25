import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { LobbyPage } from './pages/LobbyPage';
import { RoomWaitingPage } from './pages/RoomWaitingPage';
import { GameBoardPage } from './pages/GameBoardPage';
import { GameResultPage } from './pages/GameResultPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-shell" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/room/:roomId" element={<RoomWaitingPage />} />
          <Route path="/game/:roomId" element={<GameBoardPage />} />
          <Route path="/result/:gameId" element={<GameResultPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
