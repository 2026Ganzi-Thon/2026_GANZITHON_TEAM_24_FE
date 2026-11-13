import { NavLink } from 'react-router-dom';
import { menuItems } from './menuItems';

export default function NavMenu({ onNavigate }) {
  return (
    <nav className="nav-menu">
      <ul>
        {menuItems.map(({ label, path, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              end={path === '/'}
              className={({ isActive }) => `nav-menu__link${isActive ? ' is-active' : ''}`}
              onClick={onNavigate}
            >
              {Icon && <Icon aria-hidden="true" />}
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
