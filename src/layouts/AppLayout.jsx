import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppBackground from '../components/background/AppBackground';
import TopBar from '../components/navigation/TopBar';
import Drawer from '../components/navigation/Drawer';

// 기본 헤더(메뉴 버튼)가 있는 레이아웃. 다른 헤더가 필요한 화면은 TopBar 를 직접 써서 구성한다.
export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="app-shell">
      <AppBackground />
      <TopBar onMenuClick={() => setDrawerOpen(true)} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
