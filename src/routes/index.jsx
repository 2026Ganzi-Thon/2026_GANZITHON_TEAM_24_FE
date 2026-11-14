import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import HomePage from '../features/character/HomePage';
import RoomActivityPage from '../features/character/RoomActivityPage';
import CustomizationPage from '../features/character/CustomizationPage';
import ProfilePage from '../features/character/ProfilePage';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../features/auth/useAuth';

// 로그인 가드 on/off. 로그인 기능이 완성되기 전까지는 false 로 두고 모든 화면에 바로 들어간다.
const AUTH_GUARD_ENABLED = false;

// 로그인하지 않은 사용자는 /login 으로 보낸다
function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (AUTH_GUARD_ENABLED && !isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 메뉴 없는 화면 (로그인, 회원가입 등) */}
      <Route element={<AuthLayout />}>
        {/* 예: <Route path="/login" element={<LoginPage />} /> */}
      </Route>

      {/* 로그인 후 화면 (TopBar + Drawer) */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/play" element={<RoomActivityPage key="play" />} />
        <Route path="/compliments" element={<RoomActivityPage key="compliments" mode="compliments" />} />
        <Route path="/customization" element={<CustomizationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* 각 파트 라우트를 여기에 추가 */}
      </Route>

      {/* 풀스크린 흐름 화면 (하소연하기 등, 헤더·메뉴를 화면이 직접 구성)
          로그인 가드만 적용된 빈 자리. 전용 레이아웃과 라우트는 B파트에서 채운다 */}
      <Route
        element={
          <RequireAuth>
            <Outlet />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
