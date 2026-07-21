import './Button.css';
import { ButtonHTMLAttributes, MouseEventHandler } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  label?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'success' | 'danger';
}

export default function Button({
  text,
  label,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const buttonClassName = ['primary-button', variant, className].filter(Boolean).join(' ');

  return (
    <button type={type} className={buttonClassName} onClick={onClick} {...props}>
      {label ?? text}
    </button>
  );
}
