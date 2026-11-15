import micIcon from '../../../assets/icons/mic.svg';
import sendPlane from '../../../assets/icons/send-plane.svg';
import { CHAT_MAX_LENGTH } from '../constants';
import { StopIcon } from './icons';
import styles from './ChatInput.module.css';

// 하단 입력줄: 마이크 + 입력 + 전송
//   disabled      : 응답을 기다리는 동안 전체 비활성
//   inputDisabled : 입력만 막을 때 (감정 후보 화면의 "직접 입력해주세요")
//   onMicClick    : 마이크 버튼 (권한 요청). 안 넘기면 눌러도 아무 일도 없다
//   listening     : 듣는 중이면 마이크 버튼을 숨기고 전송 버튼 자리에 정지 버튼(onStop)을 둔다
export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  inputDisabled = false,
  placeholder = '지금, 털어놓고 싶은 감정을 말해보세요',
  footerNote,
  onMicClick,
  listening = false,
  onStop,
  inputRef,
}) {
  const blocked = disabled || inputDisabled || listening;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!blocked && value.trim()) onSend?.();
  };

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <div className={styles.row}>
        {!listening && (
          <button
            type="button"
            className={styles.mic}
            onClick={onMicClick}
            disabled={disabled}
            aria-label="음성으로 말하기"
          >
            <img src={micIcon} alt="" width="40" height="40" draggable="false" />
          </button>
        )}
        <input
          ref={inputRef}
          className={styles.input}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          maxLength={CHAT_MAX_LENGTH}
          disabled={blocked}
          aria-label="하고 싶은 말"
          autoComplete="off"
        />
        {listening ? (
          <button type="button" className={`${styles.send} ${styles.stop}`} onClick={onStop} aria-label="듣기 멈추기">
            <StopIcon />
          </button>
        ) : (
          <button
            type="submit"
            className={styles.send}
            disabled={blocked || !value.trim()}
            aria-label="보내기"
          >
            <img className={styles.plane} src={sendPlane} alt="" draggable="false" />
          </button>
        )}
      </div>
      {footerNote && <p className={styles.note}>{footerNote}</p>}
    </form>
  );
}
