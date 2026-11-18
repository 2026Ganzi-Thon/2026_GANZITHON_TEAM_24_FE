import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmEmotion, getErrorMessage } from '../../features/vent/api';
import { UNSURE_LABEL } from '../../features/vent/constants';
import RestartRedirect from '../../features/vent/RestartRedirect';
import { useNickname } from '../../features/vent/profile';
import { leaveIfSessionGone } from '../../features/vent/session';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import { useGoBack } from '../../features/vent/useGoBack';
import ChatBubble from '../../features/vent/components/ChatBubble';
import ChatInput from '../../features/vent/components/ChatInput';
import EmotionChips from '../../features/vent/components/EmotionChips';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

const EMOTION_MAX_LENGTH = 40; // 서버 규칙: 감정은 40자까지

// 2단계: 감정 후보 정하기 (서버가 준 후보 중 최대 3개, 또는 "해당없음" 하나)
export default function EmotionPickPage() {
  const navigate = useNavigate();
  const goBack = useGoBack(VENT_PATHS.chat);
  const nickname = useNickname();
  const result = useVentStore((s) => s.result);
  const selected = useVentStore((s) => s.selectedEmotions);
  const toggleEmotion = useVentStore((s) => s.toggleEmotion);
  const markEmotionConfirmed = useVentStore((s) => s.markEmotionConfirmed);
  const [now] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  // 새로고침 등으로 저장된 결과가 없으면 홈으로 (안내 문구와 함께)
  if (!result) return <RestartRedirect />;

  // 고른 감정을 서버에 확정한다 ("해당없음"이면 빈 값). 서버는 감정 하나(40자까지)만 받아서 쉼표로 이어 보낸다
  const handleConfirm = async () => {
    if (confirming) return;
    setError('');
    setConfirming(true);
    try {
      const emotion = selected
        .filter((label) => label !== UNSURE_LABEL)
        .join(', ')
        .slice(0, EMOTION_MAX_LENGTH);
      const { sessionId } = useVentStore.getState();
      await confirmEmotion(sessionId, emotion);
      // 후보 다시 보기에 쓰던 원문·대화는 여기서 지운다 (서버도 이 뒤로는 받지 않는다).
      // 다만 하소연 글은 뒤 단계 AI 초안의 '상황'으로 필요해서 메모리에 최근 1000자만 남긴다 (버리기·나가기에서 삭제)
      markEmotionConfirmed(emotion);
      navigate(VENT_PATHS.calm);
    } catch (e) {
      if (leaveIfSessionGone(e, navigate)) return;
      setError(getErrorMessage(e, '감정을 저장하지 못했어. 다시 눌러줄래?'));
      setConfirming(false);
    }
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
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.choices}>
            <button
              type="button"
              className={styles.pill}
              onClick={handleConfirm}
              disabled={selected.length === 0 || confirming}
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
