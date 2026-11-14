import { useCallback, useEffect, useRef, useState } from 'react';

// 마이크 권한 요청 + "듣는 중" 상태.
// 권한 창(시안의 '음성 권한' 화면)은 getUserMedia 를 부르면 브라우저/휴대폰이 직접 띄운다.
// 녹음한 소리는 아직 어디에도 보내지 않는다.
// TODO: STT 업체가 정해지면 녹음(MediaRecorder) → POST /stt → 받은 text 를 입력창에 넣기
//
// status: 'idle' | 'requesting'(권한 창 떠 있음) | 'listening'
export function useMicrophone() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const streamRef = useRef(null);
  const aliveRef = useRef(true);

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const stop = useCallback(() => {
    releaseStream();
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    setError('');
    // http 로 휴대폰에서 접속하는 등 보안 연결이 아니면 마이크 API 자체가 없다
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('이 환경에서는 마이크를 쓸 수 없어요. (https 주소나 localhost에서만 가능해요)');
      return;
    }

    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!aliveRef.current) {
        // 권한 창이 떠 있는 동안 화면을 떠났으면 바로 끈다
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setStatus('listening');
    } catch (e) {
      if (!aliveRef.current) return;
      setStatus('idle');
      if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') {
        setError('마이크 권한이 필요해요. 브라우저 설정에서 이 사이트의 마이크 접근을 허용해 주세요.');
      } else if (e?.name === 'NotFoundError') {
        setError('연결된 마이크를 찾지 못했어요.');
      } else {
        setError('마이크를 켜지 못했어요. 다시 시도해 주세요.');
      }
    }
  }, []);

  // 화면을 떠나면 마이크를 반드시 끈다
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      releaseStream();
    };
  }, []);

  return { status, error, start, stop };
}
