import { Outlet } from 'react-router-dom';

// 로그인/회원가입 전용 레이아웃 (메뉴 없음)
export default function AuthLayout() {
  return (
    <div className="app-shell auth-shell">
      <main className="app-content auth-content">
        <Outlet />
      </main>
    </div>
  );
}
