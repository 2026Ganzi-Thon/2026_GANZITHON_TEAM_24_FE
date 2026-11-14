// 하소연 흐름 단계. 경로·제목·진행 막대 위치를 한 곳에서 관리한다.
export const VENT_PATHS = {
  chat: '/vent',
  emotions: '/vent/emotions',
  calm: '/vent/calm',
};

// 진행 막대 칸 수. Figma 막대가 칸 42px + 간격 3px로 402px을 채우는 걸 계산하면 9칸이고,
// 백엔드 가이드의 단계(하소연, 감정 후보, 진정, 욕구, 원했던 반응, 3인칭, 만약-그러면, 결과, 버리기)도 9개다.
export const TOTAL_STEPS = 9;

export const STEP_NO = {
  chat: 1,
  emotions: 2,
  calm: 3,
};

export const CRISIS_PATH = '/vent/crisis'; // 위기지원안내 (/vent 응답이 risk: DANGER 일 때)

// TODO: 아직 만들지 않은 화면. 만들면 경로를 채운다.
export const AFTER_CALM_PATH = null; // 진정 다음 화면 (원했던 반응)
