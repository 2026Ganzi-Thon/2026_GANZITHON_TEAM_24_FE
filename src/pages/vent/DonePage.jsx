import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { VentFeedbackMotion } from '../../features/vent/motions';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useSelectedCharacter } from '../../features/vent/useSelectedCharacter';
import CharacterStage from '../../features/vent/components/CharacterStage';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 9단계: 완료. 버리기를 거쳐야만 들어올 수 있다 (세션 상태는 이미 비워진 뒤).
// 아래 작은 카드 2개로 기분을 고르면 가운데 캐릭터가 그 표정과 메시지로 바뀐다 (같은 카드를 다시 누르면 처음 상태).
// 선택한 기분은 어디에도 저장하지 않는다.
export default function DonePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const character = useSelectedCharacter();
  const [mood, setMood] = useState(null); // null(웃는 표정) | 'relieved' | 'uneasy'

  if (!location.state?.discarded) return <Navigate to={VENT_PATHS.chat} replace />;

  const pickMood = (value) => setMood((prev) => (prev === value ? null : value));

  return (
    <>
      <VentHeader title="완료" step={STEP_NO.done} onBack={() => navigate('/')} />
      <main className={styles.calm}>
        <h2 className={styles.calmTitle}>아 후련하다!!!</h2>
        <p className={styles.calmDesc}>기분이 어때? 조금은 나아졌어?</p>

        <div className={styles.calmStage}>
          <VentFeedbackMotion character={character} mood={mood} />
        </div>

        {/* TODO(A파트 연결): 카드 안 작은 캐릭터를 A파트 포트레이트(안도·불편 표정)로 교체 */}
        <div className={`${styles.stageActions} ${styles.moodCards}`}>
          <button
            type="button"
            className={`${styles.moodCard} ${styles.moodRelieved}`}
            aria-pressed={mood === 'relieved'}
            aria-label="마음이 편안해졌어요"
            onClick={() => pickMood('relieved')}
          >
            <CharacterStage size="sm" />
          </button>
          <button
            type="button"
            className={`${styles.moodCard} ${styles.moodUneasy}`}
            aria-pressed={mood === 'uneasy'}
            aria-label="아직 마음이 불편해요"
            onClick={() => pickMood('uneasy')}
          >
            <CharacterStage size="sm" />
          </button>
        </div>
        <PrivacyNotice />
      </main>
    </>
  );
}
