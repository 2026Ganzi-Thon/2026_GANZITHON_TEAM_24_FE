import { create } from 'zustand';
import { MAX_EMOTIONS, SITUATION_MAX_LENGTH, UNSURE_LABEL } from './constants';

// 하소연 흐름 상태. 메모리에만 둔다 (persist, localStorage, sessionStorage 금지).
// 새로고침하면 사라지고, 나가기/버리기에서 reset()으로 통째로 비운다.
const initialState = {
  sessionId: null, // 서버 대화 세션 ID (메모리에만. 새로고침하면 잃는다)
  reviewingEmotions: false,
  emotionConfirmed: false, // 감정 확정 뒤에는 서버가 하소연 단계로 되돌아갈 수 없다
  messages: [], // 하소연 대화 [{ id, role: 'user' | 'assistant', content, at, local }]
  //                local: true 는 화면에만 보이는 말풍선("더 이야기 하고 싶어!" 등). 서버로 보내지 않는다
  texts: [], // 사용자 글만 따로 보관. 감정 "선택 완료"에서 지운다
  result: null, // POST /vent/result 응답 (emotions, needs, wantedReaction, situation, plan)
  selectedEmotions: [],
  editedFields: [], // 2단계에서 사용자가 고친 칸 이름 (말풍선에 'AI 초안' 대신 '내가 고친 글' 표시용)
  loading: false,
  // 서버 4~6단계(원했던 반응·3인칭·계획) 연결용. 모두 메모리에만 두고 버리기·나가기에서 비운다
  situationText: '', // 하소연 글을 합친 것(최근 1000자). 서버가 초안을 만들 때마다 '상황'을 요구해서 감정 확정 뒤에도 들고 있는다
  emotionText: '', // 감정 확정에 보낸 문자열 (확정 반응에도 같이 보낸다)
  drafted: { reaction: false, summary: false, plan: false }, // AI 초안을 이미 받아 봤는지. 실패하면 오류 문구(문자열)
  confirmed: { reflection: null, summary: null, plan: null }, // 서버에 확정한 값(문자열). 같으면 다시 보내지 않는다
};

let nextMessageId = 1;

