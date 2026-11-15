import exitIcon from '../../assets/icons/exit.svg';

// 나가기 아이콘 (상자에서 화살표가 나가는 모양). Figma 'exit' 에셋을 그대로 쓴다 (41×41, 남색).
// 하소연 흐름 헤더, 커스터마이징, 놀이터·칭찬 화면이 함께 쓴다.
export default function ExitIcon({ size = 41, ...props }) {
  return (
    <img src={exitIcon} alt="" width={size} height={size} aria-hidden="true" draggable="false" {...props} />
  );
}
