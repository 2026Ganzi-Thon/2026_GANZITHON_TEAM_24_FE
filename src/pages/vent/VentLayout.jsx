import { Outlet } from 'react-router-dom';
import AppBackground from '../../components/background/AppBackground';
import styles from './VentLayout.module.css';

// 하소연 흐름 전용 풀스크린 레이아웃 (메뉴 없음).
// 공통 배경 위에 흐림 + 파란 틴트를 덮고, 가운데에 최대 480px 세로 열을 둔다.
// 헤더는 각 페이지가 VentHeader 로 직접 그린다.
export default function VentLayout() {
  return (
    <div className={styles.shell}>
      <AppBackground />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.column}>
        <Outlet />
      </div>
    </div>
  );
}
