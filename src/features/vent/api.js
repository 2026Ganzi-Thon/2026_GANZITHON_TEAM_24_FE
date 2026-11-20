import api from '../../lib/api';

// 하소연 API. 화면은 이 파일의 함수만 부른다.
//
// 백엔드 실제 구현(세션 방식, 백엔드 저장소 docs/ai-stt-flow.md) 기준이다. S = /api/v1/vent/sessions/{id}
//   POST   /vent/sessions                 세션 시작 → { sessionId, stage, expiresAt }  (사용자당 3개, 15분 뒤 만료)
//   POST   S/messages {text}              → { empathy }   하소연에 짧은 공감 (서버는 대화를 기억하지 않는다)
//   POST   S/emotions {text}              → { empathy, candidates, canSkip }  감정 후보 (다시 호출하면 다시 보기)
//   POST   S/emotions/confirm {emotion}   감정 확정(모르면 ''). 이 뒤로는 messages·emotions·stt 를 쓸 수 없다
//   POST   S/calming/complete {skipped}   진정하기 끝
//   POST   /stt (multipart file, sessionId) → { text, durationSeconds }   하소연 단계에서만
//   DELETE S                              감정 버리기 (200 완료 / 202 처리 중이라 다시 호출)
//   (모든 응답은 { success, data, error } 로 오고, 여기서는 data 만 돌려준다)
//
// VITE_VENT_MOCK=true 로 켜면 서버 없이 가짜 응답으로 화면 흐름을 볼 수 있다. (기본: 실제 서버)

export const USE_MOCK = import.meta.env.VITE_VENT_MOCK === 'true';
const AI_TIMEOUT = 35000;
const STT_TIMEOUT = 55000; // 백엔드의 Groq 연결 5초와 응답 읽기 45초에 여유를 둔다
const SESSIONS = '/api/v1/vent/sessions';
const EMOTIONS_MAX_LENGTH = 2000; // 서버 규칙: 감정 후보 요청은 합쳐서 최대 2000자
const DELETE_RETRY_LIMIT = 3; // 감정 버리기가 202(처리 중)일 때 다시 부르는 최대 횟수
const DELETE_RETRY_DELAY = 1000;

const unwrap = (res) => res.data.data;

export async function createSession() {
  if (USE_MOCK) return mockCreateSession();
  return unwrap(await api.post(SESSIONS)).sessionId;
}

// 하소연 한 건 → 캐릭터의 공감. 돌려주는 값: { empathy, risk }  (risk 는 가짜 응답에서만 DANGER 가 될 수 있다)
export async function sendMessage(sessionId, text) {
  if (USE_MOCK) return mockSendMessage(text);
  const data = unwrap(await api.post(`${SESSIONS}/${sessionId}/messages`, { text }, { timeout: AI_TIMEOUT }));
  return { empathy: data.empathy, risk: 'NONE' };
}

// 내가 쓴 글들을 합쳐 감정 후보 받기. 돌려주는 값: { empathy, candidates, canSkip }
export async function suggestEmotions(sessionId, texts) {
  const text = texts.join('\n').slice(-EMOTIONS_MAX_LENGTH).trim();
  if (USE_MOCK) return mockSuggestEmotions();
  return unwrap(await api.post(`${SESSIONS}/${sessionId}/emotions`, { text }, { timeout: AI_TIMEOUT }));
}

export async function confirmEmotion(sessionId, emotion) {
  if (USE_MOCK) return sleep(300);
  await api.post(`${SESSIONS}/${sessionId}/emotions/confirm`, { emotion });
}

export async function completeCalming(sessionId, skipped = false) {
  if (USE_MOCK) return sleep(200);
  await api.post(`${SESSIONS}/${sessionId}/calming/complete`, { skipped });
}

// ---- 4~6단계: 원했던 반응 · 3인칭 돌아보기 · 만약-그러면 계획 ----
// 서버는 AI 초안(suggestions)을 만들 때마다 '상황'을 요구한다 (하소연을 기억하지 않는다).
// 확정(PUT)해야 다음 단계로 넘어가고, reflection 을 확정하면 요약·계획이, summary 를 확정하면 계획이 서버에서 지워진다.
// 서버 길이 제한을 넘지 않게 보낼 때 자른다 (입력칸의 maxLength 도 같은 값)
export const LIMITS = { situation: 1000, emotion: 40, need: 300, desiredResponse: 500, summary: 1200, planIf: 300, planThen: 500 };
const cut = (text, max) => (text ?? '').slice(0, max);

// 원했던 반응 초안. 돌려주는 값: { needs: string[], desiredResponse }
export async function suggestNeeds(sessionId, { situation, desiredResponse = '' }) {
  if (USE_MOCK) return mockNeeds();
  const body = { situation: cut(situation, LIMITS.situation), desiredResponse: cut(desiredResponse, LIMITS.desiredResponse) };
  return unwrap(await api.post(`${SESSIONS}/${sessionId}/needs/suggestions`, body, { timeout: AI_TIMEOUT }));
}

