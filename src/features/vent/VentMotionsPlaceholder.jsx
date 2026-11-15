import { useEffect, useEffectEvent } from 'react';
import CharacterStage from './components/CharacterStage';
import styles from './VentMotionsPlaceholder.module.css';

// A파트 VentMotions(feat/customization)와 같은 이름·같은 props 의 임시 구현.
// 화면은 motions.js 를 통해서만 가져다 쓰므로, A파트 브랜치를 합친 뒤 motions.js 한 줄만 바꾸고 이 파일은 지운다.
// (character 는 A파트 컴포넌트가 쓰는 값이라 여기서는 받기만 한다)

const DISPOSAL_METHODS = ['tear', 'burn', 'evaporate'];
const PLACEHOLDER_DURATION = 700; // 실제 모션은 1.5~2.8초. 임시 구현은 짧게 기다렸다가 끝낸다
const FEEDBACK_MESSAGES = {
  relieved: '마음이 조금 편안해졌어요.',
  uneasy: '아직 마음이 불편해요.',
};

// 진정하기: 천천히 숨쉬는 캐릭터
export function VentBreathingMotion({ className = '' }) {
  return (
    <div className={className}>
      <CharacterStage motion="breathing" size="lg" />
    </div>
  );
}

// 완료: 가운데 캐릭터 + 기분 메시지. mood: null(웃는 표정) | 'relieved' | 'uneasy'
export function VentFeedbackMotion({ mood, className = '' }) {
  const message = FEEDBACK_MESSAGES[mood];
  return (
    <div className={`${styles.feedback} ${className}`} data-mood={message ? mood : undefined}>
      <CharacterStage motion={mood ?? 'happy'} size="lg" />
      <p className={styles.message} role="status">
        {message}
      </p>
    </div>
  );
}

// 감정 버리기: 사라질 화면 전체(배경 포함)를 children 으로 감싼다.
// method: null(대기) | 'tear' | 'burn' | 'evaporate'. 정해지면 재생하고 끝나면 onComplete(method)
export function VentDisposalMotion({ method, onComplete, children, className = '' }) {
  const playing = DISPOSAL_METHODS.includes(method);
  const complete = useEffectEvent(() => onComplete?.(method));

  useEffect(() => {
    if (!playing) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => complete(), reducedMotion ? 0 : PLACEHOLDER_DURATION);
    return () => window.clearTimeout(timer);
  }, [playing, method]);

  return (
    <div
      className={`${styles.disposal} ${className}`}
      data-method={playing ? method : undefined}
      inert={playing}
    >
      {children}
      <div className={styles.actor}>
        <CharacterStage motion="sly" size="lg" />
      </div>
    </div>
  );
}
