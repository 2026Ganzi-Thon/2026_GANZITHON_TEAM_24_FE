import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Button, Input, Modal } from '../../components/ui';
import { useAuth } from '../auth/useAuth';
import { deleteAccount, requestMessage, updateEmail, updatePassword, updateProfile } from './roomApi';

const editors = { nickname: '닉네임 변경', email: '이메일 변경', password: '비밀번호 변경' };

export default function ProfilePage() {
  const { token, profile, error, reload } = useOutletContext();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [editor, setEditor] = useState(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');

  function open(next) {
    if (pending) return;
    setNotice('');
    setEditor(next);
  }

  function leaveAccount() {
    logout();
    navigate('/', { replace: true });
  }

  async function submit(event) {
    event.preventDefault();
    if (pending || !token) return;
    const fields = new FormData(event.currentTarget);
    const currentPassword = fields.get('currentPassword');
    setPending(true);
    setNotice('');

    try {
      if (editor === 'nickname') await updateProfile({ nickname: fields.get('nickname') });
      if (editor === 'email') await updateEmail({ email: fields.get('email'), currentPassword });
      if (editor === 'password') {
        const newPassword = fields.get('newPassword');
        if (newPassword !== fields.get('confirmPassword')) {
          setNotice('새 비밀번호가 서로 일치하지 않아요.');
          return;
        }
        await updatePassword({ currentPassword, newPassword });
      }
      if (editor === 'delete') {
        await deleteAccount();
        leaveAccount();
        return;
      }
      setEditor(null);
      setNotice('변경 내용을 저장했어요.');
      reload();
    } catch (requestError) {
      setNotice(requestMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="room-profile">
      <header className="room-profile__header">
        <Link to="/home" aria-label="홈으로 돌아가기">←</Link>
        <h1>내 정보</h1>
      </header>
      <div className="room-card room-profile__banner">
        <span className="drawer__avatar" aria-hidden="true" />
        <div><small>내 프로필</small><h2>{profile ? profile.nickname + ' 님' : '내 계정'}</h2></div>
      </div>
      {!token && <p role="status">로그인하면 계정 정보를 확인할 수 있어요.</p>}
      {token && !profile && <p role="status">{error || '계정 정보를 불러오는 중이에요.'}
        {error && <Button variant="ghost" onClick={reload}>다시 시도</Button>}</p>}
      <h2>프로필</h2>
      <div className="room-card room-profile__rows">
        <div><span><strong>닉네임</strong><small>감정 정리와 3인칭 문장에 사용</small></span>
          <Button disabled={!profile} onClick={() => open('nickname')}>변경</Button></div>
      </div>
      <h2>계정 정보</h2>
      <div className="room-card room-profile__rows">
        <div><span><strong>이메일</strong><small>로그인과 계정 알림에 사용</small></span>
          <button type="button" className="room-profile__email" title="이메일 변경" disabled={!profile}
            onClick={() => open('email')}>{profile?.email ?? '—'}</button></div>
        <div><span><strong>비밀번호</strong><small>비밀번호 원문은 표시하지 않아요</small></span>
          <Button disabled={!profile} onClick={() => open('password')}>변경</Button></div>
      </div>
      <h2>개인정보</h2>
      <div className="room-card room-profile__rows">
        <div><button className="room-profile__plain" onClick={() => open('privacy')}>
          <span>개인정보 수집·이용 안내<small>무엇을 저장하고 언제 사용하는지</small></span><span aria-hidden="true">›</span>
        </button></div>
      </div>
      <h2>계정 관리</h2>
      <div className="room-card room-profile__rows">
        <div><button className="room-profile__plain" disabled={!token} onClick={() => open('logout')}>로그아웃 <span>↗</span></button></div>
        <div><strong>계정 삭제</strong><Button className="room-danger" variant="secondary" disabled={!profile}
          onClick={() => open('delete')}>삭제</Button></div>
      </div>
      {!editor && <p role="status">{notice}</p>}

      <Modal open={Boolean(editor)} title={editors[editor] ?? {
        privacy: '개인정보 수집·이용 안내', logout: '로그아웃', delete: '계정 삭제',
      }[editor]} onClose={() => open(null)}>
        {editor === 'privacy' ? (
          <div className="room-form">
            <p>회원 식별과 서비스 제공을 위해 로그인 정보와 캐릭터 이름, 외형, 설정을 저장합니다.</p>
            <p>감정 글, 음성, AI 응답은 서비스가 일시적으로 처리하며 자체 저장소에 보관하지 않습니다. 입력 내용은 외부 AI 및 음성 인식 서비스로 전송될 수 있습니다.</p>
            <p>회원이 탈퇴하면 계정과 캐릭터 정보를 삭제합니다.</p>
            <Button onClick={() => open(null)}>닫기</Button>
          </div>
        ) : editor === 'logout' ? (
          <div className="room-form">
            <p>로그아웃할까요?</p>
            <Button onClick={leaveAccount}>로그아웃</Button>
            <Button variant="secondary" onClick={() => open(null)}>취소</Button>
          </div>
        ) : (
          <form className="room-form" key={editor} onSubmit={submit}>
            {editor === 'delete' && <><p>계정과 저장한 캐릭터가 삭제됩니다. 삭제한 정보는 복구할 수 없어요.</p>
              <label><input type="checkbox" required /> 계정 삭제를 확인했어요.</label></>}
            {editor === 'nickname' && <Input label="닉네임" name="nickname" required maxLength={10}
              pattern={'[ㄱ-ㅎㅏ-ㅣ가-힣A-Za-z0-9]{1,10}'} defaultValue={profile?.nickname} />}
            {(editor === 'email' || editor === 'password') &&
              <Input label="현재 비밀번호" name="currentPassword" type="password" autoComplete="current-password" required />}
            {editor === 'email' && <Input label="새 이메일" name="email" type="email" autoComplete="email" required maxLength={255} />}
            {editor === 'password' && <>
              <Input label="새 비밀번호 (영문·숫자 포함 8~13자)" name="newPassword" type="password"
                autoComplete="new-password" required minLength={8} maxLength={13}
                pattern={String.raw`(?=.*[A-Za-z])(?=.*\d)[\x21-\x7E]{8,13}`} />
              <Input label="새 비밀번호 확인" name="confirmPassword" type="password" autoComplete="new-password" required />
            </>}
            <p role="status">{notice}</p>
            <Button type="submit" disabled={pending}>{pending ? '처리 중…' : editor === 'delete' ? '계정 삭제' : '변경하기'}</Button>
            <Button variant="secondary" disabled={pending} onClick={() => open(null)}>취소</Button>
          </form>
        )}
      </Modal>
    </section>
  );
}
