# Toro FE

감정 케어 모바일 웹 서비스의 프론트엔드.

## 실행

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL 입력
npm run dev
```

## 기술 스택

React + Vite, react-router-dom, axios, zustand

## 폴더 구조

```
src/
├─ main.jsx
├─ App.jsx
├─ routes/
│  └─ index.jsx                 # 라우트 정의 + 로그인 가드
├─ layouts/
│  ├─ AppLayout.jsx             # TopBar + Drawer + AppBackground + <Outlet/>
│  └─ AuthLayout.jsx            # 로그인/회원가입용 (메뉴 없음)
├─ components/
│  ├─ background/
│  │  └─ AppBackground.jsx
│  ├─ navigation/
│  │  ├─ TopBar.jsx             # 왼쪽(메뉴/뒤로가기) + 가운데 제목 + 오른쪽 슬롯
│  │  ├─ Drawer.jsx
│  │  ├─ NavMenu.jsx
│  │  └─ menuItems.js
│  └─ ui/                       # Button, Input, Modal
├─ features/
│  ├─ auth/useAuth.js           # 로그인 가드에 필요
│  └─ character/
│     ├─ store.js
│     └─ backgrounds.js
├─ hooks/useMediaQuery.js       # 모바일/넓은 화면 구분
├─ lib/api.js                   # axios 인스턴스
├─ styles/
│  ├─ tokens.css                # 색상, 간격, 폰트 변수
│  └─ global.css
└─ assets/backgrounds/
```

## 화면 추가하는 법

1. 화면 컴포넌트를 만든다 (폴더 위치는 각 파트에서 정함)
2. `routes/index.jsx`에서 메뉴 있는 화면은 `AppLayout` 그룹에, 메뉴 없는 화면은 `AuthLayout` 그룹에 `<Route>`를 추가한다
3. 사이드 메뉴에 보여야 하면 `components/navigation/menuItems.js`에 `{ label, path }`를 추가한다

로그인 가드는 `routes/index.jsx`의 `AUTH_GUARD_ENABLED`로 켜고 끈다. 지금은 `false`라서 로그인 없이 모든 화면에 들어갈 수 있다.

공통 파일을 수정할 때는 상대 파트와 먼저 이야기한다.

## 반응형

모바일 우선(mobile-first)으로 만든다.

| 구간 | 폭 | 여백(`--page-padding`) |
| --- | --- | --- |
| 모바일 | ~767px | 16px |
| 태블릿 | 768px~ | 24px |
| 데스크톱 | 1024px~ | 32px, 콘텐츠 최대 폭 1024px |

- CSS: 기본 스타일은 모바일 기준으로 쓰고, `@media (min-width: 768px)`과 `@media (min-width: 1024px)`로 넓은 화면을 덧붙인다
- JS: `hooks/useMediaQuery.js`의 `useIsTablet()`, `useIsDesktop()`
- 글자 크기 토큰은 `clamp()`라서 화면 폭에 따라 자동으로 조절된다

## 브랜치 규칙

- `main`: 항상 실행되는 상태 유지
- 작업 브랜치(`feat/...`)를 만들고 PR로 합친다
