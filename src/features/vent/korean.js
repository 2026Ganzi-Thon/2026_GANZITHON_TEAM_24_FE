// 이름 뒤에 붙는 조사를 받침에 맞게 고른다 (닉네임·캐릭터 이름이 사용자마다 달라서 필요하다)

// 마지막 글자가 받침 있는 한글인지 (한글이 아니면 받침 없음으로 본다)
export function hasBatchim(word) {
  const code = String(word).charCodeAt(String(word).length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

// 받침이 있으면 withFinal, 없으면 without 을 붙인다   예) josa('선우', '은', '는') → '선우는'
export function josa(word, withFinal, without) {
  return `${word}${hasBatchim(word) ? withFinal : without}`;
}

// 부르는 말: 선우 → 선우야, 민경 → 민경아
export const callName = (name) => josa(name, '아', '야');
// 은/는, 이/가, 과/와
export const topic = (name) => josa(name, '은', '는');
export const subject = (name) => josa(name, '이', '가');
export const together = (name) => josa(name, '과', '와');