// 상황·감정·필요했던 것·원했던 반응 확정 (감정·필요했던 것·원했던 반응은 모르면 빈 값 가능)
export async function confirmReflection(sessionId, { situation, emotion, need, desiredResponse }) {
  if (USE_MOCK) return sleep(300);
  const body = {
    situation: cut(situation, LIMITS.situation),
    emotion: cut(emotion, LIMITS.emotion),
    need: cut(need, LIMITS.need),
    desiredResponse: cut(desiredResponse, LIMITS.desiredResponse),
  };
  await api.put(`${SESSIONS}/${sessionId}/reflection`, body);
}

// 3인칭 정리 초안 (확정한 reflection 을 바탕으로 만든다). 돌려주는 값: summary 글
export async function suggestSummary(sessionId) {
  if (USE_MOCK) return mockSummary();
  return unwrap(await api.post(`${SESSIONS}/${sessionId}/summary/suggestions`, null, { timeout: AI_TIMEOUT })).summary;
}

export async function confirmSummary(sessionId, summary) {
  if (USE_MOCK) return sleep(300);
  await api.put(`${SESSIONS}/${sessionId}/summary`, { summary: cut(summary, LIMITS.summary) });
}

// 만약-그러면 계획 초안. 돌려주는 값: { ifSituation, thenAction }
export async function suggestPlan(sessionId) {
  if (USE_MOCK) return mockPlan();
  return unwrap(await api.post(`${SESSIONS}/${sessionId}/plan/suggestions`, null, { timeout: AI_TIMEOUT }));
}

export async function confirmPlan(sessionId, { ifSituation, thenAction }) {
  if (USE_MOCK) return sleep(300);
  await api.put(`${SESSIONS}/${sessionId}/plan`, {
    ifSituation: cut(ifSituation, LIMITS.planIf),
    thenAction: cut(thenAction, LIMITS.planThen),
  });
}

// 서버 세션 삭제. 서버 상태가 비워졌으면 true.
//   - 200: 완료. 202: 처리 중인 요청이 남아 있어 같은 DELETE 를 잠시 뒤 다시 부른다 (끝까지 202 면 false)
//   - 404/410: 삭제 확인 기록이 없어 완료 여부를 확인할 수 없음 → false
//   - 그 밖의 오류는 던진다 (부르는 쪽에서 실패로 처리)
export async function deleteSession(sessionId) {
  if (USE_MOCK) return true;
  for (let attempt = 0; attempt < DELETE_RETRY_LIMIT; attempt += 1) {
    try {
      const res = await api.delete(`${SESSIONS}/${sessionId}`);
      if (res.status === 200) return res.data?.data?.serverStateCleared === true
        && res.data?.data?.requestsSettled === true;
    } catch (error) {
      if (isSessionGone(error) || [404, 410].includes(error.response?.status)) return false;
      throw error;
    }
    await sleep(DELETE_RETRY_DELAY);
  }
  return false;
}

// 탭을 닫거나 새로고침하면 응답을 기다릴 수 없으므로 종료 요청만 보낸다.
export function releaseSessionOnPageHide(sessionId, token) {
  if (USE_MOCK || !sessionId || !token) return;
  const url = api.getUri({ url: `${SESSIONS}/${sessionId}` });
  void fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(api.defaults.headers['ngrok-skip-browser-warning']
        ? { 'ngrok-skip-browser-warning': 'true' } : {}),
    },
    keepalive: true,
  }).catch(() => {});
}

