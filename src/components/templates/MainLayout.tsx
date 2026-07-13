import { ReactNode } from 'react';
import Button from '../atoms/Button/Button';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const handleAddMeeting = () => {
    alert('Modal for New Meeting will appear here');
  };

  return (
    <div className="layout-container">
      <header className="layout-header">
        <nav className="layout-nav">
          <button className="nav-tab active">MEETING LIST</button>
          <button className="nav-tab">TO-DO LIST</button>
        </nav>

        <Button text="ADD MEETING" onClick={handleAddMeeting} />
      </header>

      <main className="layout-content">{children}</main>
    </div>
  );
}
