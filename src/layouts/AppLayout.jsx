import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import AppBackground from '../components/background/AppBackground';
import TopBar from '../components/navigation/TopBar';
import Drawer from '../components/navigation/Drawer';
import { useAuth } from '../features/auth/useAuth';
import { getCharacters, getProfile, requestMessage } from '../features/character/roomApi';
import { useCharacterStore } from '../features/character/store';
import '../features/character/room.css';

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [room, setRoom] = useState(null);
  const [revision, setRevision] = useState(0);
  const { token } = useAuth();
  const { pathname } = useLocation();
  const isHome = pathname === '/' || /^\/home\/?$/i.test(pathname);
  const setBackground = useCharacterStore((state) => state.setBackground);
  const current = room?.token === token ? room : { profile: null, characters: [], error: '' };

  useEffect(() => {
    if (!token) {
      setRoom(null);
      setBackground('default');
      return;
    }
    const controller = new AbortController();
    Promise.allSettled([getProfile(controller.signal), getCharacters(controller.signal)]).then(([profile, list]) => {
      if (controller.signal.aborted) return;
      const rejected = [profile, list].find((result) => result.status === 'rejected');
      setRoom({ token, profile: profile.value ?? null, characters: list.value?.characters ?? [],
        error: rejected ? requestMessage(rejected.reason) : '', loaded: list.status === 'fulfilled' });
      setBackground(profile.value?.background ?? 'default');
    });
    return () => controller.abort();
  }, [token, revision, setBackground]);

  return (
    <div className={`app-shell room-shell${isHome ? ' room-shell--home' : ''}`}>
      {!isHome && <AppBackground />}
      <TopBar title={isHome ? <span className="room-logo">Toro</span> : 'Toro'} onMenuClick={() => setDrawerOpen(true)} />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Link className="drawer__profile" to="/profile" onClick={() => setDrawerOpen(false)}>
          <span className="drawer__avatar" aria-hidden="true" />
          <span><strong>{current.profile?.nickname ?? '내 계정'}</strong><small>내 정보 ›</small></span>
        </Link>
      </Drawer>
      <main className="app-content">
        <Outlet context={{ ...current, token, reload: () => setRevision((value) => value + 1) }} />
      </main>
    </div>
  );
}
