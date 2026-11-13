// 공통 헤더: 왼쪽 버튼 / 가운데 제목 / 오른쪽 슬롯
// left: 'menu' | 'back' | null
export default function TopBar({ title, left = 'menu', onMenuClick, onBack, right = null }) {
  return (
    <header className="topbar">
      <div className="topbar__side">
        {left === 'menu' && (
          <button type="button" className="icon-button" onClick={onMenuClick} aria-label="메뉴 열기">
            ☰
          </button>
        )}
        {left === 'back' && (
          <button type="button" className="icon-button" onClick={onBack} aria-label="뒤로 가기">
            ←
          </button>
        )}
      </div>
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__side topbar__side--right">{right}</div>
    </header>
  );
}
