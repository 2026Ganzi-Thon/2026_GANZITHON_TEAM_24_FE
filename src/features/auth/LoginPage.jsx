import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import { getAuthErrorCode, signIn } from './authApi';
import PasswordField from './PasswordField';
import { useAuth } from './useAuth';
import './login.css';

export default function LoginPage() {
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;
    const fields = new FormData(event.currentTarget);
    setNotice('');
    setPending(true);

    try {
      const { accessToken } = await signIn({
        email: fields.get('email').trim(),
        password: fields.get('password'),
      });
      if (!accessToken) throw new Error('Missing access token');
      login(accessToken);
      navigate('/home', { replace: true });
    } catch (error) {
      setNotice(getAuthErrorCode(error) === 'AUTH_002'
        ? '이메일 또는 비밀번호를 다시 확인해 주세요.'
        : '로그인 요청을 처리하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="login-page" aria-labelledby="login-title">
      <header className="login-page__intro">
        <h1 id="login-title">
          <span>오늘의 마음</span>도,<br />
          여기선 전부 편하게 내려놔요
        </h1>
        <p>속상했던 일도, 답답했던 마음도<br />모두 토로해 줄래요?</p>
      </header>

      <form className="login-page__form" onSubmit={handleSubmit} onInput={() => setNotice('')}>
        <div className="login-page__fields">
          <Input
            name="email"
            type="email"
            placeholder="아이디"
            aria-label="아이디 (이메일)"
            defaultValue={state?.email}
            maxLength={255}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
          <PasswordField name="password" autoComplete="current-password" required />
        </div>

        <div className="login-page__submit">
          <Button type="submit" block disabled={pending}>{pending ? '로그인 중…' : '로그인'}</Button>
          <p className="login-page__notice" role="status">{notice}</p>
        </div>
      </form>

      <footer className="login-page__signup">
        <p>아직 계정이 없으신가요?</p>
        <Link to="/signup">회원가입</Link>
      </footer>
    </section>
  );
}
