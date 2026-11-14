import { useEffect } from 'react';
import NavMenu from './NavMenu';

export default function Drawer({ open, onClose, children }) {
  // ESC 로 닫기
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`drawer-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`drawer${open ? ' is-open' : ''}`} inert={!open}>
        <div className="drawer__header">
          <span className="drawer__title">메뉴</span>
          <button type="button" className="icon-button" onClick={onClose} aria-label="메뉴 닫기">
            ✕
          </button>
        </div>
        {children}
        <NavMenu onNavigate={onClose} />
      </aside>
    </>
  );
}
