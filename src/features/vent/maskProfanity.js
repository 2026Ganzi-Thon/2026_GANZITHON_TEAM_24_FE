// 화면에 보이는 글에서만 욕설을 ** 로 가린다. 서버에는 원문을 보낸다(위기 감지 때문).
// TODO: 욕설 목록과 가리는 방식은 팀과 확정 (지금은 임시 목록)
const BAD_WORDS = ['씨발', '시발', 'ㅅㅂ', '병신', 'ㅂㅅ', '개새끼', '좆', '존나', '지랄'];
const pattern = new RegExp(BAD_WORDS.join('|'), 'g');

export function maskProfanity(text) {
  return text.replace(pattern, '**');
}
