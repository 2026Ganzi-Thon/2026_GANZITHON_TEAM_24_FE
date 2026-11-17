import api from '../../lib/api';

// 하소연 API. 화면은 이 파일의 함수만 부른다.
//
// 형식은 노션 명세 기준이다. 서버는 아직 구현 전(노션 상태 "대기")이라 USE_MOCK 으로 가짜 응답을 쓴다.
//
//   POST /api/v1/vent         요청 { messages: [{ role: 'user' | 'ai', text }] }  1~20개, 마지막은 user
//                             응답 { risk: 'NONE' | 'DANGER', reply: string | null, fallback }
//   POST /api/v1/vent/result  요청 { texts: string[] (1~20개), exclude?: string[] }
//                             응답 { emotions, situation, needs, wantedReaction, plan: { if, then }, fallback }
//   (모든 응답은 { success, data, error } 로 오고, 여기서는 data 만 돌려준다)

const USE_MOCK = true; // 서버가 구현되면 false
const AI_TIMEOUT = 35000; // AI 응답은 최대 30초이므로 여유를 둔다 (lib/api.js 기본 10초로는 부족)
const MAX_ITEMS = 20; // 서버 규칙: messages·texts 는 최대 20개

// 화면 안의 메시지 { role: 'user' | 'assistant', content } → 서버 형식 { role: 'user' | 'ai', text }
const toServerMessage = ({ role, content }) => ({ role: role === 'user' ? 'user' : 'ai', text: content });

export async function postVent({ messages }) {
  const body = { messages: messages.slice(-MAX_ITEMS).map(toServerMessage) };
  if (USE_MOCK) return mockVent(body.messages);
  const res = await api.post('/api/v1/vent', body, { timeout: AI_TIMEOUT });
  return res.data.data;
}

export async function postVentResult({ texts, exclude = [] }) {
  const body = { texts: texts.slice(-MAX_ITEMS), exclude };
  if (USE_MOCK) return mockVentResult(body);
  const res = await api.post('/api/v1/vent/result', body, { timeout: AI_TIMEOUT });
  return res.data.data;
}

// 음성 → 글. 녹음 파일(blob)을 보내고 변환된 text 를 돌려준다.
//   POST /api/v1/stt  multipart 필드 audio (10MB 이하) → { text, durationSec }
// 공통 axios 의 기본 Content-Type(application/json)이면 FormData 가 JSON 으로 바뀌어 버리므로
// 이 요청에서만 multipart 로 덮어쓴다 (브라우저가 boundary 를 붙여 준다).
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 서버 규칙: 10MB
const AUDIO_EXTENSIONS = { 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg' };

export async function postStt(blob, { signal } = {}) {
  if (blob.size > MAX_AUDIO_BYTES) {
    throw Object.assign(new Error('audio too large'), { sttTooLong: true });
  }
  if (USE_MOCK) return mockStt(signal);
  const baseType = (blob.type || 'audio/webm').split(';')[0];
  const form = new FormData();
  form.append('audio', blob, `voice.${AUDIO_EXTENSIONS[baseType] ?? 'webm'}`);
  const res = await api.post('/api/v1/stt', form, {
    timeout: AI_TIMEOUT,
    signal,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.text;
}

// 서버 error.code 별 화면 문구. 모르는 코드나 네트워크 오류는 fallbackText
const STT_FAILED = '음성을 글로 바꾸지 못했어요. 다시 말해 줄래?'; // STT_001~003 의미가 확정되면 나눈다
const ERROR_MESSAGES = {
  CHAT_001: '글이 비어 있거나 너무 길어요. (1000자까지 쓸 수 있어요)',
  COMMON_001: '요청을 확인해 주세요. 다시 시도해 줄래?',
  STT_001: STT_FAILED,
  STT_002: STT_FAILED,
  STT_003: STT_FAILED,
  COMMON_002: '로그인이 필요해요. 다시 로그인해 주세요.', // 토큰 지우기·로그인 이동은 A파트 인증 작업
};

export function getErrorMessage(error, fallbackText) {
  if (error?.sttTooLong) return '녹음이 너무 길어요. 조금 나눠서 말해줄래?';
  const code = error?.response?.data?.error?.code;
  return ERROR_MESSAGES[code] ?? fallbackText;
}

/* ---------------- 목(가짜 응답): 서버 구현 전까지만 사용 ---------------- */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_REPLIES = [
  '많이 힘들었겠다. 하고 싶은 말 다 해도 괜찮아.',
  '완전 억울하겠다. 혼자 다 짊어진 기분이었겠어.',
  '그 상황에서 화 안 나는 게 이상한 거지. 충분히 그럴 만해.',
  '그랬구나. 더 이야기해 줘, 끝까지 들을게.',
];

async function mockVent(messages) {
  await sleep(700);
  const last = messages[messages.length - 1]?.text ?? '';
  // 테스트용: 위기 신호가 있는 글이면 DANGER
  if (/죽고\s?싶|자살/.test(last)) return { risk: 'DANGER', reply: null, fallback: false };
  const userCount = messages.filter((m) => m.role === 'user').length;
  return {
    risk: 'NONE',
    reply: MOCK_REPLIES[(userCount - 1) % MOCK_REPLIES.length],
    fallback: false,
  };
}

async function mockStt(signal) {
  await sleep(800);
  if (signal?.aborted) throw Object.assign(new Error('canceled'), { code: 'ERR_CANCELED' });
  return '오늘 팀플 발표 자료를 내가 혼자 다 만들었는데 이름이 빠져서 너무 억울했어.';
}

const MOCK_EMOTION_POOL = ['억울함', '분노', '무력감', '답답함', '서운함', '불안', '배신감'];

async function mockVentResult({ exclude }) {
  await sleep(1200);
  return {
    emotions: MOCK_EMOTION_POOL.filter((e) => !exclude.includes(e)).slice(0, 3),
    situation: '민경은 팀플 발표 자료를 혼자 만들었는데 이름이 빠져 억울했다.',
    needs: ['내 노력을 인정받고 싶었다', '공평하게 대우받고 싶었다'],
    wantedReaction: '고생했다고 먼저 말해 주길 바랐다',
    plan: {
      if: '다음에 또 내 몫이 빠진 걸 알게 되면',
      then: '그 자리에서 한 문장으로 바로잡아 달라고 말한다',
    },
    fallback: false,
  };
}
