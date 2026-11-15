import { Fragment } from 'react';
import { UNSURE_LABEL } from './constants';
import { hasBatchim } from './korean';

// 고른 감정을 "'분노'이야", "'화남'과 '불안'이야", "'분노', '답답함'과 '억울함'이야" 처럼 보여 준다.
// 감정 단어(따옴표 포함)는 highlightClassName 으로 감싸 색을 바꿀 수 있다.
// TODO: '해당없음' 문구는 시안에 없어 임시 문구
export function formatEmotions(emotions, highlightClassName) {
  const picked = emotions.filter((e) => e !== UNSURE_LABEL);
  if (picked.length === 0) return '딱 맞는 감정은 없었어';

  const word = (e) => <span className={highlightClassName}>{`‘${e}’`}</span>;
  const last = picked[picked.length - 1];

  return (
    <>
      {picked.slice(0, -1).map((e, i) => {
        const isBeforeLast = i === picked.length - 2;
        return (
          <Fragment key={e}>
            {word(e)}
            {isBeforeLast ? (hasBatchim(e) ? '과 ' : '와 ') : ', '}
          </Fragment>
        );
      })}
      {word(last)}
      {hasBatchim(last) ? '이야' : '야'}
    </>
  );
}
