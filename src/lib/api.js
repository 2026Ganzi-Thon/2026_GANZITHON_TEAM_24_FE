import axios from 'axios';
import { useAuthStore } from '../features/auth/useAuth';

// 모든 API 요청은 이 인스턴스를 사용한다
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 토큰이 있으면 요청 헤더에 붙인다 (인증 실패 처리 정책은 A파트에서 추가)
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
