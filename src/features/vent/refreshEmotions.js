import { suggestEmotions } from './api';
import { useVentStore } from './store';

// '후보 다시 보기': 같은 글로 감정 후보를 다시 받아 후보만 바꾼다.
// 화면 버튼은 아직 없다(디자인 확정 후 EmotionPickPage 에서 이 함수만 부르면 된다).
// 서버는 제외 목록을 받지 않아서 다시 불러도 같은 후보가 올 수 있다.
//
// 돌려주는 값: 후보를 바꿨으면 true, 못 바꿨으면 false
//   - 원문(texts)이 이미 지워졌으면(감정 확정 이후, 서버도 막는다) 부르지 않는다
//   - 빈 후보가 오면 기존 후보를 그대로 둔다
// 네트워크·서버 오류는 그대로 던지므로, 부르는 쪽에서 getErrorMessage 로 안내한다.
export async function refreshEmotions() {
  const { sessionId, texts, result, emotionConfirmed, replaceEmotions } = useVentStore.getState();
  if (!sessionId || !result || emotionConfirmed || texts.length === 0) return false;

  const data = await suggestEmotions(sessionId, texts);
  if (!data.candidates?.length) return false;

  replaceEmotions(data.candidates);
  return true;
}
