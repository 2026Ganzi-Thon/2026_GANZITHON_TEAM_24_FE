import { getBackground } from '../../character/backgrounds';
import { useCharacterStore } from '../../character/store';
import styles from './VentBackdrop.module.css';

// 하소연 흐름의 흐린 배경 (Figma와 같은 값)
//   - 사진(.photo): 헤더 아래부터, 5px 블러 (사진에만 건다)
//   - 덮개(.tint): 위는 투명 → 60.6% 지점부터 아래는 연한 파랑
// 배경은 A파트가 고른 배경(backgroundId)을 그대로 쓰므로 어떤 배경이든 같은 블러가 적용된다.
// 부모에 position: relative + isolation: isolate 가 있어야 화면 내용 뒤에 깔린다.
export default function VentBackdrop() {
  const backgroundId = useCharacterStore((s) => s.backgroundId);
  const bg = getBackground(backgroundId);
  const photoStyle = bg.image ? { backgroundImage: `url(${bg.image})` } : { background: bg.color };

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.photo} style={photoStyle} />
      <div className={styles.tint} />
    </div>
  );
}
