import { useVentStore } from './store';

// 테스트용: true 로 바꾸면 항상 실패해서 '삭제 실패' 화면을 확인할 수 있다. 확인 후 false 로 되돌린다
const FORCE_FAIL = false;

// 감정 버리기: 이번 세션에 들고 있던 대화·초안·선택을 통째로 비운다.
// 서버에는 지울 것이 없고(노션 명세) 프론트 메모리만 비우므로, 비운 뒤 정말 비었는지 확인해서 결과를 돌려준다.
// 돌려주는 값: 성공 true, 실패 false (→ 삭제 실패 화면)
export function discardSession() {
  try {
    useVentStore.getState().reset();
    const { messages, texts, result, selectedEmotions } = useVentStore.getState();
    const cleared =
      messages.length === 0 && texts.length === 0 && result === null && selectedEmotions.length === 0;
    return cleared && !FORCE_FAIL;
  } catch {
    return false;
  }
}
