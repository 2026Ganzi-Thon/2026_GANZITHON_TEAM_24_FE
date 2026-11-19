import { useCallback, useEffect, useRef, useState } from 'react';

// 마이크 권한 요청 + 녹음.
// 권한 창(시안의 '음성 권한' 화면)은 getUserMedia 를 부르면 브라우저/휴대폰이 직접 띄운다.
// 녹음한 소리는 이 화면의 메모리에만 두고, 정지(stop)하면 onRecorded(blob)로 한 번 넘긴 뒤 버린다.
// 화면을 떠나면 녹음을 버리고 아무 데도 보내지 않는다.
//
// status: 'idle' | 'requesting'(권한 창 떠 있음) | 'listening'(녹음 중)

// 브라우저마다 녹음 형식이 다르다 (안드로이드 크롬=webm, 아이폰 사파리=mp4). 되는 것을 고른다.
const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
const MAX_RECORDING_MS = 60_000;

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
  return MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

export function useMicrophone({ onRecorded } = {}) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const stopTimerRef = useRef(null);
  const chunksRef = useRef([]);
  const aliveRef = useRef(true);
  const onRecordedRef = useRef(onRecorded);

  useEffect(() => {
    onRecordedRef.current = onRecorded;
  });

  const releaseStream = () => {
    window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  // 녹음 중이던 것을 버린다 (콜백 없이)
  const discardRecording = () => {
    const recorder = recorderRef.current;
    recorderRef.current = null;
    chunksRef.current = [];
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      if (recorder.state !== 'inactive') recorder.stop();
    }
    releaseStream();
  };

  const stop = useCallback(() => {
    window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      discardRecording();
      setStatus('idle');
      return;
    }
    recorder.onstop = () => {
      const type = recorder.mimeType || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type });
      recorderRef.current = null;
      chunksRef.current = [];
      releaseStream();
      if (aliveRef.current) {
        setStatus('idle');
        onRecordedRef.current?.(blob);
      }
    };
    recorder.stop();
  }, []);

  const start = useCallback(async () => {
    setError('');
    // http 로 휴대폰에서 접속하는 등 보안 연결이 아니면 마이크 API 자체가 없다
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('이 환경에서는 마이크를 쓸 수 없어요. (https 주소나 localhost에서만 가능해요)');
      return false;
    }

    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!aliveRef.current) {
        // 권한 창이 떠 있는 동안 화면을 떠났으면 바로 끈다
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;
      recorder.start();
      stopTimerRef.current = window.setTimeout(stop, MAX_RECORDING_MS);
      setStatus('listening');
      return true;
    } catch (e) {
      discardRecording();
      if (!aliveRef.current) return false;
      setStatus('idle');
      if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') {
        setError('마이크 권한이 필요해요. 브라우저 설정에서 이 사이트의 마이크 접근을 허용해 주세요.');
      } else if (e?.name === 'NotFoundError') {
        setError('연결된 마이크를 찾지 못했어요.');
      } else {
        setError('마이크를 켜지 못했어요. 다시 시도해 주세요.');
      }
      return false;
    }
  }, [stop]);

  // 화면을 떠나면 마이크를 반드시 끄고 녹음은 버린다
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      discardRecording();
    };
  }, []);

  return { status, error, start, stop };
}
