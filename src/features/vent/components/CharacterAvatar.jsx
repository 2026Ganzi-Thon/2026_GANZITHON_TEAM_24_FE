import CharacterPortrait from '../../character/CharacterPortrait';
import { useSelectedCharacter } from '../useSelectedCharacter';
import styles from './CharacterAvatar.module.css';

// 말풍선 옆 작은 캐릭터 (A파트 포트레이트, 선택한 캐릭터)
export default function CharacterAvatar() {
  const character = useSelectedCharacter();
  return (
    <span className={styles.avatar}>
      <CharacterPortrait character={character} />
    </span>
  );
}
