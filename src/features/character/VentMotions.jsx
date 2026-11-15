import { useEffect, useEffectEvent, useId } from 'react';
import CharacterPortrait from './CharacterPortrait';
import './vent-motions.css';

const resting = { eyes: 'resting', eyebrows: 'DEFAULT', mouth: 'STYLE_4' };
const smiling = { eyes: 'STYLE_6', eyebrows: 'DEFAULT', mouth: 'STYLE_3' };
const determined = { eyes: 'STYLE_2', eyebrows: 'tense', mouth: 'STYLE_6' };
const uneasy = { eyes: 'STYLE_2', eyebrows: 'tense', mouth: 'STYLE_5' };

const disposalDuration = { tear: 1550, burn: 2200, evaporate: 2800 };
const feedback = {
  relieved: { expression: resting, message: '마음이 조금 편안해졌어요.' },
  uneasy: { expression: uneasy, message: '아직 마음이 불편해요.' },
};
const flamePositions = [4, 15, 26, 38, 49, 60, 72, 83, 95];
const smokePositions = [3, 26, 48, 72, 96, 15, 37, 62, 85];

export function VentBreathingMotion({ character, className = '' }) {
  return (
    <div className={`vent-breathing ${className}`} aria-label="천천히 심호흡하는 캐릭터" role="img">
      <span className="vent-breathing__ring" aria-hidden="true" />
      <CharacterPortrait character={character} expression={resting} />
    </div>
  );
}

export function VentFeedbackMotion({ character, mood, className = '' }) {
  const reaction = feedback[mood];
  return (
    <div className={`vent-feedback ${className}`} data-mood={reaction ? mood : undefined}>
      <div className="vent-feedback__visual" key={mood} aria-hidden="true">
        <CharacterPortrait character={character} expression={reaction?.expression ?? smiling} />
      </div>
      <p className="vent-feedback__message" role="status">{reaction?.message}</p>
    </div>
  );
}

// 완료 화면의 기분 카드처럼 작게 쓰는 정적인 표정 (모션 없음). mood: 'relieved' | 'uneasy'
export function VentMoodFace({ character, mood, className = '' }) {
  const reaction = feedback[mood];
  return (
    <span className={`vent-mood-face ${className}`} aria-hidden="true">
      <CharacterPortrait character={character} expression={reaction?.expression ?? smiling} />
    </span>
  );
}

function TearMask({ id }) {
  return (
    <svg className="vent-disposal__defs" width="0" height="0" aria-hidden="true">
      <defs>
        <mask id={id} maskContentUnits="objectBoundingBox">
          <path className="vent-disposal__tear-left" fill="white"
            d="M-1 0H.5L.473 .1 .518 .19 .478 .29 .513 .39 .48 .5 .522 .6 .475 .7 .505 .8 .469 .9 .5 1H-1Z" />
          <path className="vent-disposal__tear-right" fill="white"
            d="M2 0H.5L.473 .1 .518 .19 .478 .29 .513 .39 .48 .5 .522 .6 .475 .7 .505 .8 .469 .9 .5 1H2Z" />
        </mask>
      </defs>
    </svg>
  );
}

function FireEffect() {
  return (
    <>
      <div className="vent-disposal__match"><span /></div>
      <div className="vent-disposal__fire">
        {flamePositions.map((position, index) => (
          <svg key={position} className="vent-disposal__flame" viewBox="0 0 82 114" preserveAspectRatio="none"
            style={{ '--x': `${position}%`, '--flame-delay': `${index * -93}ms` }}>
            <path fill="#ed4c24" d="M40 0C67 23 52 41 65 55c5-8 5-14 6-20C93 66 85 114 43 114 9 114-8 94 5 66c1 11 9 15 11 15C4 56 33 43 40 0Z" />
            <path fill="#ffad36" d="M44 32c14 26 0 37 12 48l7-10c10 19-1 44-22 44-20 0-28-15-23-30l10 8c-7-24 11-34 16-60Z" />
            <path fill="#ffedb1" d="M41 73c3 15 15 23 11 32-5 12-21 10-24 1-3-10 9-16 13-33Z" />
          </svg>
        ))}
      </div>
    </>
  );
}

function SmokeEffect() {
  const gradientId = useId();

  return (
    <div className="vent-disposal__smoke">
      <svg className="vent-disposal__defs" width="0" height="0">
        <defs>
          <linearGradient id={gradientId} x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="62%" stopColor="#fff" />
            <stop offset="100%" stopColor="#dce6f3" />
          </linearGradient>
        </defs>
      </svg>
      {smokePositions.map((position, index) => (
        <svg key={position} className="vent-disposal__cloud" viewBox="0 0 180 108"
          style={{ '--x': `${position}%`, '--smoke-delay': `${index * 32}ms` }}>
          <path fill={`url(#${gradientId})`}
            d="M32 100C14 100 4 90 4 76c0-13 10-23 24-25 0-18 14-32 32-32 5 0 10 1 14 4C81 10 92 4 107 4c21 0 38 15 40 36 17 0 29 13 29 30 0 18-13 30-31 30Z" />
        </svg>
      ))}
    </div>
  );
}

export function VentDisposalMotion({ character, method, onComplete, children, className = '' }) {
  const maskId = useId();
  const duration = Object.hasOwn(disposalDuration, method) ? disposalDuration[method] : 0;
  const playing = Boolean(duration);
  const complete = useEffectEvent(() => onComplete?.(method));

  useEffect(() => {
    if (!duration) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => complete(), reducedMotion ? 180 : duration);
    return () => window.clearTimeout(timer);
  }, [duration, method]);

  const screenStyle = method === 'tear' ? { '--tear-mask': `url("#${maskId}")` } : undefined;
  const expression = method === 'evaporate' ? smiling : determined;

  return (
    <div className={`vent-disposal ${className}`} data-method={playing ? method : undefined}
      style={playing ? { '--disposal-duration': `${duration}ms` } : undefined}>
      {method === 'tear' && <TearMask id={maskId} />}
      <div className="vent-disposal__screen" style={screenStyle} inert={playing}>
        {children}
        {!playing && (
          <div className="vent-disposal__actor">
            <CharacterPortrait character={character} expression={expression} />
          </div>
        )}
      </div>
      {playing && (
        <div className="vent-disposal__effects" aria-hidden="true" key={method}>
          <div className="vent-disposal__actor vent-disposal__actor--moving">
            <CharacterPortrait character={character} expression={expression} />
          </div>
          {method === 'burn' && <FireEffect />}
          {method === 'evaporate' && <SmokeEffect />}
        </div>
      )}
    </div>
  );
}
