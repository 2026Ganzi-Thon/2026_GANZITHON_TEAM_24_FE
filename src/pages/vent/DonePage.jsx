import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { VentFeedbackMotion, VentMoodFace } from '../../features/vent/motions';
import { getErrorMessage, suggestEmotions } from '../../features/vent/api';
import { endSession, ensureSession } from '../../features/vent/session';
import { useVentStore } from '../../features/vent/store';
import { HOME_PATH, STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useSelectedCharacter } from '../../features/vent/useSelectedCharacter';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 9단계: 완료. 버리기를 거쳐야만 들어올 수 있다 (세션 상태는 이미 비워진 뒤).
// 편안하면 홈으로, 불편하면 감정부터 다시 살펴볼지 물어본다.
// 이전 세션은 삭제됐으므로 이어가기는 현재 기분으로 새 세션을 연다.
const REVIEW_TEXT = '하소연과 감정 정리를 마쳤지만 아직 마음이 불편해요. 지금 남아 있는 감정을 다시 살펴보고 싶어요.';

export default function DonePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const character = useSelectedCharacter();
  const [mood, setMood] = useState(null); // null(웃는 표정) | 'relieved' | 'uneasy'
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  if (!location.state?.discarded) return <Navigate to={VENT_PATHS.chat} replace />;

  const goHome = () => {
    endSession();
    navigate(HOME_PATH, { replace: true });
  };

  async function reviewEmotions() {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const sessionId = await ensureSession();
      const data = await suggestEmotions(sessionId, [REVIEW_TEXT]);
      if (useVentStore.getState().sessionId !== sessionId) return;
      useVentStore.getState().startEmotionReview(data.candidates, REVIEW_TEXT);
      navigate(VENT_PATHS.emotions, { replace: true });
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(getErrorMessage(e, '감정을 다시 살펴보지 못했어요. 잠시 후 다시 눌러 주세요.'));
        setPending(false);
      }
    }
  }

  return (
    <>
      <VentHeader title="완료" step={STEP_NO.done} onBack={goHome} />
      <main className={styles.calm}>
        <h2 className={styles.calmTitle}>{mood === 'uneasy' ? '아직 마음이 불편하구나' : '아 후련하다!!!'}</h2>
        <p className={styles.calmDesc} aria-live="polite">
          {mood === 'uneasy' ? '더 이야기하고 싶어? 지금 남아 있는 감정부터 같이 살펴보자.' : '기분이 어때? 조금은 나아졌어?'}
        </p>

        <div className={styles.calmStage}>
          <VentFeedbackMotion character={character} mood={mood} />
        </div>

        {mood === 'uneasy' ? (
          <div className={`${styles.stageActions} ${styles.choices}`}>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="button" className={`${styles.pill} ${styles.pillPrimary}`}
              onClick={reviewEmotions} disabled={pending}>
              {pending ? '지금 마음을 살펴보고 있어…' : '응, 감정부터 다시 살펴볼래'}
            </button>
            <button type="button" className={styles.pill} onClick={goHome}>
              아니, 오늘은 여기까지 할래
            </button>
          </div>
        ) : <div className={`${styles.stageActions} ${styles.moodCards}`}>
          <button
            type="button"
            className={`${styles.moodCard} ${styles.moodRelieved}`}
            aria-pressed={mood === 'relieved'}
            aria-label="마음이 편안해졌어요"
            onClick={goHome}
          >
            <VentMoodFace character={character} mood="relieved" className={styles.moodFace} />
          </button>
          <button
            type="button"
            className={`${styles.moodCard} ${styles.moodUneasy}`}
            aria-pressed={mood === 'uneasy'}
            aria-label="아직 마음이 불편해요"
            onClick={() => setMood('uneasy')}
          >
            <VentMoodFace character={character} mood="uneasy" className={styles.moodFace} />
          </button>
        </div>}
        <PrivacyNotice />
      </main>
    </>
  );
}
