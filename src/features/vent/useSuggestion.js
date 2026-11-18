import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from './api';
import { leaveIfSessionGone } from './session';
import { useVentStore } from './store';

const inFlight = new Map(); // key → 진행 중인 요청 (StrictMode 로 효과가 두 번 돌아도 서버에는 한 번만 보낸다. 서버는 세션당 동시 1건)

const FAILED_MESSAGE = 'AI 초안을 만들지 못했어. 직접 적어도 괜찮아.';

// 화면이 열릴 때 AI 초안을 한 번만 받아 store 에 채운다.
//   key   : 'reaction' | 'summary' | 'plan'  (store.drafted 에 받았는지 기록해서 다시 들어와도 또 부르지 않는다)
//   load  : (sessionId) => 서버에서 받은 초안
//   apply : (초안) => store 의 result 에 채우기
// 실패하면 초안 없이 빈 칸으로 열어 사용자가 직접 쓰게 하고(서버 문서도 직접 입력을 허용), 같은 화면에서 다시 부르지 않는다.
// 돌려주는 값: { loading, error }
export function useSuggestion(key, load, apply) {
  const navigate = useNavigate();
  const initial = useVentStore.getState().drafted[key];
  const [state, setState] = useState({
    loading: !initial,
    error: typeof initial === 'string' ? initial : '',
  });

  useEffect(() => {
    if (useVentStore.getState().drafted[key]) return undefined;

    let alive = true;
    let request = inFlight.get(key);
    if (!request) {
      request = (async () => {
        const { sessionId } = useVentStore.getState();
        apply(await load(sessionId));
        useVentStore.getState().markDrafted(key);
      })().finally(() => inFlight.delete(key));
      inFlight.set(key, request);
    }

    request
      .then(() => alive && setState({ loading: false, error: '' }))
      .catch((e) => {
        if (!alive || leaveIfSessionGone(e, navigate)) return;
        const message = getErrorMessage(e, FAILED_MESSAGE);
        useVentStore.getState().markDrafted(key, message);
        setState({ loading: false, error: message });
      });

    return () => {
      alive = false;
    };
    // 화면이 열릴 때 한 번만. load/apply 는 열릴 때의 store 값을 읽는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
