import { create } from 'zustand';

interface UserProfile {
  id: number;
  nickname: string;
  level: number;
  exp: number;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  setAuth: (token: string, user: UserProfile) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
