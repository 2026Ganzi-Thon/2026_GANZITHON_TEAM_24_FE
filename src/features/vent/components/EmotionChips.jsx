import { UNSURE_LABEL } from '../constants';
import styles from './EmotionChips.module.css';

function Chip({ label, active, unsure = false, onClick }) {
  const classes = [styles.chip, unsure ? styles.unsure : styles.emotion, active && styles.active]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={classes} aria-pressed={active} onClick={() => onClick(label)}>
      {label}
    </button>
  );
}

// 감정 후보 카드. emotions 는 서버가 준 후보, "아직 모르겠어요"는 항상 따로 붙는다.
export default function EmotionChips({ emotions, selected, onToggle }) {
  return (
    <section className={styles.card} aria-label="감정 후보">
      <h2 className={styles.title}>지금 어떤 감정에 가장 가까워?</h2>
      {emotions.length > 0 && (
        <div className={styles.chips}>
          {emotions.map((label) => (
            <Chip key={label} label={label} active={selected.includes(label)} onClick={onToggle} />
          ))}
        </div>
      )}
      <div className={styles.chips}>
        <Chip
          label={UNSURE_LABEL}
          unsure
          active={selected.includes(UNSURE_LABEL)}
          onClick={onToggle}
        />
      </div>
    </section>
  );
}
