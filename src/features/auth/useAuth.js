import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 인증 토큰만 탭 세션에 보관해 새로고침 시 동기적으로 복원한다.
export const useAuthStore = create(persist(
  (set) => ({
    token: null,
    login: (token) => set({ token }),
    logout: () => set({ token: null }),
  }),
  {
    name: 'toro-auth',
    storage: createJSONStorage(() => sessionStorage),
    partialize: ({ token }) => ({ token }),
    merge: (saved, current) => ({
      ...current,
      token: typeof saved?.token === 'string' && saved.token ? saved.token : null,
    }),
  },
));

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  return { token, isLoggedIn: Boolean(token), login, logout };
}
