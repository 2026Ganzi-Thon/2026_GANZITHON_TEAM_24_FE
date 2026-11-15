import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestartRedirect from '../../features/vent/RestartRedirect';
import { discardSession } from '../../features/vent/discardSession';
import { topic } from '../../features/vent/korean';
import { useNickname } from '../../features/vent/profile';
import { VentDisposalMotion } from '../../features/vent/motions';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import { useGoBack } from '../../features/vent/useGoBack';
import { useSelectedCharacter } from '../../features/vent/useSelectedCharacter';
import DiscardMethods from '../../features/vent/components/DiscardMethods';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentBackdrop from '../../features/vent/components/VentBackdrop';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 8단계: 감정 버리기. 방법을 고르면 모션이 재생되고, 모션이 끝나면 세션 상태를 통째로 비우고 완료(또는 삭제 실패)로 간다.
// 모션 컴포넌트가 "사라질 화면 전체(배경 포함)"를 감싸므로 배경(VentBackdrop)도 이 안에서 그린다.
export default function DiscardPage() {
  const navigate = useNavigate();
  const goBack = useGoBack(VENT_PATHS.result);
  const result = useVentStore((s) => s.result);
  const character = useSelectedCharacter();
  const nickname = useNickname();
  const [method, setMethod] = useState(null); // null(대기) | 'tear' | 'burn' | 'evaporate'
  const leavingRef = useRef(false); // 비우는 중에는 아래 "결과 없음" 가드가 끼어들지 않게

  if (!result && !leavingRef.current) return <RestartRedirect />;

  // 모션이 끝난 뒤에 비운다 (재생 중에는 화면 내용이 그대로 보여야 하므로)
  const handleComplete = (usedMethod) => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    if (discardSession()) {
      navigate(VENT_PATHS.done, { replace: true, state: { discarded: true, method: usedMethod } });
    } else {
      navigate(VENT_PATHS.deleteFailed, { replace: true });
    }
  };

  return (
    <VentDisposalMotion
      character={character}
      method={method}
      onComplete={handleComplete}
      className={styles.discardMotion}
    >
      <div className={styles.discardScreen}>
        <VentBackdrop />
        <VentHeader title="버리기" step={STEP_NO.discard} onBack={goBack} />
        <main className={styles.calm}>
          <h2 className={styles.calmTitle}>자 이제 이 쓰레기 같은 감정을 버려보자</h2>
          <p className={styles.calmDesc}>{`${topic(nickname)} 어떻게 해소하고 싶어? 방법을 선택해 봐.`}</p>

          {/* 큰 캐릭터는 모션 컴포넌트가 이 화면 가운데에 그린다. 여기는 자리만 비워 둔다 */}
          <div className={styles.calmStage} />

          <div className={styles.stageActions}>
            <DiscardMethods onSelect={setMethod} disabled={method !== null} />
          </div>
          <PrivacyNotice />
        </main>
      </div>
    </VentDisposalMotion>
  );
}
