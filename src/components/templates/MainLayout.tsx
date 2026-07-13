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

  return (
    <div className="layout-container">
      <header className="layout-header">
        <nav className="layout-nav">
          <button className="nav-tab active">MEETING LIST</button>
          <button className="nav-tab">TO-DO LIST</button>
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
