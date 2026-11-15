import { create } from 'zustand';
import { MAX_EMOTIONS, UNSURE_LABEL } from './constants';

// 하소연 흐름 상태. 메모리에만 둔다 (persist, localStorage, sessionStorage 금지).
// 새로고침하면 사라지고, 나가기/버리기에서 reset()으로 통째로 비운다.
const initialState = {
  messages: [], // 하소연 대화 [{ id, role: 'user' | 'assistant', content, at, local }]
  //                local: true 는 화면에만 보이는 말풍선("더 이야기 하고 싶어!" 등). 서버로 보내지 않는다
  texts: [], // 사용자 글만 따로 보관. 감정 "선택 완료"에서 지운다
  result: null, // POST /vent/result 응답 (emotions, needs, wantedReaction, situation, plan)
  selectedEmotions: [],
  editedFields: [], // 2단계에서 사용자가 고친 칸 이름 (말풍선에 'AI 초안' 대신 '내가 고친 글' 표시용)
  loading: false,
};

let nextMessageId = 1;

export const useVentStore = create((set) => ({
  ...initialState,

  addMessage: (role, content, { local = false } = {}) =>
    set((s) => ({
      messages: [...s.messages, { id: nextMessageId++, role, content, at: Date.now(), local }],
    })),

  setLoading: (loading) => set({ loading }),

  // "다 털어놓은 것 같아" 직후: 응답 저장, AI 답장은 지우고 사용자 글만 texts로 남긴다
  commitResult: (result) =>
    set((s) => ({
      result,
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

  clearTexts: () => set({ texts: [] }),

  reset: () => set(initialState),
}));
