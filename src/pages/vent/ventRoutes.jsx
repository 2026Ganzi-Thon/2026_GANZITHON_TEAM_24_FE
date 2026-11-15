import { Route } from 'react-router-dom';
import { CRISIS_PATH, VENT_PATHS } from '../../features/vent/steps';
import CalmPage from './CalmPage';
import CrisisSupportPage from './CrisisSupportPage';
import DeleteFailedPage from './DeleteFailedPage';
import DiscardPage from './DiscardPage';
import DonePage from './DonePage';
import EmotionPickPage from './EmotionPickPage';
import PlanPage from './PlanPage';
import ReactionPage from './ReactionPage';
import ResultPage from './ResultPage';
import SituationPage from './SituationPage';
import VentChatPage from './VentChatPage';

// B파트(하소연 흐름) 라우트 묶음. routes/index.jsx 의 VentLayout 그룹 안에 넣는다.
export const ventRoutes = (
  <>
    {/* 1단계: 하소연 */}
    <Route path={VENT_PATHS.chat} element={<VentChatPage />} />
    <Route path={CRISIS_PATH} element={<CrisisSupportPage />} />
    {/* 감정 후보 · 진정 */}
    <Route path={VENT_PATHS.emotions} element={<EmotionPickPage />} />
    <Route path={VENT_PATHS.calm} element={<CalmPage />} />
    {/* 2단계: 초안 확인·수정 */}
    <Route path={VENT_PATHS.reaction} element={<ReactionPage />} />
    <Route path={VENT_PATHS.situation} element={<SituationPage />} />
    <Route path={VENT_PATHS.plan} element={<PlanPage />} />
    {/* 결과 → 버리기 → 완료 */}
    <Route path={VENT_PATHS.result} element={<ResultPage />} />
    <Route path={VENT_PATHS.discard} element={<DiscardPage />} />
    <Route path={VENT_PATHS.done} element={<DonePage />} />
    <Route path={VENT_PATHS.deleteFailed} element={<DeleteFailedPage />} />
  </>
);
