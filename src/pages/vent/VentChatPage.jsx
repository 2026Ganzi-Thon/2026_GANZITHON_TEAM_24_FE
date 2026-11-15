import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage, postVent, postVentResult } from '../../features/vent/api';
import { MORE_TALK_LABEL, MORE_TALK_REPLY } from '../../features/vent/constants';
import { callName, subject } from '../../features/vent/korean';
import { maskProfanity } from '../../features/vent/maskProfanity';
import { loadNickname, useNickname } from '../../features/vent/profile';
import { startWithCharacter } from '../../features/vent/selectedCharacter';
import { CRISIS_PATH, STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import { useMicrophone } from '../../features/vent/useMicrophone';
import { useCharacterName, useSelectedCharacter } from '../../features/vent/useSelectedCharacter';
import CharacterPortrait from '../../features/character/CharacterPortrait';
import ChatBubble from '../../features/vent/components/ChatBubble';
import ChatInput from '../../features/vent/components/ChatInput';
import LoadingOverlay from '../../features/vent/components/LoadingOverlay';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

const EMPTY_REPLY = '잘 듣고 있어. 계속 이야기해 줘.'; // AI가 실패(fallback)해서 답이 비었을 때

// 1단계: 하소연하기 (캐릭터와 대화)
export default function VentChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const messages = useVentStore((s) => s.messages);
  const loading = useVentStore((s) => s.loading);
  const addMessage = useVentStore((s) => s.addMessage);
  const setLoading = useVentStore((s) => s.setLoading);
  const commitResult = useVentStore((s) => s.commitResult);
  const reset = useVentStore((s) => s.reset);

  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [finishing, setFinishing] = useState(false); // "다음으로" 눌러 결과를 기다리는 중
  const [greetingAt] = useState(() => Date.now());
  const nickname = useNickname();
  const characterName = useCharacterName();
  const character = useSelectedCharacter();
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const mic = useMicrophone();
  const listening = mic.status === 'listening';

  // 하소연을 시작할 때 쓸 캐릭터 정하기 (홈에서 넘겨 준 캐릭터 → 내 첫 캐릭터 → 기본 캐릭터)
  useEffect(() => {
    useVentStore.getState().restoreMessages(); // 감정 후보에서 ← 로 돌아왔다면 내가 쓴 글을 다시 보여 준다
    startWithCharacter(location.state?.character);
    loadNickname(); // 인사말에서 부를 닉네임 (로그인 상태일 때만 불러온다)
    // 들어올 때 한 번만. 대화 중 location 이 바뀌어도 다시 정하지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 새 말풍선이 생기면 맨 아래로
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, loading]);

  const busy = loading || finishing;
  // 선택지는 캐릭터가 (실제로) 답한 직후, 또는 돌아와서 글이 되살아난 직후(resumed)에만 보인다.
  // "더 이야기 하고 싶어!"로 나온 안내 말풍선 뒤에는 숨긴다
  const lastMessage = messages[messages.length - 1];
  const showChoices =
    Boolean(lastMessage) &&
    ((lastMessage.role === 'assistant' && !lastMessage.local) || Boolean(lastMessage.resumed)) &&
    !busy &&
    !listening;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || busy) return;

    setError('');
    setInput('');
    addMessage('user', text);
    setLoading(true);
    try {
      // 서버에는 원문 전체 대화를 보낸다 (욕설 가리기는 화면 표시만)
      const history = useVentStore
        .getState()
        .messages.filter((m) => !m.local) // 화면에만 있는 말풍선은 서버로 보내지 않는다
        .map(({ role, content }) => ({ role, content }));
      const data = await postVent({ messages: history });

      if (data.risk === 'DANGER') {
        // 위기 신호: 대화를 멈추고 원문을 지운 뒤 위기지원안내로 (화면은 아직 없음)
        reset();
        navigate(CRISIS_PATH, { replace: true });
        return;
      }
      addMessage('assistant', data.reply || EMPTY_REPLY);
    } catch (e) {
      setError(getErrorMessage(e, '잠깐 문제가 생겼어. 다시 한 번 말해줄래?'));
    } finally {
      setLoading(false);
    }
  };

  // "더 이야기 하고 싶어!" → 내 말풍선과 캐릭터의 답을 화면에만 보여 주고 입력창으로 (서버 호출 없음)
  const handleMoreTalk = () => {
    if (busy) return;
    addMessage('user', MORE_TALK_LABEL, { local: true });
    addMessage('assistant', MORE_TALK_REPLY, { local: true });
    inputRef.current?.focus();
  };

  // "이 정도면 다 털어놓은 것 같아." → 결과(감정 후보 등)를 받아 저장하고 다음 화면으로
  const handleFinish = async () => {
    if (busy) return;
    setError('');
    setFinishing(true);
    try {
      const { texts, messages: current } = useVentStore.getState();
      const allTexts = [
        ...texts,
        ...current.filter((m) => m.role === 'user' && !m.local).map((m) => m.content),
      ];
      const data = await postVentResult({ texts: allTexts });
      commitResult(data);
      navigate(VENT_PATHS.emotions);
    } catch (e) {
      setError(getErrorMessage(e, '정리하다가 문제가 생겼어. 잠시 뒤에 다시 눌러줘.'));
      setFinishing(false);
    }
  };

  return (
    <>
      <VentHeader title="하소연하기" step={STEP_NO.chat} />
      <main className={styles.body}>
        <div className={styles.scroll} aria-live="polite">
          <ChatBubble time={greetingAt}>
            {`${callName(nickname)} 뭐가 그렇게 속상해? 어서 나한테 다 털어놔봐!`}
          </ChatBubble>
          {messages.map((m) => (
            <ChatBubble key={m.id} role={m.role} time={m.at}>
              {m.role === 'user' ? maskProfanity(m.content) : m.content}
            </ChatBubble>
          ))}
          {loading && <ChatBubble typing />}
          <div ref={endRef} />
        </div>

        <div className={styles.bottom}>
          {(error || mic.error) && (
            <p className={styles.error} role="alert">
              {error || mic.error}
            </p>
          )}
          {listening && (
            <div className={styles.listening} aria-live="polite">
              <p className={styles.listeningBubble}>잘 들어볼게!!!</p>
              <div className={styles.listeningCharacter}>
                <CharacterPortrait character={character} />
              </div>
            </div>
          )}
          {showChoices && (
            <div className={styles.choices}>
              <button type="button" className={styles.pill} onClick={handleFinish}>
                이 정도면 다 털어놓은 것 같아.
              </button>
              <button type="button" className={styles.pill} onClick={handleMoreTalk}>
                {MORE_TALK_LABEL}
              </button>
            </div>
          )}
          <PrivacyNotice />
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={busy || mic.status === 'requesting'}
            onMicClick={mic.start}
            listening={listening}
            onStop={mic.stop}
            inputRef={inputRef}
            footerNote="여기 적은 내용은 어디에도 저장되지 않아요."
          />
        </div>

        {finishing && <LoadingOverlay message={`${subject(characterName)} 네 이야기를 정리하고 있어…`} />}
      </main>
    </>
  );
}
