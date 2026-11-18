// 하소연 흐름에서 쓰는 상수
// 닉네임을 아직 모를 때(로그인 전, 불러오는 중, 실패) 부르는 말. 실제 닉네임은 profile.js 의 useNickname()
export const FALLBACK_NICKNAME = '친구';

// 하소연 도중 새로고침해서 정리하던 내용이 사라졌을 때 홈에서 보여 주는 안내 (가이드 문구)
export const RESTART_NOTICE = '정리 내용은 저장되지 않아 처음부터 시작해요';

// 서버 세션이 만료(15분)되거나 없어져서 처음부터 다시 시작할 때 홈에서 보여 주는 안내
export const SESSION_EXPIRED_NOTICE = '시간이 지나 하소연이 끝났어요. 처음부터 시작해요';

// "더 이야기 하고 싶어!" 를 누르면 화면에만 나타나는 말풍선 (서버로 보내지 않는다)
export const MORE_TALK_LABEL = '더 이야기 하고 싶어!';
export const MORE_TALK_REPLY = '그래! 더 이야기 해보자~';

export const UNSURE_LABEL = '해당없음'; // 고르면 다른 선택은 풀리고 이것 하나만 남는다
export const MAX_EMOTIONS = 3;
export const SITUATION_MAX_LENGTH = 1000; // 서버 규칙: 초안을 만들 때 보내는 상황은 1000자까지 (하소연 글 중 가장 최근 부분)
export const CHAT_MAX_LENGTH = 1000; // 서버 규칙(CHAT_001): 빈 글이거나 1000자 초과면 거절
