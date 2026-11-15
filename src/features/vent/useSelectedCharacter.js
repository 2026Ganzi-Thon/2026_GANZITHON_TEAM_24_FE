// 하소연 화면의 캐릭터 모션에 넘길 `character` 를 돌려준다.
// 모양은 A파트(CharacterPortrait 의 defaultCharacter)와 같다: { name, color, eyes, nose, mouth, eyebrows, accessory }
//
// TODO(A파트 연결): 지금은 임시 상수다. A파트가 정하는 출처로 교체한다.
//   - A파트 홈은 선택한 캐릭터를 로컬 상태로 들고 있고 다른 화면에는 Link state={{ characterId }} 로 넘긴다.
//     하소연 화면으로 어떻게 넘길지(router state, store 등) A파트와 합의해서 이 훅 안만 바꾼다.
//   - 기본 캐릭터(말랑이)는 서버에 없고 프론트 고정값이다.
const PLACEHOLDER_CHARACTER = {
  name: '말랑이',
  color: 'PEACH',
  eyes: 'STYLE_1',
  nose: 'DEFAULT',
  mouth: 'DEFAULT',
  eyebrows: 'DEFAULT',
  accessory: 'NIGHTCAP',
};

export function useSelectedCharacter() {
  return PLACEHOLDER_CHARACTER;
}
