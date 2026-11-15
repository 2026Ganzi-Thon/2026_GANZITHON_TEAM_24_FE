import CharacterStage from './CharacterStage';
import styles from './ChatBubble.module.css';

// "오후 7:24" 모양
function formatTime(timestamp) {
  return new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }).format(
    timestamp,
  );
}

// role: 'assistant'(캐릭터, 왼쪽 + 아바타) | 'user'(나, 오른쪽)
// showAvatar: false 면 아바타 자리를 비워 두고 정렬만 맞춘다 (말풍선 묶음의 두 번째부터)
// time: 보내면 시각을 보여 준다. timePosition 'side'(말풍선 옆 아래, 기본) | 'below'(말풍선 아래)
// typing: 캐릭터가 답을 쓰는 중 (점 세 개)
export default function ChatBubble({
  role = 'assistant',
  showAvatar = true,
  time,
  timePosition = 'side',
  typing = false,
  children,
}) {
  const isUser = role === 'user';
  const timeLabel = time ? <span className={styles.time}>{formatTime(time)}</span> : null;

  return (
    <div className={`${styles.row} ${isUser ? styles.user : styles.assistant}`}>
      {!isUser &&
        (showAvatar ? <CharacterStage size="sm" /> : <span className={styles.avatarGap} aria-hidden="true" />)}
      <div className={styles.col}>
        <div className={styles.line}>
          {isUser && timePosition === 'side' && timeLabel}
          <div className={styles.bubble}>
            {typing ? (
              <span className={styles.dots} role="status" aria-label="입력 중">
                <i />
                <i />
                <i />
              </span>
            ) : (
              children
            )}
          </div>
          {!isUser && timePosition === 'side' && timeLabel}
        </div>
        {timePosition === 'below' && timeLabel}
      </div>
    </div>
  );
}
