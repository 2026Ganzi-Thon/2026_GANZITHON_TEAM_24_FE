import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import welcomeImage from '../../assets/auth/signup-welcome.png';
import { checkEmail, checkNickname, getAuthErrorCode, signup } from './authApi';
import PasswordField from './PasswordField';
import './signup.css';

const steps = ['consent', 'email', 'password', 'nickname', 'complete'];
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[!-~]{8,13}$/;
const nicknamePattern = /^[ㄱ-ㅎㅏ-ㅣ가-힣A-Za-z0-9]{1,10}$/;

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [nickname, setNickname] = useState('');
  const [checkedNickname, setCheckedNickname] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const heading = useRef(null);
  const privacyDialog = useRef(null);
  const screen = steps[step];

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  function changeStep(next) {
    setError('');
    setStep(next);
  }

  function update(setter, value) {
    setError('');
    setter(value);
  }

  async function verifyNickname() {
    if (pending) return;
    setError('');
    setCheckedNickname(null);
    if (!nicknamePattern.test(nickname)) {
      setError('한글, 영문, 숫자로 1~10자를 입력해 주세요.');
      return;
    }

    setPending(true);
    try {
      const { available } = await checkNickname(nickname);
      if (available === true) setCheckedNickname(nickname);
      else setError('이미 사용 중인 닉네임이에요.');
    } catch {
      setError('닉네임을 확인하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;
    setError('');

    if (screen === 'consent') {
      if (agreePrivacy) changeStep(step + 1);
      else setError('개인정보 수집·이용에 동의해 주세요.');
      return;
    }

    if (screen === 'password') {
      if (!passwordPattern.test(password)) {
        setError('공백 없이 영문과 숫자를 포함해 8~13자로 입력해 주세요.');
      } else if (password !== confirmation) {
        setError('비밀번호가 서로 일치하지 않아요.');
      } else {
        changeStep(step + 1);
      }
      return;
    }

    if (screen === 'nickname' && checkedNickname !== nickname) {
      setError('닉네임 중복 확인을 해 주세요.');
      return;
    }

    setPending(true);
    try {
      if (screen === 'email') {
        const { available } = await checkEmail(email);
        if (available !== true) {
          setError('이미 가입된 이메일이에요.');
          return;
        }
      } else {
        const { userId } = await signup({ email, password, nickname, agreePrivacy });
        if (userId == null) throw new Error('Missing account ID');
        setPassword('');
        setConfirmation('');
        setCheckedNickname(null);
      }

      changeStep(step + 1);
    } catch (requestError) {
      const code = getAuthErrorCode(requestError);
      if (code === 'AUTH_001') {
        setStep(steps.indexOf('email'));
        setError('이미 가입된 이메일이에요.');
      } else if (code === 'AUTH_004') {
        setCheckedNickname(null);
        setError('이미 사용 중인 닉네임이에요. 다른 닉네임으로 다시 확인해 주세요.');
      } else if (code === 'COMMON_001') {
        setError('입력 형식과 필수 약관 동의를 확인해 주세요.');
      } else {
        setError('요청을 처리하지 못했어요. 다시 시도해 주세요.');
      }
    } finally {
      setPending(false);
    }
  }

  const titles = {
    consent: <>고객님<br />환영합니다!</>,
    email: '이메일을 입력해 주세요',
    password: '비밀번호를 설정해 주세요',
    nickname: '닉네임을 설정해 주세요',
    complete: `반가워요, ${nickname}님!`,
  };
  const descriptions = {
    email: '로그인 및 회원가입에 쓰일 계정이에요.',
    password: '영문과 숫자를 포함해 8~13자로 입력해 주세요.',
    nickname: '한글, 영문, 숫자로 1~10자를 입력해 주세요.',
    complete: '어떤 마음이든 괜찮아요. 편하게 토로해 봐요.',
  };

  return (
    <section className={`signup-page signup-page--${screen}`} aria-labelledby="signup-title">
      {step > 0 && screen !== 'complete' && (
        <button className="signup-page__back" type="button" aria-label="이전 단계" disabled={pending}
          onClick={() => changeStep(step - 1)}>‹</button>
      )}

      <header className="signup-page__intro">
        {screen === 'consent' && <div className="signup-page__logo" aria-hidden="true" />}
        <h1 id="signup-title" ref={heading} tabIndex={-1}>{titles[screen]}</h1>
        {descriptions[screen] && <p>{descriptions[screen]}</p>}
      </header>

      {screen === 'complete' ? (
        <>
          <img className="signup-page__welcome" src={welcomeImage} width="202" height="184" alt="" />
          <Link className="btn btn--primary btn--block signup-page__action" to="/login" replace state={{ email }}>
            로그인하기
          </Link>
        </>
      ) : (
        <>
          <form className="signup-page__form" onSubmit={handleSubmit} aria-busy={pending}>
            <fieldset className="signup-page__fields" disabled={pending}>
              {screen === 'consent' && (
                <div className="signup-page__agreement-row">
                  <label className="signup-page__agreement">
                    <input type="checkbox" checked={agreePrivacy} onChange={(event) => update(setAgreePrivacy, event.target.checked)} />
                    <span>개인정보 수집·이용 동의 (필수)</span>
                  </label>
                  <button type="button" className="signup-page__details" aria-label="개인정보 수집·이용 안내 보기"
                    onClick={() => privacyDialog.current.showModal()}>›</button>
                </div>
              )}
              {screen === 'email' && (
                <Input name="email" type="email" placeholder="이메일" aria-label="이메일" autoComplete="username"
                  maxLength={255} required value={email} onChange={(event) => update(setEmail, event.target.value)} />
              )}
              {screen === 'password' && (
                <>
                  <PasswordField name="password" autoComplete="new-password" value={password} required
                    onChange={(event) => update(setPassword, event.target.value)} />
                  <PasswordField name="passwordConfirmation" autoComplete="new-password" placeholder="비밀번호 확인" value={confirmation} required
                    onChange={(event) => update(setConfirmation, event.target.value)} />
                </>
              )}
              {screen === 'nickname' && (
                <div className="signup-page__nickname">
                  <Input name="nickname" placeholder="닉네임" aria-label="닉네임" autoComplete="nickname" required value={nickname}
                    onChange={(event) => {
                      update(setNickname, event.target.value);
                      setCheckedNickname(null);
                    }} />
                  <Button type="button" onClick={verifyNickname}>중복 확인</Button>
                </div>
              )}
            </fieldset>
            <p className={`signup-page__status${error ? ' signup-page__status--error' : ''}`} role="status">
              {error || (screen === 'nickname' && checkedNickname === nickname && '사용 가능한 닉네임이에요.')}
            </p>
            <Button className="signup-page__action" type="submit" block disabled={pending}>
              {pending ? '처리 중…' : screen === 'nickname' ? '확인' : '다음'}
            </Button>
          </form>
          <footer className="signup-page__login">
            <p>이미 계정이 있으신가요?</p>
            <Link to="/login">로그인</Link>
          </footer>
        </>
      )}

      {screen === 'consent' && (
        <dialog ref={privacyDialog} className="signup-page__dialog" aria-labelledby="signup-privacy-title">
          <h2 id="signup-privacy-title">개인정보 수집·이용 안내</h2>
          <p>회원 식별과 서비스 제공을 위해 로그인 정보를 저장합니다. 캐릭터를 만들면 캐릭터 이름, 외형, 설정 정보도 저장합니다.</p>
          <p>감정 글, 음성, AI 응답은 서비스가 일시적으로 처리하며 자체 저장소에는 보관하지 않습니다. 외부 AI 및 음성 인식 서비스로 감정 글이나 음성이 전송될 수 있습니다.</p>
          <p>계정과 캐릭터 정보는 회원 탈퇴 시 삭제합니다.</p>
          <form method="dialog"><Button type="submit" block>닫기</Button></form>
        </dialog>
      )}
    </section>
  );
}
