import { ReactNode } from 'react';
import './AuthPages.css';

interface AuthFormShellProps {
  title: string;
  children: ReactNode;
}

export default function AuthFormShell({ title, children }: AuthFormShellProps) {
  return (
    <section className="auth-form">
      <div className="auth-form__header">
        <h2>{title}</h2>
      </div>

      {children}
    </section>
  );
}
