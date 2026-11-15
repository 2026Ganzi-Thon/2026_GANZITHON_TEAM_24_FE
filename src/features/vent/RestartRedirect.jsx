import { Navigate } from 'react-router-dom';
import { RESTART_NOTICE } from './constants';
import { HOME_PATH } from './steps';

// 하소연 도중에 새로고침해서 정리하던 내용(메모리)이 사라졌을 때: 홈으로 보내고 안내 문구를 함께 넘긴다 (가이드).
// 홈이 이 문구를 한 번 보여 준다 (features/character/HomePage.jsx).
export default function RestartRedirect() {
  return <Navigate to={HOME_PATH} replace state={{ notice: RESTART_NOTICE }} />;
}
