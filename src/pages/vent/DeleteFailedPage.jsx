import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import retryIcon from '../../assets/vent/retry.svg';
import { discardSession } from '../../features/vent/discardSession';
import { VENT_PATHS } from '../../features/vent/steps';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 삭제 실패: 감정 버리기에서 세션 상태를 비우지 못했을 때. 다시 시도하면 한 번 더 비운다.
export default function DeleteFailedPage() {
  const navigate = useNavigate();
  const [failedAgain, setFailedAgain] = useState(false);

  const handleRetry = () => {
    if (discardSession()) {
      navigate(VENT_PATHS.done, { replace: true, state: { discarded: true } });
    } else {
      setFailedAgain(true);
    }
  };

  return (
    <>
      <VentHeader />
      <main className={styles.failed}>
        <h2 className={styles.failedTitle}>임시 데이터 삭제에 실패했어요</h2>
        <p className={styles.failedDesc}>일시적인 오류입니다. 다시 시도해주세요</p>
        <button type="button" className={styles.retry} onClick={handleRetry} aria-label="다시 시도">
          <img src={retryIcon} alt="" width="48" height="48" />
        </button>
        <p className={styles.failedAgain} aria-live="polite">
          {failedAgain ? '아직 지우지 못했어요. 잠시 뒤 다시 눌러 주세요.' : ''}
        </p>
      </main>
    </>
  );
}
