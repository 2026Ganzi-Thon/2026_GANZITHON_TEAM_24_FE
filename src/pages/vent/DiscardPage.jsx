import { useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { NICKNAME } from '../../features/vent/constants';
import { discardSession } from '../../features/vent/discardSession';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import CharacterStage from '../../features/vent/components/CharacterStage';
import DiscardMethods from '../../features/vent/components/DiscardMethods';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 8단계: 감정 버리기. 방법을 고르면 세션 상태를 통째로 비우고 완료(또는 삭제 실패)로 간다.
export default function DiscardPage() {
  const navigate = useNavigate();
  const result = useVentStore((s) => s.result);
  const leavingRef = useRef(false); // 비우는 중에는 아래 "결과 없음" 가드가 끼어들지 않게

  if (!result && !leavingRef.current) return <Navigate to={VENT_PATHS.chat} replace />;

  const handleSelect = (method) => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    // TODO(A파트): 고른 방법(method: tear | burn | evaporate)의 버리기 모션을 재생한 뒤 아래로 이동
    const ok = discardSession();
    if (ok) {
      navigate(VENT_PATHS.done, { replace: true, state: { discarded: true, method } });
    } else {
      navigate(VENT_PATHS.deleteFailed, { replace: true });
    }
  };

  return (
    <>
      <VentHeader title="버리기" step={STEP_NO.discard} onBack={() => navigate(VENT_PATHS.result)} />
      <main className={styles.calm}>
        <h2 className={styles.calmTitle}>자 이제 이 쓰레기 같은 감정을 버려보자</h2>
        <p className={styles.calmDesc}>{`${NICKNAME}는 어떻게 해소하고 싶어? 방법을 선택해 봐.`}</p>

        <div className={styles.calmStage}>
          <CharacterStage motion="sly" size="lg" />
        </div>

        <div className={styles.stageActions}>
          <DiscardMethods onSelect={handleSelect} />
        </div>
        <PrivacyNotice />
      </main>
    </>
  );
}
