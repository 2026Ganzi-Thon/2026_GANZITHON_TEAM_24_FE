import { Route } from 'react-router-dom';
import { CRISIS_PATH, VENT_PATHS } from '../../features/vent/steps';
import CalmPage from './CalmPage';
import CrisisSupportPage from './CrisisSupportPage';
import EmotionPickPage from './EmotionPickPage';
import VentChatPage from './VentChatPage';

// B파트(하소연 흐름) 라우트 묶음. routes/index.jsx 의 VentLayout 그룹 안에 넣는다.
export const ventRoutes = (
  <>
    <Route path={VENT_PATHS.chat} element={<VentChatPage />} />
    <Route path={VENT_PATHS.emotions} element={<EmotionPickPage />} />
    <Route path={VENT_PATHS.calm} element={<CalmPage />} />
    <Route path={CRISIS_PATH} element={<CrisisSupportPage />} />
  </>
);
