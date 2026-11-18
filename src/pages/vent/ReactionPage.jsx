import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIMITS, confirmReflection, getErrorMessage, suggestNeeds } from '../../features/vent/api';
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

// 4단계: 원했던 반응 확인. 서버가 만든 AI 초안(필요했던 것 needs, 원했던 반응)을 말풍선 안에서 고칠 수 있다.
// 초안은 하소연 글(situationText)을 상황으로 보내 받고, "맞아."를 누르면 서버에 확정한다.
export default function ReactionPage() {
  const result = useVentStore((s) => s.result);

  // 새로고침 등으로 저장된 결과가 없으면 처음부터
  if (!result) return <RestartRedirect />;
  return <ReactionLoader />;
}

// 초안을 받아 오는 동안 로딩을 보여 주고, 끝난 뒤에 화면 본문을 그린다 (본문이 처음부터 채워진 값으로 열리게)
function ReactionLoader() {
  const goBack = useGoBack(VENT_PATHS.calm);
  const { loading, error } = useSuggestion(
    'reaction',
    (sessionId) => suggestNeeds(sessionId, { situation: useVentStore.getState().situationText }),
    (data) =>
      useVentStore.getState().updateResult({ needs: data.needs ?? [], wantedReaction: data.desiredResponse ?? '' }),
  );

  if (loading) {
    return (
      <>
        <VentHeader title="원했던 반응" step={STEP_NO.reaction} onBack={goBack} />
        <main className={styles.body}>
          <LoadingOverlay message="네 이야기를 정리하고 있어…" />
        </main>
      </>
    );
  }
  return <ReactionDraft aiError={error} goBack={goBack} />;
}

function ReactionDraft({ aiError, goBack }) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const draft = useDraftEdit(
    'reaction',
    // needs 는 문장 배열이라 한 줄에 한 문장씩 이어 붙여 고치고, 저장할 때 다시 줄 단위로 나눈다
    (r) => ({ needs: (r.needs ?? []).join('\n'), wantedReaction: r.wantedReaction ?? '' }),
    (v) => ({
      needs: v.needs
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      wantedReaction: v.wantedReaction,
    }),
  );

  const shown = draft.editing ? draft.values : draft.saved;

  // "맞아." → 서버에 확정. 같은 내용을 이미 확정했으면 다시 보내지 않는다(서버가 뒤 단계를 지우므로)
  const handleOk = async () => {
    if (confirming) return;
    setError('');
    const { result, situationText, emotionText, sessionId, confirmed, confirmStep } = useVentStore.getState();
    const body = {
      situation: situationText,
      emotion: emotionText,
      need: (result.needs ?? []).join(', '),
      desiredResponse: result.wantedReaction ?? '',
    };
    if (!body.situation) {
      setError('이야기를 찾지 못했어. 처음부터 다시 해줄래?');
      return;
    }
    setConfirming(true);
    try {
      const snapshot = JSON.stringify(body);
      if (confirmed.reflection !== snapshot) {
        await confirmReflection(sessionId, body);
        confirmStep('reflection', snapshot);
      }
      navigate(VENT_PATHS.situation);
    } catch (e) {
      if (leaveIfSessionGone(e, navigate)) return;
      setError(getErrorMessage(e, '저장하지 못했어. 다시 눌러줄래?'));
      setConfirming(false);
    }
  };

  return (
    <>
      <VentHeader title="원했던 반응" step={STEP_NO.reaction} onBack={goBack} />
      <main className={styles.body}>
        <div className={styles.scroll}>
          <ChatBubble>{'내가 직접 정리를 해봤어!!\n틀린 부분이 있다면 직접 수정해도 괜찮아~'}</ChatBubble>
          <DraftBubble
            label="필요했던, 원했던 반응"
            parts={[
              {
                key: 'needs',
                label: '필요했던 것',
                value: shown.needs,
                onChange: (v) => draft.setValue('needs', v),
                maxLength: LIMITS.need - 20, // 줄바꿈 대신 ', '로 이어 보내서 조금 여유를 둔다
              },
              {
                key: 'wantedReaction',
                label: '원했던 반응',
                value: shown.wantedReaction,
                onChange: (v) => draft.setValue('wantedReaction', v),
                maxLength: LIMITS.desiredResponse,
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
            okLabel="맞아."
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
