import { postVentResult } from './api';
import { useVentStore } from './store';

// '후보 다시 보기': 지금 후보를 exclude 로 넣어 /vent/result 를 다시 부르고, 감정 후보만 바꾼다.
// 화면 버튼은 아직 없다(디자인 확정 후 EmotionPickPage 에서 이 함수만 부르면 된다).
//
// 돌려주는 값: 후보를 바꿨으면 true, 못 바꿨으면 false
//   - 원문(texts)이 이미 지워졌으면(감정 "선택 완료" 이후) 부르지 않는다
//   - AI 실패(fallback)로 빈 후보가 오면 기존 후보를 그대로 둔다
// 네트워크·서버 오류는 그대로 던지므로, 부르는 쪽에서 getErrorMessage 로 안내한다.
export async function refreshEmotions() {
  const { texts, result, replaceEmotions } = useVentStore.getState();
  if (!result || texts.length === 0) return false;

  const data = await postVentResult({ texts, exclude: result.emotions ?? [] });
  if (!data.emotions?.length) return false;

  replaceEmotions(data.emotions);
  return true;
}
