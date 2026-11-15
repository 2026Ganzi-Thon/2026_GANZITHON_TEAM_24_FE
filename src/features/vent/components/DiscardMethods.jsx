import methodsSprite from '../../../assets/vent/discard-methods.png';
import styles from './DiscardMethods.module.css';

// 감정 버리기 방법 3개. 아이콘은 Figma 스프라이트 한 장(찢기·태우기·증발)을 시안과 같은 비율로 잘라 쓴다.
export const DISCARD_METHODS = [
  { id: 'tear', label: '찢기', icon: styles.iconTear },
  { id: 'burn', label: '태우기', icon: styles.iconBurn },
  { id: 'evaporate', label: '증발시키기', icon: styles.iconEvaporate },
];

export default function DiscardMethods({ onSelect, disabled = false }) {
  return (
    <div className={styles.methods}>
      {DISCARD_METHODS.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          className={styles.method}
          onClick={() => onSelect(id)}
          disabled={disabled}
        >
          <span className={styles.card}>
            <span className={`${styles.icon} ${icon}`} aria-hidden="true">
              <img src={methodsSprite} alt="" />
            </span>
          </span>
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </div>
  );
}
