import { Navigate, useNavigate } from 'react-router-dom';
import { formatEmotions } from '../../features/vent/formatEmotions';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import ChatBubble from '../../features/vent/components/ChatBubble';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 7단계: 결과 확인. 지금까지 고른 감정과 (고친) 초안을 카드로 모아 보여 준다.
export default function ResultPage() {
  const navigate = useNavigate();
  const result = useVentStore((s) => s.result);
  const selected = useVentStore((s) => s.selectedEmotions);

  if (!result) return <Navigate to={VENT_PATHS.chat} replace />;

  // 비어 있는 칸(AI 실패 후 적지 않음)은 회색 안내로
  const text = (value) =>
    value?.trim() ? value : <span className={styles.resultEmpty}>적지 않았어요</span>;

  return (
    <>
      <VentHeader title="결과" step={STEP_NO.result} onBack={() => navigate(VENT_PATHS.plan)} />
      <main className={styles.body}>
        <div className={`${styles.scroll} ${styles.resultScroll}`}>
          <ChatBubble>지금까지 내용을 정리해 봤어!</ChatBubble>

          <section className={styles.resultCard}>
            <h2 className={styles.resultTitle}>지금 느끼는 감정</h2>
            <p className={styles.resultEmotion}>{formatEmotions(selected, styles.resultHighlight)}</p>
          </section>

          <section className={styles.resultCard}>
            <h2 className={styles.resultTitle}>필요했던, 원했던 반응</h2>
            <div className={styles.resultText}>
              {(result.needs ?? []).map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p>{text(result.wantedReaction)}</p>
            </div>
          </section>

          <section className={styles.resultCard}>
            <h2 className={styles.resultTitle}>3인칭으로 돌아보기</h2>
            <p className={styles.resultText}>{text(result.situation)}</p>
          </section>

          <section className={styles.resultCard}>
            <h2 className={styles.resultTitle}>만약 상황</h2>
            <p className={`${styles.resultText} ${styles.resultCenter}`}>{text(result.plan?.if)}</p>
            <h2 className={`${styles.resultTitle} ${styles.resultTitleGap}`}>그러면 행동</h2>
            <p className={styles.resultText}>{text(result.plan?.then)}</p>
          </section>

          <button
            type="button"
            className={`${styles.pill} ${styles.pillPrimary} ${styles.resultButton}`}
            onClick={() => navigate(VENT_PATHS.discard)}
          >
            감정 버리러 가기 →
          </button>
          <PrivacyNotice />
        </div>
      </main>
    </>
  );
}
