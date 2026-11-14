// 하소연 흐름에서 쓰는 아이콘. TODO: 최종 아이콘은 Figma에서 내려받아 교체
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function ExitIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
      <path d="M16 8l4 4-4 4" />
      <path d="M20 12H9" />
    </svg>
  );
}

export function MicWaveIcon(props) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <path d="M3 10v4M7.5 7v10M12 4v16M16.5 8v8M21 11v2" />
    </svg>
  );
}

export function StopIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SendIcon(props) {
  return (
    <svg {...base} fill="currentColor" strokeWidth={1.5} {...props}>
      <path d="M21 3 3 10.5l7 2.5 2.5 7L21 3z" />
    </svg>
  );
}