export const useVentStore = create((set) => ({
  ...initialState,

  addMessage: (role, content, { local = false } = {}) =>
    set((s) => ({
      messages: [...s.messages, { id: nextMessageId++, role, content, at: Date.now(), local }],
    })),

  setLoading: (loading) => set({ loading }),

  setSessionId: (sessionId) => set({ sessionId }),

  // 완료 뒤 남은 감정을 살펴본다. 삭제한 원문·결과를 복원하지 않고 현재 기분으로 시작한다.
  startEmotionReview: (candidates, context) =>
    set((s) => ({
      ...initialState,
      sessionId: s.sessionId,
      reviewingEmotions: true,
      texts: [context],
      result: {
        emotions: candidates ?? [],
        situation: '',
        needs: [],
        wantedReaction: '',
        plan: { if: '', then: '' },
      },
    })),

  // "다 털어놓은 것 같아" 직후: 서버가 준 감정 후보를 저장하고, AI 답장은 지우고 사용자 글만 texts로 남긴다.
  // 서버가 아직 주지 않는 칸(상황·필요했던 것·원했던 반응·계획)은 빈 값이라 해당 화면은 직접 쓰는 상태로 열린다.
  commitResult: (candidates) =>
    set((s) => ({
      result: {
        emotions: candidates ?? [],
        situation: '',
        needs: [],
        wantedReaction: '',
        plan: { if: '', then: '' },
      },
      texts: [
        ...s.texts,
        ...s.messages.filter((m) => m.role === 'user' && !m.local).map((m) => m.content),
      ],
      messages: [],
      selectedEmotions: [],
    })),

  // 2단계 화면에서 사용자가 고친 값으로 초안을 덮어쓴다 (서버로 보내지 않는다)
  updateResult: (patch, editedKey) =>
    set((s) => {
      if (!s.result) return {};
      const editedFields =
        editedKey && !s.editedFields.includes(editedKey) ? [...s.editedFields, editedKey] : s.editedFields;
      return { result: { ...s.result, ...patch }, editedFields };
    }),

  // '후보 다시 보기': 감정 후보만 바꾸고 나머지 초안은 처음 받은 것을 그대로 쓴다
  replaceEmotions: (emotions) =>
    set((s) => ({
      result: s.result ? { ...s.result, emotions } : s.result,
      selectedEmotions: s.selectedEmotions.filter((e) => e === UNSURE_LABEL),
    })),

  // "해당없음"은 단독 선택, 나머지는 최대 3개
  toggleEmotion: (label) =>
    set((s) => {
      const { selectedEmotions: picked } = s;
      if (label === UNSURE_LABEL) {
        return { selectedEmotions: picked.includes(UNSURE_LABEL) ? [] : [UNSURE_LABEL] };
      }
      const others = picked.filter((e) => e !== UNSURE_LABEL);
      if (others.includes(label)) return { selectedEmotions: others.filter((e) => e !== label) };
      if (others.length >= MAX_EMOTIONS) return { selectedEmotions: others };
      return { selectedEmotions: [...others, label] };
    }),

  // 감정 후보 화면에서 ← 로 채팅창에 돌아왔을 때: 보관해 둔 내 글(texts)을 대화로 되살린다.
  // (캐릭터의 답은 정리 결과를 받을 때 지우는 것이 명세라 되살리지 않는다.)
  // 마지막 글에 resumed 표시를 달아 바로 "다 털어놓은 것 같아" / "더 이야기" 선택지를 보여 줄 수 있게 한다.
  restoreMessages: () =>
    set((s) => {
      if (s.messages.length > 0 || s.texts.length === 0) return {};
      const now = Date.now();
      const messages = s.texts.map((content, i) => ({
        id: nextMessageId++,
        role: 'user',
        content,
        at: now,
        local: false,
        resumed: i === s.texts.length - 1,
      }));
      return { messages, texts: [] }; // texts 는 다시 정리할 때 messages 에서 새로 만든다
    }),

  clearTexts: () => set({ texts: [] }),

  // 서버에 감정을 확정한 뒤: 원문(texts)·대화(messages)를 지우고, 하소연 단계로 돌아갈 수 없게 표시한다
  // (하소연 글은 서버 초안 요청에 상황으로 다시 필요해서 situationText 로 최근 1000자만 남긴다)
  markEmotionConfirmed: (emotionText, selectedEmotions) =>
    set((s) => ({
      emotionConfirmed: true,
      emotionText,
      selectedEmotions,
      result: { ...s.result, emotions: [] },
      situationText: s.texts.join('\n').slice(-SITUATION_MAX_LENGTH).trim(),
      texts: [],
      messages: [],
    })),

  // AI 초안을 받아 봤다고 표시 (실패하면 오류 문구를 넣는다)
  markDrafted: (key, status = true) => set((s) => ({ drafted: { ...s.drafted, [key]: status } })),

  // 서버에 확정한 뒤: 스냅샷을 남기고, 서버가 지우는 뒤 단계(요약·계획)를 우리 쪽에서도 비운다
  //   reflection 확정 → 3인칭·계획 삭제 / summary 확정 → 계획 삭제 / plan 확정 → 그대로
  confirmStep: (key, snapshot) =>
    set((s) => {
      const confirmed = { ...s.confirmed, [key]: snapshot };
      const drafted = { ...s.drafted };
      let result = s.result;
      let editedFields = s.editedFields;
      if (key === 'reflection') {
        confirmed.summary = null;
        drafted.summary = false;
        result = result && { ...result, situation: '' };
        editedFields = editedFields.filter((f) => f !== 'situation');
      }
      if (key === 'reflection' || key === 'summary') {
        confirmed.plan = null;
        drafted.plan = false;
        result = result && { ...result, plan: { if: '', then: '' } };
        editedFields = editedFields.filter((f) => f !== 'plan');
      }
      return { confirmed, drafted, result, editedFields };
    }),

  reset: () => set(initialState),
}));
