import { useEffect, useRef } from 'react';
import { CHAT_MAX_LENGTH } from '../constants';
import ChatBubble from './ChatBubble';
import styles from './DraftBubble.module.css';

// 내용에 맞춰 높이가 늘어나는 글 상자
function AutoTextarea({ value, onChange, autoFocus, label }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      className={styles.textarea}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="직접 적어 주세요"
      maxLength={CHAT_MAX_LENGTH}
      rows={2}
      autoFocus={autoFocus}
      aria-label={label}
    />
  );
}

// AI 초안 말풍선: [라벨 · 태그] + 고칠 수 있는 글 덩어리들
//   label  : '필요했던, 원했던 반응' 처럼 파란 굵은 제목
//   tag    : 'AI 초안' | 'AI 제안'. 사용자가 고쳤으면(edited) '내가 고친 글'로 바뀐다
//   parts  : [{ key, value, onChange, label? }] — editing 이면 각각 말풍선 안에서 바로 글 상자로 바뀐다
export default function DraftBubble({
  label,
  tag = 'AI 초안',
  edited = false,
  parts,
  editing = false,
  autoFocus = false,
  showAvatar = false,
}) {
  return (
    <ChatBubble showAvatar={showAvatar}>
      <p className={styles.head}>
        <strong>{label}</strong>
        {` ∙ ${edited ? '내가 고친 글' : tag}`}
      </p>
      <div className={styles.parts}>
        {parts.map((part, i) =>
          editing ? (
            <AutoTextarea
              key={part.key}
              value={part.value}
              onChange={part.onChange}
              autoFocus={autoFocus && i === 0}
              label={`${part.label ?? label} 고치기`}
            />
          ) : (
            <p key={part.key} className={part.value ? styles.value : styles.empty}>
              {part.value || '적지 않았어요'}
            </p>
          ),
        )}
      </div>
    </ChatBubble>
  );
}
