import { Navigate, useNavigate } from 'react-router-dom';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import { useDraftEdit } from '../../features/vent/useDraftEdit';
import ChatBubble from '../../features/vent/components/ChatBubble';
import DraftBubble from '../../features/vent/components/DraftBubble';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import DraftActions from './DraftActions';
import { DRAFT_NOTE } from './draftNotes';
import styles from './Vent.module.css';

// 5단계: 3인칭 돌아보기 (situation 을 말풍선 안에서 고칠 수 있음)
export default function SituationPage() {
  const navigate = useNavigate();
  const result = useVentStore((s) => s.result);
  const draft = useDraftEdit(
    'situation',
    (r) => ({ situation: r.situation ?? '' }),
    (v) => ({ situation: v.situation }),
  );

  if (!result) return <Navigate to={VENT_PATHS.chat} replace />;

  const shown = draft.editing ? draft.values : draft.saved;

  return (
    <>
      <VentHeader
        title="3인칭 돌아보기"
        step={STEP_NO.situation}
        onBack={() => navigate(VENT_PATHS.reaction)}
      />
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
              },
            ]}
            editing={draft.editing}
            edited={draft.edited}
            autoFocus
          />
          <p className={styles.draftNote}>{DRAFT_NOTE}</p>
        </div>

        <div className={`${styles.bottom} ${styles.bottomSafe}`}>
          <DraftActions
            editing={draft.editing}
            okLabel="이대로 좋아."
            onOk={() => navigate(VENT_PATHS.plan)}
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
