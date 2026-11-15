// 하소연 화면이 쓰는 캐릭터 모션은 항상 이 파일에서 가져온다 (A파트 VentMotions).
//
//   VentBreathingMotion({ character })                                진정하기
//   VentDisposalMotion({ character, method, onComplete, children })   감정 버리기 (화면 전체를 감싼다)
//   VentFeedbackMotion({ character, mood })                           완료 (가운데 캐릭터)
//   VentMoodFace({ character, mood })                                 완료 (아래 작은 기분 카드의 정적 표정)
export {
  VentBreathingMotion,
  VentDisposalMotion,
  VentFeedbackMotion,
  VentMoodFace,
} from '../character/VentMotions';
