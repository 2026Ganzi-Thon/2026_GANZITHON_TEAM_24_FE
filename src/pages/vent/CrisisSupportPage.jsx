import { useEffect } from 'react';
import { CRISIS_CONTACTS } from '../../features/vent/crisisContacts';
import { endSession } from '../../features/vent/session';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

// 사용자가 도움을 요청하거나 위기 신호 응답을 받았을 때 보여 주는 안내.
export default function CrisisSupportPage() {
  // 주소로 직접 들어와도 이전 대화 내용이 남아 있지 않게 한 번 더 비운다
  useEffect(() => {
    endSession();
  }, []);

  return (
    <>
      <VentHeader />
      <main className={styles.crisis}>
        <h2 className={styles.crisisTitle}>도움을 받을 수 있어요</h2>

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

        <p className={styles.crisisNotice}>하소연을 종료했어요.</p>
      </main>
    </>
  );
}
