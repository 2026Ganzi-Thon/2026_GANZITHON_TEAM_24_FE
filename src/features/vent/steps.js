// 하소연 흐름 단계. 경로·제목·진행 막대 위치를 한 곳에서 관리한다.
export const VENT_PATHS = {
  chat: '/vent',
  emotions: '/vent/emotions',
  calm: '/vent/calm',
  reaction: '/vent/reaction', // 원했던 반응
  situation: '/vent/situation', // 3인칭 돌아보기
  plan: '/vent/plan', // 만약-그러면 계획
  result: '/vent/result', // 결과
  discard: '/vent/discard', // 버리기
  done: '/vent/done', // 완료
  deleteFailed: '/vent/delete-failed', // 삭제 실패
};

// 진행 막대 칸 수. Figma 막대가 칸 42px + 간격 3px로 402px을 채우는 걸 계산하면 9칸이고,
// 시안에서도 원했던 반응 4칸 → 3인칭 5칸 → 만약-그러면 6칸 … 완료 9칸으로 채워진다.
export const TOTAL_STEPS = 9;

export const STEP_NO = {
  chat: 1,
  emotions: 2,
  calm: 3,
  reaction: 4,
  situation: 5,
  plan: 6,
  result: 7,
  discard: 8,
  done: 9,
};

export const CRISIS_PATH = '/vent/crisis'; // 위기지원안내 (/vent 응답이 risk: DANGER 일 때)
export const AFTER_CALM_PATH = VENT_PATHS.reaction; // 진정 다음 화면
