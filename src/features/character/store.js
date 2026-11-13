import { create } from 'zustand';

// 공통 배경(AppBackground)이 읽는 값만 잡아둠.
// 캐릭터 이름·색상·눈코입 등은 A파트가 확장한다.
export const useCharacterStore = create((set) => ({
  backgroundId: 'default',
  setBackground: (backgroundId) => set({ backgroundId }),
}));
