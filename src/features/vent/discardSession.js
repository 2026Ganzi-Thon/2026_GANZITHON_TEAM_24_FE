import { deleteSession } from './api';
import { useVentStore } from './store';

// 테스트용: true 로 바꾸면 항상 실패해서 '삭제 실패' 화면을 확인할 수 있다. 확인 후 false 로 되돌린다
const FORCE_FAIL = false;

// 감정 버리기: 서버 세션을 지우고(DELETE), 이번 세션에 들고 있던 대화·초안·선택을 통째로 비운다.
// 서버가 지웠는지 확인하지 못하면 화면 내용은 그대로 두고 실패를 돌려준다 (삭제 실패 화면).
// 돌려주는 값: 성공 true, 실패 false (→ 삭제 실패 화면)
export async function discardSession() {
  try {
    if (FORCE_FAIL) return false;

    const { sessionId } = useVentStore.getState();
    if (sessionId && !(await deleteSession(sessionId))) return false;

    useVentStore.getState().reset();
    const { messages, texts, result, selectedEmotions, sessionId: left } = useVentStore.getState();
    return (
      messages.length === 0 &&
      texts.length === 0 &&
      result === null &&
      selectedEmotions.length === 0 &&
      left === null
    );
  } catch {
    return false;
  }
}
