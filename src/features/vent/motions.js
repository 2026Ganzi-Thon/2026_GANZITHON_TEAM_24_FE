// 하소연 화면이 쓰는 캐릭터 모션은 항상 이 파일에서 가져온다 (갈아끼우는 자리 한 곳).
//
//   VentBreathingMotion({ character })                         진정하기
//   VentDisposalMotion({ character, method, onComplete, children })  감정 버리기 (화면 전체를 감싼다)
//   VentFeedbackMotion({ character, mood })                    완료
//
// TODO(A파트 연결): A파트 feat/customization 이 develop 에 합쳐지면
//   1) 아래 줄을 지우고 바로 밑 주석의 줄로 교체
//   2) VentMotionsPlaceholder.jsx(+.module.css) 삭제
//   3) 버리기 화면에서 모션 컴포넌트의 크기·캐릭터 위치가 맞는지 확인
// export { VentBreathingMotion, VentDisposalMotion, VentFeedbackMotion } from '../character/VentMotions';
export {
  VentBreathingMotion,
  VentDisposalMotion,
  VentFeedbackMotion,
} from './VentMotionsPlaceholder';
