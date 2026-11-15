// 하소연 흐름에서 쓰는 아이콘.
// 나가기·마이크·전송은 Figma 에셋(src/assets/icons)을 쓰고, Figma에 없는 '듣기 멈추기'(■)만 여기서 그린다.
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

// 나가기 아이콘은 A파트 화면(커스터마이징·놀이터·칭찬)과 같이 쓰므로 공통 위치에 있다
export { default as ExitIcon } from '../../../components/icons/ExitIcon';

export function StopIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
