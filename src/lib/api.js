import axios from 'axios';
import { useAuthStore } from '../features/auth/useAuth';

// 모든 API 요청은 이 인스턴스를 사용한다
const baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8080' : undefined);
const usesNgrok = baseURL && /\.(ngrok-free\.dev|ngrok-free\.app|ngrok\.io)$/.test(new URL(baseURL, window.location.origin).hostname);
export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    ...(usesNgrok ? { 'ngrok-skip-browser-warning': 'true' } : {}),
  },
});

// 토큰이 있으면 요청 헤더에 붙인다
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 토큰이 없거나 만료되면(COMMON_002, 탈퇴한 계정 포함) 토큰을 지우고 로그인 화면으로 보낸다 (API 명세).
// 로그인 실패(AUTH_002)도 401 이라서 반드시 error.code 로 구분한다.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error?.code === 'COMMON_002') {
      useAuthStore.getState().logout();
      const { pathname } = window.location;
      if (pathname !== '/login' && pathname !== '/signup') window.location.replace('/login');
    }
    return Promise.reject(error);
  },
);

export default api;
