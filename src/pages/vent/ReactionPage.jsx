import { useNavigate } from 'react-router-dom';
import RestartRedirect from '../../features/vent/RestartRedirect';
import { STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import { useGoBack } from '../../features/vent/useGoBack';
import { useDraftEdit } from '../../features/vent/useDraftEdit';
import ChatBubble from '../../features/vent/components/ChatBubble';
import DraftBubble from '../../features/vent/components/DraftBubble';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import DraftActions from './DraftActions';
import { DRAFT_NOTE } from './draftNotes';
import styles from './Vent.module.css';

// 4단계: 원했던 반응 확인. 필요했던 것(needs)과 원했던 반응(wantedReaction) 모두 말풍선 안에서 고칠 수 있다.
// (노션 명세는 needs 를 '읽기용'으로 적었지만, 고친 값은 서버로 보내지 않는 프론트 값이라 전체 수정이 가능하게 했다)
export default function ReactionPage() {
  const navigate = useNavigate();
  const goBack = useGoBack(VENT_PATHS.calm);
  const result = useVentStore((s) => s.result);
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

  // 새로고침 등으로 저장된 결과가 없으면 처음부터
  if (!result) return <RestartRedirect />;

  const shown = draft.editing ? draft.values : draft.saved;

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
              },
              {
                key: 'wantedReaction',
                label: '원했던 반응',
                value: shown.wantedReaction,
                onChange: (v) => draft.setValue('wantedReaction', v),
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
            okLabel="맞아."
            onOk={() => navigate(VENT_PATHS.situation)}
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