// 음성 → 글. 녹음 파일(blob)을 보내고 변환된 text 를 돌려준다. (하소연 단계의 세션 필요)
//   POST /api/v1/stt  multipart 필드 file (10MiB 이하)와 sessionId → { text, durationSeconds }
// 공통 axios 의 기본 Content-Type(application/json)이면 FormData 가 JSON 으로 바뀌어 버리므로
// 이 요청에서만 multipart 로 덮어쓴다 (브라우저가 boundary 를 붙여 준다).
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 서버 규칙: 10MiB
const AUDIO_EXTENSIONS = { 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg' };

export async function postStt(blob, { sessionId, signal } = {}) {
  if (blob.size > MAX_AUDIO_BYTES) {
    throw Object.assign(new Error('audio too large'), { sttTooLong: true });
  }
  if (USE_MOCK) return mockStt(signal);
  signal?.throwIfAborted();

  const baseType = (blob.type || 'audio/webm').split(';')[0];
  const form = new FormData();
  form.append('file', blob, `voice.${AUDIO_EXTENSIONS[baseType] ?? 'webm'}`);
  form.append('sessionId', sessionId);
  const res = await api.post('/api/v1/stt', form, {
    timeout: STT_TIMEOUT,
    signal,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.text;
}

// 서버 error.code 별 화면 문구. 모르는 코드나 네트워크 오류는 fallbackText
const STT_TOO_LONG = '녹음이 너무 길거나 파일이 커요. 조금 나눠서 말해줄래?';
const AI_FAILED = '지금은 AI가 답하기 어려워. 잠시 뒤에 다시 해볼래?';
const ERROR_MESSAGES = {
  CHAT_001: '글이 비어 있거나 너무 길어요. (1000자까지 쓸 수 있어요)',
  COMMON_001: '요청을 확인해 주세요. 다시 시도해 줄래?',
  SESSION_001: '하소연을 찾을 수 없어요. 처음부터 다시 시작해 줄래?',
  SESSION_002: '시간이 지나 하소연이 끝났어요. 처음부터 다시 시작해 줄래?',
  SESSION_003: '진행 단계가 바뀌었어요. 화면을 다시 확인해 줘.',
  SESSION_004: '진행 중인 하소연이 많아요. 잠시 뒤에 다시 시작해 줄래?',
  AI_001: '지금은 AI를 쓸 수 없어요. 잠시 뒤에 다시 시도해 줄래?',
  AI_002: AI_FAILED,
  AI_003: AI_FAILED,
  AI_004: '요청이 많아요. 잠시 뒤에 다시 해볼래?',
  STT_001: '지원하지 않는 녹음 형식이에요. 글로 입력해 주세요.',
  STT_002: STT_TOO_LONG,
  STT_003: '음성을 글로 바꾸지 못했어요. 다시 말해 줄래?',
  STT_004: '지금은 음성 인식을 사용할 수 없어요. 글로 입력해 주세요.',
  STT_005: '음성 인식 요청이 많아요. 잠시 후 다시 시도해 주세요.',
  STT_006: '말소리가 잘 안 들렸어. 다시 말해줄래?',
  COMMON_002: '로그인이 필요해요. 다시 로그인해 주세요.', // 토큰 지우기·로그인 이동은 lib/api.js 가 처리한다
};

const errorCode = (error) => error?.response?.data?.error?.code;

export function getErrorMessage(error, fallbackText) {
  if (error?.sttTooLong) return STT_TOO_LONG;
  return ERROR_MESSAGES[errorCode(error)] ?? fallbackText;
}

// 세션이 없어졌거나(SESSION_001) 만료·종료됐다(SESSION_002) → 더 이어 갈 수 없어 처음부터 시작해야 한다
export function isSessionGone(error) {
  const code = errorCode(error);
  return code === 'SESSION_001' || code === 'SESSION_002';
}

/* ---------------- 목(가짜 응답): VITE_VENT_MOCK=true 일 때만 사용 ---------------- */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_REPLIES = [
  '많이 힘들었겠다. 하고 싶은 말 다 해도 괜찮아.',
  '완전 억울하겠다. 혼자 다 짊어진 기분이었겠어.',
  '그 상황에서 화 안 나는 게 이상한 거지. 충분히 그럴 만해.',
  '그랬구나. 더 이야기해 줘, 끝까지 들을게.',
];
const MOCK_EMOTION_POOL = ['억울함', '분노', '무력감', '답답함', '서운함', '불안', '배신감'];

let mockMessageCount = 0;
let mockEmotionCalls = 0;

async function mockCreateSession() {
  await sleep(200);
  mockMessageCount = 0;
  mockEmotionCalls = 0;
  return 'mock-session';
}

async function mockSendMessage(text) {
  await sleep(700);
  // 테스트용: 위기 신호가 있는 글이면 DANGER (실제 서버에는 이 기능이 없다)
  if (/죽고\s?싶|자살/.test(text)) return { empathy: null, risk: 'DANGER' };
  const empathy = MOCK_REPLIES[mockMessageCount % MOCK_REPLIES.length];
  mockMessageCount += 1;
  return { empathy, risk: 'NONE' };
}

async function mockSuggestEmotions() {
  await sleep(1000);
  // 다시 부를 때마다 후보가 조금 바뀌게 한다
  const start = (mockEmotionCalls * 3) % MOCK_EMOTION_POOL.length;
  mockEmotionCalls += 1;
  const candidates = [0, 1, 2].map((i) => MOCK_EMOTION_POOL[(start + i) % MOCK_EMOTION_POOL.length]);
  return { empathy: '많이 속상했겠다.', candidates, canSkip: true };
}

async function mockStt(signal) {
  await sleep(800);
  if (signal?.aborted) throw Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' });
  return '오늘 팀플 발표 자료를 내가 혼자 다 만들었는데 이름이 빠져서 너무 억울했어.';
}

async function mockNeeds() {
  await sleep(900);
  return { needs: ['내 노력을 인정받고 싶었다', '공평하게 대우받고 싶었다'], desiredResponse: '고생했다고 먼저 말해 주길 바랐다' };
}

async function mockSummary() {
  await sleep(900);
  return '이 사람은 팀플 발표 자료를 혼자 만들었는데 이름이 빠져 억울했다.';
}

async function mockPlan() {
  await sleep(900);
  return { ifSituation: '다음에 또 내 몫이 빠진 걸 알게 되면', thenAction: '그 자리에서 한 문장으로 바로잡아 달라고 말한다' };
}
