import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { confirmEmotion, getErrorMessage, LIMITS } from '../../features/vent/api';
import { UNSURE_LABEL } from '../../features/vent/constants';
import RestartRedirect from '../../features/vent/RestartRedirect';
import { useNickname } from '../../features/vent/profile';
import { refreshEmotions } from '../../features/vent/refreshEmotions';
import { endSession, leaveIfSessionGone } from '../../features/vent/session';
import { HOME_PATH, STEP_NO, VENT_PATHS } from '../../features/vent/steps';
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
  const reviewingEmotions = useVentStore((s) => s.reviewingEmotions);
  const goBack = useGoBack(reviewingEmotions ? HOME_PATH : VENT_PATHS.chat);
  const nickname = useNickname();
  const result = useVentStore((s) => s.result);
  const selected = useVentStore((s) => s.selectedEmotions);
  const emotionConfirmed = useVentStore((s) => s.emotionConfirmed);
  const toggleEmotion = useVentStore((s) => s.toggleEmotion);
  const markEmotionConfirmed = useVentStore((s) => s.markEmotionConfirmed);
  const [now] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [customEmotion, setCustomEmotion] = useState('');
  const [error, setError] = useState('');

  // 새로고침 등으로 저장된 결과가 없으면 홈으로 (안내 문구와 함께)
  if (!result) return <RestartRedirect />;
  if (emotionConfirmed) return <Navigate to={VENT_PATHS.calm} replace />;
  const busy = confirming || refreshing;
  const typedEmotion = customEmotion.trim();

  async function handleRefresh() {
    if (busy) return;
    setError('');
    setRefreshing(true);
    try {
      if (!(await refreshEmotions())) setError('새 후보를 가져오지 못했어요. 직접 적어도 괜찮아요.');
    } catch (e) {
      if (!leaveIfSessionGone(e, navigate)) {
        setError(getErrorMessage(e, '새 후보를 가져오지 못했어요. 잠시 뒤 다시 시도해 주세요.'));
      }
    } finally {
      setRefreshing(false);
    }
  }

  // 고른 감정을 서버에 확정한다 ("해당없음"이면 빈 값). 서버는 감정 하나(40자까지)만 받아서 쉼표로 이어 보낸다
  const handleConfirm = async () => {
    if (busy || (!typedEmotion && selected.length === 0)) return;
    setError('');
    setConfirming(true);
    try {
      const emotion = typedEmotion || selected
        .filter((label) => label !== UNSURE_LABEL)
        .join(', ')
        .slice(0, LIMITS.emotion);
      const { sessionId } = useVentStore.getState();
      await confirmEmotion(sessionId, emotion);
      if (useVentStore.getState().sessionId !== sessionId) return;
      // 후보 다시 보기에 쓰던 원문·대화는 여기서 지운다 (서버도 이 뒤로는 받지 않는다).
      // 다만 하소연 글은 뒤 단계 AI 초안의 '상황'으로 필요해서 메모리에 최근 1000자만 남긴다 (버리기·나가기에서 삭제)
      markEmotionConfirmed(emotion, typedEmotion ? [typedEmotion] : selected);
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
        onBack={reviewingEmotions ? () => {
          endSession();
          navigate(HOME_PATH, { replace: true });
        } : goBack}
      />
      <main className={styles.body}>
        <div className={styles.scroll}>
          <ChatBubble time={now} timePosition="below">
            {reviewingEmotions
              ? '하소연을 다시 적지 않아도 괜찮아. 지금 남아 있는 마음과 가장 가까운 감정을 골라볼래?'
              : `${nickname}의 이야기를 들어보니 이런 마음이 느껴졌어. 지금 ${nickname}의 마음과 가장 가까운 감정을 골라볼래? 딱 하나가 아니어도 괜찮아!`}
          </ChatBubble>
          <EmotionChips
            emotions={result.emotions ?? []}
            selected={typedEmotion ? [] : selected}
            disabled={busy}
            onToggle={(emotion) => {
              if (typedEmotion && selected.includes(emotion)) {
                setCustomEmotion('');
                return;
              }
              setCustomEmotion('');
              toggleEmotion(emotion);
            }}
          />
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
              disabled={busy || (!typedEmotion && selected.length === 0)}
            >
              다 선택했어. 👌
            </button>
            <button type="button" className={styles.pill} onClick={handleRefresh} disabled={busy}>
              {refreshing ? '감정 후보를 불러오는 중…' : '후보 다시 보기'}
            </button>
          </div>
          <PrivacyNotice />
          <ChatInput
            value={customEmotion}
            onChange={setCustomEmotion}
            onSend={handleConfirm}
            disabled={busy}
            showMic={false}
            maxLength={LIMITS.emotion}
            inputLabel="감정 직접 입력"
            placeholder="감정을 직접 입력해 주세요"
          />
        </div>
      </main>
    </>
  );
}
