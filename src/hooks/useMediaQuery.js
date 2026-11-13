import { useEffect, useState } from 'react';

// 반응형 기준점 (styles/tokens.css 의 --bp-* 와 같은 값)
export const BREAKPOINTS = { tablet: 768, desktop: 1024 };

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// 768px 이상 (태블릿 이상)
export const useIsTablet = () => useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`);
// 1024px 이상 (데스크톱)
export const useIsDesktop = () => useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);
