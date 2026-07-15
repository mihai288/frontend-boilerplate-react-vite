import './Button.css';
import { MouseEventHandler } from 'react';

interface ButtonProps {
  text?: string;
  label?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({ text, label, onClick, type = 'button' }: ButtonProps) {
  return (
    <button type={type} className="primary-button" onClick={onClick}>
      {label ?? text}
    </button>
  );
}
