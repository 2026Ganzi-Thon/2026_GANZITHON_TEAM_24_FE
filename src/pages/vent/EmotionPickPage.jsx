import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestartRedirect from '../../features/vent/RestartRedirect';
import { useNickname } from '../../features/vent/profile';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import { useGoBack } from '../../features/vent/useGoBack';
import ChatBubble from '../../features/vent/components/ChatBubble';
import ChatInput from '../../features/vent/components/ChatInput';
import EmotionChips from '../../features/vent/components/EmotionChips';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 2단계: 감정 후보 정하기 (서버가 준 후보 중 최대 3개, 또는 "해당없음" 하나)
export default function EmotionPickPage() {
  const navigate = useNavigate();
  const goBack = useGoBack(VENT_PATHS.chat);
  const nickname = useNickname();
  const result = useVentStore((s) => s.result);
  const selected = useVentStore((s) => s.selectedEmotions);
  const toggleEmotion = useVentStore((s) => s.toggleEmotion);
  const clearTexts = useVentStore((s) => s.clearTexts);
  const [now] = useState(() => Date.now());

  // 새로고침 등으로 저장된 결과가 없으면 홈으로 (안내 문구와 함께)
  if (!result) return <RestartRedirect />;

  const handleConfirm = () => {
    clearTexts(); // 후보 다시 보기에 쓰던 원문은 여기서 지운다
    navigate(VENT_PATHS.calm);
  };

  return (
    <>
      <VentHeader
        title="감정 후보 정하기"
        step={STEP_NO.emotions}
        onBack={goBack}
      />
      <main className={styles.body}>
        <div className={styles.scroll}>
          <ChatBubble time={now} timePosition="below">
            {`${nickname}의 이야기를 들어보니 이런 마음이 느껴졌어. 지금 ${nickname}의 마음과 가장 가까운 감정을 골라볼래? 딱 하나가 아니어도 괜찮아!`}
          </ChatBubble>
          <EmotionChips emotions={result.emotions ?? []} selected={selected} onToggle={toggleEmotion} />
          <p className={styles.hint}>
            {(result.emotions ?? []).length > 0
              ? 'AI가 제안한 감정이에요. 꼭 맞지 않아도 괜찮아요.'
              : '감정을 찾지 못했어요. "해당없음"을 골라도 괜찮아요.'}
          </p>
        </div>

        <div className={styles.bottom}>
          <div className={styles.choices}>
            <button
              type="button"
              className={styles.pill}
              onClick={handleConfirm}
              disabled={selected.length === 0}
            >
              다 선택했어. 👌
            </button>
          </div>
          <PrivacyNotice />
          {/* TODO: "직접 입력해주세요"는 시안에만 있고 동작이 확정되지 않아 막아 둔다 */}
          <ChatInput value="" inputDisabled placeholder="직접 입력해주세요" />
        </div>
      </main>
    </>
  );
}
