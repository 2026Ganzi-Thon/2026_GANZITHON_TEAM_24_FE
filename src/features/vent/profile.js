import { create } from 'zustand';
import { useAuthStore } from '../auth/useAuth';
import { getProfile } from '../character/roomApi';
import { FALLBACK_NICKNAME } from './constants';

// 하소연 화면에서 부를 사용자 닉네임 (메모리에만 둔다).
// 하소연 화면은 A파트 AppLayout 밖이라 프로필을 직접 불러온다. 서버 문장 속 이름은 서버가 알아서 넣으므로
// 여기서는 화면 문구(인사말 등)에만 쓴다.
const useProfileStore = create((set) => ({
  nickname: null,
  setNickname: (nickname) => set({ nickname }),
}));

// 하소연을 시작할 때 한 번 부른다. 로그인 상태가 아니거나 불러오지 못하면 기본 호칭을 쓴다.
export async function loadNickname() {
  const { setNickname } = useProfileStore.getState();
  if (!useAuthStore.getState().token) {
    setNickname(null); // 다른 사용자의 닉네임이 남아 있지 않게
    return;
  }

  try {
    const profile = await getProfile();
    setNickname(profile?.nickname?.trim() || null);
  } catch {
    // 실패하면 이전 값을 그대로 둔다 (없으면 기본 호칭)
  }
}

export function useNickname() {
  const nickname = useProfileStore((s) => s.nickname);
  return nickname ?? FALLBACK_NICKNAME;
}
