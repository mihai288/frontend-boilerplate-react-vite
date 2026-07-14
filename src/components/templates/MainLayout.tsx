import { ReactNode } from 'react';
import { useMeetingStore } from '../../store/useMeetingStore';
import Button from '../atoms/Button/Button';
import NewMeetingDialog from '../organisms/NewMeetingDialog/NewMeetingDialog';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const openDialog = useMeetingStore((state) => state.openDialog);
  const activeTab = useMeetingStore((state) => state.activeTab);
  const setActiveTab = useMeetingStore((state) => state.setActiveTab);

  return (
    <div className="layout-container">
      <header className="layout-header">
        <nav className="layout-nav">
          <button
            className={`nav-tab ${activeTab === 'meetings' ? 'active' : ''}`}
            onClick={() => setActiveTab('meetings')}
          >
            MEETING LIST
          </button>

          <button
            className={`nav-tab ${activeTab === 'todos' ? 'active' : ''}`}
            onClick={() => setActiveTab('todos')}
          >
            TO-DO LIST
          </button>
        </nav>

        <Button text="ADD MEETING" onClick={openDialog} />
      </header>

      <main className="layout-content">
        <div className="content-frame">{children}</div>
      </main>

      <NewMeetingDialog />
    </div>
  );
}
