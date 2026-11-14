// 하소연 흐름에서 쓰는 상수
export const NICKNAME = '선우'; // TODO: 로그인한 사용자 닉네임(GET /users/me)으로 교체
export const CHARACTER_NAME = '토로'; // TODO: 선택한 캐릭터 이름(A파트 store)으로 교체

// "더 이야기 하고 싶어!" 를 누르면 화면에만 나타나는 말풍선 (서버로 보내지 않는다)
export const MORE_TALK_LABEL = '더 이야기 하고 싶어!';
export const MORE_TALK_REPLY = '그래! 더 이야기 해보자~';

export const UNSURE_LABEL = '해당없음'; // 고르면 다른 선택은 풀리고 이것 하나만 남는다
export const MAX_EMOTIONS = 3;
export const CHAT_MAX_LENGTH = 1000; // 서버 규칙(CHAT_001): 빈 글이거나 1000자 초과면 거절
