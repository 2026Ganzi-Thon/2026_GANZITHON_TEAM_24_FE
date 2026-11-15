import { useLocation, useNavigate } from 'react-router-dom';

// 헤더의 ← 를 "방금 있던 화면(브라우저 뒤로가기와 같은 곳)"으로 보낸다.
// 경로로 새로 이동(push)하면 기록이 쌓여서 이후 브라우저 뒤로가기가 엉뚱한 곳으로 가므로, 기록을 한 칸 되돌린다.
// 주소로 바로 들어와서 되돌아갈 기록이 없을 때만 fallbackPath 로 이동한다.
export function useGoBack(fallbackPath) {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    // location.key 가 'default' 이면 앱 안에서 이동해 온 기록이 없는 첫 화면
    if (location.key !== 'default') navigate(-1);
    else navigate(fallbackPath, { replace: true });
  };
}
