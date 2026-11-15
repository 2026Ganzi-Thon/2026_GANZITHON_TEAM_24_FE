import { together } from '../korean';
import { useCharacterName } from '../useSelectedCharacter';
import styles from './PrivacyNotice.module.css';

export default function PrivacyNotice() {
  const characterName = useCharacterName();
  return <p className={styles.notice}>{together(characterName)} 나눈 대화는 어디에도 저장되지 않아요.</p>;
}
