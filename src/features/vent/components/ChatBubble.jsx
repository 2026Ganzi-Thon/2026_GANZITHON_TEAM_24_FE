import CharacterStage from './CharacterStage';
import styles from './ChatBubble.module.css';

// "오후 7:24" 모양
function formatTime(timestamp) {
  return new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }).format(
    timestamp,
  );
}

// role: 'assistant'(캐릭터, 왼쪽 + 아바타) | 'user'(나, 오른쪽)
// time: 보내면 시각을 보여 준다. timePosition 'side'(말풍선 옆 아래, 기본) | 'below'(말풍선 아래)
// typing: 캐릭터가 답을 쓰는 중 (점 세 개)
export default function ChatBubble({
  role = 'assistant',
  time,
  timePosition = 'side',
  typing = false,
  children,
}) {
  const isUser = role === 'user';
  const timeLabel = time ? <span className={styles.time}>{formatTime(time)}</span> : null;

  return (
    <div className={`${styles.row} ${isUser ? styles.user : styles.assistant}`}>
      {!isUser && <CharacterStage size="sm" />}
      <div className={styles.col}>
        <div className={styles.line}>
          {isUser && timePosition === 'side' && timeLabel}
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
          {!isUser && timePosition === 'side' && timeLabel}
        </div>
        {timePosition === 'below' && timeLabel}
      </div>
    </div>
  );
}
