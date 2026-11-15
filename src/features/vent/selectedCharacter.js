import { create } from 'zustand';
import { useAuthStore } from '../auth/useAuth';
import { getCharacters } from '../character/roomApi';

// 하소연 흐름에서 쓰는 선택한 캐릭터 (메모리에만 둔다).
// 대화 내용을 담는 useVentStore 와 일부러 따로 둔다: 버리기에서 reset() 으로 세션을 비운 뒤에도
// 완료 화면이 같은 캐릭터를 써야 하기 때문이다. 새로 하소연을 시작할 때마다 덮어쓴다.
export const useSelectedCharacterStore = create((set) => ({
  character: null, // null 이면 기본 캐릭터(useSelectedCharacter 가 대신 돌려준다)
  setCharacter: (character) => set({ character }),
}));

// 하소연 시작 시 캐릭터 정하기.
//   1) 홈에서 넘겨 준 캐릭터(router state)가 있으면 그대로
//   2) 없으면(메뉴로 들어온 경우 등) 로그인 상태에서 내 캐릭터 목록의 첫 번째 (홈이 기본으로 고르는 캐릭터와 같다)
//   3) 그것도 안 되면 기본 캐릭터
export async function startWithCharacter(passed) {
  const { setCharacter } = useSelectedCharacterStore.getState();
  setCharacter(passed ?? null);
  if (passed || !useAuthStore.getState().token) return;

  try {
    const data = await getCharacters();
    const first = data?.characters?.[0];
    // 불러오는 사이 다른 캐릭터가 정해졌다면 덮어쓰지 않는다
    if (first && useSelectedCharacterStore.getState().character === null) setCharacter(first);
  } catch {
    // 실패하면 기본 캐릭터로 둔다
  }
}
