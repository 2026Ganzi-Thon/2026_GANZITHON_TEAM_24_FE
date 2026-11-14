import { useNavigate } from 'react-router-dom';
import TopBar from '../../../components/navigation/TopBar';
import { useVentStore } from '../store';
import { ExitIcon } from './icons';
import ProgressSteps from './ProgressSteps';
import styles from './VentHeader.module.css';

// 하소연 흐름 공통 헤더: (← ) 제목 (나가기) + 진행 막대
// onBack 이 없으면 ← 를 그리지 않고(첫 화면), step 이 없으면 진행 막대를 그리지 않는다(위기지원안내).
export default function VentHeader({ title, step, onBack }) {
  const navigate = useNavigate();
  const reset = useVentStore((s) => s.reset);

  // 나가면 쓰던 내용을 모두 비우고 홈으로
  const handleExit = () => {
    reset();
    navigate('/');
  };

  return (
    // 시안의 헤더는 단색 흰색이라 흰 바탕으로 감싼다 (TopBar 의 반투명 배경이 비치지 않게)
    <div className={styles.header}>
      <TopBar
        title={title}
        left={onBack ? 'back' : null}
        onBack={onBack}
        right={
          <button
            type="button"
            className={`icon-button ${styles.exit}`}
            onClick={handleExit}
            aria-label="나가기"
          >
            <ExitIcon />
          </button>
        }
      />
      {step != null && <ProgressSteps current={step} />}
    </div>
  );
}
