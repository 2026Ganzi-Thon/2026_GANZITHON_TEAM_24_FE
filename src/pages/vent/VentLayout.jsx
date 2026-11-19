import { useEffect } from 'react';
import { Navigate, Outlet, useMatch, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuth';
import { releaseSessionOnPageHide, USE_MOCK } from '../../features/vent/api';
import { RESTART_NOTICE } from '../../features/vent/constants';
import { endSession } from '../../features/vent/session';
import { useVentStore } from '../../features/vent/store';
import { HOME_PATH, VENT_PATHS } from '../../features/vent/steps';
import VentBackdrop from '../../features/vent/components/VentBackdrop';
import styles from './VentLayout.module.css';

// 하소연 흐름 전용 풀스크린 레이아웃 (메뉴 없음).
// 가운데에 최대 480px 세로 열을 두고, 열 안에 흐린 배경(VentBackdrop)을 깐다.
// 헤더는 각 페이지가 VentHeader 로 직접 그린다.
// 버리기 화면은 사라지는 모션이 배경까지 감싸야 해서, 배경을 이 화면이 직접 그린다.
export default function VentLayout() {
  const onDiscard = useMatch(VENT_PATHS.discard);
  const onChat = useMatch(VENT_PATHS.chat);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    const onPageHide = () => {
      releaseSessionOnPageHide(useVentStore.getState().sessionId, useAuthStore.getState().token);
    };
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      endSession();
    };
  }, []);

  useEffect(() => {
    const onPageShow = (event) => {
      if (!event.persisted) return;
      endSession();
      navigate(HOME_PATH, { replace: true, state: { notice: RESTART_NOTICE } });
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [navigate]);

  if (onChat && !USE_MOCK && !token) return <Navigate to="/login" replace />;

  return (
    <div className={styles.shell}>
      <div className={styles.column}>
        {!onDiscard && <VentBackdrop />}
        <Outlet />
      </div>
    </div>
  );
}
