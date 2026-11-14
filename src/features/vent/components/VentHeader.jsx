import { useNavigate } from 'react-router-dom';
import TopBar from '../../../components/navigation/TopBar';
import { useVentStore } from '../store';
import { ExitIcon } from './icons';
import ProgressSteps from './ProgressSteps';
import styles from './VentHeader.module.css';

// 하소연 흐름 공통 헤더: (← ) 제목 (나가기) + 진행 막대
// onBack 이 없으면 ← 를 그리지 않는다 (첫 화면).
export default function VentHeader({ title, step, onBack }) {
  const navigate = useNavigate();
  const reset = useVentStore((s) => s.reset);

  // 나가면 쓰던 내용을 모두 비우고 홈으로
  const handleExit = () => {
    reset();
    navigate('/');
  };

  return (
    <>
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
      <ProgressSteps current={step} />
    </>
  );
}
