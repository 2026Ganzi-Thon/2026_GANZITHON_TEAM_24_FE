import { TOTAL_STEPS } from '../steps';
import styles from './ProgressSteps.module.css';

// 헤더 아래 단계 진행 막대. current 칸까지 채운다.
export default function ProgressSteps({ current }) {
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-label="진행 단계"
      aria-valuemin={1}
      aria-valuemax={TOTAL_STEPS}
      aria-valuenow={current}
    >
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <span key={i} className={i < current ? styles.done : styles.todo} />
      ))}
    </div>
  );
}
