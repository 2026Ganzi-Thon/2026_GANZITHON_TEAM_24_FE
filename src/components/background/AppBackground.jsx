import { useCharacterStore } from '../../features/character/store';
import { getBackground } from '../../features/character/backgrounds';

// 커스터마이징에서 고른 배경을 화면 뒤에 깔아준다
export default function AppBackground() {
  const backgroundId = useCharacterStore((s) => s.backgroundId);
  const bg = getBackground(backgroundId);

  const style = bg.image
    ? { backgroundImage: `url(${bg.image})` }
    : { background: bg.color };

  return <div className="app-background" style={style} aria-hidden="true" />;
}
