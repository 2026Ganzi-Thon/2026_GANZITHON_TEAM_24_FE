import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIMITS, confirmSummary, getErrorMessage, suggestSummary } from '../../features/vent/api';
import RestartRedirect from '../../features/vent/RestartRedirect';
import { leaveIfSessionGone } from '../../features/vent/session';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import { useGoBack } from '../../features/vent/useGoBack';
import { useDraftEdit } from '../../features/vent/useDraftEdit';
import { useSuggestion } from '../../features/vent/useSuggestion';
import ChatBubble from '../../features/vent/components/ChatBubble';
import DraftBubble from '../../features/vent/components/DraftBubble';
import LoadingOverlay from '../../features/vent/components/LoadingOverlay';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import DraftActions from './DraftActions';
import { DRAFT_NOTE } from './draftNotes';
import styles from './Vent.module.css';

// 5단계: 3인칭 돌아보기 (서버가 확정한 반응을 바탕으로 만든 situation 정리를 말풍선 안에서 고칠 수 있음)
export default function SituationPage() {
  const result = useVentStore((s) => s.result);

  if (!result) return <RestartRedirect />;
  return <SituationLoader />;
}

function SituationLoader() {
  const goBack = useGoBack(VENT_PATHS.reaction);
  const { loading, error } = useSuggestion(
    'summary',
    (sessionId) => suggestSummary(sessionId),
    (summary) => useVentStore.getState().updateResult({ situation: summary ?? '' }),
  );

  if (loading) {
    return (
      <>
        <VentHeader title="3인칭 돌아보기" step={STEP_NO.situation} onBack={goBack} />
        <main className={styles.body}>
          <LoadingOverlay message="이야기를 멀리서 바라보는 중이야…" />
        </main>
      </>
    );
  }
  return <SituationDraft aiError={error} goBack={goBack} />;
}

function SituationDraft({ aiError, goBack }) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const draft = useDraftEdit(
    'situation',
    (r) => ({ situation: r.situation ?? '' }),
    (v) => ({ situation: v.situation }),
  );

  const shown = draft.editing ? draft.values : draft.saved;

  // "이대로 좋아." → 서버에 확정 (같은 내용을 이미 확정했으면 다시 보내지 않는다)
  const handleOk = async () => {
    if (confirming) return;
    setError('');
    const { result, sessionId, confirmed, confirmStep } = useVentStore.getState();
    const summary = (result.situation ?? '').trim();
    if (!summary) {
      setError('3인칭 정리를 적어 줘.');
      return;
    }
    setConfirming(true);
    try {
      if (confirmed.summary !== summary) {
        await confirmSummary(sessionId, summary);
        confirmStep('summary', summary);
      }
      navigate(VENT_PATHS.plan);
    } catch (e) {
      if (leaveIfSessionGone(e, navigate)) return;
      setError(getErrorMessage(e, '저장하지 못했어. 다시 눌러줄래?'));
      setConfirming(false);
    }
  };

  return (
    <>
      <VentHeader title="3인칭 돌아보기" step={STEP_NO.situation} onBack={goBack} />
      <main className={styles.body}>
        <div className={styles.scroll}>
          <ChatBubble>나의 이야기를 잠깐 멀리서 바라볼까?</ChatBubble>
          <DraftBubble
            label="3인칭으로 돌아보기"
            parts={[
              {
                key: 'situation',
                value: shown.situation,
                onChange: (v) => draft.setValue('situation', v),
                maxLength: LIMITS.summary,
              },
            ]}
            editing={draft.editing}
            edited={draft.edited}
            autoFocus
          />
          <p className={styles.draftNote}>{DRAFT_NOTE}</p>
        </div>

        <div className={`${styles.bottom} ${styles.bottomSafe}`}>
          {(error || aiError) && (
            <p className={styles.error} role="alert">
              {error || aiError}
            </p>
          )}
          <DraftActions
            editing={draft.editing}
            okLabel="이대로 좋아."
            onOk={handleOk}
            onEdit={draft.start}
            onSave={draft.save}
            onCancel={draft.cancel}
            disabled={confirming}
          />
          <PrivacyNotice />
        </div>
      </main>
    </>
  );
}
