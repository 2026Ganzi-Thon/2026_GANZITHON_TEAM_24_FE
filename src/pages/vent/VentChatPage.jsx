import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, postVent, postVentResult } from '../../features/vent/api';
import { CHARACTER_NAME, NICKNAME } from '../../features/vent/constants';
import { maskProfanity } from '../../features/vent/maskProfanity';
import { CRISIS_PATH, STEP_NO, VENT_PATHS } from '../../features/vent/steps';
import { useVentStore } from '../../features/vent/store';
import { useMicrophone } from '../../features/vent/useMicrophone';
import CharacterStage from '../../features/vent/components/CharacterStage';
import ChatBubble from '../../features/vent/components/ChatBubble';
import ChatInput from '../../features/vent/components/ChatInput';
import LoadingOverlay from '../../features/vent/components/LoadingOverlay';
import PrivacyNotice from '../../features/vent/components/PrivacyNotice';
import VentHeader from '../../features/vent/components/VentHeader';
import styles from './Vent.module.css';

const GREETING = `${NICKNAME}야 뭐가 그렇게 속상해? 어서 나한테 다 털어놔봐!`;
const EMPTY_REPLY = '잘 듣고 있어. 계속 이야기해 줘.'; // AI가 실패(fallback)해서 답이 비었을 때

// 1단계: 하소연하기 (캐릭터와 대화)
export default function VentChatPage() {
  const navigate = useNavigate();
  const messages = useVentStore((s) => s.messages);
  const loading = useVentStore((s) => s.loading);
  const addMessage = useVentStore((s) => s.addMessage);
  const setLoading = useVentStore((s) => s.setLoading);
  const commitResult = useVentStore((s) => s.commitResult);
  const reset = useVentStore((s) => s.reset);

  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [finishing, setFinishing] = useState(false); // "다음으로" 눌러 결과를 기다리는 중
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const mic = useMicrophone();
  const listening = mic.status === 'listening';

  // 새 말풍선이 생기면 맨 아래로
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, loading]);

  const hasUserMessage = messages.some((m) => m.role === 'user');
  const busy = loading || finishing;

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
        .messages.map(({ role, content }) => ({ role, content }));
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

  // "이 정도면 다 털어놓은 것 같아." → 결과(감정 후보 등)를 받아 저장하고 다음 화면으로
  const handleFinish = async () => {
    if (busy) return;
    setError('');
    setFinishing(true);
    try {
      const { texts, messages: current } = useVentStore.getState();
      const allTexts = [...texts, ...current.filter((m) => m.role === 'user').map((m) => m.content)];
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
          <ChatBubble>{GREETING}</ChatBubble>
          {messages.map((m) => (
            <ChatBubble key={m.id} role={m.role}>
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
              <CharacterStage motion="listening" size="lg" />
            </div>
          )}
          {hasUserMessage && !busy && !listening && (
            <div className={styles.choices}>
              <button type="button" className={styles.pill} onClick={handleFinish}>
                이 정도면 다 털어놓은 것 같아.
              </button>
              <button type="button" className={styles.pill} onClick={() => inputRef.current?.focus()}>
                더 이야기 하고 싶어!
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

        {finishing && <LoadingOverlay message={`${CHARACTER_NAME}가 네 이야기를 정리하고 있어…`} />}
      </main>
    </>
  );
}
