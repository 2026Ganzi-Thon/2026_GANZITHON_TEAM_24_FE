import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './splash.css';

const SPLASH_DURATION_MS = 1200;

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      navigate('/login', { replace: true });
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="splash-page">
      <div className="splash-page__logo" role="img" aria-label="토로 로고" />
    </div>
  );
}
