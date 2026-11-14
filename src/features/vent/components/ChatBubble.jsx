import CharacterStage from './CharacterStage';
import styles from './ChatBubble.module.css';

// "오후 7:24" 모양
function formatTime(timestamp) {
  return new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }).format(
    timestamp,
  );
}

// role: 'assistant'(캐릭터, 왼쪽 + 아바타) | 'user'(나, 오른쪽)
// typing: 캐릭터가 답을 쓰는 중 (점 세 개)
export default function ChatBubble({ role = 'assistant', time, typing = false, children }) {
  const isUser = role === 'user';

  return (
    <div className={`${styles.row} ${isUser ? styles.user : styles.assistant}`}>
      {!isUser && <CharacterStage size="sm" />}
      <div className={styles.col}>
        <p className={styles.bubble}>
          {typing ? (
            <span className={styles.dots} role="status" aria-label="입력 중">
              <i />
              <i />
              <i />
            </span>
          ) : (
            children
          )}
        </p>
        {time && <span className={styles.time}>{formatTime(time)}</span>}
      </div>
    </div>
  );
}
