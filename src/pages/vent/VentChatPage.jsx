import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage, postStt, sendMessage, suggestEmotions } from '../../features/vent/api';
import { CHAT_MAX_LENGTH, MORE_TALK_LABEL, MORE_TALK_REPLY } from '../../features/vent/constants';
import { callName, subject } from '../../features/vent/korean';
import { maskProfanity } from '../../features/vent/maskProfanity';
import { loadNickname, useNickname } from '../../features/vent/profile';
import { startWithCharacter } from '../../features/vent/selectedCharacter';
import { endSession, ensureSession, leaveIfSessionGone } from '../../features/vent/session';
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

const EMPTY_REPLY = '잘 듣고 있어. 계속 이야기해 줘.'; // 공감이 비어 있을 때

// 1단계: 하소연하기 (캐릭터와 대화)
export default function VentChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const messages = useVentStore((s) => s.messages);
  const loading = useVentStore((s) => s.loading);
  const addMessage = useVentStore((s) => s.addMessage);
  const setLoading = useVentStore((s) => s.setLoading);
  const commitResult = useVentStore((s) => s.commitResult);

  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [finishing, setFinishing] = useState(false); // "다음으로" 눌러 결과를 기다리는 중
  const [greetingAt] = useState(() => Date.now());
  const nickname = useNickname();
  const characterName = useCharacterName();
  const character = useSelectedCharacter();
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const [transcribing, setTranscribing] = useState(false); // 녹음을 글로 바꾸는 중
  const sttAbortRef = useRef(null);
  const recordingMode = useRef('vent');
  const [testAudio, setTestAudio] = useState('');
  const [testingMic, setTestingMic] = useState(false);

  // 녹음이 끝나면 글로 바꿔서 입력창에 이어 붙인다 (바로 보내지 않는다. 마이크를 다시 누르면 계속 이어 붙는다)
  const handleRecorded = async (blob) => {
    if (recordingMode.current === 'test') {
      setTestingMic(false);
      if (blob.size) setTestAudio(URL.createObjectURL(blob));
      else setError('녹음된 소리가 없어요. 마이크를 다시 확인해 주세요.');
      return;
    }
    const controller = new AbortController();
    sttAbortRef.current = controller;
    setError('');
    setTranscribing(true);
    try {
      const sessionId = await ensureSession();
      const text = (await postStt(blob, { sessionId, signal: controller.signal })).trim();
      if (controller.signal.aborted) return;
      if (!text) {
        setError('말소리가 잘 안 들렸어. 다시 말해줄래?');
        return;
      }
      setInput((previous) => (previous.trim() ? `${previous.trim()} ${text}` : text).slice(0, CHAT_MAX_LENGTH));
    } catch (e) {
      if (controller.signal.aborted) return; // 화면을 떠나서 취소한 것
      if (leaveIfSessionGone(e, navigate)) return;
      setError(getErrorMessage(e, '음성을 글로 바꾸지 못했어요. 다시 말해 줄래?'));
    } finally {
      if (!controller.signal.aborted) {
        setTranscribing(false);
        setTimeout(() => inputRef.current?.focus(), 0); // 입력창이 다시 켜진 뒤에 포커스
      }
    }
  };

  const mic = useMicrophone({ onRecorded: handleRecorded });
  const listening = mic.status === 'listening';
  const busy = loading || finishing || transcribing;

  async function startRecording(mode) {
    if (busy || mic.status !== 'idle') return;
    recordingMode.current = mode;
    setError('');
    setTestingMic(mode === 'test');
    if (mode === 'test') setTestAudio('');
    if (!(await mic.start())) setTestingMic(false);
  }

  useEffect(() => {
    if (testAudio) return () => URL.revokeObjectURL(testAudio);
  }, [testAudio]);

  // 변환 중에 화면을 떠나면 요청을 취소한다
  useEffect(() => () => sttAbortRef.current?.abort(), []);

  // 하소연을 시작할 때 쓸 캐릭터 정하기 (홈에서 넘겨 준 캐릭터 → 내 첫 캐릭터 → 기본 캐릭터)
  useEffect(() => {
    // 감정을 이미 확정했다면 서버가 하소연 단계로 되돌릴 수 없으므로 진정하기로 보낸다 (브라우저 뒤로가기 등)
    if (useVentStore.getState().emotionConfirmed) {
      navigate(VENT_PATHS.calm, { replace: true });
      return;
    }
    useVentStore.getState().restoreMessages(); // 감정 후보에서 ← 로 돌아왔다면 내가 쓴 글을 다시 보여 준다
    startWithCharacter(location.state?.character);
    loadNickname(); // 인사말에서 부를 닉네임 (로그인 상태일 때만 불러온다)
    // 서버 세션은 첫 메시지 또는 음성 변환을 보낼 때 연다.
    // 들어올 때 한 번만. 대화 중 location 이 바뀌어도 다시 정하지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 새 말풍선이 생기면 맨 아래로
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, loading]);

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
      // 서버에는 방금 쓴 글 한 건만 원문으로 보낸다 (욕설 가리기는 화면 표시만, 서버는 대화를 기억하지 않는다)
      const sessionId = await ensureSession();
      const data = await sendMessage(sessionId, text);
      if (useVentStore.getState().sessionId !== sessionId) return;

      if (data.risk === 'DANGER') {
        // 위기 신호: 대화를 멈추고 원문을 지운 뒤 위기지원안내로
        endSession();
        navigate(CRISIS_PATH, { replace: true });
        return;
      }
      addMessage('assistant', data.empathy || EMPTY_REPLY);
    } catch (e) {
      if (leaveIfSessionGone(e, navigate)) return;
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
      const sessionId = await ensureSession();
      const data = await suggestEmotions(sessionId, allTexts);
      if (useVentStore.getState().sessionId !== sessionId) return;
      commitResult(data.candidates);
      navigate(VENT_PATHS.emotions);
    } catch (e) {
      if (leaveIfSessionGone(e, navigate)) return;
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
              <p className={styles.listeningBubble}>{testingMic ? '테스트 녹음 중이에요' : '잘 들어볼게!!!'}</p>
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
          {testAudio && !listening && (
            <div className={styles.micPreview}>
              <p>테스트 녹음은 이 화면에서만 들을 수 있어요.</p>
              <audio controls src={testAudio} aria-label="테스트 녹음 재생" />
              <button type="button" onClick={() => setTestAudio('')}>테스트 녹음 지우기</button>
            </div>
          )}
          <div className={styles.supportActions}>
            <button type="button" disabled={busy || mic.status !== 'idle'} onClick={() => startRecording('test')}>
              마이크 테스트
            </button>
            <button type="button" onClick={() => {
              endSession();
              navigate(CRISIS_PATH, { replace: true });
            }}>
              도움이 필요해요
            </button>
          </div>
          <PrivacyNotice />
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={busy || mic.status === 'requesting'}
            onMicClick={() => startRecording('vent')}
            listening={listening}
            onStop={mic.stop}
            placeholder={transcribing ? '글로 바꾸는 중…' : undefined}
            inputRef={inputRef}
          />
        </div>

        {finishing && <LoadingOverlay message={`${subject(characterName)} 네 이야기를 정리하고 있어…`} />}
      </main>
    </>
  );
}
