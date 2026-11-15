import styles from './CharacterStage.module.css';

// ★ A파트가 만든 캐릭터(모션 포함)를 가져오는 곳은 이 파일 한 곳뿐이다.
// 지금은 자리표시만 그린다. A파트 컴포넌트가 완성되면 아래 내용을 그 컴포넌트로 바꾼다.
//
// 진정·버리기·완료의 큰 모션은 motions.js(A파트 VentMotions)로 옮겼고, 여기는 말풍선 옆 작은 아바타(sm)와
// 완료 화면의 기분 카드가 쓴다. 임시 구현(VentMotionsPlaceholder)도 이 자리표시를 쓴다.
//   motion: 'idle' | 'listening' | 'breathing'   (breathing 만 임시 애니메이션이 있다)
//   size:   'sm' (말풍선 옆 아바타·기분 카드) | 'lg' (임시 구현의 큰 캐릭터)
export default function CharacterStage({ motion = 'idle', size = 'lg' }) {
  const classes = [styles.stage, styles[size], motion === 'breathing' && styles.breathing]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="img" aria-label="캐릭터">
      <div className={styles.blob} />
      {size === 'lg' && <span className={styles.label}>캐릭터 자리</span>}
    </div>
  );
}
