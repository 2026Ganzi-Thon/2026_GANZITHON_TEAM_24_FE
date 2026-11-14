import { useEffect } from 'react';
import { CRISIS_CONTACTS } from '../../features/vent/crisisContacts';
import { useVentStore } from '../../features/vent/store';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 위기지원안내 (/vent 응답이 risk: DANGER 일 때). 보여 주기만 하는 화면이라 눌리는 것은 나가기(→ 홈)뿐이다.
export default function CrisisSupportPage() {
  const reset = useVentStore((s) => s.reset);

  // 주소로 직접 들어와도 이전 대화 내용이 남아 있지 않게 한 번 더 비운다
  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <>
      <VentHeader />
      <main className={styles.crisis}>
        <h2 className={styles.crisisTitle}>지금 도움이 필요해 보입니다.</h2>

        <div className={styles.crisisCard}>
          <p>혹시 힘든 순간이 있으신가요?</p>
          <p>혼자가 아닙니다. 전문가의 도움을 받으세요.</p>
        </div>

        {CRISIS_CONTACTS.map(({ name, number, note }) => (
          <div key={name} className={styles.crisisCard}>
            <p>{name}</p>
            <p className={styles.crisisNumber}>{number}</p>
            <p>{note}</p>
          </div>
        ))}

        <p className={styles.crisisNotice}>대화 내용은 저장되지 않습니다.</p>
      </main>
    </>
  );
}
