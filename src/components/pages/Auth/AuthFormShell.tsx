import { ReactNode } from 'react';
import './AuthPages.css';

interface AuthFormShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthFormShell({ title, subtitle, children }: AuthFormShellProps) {
  return (
    <section className="auth-form">
      <div className="auth-form__header">
        <h2>{title}</h2>
        {subtitle ? <p className="auth-form__subtitle">{subtitle}</p> : null}
      </div>

      {children}
    </section>
  );
}
