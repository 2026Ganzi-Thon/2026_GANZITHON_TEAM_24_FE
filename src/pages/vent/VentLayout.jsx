import { Outlet } from 'react-router-dom';
import { getBackground } from '../../features/character/backgrounds';
import { useCharacterStore } from '../../features/character/store';
import styles from './VentLayout.module.css';

// 하소연 흐름 전용 풀스크린 레이아웃 (메뉴 없음).
// 가운데에 최대 480px 세로 열을 두고, 열 안에 Figma와 같은 흐린 배경을 직접 그린다.
//   - 사진(.photo): 헤더 아래부터, 5px 블러 (사진에만 건다)
//   - 덮개(.tint): 위는 투명 → 60.6% 지점부터 아래는 연한 파랑
// 배경은 A파트가 고른 배경(backgroundId)을 그대로 쓰므로 어떤 배경이든 같은 블러가 적용된다.
// 헤더는 각 페이지가 VentHeader 로 직접 그린다.
export default function VentLayout() {
  const backgroundId = useCharacterStore((s) => s.backgroundId);
  const bg = getBackground(backgroundId);
  const photoStyle = bg.image ? { backgroundImage: `url(${bg.image})` } : { background: bg.color };

  return (
    <div className={styles.shell}>
      <div className={styles.column}>
        <div className={styles.backdrop} aria-hidden="true">
          <div className={styles.photo} style={photoStyle} />
          <div className={styles.tint} />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
