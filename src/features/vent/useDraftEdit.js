import { useState } from 'react';
import { useVentStore } from './store';

// 2단계 초안 화면(원했던 반응·3인칭·만약-그러면)의 "말풍선 안에서 고치기" 상태.
//   key           : 이 화면 이름 (고쳤는지 기억하는 데 쓴다)   예) 'situation'
//   read(result)  : store 의 result 에서 고칠 값들을 꺼낸다      예) r => ({ situation: r.situation })
//   write(values) : 고친 값을 result 에 덮어쓸 모양으로 바꾼다   예) v => ({ situation: v.situation })
// AI 실패(fallback)로 고칠 값이 하나라도 비어 있으면 처음부터 고치기 상태로 연다.
export function useDraftEdit(key, read, write) {
  const result = useVentStore((s) => s.result);
  const edited = useVentStore((s) => s.editedFields.includes(key));
  const updateResult = useVentStore((s) => s.updateResult);

  const saved = result ? read(result) : {};
  const hasEmpty = Object.values(saved).some((v) => !v?.trim());

  const [editing, setEditing] = useState(hasEmpty);
  const [values, setValues] = useState(saved);

  const setValue = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const start = () => {
    setValues(saved);
    setEditing(true);
  };

  const cancel = () => {
    setValues(saved);
    setEditing(false);
  };

  const save = () => {
    const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, (v ?? '').trim()]));
    updateResult(write(trimmed), key);
    setValues(trimmed);
    setEditing(false);
  };

  return { saved, values, editing, edited, setValue, start, cancel, save };
}
