import { defaultCharacter } from '../character/CharacterPortrait';
import { useSelectedCharacterStore } from './selectedCharacter';

// 하소연 화면의 캐릭터 모션에 넘길 `character` 를 돌려준다.
// 모양은 A파트 캐릭터와 같다: { name, color, eyes, nose, mouth, eyebrows, accessory }
// 홈에서 고른 캐릭터(없으면 내 첫 캐릭터, 그것도 없으면 기본 캐릭터)가 들어 있다. → selectedCharacter.js
export function useSelectedCharacter() {
  const character = useSelectedCharacterStore((s) => s.character);
  return character ?? defaultCharacter;
}

// 화면 문구에 쓰는 캐릭터 이름 (사용자가 꾸미기에서 정한 이름, 없으면 기본 캐릭터 이름)
export function useCharacterName() {
  return useSelectedCharacter().name?.trim() || defaultCharacter.name;
}
