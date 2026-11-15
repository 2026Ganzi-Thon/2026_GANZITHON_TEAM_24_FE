import { Navigate, useNavigate } from 'react-router-dom';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import { useDraftEdit } from '../../features/vent/useDraftEdit';
import ChatBubble from '../../features/vent/components/ChatBubble';
import DraftBubble from '../../features/vent/components/DraftBubble';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import DraftActions from './DraftActions';
import { PLAN_NOTE } from './draftNotes';
import styles from './Vent.module.css';

// 6단계: 만약-그러면 계획 ('만약'과 '그러면'을 각각 말풍선 안에서 고칠 수 있음)
// 시안에는 버튼이 없지만 3인칭 화면과 같은 버튼을 둔다 (사용자 결정)
export default function PlanPage() {
  const navigate = useNavigate();
  const result = useVentStore((s) => s.result);
  const draft = useDraftEdit(
    'plan',
    (r) => ({ if: r.plan?.if ?? '', then: r.plan?.then ?? '' }),
    (v) => ({ plan: { if: v.if, then: v.then } }),
  );

  if (!result) return <Navigate to={VENT_PATHS.chat} replace />;

  const shown = draft.editing ? draft.values : draft.saved;

  return (
    <>
      <VentHeader
        title="만약 - 그러면 계획"
        step={STEP_NO.plan}
        onBack={() => navigate(VENT_PATHS.situation)}
      />
      <main className={styles.body}>
        <div className={styles.scroll}>
          <ChatBubble>{'감정이 다시 올라올 때 내가 선택할 행동을\n확인해 보자.'}</ChatBubble>
          <DraftBubble
            label="만약 상황"
            tag="AI 제안"
            parts={[{ key: 'if', value: shown.if, onChange: (v) => draft.setValue('if', v) }]}
            editing={draft.editing}
            edited={draft.edited}
            autoFocus
          />
          <DraftBubble
            label="그러면 행동"
            tag="AI 제안"
            parts={[{ key: 'then', value: shown.then, onChange: (v) => draft.setValue('then', v) }]}
            editing={draft.editing}
            edited={draft.edited}
          />
          <p className={styles.draftNote}>{PLAN_NOTE}</p>
        </div>

        <div className={`${styles.bottom} ${styles.bottomSafe}`}>
          <DraftActions
            editing={draft.editing}
            okLabel="이대로 좋아."
            onOk={() => navigate(VENT_PATHS.result)}
            onEdit={draft.start}
            onSave={draft.save}
            onCancel={draft.cancel}
          />
          <PrivacyNotice />
        </div>
      </main>
    </>
  );
}
