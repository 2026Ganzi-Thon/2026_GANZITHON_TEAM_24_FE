import { create } from 'zustand';
import { MAX_EMOTIONS, UNSURE_LABEL } from './constants';

// 하소연 흐름 상태. 메모리에만 둔다 (persist, localStorage, sessionStorage 금지).
// 새로고침하면 사라지고, 나가기/버리기에서 reset()으로 통째로 비운다.
const initialState = {
  messages: [], // 하소연 대화 [{ id, role: 'user' | 'assistant', content, at }]
  texts: [], // 사용자 글만 따로 보관. 감정 "선택 완료"에서 지운다
  result: null, // POST /vent/result 응답 (emotions, needs, wantedReaction, situation, plan)
  selectedEmotions: [],
  loading: false,
};

let nextMessageId = 1;

export const useVentStore = create((set) => ({
  ...initialState,

  addMessage: (role, content) =>
    set((s) => ({
      messages: [...s.messages, { id: nextMessageId++, role, content, at: Date.now() }],
    })),

  setLoading: (loading) => set({ loading }),

  // "다 털어놓은 것 같아" 직후: 응답 저장, AI 답장은 지우고 사용자 글만 texts로 남긴다
  commitResult: (result) =>
    set((s) => ({
      result,
      texts: [...s.texts, ...s.messages.filter((m) => m.role === 'user').map((m) => m.content)],
      messages: [],
      selectedEmotions: [],
    })),

  // '후보 다시 보기': 감정 후보만 바꾸고 나머지 초안은 처음 받은 것을 그대로 쓴다
  replaceEmotions: (emotions) =>
    set((s) => ({
      result: s.result ? { ...s.result, emotions } : s.result,
      selectedEmotions: s.selectedEmotions.filter((e) => e === UNSURE_LABEL),
    })),

  // "아직 모르겠어요"는 단독 선택, 나머지는 최대 3개
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

  clearTexts: () => set({ texts: [] }),

  reset: () => set(initialState),
}));
