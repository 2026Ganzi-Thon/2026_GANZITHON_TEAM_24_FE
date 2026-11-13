import { create } from 'zustand';

// 로그인 가드가 쓰는 최소 인터페이스만 잡아둠.
// 토큰 저장 방식, 로그인 API 연결 등 실제 구현은 A파트에서 자유롭게 바꿔도 된다.
export const useAuthStore = create((set) => ({
  token: null,
  login: (token) => set({ token }),
  logout: () => set({ token: null }),
}));

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  return { token, isLoggedIn: Boolean(token), login, logout };
}
