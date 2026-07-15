import { NavLink, Outlet } from 'react-router-dom';
import './AuthLayout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <header className="auth-header">
        <nav className="auth-nav" aria-label="Authentication pages">
          <NavLink to="/signup" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
            SIGN UP
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
            LOG IN
          </NavLink>
        </nav>
      </header>

      <main className="auth-content">
        <div className="auth-frame">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
