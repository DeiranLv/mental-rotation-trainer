import { NavLink } from 'react-router-dom';
import { t } from '../i18n/i18n';
import { getOrCreateUserId } from '../utils/storage';

export default function Navbar() {
  const userId = getOrCreateUserId();

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          {t('nav.home')}
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          {t('nav.dashboard')}
        </NavLink>
      </div>
      <span className="navbar-user-id" title="Your session ID">
        {t('nav.userId')}: <code>{userId}</code>
      </span>
    </nav>
  );
}
