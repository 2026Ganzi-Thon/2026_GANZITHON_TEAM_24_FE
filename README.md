# Toro FE

캐릭터에게 감정을 털어놓고 정리하는 감정 케어 모바일 웹 서비스의 프론트엔드.

## 실행

```bash
npm install
cp .env.example .env   # 서버 주소(VITE_API_BASE_URL), 기본값 http://localhost:8080
npm run dev            # http://localhost:5173
```

서버가 꺼져 있으면 가입·로그인·캐릭터가 동작하지 않는다. 하소연 흐름(`/vent`)은 가짜 응답이라 서버 없이 확인할 수 있다.

## 기술 스택

React + Vite, react-router-dom, axios, zustand

## 폴더 구조

```
src/
├─ routes/index.jsx        # 라우트 + 로그인 가드 (AUTH_GUARD_ENABLED)
├─ layouts/                # AppLayout(메뉴 있음), AuthLayout(메뉴 없음)
├─ components/             # 공통: navigation, ui(Button·Input·Modal), icons, background
├─ features/
│  ├─ auth/                # 시작·로그인·회원가입, 토큰 상태
│  ├─ character/           # 홈·꾸미기·놀이·내 정보, 캐릭터 그림·모션
│  └─ vent/                # 하소연 흐름의 상태·API·컴포넌트
├─ pages/vent/             # 하소연 흐름 화면과 라우트
├─ hooks/, lib/api.js      # 화면 크기 훅, axios 인스턴스(토큰 자동 첨부)
├─ styles/                 # tokens.css(색·간격·글자), global.css
└─ assets/                 # 이미지·아이콘
```

## 하소연 흐름

`/vent` → `/vent/emotions` → `/vent/calm` → `/vent/reaction` → `/vent/situation` → `/vent/plan` → `/vent/result` → `/vent/discard` → `/vent/done` (예외: `/vent/crisis`, `/vent/delete-failed`)

- 대화·정리 결과는 서버와 브라우저 저장소에 저장하지 않고 메모리(zustand)에만 둔다. 새로고침하면 사라진다.
- 서버 연결: 가입·로그인·내 정보·캐릭터는 연결됨. `/vent`, `/vent/result`는 가짜 응답(`features/vent/api.js`의 `USE_MOCK`), 음성 `/stt`는 미구현.

## 화면 추가하는 법

1. 화면 컴포넌트를 만든다
2. `routes/index.jsx`에 `<Route>`를 추가한다 (메뉴 있는 화면은 `AppLayout`, 없는 화면은 `AuthLayout` 그룹)
3. 사이드 메뉴에 보여야 하면 `components/navigation/menuItems.js`에 `{ label, path }`를 추가한다

공통 파일을 수정할 때는 다른 작업자와 먼저 이야기한다.

## 반응형

모바일 우선. 기본 스타일은 모바일 기준이고 `@media (min-width: 768px)`(태블릿), `(min-width: 1024px)`(데스크톱)로 넓은 화면을 덧붙인다. 여백(`--page-padding`)은 16 → 24 → 32px이며, JS에서는 `hooks/useMediaQuery.js`의 `useIsTablet()`, `useIsDesktop()`을 쓴다.

## 브랜치 규칙

- `main`: 항상 실행되는 상태 유지
- 작업 브랜치(`feat/...`, `fix/...`)를 만들고 PR로 `develop`에 합친다
