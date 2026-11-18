import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeCalming, getErrorMessage } from '../../features/vent/api';
import RestartRedirect from '../../features/vent/RestartRedirect';
import { leaveIfSessionGone } from '../../features/vent/session';
import { AFTER_CALM_PATH, STEP_NO } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import { VentBreathingMotion } from '../../features/vent/motions';
import { useSelectedCharacter } from '../../features/vent/useSelectedCharacter';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 3단계: 진정하기 (API 없음, 고정 문장, 건너뛰기 가능)
export default function CalmPage() {
  const navigate = useNavigate();
  const result = useVentStore((s) => s.result);
  const selected = useVentStore((s) => s.selectedEmotions);
  const character = useSelectedCharacter();
  const [retried, setRetried] = useState(false); // "아니 아직.." 을 눌렀는지
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');

  // 앞 단계를 거치지 않았거나 새로고침했으면 처음부터 (감정 후보 화면과 같은 규칙)
  if (!result || selected.length === 0) return <RestartRedirect />;

  // "진정 됐어!" → 서버에 진정 완료를 알리고 다음 화면(원했던 반응)으로
  const handleCalm = async () => {
    if (completing) return;
    setError('');
    setCompleting(true);
    try {
      await completeCalming(useVentStore.getState().sessionId, false);
      if (AFTER_CALM_PATH) navigate(AFTER_CALM_PATH);
    } catch (e) {
      if (leaveIfSessionGone(e, navigate)) return;
      setError(getErrorMessage(e, '잠깐 문제가 생겼어. 다시 눌러줄래?'));
      setCompleting(false);
    }
  };

  return (
    <>
      {/* 감정을 확정한 뒤에는 서버가 이전 단계로 되돌릴 수 없어서 ← 를 두지 않는다 */}
      <VentHeader title="진정하기" step={STEP_NO.calm} />
      <main className={styles.calm}>
        <h2 className={styles.calmTitle}>한 걸음 물러서서 깊게 숨 쉬어 보자</h2>
        <p className={styles.calmDesc} aria-live="polite">
          {retried ? (
            '괜찮아, 천천히 한 번 더 숨 쉬어 보자'
          ) : (
            <>
              지금 느낀 감정들이
              <br />
              잠시 멈춰 생각했을 때 어떤 모습이야?
            </>
          )}
        </p>

        <div className={styles.calmStage}>
          <VentBreathingMotion character={character} />
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.calmActions}>
          <button
            type="button"
            className={`${styles.pill} ${styles.pillPrimary}`}
            onClick={handleCalm}
            disabled={completing}
          >
            진정 됐어!
          </button>
          {/* "아니 아직.." 은 한 번만 보인다. 누른 뒤에는 "진정 됐어!" 만 남는다 */}
          {!retried && (
            <button
              type="button"
              className={`${styles.pill} ${styles.pillOutline}`}
              onClick={() => setRetried(true)}
            >
              아니 아직..
            </button>
          )}
        </div>
        <PrivacyNotice />
      </main>
    </>
  );
}
