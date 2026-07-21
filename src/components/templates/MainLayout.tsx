import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../atoms/Button/Button';
import NewMeetingDialog from '../organisms/NewMeetingDialog/NewMeetingDialog';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const openDialog = useMeetingStore((state) => state.openDialog);
  const activeTab = useMeetingStore((state) => state.activeTab);
  const setActiveTab = useMeetingStore((state) => state.setActiveTab);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const initials =
    user?.name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U';

  const handleLogout = () => {
    clearSession();
    setIsProfileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout-container">
      <header className="layout-header">
        <div className="brand-group">
          <div className="brand-copy">
            <span className="brand-name">AutoMinutes</span>
            <span className="brand-tagline">Meeting notes - stay organized</span>
          </div>
        </div>

        <nav className="layout-nav" aria-label="Primary">
          <button
            className={`nav-tab ${activeTab === 'meetings' ? 'active' : ''}`}
            onClick={() => setActiveTab('meetings')}
          >
            Meetings
          </button>

          <button
            className={`nav-tab ${activeTab === 'todos' ? 'active' : ''}`}
            onClick={() => setActiveTab('todos')}
          >
            To-dos
          </button>

          <button
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </nav>

        <div className="header-actions">
          <Button text="ADD MEETING" onClick={openDialog} variant="success" />

          <div className="profile-wrapper">
            <button
              type="button"
              className="profile-button"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
              aria-expanded={isProfileMenuOpen}
            >
              <span className="profile-initials">{initials}</span>
            </button>

            {isProfileMenuOpen && user ? (
              <div className="profile-menu">
                <div className="profile-menu__header">
                  <p className="profile-menu__name">{user.name}</p>
                  <p className="profile-menu__email">{user.email}</p>
                </div>

                <button type="button" className="profile-menu__logout" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="layout-content">
        <div className="content-frame">{children}</div>
      </main>

      <NewMeetingDialog />
    </div>
  );
}
