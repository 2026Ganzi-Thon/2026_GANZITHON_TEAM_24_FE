const ink = '#543932';
const GLASSES_STYLE = 'STYLE_6';

const browPaths = {
  STYLE_2: 'M-6 0h12',
  STYLE_3: 'M-6 1q6-5 12-1',
  STYLE_4: 'M-6-2Q0 3 6-2',
  STYLE_5: 'M-6 2 6-2',
  STYLE_6: 'M-4 1q4-4 8 0',
};

const smilePaths = {
  STYLE_4: 'M93 97q7 9 14 0',
  STYLE_5: 'M93 102q7-10 14 0',
  STYLE_6: 'M92 100q8 4 16-4',
};

const previewBounds = {
  eyes: '65 71 70 26',
  eyebrows: '66 57 68 25',
  nose: '86 77 28 28',
  mouth: '84 89 32 27',
  accessory: '44 0 118 69',
};

export function CharacterPartPreview({ kind, style }) {
  const viewBox = kind === 'accessory' && style === GLASSES_STYLE ? '54 67 92 35' : previewBounds[kind];
  return <svg viewBox={viewBox} aria-hidden="true"><CharacterPart kind={kind} style={style} /></svg>;
}

function Eye({ x, style, right }) {
  if (style === 'STYLE_6' || (style === 'STYLE_4' && right)) {
    return <path d={`M${x - 6} 86q6-9 12 0`} stroke={ink} strokeWidth="2.7" strokeLinecap="round" fill="none" />;
  }

  const sleepy = style === 'STYLE_2';
  const bright = style === 'STYLE_3';
  return (
    <g transform={`translate(${x} 84)`}>
      {sleepy ? <path d="M-6-3H6C6 9-6 9-6-3Z" fill={ink} />
        : <ellipse rx={bright ? 7 : 6} ry={style === 'STYLE_5' ? 9 : 8} fill={ink} />}
      {bright ? <path d="M0-5Q1-1 5 0 1 1 0 5-1 1-5 0-1-1 0-5Z" fill="#fff3dc" />
        : <ellipse cx="-1.1" cy={sleepy ? .5 : -3} rx="1.7" ry="2" fill="#fff9ec" />}
      {!sleepy && <ellipse cx="1.5" cy="4" rx="2" ry="1" fill="#a87660" opacity=".45" />}
    </g>
  );
}

function Accessory({ style, cap, band }) {
  switch (style) {
    case 'STYLE_2':
      return <g transform="translate(100 35)" fill="#ffcb68" stroke="#e3a14b" strokeWidth="1.4">
        <path d="M-4 0C-34-23-35 20-4 7ZM4 0C32-23 35 20 4 7Z" />
        <rect x="-6" y="-4" width="12" height="13" rx="5" fill="#ffdf8e" />
      </g>;
    case 'STYLE_3':
      return <g><path d="M78 37 99 6l22 31q-21 8-43 0Z" fill="#ffabc5" />
        <path d="m86 25 27 2m-32 6 37 2" stroke="#fff1df" strokeWidth="3" />
        <circle cx="99" cy="6" r="4" fill="#fff2cf" /></g>;
    case 'STYLE_5':
      return <g><path d="M53 49q45-22 94 0l-4 13q-43-18-86 0Z" fill="#ed8fa9" />
        <path d="M56 54q44-20 88 0m-86 4q42-17 84 0" stroke="#ffe1ea" strokeWidth="2" fill="none" /></g>;
    case GLASSES_STYLE:
      return <g stroke="#875944" strokeWidth="1.9" fill="none">
        <circle cx="79" cy="84" r="12" /><circle cx="121" cy="84" r="12" />
        <path d="M91 83q9-7 18 0M66 81l-8-4m76 4 8-4" />
      </g>;
    case 'STYLE_1':
      return <g><path d="M52 52C56 11 130 2 148 51Z" fill={cap} />
        <path d="M100 16q-14 9-18 29m20-29q14 10 17 28" fill="none" stroke="#879bce" strokeWidth="2" />
        <ellipse cx="101" cy="52" rx="50" ry="8" fill={band} /></g>;
    default:
      return <g>
        <path d="M53 49C70 16 95 3 120 11c23 8 31 30 41 43-16 7-26 2-39-6-20-11-44-6-69 1Z"
          fill={style === 'STYLE_4' ? '#b8a1de' : cap} />
        <path d="M92 18c23-4 36 10 48 27-18-13-29-19-48-27Z" fill="#f2efff" opacity=".27" />
        <path d="M53 45c27-13 63-11 90 9l-6 9c-31-18-60-20-89-8Z" fill={band} />
        <circle cx="157" cy="56" r="10" fill={band} />
      </g>;
  }
}

export function CharacterPart({ kind, style, winkSide, cap = '#aebdf0', band = '#e9ebff' }) {
  switch (kind) {
    case 'eyes':
      return <g>
        <Eye x={79} style={winkSide ? (winkSide === 'left' ? 'STYLE_6' : 'HAPPY') : style} />
        <Eye x={121} style={winkSide ? (winkSide === 'right' ? 'STYLE_6' : 'HAPPY') : style} right />
      </g>;
    case 'eyebrows': {
      const path = browPaths[style] ?? 'M-6 1q6-6 12 0';
      return <g fill="none" stroke={ink} strokeWidth="2.3" strokeLinecap="round" opacity=".76">
        <path d={path} transform="translate(79 68)" />
        <path d={path} transform="translate(121 68) scale(-1 1)" />
      </g>;
    }
    case 'nose':
      switch (style) {
        case 'STYLE_1': return <path d="M100 93c-11-5-5-10 0-6 5-4 11 1 0 6Z" fill="#df8a7a" />;
        case 'STYLE_2': return <ellipse cx="100" cy="90" rx="4.5" ry="2.2" fill="#bc7d6c" />;
        case 'STYLE_3': return <circle cx="100" cy="90" r="3.1" fill="#bf796c" />;
        case 'STYLE_4': return <path d="M96 87h8q1 0 0 2l-2 3q-2 2-4 0l-2-3q-1-2 0-2Z" fill="#df917a" />;
        case 'STYLE_5': return <path d="M95 88q5 3 10 0-1 8-5 7-4-1-5-7Z" fill="#df917a" />;
        case 'STYLE_6': return <path d="M100 85q8 9 0 10-8-1 0-10Z" fill="#df917a" />;
        default: return null;
      }
    case 'mouth':
      if (smilePaths[style]) {
        return <path d={smilePaths[style]} fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />;
      }
      if (style === 'STYLE_2') {
        return <g><ellipse cx="100" cy="102" rx="4.5" ry="6.5" fill="#754137" />
          <ellipse cx="100" cy="103" rx="2.4" ry="3.7" fill="#ea9084" /></g>;
      }
      return <g transform={style === 'STYLE_3' ? 'translate(-15 -10) scale(1.15 1.1)' : undefined}>
        <path d="M91 96q9 4 18 0c-1 8-5 12-9 12s-8-4-9-12Z" fill="#754137" />
        <path d="M95 104q5-6 10 0-2 4-5 4t-5-4Z" fill="#f18a82" />
      </g>;
    case 'accessory':
      if (style == null || style === '') return null;
      return style === GLASSES_STYLE ? <g>
        <Accessory cap={cap} band={band} />
        <Accessory style={style} cap={cap} band={band} />
      </g> : <Accessory style={style} cap={cap} band={band} />;
    default:
      return null;
  }
}
