import { createSession, deleteSession, isSessionGone } from './api';
import { SESSION_EXPIRED_NOTICE } from './constants';
import { HOME_PATH } from './steps';
import { useVentStore } from './store';

// 서버 대화 세션 관리. 세션 ID 는 메모리(useVentStore)에만 둔다.

let creating = null; // 진행 중인 세션 만들기 (React StrictMode 로 두 번 불려도 세션은 하나만 만든다)

// 세션이 없으면 만들고 ID 를 돌려준다. 실패하면 던진다 (부르는 쪽에서 안내)
export function ensureSession() {
  const existing = useVentStore.getState().sessionId;
  if (existing) return Promise.resolve(existing);
  if (!creating) {
    const request = createSession()
      .then((sessionId) => {
        if (creating !== request) {
          deleteSession(sessionId).catch(() => {});
          throw new DOMException('Vent session was closed', 'AbortError');
        }
        useVentStore.getState().setSessionId(sessionId);
        return sessionId;
      })
      .finally(() => {
        if (creating === request) creating = null;
      });
    creating = request;
  }
  return creating;
}

// 나가기·중단: 서버 세션을 지우도록 보내고(기다리지 않음, 실패해도 15분 뒤 만료) 화면 상태를 비운다
export function endSession() {
  const { sessionId, reset } = useVentStore.getState();
  creating = null;
  reset();
  if (sessionId) deleteSession(sessionId).catch(() => {});
}

// 세션이 없어졌거나 만료됐으면(처음부터 다시 해야 함) 정리하고 홈으로 보낸 뒤 true.
// 그 밖의 오류면 아무것도 하지 않고 false (부르는 쪽이 오류 문구를 보여 준다)
export function leaveIfSessionGone(error, navigate) {
  if (!isSessionGone(error)) return false;
  useVentStore.getState().reset(); // 서버 세션은 이미 없다
  navigate(HOME_PATH, { replace: true, state: { notice: SESSION_EXPIRED_NOTICE } });
  return true;
}
