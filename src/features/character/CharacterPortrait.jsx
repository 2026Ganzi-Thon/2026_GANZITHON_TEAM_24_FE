import { useId } from 'react';
import { CharacterPart } from './CharacterParts';
import './portrait.css';

export const defaultCharacter = {
  name: '말랑이',
  color: 'PEACH',
  eyes: 'STYLE_1',
  nose: 'DEFAULT',
  mouth: 'DEFAULT',
  eyebrows: 'DEFAULT',
  accessory: 'NIGHTCAP',
};

const palettes = {
  PEACH: ['#fff6e9', '#ffdfc8', '#dc9b7d'],
  PINK: ['#fff1f6', '#ffc8dd', '#d98cae'],
  YELLOW: ['#fff9d9', '#ffe397', '#dcb263'],
  BLUE: ['#edfaff', '#bfe2ff', '#80a9d6'],
  GRAY: ['#faf8f8', '#ded9db', '#a49ba4'],
  LAVENDER: ['#f9f0ff', '#e4ccfa', '#a994d2'],
  MINT: ['#effff5', '#c2efda', '#7eb59f'],
};

export default function CharacterPortrait({ character = defaultCharacter, className = '', poke }) {
  const id = useId();
  const { color, eyes, nose, mouth, eyebrows, accessory } = { ...defaultCharacter, ...character };
  const [light, middle, shade] = palettes[color] ?? palettes.PEACH;
  const fill = (name) => `url(#${id}-${name})`;
  const eyeStyle = { SLEEPY: 'STYLE_6', WINK: 'STYLE_4' }[eyes] ?? eyes;

  return (
    <svg className={`character-art ${className}`} viewBox="0 0 200 159" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id + '-body'} cx="42%" cy="27%" r="77%">
          <stop stopColor={light} />
          <stop offset=".7" stopColor={middle} />
          <stop offset="1" stopColor={shade} />
        </radialGradient>
        <radialGradient id={id + '-limb'} cx="40%" cy="23%" r="82%">
          <stop stopColor={light} />
          <stop offset=".62" stopColor={middle} />
          <stop offset="1" stopColor={shade} />
        </radialGradient>
        <radialGradient id={id + '-blush'}>
          <stop stopColor="#f18580" stopOpacity=".43" />
          <stop offset="1" stopColor="#f18580" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id + '-cap'} x2=".7" y2="1">
          <stop stopColor="#e0eaff" />
          <stop offset=".56" stopColor="#a7b8ee" />
          <stop offset="1" stopColor="#768acb" />
        </linearGradient>
        <linearGradient id={id + '-band'} x2=".12" y2="1">
          <stop stopColor="#fbf6ff" />
          <stop offset="1" stopColor="#bfc8ef" />
        </linearGradient>
        {poke && <linearGradient id={id + '-finger'} x2="0" y2="1">
          <stop stopColor="#ffe3ce" />
          <stop offset="1" stopColor="#e3a17f" />
        </linearGradient>}
      </defs>
      <ellipse cx="100" cy="150" rx="69" ry="6" fill="#564352" opacity=".12" />
      <path d="M31 108C29 79 45 48 64 35c20-15 47-16 65-4 28 16 43 49 40 77-3 29-25 44-68 44-35 0-67-15-70-44Z" fill={fill('body')} />
      <path d="M42 94c-10-11-23-13-30-3-10 15 3 34 23 36 11 1 17-8 16-17-1-7-4-12-9-16Z" fill={fill('limb')} />
      <path d="M158 94c10-11 23-13 30-3 10 15-3 34-23 36-11 1-17-8-16-17 1-7 4-12 9-16Z" fill={fill('limb')} />
      <path d="M62 123c-16 0-25 12-23 23 2 9 13 12 26 11 13-1 22-8 20-18-1-9-10-16-23-16Z" fill={fill('limb')} />
      <path d="M138 123c16 0 25 12 23 23-2 9-13 12-26 11-13-1-22-8-20-18 1-9 10-16 23-16Z" fill={fill('limb')} />
      <g className={poke?.side === 'left' ? 'character-art__pressed-cheek' : undefined} style={{ '--cheek-offset': '4px' }}>
        <ellipse cx="61" cy="100" rx="16" ry="10" fill={fill('blush')} />
        <path d="m55 102 3-5m4 6 3-5" fill="none" stroke="#ed998c" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className={poke?.side === 'right' ? 'character-art__pressed-cheek' : undefined} style={{ '--cheek-offset': '-4px' }}>
        <ellipse cx="139" cy="100" rx="16" ry="10" fill={fill('blush')} />
        <path d="m134 102 3-5m4 6 3-5" fill="none" stroke="#ed998c" strokeWidth="2" strokeLinecap="round" />
      </g>
      <CharacterPart kind="eyebrows" style={eyebrows} />
      <CharacterPart kind="eyes" style={eyeStyle} winkSide={poke?.side} />
      <CharacterPart kind="nose" style={nose} />
      <CharacterPart kind="mouth" style={poke ? 'STYLE_2' : mouth} />
      <CharacterPart kind="accessory" style={accessory} cap={fill('cap')} band={fill('band')} />
      {poke && (
        <g key={poke.id} transform={poke.side === 'right' ? 'translate(200 0) scale(-1 1)' : undefined}>
          <g className="character-art__poke-finger">
            <path d="M-32 109c24-5 45-11 66-18 8-3 16-1 18 5 2 5-2 10-9 12-21 7-48 16-74 22Z"
              fill={fill('finger')} stroke="#d89578" strokeWidth=".8" />
            <path d="M37 94c5-2 10-1 11 3 1 4-3 6-8 8l-4-9Z" fill="#fff0e6" opacity=".85" />
          </g>
          <path className="character-art__poke-marks" d="m24 70 8 5m2-16 5 9m7-12 2 8"
            fill="none" stroke="#eab44e" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
