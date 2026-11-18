import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIMITS, confirmPlan, getErrorMessage, suggestPlan } from '../../features/vent/api';
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
import { PLAN_NOTE } from './draftNotes';
import styles from './Vent.module.css';

// 6단계: 만약-그러면 계획 ('만약'과 '그러면'을 각각 말풍선 안에서 고칠 수 있음)
// 시안에는 버튼이 없지만 3인칭 화면과 같은 버튼을 둔다 (사용자 결정)
export default function PlanPage() {
  const result = useVentStore((s) => s.result);

  if (!result) return <RestartRedirect />;
  return <PlanLoader />;
}

function PlanLoader() {
  const goBack = useGoBack(VENT_PATHS.situation);
  const { loading, error } = useSuggestion(
    'plan',
    (sessionId) => suggestPlan(sessionId),
    (data) =>
      useVentStore.getState().updateResult({ plan: { if: data.ifSituation ?? '', then: data.thenAction ?? '' } }),
  );

  if (loading) {
    return (
      <>
        <VentHeader title="만약 - 그러면 계획" step={STEP_NO.plan} onBack={goBack} />
        <main className={styles.body}>
          <LoadingOverlay message="앞으로의 계획을 생각하는 중이야…" />
        </main>
      </>
    );
  }
  return <PlanDraft aiError={error} goBack={goBack} />;
}

function PlanDraft({ aiError, goBack }) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const draft = useDraftEdit(
    'plan',
    (r) => ({ if: r.plan?.if ?? '', then: r.plan?.then ?? '' }),
    (v) => ({ plan: { if: v.if, then: v.then } }),
  );

  const shown = draft.editing ? draft.values : draft.saved;

  // "이대로 좋아." → 서버에 확정하고 결과로 (같은 내용을 이미 확정했으면 다시 보내지 않는다)
  const handleOk = async () => {
    if (confirming) return;
    setError('');
    const { result, sessionId, confirmed, confirmStep } = useVentStore.getState();
    const ifSituation = (result.plan?.if ?? '').trim();
    const thenAction = (result.plan?.then ?? '').trim();
    if (!ifSituation || !thenAction) {
      setError('만약 상황과 그러면 행동을 모두 적어 줘.');
      return;
    }
    setConfirming(true);
    try {
      const snapshot = JSON.stringify({ ifSituation, thenAction });
      if (confirmed.plan !== snapshot) {
        await confirmPlan(sessionId, { ifSituation, thenAction });
        confirmStep('plan', snapshot);
      }
      navigate(VENT_PATHS.result);
    } catch (e) {
      if (leaveIfSessionGone(e, navigate)) return;
      setError(getErrorMessage(e, '저장하지 못했어. 다시 눌러줄래?'));
      setConfirming(false);
    }
  };

  return (
    <>
      <VentHeader title="만약 - 그러면 계획" step={STEP_NO.plan} onBack={goBack} />
      <main className={styles.body}>
        <div className={styles.scroll}>
          <ChatBubble>{'감정이 다시 올라올 때 내가 선택할 행동을\n확인해 보자.'}</ChatBubble>
          <DraftBubble
            label="만약 상황"
            tag="AI 제안"
            parts={[
              { key: 'if', value: shown.if, onChange: (v) => draft.setValue('if', v), maxLength: LIMITS.planIf },
            ]}
            editing={draft.editing}
            edited={draft.edited}
            autoFocus
          />
          <DraftBubble
            label="그러면 행동"
            tag="AI 제안"
            parts={[
              { key: 'then', value: shown.then, onChange: (v) => draft.setValue('then', v), maxLength: LIMITS.planThen },
            ]}
            editing={draft.editing}
            edited={draft.edited}
          />
          <p className={styles.draftNote}>{PLAN_NOTE}</p>
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
