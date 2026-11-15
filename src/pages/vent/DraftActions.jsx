import styles from './Vent.module.css';

// 2단계 초안 화면 하단 버튼.
//   보기 상태   : [okLabel] / [조금 수정이 필요해.]
//   고치기 상태 : [저장] / [취소]
export default function DraftActions({ editing, okLabel, onOk, onEdit, onSave, onCancel }) {
  return (
    <div className={styles.choices}>
      {editing ? (
        <>
          <button type="button" className={`${styles.pill} ${styles.pillPrimary}`} onClick={onSave}>
            저장
          </button>
          <button type="button" className={styles.pill} onClick={onCancel}>
            취소
          </button>
        </>
      ) : (
        <>
          <button type="button" className={styles.pill} onClick={onOk}>
            {okLabel}
          </button>
          <button type="button" className={styles.pill} onClick={onEdit}>
            조금 수정이 필요해.
          </button>
        </>
      )}
    </div>
  );
}
