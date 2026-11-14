import styles from './LoadingOverlay.module.css';

// AI 응답을 기다리는 동안(최대 30초) 화면을 덮고 중복 클릭을 막는다
export default function LoadingOverlay({ message }) {
  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <p className={styles.message}>{message}</p>
    </div>
  );
}
