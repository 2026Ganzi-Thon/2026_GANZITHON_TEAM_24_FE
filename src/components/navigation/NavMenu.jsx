import { NavLink } from 'react-router-dom';
import { menuItems } from './menuItems';

export default function NavMenu({ onNavigate }) {
  return (
    <nav className="nav-menu">
      <ul>
        {menuItems.map(({ label, path, symbol, icon: Icon }) => (
          <li key={label}>
            {!path ? <span className="nav-menu__link nav-menu__link--unavailable" aria-disabled="true">
              <span className="nav-menu__symbol" aria-hidden="true">{symbol}</span>{label}
            </span> : (
            <NavLink
              to={path}
              end={path === '/'}
              className={({ isActive }) => `nav-menu__link${isActive ? ' is-active' : ''}`}
              onClick={onNavigate}
            >
              {Icon && <Icon aria-hidden="true" />}
              {symbol && <span className="nav-menu__symbol" aria-hidden="true">{symbol}</span>}
              {label}
            </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
