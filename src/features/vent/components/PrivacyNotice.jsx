import { CHARACTER_NAME } from '../constants';
import styles from './PrivacyNotice.module.css';

export default function PrivacyNotice() {
  return <p className={styles.notice}>{CHARACTER_NAME}와 나눈 대화는 어디에도 저장되지 않아요.</p>;
}
