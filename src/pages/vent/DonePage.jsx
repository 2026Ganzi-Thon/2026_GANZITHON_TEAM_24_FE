import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import CharacterStage from '../../features/vent/components/CharacterStage';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 9단계: 완료. 버리기를 거쳐야만 들어올 수 있다 (세션 상태는 이미 비워진 뒤).
// 큰 캐릭터와 작은 카드 2개는 A파트 캐릭터 모션 자리라 지금은 자리표시만 두고 눌리지 않는다.
export default function DonePage() {
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state?.discarded) return <Navigate to={VENT_PATHS.chat} replace />;

  return (
    <>
      <VentHeader title="완료" step={STEP_NO.done} onBack={() => navigate('/')} />
      <main className={styles.calm}>
        <h2 className={styles.calmTitle}>아 후련하다!!!</h2>
        <p className={styles.calmDesc}>기분이 어때? 조금은 나아졌어?</p>

        <div className={styles.calmStage}>
          <CharacterStage motion="happy" size="lg" />
        </div>

        {/* TODO(A파트): 작은 카드 2개의 캐릭터 모션 연결 */}
        <div className={`${styles.stageActions} ${styles.moodCards}`}>
          <div className={styles.moodCard}>
            <CharacterStage motion="relieved" size="sm" />
          </div>
          <div className={styles.moodCard}>
            <CharacterStage motion="angry" size="sm" />
          </div>
        </div>
        <PrivacyNotice />
      </main>
    </>
  );
}
