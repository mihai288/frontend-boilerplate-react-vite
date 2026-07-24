import { NavLink, Outlet } from 'react-router-dom';
import './AuthLayout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel">
        <header className="auth-layout__brand">
          <div className="auth-layout__brand-copy" style={{ fontWeight: 'bold' }}>
            <p className="auth-layout__brand-name">AutoMinutes</p>
            <p className="auth-layout__brand-tagline">Meeting notes and to-dos organized</p>
          </div>
        </header>

        <nav className="auth-layout__tabs" aria-label="Authentication pages">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `auth-layout__tab${isActive ? ' auth-layout__tab--active' : ''}`
            }
          >
            Log in
          </NavLink>
          <NavLink
            to="/signup"
            className={({ isActive }) =>
              `auth-layout__tab${isActive ? ' auth-layout__tab--active' : ''}`
            }
          >
            Sign up
          </NavLink>
        </nav>

        <main className="auth-layout__card">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
